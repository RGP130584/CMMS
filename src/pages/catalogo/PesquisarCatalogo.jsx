import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import db from '../../db/database';

export default function PesquisarCatalogo() {
  const [termo, setTermo] = useState('');
  const [resultados, setResultados] = useState([]);
  const [total, setTotal] = useState(0);
  const [carregado, setCarregado] = useState(false);

  useEffect(() => {
    contar();
  }, []);

  async function contar() {
    const t = await db.catalogoPeca.where('status').equals('publicado').count();
    setTotal(t);
    setCarregado(true);
  }

  async function buscar(e) {
    e.preventDefault();
    if (!termo.trim()) {
      setResultados([]);
      return;
    }

    const termoLower = termo.toLowerCase();
    const publicadas = await db.catalogoPeca.where('status').equals('publicado').toArray();

    const filtrados = publicadas.filter((p) => {
      const campos = [
        p.codigo_oem,
        p.descricao,
        p.grupo,
        ...(p.modelos || []),
        p.texto_original,
      ].filter(Boolean).map((c) => c.toLowerCase());

      return campos.some((c) => c.includes(termoLower));
    });

    setResultados(filtrados);
  }

  return (
    <div className="page">
      <header className="header">
        <Link to="/catalogos" className="btn btn-sm btn-secondary">← Voltar</Link>
        <h1>Pesquisar peças</h1>
        <span />
      </header>

      {carregado && (
        <p className="text-sm text-muted" style={{ marginBottom: 12 }}>
          {total} peça(s) publicada(s) no catálogo
        </p>
      )}

      <form onSubmit={buscar} style={{ marginBottom: 16 }}>
        <input
          type="search"
          placeholder="Buscar por código OEM, descrição, grupo ou modelo..."
          value={termo}
          onChange={(e) => setTermo(e.target.value)}
          autoFocus
        />
        <button className="btn btn-lg" type="submit" style={{ width: '100%', marginTop: 8 }}>
          Pesquisar
        </button>
      </form>

      {termo && resultados.length === 0 && (
        <div className="empty-state">
          <p>Nenhuma peça encontrada para "{termo}"</p>
        </div>
      )}

      {resultados.length > 0 && (
        <p className="text-sm text-muted" style={{ marginBottom: 8 }}>
          {resultados.length} resultado(s)
        </p>
      )}

      <div className="card-list">
        {resultados.map((p) => (
          <div key={p.id} className="maquina-card">
            <div className="maquina-card-header">
              <h3 style={{ fontFamily: 'monospace', color: 'var(--verde)' }}>{p.codigo_oem}</h3>
              {p.grupo && (
                <span className="status-badge" style={{ background: 'var(--cinza)' }}>
                  {p.grupo}
                </span>
              )}
            </div>
            <p className="text-sm">{p.descricao}</p>
            {p.modelos?.length > 0 && (
              <p className="text-sm text-muted">Aplicação: {p.modelos.join(', ')}</p>
            )}
            {p.referencia_pagina && (
              <p className="text-sm text-muted" style={{ fontFamily: 'monospace', marginTop: 4 }}>
                Origem: {p.referencia_pagina}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
