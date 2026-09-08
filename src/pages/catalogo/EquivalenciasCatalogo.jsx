import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import db from '../../db/database';

export default function EquivalenciasCatalogo() {
  const [equivalencias, setEquivalencias] = useState([]);
  const [pecas, setPecas] = useState([]);
  const [pecaId, setPecaId] = useState('');
  const [codigoAnterior, setCodigoAnterior] = useState('');
  const [codigoNovo, setCodigoNovo] = useState('');
  const [motivo, setMotivo] = useState('');
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    const eqs = await db.catalogoSubstituicao.toArray();
    setEquivalencias(eqs);

    const pecasPub = await db.catalogoPeca
      .where('status')
      .equals('publicado')
      .toArray();
    setPecas(pecasPub);
  }

  async function adicionar(e) {
    e.preventDefault();
    setErro('');
    setSucesso('');

    if (!pecaId || !codigoAnterior.trim() || !codigoNovo.trim()) {
      setErro('Preencha todos os campos obrigatórios');
      return;
    }

    const duplicada = equivalencias.find(
      (eq) =>
        eq.catalogo_peca_id === Number(pecaId) &&
        eq.codigo_anterior === codigoAnterior.trim()
    );
    if (duplicada) {
      setErro('Essa equivalência já existe para esta peça');
      return;
    }

    await db.catalogoSubstituicao.add({
      catalogo_peca_id: Number(pecaId),
      codigo_anterior: codigoAnterior.trim(),
      codigo_novo: codigoNovo.trim(),
      motivo: motivo.trim() || null,
      criado_em: new Date().toISOString(),
    });

    setCodigoAnterior('');
    setCodigoNovo('');
    setMotivo('');
    setSucesso('Equivalência registrada');
    await carregar();
  }

  async function excluir(id) {
    await db.catalogoSubstituicao.delete(id);
    await carregar();
  }

  function obterNomePeca(pecaId) {
    const p = pecas.find((p) => p.id === pecaId);
    return p ? `${p.codigo_oem} — ${p.descricao}` : `Peça #${pecaId}`;
  }

  return (
    <div className="page">
      <header className="header">
        <Link to="/catalogos" className="btn btn-sm btn-secondary">← Voltar</Link>
        <h1>Equivalências</h1>
        <span />
      </header>

      <p className="text-muted" style={{ marginBottom: 16 }}>
        Registre códigos anteriores que foram substituídos por novos códigos OEM.
      </p>

      {erro && <p className="erro" style={{ marginBottom: 8 }}>{erro}</p>}
      {sucesso && <p style={{ marginBottom: 8, color: 'var(--verde)' }}>{sucesso}</p>}

      <form onSubmit={adicionar} className="maquina-card" style={{ marginBottom: 16 }}>
        <h3 style={{ marginBottom: 8 }}>Nova equivalência</h3>

        <div className="form-group">
          <label className="form-label">Peça (código atual)</label>
          <select
            className="form-input"
            value={pecaId}
            onChange={(e) => setPecaId(e.target.value)}
          >
            <option value="">Selecione a peça...</option>
            {pecas.map((p) => (
              <option key={p.id} value={p.id}>
                {p.codigo_oem} — {p.descricao?.substring(0, 40)}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Código anterior (substituído)</label>
          <input
            className="form-input"
            placeholder="Ex: 123-456-789"
            value={codigoAnterior}
            onChange={(e) => setCodigoAnterior(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Código novo (atual)</label>
          <input
            className="form-input"
            placeholder="Ex: 987-654-321"
            value={codigoNovo}
            onChange={(e) => setCodigoNovo(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Motivo (opcional)</label>
          <input
            className="form-input"
            placeholder="Ex: Descontinuado pelo fabricante"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
          />
        </div>

        <button type="submit" className="btn btn-lg" style={{ width: '100%', marginTop: 8 }}>
          Registrar
        </button>
      </form>

      <h2 style={{ marginBottom: 8 }}>
        Registradas
        <span className="text-muted text-sm" style={{ marginLeft: 8 }}>
          ({equivalencias.length})
        </span>
      </h2>

      {equivalencias.length === 0 ? (
        <p className="text-muted">Nenhuma equivalência registrada</p>
      ) : (
        <div className="card-list">
          {equivalencias.map((eq) => (
            <div key={eq.id} className="maquina-card">
              <div className="maquina-card-header">
                <div>
                  <span style={{ fontFamily: 'monospace', color: 'var(--amarelo)' }}>
                    {eq.codigo_anterior}
                  </span>
                  <span style={{ margin: '0 8px' }}>→</span>
                  <span style={{ fontFamily: 'monospace', color: 'var(--verde)' }}>
                    {eq.codigo_novo}
                  </span>
                </div>
                <button
                  className="btn btn-sm btn-secondary"
                  onClick={() => excluir(eq.id)}
                >
                  Excluir
                </button>
              </div>
              <p className="text-sm text-muted">
                {obterNomePeca(eq.catalogo_peca_id)}
              </p>
              {eq.motivo && (
                <p className="text-sm text-muted">Motivo: {eq.motivo}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
