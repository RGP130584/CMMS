import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import db from '../../db/database';

export default function PublicarCatalogo() {
  const [aprovadas, setAprovadas] = useState([]);
  const [publicadas, setPublicadas] = useState([]);
  const [processando, setProcessando] = useState(false);

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    const a = await db.catalogoPeca.where('status').equals('aprovado').toArray();
    const p = await db.catalogoPeca.where('status').equals('publicado').toArray();
    setAprovadas(a);
    setPublicadas(p);
  }

  async function publicarTodas() {
    if (aprovadas.length === 0) return;
    setProcessando(true);
    const ids = aprovadas.map((p) => p.id);
    await db.catalogoPeca.where('id').anyOf(ids).modify({ status: 'publicado' });
    await carregar();
    setProcessando(false);
  }

  async function publicarPeca(id) {
    await db.catalogoPeca.update(id, { status: 'publicado' });
    await carregar();
  }

  async function despublicarPeca(id) {
    await db.catalogoPeca.update(id, { status: 'aprovado' });
    await carregar();
  }

  return (
    <div className="page">
      <header className="header">
        <Link to="/catalogos" className="btn btn-sm btn-secondary">← Voltar</Link>
        <h1>Publicar peças</h1>
        <span />
      </header>

      {aprovadas.length > 0 && (
        <button
          className="btn btn-lg"
          onClick={publicarTodas}
          disabled={processando}
          style={{ width: '100%', marginBottom: 16, background: 'var(--verde)' }}
        >
          {processando ? 'Publicando...' : `Publicar ${aprovadas.length} peça(s) aprovada(s)`}
        </button>
      )}

      <p className="text-sm text-muted" style={{ marginBottom: 8 }}>
        {aprovadas.length} peça(s) aprovada(s) pendente de publicação
      </p>

      {aprovadas.length > 0 && (
        <div className="card-list">
          {aprovadas.map((p) => (
            <div key={p.id} className="maquina-card" style={{ borderLeft: '3px solid var(--amarelo)' }}>
              <div className="maquina-card-header">
                <h3 style={{ fontFamily: 'monospace', color: 'var(--verde)' }}>{p.codigo_oem}</h3>
                <button className="btn btn-sm" onClick={() => publicarPeca(p.id)}>Publicar</button>
              </div>
              <p className="text-sm">{p.descricao}</p>
              {p.grupo && <p className="text-sm text-muted">Grupo: {p.grupo}</p>}
            </div>
          ))}
        </div>
      )}

      {publicadas.length > 0 && (
        <>
          <h2 style={{ marginTop: 24, marginBottom: 8 }}>Publicadas</h2>
          <p className="text-sm text-muted" style={{ marginBottom: 8 }}>
            {publicadas.length} peça(s) publicadas
          </p>
          <div className="card-list">
            {publicadas.map((p) => (
              <div key={p.id} className="maquina-card" style={{ borderLeft: '3px solid var(--verde)' }}>
                <div className="maquina-card-header">
                  <h3 style={{ fontFamily: 'monospace' }}>{p.codigo_oem}</h3>
                  <button className="btn btn-sm btn-secondary" onClick={() => despublicarPeca(p.id)}>Despublicar</button>
                </div>
                <p className="text-sm">{p.descricao}</p>
                {p.grupo && <p className="text-sm text-muted">Grupo: {p.grupo}</p>}
              </div>
            ))}
          </div>
        </>
      )}

      {aprovadas.length === 0 && publicadas.length === 0 && (
        <div className="empty-state">
          <p>Nenhuma peça disponível para publicação</p>
        </div>
      )}
    </div>
  );
}
