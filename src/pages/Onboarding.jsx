import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { validarCPF, validarCNPJ, validarEmail, formatarDocumento } from '../utils/validadores';

export default function Onboarding() {
  const { onboarding } = useAuth();
  const navigate = useNavigate();
  const [etapa, setEtapa] = useState('tipo');
  const [tipoDocumento, setTipoDocumento] = useState('');
  const [documento, setDocumento] = useState('');
  const [razaoSocial, setRazaoSocial] = useState('');
  const [nomePropriedade, setNomePropriedade] = useState('');
  const [tipoPropriedade, setTipoPropriedade] = useState('frota');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  function selecionarTipo(tipo) {
    setTipoDocumento(tipo);
    setDocumento('');
    setEtapa('documento');
  }

  function handleDocumentoChange(e) {
    const val = e.target.value;
    setDocumento(formatarDocumento(val));
  }

  function avancarDocumento(e) {
    if (e) e.preventDefault();
    setErro('');
    const doc = documento.replace(/\D/g, '');

    if (!doc) {
      setErro(`Informe o número do ${tipoDocumento === 'cpf' ? 'CPF' : 'CNPJ'}`);
      return;
    }

    if (tipoDocumento === 'cpf' && !validarCPF(doc)) {
      setErro('CPF inválido. Por favor, verifique os dígitos.');
      return;
    }
    if (tipoDocumento === 'cnpj' && !validarCNPJ(doc)) {
      setErro('CNPJ inválido. Por favor, verifique os dígitos.');
      return;
    }

    setEtapa('propriedade');
  }

  async function finalizar(e) {
    if (e) e.preventDefault();
    setErro('');

    if (!nomePropriedade.trim()) {
      setErro('Informe o nome da frota, oficina ou empresa.');
      return;
    }
    if (!nome.trim()) {
      setErro('Informe o seu nome completo.');
      return;
    }
    if (!email.trim() || !validarEmail(email)) {
      setErro('Informe um endereço de e-mail válido (ex: seu.nome@empresa.com).');
      return;
    }
    if (!senha.trim() || senha.length < 6) {
      setErro('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setSalvando(true);
    try {
      const docLimpo = documento.replace(/\D/g, '');
      await onboarding(
        {
          documento: docLimpo,
          tipo_documento: tipoDocumento,
          razao_social_ou_nome_titular: razaoSocial.trim() || nomePropriedade.trim(),
          nome_propriedade: nomePropriedade.trim(),
          tipo_propriedade: tipoPropriedade,
        },
        {
          nome: nome.trim(),
          email: email.trim().toLowerCase(),
          senha_hash: senha,
        }
      );
      navigate('/');
    } catch (err) {
      setErro(err.message || 'Erro ao realizar cadastro');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="page onboarding">
      <div className="onboarding-card">
        <h1>CMMS</h1>
        <p className="subtitle">Gestão de Manutenção de Frotas, Oficinas e Máquinas Pesadas</p>

        {etapa === 'tipo' && (
          <>
            <h2>Como sua empresa / oficina está registrada?</h2>
            <div className="btn-group" style={{ flexDirection: 'column', gap: '10px' }}>
              <button type="button" className="btn btn-lg" onClick={() => selecionarTipo('cnpj')}>
                🏢 Pessoa Jurídica (CNPJ)
              </button>
              <button type="button" className="btn btn-lg" onClick={() => selecionarTipo('cpf')}>
                👤 Pessoa Física / Autônomo (CPF)
              </button>
            </div>
          </>
        )}

        {etapa === 'documento' && (
          <form onSubmit={avancarDocumento}>
            <h2>Informe seu {tipoDocumento === 'cpf' ? 'CPF' : 'CNPJ'}</h2>
            <input
              type="text"
              className="input-lg"
              placeholder={tipoDocumento === 'cpf' ? '000.000.000-00' : '00.000.000/0000-00'}
              value={documento}
              onChange={handleDocumentoChange}
              maxLength={tipoDocumento === 'cpf' ? 14 : 18}
              inputMode="numeric"
              autoFocus
              required
            />
            <input
              type="text"
              className="input"
              placeholder="Razão social / Nome completo da empresa"
              value={razaoSocial}
              onChange={(e) => setRazaoSocial(e.target.value)}
            />
            {erro && <p className="erro">{erro}</p>}
            <div className="btn-group">
              <button type="button" className="btn btn-secondary" onClick={() => setEtapa('tipo')}>
                Voltar
              </button>
              <button type="submit" className="btn">
                Avançar
              </button>
            </div>
          </form>
        )}

        {etapa === 'propriedade' && (
          <form onSubmit={finalizar}>
            <h2>Identificação da Frota / Oficina</h2>
            <div className="form-group" style={{ textAlign: 'left', marginBottom: '8px' }}>
              <label className="label">Nome da Frota ou Oficina *</label>
              <input
                type="text"
                className="input"
                placeholder="Ex: Oficina Central, Frota Agrícola, TransGrãos"
                value={nomePropriedade}
                onChange={(e) => setNomePropriedade(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ textAlign: 'left', marginBottom: '14px' }}>
              <label className="label">Tipo de Operação</label>
              <select
                className="input"
                value={tipoPropriedade}
                onChange={(e) => setTipoPropriedade(e.target.value)}
              >
                <option value="frota">🚛 Frota / Transportadora / Logística</option>
                <option value="oficina">🔧 Oficina Mecânica / Concessionária</option>
                <option value="fazenda">🌾 Propriedade Rural / Agronegócio</option>
                <option value="servicos">🚜 Prestador de Serviços / Locação</option>
              </select>
            </div>

            <h2 style={{ marginTop: '16px' }}>Dados do Administrador</h2>

            <div className="form-group" style={{ textAlign: 'left', marginBottom: '8px' }}>
              <label className="label">Seu Nome Completo *</label>
              <input
                type="text"
                className="input"
                placeholder="Digite seu nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ textAlign: 'left', marginBottom: '8px' }}>
              <label className="label">E-mail de Acesso (Obrigatório) *</label>
              <input
                type="email"
                className="input"
                placeholder="exemplo@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                required
              />
            </div>

            <div className="form-group" style={{ textAlign: 'left', marginBottom: '8px' }}>
              <label className="label">Senha de Acesso (Mínimo 6 caracteres) *</label>
              <input
                type="password"
                className="input"
                placeholder="Crie uma senha segura"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                autoComplete="new-password"
                required
              />
            </div>

            {erro && <p className="erro">{erro}</p>}

            <div className="btn-group" style={{ marginTop: '14px' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setEtapa('documento')}>
                Voltar
              </button>
              <button type="submit" className="btn" disabled={salvando}>
                {salvando ? 'Cadastrando...' : 'Criar Conta'}
              </button>
            </div>
          </form>
        )}

        <p className="mt-1" style={{ marginTop: '1.25rem', fontSize: '0.85rem' }}>
          Já possui cadastro? <Link to="/login" style={{ fontWeight: 600 }}>Entrar no sistema</Link>
        </p>
      </div>
    </div>
  );
}
