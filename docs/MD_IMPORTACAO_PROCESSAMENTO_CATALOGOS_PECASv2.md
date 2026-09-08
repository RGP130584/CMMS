# MD — Importação e Processamento de Catálogos de Peças

## 1. Objetivo

Criar um módulo responsável por obter, armazenar, importar e transformar catálogos de peças de fabricantes de máquinas agrícolas em uma base estruturada para consulta no aplicativo.

O módulo deve trabalhar **sem uso de Inteligência Artificial**.

Toda informação apresentada no catálogo estruturado deve ser rastreável ao material de origem.

---

## 2. Princípio fundamental

O sistema **não deve inventar, inferir ou completar informações técnicas**.

Se uma informação não estiver presente na fonte processada, ela deve permanecer vazia ou ser marcada como não informada.

O sistema não pode concluir automaticamente que:

- uma peça é compatível;
- dois códigos são equivalentes;
- uma peça substitui outra;
- uma peça serve para determinado modelo;
- um intervalo de manutenção é aplicável;
- um código OEM é válido;

quando isso não estiver explicitamente suportado pela fonte.

---

## 3. Escopo

O módulo deve permitir:

1. cadastrar fabricantes;
2. cadastrar marcas;
3. cadastrar modelos;
4. localizar fontes oficiais de catálogos;
5. baixar arquivos quando o acesso e a licença permitirem;
6. importar arquivos fornecidos pelo usuário;
7. importar catálogos disponibilizados oficialmente em formato digital;
8. armazenar o arquivo original;
9. processar PDF;
10. processar documentos digitalizados por OCR;
11. extrair informações por regras determinísticas;
12. preservar diagramas e imagens;
13. identificar códigos OEM;
14. identificar descrição das peças;
15. identificar aplicação por modelo;
16. identificar grupos e sistemas;
17. identificar referências de página;
18. registrar a origem de cada informação;
19. validar os dados extraídos;
20. disponibilizar o catálogo estruturado no aplicativo.

---

# 4. Fontes de catálogo

O sistema deve trabalhar prioritariamente com fontes oficiais.

Tipos de fonte:

### 4.1 Catálogo oficial público

Catálogo disponibilizado pelo próprio fabricante sem necessidade de autenticação.

### 4.2 Catálogo oficial com acesso autorizado

Catálogo disponibilizado pelo fabricante mediante:

- login;
- licença;
- concessionária;
- contrato;
- autorização específica.

O sistema somente deve utilizar esse conteúdo quando houver autorização para sua utilização.

### 4.3 Arquivo fornecido pelo cliente

O usuário poderá fornecer:

- PDF;
- documento digital;
- catálogo escaneado;
- arquivo exportado;
- documentação técnica autorizada.

### 4.4 Integração autorizada

Quando o fabricante disponibilizar:

- API;
- integração;
- exportação;
- serviço autorizado.

A integração deve seguir as regras do fornecedor.

### 4.5 Fonte não autorizada

Não utilizar para alimentar o catálogo oficial do aplicativo.

Não realizar:

- quebra de proteção;
- bypass de login;
- contorno de DRM;
- captura de conteúdo protegido;
- scraping proibido pelos termos do fornecedor.

---

# 5. Fabricantes prioritários

A primeira etapa deve priorizar os principais fabricantes de máquinas agrícolas presentes no mercado brasileiro.

## Prioridade 1

- John Deere
- Case IH
- New Holland Agriculture
- Massey Ferguson
- Valtra
- Fendt
- Kubota

## Prioridade 2

- Deutz-Fahr
- CLAAS
- JCB
- LS Tractor
- Yanmar
- Mahindra

A lista deve ser expansível.

---

# 6. Fontes oficiais iniciais

As fontes oficiais devem ser cadastradas no sistema como fontes de catálogo.

### John Deere

A John Deere possui catálogo digital oficial de peças e pesquisa por modelo/PIN/equipamento/catálogo.

Fonte oficial:

https://digitalparts.deere.com/pt/

https://www.deere.com.br/pt/peças-e-serviços/peças/

### Case IH / New Holland

A CNH disponibiliza o MyCNHiStore para consulta de peças por equipamento/modelo, número da peça, descrição e, conforme o catálogo, chassis.

