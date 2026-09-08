import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import db from '../../db/database';

export default function ListaFabricantes() {
  const [fabricantes, setFabricantes] = useState([]);
  const [busca, setBusca] = useState('');

  useEffect(() => {
    carregar();
  }, [busca]);

  async function carregar() {
    let colecao = db.fabricante.orderBy('nome');
    if (busca) {
      colecao = db.fabricante.where('nome').startsWithIgnoreCase(busca);
    }
    setFabricantes(await colecao.toArray());
  }

  return (
    <div className="page">
      <header className="header">
        <Link to="/catalogos" className="btn btn-sm btn-secondary">← Voltar</Link>
        <h1>Fabricantes</h1>
        <Link to="/catalogo/fabricante/novo" className="btn btn-sm">+ Novo</Link>
      </header>

      <input
        type="search"
        className="input"
        placeholder="Buscar fabricante..."
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
      />

      {fabricantes.length === 0 ? (
        <div className="vazio">
          <p>Nenhum fabricante cadastrado</p>
          <Link to="/catalogo/fabricante/novo" className="btn">Cadastrar primeiro fabricante</Link>
        </div>
      ) : (
        <div className="card-list">
          {fabricantes.map((f) => (
            <Link key={f.id} to={`/catalogo/fabricante/${f.id}`} className="maquina-card">
              <h3>{f.nome}</h3>
              <p className="text-muted">{f.pais || 'País não informado'}</p>
              {f.site && <p className="text-sm mt-1">{f.site}</p>}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
