import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import db from '../../db/database';

export default function CadastroFabricante() {
  const navigate = useNavigate();
  const [nome, setNome] = useState('');
  const [pais, setPais] = useState('');
  const [site, setSite] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [erro, setErro] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setErro('');

    if (!nome.trim()) {
      setErro('Nome do fabricante é obrigatório');
      return;
    }

    const existente = await db.fabricante.where('nome').equals(nome.trim()).first();
    if (existente) {
      setErro('Fabricante já cadastrado');
      return;
    }

    await db.fabricante.add({
      nome: nome.trim(),
      pais: pais.trim() || null,
      site: site.trim() || null,
      observacoes,
      criado_em: new Date().toISOString(),
    });

    navigate('/catalogo/fabricantes');
  }

  return (
    <div className="page">
      <header className="header">
        <Link to="/catalogo/fabricantes" className="btn btn-sm btn-secondary">← Voltar</Link>
        <h1>Novo fabricante</h1>
        <span />
      </header>

      <form className="form-centro" onSubmit={handleSubmit}>
        <label className="label">Nome do fabricante *</label>
        <input type="text" className="input" placeholder="Ex: John Deere" value={nome} onChange={(e) => setNome(e.target.value)} />

        <label className="label">País de origem</label>
        <input type="text" className="input" placeholder="Ex: Estados Unidos" value={pais} onChange={(e) => setPais(e.target.value)} />

        <label className="label">Site oficial</label>
        <input type="url" className="input" placeholder="Ex: https://www.deere.com.br" value={site} onChange={(e) => setSite(e.target.value)} />

        <label className="label">Observações</label>
        <textarea className="input" placeholder="Opcional" value={observacoes} onChange={(e) => setObservacoes(e.target.value)} rows={3} />

        {erro && <p className="erro">{erro}</p>}

        <button type="submit" className="btn btn-lg">Cadastrar fabricante</button>
      </form>
    </div>
  );
}
