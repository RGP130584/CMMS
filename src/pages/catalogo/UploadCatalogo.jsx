import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import db from '../../db/database';
import { uploadArquivoCatalogo, excluirArquivo, formatarTamanho } from '../../services/catalogo';

export default function UploadCatalogo() {
  const { fonteId } = useParams();
  const inputRef = useRef();
  const [fonte, setFonte] = useState(null);
  const [arquivos, setArquivos] = useState([]);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  const carregar = useCallback(async () => {
    const f = await db.fonteCatalogo.get(Number(fonteId));
    setFonte(f);
    setArquivos(await db.catalogoArquivo.where('fonte_id').equals(Number(fonteId)).reverse().sortBy('criado_em'));
  }, [fonteId]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function handleUpload(e) {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setEnviando(true);
    setErro('');
    setSucesso('');

    let totalSucesso = 0;
    let totalFalhas = 0;

    for (const arquivo of files) {
      try {
        await uploadArquivoCatalogo(Number(fonteId), arquivo);
        totalSucesso++;
      } catch (err) {
        totalFalhas++;
        if (!err.message.includes('hash duplicado')) {
          setErro(err.message);
        }
      }
    }

    if (totalSucesso > 0 && totalFalhas === 0) {
      setSucesso(`${totalSucesso} arquivo(s) importado(s) com sucesso`);
    } else if (totalSucesso > 0 && totalFalhas > 0) {
      setErro(`${totalSucesso} importado(s), ${totalFalhas} falhou (arquivo duplicado ou inválido)`);
    } else {
      setErro('Nenhum arquivo pôde ser importado (provavelmente duplicado)');
    }

    if (inputRef.current) {
      inputRef.current.value = '';
    }
    setEnviando(false);
    await carregar();
  }

  async function handleExcluir(id) {
    if (!confirm('Excluir este arquivo e todos os dados extraídos dele?')) return;
    await excluirArquivo(id);
    await carregar();
  }

  return (
    <div className="page">
      <header className="header">
        <Link to={`/catalogo/fonte/${fonteId}`} className="btn btn-sm btn-secondary">← Voltar</Link>
        <h1>Importar catálogo</h1>
        <span />
      </header>

      {fonte && (
        <div className="info-grid" style={{ marginBottom: 16 }}>
          <div className="info-item">
            <span className="info-label">Fonte</span>
            {fonte.nome}
          </div>
          <div className="info-item">
            <span className="info-label">Tipo</span>
            {fonte.tipo}
          </div>
        </div>
      )}

      <div className="upload-area">
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,.png,.jpg,.jpeg,.tif,.tiff"
          onChange={handleUpload}
          style={{ display: 'none' }}
        />
        <button
          className="btn btn-lg btn-upload"
          onClick={() => inputRef.current.click()}
          disabled={enviando}
        >
          {enviando ? 'Enviando...' : 'Selecionar arquivos'}
        </button>
        <p className="text-sm text-muted" style={{ marginTop: 8 }}>
          PDF, PNG, JPG, TIF — {formatarTamanho(50 * 1024 * 1024)} máximo por arquivo
        </p>
      </div>

      {erro && <p className="erro" style={{ marginTop: 12 }}>{erro}</p>}
      {sucesso && <p className="sucesso" style={{ marginTop: 12 }}>{sucesso}</p>}

      {arquivos.length > 0 && (
        <>
          <h2 style={{ marginTop: 24, marginBottom: 8 }}>Arquivos importados</h2>
          <div className="card-list">
            {arquivos.map((a) => (
              <div key={a.id} className="maquina-card">
                <div className="maquina-card-header">
                  <h3>{a.arquivo_nome}</h3>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {a.arquivo_tipo === 'application/pdf' && (
                      <Link to={`/catalogo/arquivo/${a.id}/processar`} className="btn btn-sm">Processar</Link>
                    )}
                    <button className="btn btn-sm btn-secondary" onClick={() => handleExcluir(a.id)}>✕</button>
                  </div>
                </div>
                <p className="text-sm text-muted">
                  Versão {a.versao} — {formatarTamanho(a.arquivo_tamanho)}
                </p>
                <p className="text-sm text-muted">
                  SHA-256: {a.hash?.substring(0, 16)}...
                </p>
                <p className="text-sm">
                  Status: <span style={{ color: a.status === 'pendente' ? 'var(--amarelo)' : a.status === 'publicado' ? 'var(--verde)' : 'var(--vermelho)' }}>
                    {a.status}
                  </span>
                </p>
                {a.erro_processamento && (
                  <p className="text-sm erro">{a.erro_processamento}</p>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
