import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { listarProblemasAbertos, listarMaquinas } from '../services/maquinas';

const MAPA_TIPOS = {
  parou: { label: 'Parou', icone: '🛑', urgente: true },
  funcionando_com_problema: { label: 'Funcionando com problema', icone: '⚠️', urgente: false },
  vazamento: { label: 'Vazamento', icone: '💧', urgente: false },
  barulho: { label: 'Barulho estranho', icone: '🔊', urgente: false },
  esquentando: { label: 'Esquentando', icone: '🌡️', urgente: true },
  outro: { label: 'Outro', icone: '❓', urgente: false },
};

export default function ListaProblemas() {
  const { empresa } = useAuth();
  const [problemas, setProblemas] = useState([]);
  const [maquinas, setMaquinas] = useState({});
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregar() {
      if (!empresa) return;
      const probs = await listarProblemasAbertos(empresa.id);
      const maqs = await listarMaquinas(empresa.id);
      const mapa = Object.fromEntries(maqs.map((m) => [m.id, m]));
      setMaquinas(mapa);

      // Ordenar por criticidade ('parou' e 'esquentando' primeiro)
      const ordenados = probs.sort((a, b) => {
        const pesoA = a.tipo === 'parou' ? 2 : a.tipo === 'esquentando' ? 1 : 0;
        const pesoB = b.tipo === 'parou' ? 2 : b.tipo === 'esquentando' ? 1 : 0;
        return pesoB - pesoA;
      });

      setProblemas(ordenados);
      setCarregando(false);
    }
    carregar();
  }, [empresa]);

  return (
    <div className="page">
      <header className="header">
        <Link to="/" className="btn btn-sm btn-secondary">← Início</Link>
        <h1>Problemas Abertos</h1>
        <span />
      </header>

      <p className="text-muted" style={{ marginBottom: 16 }}>
        Chamados e manutenções corretivas pendentes de atendimento na propriedade.
      </p>

      {carregando ? (
        <p>Carregando problemas...</p>
      ) : problemas.length === 0 ? (
        <div className="vazio">
          <span style={{ fontSize: 48 }}>✅</span>
          <p>Nenhum problema aberto no momento!</p>
          <p className="text-sm text-muted">Todas as máquinas estão em operação normal.</p>
          <Link to="/" className="btn" style={{ marginTop: 12 }}>Voltar ao Início</Link>
        </div>
      ) : (
        <div className="card-list">
          {problemas.map((p) => {
            const maq = maquinas[p.maquina_id];
            const metaTipo = MAPA_TIPOS[p.tipo] || { label: p.tipo, icone: '⚠️', urgente: false };

            return (
              <div
                key={p.id}
                className="maquina-card"
                style={{
                  borderLeft: `5px solid ${metaTipo.urgente ? 'var(--vermelho)' : 'var(--amarelo)'}`,
                }}
              >
                <div className="maquina-card-header">
                  <div>
                    <span style={{ fontSize: 18, marginRight: 6 }}>{metaTipo.icone}</span>
                    <strong>{maq?.apelido || 'Máquina'}</strong>
                    <span className="text-sm text-muted" style={{ marginLeft: 8 }}>
                      • {maq?.modelo}
                    </span>
                  </div>
                  <span
                    className="status-badge"
                    style={{
                      background: p.status === 'em_atendimento' ? 'var(--azul)' : 'var(--vermelho)',
                      color: '#fff',
                      padding: '4px 8px',
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    {p.status === 'em_atendimento' ? 'Em Atendimento' : 'Aberto'}
                  </span>
                </div>

                <p className="text-sm" style={{ fontWeight: 600, marginTop: 4 }}>
                  Tipo: {metaTipo.label}
                </p>
                {p.descricao && <p className="text-sm" style={{ marginTop: 4 }}>"{p.descricao}"</p>}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                  <span className="text-sm text-muted">
                    {new Date(p.data_hora).toLocaleString('pt-BR')} • {p.horimetro_no_momento}h
                  </span>
                  <Link to={`/problema/${p.id}/atender`} className="btn btn-sm">
                    Atender Chamado →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
