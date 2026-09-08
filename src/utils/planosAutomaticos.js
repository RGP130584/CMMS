import db from '../db/database';
import { recalcularStatus } from '../services/maquinas';

export const TEMPLATES_MANUTENCAO = {
  trator: {
    nome: 'Plano de Manutenção Escalonado - Trator Agrícola',
    intervalo_base: 250,
    niveis: [
      {
        horas: 250,
        rotulo: 'Revisão 250h (Motor & Lubrificação Básica)',
        itens: [
          'Drenar e substituir o óleo do motor (15W-40)',
          'Substituir o elemento do filtro de óleo lubrificante',
          'Substituir o filtro de combustível primário com separador de água',
          'Drenar sedimentos e água do tanque de combustível',
          'Engraxar pinos do eixo dianteiro, cruzetas da tração e braços do engate de 3 pontos',
          'Inspecionar nível do líquido de arrefecimento do radiador',
          'Verificar tensão e estado das correias do alternador/ventilador',
          'Checar pressão e calibragem dos pneus dianteiros e traseiros',
        ],
      },
      {
        horas: 500,
        rotulo: 'Revisão 500h (Filtros Gerais & Admissão)',
        itens: [
          'Todos os itens da revisão de 250 horas',
          'Substituir o elemento filtrante de ar primário e secundário de segurança',
          'Substituir o filtro de combustível secundário / final',
          'Substituir o filtro de ar condicionado / recirculação da cabine',
          'Checar e completar o nível de óleo dos cubos de redução dianteiros e diferencial',
          'Verificar o curso livre e ajuste dos pedais de freio e embreagem',
          'Inspecionar terminais de direção e folgas de articulação',
          'Limpar as aletas do radiador e intercooler com ar comprimido',
        ],
      },
      {
        horas: 1000,
        rotulo: 'Revisão 1000h (Geral / Hidráulica e Transmissão)',
        itens: [
          'Todos os itens das revisões de 250h e 500h',
          'Substituir totalmente o óleo hidráulico e da transmissão',
          'Substituir os filtros de sucção e pressão do sistema hidráulico/TDP',
          'Drenar e renovar o fluido do radiador (aditivo anticongelante/anticorrosivo)',
          'Substituir o óleo do eixo dianteiro 4x4 e cubos das rodas',
          'Verificar e regular a folga das válvulas do motor (admissão/escape)',
          'Inspecionar e reapertar os parafusos das rodas e contra-pesos',
          'Testar alternador, motor de partida e densidade da bateria',
        ],
      },
    ],
  },
  colhedora: {
    nome: 'Plano de Manutenção Escalonado - Colheitadeira de Grãos',
    intervalo_base: 250,
    niveis: [
      {
        horas: 250,
        rotulo: 'Revisão 250h (Motor & Lubrificação do Rotor)',
        itens: [
          'Substituir óleo do motor e filtro de óleo',
          'Substituir filtros de combustível (primário e secundário)',
          'Engraxe completo de rolamentos do rotor, elevadores de grãos e picador',
          'Inspecionar tensão das correias de acionamento do rotor e sapatas',
          'Verificar folga e desgaste das navalhas da barra de corte/plataforma',
        ],
      },
      {
        horas: 500,
        rotulo: 'Revisão 500h (Trilha, Separação & Hidráulica)',
        itens: [
          'Todos os itens da revisão de 250 horas',
          'Substituir filtros de ar do motor e cabine de alta eficiência',
          'Substituir filtros do circuito hidráulico de acionamento',
          'Inspecionar e alinhar lâminas do picador de palha',
          'Checar nível de óleo das caixas de engrenagem do picador e sem-fins',
          'Inspecionar correntes dos elevadores de grãos limpos e retrilha',
        ],
      },
      {
        horas: 1000,
        rotulo: 'Revisão 1000h (Entressafra / Revisão Completa)',
        itens: [
          'Todos os itens de 250h e 500h',
          'Troca geral do fluido hidráulico e transmissão hidrostática',
          'Substituição do líquido de arrefecimento do motor',
          'Revisão completa das polias variadoras e rolamentos blindados',
          'Calibração dos sensores de perda de grãos e umidade',
        ],
      },
    ],
  },
  pulverizador: {
    nome: 'Plano de Manutenção Escalonado - Pulverizador Autopropelido',
    intervalo_base: 250,
    niveis: [
      {
        horas: 250,
        rotulo: 'Revisão 250h (Motor & Circuito de Pulverização)',
        itens: [
          'Troca de óleo do motor e filtro lubrificante',
          'Troca dos filtros de combustível',
          'Inspeção e limpeza dos filtros de linha e sucção da calda',
          'Engraxe do quadro central e braços das barras de pulverização',
          'Checar calibração e vazão dos bicos de pulverização',
        ],
      },
      {
        horas: 500,
        rotulo: 'Revisão 500h (Bomba, Barras & Cabine)',
        itens: [
          'Todos os itens da revisão de 250 horas',
          'Substituição dos filtros de ar do motor e filtro de carvão ativado da cabine',
          'Substituição do filtro de pressão da transmissão hidrostática',
          'Inspeção do diafragma e retentores da bomba centrífuga/pistão',
          'Verificação de amortecedores e bolsas pneumáticas da suspensão',
        ],
      },
      {
        horas: 1000,
        rotulo: 'Revisão 1000h (Revisão Geral Hidrostática)',
        itens: [
          'Todos os itens de 250h e 500h',
          'Troca completa do óleo da transmissão hidrostática e cubos de roda',
          'Troca do líquido de arrefecimento do motor',
        ],
      },
    ],
  },
  caminhao: {
    nome: 'Plano de Manutenção Escalonado - Caminhão / Frota Pesada',
    intervalo_base: 250,
    niveis: [
      {
        horas: 250,
        rotulo: 'Revisão 250h / 15.000 km (Motor, Freios & Engraxe)',
        itens: [
          'Drenar e substituir óleo lubrificante do motor diesel 15W-40 / 10W-40',
          'Substituir filtro de óleo lubrificante de fluxo total',
          'Substituir filtro de combustível primário com separador de água (Racord)',
          'Drenar reservatórios de ar comprimido dos freios',
          'Engraxar cruzetas, luva corrediça do cardan e pinos de mola da suspensão',
          'Inspecionar espessura das lonas / pastilhas e tambores/discos de freio',
          'Verificar estado e tensão das correias de acessórios e alternador',
          'Checar nível de fluido de direção hidráulica e líquido de arrefecimento',
          'Calibrar e verificar desgaste dos pneus (dianteiros, tração e truck)',
        ],
      },
      {
        horas: 500,
        rotulo: 'Revisão 500h / 30.000 km (Filtros de Ar, APU & Suspensão)',
        itens: [
          'Todos os itens da revisão de 250 horas',
          'Substituir filtro secador do sistema pneumático de freio (Refil APU)',
          'Substituir elemento filtrante de ar do motor primário e secundário',
          'Substituir filtro de recirculação / ar condicionado da cabine',
          'Checar e completar nível de óleo da caixa de câmbio e diferencial',
          'Inspecionar folga de quinta roda, pino rei e engates da carreta',
          'Checar estado de buchas de tirante, barras estabilizadoras e amortecedores',
          'Reapertar porcas de roda e grampos de mola (torque conforme fabricante)',
        ],
      },
      {
        horas: 1000,
        rotulo: 'Revisão 1000h / 60.000 km (Geral / Transmissão & Injeção)',
        itens: [
          'Todos os itens das revisões de 250h e 500h',
          'Troca total do óleo da caixa de marchas / transmissão mecânica ou automatizada',
          'Troca total do óleo do diferencial / eixo traseiro',
          'Substituição do líquido de arrefecimento com aditivo orgânico de longa vida',
          'Verificar e regular folga de válvulas e unidades injetoras do motor',
          'Testar sensores do sistema ABS/EBS e válvula moduladora',
          'Checar alinhamento a laser de eixos e geometria dianteira',
          'Aferição e teste do tacógrafo digital e baterias',
        ],
      },
    ],
  },
};

