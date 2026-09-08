import { createContext, useContext, useState, useEffect } from 'react';
import db from '../db/database';
import { hashSenha } from '../utils/seguranca';
import { inicializarCatalogoPadraoSeVazio } from '../db/catalogoPadrao';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [empresa, setEmpresa] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregar() {
      try {
        // Garante que o catálogo padrão de peças esteja disponível
        try {
          await inicializarCatalogoPadraoSeVazio();
        } catch (eCat) {
          console.warn('Aviso ao inicializar catálogo padrão:', eCat);
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
    const usr = await db.usuario.where('email').equals(email.trim()).first();
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
    localStorage.setItem('empresa_id', emp.id);
    localStorage.setItem('usuario_id', usr.id);
  }

  async function onboarding(dadosEmpresa, dadosUsuario) {
    const existingEmpresa = await db.empresa
      .where('documento')
      .equals(dadosEmpresa.documento)
      .first();
    if (existingEmpresa) {
      throw new Error('Este documento já está cadastrado');
    }

    const senhaHashed = await hashSenha(dadosUsuario.senha_hash);

    const empresaId = await db.empresa.add({
      ...dadosEmpresa,
      criado_em: new Date().toISOString(),
    });

    const usuarioId = await db.usuario.add({
      empresa_id: empresaId,
      ...dadosUsuario,
      senha_hash: senhaHashed,
      perfil: 'admin',
      ativo: true,
    });

    const emp = await db.empresa.get(empresaId);
    const usr = await db.usuario.get(usuarioId);

    setEmpresa(emp);
    setUsuario(usr);
    localStorage.setItem('empresa_id', empresaId);
    localStorage.setItem('usuario_id', usuarioId);
  }

  function logout() {
    setUsuario(null);
    setEmpresa(null);
    localStorage.removeItem('empresa_id');
    localStorage.removeItem('usuario_id');
  }

  return (
    <AuthContext.Provider
      value={{ usuario, empresa, login, onboarding, logout, carregando }}
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
