export const STATUS = {
  VERDE: 'verde',
  AMARELO: 'amarelo',
  VERMELHO: 'vermelho',
  AZUL: 'azul',
};

export const STATUS_LABELS = {
  [STATUS.VERDE]: 'Em dia',
  [STATUS.AMARELO]: 'Próximo',
  [STATUS.VERMELHO]: 'Atrasado',
  [STATUS.AZUL]: 'Em manutenção',
};

export const STATUS_COLORS = {
  [STATUS.VERDE]: '#2E7D32',
  [STATUS.AMARELO]: '#F9A825',
  [STATUS.VERMELHO]: '#C62828',
  [STATUS.AZUL]: '#1565C0',
};

export function calcularStatus(maquina, planos, problemas, revisoes, limiteAmarelo = 100) {
  const problemaCritico = problemas?.find(
    (p) => p.status !== 'resolvido' && p.tipo === 'parou'
  );
  if (problemaCritico) return STATUS.VERMELHO;

  const emManutencao = revisoes?.some((r) => r.status === 'em_execucao') ||
    problemas?.some((p) => p.status === 'em_atendimento');
  if (emManutencao) return STATUS.AZUL;

  const planoAtivo = planos?.find((p) => p.ativo);
  if (!planoAtivo) return STATUS.VERDE;

  const faltam = planoAtivo.proximoHorimetro
    ? planoAtivo.proximoHorimetro - maquina.horimetro_atual
    : Infinity;

  if (faltam <= 0) return STATUS.VERMELHO;
  if (faltam <= limiteAmarelo) return STATUS.AMARELO;
  return STATUS.VERDE;
}
