import db from '../db/database';

const PADROES_OEM = [
  /\b(\d{3}-\d{3}(?:-\d{3})?)\b/g,
  /\b([A-Z]{1,4}[-.]?\d{2,6}(?:[-.]?\d{1,4})?)\b/g,
  /\b(?:Part|Peça|Ref|Código|Cód|P\/N|PN|Item)\s*[:;]?\s*([A-Z0-9][-.\w]{2,20})\b/gi,
];

const PADROES_MODELO = [
  /\b(\d{3,4}[A-Z]{1,2}(?:[-/]?\d{1,4}[A-Z]{0,2})?)\b/g,
  /\b([A-Z]{2,4}[-.]?\d{2,4}(?:[-/]?\d{1,4})?)\b/g,
];

const PADROES_SECAO = [
  /\b(seção|secao|section|capítulo|capitulo)\s*[:.]?\s*(\w[\w\s]{0,30})/gi,
  /\b(parte|part)\s*[:.]?\s*(\w[\w\s]{0,30})/gi,
  /\b(grupo|group)\s*[:.]?\s*(\w[\w\s]{0,30})/gi,
];

const PADROES_GRUPO = [
  /\b(motor|engine)\b/gi,
  /\b(transmis|câmbio|cambio|transmiss)\b/gi,
  /\b(hidrául|hidraul|hydraul)\b/gi,
  /\b(elétr|eletric|electri)\b/gi,
  /\b(filt|filter)\b/gi,
  /\b(freio|brake)\b/gi,
  /\b(suspens|suspension)\b/gi,
  /\b(rol|bearing)\b/gi,
  /\b(correia|belt)\b/gi,
  /\b(junta|seal|vedação|vedacao)\b/gi,
  /\b(paraf|bolt|screw)\b/gi,
  /\b(arruela|washer)\b/gi,
  /\b(retentor|seal)\b/gi,
  /\b(embreagem|clutch)\b/gi,
  /\b(tanque|tank)\b/gi,
  /\b(radiador|radiator)\b/gi,
  /\b(painel|panel)\b/gi,
  /\b(cabine|cabin)\b/gi,
  /\b(chassi|chassis)\b/gi,
  /\b(esteira|track)\b/gi,
  /\b(pneu|tire|tyre)\b/gi,
  /\b(esteira|track)\b/gi,
  /\b(ara|plow)\b/gi,
  /\b(semeadora|seeder)\b/gi,
  /\b(colheitadeira|harvester)\b/gi,
  /\b(pulveriz|sprayer)\b/gi,
  /\b(adubador|spreader)\b/gi,
];

const GRUPO_MAP = {
  motor: 'Motor',
  engine: 'Motor',
  transmis: 'Transmissão',
  câmbio: 'Transmissão',
  cambio: 'Transmissão',
  transmiss: 'Transmissão',
  hidrául: 'Hidráulica',
  hidraul: 'Hidráulica',
  hydraul: 'Hidráulica',
  elétr: 'Elétrica',
  eletric: 'Elétrica',
  electri: 'Elétrica',
  filt: 'Filtro',
  filter: 'Filtro',
  freio: 'Freio',
  brake: 'Freio',
  suspens: 'Suspensão',
  suspension: 'Suspensão',
  rol: 'Rolamento',
  bearing: 'Rolamento',
  correia: 'Correia',
  belt: 'Correia',
  junta: 'Junta',
  seal: 'Retentor',
  vedação: 'Junta',
  vedacao: 'Junta',
  paraf: 'Parafuso',
  bolt: 'Parafuso',
  screw: 'Parafuso',
  arruela: 'Arruela',
  washer: 'Arruela',
  retentor: 'Retentor',
  embreagem: 'Embreagem',
  clutch: 'Embreagem',
  tanque: 'Tanque',
  tank: 'Tanque',
  radiador: 'Radiador',
  radiator: 'Radiador',
  painel: 'Painel',
  panel: 'Painel',
  cabine: 'Cabine',
  cabin: 'Cabine',
  chassi: 'Chassi',
  chassis: 'Chassi',
  esteira: 'Esteira',
  track: 'Esteira',
  pneu: 'Pneu',
  tire: 'Pneu',
  tyre: 'Pneu',
  ara: 'Arado',
  plow: 'Arado',
  semeadora: 'Semeadora',
  seeder: 'Semeadora',
  colheitadeira: 'Colheitadeira',
  harvester: 'Colheitadeira',
  pulveriz: 'Pulverizador',
  sprayer: 'Pulverizador',
  adubador: 'Adubador',
  spreader: 'Adubador',
};

