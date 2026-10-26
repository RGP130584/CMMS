# Especificação complementar — Cadastro de Operadores e Horas por Horímetro

**Projeto:** CMMS Agrícola & Frotas  
**Tipo:** Complemento funcional ao `SPCEC_CMMS.md`  
**Status:** Proposta para implementação  
**Regra de compatibilidade:** Esta especificação complementa o modelo existente. Não substitui a arquitetura Offline-First/PWA, o banco local Dexie/IndexedDB, nem o cadastro atual de máquinas.

## 1. Objetivo

Cadastrar motoristas e operadores de tratores, máquinas agrícolas, caminhões e equipamentos, relacioná-los às máquinas já cadastradas e contabilizar dias e horas operadas com base em leituras manuais do horímetro da máquina.

Não usar horário de entrada e saída como fonte de cálculo das horas de operação. O total é calculado pela diferença entre horímetro final e inicial.

## 2. Cadastro do operador

Campos sugeridos:
- Identificador local e identificador de sincronização, conforme padrão existente.
- Nome completo (obrigatório).
- CPF (opcional, com validação se preenchido).
- Telefone (opcional).
- Função principal: tratorista, operador de máquinas agrícolas, motorista de caminhão, operador de máquinas pesadas ou multifuncional.
- Dados de habilitação: possui CNH, categoria e validade, quando aplicável.
- Observações (opcional).
- Status: ativo, inativo ou bloqueado.
- Empresa/conta proprietária, seguindo o isolamento multiempresa já adotado pelo produto.

O cadastro do operador não deve exigir criação de login. Caso futuramente seja necessário permitir acesso ao sistema, isso deve ser associado ao modelo de usuários existente, sem duplicar identidades ou permissões.

## 3. Associação com máquinas

- Selecionar máquinas existentes no cadastro atual do CMMS; não criar catálogo paralelo de máquinas.
- Permitir associar um operador a uma ou várias máquinas.
- Permitir remover uma autorização sem apagar o histórico de operações anteriores.
- Listar apenas máquinas pertencentes à mesma empresa/conta.
- Máquina inativa ou excluída logicamente não deve estar disponível para novas associações/operações.
- A interface deve exibir os identificadores disponíveis no cadastro atual (por exemplo, apelido, tipo, fabricante/modelo), sem pressupor campos que não existam.

## 4. Registro de operação

Cada lançamento representa um período de operação de um operador em uma máquina.

Campos:
- Identificador do registro.
- Empresa/conta.
- Operador.
- Máquina.
- Data da operação.
- Horímetro inicial informado manualmente.
- Horímetro final informado manualmente.
- Horas operadas, calculadas pelo sistema.
- Observação opcional.
- Data/hora de criação e de última alteração, conforme padrão existente.
- Estado de sincronização Offline-First, usando a fila existente.

**Fórmula:** `horas_operadas = horimetro_final - horimetro_inicial`.

Não solicitar horários de entrada/saída para calcular horas de máquina. O campo de data identifica o dia operacional. Se uma operação atravessar a meia-noite, o produto deverá permitir registrar os períodos por dia, respeitando a continuidade do horímetro.

## 5. Regras de validação e integridade

1. Os valores do horímetro devem ser numéricos e não negativos.
2. O horímetro final deve ser maior ou igual ao inicial; para um registro com duração positiva, deve ser maior.
3. O intervalo lançado deve ser compatível com o último horímetro conhecido da máquina. Divergências devem ser sinalizadas e exigir revisão autorizada, sem sobrescrever silenciosamente o histórico.
4. Uma operação não pode ser salva duas vezes por repetição de envio/sincronização. Usar o mecanismo de idempotência já disponível ou um identificador único do registro local.
5. Impedir sobreposição ou duplicidade de intervalos de horímetro para a mesma máquina, exceto quando houver correção explicitamente autorizada e auditada.
6. Não contabilizar integralmente o mesmo intervalo da máquina para dois operadores diferentes. Se houver troca de operador, registrar leituras que delimitem cada trecho.
7. Correções devem preservar o registro anterior e deixar trilha de auditoria, alinhadas ao princípio de histórico append-only do CMMS.
8. Registros feitos offline devem permanecer locais e sincronizar pela fila existente; conflitos não podem descartar dados silenciosamente.
9. Respeitar empresa/conta, permissões e validações já existentes.

## 6. Relação com o horímetro oficial da máquina

O registro de operação deve alimentar a contabilização de horas do operador e ser conciliado com o histórico de horímetro da máquina.

- Não criar um segundo horímetro independente.
- Reutilizar `RegistroHorimetro` e o mecanismo atual de atualização sempre que compatível com a implementação existente.
- Não reduzir `Maquina.horimetro_atual`.
- Se a leitura final for maior que o valor oficial atual e passar nas validações, atualizar o valor oficial uma única vez e gerar o respectivo registro histórico.
- Se a leitura for igual ao valor oficial, não criar atualização duplicada.
- Se houver divergência ou conflito de sincronização, sinalizar para revisão em vez de substituir o valor automaticamente.

## 7. Indicadores e relatórios

Disponibilizar consultas por intervalo de datas:
- Dias com pelo menos uma operação válida por operador.
- Total de horas operadas por operador.
- Total de horas por máquina.
- Detalhamento diário por operador e máquina.
- Histórico de operações e registros corrigidos.
- Exportação CSV, seguindo o padrão de relatórios existente, se disponível.

Um dia deve ser contado uma única vez por operador, mesmo que ele opere mais de uma máquina ou faça vários lançamentos no mesmo dia. As horas são somadas por registro válido, depois de eliminar duplicidades.

## 8. Telas

Adicionar ao menu existente, sem reorganizar outras áreas desnecessariamente:
1. Lista e cadastro/edição de operadores.
2. Associação de máquinas autorizadas, usando o cadastro existente.
3. Registro de operação com operador, máquina, data, horímetro inicial e final.
4. Histórico/relatório por operador e máquina.

Seguir mobile-first, formulários curtos e uso offline. Não criar folha de pagamento, cálculo salarial, ponto eletrônico, controle de combustível, estoque ou módulo financeiro.

## 9. Critérios de aceite

- É possível cadastrar um operador sem criar login.
- É possível selecionar apenas máquinas existentes e pertencentes à conta correta.
- É possível registrar manualmente os horímetros inicial e final.
- O sistema calcula corretamente a diferença em horas.
- Os dias operados não são duplicados no resumo por operador.
- A mesma faixa de horímetro não é contabilizada para operadores diferentes.
- A atualização do horímetro oficial não é duplicada.
- O fluxo funciona offline e sincroniza sem perder nem duplicar registros.
- O histórico de operação e de correções permanece auditável.
- Os registros não alteram nem removem o histórico de manutenção existente.

## 10. Diretriz de implementação

Antes de codificar, inspecionar o esquema atual de Dexie, os componentes de cadastro de máquinas e atualização de horímetro, o mecanismo de autenticação/empresa e a fila de sincronização. Adaptar os nomes e relações ao código real. Não presumir backend Supabase conectado nem criar tabelas remotas até a integração de persistência do CMMS estar confirmada.