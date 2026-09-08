import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import db from '../../db/database';

export default function ListaFontes() {
  const [searchParams] = useSearchParams();
  const fabricanteFiltro = searchParams.get('fabricante');
  const [fontes, setFontes] = useState([]);
  const [fabricantes, setFabricantes] = useState({});

  useEffect(() => {
    carregar();
  }, [fabricanteFiltro]);

  async function carregar() {
    let consulta;
    if (fabricanteFiltro) {
      consulta = db.fonteCatalogo.where('fabricante_id').equals(Number(fabricanteFiltro));
    } else {
      consulta = db.fonteCatalogo.toCollection();
    }
    const lista = await consulta.toArray();
    setFontes(lista);

    const fabIds = [...new Set(lista.map(f => f.fabricante_id))];
    const fabs = {};
    for (const fid of fabIds) {
      const fab = await db.fabricante.get(fid);
      if (fab) fabs[fid] = fab.nome;
    }
    setFabricantes(fabs);
  }

  return (
    <div className="page">
      <header className="header">
        <Link to="/catalogos" className="btn btn-sm btn-secondary">← Voltar</Link>
        <h1>Fontes de catálogo</h1>
        <Link to="/catalogo/fonte/nova" className="btn btn-sm">+ Nova</Link>
      </header>

      {fontes.length === 0 ? (
        <div className="vazio">
          <p>Nenhuma fonte cadastrada</p>
          <Link to="/catalogo/fonte/nova" className="btn">Cadastrar primeira fonte</Link>
        </div>
      ) : (
        <div className="card-list">
          {fontes.map((f) => (
            <Link key={f.id} to={`/catalogo/fonte/${f.id}`} className="maquina-card">
              <div className="maquina-card-header">
                <h3>{f.nome}</h3>
                <span className={`status-dot`} style={{ background: f.status === 'ativo' ? 'var(--verde)' : 'var(--vermelho)' }} />
              </div>
              <p className="text-muted">{fabricantes[f.fabricante_id] || 'Fabricante desconhecido'}</p>
              <p className="text-sm mt-1">{f.tipo} — {f.url || 'Sem URL'}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
