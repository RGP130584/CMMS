import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import db from '../db/database';
import { gerarPlanoAutomaticoCompleto } from '../utils/planosAutomaticos';
import { processarFoto } from '../utils/imagemHelper';

const TIPOS_SUGERIDOS = [
  'Trator',
  'Caminhão',
  'Colheitadeira',
  'Pulverizador',
  'Plantadeira',
  'Veículo de Apoio / Picape',
  'Implemento',
];

const FABRICANTES_SUGERIDOS = [
  'John Deere',
  'Massey Ferguson',
  'Case IH',
  'New Holland',
  'Valtra',
  'Scania',
  'Volvo',
  'Mercedes-Benz',
  'Volkswagen Caminhões',
  'Iveco',
  'Stara',
  'Jacto',
];

export default function CadastroMaquina() {
  const { empresa } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [apelido, setApelido] = useState('');
  const [tipo, setTipo] = useState('Trator');
  const [fabricante, setFabricante] = useState('John Deere');
  const [modelo, setModelo] = useState('');
  const [ano, setAno] = useState('');
  const [numeroSerie, setNumeroSerie] = useState('');
  const [horimetroAtual, setHorimetroAtual] = useState('');
  const [fotoUrl, setFotoUrl] = useState('');
  const [statusOperacional, setStatusOperacional] = useState('operacional');
  const [observacoes, setObservacoes] = useState('');
  const [processandoFoto, setProcessandoFoto] = useState(false);
  const [erro, setErro] = useState('');

  async function handleFotoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setProcessandoFoto(true);
      setErro('');
      const dataUrl = await processarFoto(file);
      setFotoUrl(dataUrl);
    } catch (err) {
      console.error('Erro ao processar foto:', err);
      setErro('Não foi possível carregar a foto selecionada');
    } finally {
      setProcessandoFoto(false);
    }
  }

  function removerFoto() {
    setFotoUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErro('');

    if (!apelido.trim() || !tipo.trim() || !fabricante.trim() || !modelo.trim()) {
      setErro('Preencha os campos obrigatórios (*)');
      return;
    }

    try {
      const horimetroNum = Number(horimetroAtual) || 0;
      const maquinaId = await db.maquina.add({
        empresa_id: empresa.id,
        apelido: apelido.trim(),
        tipo: tipo.trim(),
        fabricante: fabricante.trim(),
        modelo: modelo.trim(),
        ano: Number(ano) || null,
        numero_serie: numeroSerie.trim() || null,
        horimetro_atual: horimetroNum,
        foto_url: fotoUrl || null,
        status_operacional: statusOperacional, // 'operacional' | 'em_manutencao' | 'aguardando_pecas'
        observacoes: observacoes.trim(),
        status_calculado: statusOperacional === 'em_manutencao' ? 'vermelho' : 'verde',
        criado_em: new Date().toISOString(),
      });

      // Cria automaticamente o Plano Completo Escalonado de 250h, 500h e 1000h com checklists reais
      await gerarPlanoAutomaticoCompleto(maquinaId, tipo, horimetroNum);

      navigate(`/maquina/${maquinaId}`);
    } catch (err) {
      setErro(err.message);
    }
  }

  return (
    <div className="page">
      <header className="header">
        <Link to="/maquinas" className="btn btn-sm btn-secondary">← Voltar</Link>
        <h1>Nova máquina / Veículo</h1>
        <span />
      </header>

      <form className="form-centro" onSubmit={handleSubmit}>
        {/* Seção da Foto */}
        <div className="card" style={{ marginBottom: 16, textAlign: 'center' }}>
          <label className="label" style={{ marginBottom: 8, display: 'block' }}>
            Foto da Máquina / Veículo
          </label>

          {fotoUrl ? (
            <div style={{ position: 'relative', display: 'inline-block', width: '100%', maxWidth: 320 }}>
              <img
                src={fotoUrl}
                alt="Foto da Máquina"
                style={{
                  width: '100%',
                  maxHeight: 220,
                  objectFit: 'cover',
                  borderRadius: 8,
                  border: '2px solid var(--verde)',
                }}
              />
              <button
                type="button"
                className="btn btn-sm btn-secondary"
                onClick={removerFoto}
                style={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  background: 'rgba(0,0,0,0.7)',
                  color: '#fff',
                }}
              >
                ✕ Remover foto
              </button>
            </div>
          ) : (
            <div
              style={{
                border: '2px dashed var(--borda)',
                borderRadius: 8,
                padding: '24px 16px',
                background: 'var(--card-bg, #fafafa)',
              }}
            >
              <span style={{ fontSize: 36, display: 'block', marginBottom: 8 }}>📷</span>
              <p className="text-sm text-muted" style={{ marginBottom: 12 }}>
                Tire uma foto com a câmera do celular ou escolha da galeria
              </p>
              <button
                type="button"
                className="btn btn-sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={processandoFoto}
              >
                {processandoFoto ? 'Processando foto...' : '📷 Tirar foto / Adicionar imagem'}
              </button>
            </div>
          )}

          <input
            type="file"
            accept="image/*"
            capture="environment"
            ref={fileInputRef}
            onChange={handleFotoChange}
            style={{ display: 'none' }}
          />
        </div>

        <label className="label">Identificação / Apelido do Veículo *</label>
        <input
          type="text"
          className="input"
          placeholder="Ex: Trator 01, Caminhão Graneleiro Scania, Pulverizador 350"
          value={apelido}
          onChange={(e) => setApelido(e.target.value)}
          required
        />

        <label className="label">Tipo de Equipamento *</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
          {TIPOS_SUGERIDOS.map((t) => (
            <button
              key={t}
              type="button"
              className={`btn btn-sm ${tipo === t ? '' : 'btn-secondary'}`}
              onClick={() => setTipo(t)}
            >
              {t === 'Caminhão' ? '🚛 ' : t === 'Trator' ? '🚜 ' : ''}{t}
            </button>
          ))}
        </div>
        <input
          type="text"
          className="input"
          placeholder="Ou digite o tipo..."
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          required
        />

        <label className="label">Fabricante / Marca *</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
          {FABRICANTES_SUGERIDOS.slice(0, 8).map((f) => (
            <button
              key={f}
              type="button"
              className={`btn btn-sm ${fabricante === f ? '' : 'btn-secondary'}`}
              onClick={() => setFabricante(f)}
            >
              {f}
            </button>
          ))}
        </div>
        <input
          type="text"
          className="input"
          placeholder="Ou digite o fabricante..."
          value={fabricante}
          onChange={(e) => setFabricante(e.target.value)}
          required
        />

        <label className="label">Modelo *</label>
        <input
          type="text"
          className="input"
          placeholder="Ex: 6145J, R450 6x2, MF 4292, Patriot 350"
          value={modelo}
          onChange={(e) => setModelo(e.target.value)}
          required
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label className="label">Ano de Fabricação</label>
            <input
              type="number"
              className="input"
              placeholder="Ex: 2023"
              value={ano}
              onChange={(e) => setAno(e.target.value)}
            />
          </div>
          <div>
            <label className="label">
              {tipo === 'Caminhão' ? 'Horímetro / KM' : 'Horímetro Inicial (h)'}
            </label>
            <input
              type="number"
              className="input"
              placeholder="0"
              value={horimetroAtual}
              onChange={(e) => setHorimetroAtual(e.target.value)}
              inputMode="numeric"
            />
          </div>
        </div>

        {/* Status Operacional Inicial */}
        <label className="label" style={{ marginTop: 12 }}>Status Operacional Inicial</label>
        <select
          className="input"
          value={statusOperacional}
          onChange={(e) => setStatusOperacional(e.target.value)}
        >
          <option value="operacional">🟢 Operacional (Pronto para Trabalho / Rodagem)</option>
          <option value="em_manutencao">🚨 Em Manutenção (Parado na Oficina)</option>
          <option value="aguardando_pecas">🟡 Aguardando Peças</option>
        </select>

        <div
          className="card"
          style={{
            marginTop: 12,
            marginBottom: 16,
            background: '#E8F5E9',
            border: '1px solid #C8E6C9',
            padding: 14,
          }}
        >
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
            <span style={{ fontSize: 20 }}>⚙️</span>
            <strong style={{ color: 'var(--verde)', fontSize: 14 }}>
              Plano de Manutenção Automático & Escalonado
            </strong>
          </div>
          <p className="text-sm" style={{ color: '#2E7D32' }}>
            Ao salvar, o sistema montará automaticamente as revisões de <strong>250h, 500h e 1000h</strong> (ou equivalentes de rodagem) com os checklists de fábrica para <strong>{tipo}</strong>.
          </p>
        </div>

        <label className="label">Número de Chassi / Série (opcional)</label>
        <input
          type="text"
          className="input"
          placeholder="Ex: 9BW..."
          value={numeroSerie}
          onChange={(e) => setNumeroSerie(e.target.value)}
        />

        <label className="label">Observações (opcional)</label>
        <textarea
          className="input"
          placeholder="Observações da máquina ou veículo..."
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
          rows={2}
        />

        {erro && <p className="erro">{erro}</p>}

        <button type="submit" className="btn btn-lg" style={{ marginTop: 12 }}>
          Cadastrar no Sistema
        </button>
      </form>
    </div>
  );
}


