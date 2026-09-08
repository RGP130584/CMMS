import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setErro('');
    setCarregando(true);
    try {
      await login(email, senha);
      navigate('/');
    } catch (err) {
      setErro(err.message || 'Erro ao efetuar login');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="page onboarding">
      <div className="onboarding-card">
        <h1>CMMS</h1>
        <p className="subtitle">Gestão de Manutenção de Máquinas & Frotas</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" style={{ textAlign: 'left' }}>E-mail</label>
            <input
              type="email"
              className="input"
              placeholder="Digite seu e-mail de acesso"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              required
            />
          </div>

          <div className="form-group" style={{ marginTop: '0.75rem' }}>
            <label className="form-label" style={{ textAlign: 'left' }}>Senha</label>
            <input
              type="password"
              className="input"
              placeholder="Digite sua senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          {erro && <p className="erro" style={{ marginTop: '0.75rem' }}>{erro}</p>}

          <button
            type="submit"
            className="btn btn-lg"
            disabled={carregando}
            style={{ width: '100%', marginTop: '1.25rem' }}
          >
            {carregando ? 'Entrando...' : 'Entrar no Sistema'}
          </button>
        </form>

        <p className="mt-1" style={{ marginTop: '1.5rem', fontSize: '0.9rem' }}>
          Primeiro acesso?{' '}
          <Link to="/onboarding" style={{ fontWeight: 600 }}>Cadastrar Propriedade / Frota</Link>
        </p>
      </div>
    </div>
  );
}
