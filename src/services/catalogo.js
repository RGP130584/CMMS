import db from '../db/database';

export async function calcularHash(arrayBuffer) {
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function uploadArquivoCatalogo(fonteId, arquivo) {
  const arrayBuffer = await arquivo.arrayBuffer();
  const hash = await calcularHash(arrayBuffer);

  const existente = await db.catalogoArquivo.where('hash').equals(hash).first();
  if (existente) {
    throw new Error('Este arquivo já foi importado (hash duplicado)');
  }

  const existenteNaFonte = await db.catalogoArquivo
    .where('fonte_id')
    .equals(fonteId)
    .and((a) => a.arquivo_nome === arquivo.name)
    .first();

  const versao = existenteNaFonte ? (existenteNaFonte.versao || 0) + 1 : 1;

  const blob = new Blob([arrayBuffer], { type: arquivo.type });

  const id = await db.catalogoArquivo.add({
    fonte_id: fonteId,
    arquivo_nome: arquivo.name,
    arquivo_tipo: arquivo.type,
    arquivo_tamanho: arquivo.size,
    blob,
    hash,
    versao,
    data_download: new Date().toISOString(),
    status: 'pendente',
    erro_processamento: null,
    criado_em: new Date().toISOString(),
  });

  return id;
}

export async function downloadArquivoFonte(fonte) {
  if (!fonte.url) throw new Error('Fonte não possui URL configurada');

  const resposta = await fetch(fonte.url);
  if (!resposta.ok) throw new Error(`Falha no download: ${resposta.status}`);

  const blob = await resposta.blob();
  const arrayBuffer = await blob.arrayBuffer();
  const hash = await calcularHash(arrayBuffer);

  const existente = await db.catalogoArquivo.where('hash').equals(hash).first();
  if (existente) {
    throw new Error('Este arquivo já foi importado (hash duplicado)');
  }

  const existenteNaFonte = await db.catalogoArquivo
    .where('fonte_id')
    .equals(fonte.id)
    .and((a) => a.arquivo_nome === fonte.url.split('/').pop())
    .first();

  const versao = existenteNaFonte ? (existenteNaFonte.versao || 0) + 1 : 1;

  const id = await db.catalogoArquivo.add({
    fonte_id: fonte.id,
    arquivo_nome: fonte.url.split('/').pop() || 'arquivo',
    arquivo_tipo: blob.type,
    arquivo_tamanho: blob.size,
    blob,
    hash,
    versao,
    data_download: new Date().toISOString(),
    status: 'pendente',
    erro_processamento: null,
    criado_em: new Date().toISOString(),
  });

  await db.fonteCatalogo.update(fonte.id, { ultima_verificacao: new Date().toISOString() });

  return id;
}

export async function obterArquivo(id) {
  return db.catalogoArquivo.get(id);
}

export async function listarArquivosFonte(fonteId) {
  return db.catalogoArquivo.where('fonte_id').equals(fonteId).reverse().sortBy('criado_em');
}

export async function excluirArquivo(id) {
  await db.catalogoPeca.where('catalogo_arquivo_id').equals(id).delete();
  await db.catalogoDiagrama.where('catalogo_arquivo_id').equals(id).delete();
  await db.catalogoArquivo.delete(id);
}

export async function atualizarStatusArquivo(id, status, erro = null) {
  await db.catalogoArquivo.update(id, { status, erro_processamento: erro });
}

export function formatarTamanho(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
