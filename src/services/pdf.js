import * as pdfjsLib from 'pdfjs-dist';
import { obterArquivo, atualizarStatusArquivo } from './catalogo';
import db from '../db/database';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

export async function extrairTextoDoPDF(arquivoId) {
  const arquivo = await obterArquivo(arquivoId);
  if (!arquivo || !arquivo.blob) throw new Error('Arquivo não encontrado');

  await atualizarStatusArquivo(arquivoId, 'processando');

  try {
    const arrayBuffer = await arquivo.blob.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    const paginas = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      const pagina = await pdf.getPage(i);
      const conteudo = await pagina.getTextContent();

      const itens = conteudo.items.map((item) => ({
        texto: item.str,
        x: item.transform[4],
        y: item.transform[5],
        largura: item.width,
        altura: item.height,
        fonte: item.fontName,
      }));

      const linhas = agruparEmLinhas(itens);

      paginas.push({
        numero: i,
        largura: pagina.getViewport({ scale: 1 }).width,
        altura: pagina.getViewport({ scale: 1 }).height,
        texto_completo: linhas.map((l) => l.texto).join('\n'),
        linhas,
      });
    }

    await db.catalogoArquivo.update(arquivoId, {
      status: 'texto_extraido',
      texto_extraido: paginas,
      total_paginas: pdf.numPages,
    });

    return paginas;
  } catch (erro) {
    await atualizarStatusArquivo(arquivoId, 'erro', erro.message);
    throw erro;
  }
}

function agruparEmLinhas(itens) {
  if (itens.length === 0) return [];

  const itensOrdenados = [...itens].sort((a, b) => {
    const diffY = Math.abs(a.y - b.y);
    if (diffY < 3) return a.x - b.x;
    return b.y - a.y;
  });

  const linhas = [];
  let linhaAtual = { y: itensOrdenados[0].y, itens: [itensOrdenados[0]] };

  for (let i = 1; i < itensOrdenados.length; i++) {
    const item = itensOrdenados[i];
    const diffY = Math.abs(item.y - linhaAtual.y);

    if (diffY < 3) {
      linhaAtual.itens.push(item);
    } else {
      linhaAtual.itens.sort((a, b) => a.x - b.x);
      linhas.push({
        y: linhaAtual.y,
        texto: linhaAtual.itens.map((it) => it.texto).join(' '),
        x_inicio: Math.min(...linhaAtual.itens.map((it) => it.x)),
      });
      linhaAtual = { y: item.y, itens: [item] };
    }
  }

  linhaAtual.itens.sort((a, b) => a.x - b.x);
  linhas.push({
    y: linhaAtual.y,
    texto: linhaAtual.itens.map((it) => it.texto).join(' '),
    x_inicio: Math.min(...linhaAtual.itens.map((it) => it.x)),
  });

  return linhas;
}

export async function obterTextoPagina(arquivoId, numeroPagina) {
  const arquivo = await obterArquivo(arquivoId);
  if (!arquivo || !arquivo.texto_extraido) return null;

  const pagina = arquivo.texto_extraido.find((p) => p.numero === numeroPagina);
  return pagina || null;
}
