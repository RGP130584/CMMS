# MASTER SPEC — SaaS de Manutenção de Máquinas Agrícolas (PWA)
### Documento de especificação para desenvolvimento via Google Antigravity

---

## 0. Instruções para a IA de desenvolvimento (LEIA PRIMEIRO)

Você vai construir um **MVP funcional**, não um produto completo. Regras não negociáveis:

1. **Não implemente nada fora deste documento.** Se uma funcionalidade parecer "óbvia" ou "esperada" (estoque, financeiro, custos, combustível, GPS, telemetria), **não implemente**, mesmo que pareça trivial.
2. **PWA é requisito estrutural, não decorativo.** O produto precisa funcionar com internet instável ou ausente — isso não é um "extra", é a razão de ser do produto (ver seção 2).
3. **Simplicidade acima de tudo.** Antes de adicionar qualquer campo, tela ou botão, pergunte: *"isso ajuda diretamente a manter uma máquina agrícola em boas condições?"*. Se não, não implemente.
4. **Mobile first.** Toda tela deve ser desenhada primeiro para celular (largura ~360–414px), depois adaptada para tablet/desktop.
5. **Não invente regras de manutenção de fabricantes.** Intervalos de revisão e troca de peças são sempre configuráveis pelo administrador, nunca hardcoded.
6. Onde este documento não especificar um detalhe técnico exato, escolha a opção mais simples e mais barata de manter — não a mais sofisticada.

---

## 1. Objetivo do produto

SaaS extremamente simples para controle de manutenção preventiva e corretiva de máquinas agrícolas, baseado em horímetro. Público: produtores rurais, responsáveis por manutenção, mecânicos e operadores de máquinas, majoritariamente com baixa familiaridade com sistemas digitais e conectividade limitada no campo.

**Princípio central:** Abriu → entendeu → apertou → resolveu.

---

## 2. Por que PWA (e o que isso implica tecnicamente)

Dado de mercado que justifica esta escolha: **apenas ~34% das propriedades rurais brasileiras têm acesso à internet.** Isso significa que o app precisa:

- Ser **instalável** direto do navegador (Add to Home Screen), sem depender de loja de aplicativos — reduz fricção de distribuição para um público pouco acostumado a instalar apps.
- **Funcionar offline** para as operações mais críticas: atualizar horímetro, informar problema (texto + foto + áudio), consultar dados da máquina já sincronizados, visualizar histórico já baixado.
- **Sincronizar automaticamente** quando a conexão voltar, sem exigir nenhuma ação do usuário.
- Nunca perder dados digitados offline, mesmo se o app for fechado ou o celular reiniciar antes da sincronização.

### Requisitos técnicos obrigatórios de PWA

- `manifest.json` completo (nome, ícones em múltiplos tamanhos, `display: standalone`, `theme_color`, `background_color`, orientação preferencial retrato).
- Service Worker com estratégia de cache:
  - **Cache-first** para shell da aplicação (HTML/CSS/JS/ícones).
  - **Network-first com fallback para cache** para dados (lista de máquinas, histórico).
- Armazenamento local persistente (IndexedDB) para:
  - Dados das máquinas do usuário (para consulta offline).
  - Fila de ações pendentes de sincronização (horímetro atualizado, problema reportado, manutenção registrada, fotos/áudios capturados).
- **Fila de sincronização (sync queue)**: toda ação feita offline é gravada localmente com timestamp e status `pendente`. Ao detectar conexão, o app tenta enviar a fila em ordem, marcando cada item como `sincronizado` ou `erro` (com retry).
- Indicador visual simples e não técnico de status de conexão/sincronização (ex.: ícone de nuvem — não usar termos como "offline mode" ou "sync error" para o usuário final).
- Acesso a **câmera** (input de foto) e **microfone** (gravação de áudio) via APIs web padrão, funcionando dentro do fluxo offline (arquivo fica salvo localmente até haver conexão para upload).
- Compressão de imagem no cliente antes do upload (reduzir custo de dados e tempo de sincronização em conexão rural, tipicamente lenta).
- Instalabilidade testada em Chrome Android (prioridade 1, é o navegador dominante no público-alvo) e Safari iOS (prioridade 2).

---

