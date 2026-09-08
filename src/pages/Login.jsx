import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const { login, loginRapidoDemo } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [entrandoDemo, setEntrandoDemo] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setErro('');
    try {
      await login(email, senha);
      navigate('/');
    } catch (err) {
      setErro(err.message);
    }
  }

  async function handleDemoLogin() {
    setErro('');
    setEntrandoDemo(true);
    try {
      await loginRapidoDemo();
      navigate('/');
    } catch (err) {
      setErro(err.message || 'Erro ao entrar em modo demonstração');
    } finally {
      setEntrandoDemo(false);
    }
  }

  return (
    <div className="page onboarding">
      <div className="onboarding-card">
        <h1>CMMS</h1>
        <p className="subtitle">Gestão de Manutenção de Máquinas Agrícolas</p>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            className="input"
            placeholder="E-mail (ex: admin@cmms.com)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            className="input"
            placeholder="Senha (ex: 123456)"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
          />
          {erro && <p className="erro">{erro}</p>}
          <button type="submit" className="btn btn-lg" style={{ width: '100%' }}>
            Entrar
          </button>
        </form>

        <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color, #e2e8f0)' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleDemoLogin}
            disabled={entrandoDemo}
            style={{ width: '100%', marginBottom: '0.75rem', fontWeight: 600 }}
          >
            {entrandoDemo ? 'Carregando...' : '🚀 Entrar com Acesso Rápido'}
          </button>
          <div style={{ fontSize: '0.82rem', color: '#64748b', background: '#f8fafc', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px dashed #cbd5e1' }}>
            <strong>💡 Acesso Padrão / Offline:</strong><br />
            E-mail: <code>admin@cmms.com</code> | Senha: <code>123456</code>
          </div>
        </div>

        <p className="mt-1" style={{ marginTop: '1rem' }}>
          Primeiro acesso?{' '}
          <Link to="/onboarding">Criar propriedade / empresa</Link>
        </p>
      </div>
    </div>
  );
}