export function extrairPecasDeTexto(texto, arquivoId, paginaNumero, pecasExistentes = []) {
  const pecas = [];
  const linhas = texto.split('\n').filter((l) => l.trim());

  for (let i = 0; i < linhas.length; i++) {
    const linha = linhas[i];
    const codesOEM = extrairComPadroes(linha, PADROES_OEM);

    if (codesOEM.length > 0) {
      const codigo = codesOEM[0];
      const modelos = extrairModelos(linha);
      const descricao = limparDescricao(linha);
      const grupo = detectarGrupo(linha);
      const secao = detectarSecao(linha);

      const erros = [];
      if (!codigo) erros.push('codigo_vazio');
      if (!descricao || descricao.length < 3) erros.push('descricao_curta');
      if (paginaNumero < 1) erros.push('pagina_invalida');
      if (modelos.length === 0) erros.push('sem_modelo');

      const duplicada = pecasExistentes.find(
        (e) => e.codigo_oem === codigo && e.pagina_numero === paginaNumero
      );
      if (duplicada) erros.push('duplicada');

      const status = erros.length > 0 ? 'revisao_necessaria' : 'extraido';

      const peca = {
        catalogo_arquivo_id: arquivoId,
        pagina_numero: paginaNumero,
        linha_numero: i + 1,
        codigo_oem: codigo,
        codigo_oem_todos: codesOEM,
        descricao,
        modelos,
        grupo,
        secao,
        referencia_pagina: `Página ${paginaNumero}, linha ${i + 1}`,
        texto_original: linha,
        status,
        erros,
        revisado: false,
        criado_em: new Date().toISOString(),
      };

      if (descricao && descricao.length > 2) {
        pecas.push(peca);
      }
    }
  }

  return pecas;
}

function extrairComPadroes(texto, padroes) {
  const resultados = new Set();

  for (const padrao of padroes) {
    const regex = new RegExp(padrao.source, padrao.flags);
    let match;
    while ((match = regex.exec(texto)) !== null) {
      if (match[1] && match[1].length >= 3) {
        resultados.add(match[1]);
      }
    }
  }

  return [...resultados];
}

function extrairModelos(texto) {
  const modelos = new Set();
  for (const padrao of PADROES_MODELO) {
    const regex = new RegExp(padrao.source, padrao.flags);
    let match;
    while ((match = regex.exec(texto)) !== null) {
      if (match[1] && match[1].length >= 4) {
        modelos.add(match[1]);
      }
    }
  }
  return [...modelos];
}

function detectarGrupo(texto) {
  const textoLower = texto.toLowerCase();
  for (const [chave, grupo] of Object.entries(GRUPO_MAP)) {
    if (textoLower.includes(chave)) {
      return grupo;
    }
  }
  return null;
}

function detectarSecao(texto) {
  for (const padrao of PADROES_SECAO) {
    const regex = new RegExp(padrao.source, padrao.flags);
    const match = regex.exec(texto);
    if (match && match[2]) {
      return match[2].trim();
    }
  }
  return null;
}

function limparDescricao(texto) {
  return texto
    .replace(/\b(\d{3}-\d{3}(?:-\d{3})?)\b/g, '')
    .replace(/\b(?:Part|Peça|Ref|Código|Cód|P\/N|PN|Item)\s*[:;]?\s*/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

export async function processarArquivoCatalogo(arquivoId) {
  const arquivo = await db.catalogoArquivo.get(arquivoId);
  if (!arquivo || !arquivo.texto_extraido) {
    throw new Error('Arquivo não possui texto extraído');
  }

  await db.catalogoArquivo.update(arquivoId, { status: 'extraindo' });

  let totalPecas = 0;
  let totalRevisao = 0;
  const pecasAcumuladas = [];

  for (const pagina of arquivo.texto_extraido) {
    const pecas = extrairPecasDeTexto(
      pagina.texto_completo,
      arquivoId,
      pagina.numero,
      pecasAcumuladas
    );

    for (const peca of pecas) {
      peca.versao_catalogo = arquivo.versao || 1;
      peca.data_extracao = new Date().toISOString();
      await db.catalogoPeca.add(peca);
      pecasAcumuladas.push(peca);
      totalPecas++;
      if (peca.status === 'revisao_necessaria') totalRevisao++;
    }
  }

  await db.catalogoArquivo.update(arquivoId, {
    status: 'extraido',
    total_pecas_extraidas: totalPecas,
    total_revisao: totalRevisao,
  });

  return { totalPecas, totalRevisao };
}

export async function listarPecasArquivo(arquivoId) {
  return db.catalogoPeca.where('catalogo_arquivo_id').equals(arquivoId).toArray();
}

export async function listarPecasRevisao() {
  const pecas = await db.catalogoPeca.toArray();
  return pecas.filter((p) => !p.revisado && p.status !== 'publicado' && p.status !== 'aprovado');
}

export async function atualizarPeca(id, dados) {
  await db.catalogoPeca.update(id, dados);
}

export async function revisarPeca(id, aprovado) {
  await db.catalogoPeca.update(id, {
    revisado: true,
    status: aprovado ? 'aprovado' : 'rejeitado',
  });
}

export async function excluirPecasArquivo(arquivoId) {
  await db.catalogoPeca.where('catalogo_arquivo_id').equals(arquivoId).delete();
}