Fonte oficial:

https://www.mycnhstore.com/

### AGCO

A AGCO disponibiliza Parts Books para suas marcas, incluindo:

- Massey Ferguson
- Valtra
- Fendt

O catálogo apresenta informações e diagramas de peças.

Fonte oficial:

https://parts.agcocorp.com/

A Valtra também referencia oficialmente o AGCO Parts Books como catálogo de peças.

A Massey Ferguson também disponibiliza o AGCO Parts Books.

---

# 7. Registro da fonte

Toda fonte deve possuir:

- fabricante;
- marca;
- nome da fonte;
- endereço oficial;
- tipo;
- método de acesso;
- necessidade de autenticação;
- autorização/licença;
- data de cadastro;
- última verificação;
- status.

Exemplo:

```text
Fabricante: John Deere
Marca: John Deere
Fonte: Catálogo Digital de Peças
Tipo: Catálogo oficial online
URL: https://digitalparts.deere.com/pt/
Acesso: Público
Status: Ativo
```

---

# 8. Download do catálogo

Quando o fabricante disponibilizar um arquivo para download de maneira autorizada, o sistema deverá:

1. localizar o arquivo;
2. registrar a fonte;
3. registrar a URL;
4. baixar o arquivo;
5. armazenar o original;
6. gerar identificação única;
7. calcular hash do arquivo;
8. registrar data de download;
9. registrar versão, quando disponível;
10. iniciar processamento.

---

# 9. Arquivo original

O arquivo original nunca deve ser alterado.

Estrutura sugerida:

```text
/catalogos/
    originais/
        john-deere/
        case-ih/
        new-holland/
        massey-ferguson/
        valtra/
        fendt/
        kubota/
```

Cada arquivo deve possuir:

```text
arquivo_original
hash
fabricante
marca
fonte
url
data_download
versao
status
```

---

# 10. Versionamento

Um novo catálogo não deve sobrescrever o anterior.

Exemplo:

```text
John_Deere_8R_2024.pdf
John_Deere_8R_2025.pdf
John_Deere_8R_2026.pdf
```

O sistema deve preservar o histórico.

Isso permite saber qual informação estava disponível em determinada data.

---

# 11. Processamento de PDF

O processamento deve identificar se o PDF é:

### PDF estruturado

Texto pode ser selecionado.

Processamento:

```text
PDF
 ↓
Leitura de texto
 ↓
Identificação de tabelas
 ↓
Identificação de códigos
 ↓
Identificação de descrições
 ↓
Identificação de referências
```

### PDF digitalizado

Não existe texto selecionável.

Processamento:

```text
PDF
 ↓
Imagem
 ↓
OCR
 ↓
Texto
 ↓
Regras de extração
```

O OCR deve ser utilizado somente para transformar imagem em texto.

O OCR não deve interpretar tecnicamente a informação.

---

# 12. Extração determinística

A extração deve utilizar regras previsíveis.

Exemplos:

- padrões de códigos;
- tabelas;
- posições;
- cabeçalhos;
- identificadores;
- números de página;
- campos conhecidos;
- expressões regulares;
- relações explícitas do catálogo.

Não utilizar IA generativa para:

- interpretar compatibilidade;
- preencher campos;
- corrigir códigos;
- criar descrição;
- descobrir equivalências;
- inferir aplicação.

---

# 13. Estrutura do catálogo

O catálogo estruturado deve possuir:

```text
Fabricante
 └── Marca
      └── Modelo
           └── Série/Versão
                └── Sistema
                     └── Grupo
                          └── Diagrama
                               └── Peça
```

---

# 14. Máquina

Cada aplicação deve permitir identificar:

- fabricante;
- marca;
- modelo;
- série;
- versão;
- ano, quando informado;
- número de série/faixa de série, quando informado;
- código interno do catálogo;
- fonte.

---

# 15. Sistema da máquina

As peças devem ser associadas ao sistema quando o catálogo fornecer essa informação.

Exemplos:

- Motor
- Transmissão
- Sistema hidráulico
- Sistema elétrico
- Arrefecimento
- Combustível
- Freios
- Direção
- Cabine
- Implemento
- Plataforma
- Colheita

