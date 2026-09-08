import db from '../db/database';
import { salvarPlanoManutencao } from '../services/maquinas';

export async function carregarDadosDemonstracao(empresaId, usuarioId) {
  // Limpar dados anteriores se existirem
  const maqsAntigas = await db.maquina.where('empresa_id').equals(empresaId).toArray();
  const ids = maqsAntigas.map((m) => m.id);

  if (ids.length > 0) {
    await db.planoManutencao.where('maquina_id').anyOf(ids).delete();
    await db.revisao.where('maquina_id').anyOf(ids).delete();
    await db.problema.where('maquina_id').anyOf(ids).delete();
    await db.manutencaoCorretiva.where('maquina_id').anyOf(ids).delete();
    await db.historicoEvento.where('maquina_id').anyOf(ids).delete();
    await db.registroHorimetro.where('maquina_id').anyOf(ids).delete();
    await db.maquina.where('empresa_id').equals(empresaId).delete();
  }

  // 1. Cadastrar Máquinas
  const m1Id = await db.maquina.add({
    empresa_id: empresaId,
    apelido: 'Trator John Deere 6145J',
    tipo: 'Trator',
    fabricante: 'John Deere',
    modelo: '6145J',
    ano: 2022,
    numero_serie: '1BM6145JCK012345',
    horimetro_atual: 1480,
    foto_url: null,
    observacoes: 'Trator principal de plantio e preparo de solo.',
    status_calculado: 'verde',
    criado_em: new Date(Date.now() - 60 * 86400000).toISOString(),
  });

  const m2Id = await db.maquina.add({
    empresa_id: empresaId,
    apelido: 'Colheitadeira S770',
    tipo: 'Colhedora',
    fabricante: 'John Deere',
    modelo: 'S770',
    ano: 2021,
    numero_serie: '1BMS770JCK098765',
    horimetro_atual: 2240,
    foto_url: null,
    observacoes: 'Colheitadeira de grãos com plataforma draper 40 pés.',
    status_calculado: 'amarelo',
    criado_em: new Date(Date.now() - 50 * 86400000).toISOString(),
  });

  const m3Id = await db.maquina.add({
    empresa_id: empresaId,
    apelido: 'Pulverizador Patriot 350',
    tipo: 'Pulverizador',
    fabricante: 'Case IH',
    modelo: 'Patriot 350',
    ano: 2023,
    numero_serie: 'CASEPAT3509988',
    horimetro_atual: 890,
    foto_url: null,
    observacoes: 'Pulverizador autopropelido com barras de 36m.',
    status_calculado: 'vermelho',
    criado_em: new Date(Date.now() - 40 * 86400000).toISOString(),
  });

  const m4Id = await db.maquina.add({
    empresa_id: empresaId,
    apelido: 'Caminhão Scania R450 6x2 (Graneleiro)',
    tipo: 'Caminhão',
    fabricante: 'Scania',
    modelo: 'R450 Highline 6x2',
    ano: 2023,
    numero_serie: '9BS450R6X2202399',
    horimetro_atual: 124500, // 124.500 km
    foto_url: null,
    status_operacional: 'em_manutencao',
    observacoes: 'Caminhão bi-trem de transporte e escoamento de grãos. Parado na oficina para revisão de freios.',
    status_calculado: 'vermelho',
    criado_em: new Date(Date.now() - 30 * 86400000).toISOString(),
  });

  const m5Id = await db.maquina.add({
    empresa_id: empresaId,
    apelido: 'Trator Massey 4292',
    tipo: 'Trator',
    fabricante: 'Massey Ferguson',
    modelo: 'MF 4292',
    ano: 2019,
    numero_serie: 'MF4292BR776655',
    horimetro_atual: 3410,
    foto_url: null,
    status_operacional: 'operacional',
    observacoes: 'Trator de apoio, transporte e pulverização de pastagem.',
    status_calculado: 'azul',
    criado_em: new Date(Date.now() - 25 * 86400000).toISOString(),
  });

  // 2. Criar Planos de Manutenção Preventiva
  await salvarPlanoManutencao(
    m1Id,
    {
      nome: 'Revisão 250h (Motor & Filtros)',
      intervalo_horas: 250,
      proximoHorimetro: 1500, // faltam 20h -> VERDE
      ativo: true,
    },
    [
      { descricao: 'Trocar óleo do motor (15W40)' },
      { descricao: 'Trocar filtro de óleo lubrificante' },
      { descricao: 'Trocar filtro de combustível primário e secundário' },
      { descricao: 'Engraxar pinos do eixo dianteiro e articulações' },
    ]
  );

  await salvarPlanoManutencao(
    m2Id,
    {
      nome: 'Revisão 500h (Colheita & Hidráulica)',
      intervalo_horas: 500,
      proximoHorimetro: 2300, // faltam 60h -> AMARELO (próximo)
      ativo: true,
    },
    [
      { descricao: 'Trocar óleo do sistema hidráulico' },
      { descricao: 'Substituir filtros de ar do motor e cabine' },
      { descricao: 'Revisar folga e alinhamento dos picadores de palha' },
      { descricao: 'Verificar tensão das correias do rotor' },
    ]
  );

  await salvarPlanoManutencao(
    m3Id,
    {
      nome: 'Revisão 250h (Bomba & Circuito)',
      intervalo_horas: 250,
      proximoHorimetro: 850, // 850 vs atual 890 -> ATRASADO por 40h -> VERMELHO
      ativo: true,
    },
    [
      { descricao: 'Trocar óleo do motor' },
      { descricao: 'Limpar e calibrar bicos de pulverização' },
      { descricao: 'Trocar reparo da bomba de defensivos' },
    ]
  );

  await salvarPlanoManutencao(
    m4Id,
    {
      nome: 'Revisão 250h / 15.000 km (Motor, Freios & Engraxe)',
      intervalo_horas: 250,
      proximoHorimetro: 125000,
      ativo: true,
    },
    [
      { descricao: 'Trocar óleo do motor diesel 15W-40' },
      { descricao: 'Substituir filtros de combustível e filtro secador APU' },
      { descricao: 'Revisar espessura de lonas e tambores de freio' },
      { descricao: 'Engraxar juntas universais e cruzetas do cardan' },
    ]
  );

  await salvarPlanoManutencao(
    m5Id,
    {
      nome: 'Revisão Geral 500h',
      intervalo_horas: 500,
      proximoHorimetro: 3500,
      ativo: true,
    },
    [
      { descricao: 'Troca geral de fluídos e filtros' },
      { descricao: 'Revisão do sistema de freios e embreagem' },
    ]
  );

  // 3. Registrar Histórico de Revisões Anteriores Concluídas
  const r1 = await db.revisao.add({
    maquina_id: m1Id,
    plano_id: 1,
    horimetro_programado: 1250,
    horimetro_realizado: 1250,
    data_realizacao: new Date(Date.now() - 25 * 86400000).toISOString(),
    usuario_id: usuarioId,
    itens_executados: ['Troca de óleo', 'Troca de filtros', 'Engraxe geral'],
    pecas_utilizadas: ['Filtro Lubrificante RE504836', 'Óleo Plus-50 II 15W40 (20L)'],
    observacoes: 'Revisão executada conforme plano no galpão da oficina.',
    status: 'concluida',
  });

  await db.historicoEvento.add({
    maquina_id: m1Id,
    tipo: 'revisao',
    data_hora: new Date(Date.now() - 25 * 86400000).toISOString(),
    horimetro: 1250,
    resumo: 'Revisão 250h concluída com sucesso',
    referencia_id: r1,
  });

  // 4. Registrar Problema em Atendimento no Caminhão Scania (m4Id)
  const p1 = await db.problema.add({
    maquina_id: m4Id,
    tipo: 'freio',
    descricao: 'Chiado no freio do eixo traseiro e perda de pressão no circuito pneumático.',
    foto_url: null,
    horimetro_no_momento: 124500,
    usuario_reportou_id: usuarioId,
    data_hora: new Date(Date.now() - 2 * 86400000).toISOString(),
    status: 'em_atendimento',
    usuario_responsavel_id: usuarioId,
  });

  await db.historicoEvento.add({
    maquina_id: m4Id,
    tipo: 'problema',
    data_hora: new Date(Date.now() - 2 * 86400000).toISOString(),
    horimetro: 124500,
    resumo: 'Problema: Freio do eixo traseiro e circuito pneumático',
    referencia_id: p1,
  });

  // 5. Registrar Manutenção Corretiva Concluída no Trator JD 6145J
  const c1 = await db.manutencaoCorretiva.add({
    problema_id: null,
    maquina_id: m1Id,
    data_inicio: new Date(Date.now() - 10 * 86400000).toISOString(),
    data_conclusao: new Date(Date.now() - 10 * 86400000).toISOString(),
    usuario_id: usuarioId,
    servico_realizado: 'Substituição da correia do alternador e reaperto de mangueiras do radiador.',
    pecas_utilizadas: ['Correia Poly-V R502340', 'Abraçadeiras de aço 2 polegadas'],
    observacoes: 'Máquina testada em campo e liberada.',
    horimetro_no_momento: 1390,
  });

  await db.historicoEvento.add({
    maquina_id: m1Id,
    tipo: 'corretiva',
    data_hora: new Date(Date.now() - 10 * 86400000).toISOString(),
    horimetro: 1390,
    resumo: 'Corretiva concluída: Troca de correia do alternador',
    referencia_id: c1,
  });
}
