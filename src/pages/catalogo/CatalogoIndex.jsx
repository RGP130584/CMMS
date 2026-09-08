import { Link } from 'react-router-dom';

export default function CatalogoIndex() {
  return (
    <div className="page">
      <header className="header">
        <Link to="/" className="btn btn-sm btn-secondary">← Voltar</Link>
        <h1>Catálogos de Peças</h1>
        <span />
      </header>

      <p className="text-muted" style={{ marginBottom: 16 }}>
        Gerencie fabricantes, fontes oficiais e arquivos de catálogos de peças.
      </p>

      <div className="nav-grid">
        <Link to="/catalogo/fabricantes" className="nav-btn">
          <span className="nav-icon">🏭</span>
          Fabricantes
        </Link>
        <Link to="/catalogo/fontes" className="nav-btn">
          <span className="nav-icon">📚</span>
          Fontes de catálogo
        </Link>
        <Link to="/catalogo/revisao" className="nav-btn">
          <span className="nav-icon">✅</span>
          Revisão de peças
        </Link>
        <Link to="/catalogo/publicar" className="nav-btn">
          <span className="nav-icon">📢</span>
          Publicar peças
        </Link>
        <Link to="/catalogo/pesquisar" className="nav-btn">
          <span className="nav-icon">🔍</span>
          Pesquisar peças
        </Link>
        <Link to="/catalogo/diagramas" className="nav-btn">
          <span className="nav-icon">🖼️</span>
          Diagramas
        </Link>
        <Link to="/catalogo/equivalencias" className="nav-btn">
          <span className="nav-icon">🔄</span>
          Equivalências
        </Link>
      </div>
    </div>
  );
}

