import * as pdfjsLib from 'pdfjs-dist';

/**
 * Extrai imagens de um PDF e retorna como data URLs
 * @param {File} arquivo - Arquivo PDF
 * @returns {Promise<Array>} Array de objetos com pagina, indice, dataUrl, largura, altura
 */
export async function extrairImagensDoPDF(arquivo) {
  const arrayBuffer = await arquivo.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const imagens = [];

  for (let numPagina = 1; numPagina <= pdf.numPages; numPagina++) {
    const pagina = await pdf.getPage(numPagina);
    const ops = await pagina.getOperatorList();

    let imagemIndex = 0;

    for (let i = 0; i < ops.fnArray.length; i++) {
      const fn = ops.fnArray[i];

      if (fn === pdfjsLib.OPS.paintImageXObject || fn === pdfjsLib.OPS.paintJpegXObject) {
        try {
          const args = ops.argsArray[i];
          const nomeImagem = args[0];
          const objetoImagem = await pagina.objs.get(nomeImagem);

          if (objetoImagem && objetoImagem.bitmap) {
            const canvas = document.createElement('canvas');
            canvas.width = objetoImagem.bitmap.width;
            canvas.height = objetoImagem.bitmap.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(objetoImagem.bitmap, 0, 0);

            const dataUrl = canvas.toDataURL('image/png');

            imagens.push({
              pagina: numPagina,
              indice: imagemIndex,
              dataUrl,
              largura: objetoImagem.width,
              altura: objetoImagem.height,
              nome: nomeImagem,
            });

            imagemIndex++;
          }
        } catch (e) {
          // Imagem não extraível, ignorar
        }
      }
    }
  }

  return imagens;
}

/**
 * Remove duplicatas de imagens comparando data URLs
 */
export function deduplicarImagens(imagens) {
  const vistas = new Set();
  return imagens.filter((img) => {
    if (vistas.has(img.dataUrl)) return false;
    vistas.add(img.dataUrl);
    return true;
  });
}

/**
 * Filtra imagens muito pequenas (provavelmente ícones/ logos)
 */
export function filtrarImagensGrandes(imagens, larguraMin = 100, alturaMin = 100) {
  return imagens.filter((img) => img.largura >= larguraMin && img.altura >= alturaMin);
}
