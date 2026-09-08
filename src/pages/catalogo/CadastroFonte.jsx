import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import db from '../../db/database';

export default function CadastroFonte() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fabricanteInicial = searchParams.get('fabricante') || '';

  const [fabricantes, setFabricantes] = useState([]);
  const [fabricanteId, setFabricanteId] = useState(fabricanteInicial);
  const [nome, setNome] = useState('');
  const [marca, setMarca] = useState('');
  const [tipo, setTipo] = useState('Catálogo oficial público');
  const [url, setUrl] = useState('');
  const [metodoAcesso, setMetodoAcesso] = useState('Público');
  const [necessitaAutenticacao, setNecessitaAutenticacao] = useState(false);
  const [autorizacao, setAutorizacao] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [erro, setErro] = useState('');

  const tipos = [
    'Catálogo oficial público',
    'Catálogo oficial com acesso autorizado',
    'Arquivo fornecido pelo cliente',
    'Integração autorizada',
  ];

  useEffect(() => {
    db.fabricante.orderBy('nome').toArray().then(setFabricantes);
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setErro('');

    if (!fabricanteId) { setErro('Selecione o fabricante'); return; }
    if (!nome.trim()) { setErro('Nome da fonte é obrigatório'); return; }

    await db.fonteCatalogo.add({
      fabricante_id: Number(fabricanteId),
      nome: nome.trim(),
      marca: marca.trim() || null,
      tipo,
      url: url.trim() || null,
      metodo_acesso: metodoAcesso,
      necessita_autenticacao: necessitaAutenticacao,
      autorizacao: autorizacao.trim() || null,
      observacoes,
      status: 'ativo',
      ultima_verificacao: null,
      criado_em: new Date().toISOString(),
    });

    navigate(fabricanteId ? `/catalogo/fabricante/${fabricanteId}` : '/catalogo/fontes');
  }

  return (
    <div className="page">
      <header className="header">
        <Link to="/catalogo/fontes" className="btn btn-sm btn-secondary">← Voltar</Link>
        <h1>Nova fonte</h1>
        <span />
      </header>

      <form className="form-centro" onSubmit={handleSubmit}>
        <label className="label">Fabricante *</label>
        <select className="input" value={fabricanteId} onChange={(e) => setFabricanteId(e.target.value)}>
          <option value="">Selecione o fabricante</option>
          {fabricantes.map((f) => (
            <option key={f.id} value={f.id}>{f.nome}</option>
          ))}
        </select>

        <label className="label">Nome da fonte *</label>
        <input type="text" className="input" placeholder="Ex: Catálogo Digital de Peças" value={nome} onChange={(e) => setNome(e.target.value)} />

        <label className="label">Marca</label>
        <input type="text" className="input" placeholder="Ex: John Deere (se diferente do fabricante)" value={marca} onChange={(e) => setMarca(e.target.value)} />

        <label className="label">Tipo de fonte</label>
        <select className="input" value={tipo} onChange={(e) => setTipo(e.target.value)}>
          {tipos.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>

        <label className="label">URL</label>
        <input type="url" className="input" placeholder="https://..." value={url} onChange={(e) => setUrl(e.target.value)} />

        <label className="label">Método de acesso</label>
        <select className="input" value={metodoAcesso} onChange={(e) => setMetodoAcesso(e.target.value)}>
          <option>Público</option>
          <option>Login</option>
          <option>Licença</option>
          <option>Concessionária</option>
          <option>Contrato</option>
          <option>Autorização específica</option>
        </select>

        <label className="label">
          <input type="checkbox" checked={necessitaAutenticacao} onChange={(e) => setNecessitaAutenticacao(e.target.checked)} style={{ marginRight: 8 }} />
          Necessita autenticação
        </label>

        <label className="label">Autorização / Licença</label>
        <input type="text" className="input" placeholder="Descreva a autorização, se houver" value={autorizacao} onChange={(e) => setAutorizacao(e.target.value)} />

        <label className="label">Observações</label>
        <textarea className="input" placeholder="Opcional" value={observacoes} onChange={(e) => setObservacoes(e.target.value)} rows={3} />

        {erro && <p className="erro">{erro}</p>}

        <button type="submit" className="btn btn-lg">Cadastrar fonte</button>
      </form>
    </div>
  );
}
