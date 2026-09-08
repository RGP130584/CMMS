import { enqueue } from './sync';
import db from '../db/database';
import { calcularStatus } from '../utils/status';

export async function atualizarHorimetro(maquinaId, valorNovo, usuarioId, justificativa = null) {
  const maquina = await db.maquina.get(maquinaId);
  if (!maquina) throw new Error('Máquina não encontrada');

  if (valorNovo < maquina.horimetro_atual && !justificativa) {
    throw new Error('Valor menor que o anterior requer justificativa administrativa');
  }

  const registro = {
    maquina_id: maquinaId,
    valor_anterior: maquina.horimetro_atual,
    valor_novo: valorNovo,
    usuario_id: usuarioId,
    data_hora: new Date().toISOString(),
    origem: justificativa ? 'correcao_admin' : 'normal',
    justificativa,
  };

  await db.registroHorimetro.add(registro);
  await db.maquina.update(maquinaId, { horimetro_atual: valorNovo });

  await db.historicoEvento.add({
    maquina_id: maquinaId,
    tipo: 'atualizacao_horimetro',
    data_hora: registro.data_hora,
    horimetro: valorNovo,
    resumo: `Horímetro atualizado: ${maquina.horimetro_atual}h → ${valorNovo}h`,
    referencia_id: null,
  });

  await recalcularStatus(maquinaId);
  await enqueue('horimetro', registro);

  return registro;
}

export async function recalcularStatus(maquinaId) {
  const maquina = await db.maquina.get(maquinaId);
  if (!maquina) return;

  const planos = await db.planoManutencao.where('maquina_id').equals(maquinaId).toArray();
  const problemas = await db.problema.where('maquina_id').equals(maquinaId).toArray();
  const revisoes = await db.revisao.where('maquina_id').equals(maquinaId).toArray();

  const status = calcularStatus(maquina, planos, problemas, revisoes);
  await db.maquina.update(maquinaId, { status_calculado: status });
}

export async function informarProblema(dados) {
  const problema = {
    ...dados,
    status: 'aberto',
    data_hora: new Date().toISOString(),
  };

  const id = await db.problema.add(problema);

  await db.historicoEvento.add({
    maquina_id: dados.maquina_id,
    tipo: 'problema',
    data_hora: problema.data_hora,
    horimetro: dados.horimetro_no_momento,
    resumo: `Problema: ${dados.descricao || dados.tipo}`,
    referencia_id: id,
  });

  await db.alerta.add({
    maquina_id: dados.maquina_id,
    tipo: 'problema_aberto',
    mensagem: `Problema reportado: ${dados.tipo}`,
    data_hora: problema.data_hora,
    lido: false,
    destinatario_usuario_id: null,
  });

  await recalcularStatus(dados.maquina_id);
  await enqueue('problema', problema);

  return id;
}

export async function registrarRevisao(dados) {
  const revisao = {
    ...dados,
    status: 'concluida',
    data_realizacao: new Date().toISOString(),
  };

  const id = await db.revisao.add(revisao);

  await db.historicoEvento.add({
    maquina_id: dados.maquina_id,
    tipo: 'revisao',
    data_hora: revisao.data_realizacao,
    horimetro: dados.horimetro_realizado,
    resumo: `Revisão concluída: ${dados.observacoes || ''}`,
    referencia_id: id,
  });

  const plano = await db.planoManutencao.get(dados.plano_id);
  if (plano) {
    await db.planoManutencao.update(plano.id, {
      proximoHorimetro: dados.horimetro_realizado + plano.intervalo_horas,
    });
  }

  await recalcularStatus(dados.maquina_id);
  await enqueue('revisao', revisao);

  return id;
}

export async function listarMaquinas(empresaId) {
  return db.maquina.where('empresa_id').equals(empresaId).toArray();
}

export async function listarProblemasAbertos(empresaId) {
  const maquinas = await listarMaquinas(empresaId);
  const ids = maquinas.map((m) => m.id);
  const problemas = await db.problema.where('maquina_id').anyOf(ids).toArray();
  return problemas.filter((p) => p.status !== 'resolvido');
}

export async function listarHistorico(maquinaId) {
  return db.historicoEvento
    .where('maquina_id')
    .equals(maquinaId)
    .reverse()
    .sortBy('data_hora');
}