A classificação deve respeitar a estrutura do catálogo de origem.

---

# 16. Grupo / conjunto

O sistema deve preservar a estrutura de grupos do fabricante.

Exemplo:

```text
Motor
 └── Sistema de lubrificação
      └── Filtro
           └── Elemento filtrante
```

Não reorganizar tecnicamente o catálogo sem registrar a estrutura original.

---

# 17. Peça

Cada peça poderá possuir:

- ID interno;
- código OEM;
- descrição original;
- fabricante;
- marca;
- modelo;
- série;
- sistema;
- grupo;
- posição no diagrama;
- página;
- quantidade;
- unidade, quando informada;
- aplicação;
- status;
- fonte;
- data da informação.

---

# 18. Código OEM

O código OEM deve ser armazenado exatamente como aparece na fonte.

Não:

- alterar;
- completar;
- remover caracteres;
- substituir;
- criar código.

Se houver diferentes formatos, preservar o valor original e, se necessário, criar um campo normalizado separado.

---

# 19. Descrição

A descrição original deve ser preservada.

Exemplo:

```text
Descrição original:
ELEMENTO FILTRANTE
```

Caso seja necessário apresentar uma descrição simplificada no aplicativo, ela deve ser armazenada em campo separado.

A descrição original nunca deve ser perdida.

---

# 20. Quantidade

Quando o catálogo indicar quantidade:

```text
Quantidade: 2
```

Se não informar:

```text
Quantidade: não informado
```

Nunca presumir quantidade.

---

# 21. Diagramas

Quando o catálogo possuir diagramas, o sistema deve preservar:

- imagem;
- página;
- número do diagrama;
- grupo;
- posição;
- relação com a peça.

Exemplo:

```text
Diagrama: 04
Posição: 17
Peça: RE123456
Página: 247
```

---

# 22. Compatibilidade

A compatibilidade deve ser baseada exclusivamente na fonte.

Status:

```text
CONFIRMADA
NÃO CONFIRMADA
DESCONTINUADA
SUBSTITUÍDA
NÃO INFORMADA
```

O sistema não pode transformar uma coincidência de código ou descrição em compatibilidade.

---

# 23. Peças equivalentes

Uma peça equivalente somente deve ser registrada quando a fonte informar explicitamente a equivalência.

Exemplo:

```text
Peça original:
RE123456

Substituta:
RE789012

Tipo:
Substituição oficial
```

Não criar equivalência por similaridade textual.

---

# 24. Peças compatíveis entre modelos

Uma mesma peça poderá estar relacionada a vários modelos.

Exemplo:

```text
RE123456

Aplicações:
John Deere 6110
John Deere 6120
John Deere 6130
```

Cada aplicação deve possuir sua própria origem.

---

# 25. Mudança de código

Quando o fabricante indicar:

```text
Código antigo → Código novo
```

registrar:

- código anterior;
- código atual;
- tipo de relação;
- fonte;
- data;
- página.

Nunca apagar o código anterior.

---

# 26. Rastreabilidade

Cada registro extraído deve permitir voltar à origem.

Mínimo:

```text
Fonte
Catálogo
Arquivo
Página
Seção
Diagrama
Data
Versão
```

Exemplo:

```text
Peça: RE123456
Fonte: John Deere
Catálogo: 8R
Arquivo: John_Deere_8R_2026.pdf
Página: 247
Diagrama: 04
Versão: 2026
```

---

# 27. Validação

Depois da extração, executar validações automáticas.

### Validação de estrutura

Verificar:

- código vazio;
- descrição vazia;
- modelo inexistente;
- fabricante inexistente;
- página inválida;
- duplicidade.

### Validação de referência

Verificar:

- código aparece na página indicada;
- posição aparece no diagrama;
- modelo pertence ao catálogo;
- grupo pertence ao modelo.

### Validação de duplicidade

Detectar:

- mesmo código;
- mesma aplicação;
- mesma fonte;
- versões diferentes.

Duplicidade não deve apagar automaticamente registros.

---

# 28. Erros de OCR

Quando OCR produzir resultado duvidoso, o sistema deve marcar:

```text
STATUS = REVISÃO NECESSÁRIA
```

