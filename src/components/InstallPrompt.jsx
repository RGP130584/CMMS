import { useState, useEffect } from 'react';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [bannerVisible, setBannerVisible] = useState(true);

  useEffect(() => {
    // 1. Detecta se já está instalado / rodando como App Standalone
    const checkStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true ||
      document.referrer.includes('android-app://');

    setIsStandalone(checkStandalone);

    // 2. Detecta iOS Safari
    const ua = window.navigator.userAgent;
    const isIosDevice = /iPhone|iPad|iPod/i.test(ua);
    const isSafari = /WebKit/i.test(ua) && !/CriOS|FxiOS|OPiOS|mercury/i.test(ua);
    setIsIOS(isIosDevice);

    // 3. Captura o evento nativo de instalação no Android/Chrome/Edge
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setBannerVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    window.addEventListener('appinstalled', () => {
      setIsStandalone(true);
      setDeferredPrompt(null);
      setBannerVisible(false);
      console.log('CMMS instalado com sucesso!');
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Se já estiver rodando instalado como App, não precisa do banner
  if (isStandalone) return null;

  async function handleInstalarAndroid() {
    if (!deferredPrompt) {
      alert('Para instalar, use a opção "Adicionar à tela inicial" ou "Instalar Aplicativo" no menu (⋮) do seu navegador.');
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setBannerVisible(false);
    }
  }

  if (!bannerVisible && !showIOSModal) {
    return (
      <div style={{ position: 'fixed', bottom: '15px', right: '15px', zIndex: 9999 }}>
        <button
          onClick={() => (isIOS ? setShowIOSModal(true) : setBannerVisible(true))}
          className="btn"
          style={{
            background: 'linear-gradient(135deg, #1B5E20, #2E7D32)',
            color: '#fff',
            boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
            borderRadius: '30px',
            padding: '0.6rem 1.1rem',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            border: '2px solid #81C784',
          }}
        >
          <span>📲</span> <strong>Instalar App (Offline)</strong>
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Banner Superior/Inferior de Instalação */}
      {bannerVisible && (
        <div
          style={{
            background: 'linear-gradient(135deg, #0f3e13 0%, #1b5e20 100%)',
            color: '#ffffff',
            padding: '0.75rem 1rem',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            borderBottom: '2px solid #4caf50',
            position: 'relative',
            zIndex: 1000,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1 1 240px' }}>
            <img
              src="/pwa-192x192.png"
              alt="CMMS"
              style={{ width: '38px', height: '38px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.4)' }}
            />
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.92rem', letterSpacing: '0.2px' }}>
                Instalar Aplicativo CMMS
              </div>
              <div style={{ fontSize: '0.78rem', color: '#c8e6c9' }}>
                Funciona 100% offline e direto na tela inicial
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isIOS ? (
              <button
                type="button"
                onClick={() => setShowIOSModal(true)}
                className="btn"
                style={{
                  background: '#ffffff',
                  color: '#1b5e20',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  padding: '0.45rem 0.9rem',
                  borderRadius: '6px',
                  border: 'none',
                }}
              >
                📲 Ver como instalar no iPhone
              </button>
            ) : (
              <button
                type="button"
                onClick={handleInstalarAndroid}
                className="btn"
                style={{
                  background: '#81c784',
                  color: '#0a350e',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  padding: '0.45rem 0.9rem',
                  borderRadius: '6px',
                  border: 'none',
                }}
              >
                📲 Instalar no Celular
              </button>
            )}

            <button
              type="button"
              onClick={() => setBannerVisible(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#a5d6a7',
                fontSize: '1.2rem',
                cursor: 'pointer',
                padding: '0 4px',
              }}
              title="Fechar banner"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Modal Instrutivo para iOS / iPhone */}
      {showIOSModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '1rem',
            backdropFilter: 'blur(4px)',
          }}
          onClick={() => setShowIOSModal(false)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              maxWidth: '380px',
              width: '100%',
              padding: '1.5rem',
              color: '#1e293b',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.4)',
              textAlign: 'center',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src="/pwa-192x192.png"
              alt="CMMS"
              style={{ width: '56px', height: '56px', borderRadius: '14px', marginBottom: '0.75rem', boxShadow: '0 4px 8px rgba(0,0,0,0.15)' }}
            />
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#1b5e20', fontSize: '1.2rem' }}>
              Instalar CMMS no iPhone
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.25rem' }}>
              Siga os 3 passos no Safari para ter o aplicativo com ícone na tela inicial e acesso offline:
            </p>

            <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#f8fafc', padding: '0.6rem 0.8rem', borderRadius: '8px' }}>
                <span style={{ fontSize: '1.3rem' }}>1️⃣</span>
                <span>Toque no botão <strong>Compartilhar</strong> (ícone <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle' }}><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>) no rodapé do Safari.</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#f8fafc', padding: '0.6rem 0.8rem', borderRadius: '8px' }}>
                <span style={{ fontSize: '1.3rem' }}>2️⃣</span>
                <span>Role para baixo e toque em <strong>"Adicionar à Tela de Início"</strong> ➕</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#f8fafc', padding: '0.6rem 0.8rem', borderRadius: '8px' }}>
                <span style={{ fontSize: '1.3rem' }}>3️⃣</span>
                <span>Toque em <strong>"Adicionar"</strong> no canto superior direito.</span>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setShowIOSModal(false)}
              style={{ width: '100%', marginTop: '1.25rem', background: '#1b5e20' }}
            >
              Entendi
            </button>
          </div>
        </div>
      )}
    </>
  );
}