export async function salvarPlanoManutencao(maquinaId, planoData, itens = []) {
  let planoId = planoData.id;
  const maquina = await db.maquina.get(maquinaId);

  const payloadPlano = {
    maquina_id: maquinaId,
    nome: planoData.nome,
    intervalo_horas: Number(planoData.intervalo_horas),
    proximoHorimetro: Number(planoData.proximoHorimetro) || (maquina?.horimetro_atual || 0) + Number(planoData.intervalo_horas),
    ativo: planoData.ativo !== undefined ? planoData.ativo : true,
    atualizado_em: new Date().toISOString(),
  };

  if (planoId) {
    await db.planoManutencao.update(planoId, payloadPlano);
    await db.itemPlano.where('plano_id').equals(planoId).delete();
  } else {
    payloadPlano.criado_em = new Date().toISOString();
    planoId = await db.planoManutencao.add(payloadPlano);
  }

  for (const item of itens) {
    if (item.descricao?.trim()) {
      await db.itemPlano.add({
        plano_id: planoId,
        descricao: item.descricao.trim(),
      });
    }
  }

  await recalcularStatus(maquinaId);
  return planoId;
}

export async function obterPlanoAtivo(maquinaId) {
  const plano = await db.planoManutencao
    .where('maquina_id')
    .equals(maquinaId)
    .and((p) => p.ativo)
    .first();

  if (!plano) return null;

  const itens = await db.itemPlano.where('plano_id').equals(plano.id).toArray();
  return { ...plano, itens };
}

export async function iniciarAtendimentoProblema(problemaId, usuarioId) {
  const prob = await db.problema.get(problemaId);
  if (!prob) throw new Error('Problema não encontrado');

  await db.problema.update(problemaId, {
    status: 'em_atendimento',
    usuario_responsavel_id: usuarioId,
  });

  await recalcularStatus(prob.maquina_id);
}

export async function concluirManutencaoCorretiva(dados) {
  const agora = new Date().toISOString();
  const id = await db.manutencaoCorretiva.add({
    problema_id: dados.problema_id,
    maquina_id: dados.maquina_id,
    data_inicio: dados.data_inicio || agora,
    data_conclusao: agora,
    usuario_id: dados.usuario_id,
    servico_realizado: dados.servico_realizado,
    pecas_utilizadas: dados.pecas_utilizadas || [],
    observacoes: dados.observacoes || '',
    horimetro_no_momento: dados.horimetro_no_momento,
  });

  if (dados.problema_id) {
    await db.problema.update(dados.problema_id, {
      status: 'resolvido',
      data_resolucao: agora,
    });
  }

  await db.historicoEvento.add({
    maquina_id: dados.maquina_id,
    tipo: 'corretiva',
    data_hora: agora,
    horimetro: dados.horimetro_no_momento,
    resumo: `Corretiva concluída: ${dados.servico_realizado}`,
    referencia_id: id,
  });

  await recalcularStatus(dados.maquina_id);
  await enqueue('manutencao_corretiva', dados);
  return id;
}

export async function listarTodasManutencoes(empresaId) {
  const maquinas = await listarMaquinas(empresaId);
  const ids = maquinas.map((m) => m.id);
  const revisoes = await db.revisao.where('maquina_id').anyOf(ids).toArray();
  const corretivas = await db.manutencaoCorretiva.where('maquina_id').anyOf(ids).toArray();

  const mapaMaquinas = Object.fromEntries(maquinas.map((m) => [m.id, m]));

  const lista = [
    ...revisoes.map((r) => ({
      ...r,
      tipo_manutencao: 'preventiva',
      maquina_apelido: mapaMaquinas[r.maquina_id]?.apelido || 'Máquina',
      data: r.data_realizacao,
      resumo: `Revisão Preventiva • ${r.pecas_utilizadas?.length || 0} peça(s)`,
    })),
    ...corretivas.map((c) => ({
      ...c,
      tipo_manutencao: 'corretiva',
      maquina_apelido: mapaMaquinas[c.maquina_id]?.apelido || 'Máquina',
      data: c.data_conclusao,
      resumo: `Corretiva: ${c.servico_realizado}`,
    })),
  ];

  return lista.sort((a, b) => new Date(b.data) - new Date(a.data));
}

export async function listarHistoricoGeral(empresaId) {
  const maquinas = await listarMaquinas(empresaId);
  const ids = maquinas.map((m) => m.id);
  const mapaMaquinas = Object.fromEntries(maquinas.map((m) => [m.id, m]));

  const eventos = await db.historicoEvento.where('maquina_id').anyOf(ids).toArray();
  return eventos
    .map((e) => ({
      ...e,
      maquina_apelido: mapaMaquinas[e.maquina_id]?.apelido || 'Máquina',
    }))
    .sort((a, b) => new Date(b.data_hora) - new Date(a.data_hora));
}

