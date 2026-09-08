import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { listarMaquinas } from '../services/maquinas';
import { STATUS_COLORS } from '../utils/status';
import { formatarHorimetro } from '../utils/validadores';


export default function ListaMaquinas() {
  const { empresa } = useAuth();
  const [searchParams] = useSearchParams();
  const filtroStatus = searchParams.get('status');
  const [maquinas, setMaquinas] = useState([]);

  useEffect(() => {
    async function carregar() {
      if (!empresa) return;
      let m = await listarMaquinas(empresa.id);
      if (filtroStatus) {
        m = m.filter((maq) => maq.status_calculado === filtroStatus);
      }
      setMaquinas(m);
    }
    carregar();
  }, [empresa, filtroStatus]);

  return (
    <div className="page">
      <header className="header">
        <Link to="/" className="btn btn-sm btn-secondary">← Voltar</Link>
        <h1>Máquinas</h1>
        <Link to="/maquina/nova" className="btn btn-sm">+ Nova</Link>
      </header>

      {maquinas.length === 0 ? (
        <div className="vazio">
          <p>Nenhuma máquina cadastrada</p>
          <Link to="/maquina/nova" className="btn">
            Cadastrar primeira máquina
          </Link>
        </div>
      ) : (
        <div className="card-list">
          {maquinas.map((m) => (
            <Link key={m.id} to={`/maquina/${m.id}`} className="maquina-card" style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
              {m.foto_url ? (
                <img
                  src={m.foto_url}
                  alt={m.apelido}
                  style={{
                    width: 72,
                    height: 72,
                    objectFit: 'cover',
                    borderRadius: 8,
                    flexShrink: 0,
                    border: '1px solid var(--borda)',
                  }}
                />
              ) : (
                <div
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: 8,
                    background: '#f1f5f9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 28,
                    flexShrink: 0,
                    border: '1px solid var(--borda)',
                  }}
                >
                  {m.tipo?.toLowerCase().includes('caminh') ? '🚛' : m.tipo?.toLowerCase().includes('pulveriz') ? '🚜' : '🚜'}
                </div>
              )}

              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="maquina-card-header" style={{ marginBottom: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span
                      className="status-dot"
                      style={{ backgroundColor: STATUS_COLORS[m.status_calculado] }}
                    />
                    <h3 style={{ margin: 0, fontSize: '1.05rem' }}>{m.apelido}</h3>
                  </div>

                  {m.status_operacional === 'em_manutencao' && (
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: '#fff',
                        background: '#dc2626',
                        padding: '2px 6px',
                        borderRadius: 4,
                        textTransform: 'uppercase',
                      }}
                    >
                      Em Manutenção
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted">{m.tipo} — {m.fabricante} {m.modelo}</p>
                <p className="horimetro" style={{ marginTop: 4 }}>{formatarHorimetro(m.horimetro_atual)}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
