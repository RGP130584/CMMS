import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { listarPecasRevisao, revisarPeca, atualizarPeca } from '../../services/extracao';

export default function RevisaoCatalogo() {
  const [pecas, setPecas] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState({});

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    const lista = await listarPecasRevisao();
    setPecas(lista);
  }

  async function handleAprovar(id) {
    await revisarPeca(id, true);
    await carregar();
  }

  async function handleRejeitar(id) {
    await revisarPeca(id, false);
    await carregar();
  }

  function handleEditar(peca) {
    setEditando(peca.id);
    setForm({
      codigo_oem: peca.codigo_oem,
      descricao: peca.descricao,
      grupo: peca.grupo || '',
      modelos: (peca.modelos || []).join(', '),
    });
  }

  async function handleSalvar() {
    await atualizarPeca(editando, {
      codigo_oem: form.codigo_oem,
      descricao: form.descricao,
      grupo: form.grupo || null,
      modelos: form.modelos ? form.modelos.split(',').map((m) => m.trim()) : [],
    });
    setEditando(null);
    setForm({});
    await carregar();
  }

  function handleCancelar() {
    setEditando(null);
    setForm({});
  }

  const pecasFiltradas = pecas.filter((p) => {
    if (!filtro) return true;
    const termo = filtro.toLowerCase();
    return (
      (p.codigo_oem && p.codigo_oem.toLowerCase().includes(termo)) ||
      (p.descricao && p.descricao.toLowerCase().includes(termo)) ||
      (p.grupo && p.grupo.toLowerCase().includes(termo))
    );
  });

  return (
    <div className="page">
      <header className="header">
        <Link to="/catalogos" className="btn btn-sm btn-secondary">← Voltar</Link>
        <h1>Revisão de peças</h1>
        <span />
      </header>

      <div className="busca">
        <input
          type="search"
          placeholder="Buscar por código, descrição ou grupo..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
        />
      </div>

      <p className="text-sm text-muted" style={{ marginBottom: 12 }}>
        {pecasFiltradas.length} peça(s) pendente(s) de revisão
      </p>

      {pecasFiltradas.length === 0 && (
        <div className="empty-state">
          <p>{pecas.length === 0 ? 'Nenhuma peça pendente de revisão' : 'Nenhum resultado para a busca'}</p>
        </div>
      )}

      <div className="card-list">
        {pecasFiltradas.map((p) => (
          <div key={p.id} className="maquina-card" style={{ borderLeft: `3px solid ${p.revisado ? 'var(--verde)' : 'var(--amarelo)'}` }}>
            {editando === p.id ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label className="field-label">Código OEM</label>
                <input
                  type="text"
                  value={form.codigo_oem}
                  onChange={(e) => setForm({ ...form, codigo_oem: e.target.value })}
                  style={{ fontFamily: 'monospace' }}
                />

                <label className="field-label">Descrição</label>
                <input
                  type="text"
                  value={form.descricao}
                  onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                />

                <label className="field-label">Grupo</label>
                <input
                  type="text"
                  value={form.grupo}
                  onChange={(e) => setForm({ ...form, grupo: e.target.value })}
                  placeholder="Ex: Motor, Filtro, Hidráulica..."
                />

                <label className="field-label">Modelos (separados por vírgula)</label>
                <input
                  type="text"
                  value={form.modelos}
                  onChange={(e) => setForm({ ...form, modelos: e.target.value })}
                  placeholder="Ex: JD 4310, MF 4292"
                />

                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <button className="btn btn-lg" onClick={handleSalvar} style={{ flex: 1 }}>Salvar</button>
                  <button className="btn btn-lg btn-secondary" onClick={handleCancelar} style={{ flex: 1 }}>Cancelar</button>
                </div>
              </div>
            ) : (
              <>
                <div className="maquina-card-header">
                  <h3 style={{ fontFamily: 'monospace', color: 'var(--verde)' }}>{p.codigo_oem}</h3>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button className="btn btn-sm btn-secondary" onClick={() => handleEditar(p)}>Editar</button>
                  </div>
                </div>
                <p className="text-sm">{p.descricao}</p>
                {p.grupo && <p className="text-sm text-muted">Grupo: {p.grupo}</p>}
                {p.modelos?.length > 0 && (
                  <p className="text-sm text-muted">Modelos: {p.modelos.join(', ')}</p>
                )}
                <p className="text-sm text-muted" style={{ fontFamily: 'monospace', marginTop: 4 }}>
                  {p.referencia_pagina}
                </p>
                {p.texto_original && (
                  <p className="text-sm text-muted" style={{ fontStyle: 'italic', marginTop: 4 }}>
                    Texto original: "{p.texto_original}"
                  </p>
                )}
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <button className="btn btn-lg" onClick={() => handleAprovar(p.id)} style={{ flex: 1, background: 'var(--verde)' }}>
                    Aprovar
                  </button>
                  <button className="btn btn-lg btn-secondary" onClick={() => handleRejeitar(p.id)} style={{ flex: 1, color: 'var(--vermelho)' }}>
                    Rejeitar
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
