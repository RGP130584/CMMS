import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import db from '../db/database';
import { validarEmail } from '../utils/validadores';

export default function UsuariosEquipe() {
  const { empresa, usuario, cadastrarUsuarioEquipe } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [mostrarModalNovo, setMostrarModalNovo] = useState(false);

  // Novo usuário
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [perfil, setPerfil] = useState('operador'); // admin | responsavel | operador
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [salvando, setSalvando] = useState(false);

  async function carregarUsuarios() {
    if (!empresa) return;
    const lista = await db.usuario
      .where('empresa_id')
      .equals(empresa.id)
      .toArray();
    setUsuarios(lista);
  }

  useEffect(() => {
    carregarUsuarios();
  }, [empresa]);

  async function handleSalvarUsuario(e) {
    e.preventDefault();
    setErro('');
    setSucesso('');

    if (!nome.trim()) {
      setErro('Informe o nome do colaborador.');
      return;
    }
    if (!email.trim() || !validarEmail(email)) {
      setErro('Informe um e-mail válido.');
      return;
    }
    if (!senha.trim() || senha.length < 6) {
      setErro('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setSalvando(true);
    try {
      await cadastrarUsuarioEquipe({
        nome: nome.trim(),
        email: email.trim().toLowerCase(),
        senha: senha.trim(),
        perfil,
      });

      setNome('');
      setEmail('');
      setSenha('');
      setPerfil('operador');
      setMostrarModalNovo(false);
      setSucesso('Usuário cadastrado com sucesso!');
      await carregarUsuarios();
      setTimeout(() => setSucesso(''), 4000);
    } catch (err) {
      setErro(err.message || 'Erro ao cadastrar usuário');
    } finally {
      setSalvando(false);
    }
  }

  async function alternarStatusUsuario(u) {
    if (u.id === usuario?.id) {
      alert('Você não pode desativar seu próprio usuário atual.');
      return;
    }
    const novoStatus = !u.ativo;
    await db.usuario.update(u.id, { ativo: novoStatus });
    await carregarUsuarios();
  }

  function getBadgePerfil(p) {
    switch (p) {
      case 'admin':
        return { label: '👑 Administrador Geral', bg: '#eff6ff', color: '#1d4ed8' };
      case 'responsavel':
        return { label: '🔧 Mecânico / Responsável', bg: '#f0fdf4', color: '#166534' };
      case 'operador':
      default:
        return { label: '🚜 Operador / Motorista', bg: '#fef3c7', color: '#b45309' };
    }
  }

  return (
    <div className="page" style={{ maxWidth: '860px', margin: '0 auto', paddingBottom: '3rem' }}>
      <header className="header">
        <Link to="/" className="btn btn-sm btn-secondary">
          ← Início
        </Link>
        <h1>Equipe & Usuários</h1>
        <button
          type="button"
          className="btn btn-sm btn-primary"
          onClick={() => {
            setMostrarModalNovo(!mostrarModalNovo);
            setErro('');
          }}
        >
          {mostrarModalNovo ? '✕ Fechar' : '➕ Novo Colaborador'}
        </button>
      </header>

      <p className="text-muted" style={{ marginBottom: '1.25rem', fontSize: '0.9rem' }}>
        Gerencie os operadores, mecânicos e administradores com acesso à frota <strong>{empresa?.nome_propriedade}</strong>.
      </p>

      {sucesso && (
        <div
          style={{
            background: '#e8f5e9',
            color: '#1b5e20',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            marginBottom: '1rem',
            fontWeight: 600,
            border: '1px solid #a5d6a7',
          }}
        >
          ✅ {sucesso}
        </div>
      )}

      {/* Formulário / Modal de Novo Usuário */}
      {mostrarModalNovo && (
        <div
          className="card"
          style={{
            marginBottom: '1.5rem',
            background: '#ffffff',
            border: '2px solid #2e7d32',
            borderRadius: '12px',
            padding: '1.25rem',
            boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
          }}
        >
          <h3 style={{ margin: '0 0 1rem 0', color: '#1b5e20', fontSize: '1.15rem' }}>
            ➕ Cadastrar Novo Usuário na Frota
          </h3>

          <form onSubmit={handleSalvarUsuario}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px', marginBottom: '10px' }}>
              <div className="form-group" style={{ textAlign: 'left' }}>
                <label className="label">Nome Completo *</label>
                <input
                  type="text"
                  className="input"
                  placeholder="Ex: João da Silva"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ textAlign: 'left' }}>
                <label className="label">E-mail de Login *</label>
                <input
                  type="email"
                  className="input"
                  placeholder="Ex: joao.silva@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px', marginBottom: '12px' }}>
              <div className="form-group" style={{ textAlign: 'left' }}>
                <label className="label">Senha Inicial *</label>
                <input
                  type="password"
                  className="input"
                  placeholder="Mínimo 6 caracteres"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ textAlign: 'left' }}>
                <label className="label">Função / Perfil de Acesso *</label>
                <select
                  className="input"
                  value={perfil}
                  onChange={(e) => setPerfil(e.target.value)}
                >
                  <option value="operador">🚜 Operador / Motorista (Lança horímetro e problemas)</option>
                  <option value="responsavel">🔧 Mecânico / Responsável (Executa O.S. e revisões)</option>
                  <option value="admin">👑 Administrador (Acesso total)</option>
                </select>
              </div>
            </div>

            {erro && <p className="erro" style={{ marginBottom: '0.75rem' }}>{erro}</p>}

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={salvando}
                style={{ flex: 1 }}
              >
                {salvando ? 'Salvando...' : '💾 Cadastrar Colaborador'}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setMostrarModalNovo(false)}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de Usuários Cadastrados */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <h2 style={{ fontSize: '1.05rem', margin: 0 }}>
          Colaboradores Ativos ({usuarios.length})
        </h2>
        <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
          Armazenamento Local Offline
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {usuarios.map((u) => {
          const badge = getBadgePerfil(u.perfil);
          const ehVoce = u.id === usuario?.id;

          return (
            <div
              key={u.id}
              className="card"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem 1.25rem',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                background: u.ativo ? '#ffffff' : '#f8fafc',
                opacity: u.ativo ? 1 : 0.7,
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <strong style={{ fontSize: '1rem', color: '#1e293b' }}>{u.nome}</strong>
                  {ehVoce && (
                    <span
                      style={{
                        fontSize: '0.7rem',
                        background: '#e0f2fe',
                        color: '#0369a1',
                        padding: '1px 6px',
                        borderRadius: '4px',
                        fontWeight: 700,
                      }}
                    >
                      (Você)
                    </span>
                  )}
                </div>

                <div style={{ fontSize: '0.85rem', color: '#64748b', fontFamily: 'monospace' }}>
                  ✉️ {u.email}
                </div>

                <div style={{ marginTop: '6px' }}>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      padding: '2px 8px',
                      borderRadius: '4px',
                      background: badge.bg,
                      color: badge.color,
                      border: `1px solid ${badge.color}33`,
                    }}
                  >
                    {badge.label}
                  </span>
                </div>
              </div>

              <div>
                <button
                  type="button"
                  className="btn btn-sm btn-secondary"
                  onClick={() => alternarStatusUsuario(u)}
                  disabled={ehVoce}
                  style={{
                    fontSize: '0.78rem',
                    color: u.ativo ? '#b91c1c' : '#166534',
                    background: u.ativo ? '#fef2f2' : '#f0fdf4',
                    border: `1px solid ${u.ativo ? '#fca5a5' : '#86efac'}`,
                  }}
                >
                  {u.ativo ? 'Desativar' : 'Ativar'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
