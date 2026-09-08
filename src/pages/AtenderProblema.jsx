import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import db from '../db/database';
import { useAuth } from '../contexts/AuthContext';
import { iniciarAtendimentoProblema, concluirManutencaoCorretiva } from '../services/maquinas';
import BuscaPecaCatalogo from '../components/BuscaPecaCatalogo';

export default function AtenderProblema() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const [problema, setProblema] = useState(null);
  const [maquina, setMaquina] = useState(null);
  const [servicoRealizado, setServicoRealizado] = useState('');
  const [pecasLivres, setPecasLivres] = useState('');
  const [pecasSelecionadas, setPecasSelecionadas] = useState([]);
  const [observacoes, setObservacoes] = useState('');
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);
  const [processando, setProcessando] = useState(false);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregar() {
      try {
        const p = await db.problema.get(Number(id));
        if (p) {
          setProblema(p);
          const m = await db.maquina.get(p.maquina_id);
          setMaquina(m);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setCarregando(false);
      }
    }
    carregar();
  }, [id]);

  async function handleIniciar() {
    setProcessando(true);
    try {
      await iniciarAtendimentoProblema(Number(id), usuario.id);
      const p = await db.problema.get(Number(id));
      setProblema(p);
    } catch (err) {
      setErro(err.message);
    } finally {
      setProcessando(false);
    }
  }

  async function handleConcluir(e) {
    e.preventDefault();
    setErro('');

    if (!servicoRealizado.trim()) {
      setErro('Informe o serviço ou conserto realizado.');
      return;
    }

    try {
      const listaPecasManuais = pecasLivres
        .split(',')
        .map((p) => p.trim())
        .filter(Boolean);

      const listaPecasCatalogo = pecasSelecionadas.map((p) => `${p.codigo_oem} — ${p.descricao}`);

      await concluirManutencaoCorretiva({
        problema_id: Number(id),
        maquina_id: problema.maquina_id,
        usuario_id: usuario.id,
        servico_realizado: servicoRealizado.trim(),
        pecas_utilizadas: [...listaPecasManuais, ...listaPecasCatalogo],
        observacoes: observacoes.trim(),
        horimetro_no_momento: maquina?.horimetro_atual || problema.horimetro_no_momento || 0,
      });

      setSucesso(true);
      setTimeout(() => navigate(`/maquina/${problema.maquina_id}`), 1200);
    } catch (err) {
      setErro(err.message);
    }
  }

  if (!problema) {
    return (
      <div className="page">
        <header className="header">
          <Link to="/problemas" className="btn btn-sm btn-secondary">← Voltar</Link>
          <h1>Atendimento de Chamado</h1>
          <span />
        </header>
        <div className="card" style={{ textAlign: 'center', padding: '32px 16px' }}>
          <p className="text-muted" style={{ marginBottom: 16 }}>
            {carregando ? 'Carregando problema...' : 'Problema não encontrado ou já resolvido.'}
          </p>
          <Link to="/problemas" className="btn btn-sm">Ver todos os problemas</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <header className="header">
        <Link to="/problemas" className="btn btn-sm btn-secondary">← Voltar</Link>
        <h1>Atendimento de Chamado</h1>
        <span />
      </header>

      {sucesso ? (
        <div className="sucesso">
          <p>✓ Manutenção corretiva concluída e registrada!</p>
        </div>
      ) : (
        <div className="form-centro">
          <div className="card" style={{ marginBottom: 16 }}>
            <h3>{maquina?.apelido} • {maquina?.modelo}</h3>
            <p className="text-sm text-muted">Horímetro: {maquina?.horimetro_atual}h</p>
            <div style={{ marginTop: 8, padding: 8, background: '#FFF3E0', borderRadius: 8 }}>
              <strong>Problema reportado:</strong> {problema.tipo}
              {problema.descricao && <p className="text-sm">"{problema.descricao}"</p>}
              <p className="text-sm text-muted" style={{ marginTop: 4 }}>
                Data: {new Date(problema.data_hora).toLocaleString('pt-BR')}
              </p>
            </div>

            {problema.foto_url && (
              <img
                src={problema.foto_url}
                alt="Foto do problema"
                className="preview-foto"
                style={{ marginTop: 8 }}
              />
            )}
          </div>

          {problema.status === 'aberto' ? (
            <div>
              <p className="text-muted" style={{ marginBottom: 12, textAlign: 'center' }}>
                Este problema ainda não foi iniciado por um mecânico.
              </p>
              <button
                type="button"
                className="btn btn-lg"
                onClick={handleIniciar}
                disabled={processando}
                style={{ background: 'var(--azul)' }}
              >
                {processando ? 'Iniciando...' : '🔧 Iniciar Atendimento / Manutenção'}
              </button>
            </div>
          ) : (
            <form onSubmit={handleConcluir}>
              <div style={{ padding: 8, background: '#E3F2FD', borderRadius: 8, marginBottom: 16 }}>
                <span className="text-sm" style={{ color: 'var(--azul)', fontWeight: 600 }}>
                  ⚙️ Máquina em manutenção corretiva
                </span>
              </div>

              <label className="label">Serviço / Reparo Realizado *</label>
              <textarea
                className="input"
                placeholder="Descreva o que foi consertado ou substituído..."
                value={servicoRealizado}
                onChange={(e) => setServicoRealizado(e.target.value)}
                rows={3}
                required
              />

              <label className="label">Peças do Catálogo Utilizadas</label>
              <BuscaPecaCatalogo
                aoSelecionar={(peca) => {
                  if (!pecasSelecionadas.find((p) => p.id === peca.id)) {
                    setPecasSelecionadas((prev) => [...prev, peca]);
                  }
                }}
              />

              {pecasSelecionadas.length > 0 && (
                <div className="card" style={{ marginBottom: 12 }}>
                  {pecasSelecionadas.map((p) => (
                    <div
                      key={p.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 4,
                      }}
                    >
                      <span className="text-sm">
                        <strong>{p.codigo_oem}</strong> — {p.descricao}
                      </span>
                      <button
                        type="button"
                        className="btn btn-sm btn-secondary"
                        onClick={() =>
                          setPecasSelecionadas((prev) => prev.filter((x) => x.id !== p.id))
                        }
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <label className="label">Ou digite outras peças usadas</label>
              <input
                type="text"
                className="input"
                placeholder="Ex: Parafusos 10mm, mangueira 1/2 polegada..."
                value={pecasLivres}
                onChange={(e) => setPecasLivres(e.target.value)}
              />

              <label className="label">Observações Adicionais</label>
              <textarea
                className="input"
                placeholder="Opcional"
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                rows={2}
              />

              {erro && <p className="erro">{erro}</p>}

              <button type="submit" className="btn btn-lg" style={{ marginTop: 12 }}>
                ✓ Concluir Manutenção e Liberar Máquina
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
