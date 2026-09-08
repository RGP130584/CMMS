import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import db from '../db/database';
import { useAuth } from '../contexts/AuthContext';
import { registrarRevisao } from '../services/maquinas';
import BuscaPecaCatalogo from '../components/BuscaPecaCatalogo';

export default function FazerRevisao() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const [plano, setPlano] = useState(null);
  const [itens, setItens] = useState([]);
  const [pecasUtilizadas, setPecasUtilizadas] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);
  const [pecasSelecionadas, setPecasSelecionadas] = useState([]);

  useEffect(() => {
    async function carregar() {
      const p = await db.planoManutencao
        .where('maquina_id')
        .equals(Number(id))
        .and((pl) => pl.ativo)
        .first();
      if (p) {
        setPlano(p);
        const itensPlano = await db.itemPlano.where('plano_id').equals(p.id).toArray();
        setItens(itensPlano.map((i) => ({ ...i, executado: false })));
      }
    }
    carregar();
  }, [id]);

  function toggleItem(index) {
    setItens((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, executado: !item.executado } : item
      )
    );
  }

  async function handleSubmit() {
    setErro('');
    if (!plano) {
      setErro('Nenhum plano de manutenção encontrado');
      return;
    }

    try {
      const maquina = await db.maquina.get(Number(id));
      const pecasLivres = pecasUtilizadas
        .split(',')
        .map((p) => p.trim())
        .filter(Boolean);

      const pecasCatalogo = pecasSelecionadas.map((p) => `${p.codigo_oem} — ${p.descricao}`);

      await registrarRevisao({
        maquina_id: Number(id),
        plano_id: plano.id,
        horimetro_programado: plano.proximoHorimetro,
        horimetro_realizado: maquina.horimetro_atual,
        usuario_id: usuario.id,
        itens_executados: itens.filter((i) => i.executado).map((i) => i.descricao),
        pecas_utilizadas: [...pecasLivres, ...pecasCatalogo],
        observacoes,
      });
      setSucesso(true);
      setTimeout(() => navigate(`/maquina/${id}`), 1200);
    } catch (err) {
      setErro(err.message);
    }
  }

  return (
    <div className="page">
      <header className="header">
        <Link to={`/maquina/${id}`} className="btn btn-sm btn-secondary">← Voltar</Link>
        <h1>Revisão preventiva</h1>
        <span />
      </header>

      {sucesso ? (
        <div className="sucesso">
          <p>✓ Revisão registrada!</p>
        </div>
      ) : !plano ? (
        <div className="vazio">
          <p>Nenhum plano de manutenção configurado para esta máquina.</p>
          <Link to="/" className="btn">Voltar ao início</Link>
        </div>
      ) : (
        <div className="form-centro">
          <h2>{plano.nome}</h2>
          <p className="text-muted">Intervalo: {plano.intervalo_horas}h</p>

          <h3>Itens da revisão</h3>
          <div className="checklist">
            {itens.map((item, i) => (
              <label key={item.id} className="check-item">
                <input
                  type="checkbox"
                  checked={item.executado}
                  onChange={() => toggleItem(i)}
                />
                <span>{item.descricao}</span>
              </label>
            ))}
          </div>

          <h3>Peças utilizadas</h3>
          <BuscaPecaCatalogo aoSelecionar={(peca) => {
            if (!pecasSelecionadas.find((p) => p.id === peca.id)) {
              setPecasSelecionadas((prev) => [...prev, peca]);
            }
          }} />
          {pecasSelecionadas.length > 0 && (
            <div className="card" style={{ marginBottom: 12 }}>
              {pecasSelecionadas.map((p) => (
                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span className="text-sm"><strong>{p.codigo_oem}</strong> — {p.descricao}</span>
                  <button className="btn btn-sm btn-secondary" onClick={() => setPecasSelecionadas((prev) => prev.filter((x) => x.id !== p.id))}>✕</button>
                </div>
              ))}
            </div>
          )}
          <input
            type="text"
            className="input"
            placeholder="Ou digite peças separadas por vírgula (ex: filtro de óleo, vela)"
            value={pecasUtilizadas}
            onChange={(e) => setPecasUtilizadas(e.target.value)}
          />

          <h3>Observações</h3>
          <textarea
            className="input"
            placeholder="Observações (opcional)"
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            rows={3}
          />

          {erro && <p className="erro">{erro}</p>}

          <button className="btn btn-lg" onClick={handleSubmit}>
            Concluir revisão
          </button>
        </div>
      )}
    </div>
  );
}
