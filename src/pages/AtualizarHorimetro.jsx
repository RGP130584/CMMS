import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import db from '../db/database';
import { useAuth } from '../contexts/AuthContext';
import { atualizarHorimetro } from '../services/maquinas';

export default function AtualizarHorimetro() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const [maquina, setMaquina] = useState(null);
  const [valor, setValor] = useState('');
  const [justificativa, setJustificativa] = useState('');
  const [precisaJustificativa, setPrecisaJustificativa] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);

  useEffect(() => {
    async function carregar() {
      const m = await db.maquina.get(Number(id));
      if (m) {
        setMaquina(m);
      }
    }
    carregar();
  }, [id]);

  function handleValorChange(e) {
    const v = e.target.value;
    setValor(v);
    const num = Number(v);
    if (maquina && v !== '' && num < maquina.horimetro_atual) {
      setPrecisaJustificativa(true);
    } else {
      setPrecisaJustificativa(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErro('');

    const numValor = Number(valor);
    if (isNaN(numValor) || numValor < 0) {
      setErro('Informe um valor válido');
      return;
    }

    if (maquina && numValor < maquina.horimetro_atual && !justificativa.trim()) {
      setErro('Para lançar um horímetro menor que o anterior, informe a justificativa.');
      return;
    }

    try {
      await atualizarHorimetro(Number(id), numValor, usuario.id, justificativa.trim() || null);
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
        <h1>Atualizar horímetro</h1>
        <span />
      </header>

      {sucesso ? (
        <div className="sucesso">
          <p>✓ Horímetro atualizado!</p>
        </div>
      ) : (
        <form className="form-centro" onSubmit={handleSubmit}>
          {maquina && (
            <p className="text-sm text-muted" style={{ textAlign: 'center', marginBottom: 12 }}>
              Máquina: <strong>{maquina.apelido}</strong> • Atual: <strong>{maquina.horimetro_atual}h</strong>
            </p>
          )}

          <label className="label-grande">Novo valor do horímetro</label>
          <input
            type="number"
            className="input-horimetro"
            placeholder="0"
            value={valor}
            onChange={handleValorChange}
            inputMode="numeric"
            autoFocus
          />

          {precisaJustificativa && (
            <div style={{ marginBottom: 16 }}>
              <label className="label" style={{ color: 'var(--amarelo)' }}>
                ⚠️ Horímetro menor que o atual ({maquina?.horimetro_atual}h). Informe a justificativa:
              </label>
              <textarea
                className="input"
                placeholder="Ex: Troca de horímetro, erro de digitação anterior..."
                value={justificativa}
                onChange={(e) => setJustificativa(e.target.value)}
                rows={2}
                required
              />
            </div>
          )}

          {erro && <p className="erro">{erro}</p>}
          <button type="submit" className="btn btn-lg">
            Confirmar
          </button>
        </form>
      )}
    </div>
  );
}
