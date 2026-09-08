import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import db from '../db/database';
import { salvarPlanoManutencao, obterPlanoAtivo } from '../services/maquinas';

export default function ConfigurarPlano() {

  const { id } = useParams();
  const navigate = useNavigate();
  const [maquina, setMaquina] = useState(null);
  const [planoId, setPlanoId] = useState(null);
  const [nome, setNome] = useState('Revisão Preventiva');
  const [intervaloHoras, setIntervaloHoras] = useState('250');
  const [proximoHorimetro, setProximoHorimetro] = useState('');
  const [itens, setItens] = useState([
    { descricao: 'Trocar óleo do motor' },
    { descricao: 'Trocar filtro de óleo' },
    { descricao: 'Trocar filtro de combustível' },
    { descricao: 'Engraxar pinos e articulações' },
  ]);
  const [novoItem, setNovoItem] = useState('');
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);

  useEffect(() => {
    async function carregar() {
      const m = await db.maquina.get(Number(id));
      if (!m) return;
      setMaquina(m);

      const plano = await obterPlanoAtivo(Number(id));
      if (plano) {
        setPlanoId(plano.id);
        setNome(plano.nome);
        setIntervaloHoras(String(plano.intervalo_horas));
        setProximoHorimetro(String(plano.proximoHorimetro));
        if (plano.itens && plano.itens.length > 0) {
          setItens(plano.itens.map((i) => ({ descricao: i.descricao })));
        }
      } else {
        setProximoHorimetro(String((m.horimetro_atual || 0) + 250));
      }
    }
    carregar();
  }, [id]);

  function adicionarItem() {
    if (!novoItem.trim()) return;
    setItens((prev) => [...prev, { descricao: novoItem.trim() }]);
    setNovoItem('');
  }

  function removerItem(index) {
    setItens((prev) => prev.filter((_, i) => i !== index));
  }

  function aplicarTemplate(horas, nomePlano) {
    setIntervaloHoras(String(horas));
    setNome(nomePlano);
    if (maquina) {
      setProximoHorimetro(String((maquina.horimetro_atual || 0) + horas));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErro('');

    if (!nome.trim() || !intervaloHoras) {
      setErro('Preencha o nome e o intervalo de horas do plano.');
      return;
    }

    try {
      await salvarPlanoManutencao(
        Number(id),
        {
          id: planoId,
          nome: nome.trim(),
          intervalo_horas: Number(intervaloHoras),
          proximoHorimetro: Number(proximoHorimetro),
          ativo: true,
        },
        itens
      );

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
        <h1>Plano de Manutenção</h1>
        <span />
      </header>

      {sucesso ? (
        <div className="sucesso">
          <p>✓ Plano de manutenção salvo com sucesso!</p>
        </div>
      ) : (
        <form className="form-centro" onSubmit={handleSubmit}>
          {maquina && (
            <p className="text-sm text-muted" style={{ textAlign: 'center', marginBottom: 16 }}>
              Máquina: <strong>{maquina.apelido}</strong> • Horímetro atual: <strong>{maquina.horimetro_atual}h</strong>
            </p>
          )}

          <div style={{ marginBottom: 16 }}>
            <span className="label">Modelos rápidos:</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                className="btn btn-sm btn-secondary"
                onClick={() => aplicarTemplate(250, 'Revisão 250h')}
              >
                250h (Troca de Óleo)
              </button>
              <button
                type="button"
                className="btn btn-sm btn-secondary"
                onClick={() => aplicarTemplate(500, 'Revisão 500h')}
              >
                500h (Filtros Gerais)
              </button>
              <button
                type="button"
                className="btn btn-sm btn-secondary"
                onClick={() => aplicarTemplate(1000, 'Revisão Completa 1000h')}
              >
                1000h (Geral)
              </button>
            </div>
          </div>

          <label className="label">Nome do Plano *</label>
          <input
            type="text"
            className="input"
            placeholder="Ex: Revisão 250 Horas"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
          />

          <label className="label">Intervalo de Repetição (Horas) *</label>
          <input
            type="number"
            className="input"
            placeholder="Ex: 250"
            value={intervaloHoras}
            onChange={(e) => {
              setIntervaloHoras(e.target.value);
              if (maquina && e.target.value) {
                setProximoHorimetro(String((maquina.horimetro_atual || 0) + Number(e.target.value)));
              }
            }}
            required
          />

          <label className="label">Próxima Revisão Programada no Horímetro (h)</label>
          <input
            type="number"
            className="input"
            placeholder="Ex: 500"
            value={proximoHorimetro}
            onChange={(e) => setProximoHorimetro(e.target.value)}
            required
          />

          <h3 style={{ marginTop: 20, marginBottom: 8, fontSize: 16 }}>Checklist de Itens Obrigatórios</h3>
          <p className="text-sm text-muted" style={{ marginBottom: 12 }}>
            Itens que o mecânico deverá checar ao realizar esta revisão:
          </p>

          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <input
              type="text"
              className="input"
              style={{ marginBottom: 0 }}
              placeholder="Adicionar novo item (ex: Trocar filtro de ar)"
              value={novoItem}
              onChange={(e) => setNovoItem(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  adicionarItem();
                }
              }}
            />
            <button type="button" className="btn btn-sm" onClick={adicionarItem}>
              + Inserir
            </button>
          </div>

          {itens.length > 0 && (
            <div className="card" style={{ marginBottom: 16 }}>
              {itens.map((item, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 0',
                    borderBottom: index < itens.length - 1 ? '1px solid var(--border)' : 'none',
                  }}
                >
                  <span className="text-sm">✓ {item.descricao}</span>
                  <button
                    type="button"
                    className="btn btn-sm btn-secondary"
                    onClick={() => removerItem(index)}
                    style={{ padding: '4px 8px' }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          {erro && <p className="erro">{erro}</p>}

          <button type="submit" className="btn btn-lg" style={{ marginTop: 12 }}>
            Salvar Plano de Manutenção
          </button>
        </form>
      )}
    </div>
  );
}
