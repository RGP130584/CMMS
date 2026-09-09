import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { listarMaquinas, listarProblemasAbertos } from '../services/maquinas';
import { STATUS_COLORS, STATUS_LABELS } from '../utils/status';
import { carregarDadosDemonstracao } from '../utils/seed';

export default function Dashboard() {
  const { empresa, usuario, logout } = useAuth();
  const [maquinas, setMaquinas] = useState([]);
  const [problemas, setProblemas] = useState([]);
  const [conexao, setConexao] = useState(navigator.onLine);
  const [carregandoSeed, setCarregandoSeed] = useState(false);

  async function carregar() {
    if (!empresa) return;
    const m = await listarMaquinas(empresa.id);
    setMaquinas(m);
    const p = await listarProblemasAbertos(empresa.id);
    setProblemas(p);
  }

  useEffect(() => {
    carregar();

    const handler = () => setConexao(navigator.onLine);
    window.addEventListener('online', handler);
    window.addEventListener('offline', handler);
    return () => {
      window.removeEventListener('online', handler);
      window.removeEventListener('offline', handler);
    };
  }, [empresa]);

  async function handleCarregarDemonstracao() {
    if (!confirm('Carregar dados de demonstração da fazenda (tratores, colheitadeira, planos de 250h/500h e revisões)?')) return;
    setCarregandoSeed(true);
    try {
      await carregarDadosDemonstracao(empresa.id, usuario.id);
      await carregar();
      alert('Dados de demonstração carregados com sucesso!');
    } catch (err) {
      alert('Erro ao carregar dados: ' + err.message);
    } finally {
      setCarregandoSeed(false);
    }
  }

  const contadores = {
    verde: maquinas.filter((m) => m.status_calculado === 'verde').length,
    amarelo: maquinas.filter((m) => m.status_calculado === 'amarelo').length,
    vermelho: maquinas.filter((m) => m.status_calculado === 'vermelho').length,
    azul: maquinas.filter((m) => m.status_calculado === 'azul').length,
  };

  const totalMaquinas = maquinas.length;
  const emManutencao = contadores.azul;
  const disponibilidade = totalMaquinas > 0 ? (((totalMaquinas - emManutencao) / totalMaquinas) * 100).toFixed(0) : 100;

  return (
    <div className="page dashboard">
      <header className="header">
        <div>
          <h1>{empresa?.nome_propriedade}</h1>
          <p className="text-sm text-muted">{usuario?.nome}</p>
        </div>
        <div className="header-right">
          <span className={`conexao ${conexao ? 'online' : 'offline'}`}>
            {conexao ? '● Online' : '○ Offline'}
          </span>
          <button className="btn btn-sm btn-secondary" onClick={logout}>
            Sair
          </button>
        </div>
      </header>

      {/* Indicador de Disponibilidade da Frota */}
      {totalMaquinas > 0 && (
        <div
          className="card"
          style={{
            marginBottom: 16,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)',
            color: '#fff',
          }}
        >
          <div>
            <span style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, opacity: 0.9 }}>
              Disponibilidade da Frota
            </span>
            <h2 style={{ fontSize: 28, margin: 0 }}>{disponibilidade}% Operacional</h2>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: 13, opacity: 0.9 }}>{totalMaquinas} máquinas</span>
            <br />
            <Link to="/relatorios" style={{ color: '#FFE082', fontSize: 13, fontWeight: 600 }}>
              Ver Indicadores →
            </Link>
          </div>
        </div>
      )}

      {/* Cards de Status */}
      <section className="status-cards">
        {Object.entries(contadores).map(([status, qtd]) => (
          <Link
            key={status}
            to={`/maquinas?status=${status}`}
            className="status-card"
            style={{ borderLeftColor: STATUS_COLORS[status] }}
          >
            <span className="status-numero">{qtd}</span>
            <span className="status-label">{STATUS_LABELS[status]}</span>
          </Link>
        ))}
      </section>

      {/* Alertas de Problemas */}
      {problemas.length > 0 && (
        <section className="alertas">
          <h2>Problemas abertos</h2>
          {problemas.map((p) => (
            <Link
              key={p.id}
              to={`/problema/${p.id}/atender`}
              className="alerta-item"
            >
              <span className="alerta-tipo">{p.tipo}</span>
              <span className="alerta-texto">
                {p.descricao || 'Sem descrição'}
              </span>
            </Link>
          ))}
        </section>
      )}

      {/* Menu Principal de Módulos */}
      <nav className="nav-grid">
        <Link to="/maquinas" className="nav-btn">
          <span className="nav-icon">🚜</span>
          <span>Máquinas</span>
        </Link>
        <Link to="/manutencoes" className="nav-btn">
          <span className="nav-icon">🔧</span>
          <span>Manutenções</span>
        </Link>
        <Link to="/problemas" className="nav-btn">
          <span className="nav-icon">⚠️</span>
          <span>Problemas ({problemas.length})</span>
        </Link>
        <Link to="/relatorios" className="nav-btn">
          <span className="nav-icon">📊</span>
          <span>Relatórios & KPIs</span>
        </Link>
        <Link to="/historico" className="nav-btn">
          <span className="nav-icon">📋</span>
          <span>Histórico</span>
        </Link>
        <Link to="/catalogos" className="nav-btn">
          <span className="nav-icon">📚</span>
          <span>Catálogos Técnicos</span>
        </Link>
        <Link to="/usuarios" className="nav-btn" style={{ gridColumn: 'span 2' }}>
          <span className="nav-icon">👥</span>
          <span>Gestão de Equipe & Usuários</span>
        </Link>
      </nav>

      {/* Botão de Demonstração */}
      <div style={{ marginTop: 24, textAlign: 'center' }}>
        <button
          type="button"
          className="btn btn-sm btn-secondary"
          onClick={handleCarregarDemonstracao}
          disabled={carregandoSeed}
          style={{ width: 'auto', fontSize: 12, opacity: 0.8 }}
        >
          {carregandoSeed ? 'Carregando demonstração...' : '🌱 Carregar Dados de Demonstração (4 Máquinas + Planos + Histórico)'}
        </button>
      </div>
    </div>
  );
}

