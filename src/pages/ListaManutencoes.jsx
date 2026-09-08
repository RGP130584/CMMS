import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { listarTodasManutencoes } from '../services/maquinas';

export default function ListaManutencoes() {
  const { empresa } = useAuth();
  const [manutencoes, setManutencoes] = useState([]);
  const [filtro, setFiltro] = useState('todas');
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregar() {
      if (!empresa) return;
      const lista = await listarTodasManutencoes(empresa.id);
      setManutencoes(lista);
      setCarregando(false);
    }
    carregar();
  }, [empresa]);

  const filtradas = manutencoes.filter((m) => {
    if (filtro === 'preventiva') return m.tipo_manutencao === 'preventiva';
    if (filtro === 'corretiva') return m.tipo_manutencao === 'corretiva';
    return true;
  });

  return (
    <div className="page">
      <header className="header">
        <Link to="/" className="btn btn-sm btn-secondary">← Início</Link>
        <h1>Manutenções</h1>
        <span />
      </header>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button
          className={`btn btn-sm ${filtro === 'todas' ? '' : 'btn-secondary'}`}
          onClick={() => setFiltro('todas')}
          style={{ flex: 1 }}
        >
          Todas ({manutencoes.length})
        </button>
        <button
          className={`btn btn-sm ${filtro === 'preventiva' ? '' : 'btn-secondary'}`}
          onClick={() => setFiltro('preventiva')}
          style={{ flex: 1 }}
        >
          🔧 Preventivas
        </button>
        <button
          className={`btn btn-sm ${filtro === 'corretiva' ? '' : 'btn-secondary'}`}
          onClick={() => setFiltro('corretiva')}
          style={{ flex: 1 }}
        >
          ⚠️ Corretivas
        </button>
      </div>

      {carregando ? (
        <p>Carregando manutenções...</p>
      ) : filtradas.length === 0 ? (
        <div className="vazio">
          <span style={{ fontSize: 48 }}>📋</span>
          <p>Nenhuma manutenção registrada nesta categoria.</p>
          <Link to="/maquinas" className="btn" style={{ marginTop: 12 }}>Ir para Máquinas</Link>
        </div>
      ) : (
        <div className="card-list">
          {filtradas.map((m, idx) => (
            <div
              key={m.id || idx}
              className="maquina-card"
              style={{
                borderLeft: `5px solid ${m.tipo_manutencao === 'preventiva' ? 'var(--verde)' : 'var(--azul)'}`,
              }}
            >
              <div className="maquina-card-header">
                <h3>{m.maquina_apelido}</h3>
                <span
                  style={{
                    fontSize: 12,
                    padding: '2px 8px',
                    borderRadius: 6,
                    background: m.tipo_manutencao === 'preventiva' ? '#E8F5E9' : '#E3F2FD',
                    color: m.tipo_manutencao === 'preventiva' ? 'var(--verde)' : 'var(--azul)',
                    fontWeight: 700,
                  }}
                >
                  {m.tipo_manutencao === 'preventiva' ? 'PREVENTIVA' : 'CORRETIVA'}
                </span>
              </div>

              <p className="text-sm" style={{ fontWeight: 500, margin: '4px 0' }}>
                {m.resumo}
              </p>

              {m.itens_executados && m.itens_executados.length > 0 && (
                <p className="text-sm text-muted">
                  Itens: {m.itens_executados.join(', ')}
                </p>
              )}

              {m.pecas_utilizadas && m.pecas_utilizadas.length > 0 && (
                <p className="text-sm text-muted">
                  Peças: {m.pecas_utilizadas.join(', ')}
                </p>
              )}

              {m.observacoes && (
                <p className="text-sm text-muted" style={{ fontStyle: 'italic', marginTop: 4 }}>
                  Obs: {m.observacoes}
                </p>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                <span className="text-sm text-muted">
                  {new Date(m.data).toLocaleDateString('pt-BR')}
                </span>
                <span className="text-sm" style={{ fontWeight: 700 }}>
                  {m.horimetro_realizado || m.horimetro_no_momento}h
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