## 3. Escopo do MVP e Módulos Entregues

### Dentro do escopo
- **Cadastro de Máquinas e Veículos**: Tratores, Colheitadeiras, Pulverizadores, Caminhões / Frotas Pesadas, Plantadeiras e Veículos de Apoio.
- **Captura e Gestão de Fotos**: Acionamento de câmera traseira de celular e upload com compressão automática client-side.
- **Controle de Oficina e Frota**: Botões de 1 clique para "Colocar em Manutenção (Parada na Oficina)", "Liberar para Operação" e "Aguardando Peças".
- **Planos Automáticos de Manutenção**: Geração automática no cadastro de planos escalonados de 250h, 500h e 1000h (ou 15k km, 30k km e 60k km para caminhões).
- **Catálogo Técnico Oficial Pré-Carregado**: 11 montadoras homologadas, diagramas técnicos vetoriais SVG, equivalências e revisões de peças.
- **Horímetro / KM e Histórico de Atualizações**.
- **Manutenção Corretiva & Chamados**: Registro ágil de problemas, atendimento pelo mecânico e registro de peças/serviço.
- **Relatórios Gerenciais e Indicadores**: Taxa de disponibilidade de frota, MTTR, modo de impressão e exportação CSV.
- **Histórico Completo Consolidado**.
- **Status Visual**: Em dia (verde), Próximo (amarelo), Atrasado / Oficina (vermelho), Em atendimento (azul).
- **Funcionamento Offline-First (PWA)**: Armazenamento persistente no IndexedDB via Dexie.js e sincronização automática.

### Fora do escopo
Estoque contábil complexo, financeiro/faturamento bancário, compras/vendas com nota fiscal, gestão de safra, GPS/telemetria em tempo real, folha de pagamento.

---

## 4. Perfis de usuário e permissões

| Ação | Administrador | Responsável manutenção | Operador |
|---|---|---|---|
| Cadastrar máquina | ✅ | ❌ | ❌ |
| Cadastrar usuários | ✅ | ❌ | ❌ |
| Criar/editar plano de manutenção | ✅ | ❌ | ❌ |
| Cadastrar peças e intervalos | ✅ | ❌ | ❌ |
| Visualizar todas as máquinas | ✅ | ✅ | ❌ (só autorizadas) |
| Atualizar horímetro | ✅ | ✅ | ✅ |
| Informar problema | ✅ | ✅ | ✅ |
| Iniciar/concluir manutenção | ✅ | ✅ | ❌ |
| Consultar histórico | ✅ | ✅ | ✅ (básico) |
| Corrigir horímetro retroativo | ✅ | ❌ | ❌ |

---

## 5. Modelo de dados (entidades principais)

```
Empresa
├── id, tipo_documento (CNPJ | CPF), documento (numero validado com digito verificador),
│   razao_social_ou_nome_titular, nome_propriedade (ex: "Fazenda Santa Rita"),
│   tipo_propriedade (fazenda | sitio | chacara | outro), criado_em

Usuario
├── id, empresa_id, nome, telefone/email, senha_hash, perfil (admin | responsavel | operador), ativo

Maquina
├── id, empresa_id, apelido, tipo, fabricante, modelo, ano,
│   numero_serie (opcional), horimetro_atual, foto_url, observacoes,
│   status_calculado (verde | amarelo | vermelho | azul), criado_em

RegistroHorimetro
├── id, maquina_id, valor_anterior, valor_novo, usuario_id, data_hora,
│   origem (normal | correcao_admin), justificativa (obrigatória se correcao_admin)

PlanoManutencao
├── id, maquina_id (ou modelo_id, se compartilhado entre máquinas iguais),
│   nome (ex: "Revisão 500h"), intervalo_horas, ativo

ItemPlano
├── id, plano_id, descricao (ex: "Troca de óleo do motor")

Peca
├── id, empresa_id, nome, codigo (opcional), descricao

PecaPlano
├── id, plano_id, peca_id, intervalo_troca_horas (pode diferir do intervalo do plano)

Revisao
├── id, maquina_id, plano_id, horimetro_programado, horimetro_realizado,
│   data_realizacao, usuario_id, itens_executados (lista), pecas_utilizadas (lista),
│   observacoes, fotos[], status (agendada | concluida)

Problema
├── id, maquina_id, tipo (parou | funcionando_com_problema | vazamento | barulho | esquentando | outro),
│   descricao, foto_url, audio_url, horimetro_no_momento, usuario_reportou_id,
│   data_hora, status (aberto | em_atendimento | resolvido), usuario_responsavel_id

ManutencaoCorretiva
├── id, problema_id, maquina_id, data_inicio, data_conclusao, usuario_id,
│   servico_realizado, pecas_utilizadas[], observacoes, horimetro_no_momento

HistoricoEvento (view/tabela consolidada, imutável)
├── id, maquina_id, tipo (revisao | corretiva | atualizacao_horimetro),
│   data_hora, horimetro, resumo, referencia_id (revisao_id ou manutencao_id)

Alerta
├── id, maquina_id, tipo (revisao_proxima | revisao_atrasada | problema_aberto | manutencao_concluida),
│   mensagem, data_hora, lido (bool), destinatario_usuario_id

FilaSincronizacao (client-side, IndexedDB)
├── id_local, tipo_acao, payload, timestamp_criacao, status (pendente | sincronizado | erro), tentativas
```