Exemplo:

```text
Código extraído:
RE12345B?

Status:
REVISÃO NECESSÁRIA
```

O sistema não deve tentar adivinhar o código correto.

---

# 29. Revisão humana

Registros com baixa qualidade devem entrar em fila de revisão.

A revisão deve mostrar:

```text
Informação extraída
+
Página original
+
Imagem/diagrama
```

O usuário poderá:

- confirmar;
- corrigir;
- rejeitar.

Toda alteração manual deve registrar:

- usuário;
- data;
- valor anterior;
- valor novo;
- motivo.

---

# 30. Catálogo publicado

Somente registros:

```text
VALIDADO
```

podem ser publicados no catálogo principal do aplicativo.

Registros:

```text
PENDENTE
REVISÃO NECESSÁRIA
REJEITADO
```

não devem aparecer como informação oficial.

---

# 31. Atualização do catálogo

O sistema deve permitir executar novamente o processamento quando surgir nova versão.

Fluxo:

```text
Nova fonte
 ↓
Novo arquivo
 ↓
Hash
 ↓
Comparação
 ↓
Nova versão
 ↓
Processamento
 ↓
Validação
 ↓
Publicação
```

---

# 32. Comparação entre versões

O sistema deve identificar:

- peças novas;
- peças removidas;
- códigos alterados;
- descrições alteradas;
- aplicações alteradas;
- diagramas alterados;
- grupos alterados.

Nunca apagar automaticamente o histórico anterior.

---

# 33. Catálogo e aplicativo

O usuário do aplicativo não precisa conhecer a estrutura interna do catálogo.

A pesquisa deve ser simples.

Exemplo:

```text
Pesquisar peça

[ filtro de óleo        ]
```

Resultado:

```text
Filtro de óleo

Código OEM:
RE123456

Aplicação:
John Deere 8R

Sistema:
Motor

Fonte:
Catálogo John Deere
```

---

# 34. Pesquisa

Permitir pesquisa por:

- código OEM;
- descrição;
- fabricante;
- marca;
- modelo;
- sistema;
- grupo;
- posição;
- aplicação.

---

# 35. Integração com manutenção

O catálogo poderá ser utilizado pelo módulo de manutenção para:

- identificar peças da revisão;
- identificar peça da manutenção corretiva;
- consultar código OEM;
- consultar aplicação;
- consultar diagrama;
- consultar compatibilidade;
- registrar a peça utilizada no histórico.

O catálogo não deve controlar estoque.

---

# 36. Integração com revisão preventiva

Uma revisão poderá referenciar peças existentes no catálogo.

Exemplo:

```text
Revisão 500 horas

Peças:
- Filtro de óleo — RE123456
- Filtro de combustível — RE789012
- Filtro hidráulico — RE456789
```

Essas relações devem ser cadastradas somente quando houver fonte ou configuração autorizada.

---

# 37. O que este módulo NÃO faz

O módulo não deve implementar:

- estoque;
- compras;
- fornecedores;
- vendas;
- e-commerce;
- preço;
- pedido de compra;
- financeiro;
- controle de almoxarifado;
- logística;
- previsão de consumo;
- sugestão de compra;
- IA generativa;
- inferência de compatibilidade.

---

# 38. Regra absoluta de confiabilidade

O sistema deve seguir:

```text
FONTE
↓
EXTRAÇÃO
↓
VALIDAÇÃO
↓
PUBLICAÇÃO
```

Nunca:

```text
FONTE
↓
INTERPRETAÇÃO
↓
INVENÇÃO
```

---

# 39. Política de conteúdo

Toda informação técnica deve possuir origem.

Se não houver origem:

```text
NÃO PUBLICAR COMO DADO OFICIAL
```

---

# 40. Resultado esperado

Ao final deste módulo, o aplicativo deverá possuir uma base estruturada de catálogos de peças capaz de responder:

> Qual peça pertence a esta máquina?

> Qual é o código OEM?

> Em qual sistema ela está?

> Onde aparece no diagrama?

> Qual modelo utiliza essa peça?

> Quais aplicações estão explicitamente registradas?

> Qual é a fonte?

> Em qual página a informação aparece?

