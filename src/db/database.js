import Dexie from 'dexie';

const db = new Dexie('CMMS_Agricola');

db.version(1).stores({
  empresa: '++id, documento',
  usuario: '++id, email, empresa_id, perfil',
  maquina: '++id, empresa_id, status_calculado',
  registroHorimetro: '++id, maquina_id, usuario_id, data_hora',
  planoManutencao: '++id, maquina_id',
  itemPlano: '++id, plano_id',
  peca: '++id, empresa_id',
  pecaPlano: '++id, plano_id, peca_id',
  revisao: '++id, maquina_id, plano_id, status',
  problema: '++id, maquina_id, status',
  manutencaoCorretiva: '++id, problema_id, maquina_id',
  historicoEvento: '++id, maquina_id, tipo, data_hora',
  alerta: '++id, maquina_id, destinatario_usuario_id, lido',
  filaSincronizacao: '++id_local, tipo_acao, status',
});

db.version(2).stores({
  fabricante: '++id, nome, pais',
  fonteCatalogo: '++id, fabricante_id, status',
  catalogoArquivo: '++id, fonte_id, hash, status',
  catalogoPeca: '++id, catalogo_arquivo_id, codigo_oem, modelo, status, revisado',
  catalogoDiagrama: '++id, catalogo_arquivo_id, numero_diagrama',
  catalogoAplicacao: '++id, catalogo_peca_id, modelo',
  catalogoSubstituicao: '++id, catalogo_peca_id, codigo_anterior',
});

export default db;

