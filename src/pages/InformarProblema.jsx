import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import db from '../db/database';
import { useAuth } from '../contexts/AuthContext';
import { informarProblema } from '../services/maquinas';
import BuscaPecaCatalogo from '../components/BuscaPecaCatalogo';

import { processarFoto } from '../utils/imagemHelper';

const TIPOS_PROBLEMA = [
  { tipo: 'parou', label: 'Parou', icone: '🛑' },
  { tipo: 'funcionando_com_problema', label: 'Funcionando com problema', icone: '⚠️' },
  { tipo: 'vazamento', label: 'Vazamento', icone: '💧' },
  { tipo: 'barulho', label: 'Barulho estranho', icone: '🔊' },
  { tipo: 'esquentando', label: 'Esquentando', icone: '🌡️' },
  { tipo: 'outro', label: 'Outro', icone: '❓' },
];

export default function InformarProblema() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const [maquina, setMaquina] = useState(null);
  const [tipo, setTipo] = useState(null);
  const [descricao, setDescricao] = useState('');
  const [foto, setFoto] = useState(null);
  const [audio] = useState(null);
  const [etapa, setEtapa] = useState('tipo');
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);
  const [pecaCatalogo, setPecaCatalogo] = useState(null);

  useEffect(() => {
    async function carregar() {
      const m = await db.maquina.get(Number(id));
      setMaquina(m);
    }
    carregar();
  }, [id]);

  function selecionarTipo(t) {
    setTipo(t);
    setEtapa('detalhes');
  }

  async function handleFoto(e) {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const dataUrl = await processarFoto(file);
        setFoto(dataUrl);
      } catch (err) {
        console.error('Erro ao processar foto:', err);
      }
    }
  }

  async function handleSubmit() {
    setErro('');
    try {
      await informarProblema({
        maquina_id: Number(id),
        tipo,
        descricao,
        foto_url: foto,
        audio_url: audio,
        horimetro_no_momento: maquina?.horimetro_atual || 0,
        usuario_reportou_id: usuario.id,
        peca_catalogo_id: pecaCatalogo?.id || null,
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
        <h1>Informar problema</h1>
        <span />
      </header>

      {sucesso ? (
        <div className="sucesso">
          <p>✓ Problema registrado!</p>
        </div>
      ) : etapa === 'tipo' ? (
        <div className="tipo-grid">
          {TIPOS_PROBLEMA.map((t) => (
            <button
              key={t.tipo}
              className="tipo-btn"
              onClick={() => selecionarTipo(t.tipo)}
            >
              <span className="tipo-icon">{t.icone}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      ) : (
        <div className="form-centro">
          <p className="tipo-selecionado">
            {TIPOS_PROBLEMA.find((t) => t.tipo === tipo)?.icone}{' '}
            {TIPOS_PROBLEMA.find((t) => t.tipo === tipo)?.label}
          </p>
          <textarea
            className="input"
            placeholder="Descreva o problema (opcional)"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            rows={3}
          />
          <label className="btn btn-secondary btn-block">
            📷 Tirar foto
            <input type="file" accept="image/*" capture="environment" onChange={handleFoto} hidden />
          </label>
          {foto && <img src={foto} alt="Preview" className="preview-foto" />}
          <BuscaPecaCatalogo aoSelecionar={setPecaCatalogo} />
          {pecaCatalogo && (
            <div className="card" style={{ marginBottom: 12 }}>
              <p className="text-sm">Peça selecionada: <strong>{pecaCatalogo.codigo_oem}</strong> — {pecaCatalogo.descricao}</p>
              <button className="btn btn-sm btn-secondary" onClick={() => setPecaCatalogo(null)}>Remover</button>
            </div>
          )}
          {erro && <p className="erro">{erro}</p>}
          <div className="btn-group">
            <button className="btn btn-secondary" onClick={() => setEtapa('tipo')}>
              Voltar
            </button>
            <button className="btn" onClick={handleSubmit}>
              Enviar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
