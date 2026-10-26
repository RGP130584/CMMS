import db from '../db/database';
import { enqueue } from './sync';
import { recalcularStatus } from './maquinas';

export async function listarOperadores(empresaId) {
  return db.operador.where('empresa_id').equals(empresaId).toArray();
}

export async function salvarOperador(dados) {
  if (!dados.empresa_id) throw new Error('Empresa não identificada.');
  if (!dados.nome?.trim()) throw new Error('Informe o nome do operador.');
  const maquinasIds = [...new Set((dados.maquinas_ids || []).map(Number))];
  const maquinas = maquinasIds.length ? await db.maquina.where('id').anyOf(maquinasIds).toArray() : [];
  if (maquinas.some((m) => m.empresa_id !== dados.empresa_id)) {
    throw new Error('Selecione somente máquinas da empresa atual.');
  }

  const payload = {
    empresa_id: dados.empresa_id,
    nome: dados.nome.trim(),
    cpf: dados.cpf?.replace(/\D/g, '') || '',
    telefone: dados.telefone?.trim() || '',
    funcao: dados.funcao || 'Tratorista',
    possui_cnh: Boolean(dados.possui_cnh),
    categoria_cnh: dados.possui_cnh ? (dados.categoria_cnh || '') : '',
    validade_cnh: dados.possui_cnh ? (dados.validade_cnh || '') : '',
    observacoes: dados.observacoes?.trim() || '',
    maquinas_ids: maquinasIds,
    status: dados.status || 'ativo',
    atualizado_em: new Date().toISOString(),
  };

  if (dados.id) {
    const anterior = await db.operador.get(Number(dados.id));
    if (!anterior || anterior.empresa_id !== dados.empresa_id) throw new Error('Operador não encontrado.');
    await db.operador.update(Number(dados.id), payload);
    await enqueue('operador', { id: Number(dados.id), ...payload });
    return Number(dados.id);
  }
  payload.criado_em = new Date().toISOString();
  const id = await db.operador.add(payload);
  await enqueue('operador', { id, ...payload });
  return id;
}

export async function registrarOperacao(dados) {
  const operadorId = Number(dados.operador_id);
  const maquinaId = Number(dados.maquina_id);
  const inicial = Number(dados.horimetro_inicial);
  const final = Number(dados.horimetro_final);
  if (!dados.empresa_id) throw new Error('Empresa não identificada.');
  if (!operadorId || !maquinaId) throw new Error('Selecione operador e máquina.');
  if (!dados.data_operacao) throw new Error('Informe a data da operação.');
  if (!Number.isFinite(inicial) || !Number.isFinite(final) || inicial < 0 || final <= inicial) {
    throw new Error('O horímetro final deve ser maior que o inicial.');
  }

  const operador = await db.operador.get(operadorId);
  const maquina = await db.maquina.get(maquinaId);
  if (!operador || operador.empresa_id !== dados.empresa_id || operador.status !== 'ativo') {
    throw new Error('Operador inexistente ou inativo.');
  }
  if (!maquina || maquina.empresa_id !== dados.empresa_id) throw new Error('Máquina não encontrada na empresa atual.');
  if (!(operador.maquinas_ids || []).includes(maquinaId)) throw new Error('Esta máquina não está autorizada para o operador.');

  const registros = await db.registroOperacao.where('maquina_id').equals(maquinaId).toArray();
  const duplicado = registros.some((r) => inicial < Number(r.horimetro_final) && final > Number(r.horimetro_inicial));
  if (duplicado) throw new Error('Este intervalo de horímetro já foi lançado para a máquina. Verifique o histórico.');

  const horimetroAtual = Number(maquina.horimetro_atual || 0);
  if (inicial !== horimetroAtual) {
    throw new Error(`O horímetro inicial deve ser igual ao valor atual da máquina (${horimetroAtual}). Atualize a leitura antes de registrar a operação.`);
  }
  if (registros.some((r) => r.data_operacao === dados.data_operacao)) {
    throw new Error('Já existe uma operação registrada para esta máquina nesta data. Confira o histórico antes de lançar novamente.');
  }

  const agora = new Date().toISOString();
  const horasOperadas = Number((final - inicial).toFixed(2));
  const registro = {
    empresa_id: dados.empresa_id,
    operador_id: operadorId,
    maquina_id: maquinaId,
    data_operacao: dados.data_operacao,
    horimetro_inicial: inicial,
    horimetro_final: final,
    horas_operadas: horasOperadas,
    observacoes: dados.observacoes?.trim() || '',
    criado_em: agora,
    status_sincronizacao: 'pendente',
  };

  let id;
  await db.transaction('rw', db.registroOperacao, db.registroHorimetro, db.maquina, db.historicoEvento, db.filaSincronizacao, async () => {
    id = await db.registroOperacao.add(registro);
    await db.registroHorimetro.add({
      maquina_id: maquinaId,
      valor_anterior: Number(maquina.horimetro_atual || 0),
      valor_novo: final,
      usuario_id: null,
      data_hora: agora,
      origem: 'operacao',
      justificativa: `Operação registrada por ${operador.nome}; registro ${id}`,
      operador_id: operadorId,
      operacao_id: id,
    });
    await db.maquina.update(maquinaId, { horimetro_atual: final });
    await db.historicoEvento.add({
      maquina_id: maquinaId,
      tipo: 'atualizacao_horimetro',
      data_hora: agora,
      horimetro: final,
      resumo: `Operação: ${operador.nome} • +${horasOperadas}h`,
      referencia_id: id,
      operador_id: operadorId,
    });
    await enqueue('operacao', { id, ...registro });
  });
  await recalcularStatus(maquinaId);
  return { id, horas_operadas: horasOperadas };
}

export async function listarOperacoes(empresaId) {
  const [registros, operadores, maquinas] = await Promise.all([
    db.registroOperacao.where('empresa_id').equals(empresaId).toArray(),
    db.operador.where('empresa_id').equals(empresaId).toArray(),
    db.maquina.where('empresa_id').equals(empresaId).toArray(),
  ]);
  const operadorMap = new Map(operadores.map((o) => [o.id, o.nome]));
  const maquinaMap = new Map(maquinas.map((m) => [m.id, m.apelido]));
  return registros
    .map((r) => ({
      ...r,
      operador_nome: operadorMap.get(r.operador_id) || 'Operador removido',
      maquina_nome: maquinaMap.get(r.maquina_id) || 'Máquina removida',
    }))
    .sort((a, b) => b.data_operacao.localeCompare(a.data_operacao) || b.id - a.id);
}
