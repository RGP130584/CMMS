# 🚜 CMMS Agrícola & Frotas — Sistema de Gestão de Manutenção Preventiva e Corretiva

> **SaaS & PWA 100% Offline-First** projetado para controle ágil de manutenção de máquinas agrícolas, frotas pesadas, caminhões, tratores, colheitadeiras, pulverizadores e implementos, operando no campo mesmo sem sinal de internet ou em modo avião.

---

## 🌟 Principais Módulos e Funcionalidades

### 1. ⚙️ Planos de Manutenção Preventiva Automáticos e Escalonados
- **Geração Instantânea no Cadastro**: Ao cadastrar qualquer máquina ou caminhão, o sistema configura automaticamente o plano preventivo escalonado:
  - **Revisão 250h / 15.000 km**: Troca de óleo motor (15W-40), filtros de combustível/separador Racord, engraxe geral de cruzetas e cardan, drenagem de reservatórios de ar e lonas de freio.
  - **Revisão 500h / 30.000 km**: Filtros de ar primário/secundário, refil secador de ar do freio (APU), filtro de cabine, regulagem de correias, nível de óleo dos diferenciais e suspensão.
  - **Revisão 1.000h / 60.000 km**: Troca de fluido hidráulico e transmissão, fluido de arrefecimento orgânico, calibração de válvulas, teste de pressão SCV e aferição de tacógrafo/ABS.
- **Semáforo de Alertas Visuais**:
  - 🟢 **Verde**: Equipamento operacional e manutenção em dia.
  - 🟡 **Amarelo**: Próximo do vencimento (menos de 50h ou 2.000 km).
  - 🔴 **Vermelho**: Vencido ou parado na oficina.
  - 🔵 **Azul**: Em atendimento / manutenção ativa.

---

### 2. 📱 PWA Nativo, Ícones HD e Instalação Offline (iOS & Android)
- **Instalabilidade Completa (Add to Home Screen)**:
  - **No Android / Chrome**: Captura automática do evento `beforeinstallprompt` com acionamento nativo de instalação.
  - **No iPhone / Safari**: Modal interativo com guia passo a passo adaptado para iOS (`Compartilhar ➔ Adicionar à Tela de Início`).
- **Respeito a Safe-Area & Notch / Dynamic Island**:
  - Insets configurados via `env(safe-area-inset-top)` e `env(safe-area-inset-bottom)` para perfeita visualização em iPhones sem cortes de cabeçalhos.
- **Persistência de Armazenamento Local (`navigator.storage.persist()`)**:
  - Bloqueio de expurgamento de cache para manter dados salvos permanentemente no IndexedDB.

---

### 3. 📐 Diagramas & Esquemas Técnicos Interativos
- **Esquemas Vetoriais de Alta Resolução Pré-Carregados**:
  1. **Circuito Hidráulico & Válvulas SCV**: Bomba tandem 120 L/min, 210 bar, cilindro 3 pontos e engates rápidos.
  2. **Circuito de Arrefecimento & Correias Poly-V**: Radiador, termostato duplo 82°C, bomba d'água e tensor.
  3. **Fluxograma de Pulverização de Barras 36m**: Tanque de calda 3.500L, bomba inox, comando 9 vias e bicos cerâmicos.
  4. **Circuito Pneumático de Freios & Secador APU (Caminhões)**: Compressor 2 cilindros, válvula 4 vias e reservatórios 40L/30L/20L.
- **Visualizador em Tela Cheia com Zoom**: Inspeção rica de diagramas em qualquer dispositivo.
- **Componentes Numerados**: Cada esquema vincula a lista de peças numeradas com código OEM.
- **Upload Direto de Fotos de Manuais**: Anexo de fotos de manuais impressos via câmera do celular.

---

### 4. 🔄 Equivalências de Peças & Cross-Reference (UX Avançada)
- **Busca Instantânea**: Pesquisa em tempo real por código original, marcas de reposição (Mann, Donaldson, Fleetguard, Tecfil, Mahle, Bosch, Parker), modelo de máquina ou descrição.
- **Filtros por Abas**: *Todas*, *Marcas Paralelas (Aftermarket)*, *Substituições OEM*, *Filtros*, *Motor*, *Hidráulica*.
- **Formulário com Autocomplete**: Seleção interativa da peça no catálogo e botões rápidos com principais montadoras.
- **Cards de Comparação Visual**: Visualização lado a lado (*Código Original ➔ Código Equivalente*) com botão de copiar código em 1 toque.

---

### 5. 📷 Captura e Gestão de Fotos com Câmera e Galeria
- **Câmera Direta**: Acionamento nativo da câmera traseira (`capture="environment"`) para fotos no campo.
- **Compressão Client-Side**: Otimização via Canvas HTML5 sem sobrecarregar o armazenamento local.
- **Disponibilidade**: Cadastro de equipamentos, troca de foto da máquina e comprovação de avarias em ordens de serviço.

---

### 6. 🚨 Controle de Oficina e Status Operacional com 1 Clique
- **Ações Imediatas na Ficha da Máquina**:
  - `🚨 Colocar em Manutenção`: Parada de veículo na oficina com alteração imediata de status.
  - `✅ Liberar para Operação`: Retorno à frota ativa.
  - `🟡 Aguardando Peças`: Indicação de retenção por aguardo de insumos.
- **Modelos de Negócio**: Suporte a *Frotas / Transportadoras*, *Oficinas Mecânicas / Concessionárias*, *Propriedades Rurais* e *Prestadores de Serviços*.

---

### 7. 🛠️ Gestão de O.S., Corretivas e Histórico Consolidado
- **Abertura Ágil**: Apontamento em segundos com sintoma (Parou, Esquentando, Vazamento, Barulho, Outro), foto e áudio.
- **Atendimento pelo Mecânico**: Apontamento de peças utilizadas do catálogo e descrição do serviço executado.
- **Linha do Tempo Completa**: Histórico cronológico de revisões, corretivas e lançamentos de horímetro.

---

### 8. 📊 Relatórios Gerenciais, Impressão e Exportação
- **Disponibilidade da Frota & Horas Trabalhadas**: Indicadores operacionais consolidados.
- **Exportação CSV**: Download em 1 clique para integração com Excel.
- **Modo Impressão Limpo (`@media print`)**: Fichas de máquinas e relatórios formatados para PDF ou papel.

---

## 🏗️ Arquitetura e Tecnologias

| Camada | Tecnologia | Descrição |
|---|---|---|
| **Frontend** | React 19 + Vite | Interface modular, responsiva e ultrarrápida |
| **Estilização** | CSS Moderno & Glassmorphism | Design com Safe Area Insets iOS e alto contraste |
| **Banco Local** | Dexie.js (IndexedDB) | Armazenamento persistente no navegador (PWA offline) |
| **Segurança** | WebCrypto API | Hash criptográfico SHA-256 para senhas e integridade |
| **Imagens** | Canvas HTML5 Client Compression | Otimização automática de fotos no dispositivo |
| **PWA** | Vite PWA Plugin + Workbox | Cache offline completo de assets e service worker |

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
O sistema estará acessível em **`http://localhost:5173/`** (ou porta indicada no terminal).

### 3. Gerar build de produção
```bash
npm run build
```

---

## 📱 Instalação como Aplicativo (PWA)
1. Acesse o sistema pelo Google Chrome (Android/Desktop) ou Safari (iOS).
2. Clique no banner **"📲 Instalar Aplicativo CMMS"** ou use o menu do navegador (**"Adicionar à tela de início"**).
3. O CMMS abrirá em tela cheia como um app nativo, funcionando 100% offline.
