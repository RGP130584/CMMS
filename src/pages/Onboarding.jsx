import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { validarCPF, validarCNPJ } from '../utils/validadores';

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

  function selecionarTipo(tipo) {
    setTipoDocumento(tipo);
    setDocumento('');
    setEtapa('documento');
  }

  function avancarDocumento() {
    setErro('');
    const doc = documento.replace(/\D/g, '');

    if (tipoDocumento === 'cpf' && !validarCPF(doc)) {
      setErro('CPF inválido');
      return;
    }
    if (tipoDocumento === 'cnpj' && !validarCNPJ(doc)) {
      setErro('CNPJ inválido');
      return;
    }

    setDocumento(doc);
    setEtapa('propriedade');
  }

  async function finalizar() {
    setErro('');
    if (!nomePropriedade.trim()) {
      setErro('Informe o nome da frota, oficina ou empresa');
      return;
    }
    if (!nome.trim() || !email.trim() || !senha.trim()) {
      setErro('Preencha todos os campos');
      return;
    }
    if (senha.length < 6) {
      setErro('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    try {
      await onboarding(
        {
          documento,
          tipo_documento: tipoDocumento,
          razao_social_ou_nome_titular: razaoSocial,
          nome_propriedade: nomePropriedade,
          tipo_propriedade: tipoPropriedade,
        },
        {
          nome,
          email,
          senha_hash: senha,
        }
      );
      navigate('/');
    } catch (e) {
      setErro(e.message);
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
            <div className="btn-group">
              <button className="btn btn-lg" onClick={() => selecionarTipo('cnpj')}>
                Pessoa Jurídica (CNPJ)
              </button>
              <button className="btn btn-lg" onClick={() => selecionarTipo('cpf')}>
                Pessoa Física / Autônomo (CPF)
              </button>
            </div>
          </>
        )}

        {etapa === 'documento' && (
          <>
            <h2>Informe seu {tipoDocumento === 'cpf' ? 'CPF' : 'CNPJ'}</h2>
            <input
              type="text"
              className="input-lg"
              placeholder={tipoDocumento === 'cpf' ? '000.000.000-00' : '00.000.000/0000-00'}
              value={documento}
              onChange={(e) => setDocumento(e.target.value)}
              maxLength={tipoDocumento === 'cpf' ? 14 : 18}
              inputMode="numeric"
            />
            <input
              type="text"
              className="input"
              placeholder="Razão social / nome da empresa"
              value={razaoSocial}
              onChange={(e) => setRazaoSocial(e.target.value)}
            />
            {erro && <p className="erro">{erro}</p>}
            <div className="btn-group">
              <button className="btn btn-secondary" onClick={() => setEtapa('tipo')}>
                Voltar
              </button>
              <button className="btn" onClick={avancarDocumento}>
                Avançar
              </button>
            </div>
          </>
        )}

        {etapa === 'propriedade' && (
          <>
            <h2>Identificação da Frota / Oficina</h2>
            <input
              type="text"
              className="input"
              placeholder="Nome da Frota ou Oficina (ex: Oficina Central, Frota Agrícola)"
              value={nomePropriedade}
              onChange={(e) => setNomePropriedade(e.target.value)}
            />
            <label className="label" style={{ marginTop: 8 }}>Tipo de Operação</label>
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
            <h2 style={{ marginTop: 16 }}>Dados do Administrador</h2>
            <input
              type="text"
              className="input"
              placeholder="Seu nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
            <input
              type="email"
              className="input"
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              className="input"
              placeholder="Senha (mín. 6 caracteres)"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
            {erro && <p className="erro">{erro}</p>}
            <div className="btn-group">
              <button className="btn btn-secondary" onClick={() => setEtapa('documento')}>
                Voltar
              </button>
              <button className="btn" onClick={finalizar}>
                Criar conta
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
