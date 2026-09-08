import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { listarHistoricoGeral } from '../services/maquinas';

const TIPO_LABELS = {
  revisao: 'Revisão preventiva',
  corretiva: 'Manutenção corretiva',
  atualizacao_horimetro: 'Horímetro',
  problema: 'Problema reportado',
};

export default function HistoricoGeral() {
  const { empresa } = useAuth();
  const [eventos, setEventos] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregar() {
      if (!empresa) return;
      const evs = await listarHistoricoGeral(empresa.id);
      setEventos(evs);
      setCarregando(false);
    }
    carregar();
  }, [empresa]);

  return (
    <div className="page">
      <header className="header">
        <Link to="/" className="btn btn-sm btn-secondary">← Início</Link>
        <h1>Histórico Geral</h1>
        <span />
      </header>

      <p className="text-muted" style={{ marginBottom: 16 }}>
        Linha do tempo consolidada de todos os eventos e lançamentos da frota.
      </p>

      {carregando ? (
        <p>Carregando histórico...</p>
      ) : eventos.length === 0 ? (
        <div className="vazio">
          <span style={{ fontSize: 48 }}>📜</span>
          <p>Nenhum evento registrado ainda.</p>
          <Link to="/" className="btn" style={{ marginTop: 12 }}>Voltar ao Início</Link>
        </div>
      ) : (
        <div className="historico-lista">
          {eventos.map((ev) => (
            <div key={ev.id} className="historico-item">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="historico-tipo">{TIPO_LABELS[ev.tipo] || ev.tipo}</span>
                <span className="text-sm" style={{ fontWeight: 700 }}>
                  🚜 {ev.maquina_apelido}
                </span>
              </div>
              <p className="historico-resumo">{ev.resumo}</p>
              <div className="historico-meta">
                <span>{new Date(ev.data_hora).toLocaleString('pt-BR')}</span>
                {ev.horimetro !== null && ev.horimetro !== undefined && (
                  <span>{ev.horimetro}h</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
