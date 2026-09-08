import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import db from '../db/database';

export default function HistoricoMaquina() {
  const { id } = useParams();
  const [eventos, setEventos] = useState([]);
  const [maquina, setMaquina] = useState(null);

  useEffect(() => {
    async function carregar() {
      const m = await db.maquina.get(Number(id));
      setMaquina(m);

      const eventosDb = await db.historicoEvento
        .where('maquina_id')
        .equals(Number(id))
        .reverse()
        .sortBy('data_hora');
      setEventos(eventosDb);
    }
    carregar();
  }, [id]);

  const tipoLabels = {
    revisao: 'Revisão',
    corretiva: 'Manutenção corretiva',
    atualizacao_horimetro: 'Atualização de horímetro',
    problema: 'Problema reportado',
  };

  return (
    <div className="page">
      <header className="header">
        <Link to={`/maquina/${id}`} className="btn btn-sm btn-secondary">← Voltar</Link>
        <h1>Histórico</h1>
        <span />
      </header>

      {maquina && <p className="text-muted">{maquina.apelido}</p>}

      {eventos.length === 0 ? (
        <div className="vazio">
          <p>Nenhum evento registrado</p>
        </div>
      ) : (
        <div className="historico-lista">
          {eventos.map((e) => (
            <div key={e.id} className="historico-item">
              <div className="historico-tipo">{tipoLabels[e.tipo] || e.tipo}</div>
              <div className="historico-resumo">{e.resumo}</div>
              <div className="historico-meta">
                <span>{e.horimetro != null ? `${e.horimetro}h` : ''}</span>
                <span>
                  {new Date(e.data_hora).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
