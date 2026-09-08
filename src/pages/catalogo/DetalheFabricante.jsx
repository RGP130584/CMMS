import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import db from '../../db/database';

export default function DetalheFabricante() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [fabricante, setFabricante] = useState(null);
  const [fontes, setFontes] = useState([]);

  useEffect(() => {
    carregar();
  }, [id]);

  async function carregar() {
    const fab = await db.fabricante.get(Number(id));
    if (!fab) { navigate('/catalogo/fabricantes'); return; }
    setFabricante(fab);
    setFontes(await db.fonteCatalogo.where('fabricante_id').equals(Number(id)).toArray());
  }

  async function handleExcluir() {
    if (!confirm('Excluir este fabricante e todas as suas fontes?')) return;
    await db.fonteCatalogo.where('fabricante_id').equals(Number(id)).delete();
    await db.fabricante.delete(Number(id));
    navigate('/catalogo/fabricantes');
  }

  if (!fabricante) return null;

  return (
    <div className="page">
      <header className="header">
        <Link to="/catalogo/fabricantes" className="btn btn-sm btn-secondary">← Voltar</Link>
        <h1>{fabricante.nome}</h1>
        <span />
      </header>

      <section className="info-grid">
        <div className="info-item">
          <span className="info-label">País</span>
          {fabricante.pais || 'Não informado'}
        </div>
        <div className="info-item">
          <span className="info-label">Site</span>
          {fabricante.site ? <a href={fabricante.site} target="_blank" rel="noopener noreferrer">{fabricante.site}</a> : 'Não informado'}
        </div>
        <div className="info-item">
          <span className="info-label">Fontes cadastradas</span>
          {fontes.length}
        </div>
        <div className="info-item">
          <span className="info-label">Cadastrado em</span>
          {new Date(fabricante.criado_em).toLocaleDateString('pt-BR')}
        </div>
      </section>

      <div className="btn-group">
        <Link to={`/catalogo/fonte/nova?fabricante=${id}`} className="btn">+ Nova fonte</Link>
        <button type="button" className="btn btn-secondary" onClick={handleExcluir}>Excluir</button>
      </div>

      {fontes.length > 0 && (
        <>
          <h2 style={{ marginTop: 24, marginBottom: 8 }}>Fontes de catálogo</h2>
          <div className="card-list">
            {fontes.map((f) => (
              <Link key={f.id} to={`/catalogo/fonte/${f.id}`} className="maquina-card">
                <h3>{f.nome}</h3>
                <p className="text-muted">{f.tipo}</p>
                <p className="text-sm">{f.url || 'Sem URL'}</p>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