### 5.1 Cadastro da propriedade (CNPJ ou CPF)

O cadastro inicial da conta (equivalente a "empresa" no modelo de dados) deve aceitar dois caminhos, sem tratar um como principal e o outro como exceção — ambos são igualmente comuns no público-alvo:

- **CNPJ** — para fazendas, sítios ou chácaras constituídos como pessoa jurídica. Campo `razao_social_ou_nome_titular` recebe a razão social.
- **CPF** — para produtor rural pessoa física, muito comum em pequenas e médias propriedades. Campo `razao_social_ou_nome_titular` recebe o nome do titular.

Regras da tela de cadastro:
- Um botão simples de seleção no topo: **"Fazenda tem CNPJ"** / **"Sou produtor (CPF)"** — nunca exibir os dois campos ao mesmo tempo.
- Validação de dígito verificador tanto para CNPJ quanto para CPF antes de permitir avançar.
- Campo obrigatório **nome da propriedade** (ex.: "Fazenda Santa Rita", "Sítio Boa Vista") — é como o usuário se identifica no dia a dia, não a razão social.
- Campo **tipo de propriedade**: seleção simples entre Fazenda / Sítio / Chácara / Outro (não obrigar nomenclatura técnica, é só um rótulo de identificação, sem impacto em regras de negócio).
- Um mesmo CPF ou CNPJ não deve ter duas contas ativas simultâneas (evitar duplicidade de cadastro).
- Este cadastro é feito uma única vez, pelo primeiro administrador da conta, no fluxo de onboarding — não deve ser confundido com o cadastro de usuários adicionais (seção 4).

**Regras críticas de integridade:**
- `horimetro_atual` da máquina nunca pode ser atualizado para um valor menor que o anterior, exceto via fluxo de correção administrativa (que exige justificativa e fica registrada em `RegistroHorimetro` com `origem = correcao_admin`).
- Ao concluir uma `Revisao`, o sistema recalcula automaticamente `horimetro_programado` da próxima revisão do mesmo plano (`horimetro_realizado + intervalo_horas`).
- `HistoricoEvento` é **append-only** — nada é apagado. Correções geram novo registro referenciando o original, nunca substituem o histórico.
- Peças vinculadas a plano também disparam alerta próprio se o intervalo de troca da peça for menor que o intervalo geral da revisão (ex.: filtro de combustível trocado a cada 500h dentro de uma revisão maior de 1000h).

---

## 6. Cálculo de status (motor de regras)

Para cada máquina, a cada atualização de horímetro:

```
faltam_horas = horimetro_programado - horimetro_atual

SE faltam_horas > limite_amarelo (configurável, default 100h):
    status = VERDE

SENAO SE faltam_horas > 0:
    status = AMARELO

SENAO:
    status = VERMELHO

# Sobrepõe os anteriores se houver:
SE existe Problema com status != resolvido E tipo == "parou":
    status = VERMELHO (crítico)

SE existe ManutencaoCorretiva ou Revisao com status = "em execução":
    status = AZUL
```

