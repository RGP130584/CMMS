/**
 * Utilitário para captura, redimensionamento e compressão de fotos no navegador
 * Otimizado para funcionamento offline no IndexedDB (PWA)
 */
export async function processarFoto(arquivoOuBlob, maxLargura = 1024, maxAltura = 1024, qualidade = 0.82) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;

        if (width > maxLargura || height > maxAltura) {
          if (width > height) {
            height = Math.round((height * maxLargura) / width);
            width = maxLargura;
          } else {
            width = Math.round((width * maxAltura) / height);
            height = maxAltura;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', qualidade);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('Erro ao carregar imagem'));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
    reader.readAsDataURL(arquivoOuBlob);
  });
}
