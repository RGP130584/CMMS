# 🚜 CMMS Agrícola & Frotas — Sistema de Gestão de Manutenção Preventiva e Corretiva

> **SaaS & PWA Offline-First** projetado para controle ágil de manutenção de máquinas agrícolas, caminhões pesados, tratores, colheitadeiras, pulverizadores e implementos, operando 100% no campo mesmo sem conexão com a internet.

---

## 🌟 Principais Funcionalidades

### 1. ⚙️ Planos de Manutenção Automáticos e Escalonados
- **Geração Inteligente no Cadastro**: Ao adicionar qualquer máquina ou caminhão, o sistema monta instantaneamente o plano de manutenção preventiva escalonado de fábrica:
  - **Revisão 250h / 15.000 km**: Óleo lubrificante (15W-40), filtros de combustível e sedimentador Racord, engraxe de eixos e cruzetas do cardan, drenagem de reservatórios de ar e lonas de freio.
  - **Revisão 500h / 30.000 km**: Filtros de ar primário/secundário, filtro secador do freio (APU), filtro de cabine, regulagem de correias, nível de óleo dos diferenciais e suspensão.
  - **Revisão 1.000h / 60.000 km**: Troca total do fluido hidráulico e transmissão, fluido de arrefecimento orgânico, calibração de válvulas, teste de pressão SCV e aferição de tacógrafo/ABS.
- **Monitoramento Contínuo de Horímetro e KM**: Cálculo automático do horímetro restante, prazos de vencimento e alertas visuais por cores (Verde: Em dia, Amarelo: Próximo, Vermelho: Atrasado/Manutenção, Azul: Em atendimento).

---

### 2. 📷 Captura e Gestão de Fotos com Câmera e Galeria
- **Acionamento Direto da Câmera**: Suporte nativo à câmera do smartphone (`capture="environment"`) ou upload de imagens da galeria.
- **Compressão e Redimensionamento Client-Side**: Otimização via Canvas HTML5 sem sobrecarregar a memória do IndexedDB local.
- **Onde utilizar**:
  - Cadastro de Equipamento / Veículo.
  - Atualização de foto na Ficha da Máquina.
  - Registro de fotos de falhas, vazamentos e peças danificadas ao Informar Problemas.
  - Miniaturas na Lista de Máquinas e Frotas.

---

### 3. 🚨 Controle de Oficina e Status Operacional com 1 Clique
- **Ações Rápidas no Detalhe da Máquina**:
  - `🚨 Colocar em Manutenção`: Marca imediatamente o veículo como parado na oficina e altera o semáforo para vermelho.
  - `✅ Liberar para Operação`: Retorna o equipamento para a frota ativa e operacional.
  - `🟡 Aguardar Peças`: Indica retenção de serviço por aguardo de insumos ou peças de reposição.
- **Configuração de Operação flexível**: Suporte a *Frotas / Transportadoras*, *Oficinas Mecânicas / Concessionárias*, *Propriedades Rurais / Agronegócio* e *Prestadores de Serviços*.

---

### 4. 📚 Catálogo Técnico Oficial Pré-Carregado de Fábrica
O sistema já vem populado e pronto para uso imediato (zero dependência de upload inicial de PDFs):
- **11 Fabricantes Homologados**: John Deere, Massey Ferguson, Case IH, New Holland, Valtra, Scania, Volvo, Mercedes-Benz, Stara, Jacto e Agrale.
- **Revisão de Peças (`/catalogo/revisao`)**: Itens pendentes de revisão com códigos OEM, descrições, modelos aplicáveis e ferramentas de aprovação, rejeição ou edição inline.
- **Publicação de Peças (`/catalogo/publicar`)**: Publicação em lote de peças aprovadas para o catálogo de busca.
- **Diagramas Técnicos Esquemáticos (`/catalogo/diagramas`)**:
  - *Esquema Hidráulico*: Circuito de levante 3 pontos, válvulas SCV e bomba tandem 210 bar.
  - *Arrefecimento & Correias*: Radiador, termostato 82°C, bomba d'água e correia Poly-V.
  - *Circuito de Pulverização de Barras*: Tanque de calda 3.500L, bomba inox, comando de 9 válvulas e bicos cerâmicos antideriva.
- **Equivalências e Cross-Reference (`/catalogo/equivalencias`)**: Conversão de códigos OEM antigos para códigos novos e correspondências cruzadas (Donaldson, Fleetguard, AGCO, CNH, John Deere).

---

### 5. 🛠️ Gestão Completa de O.S. e Problemas Corretivos
- **Abertura Ágil**: O operador ou mecânico informa o sintoma em segundos (Parou, Esquentando, Vazamento, Barulho, Outro) com foto e áudio.
- **Atendimento Integrado**: Início de atendimento pelo mecânico, registro de serviços realizados, apontamento de peças do catálogo e fechamento da Ordem de Serviço.
- **Histórico Geral**: Linha do tempo cronológica com todas as revisões, corretivas e lançamentos de horímetro.

---

### 6. 📊 Relatórios Gerenciais, Impressão e Exportação
- **KPIs Industriais e de Frota**: Taxa de disponibilidade operacional, quantidade de revisões preventivas vs corretivas, total de horas acumuladas da frota.
- **Exportação CSV**: Download em 1 clique para integração com planilhas Excel.
- **Modo Impressão / PDF**: Folha de estilo `@media print` para impressão limpa de fichas de máquinas, ordens de serviço e relatórios mensais.

---

## 🏗️ Arquitetura e Tecnologias

| Camada | Tecnologia | Descrição |
|---|---|---|
| **Frontend** | React 19 + Vite | Interface responsiva, modular e ultrarrápida |
| **Estilização** | CSS Moderno & Glassmorphism | Design premium com paleta de alto contraste e mobile-first |
| **Banco Local** | Dexie.js (IndexedDB) | Armazenamento persistente no navegador (PWA offline) |
| **Segurança** | WebCrypto API | Hash criptográfico SHA-256 para senhas e integridade |
| **Imagens** | Canvas HTML5 Client Compression | Otimização e rotação automática de fotos no dispositivo |
| **PWA** | Vite PWA Plugin + Service Worker | Instalabilidade (Add to Home Screen) e cache offline |

---

## 🚀 Como Executar o Projeto Localmente

### Pré-requisitos
- Node.js 18+ instalado.

### 1. Instalar dependências
```bash
npm install
```

### 2. Iniciar servidor de desenvolvimento
```bash
npm run dev
```
O sistema estará acessível em **`http://localhost:5174/`** (ou porta indicada no terminal).

### 3. Gerar build de produção
```bash
npm run build
```

---

## 📱 Instalação como Aplicativo (PWA)
1. Acesse o sistema pelo Google Chrome (Android/Desktop) ou Safari (iOS).
2. Clique no menu do navegador e selecione **"Adicionar à tela inicial"** ou **"Instalar aplicativo"**.
3. O CMMS abrirá em tela cheia como um app nativo, funcionando mesmo em modo avião ou sem sinal de operadora.

