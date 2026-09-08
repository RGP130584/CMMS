import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');

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

  return (
    <div className="page onboarding">
      <div className="onboarding-card">
        <h1>CMMS</h1>
        <p className="subtitle">Gestão de Manutenção de Máquinas Agrícolas</p>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            className="input"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            className="input"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
          />
          {erro && <p className="erro">{erro}</p>}
          <button type="submit" className="btn btn-lg">
            Entrar
          </button>
        </form>
        <p className="mt-1">
          Primeiro acesso?{' '}
          <Link to="/onboarding">Criar propriedade</Link>
        </p>
      </div>
    </div>
  );
}
