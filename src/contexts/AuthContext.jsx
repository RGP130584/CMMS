import { createContext, useContext, useState, useEffect } from 'react';
import db from '../db/database';
import { hashSenha } from '../utils/seguranca';
import { inicializarCatalogoPadraoSeVazio } from '../db/catalogoPadrao';
import { garantirDadosIniciais, solicitarPersistenciaArmazenamento } from '../utils/seed';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [empresa, setEmpresa] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregar() {
      try {
        await solicitarPersistenciaArmazenamento();

        // Garante que o catálogo e o usuário padrão estejam prontos
        try {
          await inicializarCatalogoPadraoSeVazio();
          await garantirDadosIniciais();
        } catch (eCat) {
          console.warn('Aviso ao inicializar dados padrão:', eCat);
        }

        const empresaId = localStorage.getItem('empresa_id');
        const usuarioId = localStorage.getItem('usuario_id');

        if (empresaId && usuarioId) {
          const emp = await db.empresa.get(Number(empresaId));
          const usr = await db.usuario.get(Number(usuarioId));
          if (emp && usr) {
            setEmpresa(emp);
            setUsuario(usr);
          } else {
            localStorage.removeItem('empresa_id');
            localStorage.removeItem('usuario_id');
            setEmpresa(null);
            setUsuario(null);
          }
        }
      } catch (err) {
        console.error('Erro ao carregar estado de autenticação:', err);
      } finally {
        setCarregando(false);
      }
    }
    carregar();
  }, []);

  async function login(email, senha) {
    const emailLimpo = email.trim().toLowerCase();
    // Busca qualquer usuário cadastrado no banco local offline de forma case-insensitive
    const usr = await db.usuario
      .filter((u) => u.email && u.email.trim().toLowerCase() === emailLimpo)
      .first();

    if (!usr) {
      throw new Error('E-mail ou senha inválidos');
    }
    const senhaHashed = await hashSenha(senha);
    // Suporta tanto senhas legadas quanto senhas com hash criptográfico
    if (usr.senha_hash !== senhaHashed && usr.senha_hash !== senha) {
      throw new Error('E-mail ou senha inválidos');
    }
    if (!usr.ativo) {
      throw new Error('Usuário desativado');
    }
    const emp = await db.empresa.get(usr.empresa_id);
    setUsuario(usr);
    setEmpresa(emp);
    localStorage.setItem('empresa_id', emp?.id || usr.empresa_id);
    localStorage.setItem('usuario_id', usr.id);
  }

  async function loginRapidoDemo() {
    await garantirDadosIniciais();
    const usr = await db.usuario.first();
    if (!usr) {
      throw new Error('Nenhum usuário cadastrado');
    }
    const emp = await db.empresa.get(usr.empresa_id);
    setUsuario(usr);
    setEmpresa(emp);
    localStorage.setItem('empresa_id', emp.id);
    localStorage.setItem('usuario_id', usr.id);
  }

  async function onboarding(dadosEmpresa, dadosUsuario) {
    if (!dadosUsuario.nome || !dadosUsuario.nome.trim()) {
      throw new Error('O nome do usuário é obrigatório');
    }
    if (!dadosUsuario.email || !dadosUsuario.email.trim()) {
      throw new Error('O e-mail é obrigatório para o cadastro');
    }

    const emailLimpo = dadosUsuario.email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(emailLimpo)) {
      throw new Error('Por favor, informe um endereço de e-mail válido (ex: seu.nome@empresa.com)');
    }

    if (!dadosUsuario.senha_hash || dadosUsuario.senha_hash.length < 6) {
      throw new Error('A senha deve conter no mínimo 6 caracteres');
    }

    // Verifica duplicidade de e-mail no sistema
    const existingUsuario = await db.usuario
      .filter((u) => u.email && u.email.trim().toLowerCase() === emailLimpo)
      .first();
    if (existingUsuario) {
      throw new Error('Este e-mail já está cadastrado no sistema');
    }

    // Verifica duplicidade de documento se informado
    const docLimpo = dadosEmpresa.documento?.replace(/\D/g, '');
    if (docLimpo) {
      const existingEmpresa = await db.empresa
        .where('documento')
        .equals(docLimpo)
        .first();
      if (existingEmpresa) {
        throw new Error('Este documento (CPF/CNPJ) já está cadastrado');
      }
    }

    const senhaHashed = await hashSenha(dadosUsuario.senha_hash);

    const empresaId = await db.empresa.add({
      ...dadosEmpresa,
      documento: docLimpo || dadosEmpresa.documento,
      criado_em: new Date().toISOString(),
    });

    const usuarioId = await db.usuario.add({
      empresa_id: empresaId,
      nome: dadosUsuario.nome.trim(),
      email: emailLimpo,
      senha_hash: senhaHashed,
      perfil: 'admin',
      ativo: true,
      criado_em: new Date().toISOString(),
    });

    const emp = await db.empresa.get(empresaId);
    const usr = await db.usuario.get(usuarioId);

    setEmpresa(emp);
    setUsuario(usr);
    localStorage.setItem('empresa_id', String(empresaId));
    localStorage.setItem('usuario_id', String(usuarioId));
  }

  async function cadastrarUsuarioEquipe(dados) {
    if (!empresa) throw new Error('Nenhuma empresa ativa selecionada');
    if (!dados.nome || !dados.nome.trim()) throw new Error('Nome é obrigatório');
    if (!dados.email || !dados.email.trim()) throw new Error('E-mail é obrigatório');

    const emailLimpo = dados.email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(emailLimpo)) {
      throw new Error('E-mail inválido');
    }

    const existingUsuario = await db.usuario
      .filter((u) => u.email && u.email.trim().toLowerCase() === emailLimpo)
      .first();
    if (existingUsuario) {
      throw new Error('Este e-mail já está cadastrado');
    }

    const senhaHashed = await hashSenha(dados.senha || '123456');

    const novoId = await db.usuario.add({
      empresa_id: empresa.id,
      nome: dados.nome.trim(),
      email: emailLimpo,
      senha_hash: senhaHashed,
      perfil: dados.perfil || 'operador', // admin | responsavel | operador
      ativo: true,
      criado_em: new Date().toISOString(),
    });

    return await db.usuario.get(novoId);
  }

  function logout() {
    setUsuario(null);
    setEmpresa(null);
    localStorage.removeItem('empresa_id');
    localStorage.removeItem('usuario_id');
  }

  return (
    <AuthContext.Provider
      value={{
        usuario,
        empresa,
        login,
        loginRapidoDemo,
        onboarding,
        cadastrarUsuarioEquipe,
        logout,
        carregando,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
}
