import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { iniciarSyncAutomatico } from './services/sync';
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import ListaMaquinas from './pages/ListaMaquinas';
import CadastroMaquina from './pages/CadastroMaquina';
import DetalheMaquina from './pages/DetalheMaquina';
import ConfigurarPlano from './pages/ConfigurarPlano';
import AtualizarHorimetro from './pages/AtualizarHorimetro';
import InformarProblema from './pages/InformarProblema';
import ListaProblemas from './pages/ListaProblemas';
import AtenderProblema from './pages/AtenderProblema';
import FazerRevisao from './pages/FazerRevisao';
import ListaManutencoes from './pages/ListaManutencoes';
import Relatorios from './pages/Relatorios';
import HistoricoMaquina from './pages/HistoricoMaquina';
import HistoricoGeral from './pages/HistoricoGeral';
import InstallPrompt from './components/InstallPrompt';

import CatalogoIndex from './pages/catalogo/CatalogoIndex';
import ListaFabricantes from './pages/catalogo/ListaFabricantes';
import CadastroFabricante from './pages/catalogo/CadastroFabricante';
import DetalheFabricante from './pages/catalogo/DetalheFabricante';
import ListaFontes from './pages/catalogo/ListaFontes';
import CadastroFonte from './pages/catalogo/CadastroFonte';
import DetalheFonte from './pages/catalogo/DetalheFonte';
import UploadCatalogo from './pages/catalogo/UploadCatalogo';
import ProcessarCatalogo from './pages/catalogo/ProcessarCatalogo';
import RevisaoCatalogo from './pages/catalogo/RevisaoCatalogo';
import PublicarCatalogo from './pages/catalogo/PublicarCatalogo';
import PesquisarCatalogo from './pages/catalogo/PesquisarCatalogo';
import DiagramasCatalogo from './pages/catalogo/DiagramasCatalogo';
import EquivalenciasCatalogo from './pages/catalogo/EquivalenciasCatalogo';

iniciarSyncAutomatico();

function RotaProtegida({ children }) {
  const { usuario, carregando } = useAuth();
  if (carregando) return <div className="page"><p>Carregando...</p></div>;
  if (!usuario) return <Navigate to="/login" replace />;
  return children;
}

function RotaPublica({ children }) {
  const { usuario, carregando } = useAuth();
  if (carregando) return <div className="page"><p>Carregando...</p></div>;
  if (usuario) return <Navigate to="/" replace />;
  return children;
}

function AppRotas() {
  return (
    <Routes>
      <Route path="/login" element={<RotaPublica><Login /></RotaPublica>} />
      <Route path="/onboarding" element={<RotaPublica><Onboarding /></RotaPublica>} />

      <Route path="/" element={<RotaProtegida><Dashboard /></RotaProtegida>} />
      <Route path="/maquinas" element={<RotaProtegida><ListaMaquinas /></RotaProtegida>} />
      <Route path="/maquina/nova" element={<RotaProtegida><CadastroMaquina /></RotaProtegida>} />
      <Route path="/maquina/:id" element={<RotaProtegida><DetalheMaquina /></RotaProtegida>} />
      <Route path="/maquina/:id/plano" element={<RotaProtegida><ConfigurarPlano /></RotaProtegida>} />
      <Route path="/maquina/:id/horimetro" element={<RotaProtegida><AtualizarHorimetro /></RotaProtegida>} />
      <Route path="/maquina/:id/problema" element={<RotaProtegida><InformarProblema /></RotaProtegida>} />
      <Route path="/maquina/:id/revisao" element={<RotaProtegida><FazerRevisao /></RotaProtegida>} />
      <Route path="/maquina/:id/historico" element={<RotaProtegida><HistoricoMaquina /></RotaProtegida>} />

      <Route path="/problemas" element={<RotaProtegida><ListaProblemas /></RotaProtegida>} />
      <Route path="/problema/:id/atender" element={<RotaProtegida><AtenderProblema /></RotaProtegida>} />
      <Route path="/manutencoes" element={<RotaProtegida><ListaManutencoes /></RotaProtegida>} />
      <Route path="/relatorios" element={<RotaProtegida><Relatorios /></RotaProtegida>} />
      <Route path="/historico" element={<RotaProtegida><HistoricoGeral /></RotaProtegida>} />


      <Route path="/catalogos" element={<RotaProtegida><CatalogoIndex /></RotaProtegida>} />
      <Route path="/catalogo/fabricantes" element={<RotaProtegida><ListaFabricantes /></RotaProtegida>} />
      <Route path="/catalogo/fabricante/novo" element={<RotaProtegida><CadastroFabricante /></RotaProtegida>} />
      <Route path="/catalogo/fabricante/:id" element={<RotaProtegida><DetalheFabricante /></RotaProtegida>} />
      <Route path="/catalogo/fontes" element={<RotaProtegida><ListaFontes /></RotaProtegida>} />
      <Route path="/catalogo/fonte/nova" element={<RotaProtegida><CadastroFonte /></RotaProtegida>} />
      <Route path="/catalogo/fonte/:id" element={<RotaProtegida><DetalheFonte /></RotaProtegida>} />
      <Route path="/catalogo/fonte/:fonteId/upload" element={<RotaProtegida><UploadCatalogo /></RotaProtegida>} />
      <Route path="/catalogo/arquivo/:arquivoId/processar" element={<RotaProtegida><ProcessarCatalogo /></RotaProtegida>} />
      <Route path="/catalogo/revisao" element={<RotaProtegida><RevisaoCatalogo /></RotaProtegida>} />
      <Route path="/catalogo/publicar" element={<RotaProtegida><PublicarCatalogo /></RotaProtegida>} />
      <Route path="/catalogo/pesquisar" element={<RotaProtegida><PesquisarCatalogo /></RotaProtegida>} />
      <Route path="/catalogo/diagramas" element={<RotaProtegida><DiagramasCatalogo /></RotaProtegida>} />
      <Route path="/catalogo/equivalencias" element={<RotaProtegida><EquivalenciasCatalogo /></RotaProtegida>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <InstallPrompt />
        <AppRotas />
      </AuthProvider>
    </BrowserRouter>
  );
}