O limite amarelo deve ser configurável por empresa (ou por plano), nunca fixo no código.

---

## 7. Telas obrigatórias do MVP

1. **Login / Onboarding da propriedade** — seleção CNPJ ou CPF, validação de documento, nome e tipo da propriedade (fazenda/sítio/chácara/outro), depois login simples nas próximas vezes
2. **Tela inicial (dashboard)** — resumo com contadores por status + 4 botões grandes (Máquinas, Manutenções, Problemas, Histórico)
3. **Lista de máquinas** — cards com apelido, status colorido, horímetro atual
4. **Tela da máquina** (tela central do sistema) — dados, horímetro, próxima revisão, botões: Fazer revisão / Informar problema / Atualizar horímetro / Ver histórico
5. **Atualizar horímetro** — tela mínima, campo numérico grande + teclado numérico nativo
6. **Informar problema** — seleção por botões grandes de tipo de problema → descrição opcional → foto/áudio → enviar
7. **Lista de problemas abertos** (para responsável/admin) — ordenada por criticidade
8. **Atender problema** — visualizar detalhes → iniciar manutenção → concluir manutenção (com peças e serviço realizado)
9. **Fazer revisão preventiva** — checklist de itens do plano + peças utilizadas → concluir
10. **Histórico da máquina** — lista cronológica de eventos
11. **Cadastro de máquina** (admin)
12. **Cadastro/edição de plano de manutenção e peças** (admin)
13. **Cadastro de usuários** (admin)

Nenhuma tela deve ter mais de ~6 campos visíveis simultaneamente. Preferir fluxos em etapas (wizard) a formulários longos.

---

## 8. Fluxos principais

**Preventivo:**
Cadastrar máquina → configurar plano → atualizar horímetro periodicamente → sistema calcula status e dispara alerta → usuário realiza revisão → registra itens/peças → sistema calcula automaticamente a próxima revisão.

**Corretivo:**
Operador identifica problema → seleciona tipo (botão) → opcionalmente descreve/foto/áudio → envia (mesmo offline) → responsável recebe alerta → inicia atendimento → executa e registra serviço/peças → conclui → histórico atualizado.

---

## 9. Stack técnica sugerida (ajustável pelo Antigravity, princípios não são)

> A IA de desenvolvimento pode escolher versões/bibliotecas específicas, mas deve respeitar: offline-first real, baixo custo de manutenção, PWA instalável, mobile-first.

- **Frontend:** React (ou framework equivalente com bom suporte a PWA), com Service Worker via Workbox.
- **Armazenamento local:** IndexedDB (ex.: Dexie.js) para dados offline e fila de sincronização.
- **Backend:** API REST simples (Node.js/Express ou equivalente) — sem necessidade de arquitetura de microsserviços para o MVP.
- **Banco de dados:** PostgreSQL (relacional, adequado ao modelo de dados acima).
- **Armazenamento de mídia:** serviço de object storage (fotos e áudios), com upload assíncrono a partir da fila de sincronização.
- **Autenticação:** simples, baseada em telefone ou e-mail + senha; token JWT.
- **Notificações de alerta:** push notification via navegador (Web Push) — evitar dependência de app nativo.

---

## 10. Critérios de aceitação do MVP

O MVP está pronto quando uma pessoa **sem treinamento** consegue, sozinha, pelo celular:

1. Cadastrar uma máquina.
2. Ver quantas horas faltam para a próxima revisão.
3. Informar que uma máquina apresentou problema (mesmo sem internet no momento).
4. Registrar uma manutenção realizada.
5. Consultar o histórico da máquina.

E adicionalmente, para validar o requisito de PWA:

6. Instalar o app na tela inicial do celular sem usar loja de aplicativos.
7. Realizar uma ação (atualizar horímetro ou reportar problema) em modo avião e ver a sincronização automática ao reconectar.

---

## 11. Regra de ouro (repetir sempre que houver dúvida de escopo)

> "O melhor sistema de manutenção agrícola não é o que possui mais funções. É o que o mecânico e o operador conseguem usar sem precisar aprender um sistema."

Antes de adicionar qualquer campo, tela, ou integração: isso ajuda diretamente a manter uma máquina agrícola em boas condições? Se não, não faz parte do MVP.