> Qual versão do catálogo originou o dado?

Tudo isso **sem IA e sem inventar informações**.

---

# 41. Regra para implementação pelo Antigravity

O desenvolvimento deve ser incremental.

Executar somente uma etapa por vez.

Ordem:

```text
1. Cadastro de fabricantes e fontes
2. Armazenamento dos catálogos originais
3. Download autorizado
4. Controle de versão e hash
5. Leitura de PDF
6. OCR
7. Extração determinística
8. Estruturação
9. Diagramas
10. Compatibilidade
11. Rastreabilidade
12. Validação
13. Revisão humana
14. Publicação
15. Pesquisa no aplicativo
16. Integração com manutenção
```

Após cada etapa:

```text
IMPLEMENTAR
↓
TESTAR
↓
VALIDAR
↓
REGISTRAR RESULTADO
↓
SOMENTE ENTÃO AVANÇAR
```

Não implementar etapas futuras antecipadamente.

---

# 42. Regra de parada

Se durante a implementação surgir necessidade de:

- IA;
- estoque;
- compras;
- ERP;
- integração não autorizada;
- nova funcionalidade;
- alteração da arquitetura;
- mudança de escopo;

o desenvolvimento deve parar e registrar a decisão antes de continuar.

---

# 43. Critério de conclusão

O módulo somente estará concluído quando for possível:

1. registrar uma fonte oficial;
2. importar um catálogo autorizado;
3. preservar o original;
4. processar o documento;
5. extrair dados;
6. preservar diagramas;
7. relacionar peças aos modelos;
8. registrar códigos OEM;
9. registrar compatibilidades explicitamente informadas;
10. rastrear cada informação até a fonte;
11. validar os dados;
12. publicar somente dados validados;
13. pesquisar as peças no aplicativo;
14. utilizar as peças nas manutenções.

---

# 44. Regra final

**Catálogo oficial é fonte de verdade.**

O sistema organiza e disponibiliza a informação.

O sistema não cria informação técnica.

**Sem IA.  
Sem inferência.  
Sem invenção.  
Com fonte.  
Com rastreabilidade.  
Com validação.**

---

# 45. Fotos reais dos equipamentos

O cadastro de cada máquina deve permitir registrar fotos reais do equipamento.

A foto pertence à **máquina cadastrada**, e não somente ao modelo.

## 45.1 Foto principal

Cada máquina deve possuir uma foto principal.

Exemplo:

```text
Máquina: John Deere 8R 310
Foto principal: /equipamentos/8R310_001.jpg
```

A foto pode ser:

- capturada pela câmera do celular/tablet;
- selecionada da galeria;
- enviada como arquivo.

## 45.2 Galeria de fotos

Também deve ser possível adicionar outras fotos à mesma máquina.

Exemplos:

- equipamento completo;
- lateral;
- traseira;
- motor;
- painel;
- implemento;
- plaqueta de identificação;
- número de série;
- horímetro;
- componente com problema.

## 45.3 Regras

As fotos devem possuir:

- ID;
- máquina;
- arquivo;
- data;
- usuário que realizou o registro;
- tipo da foto, quando informado.

A foto original deve ser preservada.

O sistema não deve alterar tecnicamente a fotografia.

---

# 46. Pré-cadastro de modelos por marca

O sistema deve possuir uma base inicial de fabricantes, marcas e modelos para reduzir a necessidade de digitação.

Fluxo:

```text
Marca
 ↓
Modelos disponíveis
 ↓
Modelo
 ↓
Série / Versão
 ↓
Máquina
```

Exemplo:

```text
Marca: John Deere

Modelos:
- 6110
- 6120
- 6130
- 8R 280
- 8R 310
```

O usuário seleciona o modelo existente em vez de digitá-lo manualmente.

---

# 47. Base de modelos

A base de modelos deve ser independente do catálogo de peças.

Isso significa:

```text
BASE DE MODELOS
        ≠
CATÁLOGO DE PEÇAS
```

Um modelo pode existir na base de máquinas mesmo que ainda não exista um catálogo de peças importado para ele.

Da mesma forma, a existência de um catálogo de peças não deve obrigar o cadastro de uma máquina daquele modelo.

---

