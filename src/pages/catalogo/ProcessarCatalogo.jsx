import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { obterArquivo, formatarTamanho } from '../../services/catalogo';
import { extrairTextoDoPDF } from '../../services/pdf';
import { processarArquivoCatalogo, listarPecasArquivo } from '../../services/extracao';

export default function ProcessarCatalogo() {
  const { arquivoId } = useParams();
  const [arquivo, setArquivo] = useState(null);
  const [processando, setProcessando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [erro, setErro] = useState('');

  useEffect(() => {
    carregar();
  }, [arquivoId]);

  async function carregar() {
    const a = await obterArquivo(Number(arquivoId));
    setArquivo(a);
    if (a.texto_extraido) {
      setResultado({ totalPaginas: a.total_paginas, paginas: a.texto_extraido });
    }
  }

  async function processar() {
    setProcessando(true);
    setErro('');
    setResultado(null);

    try {
      const paginas = await extrairTextoDoPDF(Number(arquivoId));
      const { totalPecas, totalRevisao } = await processarArquivoCatalogo(Number(arquivoId));
      const pecas = await listarPecasArquivo(Number(arquivoId));
      setResultado({ totalPaginas: paginas.length, paginas, totalPecas, totalRevisao, pecas });
      await carregar();
    } catch (err) {
      setErro(err.message);
    } finally {
      setProcessando(false);
    }
  }

  if (!arquivo) return <div className="page"><p>Carregando...</p></div>;

  const isPDF = arquivo.arquivo_tipo === 'application/pdf';

  return (
    <div className="page">
      <header className="header">
        <Link to={`/catalogo/fonte/${arquivo.fonte_id}`} className="btn btn-sm btn-secondary">← Voltar</Link>
        <h1>Processar catálogo</h1>
        <span />
      </header>

      <section className="info-grid">
        <div className="info-item">
          <span className="info-label">Arquivo</span>
          {arquivo.arquivo_nome}
        </div>
        <div className="info-item">
          <span className="info-label">Tamanho</span>
          {formatarTamanho(arquivo.arquivo_tamanho)}
        </div>
        <div className="info-item">
          <span className="info-label">Status</span>
          <span style={{ color: arquivo.status === 'texto_extraido' ? 'var(--verde)' : 'var(--amarelo)' }}>
            {arquivo.status}
          </span>
        </div>
        <div className="info-item">
          <span className="info-label">SHA-256</span>
          {arquivo.hash?.substring(0, 20)}...
        </div>
      </section>

      {!isPDF && (
        <p className="erro" style={{ marginTop: 12 }}>
          Processamento de texto só está disponível para arquivos PDF no momento.
        </p>
      )}

      {isPDF && !resultado && (
        <button
          className="btn btn-lg"
          onClick={processar}
          disabled={processando}
          style={{ marginTop: 16, width: '100%' }}
        >
          {processando ? 'Extraindo texto...' : 'Extrair texto do PDF'}
        </button>
      )}

      {erro && <p className="erro" style={{ marginTop: 12 }}>{erro}</p>}

      {resultado && (
        <>
          <div style={{ marginTop: 16, marginBottom: 8 }}>
            <p className="text-sm text-muted">
              {resultado.totalPaginas} página(s) processada(s)
              {resultado.totalPecas !== undefined && ` — ${resultado.totalPecas} peça(s) extraída(s)`}
              {resultado.totalRevisao > 0 && ` (${resultado.totalRevisao} para revisão)`}
            </p>
          </div>

          {resultado.pecas && resultado.pecas.length > 0 && (
            <>
              <h2 style={{ marginTop: 16, marginBottom: 8 }}>Peças extraídas</h2>
              <div className="card-list">
                {resultado.pecas.map((p) => (
                  <div key={p.id || p.codigo_oem} className="maquina-card">
                    <div className="maquina-card-header">
                      <h3 style={{ fontFamily: 'monospace', color: 'var(--verde)' }}>{p.codigo_oem}</h3>
                      <span className="status-badge" style={{
                        background: p.status === 'revisao_necessaria' ? 'var(--amarelo)' : 'var(--verde)'
                      }}>{p.status === 'revisao_necessaria' ? 'revisão' : p.status}</span>
                    </div>
                    <p className="text-sm">{p.descricao}</p>
                    {p.grupo && <p className="text-sm text-muted">Grupo: {p.grupo}</p>}
                    {p.secao && <p className="text-sm text-muted">Seção: {p.secao}</p>}
                    {p.erros?.length > 0 && (
                      <p className="text-sm" style={{ color: 'var(--amarelo)' }}>
                        {p.erros.join(', ')}
                      </p>
                    )}
                    {p.modelos?.length > 0 && (
                      <p className="text-sm text-muted">Modelos: {p.modelos.join(', ')}</p>
                    )}
                    <p className="text-sm text-muted" style={{ fontFamily: 'monospace' }}>
                      {p.referencia_pagina}
                      {p.versao_catalogo && ` • v${p.versao_catalogo}`}
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}

          <h2 style={{ marginTop: 24, marginBottom: 8 }}>Texto extraído</h2>
          {resultado.paginas.map((pagina) => (
            <details key={pagina.numero} className="maquina-card" style={{ marginTop: 8 }}>
              <summary style={{ cursor: 'pointer', fontWeight: 600 }}>
                Página {pagina.numero} — {pagina.linhas?.length || 0} linhas
              </summary>
              <pre style={{
                marginTop: 8,
                padding: 12,
                background: 'var(--bg)',
                borderRadius: 'var(--radius)',
                fontSize: 12,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                maxHeight: 300,
                overflow: 'auto',
              }}>
                {pagina.texto_completo}
              </pre>
            </details>
          ))}
        </>
      )}
    </div>
  );
}
