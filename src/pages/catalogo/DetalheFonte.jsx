import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import db from '../../db/database';

export default function DetalheFonte() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [fonte, setFonte] = useState(null);
  const [fabricante, setFabricante] = useState(null);
  const [arquivos, setArquivos] = useState([]);

  useEffect(() => {
    carregar();
  }, [id]);

  async function carregar() {
    const f = await db.fonteCatalogo.get(Number(id));
    if (!f) { navigate('/catalogo/fontes'); return; }
    setFonte(f);

    const fab = await db.fabricante.get(f.fabricante_id);
    setFabricante(fab);

    setArquivos(await db.catalogoArquivo.where('fonte_id').equals(Number(id)).toArray());
  }

  async function excluir() {
    if (!confirm('Excluir esta fonte e todos os seus arquivos?')) return;
    await db.catalogoArquivo.where('fonte_id').equals(Number(id)).delete();
    await db.fonteCatalogo.delete(Number(id));
    navigate('/catalogo/fontes');
  }

  async function toggleStatus() {
    const novoStatus = fonte.status === 'ativo' ? 'inativo' : 'ativo';
    await db.fonteCatalogo.update(Number(id), { status: novoStatus });
    setFonte({ ...fonte, status: novoStatus });
  }

  if (!fonte) return null;

  return (
    <div className="page">
      <header className="header">
        <Link to="/catalogo/fontes" className="btn btn-sm btn-secondary">← Voltar</Link>
        <h1>{fonte.nome}</h1>
        <span />
      </header>

      <section className="info-grid">
        <div className="info-item">
          <span className="info-label">Fabricante</span>
          {fabricante?.nome || 'Desconhecido'}
        </div>
        <div className="info-item">
          <span className="info-label">Marca</span>
          {fonte.marca || 'Igual ao fabricante'}
        </div>
        <div className="info-item">
          <span className="info-label">Tipo</span>
          {fonte.tipo}
        </div>
        <div className="info-item">
          <span className="info-label">Status</span>
          <span style={{ color: fonte.status === 'ativo' ? 'var(--verde)' : 'var(--vermelho)' }}>
            {fonte.status === 'ativo' ? 'Ativo' : 'Inativo'}
          </span>
        </div>
        <div className="info-item highlight">
          <span className="info-label">URL</span>
          {fonte.url ? <a href={fonte.url} target="_blank" rel="noopener noreferrer">{fonte.url}</a> : 'Não informada'}
        </div>
        <div className="info-item">
          <span className="info-label">Acesso</span>
          {fonte.metodo_acesso}
        </div>
        <div className="info-item">
          <span className="info-label">Autenticação</span>
          {fonte.necessita_autenticacao ? 'Sim' : 'Não'}
        </div>
        {fonte.autorizacao && (
          <div className="info-item highlight">
            <span className="info-label">Autorização</span>
            {fonte.autorizacao}
          </div>
        )}
        <div className="info-item">
          <span className="info-label">Arquivos importados</span>
          {arquivos.length}
        </div>
        <div className="info-item">
          <span className="info-label">Cadastrada em</span>
          {new Date(fonte.criado_em).toLocaleDateString('pt-BR')}
        </div>
        {fonte.ultima_verificacao && (
          <div className="info-item">
            <span className="info-label">Última verificação</span>
            {new Date(fonte.ultima_verificacao).toLocaleDateString('pt-BR')}
          </div>
        )}
      </section>

      <div className="btn-group">
        <Link to={`/catalogo/fonte/${id}/upload`} className="btn">Importar catálogo</Link>
        <button type="button" className="btn btn-secondary" onClick={toggleStatus}>
          {fonte.status === 'ativo' ? 'Desativar' : 'Ativar'}
        </button>
        <button type="button" className="btn btn-secondary" onClick={excluir}>Excluir</button>
      </div>

      {arquivos.length > 0 && (
        <>
          <h2 style={{ marginTop: 24, marginBottom: 8 }}>Arquivos importados</h2>
          <div className="card-list">
            {arquivos.map((a) => (
              <div key={a.id} className="maquina-card">
                <h3>{a.arquivo_nome}</h3>
                <p className="text-muted">Versão: {a.versao || 'Não informada'}</p>
                <p className="text-sm">Hash: {a.hash?.substring(0, 16)}...</p>
                <p className="text-sm">Status: {a.status}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
