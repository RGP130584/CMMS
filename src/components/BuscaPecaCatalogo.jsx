import { useState } from 'react';
import db from '../db/database';

/**
 * Componente de busca de peças no catálogo
 * Pode ser usado em InformarProblema e FazerRevisao
 */
export default function BuscaPecaCatalogo({ aoSelecionar }) {
  const [termo, setTermo] = useState('');
  const [resultados, setResultados] = useState([]);
  const [aberto, setAberto] = useState(false);

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
        p.sistema,
        ...(p.modelos || []),
      ].filter(Boolean).map((c) => c.toLowerCase());

      return campos.some((c) => c.includes(termoLower));
    }).slice(0, 10);

    setResultados(filtrados);
    setAberto(true);
  }

  function selecionar(peca) {
    aoSelecionar(peca);
    setAberto(false);
    setTermo('');
    setResultados([]);
  }

  return (
    <div className="card" style={{ marginBottom: 12, position: 'relative' }}>
      <label style={{ fontSize: '0.8rem', color: 'var(--cinza)' }}>Buscar peça no catálogo</label>
      <form onSubmit={buscar} style={{ display: 'flex', gap: 8 }}>
        <input
          type="search"
          placeholder="Código OEM ou descrição..."
          value={termo}
          onChange={(e) => setTermo(e.target.value)}
          style={{ flex: 1 }}
        />
        <button className="btn btn-sm" type="submit">Buscar</button>
      </form>

      {aberto && resultados.length > 0 && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          background: 'var(--branco)',
          border: '1px solid var(--borda)',
          borderRadius: 8,
          maxHeight: 250,
          overflow: 'auto',
          zIndex: 100,
        }}>
          {resultados.map((p) => (
            <button
              key={p.id}
              onClick={() => selecionar(p)}
              style={{
                display: 'block',
                width: '100%',
                padding: '8px 12px',
                textAlign: 'left',
                background: 'none',
                border: 'none',
                borderBottom: '1px solid var(--borda)',
                cursor: 'pointer',
              }}
            >
              <span style={{ fontFamily: 'monospace', color: 'var(--verde)', fontSize: '0.85rem' }}>
                {p.codigo_oem}
              </span>
              <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--cinza)' }}>
                {p.descricao}
              </span>
              {p.grupo && (
                <span style={{ fontSize: '0.7rem', color: 'var(--cinza)' }}>
                  {p.grupo}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {aberto && resultados.length === 0 && termo && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          background: 'var(--branco)',
          border: '1px solid var(--borda)',
          borderRadius: 8,
          padding: 12,
          zIndex: 100,
        }}>
          <p className="text-sm text-muted">Nenhuma peça encontrada</p>
        </div>
      )}
    </div>
  );
}