# 48. Fonte dos modelos

Sempre que possível, modelos devem ser cadastrados a partir de fontes confiáveis e preferencialmente oficiais.

Cada modelo deve registrar:

- fabricante;
- marca;
- modelo;
- série;
- versão;
- ano/faixa de anos, quando disponível;
- fonte;
- data da informação;
- status.

Não inventar modelos ou versões.

---

# 49. Modelos por fabricante

A base deve permitir expansão progressiva.

Estrutura:

```text
Fabricante
 └── Marca
      └── Família
           └── Modelo
                └── Série
                     └── Versão
```

Nem todos os fabricantes utilizarão todos os níveis.

Campos não informados devem permanecer vazios.

---

# 50. Cadastro manual

Mesmo com o pré-carregamento, o usuário poderá cadastrar um modelo que não esteja na base.

Nesse caso:

```text
Modelo não encontrado

[ Cadastrar modelo ]
```

O sistema deve marcar o registro como:

```text
PENDENTE DE VALIDAÇÃO
```

até que a origem seja confirmada, quando essa validação fizer parte do fluxo administrativo do sistema.

O modelo cadastrado manualmente não deve ser apresentado como modelo oficial sem validação.

---

# 51. Foto + modelo

A imagem do modelo e a foto real da máquina devem ser conceitos diferentes.

### Imagem de referência do modelo

Representa o modelo/família.

### Foto real

Representa a máquina específica do cliente.

Exemplo:

```text
MODELO
John Deere 8R 310
[imagem de referência]

MÁQUINA
John Deere 8R 310
Nº série: XXXXX
[foto real do equipamento]
```

---

# 52. Cadastro simplificado da máquina

O fluxo principal deve ser:

```text
1. Escolher marca
2. Escolher modelo
3. Escolher série/versão, se disponível
4. Tirar/adicionar foto
5. Informar número de série
6. Informar horímetro
7. Salvar
```

O sistema deve evitar exigir informações que não sejam necessárias para começar a utilizar a máquina.

---

# 53. Identificação visual

A foto real deve aparecer nos principais pontos em que a máquina for apresentada.

Exemplo:

```text
┌─────────────────────────┐
│      FOTO DA MÁQUINA    │
│                         │
└─────────────────────────┘

John Deere 8R 310
Horímetro: 2.450 h

🟢 Em operação

Próxima revisão: 2.500 h
```

Isso facilita a identificação em ambientes com várias máquinas semelhantes.

---

# 54. Uso da foto no histórico

Quando uma ocorrência de manutenção for registrada, o sistema poderá associar fotos à ocorrência.

Exemplo:

```text
Máquina
 ↓
Problema
 ↓
Fotos do problema
 ↓
Manutenção
 ↓
Fotos após manutenção
```

As fotos devem permanecer vinculadas ao registro histórico correspondente.

---

# 55. Regra de confiabilidade visual

O sistema não deve utilizar a fotografia para determinar automaticamente:

- modelo;
- número de série;
- peça;
- compatibilidade;
- defeito;
- fabricante;
- especificação técnica.

A foto é um recurso de identificação e documentação.

Nenhuma informação técnica deve ser inferida automaticamente a partir dela.

---

# 56. Resultado esperado

O cadastro deverá permitir que o usuário identifique uma máquina rapidamente:

```text
┌──────────────────────────┐
│                          │
│      FOTO REAL           │
│      DA MÁQUINA          │
│                          │
└──────────────────────────┘

John Deere
8R 310

Nº série: XXXXXXXX
Horímetro: 2.450 h

[ FAZER REVISÃO ]

[ INFORMAR PROBLEMA ]

[ ATUALIZAR HORÍMETRO ]

[ VER HISTÓRICO ]
```

A experiência deve continuar seguindo o princípio:

**Abrir → identificar → entender → executar.**

---

# 57. Regra final atualizada

O módulo deve combinar:

```text
CATÁLOGOS OFICIAIS
        +
BASE DE MODELOS
        +
FOTOS REAIS
        +
DADOS ESTRUTURADOS
        +
RASTREABILIDADE
        +
VALIDAÇÃO
```

Sem IA.

Sem inferência técnica.

Sem invenção de dados.

