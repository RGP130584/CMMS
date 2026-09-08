import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import db from '../../db/database';
import { extrairImagensDoPDF, deduplicarImagens, filtrarImagensGrandes } from '../../services/imagens';
import { formatarTamanho } from '../../services/catalogo';

export default function DiagramasCatalogo() {
  const [diagramas, setDiagramas] = useState([]);
  const [arquivos, setArquivos] = useState([]);
  const [arquivoSel, setArquivoSel] = useState('');
  const [processando, setProcessando] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  const carregar = useCallback(async () => {
    const d = await db.catalogoDiagrama.toArray();
    setDiagramas(d);
    const a = await db.catalogoArquivo.toArray();
    setArquivos(a);
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function extrairDiagramas() {
    if (!arquivoSel) return;
    setProcessando(true);
    setErro('');
    setSucesso('');

    try {
      const arquivo = await db.catalogoArquivo.get(Number(arquivoSel));
      if (!arquivo) {
        throw new Error('Arquivo não encontrado');
      }

      if (!arquivo.blob) {
        throw new Error('Arquivo não possui conteúdo binário (blob) disponível para extração');
      }

      const file = new File([arquivo.blob], arquivo.arquivo_nome || 'catalogo.pdf', { type: arquivo.arquivo_tipo || 'application/pdf' });
      let imagens = await extrairImagensDoPDF(file);
      imagens = deduplicarImagens(imagens);
      imagens = filtrarImagensGrandes(imagens);

      if (imagens.length === 0) {
        setErro('Nenhuma imagem compatível com diagrama foi encontrada neste PDF.');
      } else {
        for (const img of imagens) {
          await db.catalogoDiagrama.add({
            catalogo_arquivo_id: Number(arquivoSel),
            pagina: img.pagina,
            indice: img.indice,
            imagem: img.dataUrl,
            largura: img.largura,
            altura: img.altura,
            nome: img.nome || `Diagrama Pág ${img.pagina}`,
            grupo: null,
            numero: img.indice + 1,
          });
        }
        setSucesso(`${imagens.length} diagrama(s) extraído(s) com sucesso!`);
      }

      await carregar();
    } catch (e) {
      console.error('Erro ao extrair diagramas:', e);
      setErro(e.message || 'Erro ao processar diagramas do PDF');
    } finally {
      setProcessando(false);
    }
  }

  async function excluirDiagrama(id) {
    if (!confirm('Excluir este diagrama?')) return;
    await db.catalogoDiagrama.delete(id);
    await carregar();
  }

  return (
    <div className="page">
      <header className="header">
        <Link to="/catalogos" className="btn btn-sm btn-secondary">← Voltar</Link>
        <h1>Diagramas</h1>
        <span />
      </header>

      <div className="card" style={{ marginBottom: 16 }}>
        <label className="label">Extrair diagramas de um catálogo</label>
        <select className="input" value={arquivoSel} onChange={(e) => setArquivoSel(e.target.value)}>
          <option value="">Selecione o catálogo...</option>
          {arquivos.map((a) => (
            <option key={a.id} value={a.id}>{a.arquivo_nome} ({formatarTamanho(a.arquivo_tamanho)})</option>
          ))}
        </select>
        <button
          className="btn btn-lg"
          onClick={extrairDiagramas}
          disabled={!arquivoSel || processando}
          style={{ marginTop: 8, width: '100%' }}
        >
          {processando ? 'Extraindo imagens...' : 'Extrair diagramas'}
        </button>
        {erro && <p className="erro" style={{ marginTop: 8 }}>{erro}</p>}
        {sucesso && <p className="sucesso" style={{ marginTop: 8 }}>{sucesso}</p>}
      </div>

      <p className="text-sm text-muted" style={{ marginBottom: 8 }}>
        {diagramas.length} diagrama(s) armazenado(s)
      </p>

      <div className="card-list">
        {diagramas.map((d) => (
          <div key={d.id} className="maquina-card">
            <div className="maquina-card-header">
              <div>
                <h3 style={{ fontSize: '1rem', color: 'var(--verde)' }}>
                  {d.nome || `Diagrama Técnico #${d.numero || d.indice + 1}`}
                </h3>
                <p className="text-sm text-muted">Página {d.pagina} • Diagrama {d.numero || d.indice + 1}</p>
              </div>
              <button className="btn btn-sm btn-secondary" onClick={() => excluirDiagrama(d.id)}>Excluir</button>
            </div>
            {d.imagem && (
              <img
                src={d.imagem}
                alt={`Diagrama pág. ${d.pagina}`}
                style={{ width: '100%', maxHeight: 300, objectFit: 'contain', borderRadius: 8, marginTop: 8 }}
              />
            )}
          </div>
        ))}
      </div>

      {diagramas.length === 0 && (
        <div className="empty-state">
          <p>Nenhum diagrama extraído ainda</p>
        </div>
      )}
    </div>
  );
}