/**
 * Gera e salva automaticamente o plano completo e escalonado para uma máquina
 */
export async function gerarPlanoAutomaticoCompleto(maquinaId, tipoMaquina = 'trator', horimetroAtual = 0) {
  const tipoStr = (tipoMaquina || '').toLowerCase();
  const tipoKey = tipoStr.includes('caminh') || tipoStr.includes('truck') || tipoStr.includes('cavalo') || tipoStr.includes('carreta')
    ? 'caminhao'
    : tipoStr.includes('colh')
    ? 'colhedora'
    : tipoStr.includes('pulveriz')
    ? 'pulverizador'
    : 'trator';

  const template = TEMPLATES_MANUTENCAO[tipoKey] || TEMPLATES_MANUTENCAO.trator;
  const intervaloBase = template.intervalo_base;

  // Próximo vencimento inicial: arredonda para o próximo múltiplo de 250h
  const proximoHorimetro = horimetroAtual > 0
    ? (Math.floor(horimetroAtual / intervaloBase) + 1) * intervaloBase
    : intervaloBase;

  // 1. Salvar o Plano de Manutenção Principal
  const planoId = await db.planoManutencao.add({
    maquina_id: maquinaId,
    nome: template.nome,
    intervalo_horas: intervaloBase,
    proximoHorimetro: proximoHorimetro,
    ativo: true,
    niveis_escalonados: template.niveis,
    criado_em: new Date().toISOString(),
  });

  // 2. Inserir todos os itens do checklist da revisão correspondente
  const nivelInicial = template.niveis[0]; // Itens da 250h
  for (const item of nivelInicial.itens) {
    await db.itemPlano.add({
      plano_id: planoId,
      descricao: item,
    });
  }

  await recalcularStatus(maquinaId);
  return planoId;
}
