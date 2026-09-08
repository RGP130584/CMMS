import { Link } from 'react-router-dom';

export default function CatalogoIndex() {
  return (
    <div className="page" style={{ maxWidth: '860px', margin: '0 auto', paddingBottom: '3rem' }}>
      <header className="header">
        <Link to="/" className="btn btn-sm btn-secondary">
          ← Início
        </Link>
        <h1>Catálogo de Peças & Frotas</h1>
        <span />
      </header>

      <p className="text-muted" style={{ marginBottom: '1.25rem', fontSize: '0.9rem', lineHeight: '1.4' }}>
        Consulte códigos OEM, esquemas técnicos, marcas equivalentes e gerencie catálogos de fabricantes.
      </p>

      {/* Seção 1: Consulta & Oficina */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1b5e20', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>🔍</span> Peças, Equivalências & Esquemas
        </h2>

        <div className="nav-grid" style={{ marginBottom: 0 }}>
          <Link to="/catalogo/pesquisar" className="nav-btn" style={{ borderLeft: '4px solid #16a34a' }}>
            <span className="nav-icon">🔍</span>
            <div className="nav-btn-title">Pesquisar Peças</div>
            <div className="nav-btn-desc">Códigos OEM, modelos de máquinas e filtros</div>
          </Link>

          <Link to="/catalogo/equivalencias" className="nav-btn" style={{ borderLeft: '4px solid #0284c7' }}>
            <span className="nav-icon">🔄</span>
            <div className="nav-btn-title">Equivalências</div>
            <div className="nav-btn-desc">Mann, Donaldson, Fleetguard, Tecfil e códigos antigos</div>
          </Link>

          <Link to="/catalogo/diagramas" className="nav-btn" style={{ borderLeft: '4px solid #f59e0b', gridColumn: 'span 2' }}>
            <span className="nav-icon">📐</span>
            <div className="nav-btn-title">Diagramas & Esquemas Técnicos</div>
            <div className="nav-btn-desc">Circuitos hidráulicos, motores, arrefecimento, freios pneumáticos e zoom interativo</div>
          </Link>
        </div>
      </div>

      {/* Seção 2: Gestão & Publicação de Catálogos */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>📦</span> Gestão & Publicação de Peças
        </h2>

        <div className="nav-grid" style={{ marginBottom: 0 }}>
          <Link to="/catalogo/revisao" className="nav-btn">
            <span className="nav-icon">✅</span>
            <div className="nav-btn-title">Revisão de Peças</div>
            <div className="nav-btn-desc">Validar itens pendentes extraídos de manuais</div>
          </Link>

          <Link to="/catalogo/publicar" className="nav-btn">
            <span className="nav-icon">📢</span>
            <div className="nav-btn-title">Publicar Peças</div>
            <div className="nav-btn-desc">Liberar novos itens no catálogo oficial</div>
          </Link>
        </div>
      </div>

      {/* Seção 3: Fabricantes & Fontes */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>🏭</span> Cadastros de Base
        </h2>

        <div className="nav-grid" style={{ marginBottom: 0 }}>
          <Link to="/catalogo/fabricantes" className="nav-btn">
            <span className="nav-icon">🏭</span>
            <div className="nav-btn-title">Fabricantes</div>
            <div className="nav-btn-desc">John Deere, Case, Scania, Massey, Valtra...</div>
          </Link>

          <Link to="/catalogo/fontes" className="nav-btn">
            <span className="nav-icon">📚</span>
            <div className="nav-btn-title">Fontes de Catálogo</div>
            <div className="nav-btn-desc">Manuais em PDF e portais de peças</div>
          </Link>
        </div>
      </div>
    </div>
  );
}
