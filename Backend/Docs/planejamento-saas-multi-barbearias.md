# Planejamento SaaS Multi-Barbearias

## Objetivo

Transformar o projeto atual em um SaaS de gestao para multiplas barbearias, com foco em:

- agendamento com horarios disponiveis reais
- gestao de equipe e comissao por barbeiro
- vendas de servicos e produtos
- controle de estoque
- dashboard operacional e financeiro
- base preparada para crescer sem retrabalho estrutural

## Direcao do produto

O sistema deve ser construido como `multi-tenant` desde o inicio.

Isso significa:

- cada barbearia tera seus proprios dados
- usuarios pertencem a uma ou mais barbearias
- servicos, barbeiros, agenda, estoque, vendas e relatorios sao separados por barbearia
- o front pode ser padrao, mas com configuracoes visuais e operacionais por cliente

## Principios de implementacao

- fazer o backend multi-barbearias antes de aprofundar o front
- manter o MVP simples, mas sem travar escala futura
- priorizar regras de negocio e banco bem modelados
- evitar customizacao profunda por cliente no inicio
- construir modulos fechados e incrementais

## Situacao atual do projeto

Hoje o projeto ja tem:

- schema Prisma com usuarios, clientes, barbeiros, servicos, agendamentos, produtos e vendas
- backend em Node.js + Express + TypeScript
- estrutura de repositorios e services iniciada

Hoje ainda faltam pontos centrais:

- separacao por barbearia
- autenticacao e autorizacao
- rotas implementadas
- regras reais de disponibilidade de agenda
- controle de comissao flexivel
- fluxo financeiro e de caixa

## Arquitetura recomendada

### 1. Entidade central: barbearia

Criar uma entidade `Barbearia` ou `Tenant` para ser a raiz do sistema.

Campos sugeridos:

- id
- nomeFantasia
- razaoSocial
- cnpj
- slug
- telefone
- email
- endereco
- logoUrl
- corPrimaria
- ativo
- createdAt
- updatedAt

### 2. Relacao de usuarios com barbearias

Nao prender o usuario a apenas uma barbearia. O ideal e uma tabela de associacao.

Sugestao:

- `Usuario`
- `Barbearia`
- `UsuarioBarbearia`

`UsuarioBarbearia` deve guardar:

- idUsuario
- idBarbearia
- papel
- ativo
- dataEntrada

Papeis sugeridos:

- owner
- admin
- gerente
- barbeiro
- recepcao
- financeiro

### 3. Separacao de dados por barbearia

Quase tudo deve carregar `idBarbearia`:

- clientes
- barbeiros
- servicos
- agendamentos
- produtos
- vendas
- configuracoes
- relatorios materializados no futuro

### 4. Comissao por barbeiro e por servico

Evitar um unico campo `comissao` no barbeiro.

Criar algo como `BarbeiroServico` com:

- idBarbearia
- idBarbeiro
- idServico
- tipoComissao
- valorComissao
- vigenciaInicio
- vigenciaFim

Isso permite:

- percentual por servico
- valor fixo por procedimento
- historico de alteracoes
- promocoes temporarias

### 5. Agenda com disponibilidade real

Nao basta so verificar conflitos de horario. O sistema precisa modelar disponibilidade.

Entidades recomendadas:

- `HorarioTrabalhoBarbeiro`
- `BloqueioAgenda`
- `FolgaBarbeiro`
- `Agendamento`
- `AgendamentoServico`

Regras importantes:

- horario de funcionamento da barbearia
- jornada por barbeiro
- intervalos
- folgas
- bloqueios manuais
- antecedencia minima de agendamento
- limite maximo de dias no futuro
- tempo de tolerancia para atraso

### 6. Vendas e caixa

Separar operacao de venda de controle financeiro.

Entidades recomendadas:

- `Venda`
- `VendaItemProduto`
- `VendaItemServico`
- `MovimentoEstoque`
- `Caixa`
- `MovimentoCaixa`
- `RepasseComissao`

### 7. Configuracoes por barbearia

Criar uma tabela de configuracoes para nao espalhar regra pelo codigo.

Exemplos:

- horario de funcionamento
- intervalo padrao entre atendimentos
- politicas de cancelamento
- metodos de pagamento aceitos
- dias de fechamento
- branding basico

## Roadmap recomendado

## Fase 1. Fundacao multi-barbearias

Objetivo: preparar a base estrutural do SaaS.

Entregas:

- criar entidade `Barbearia`
- criar `UsuarioBarbearia`
- adicionar `idBarbearia` nas tabelas principais
- revisar enums de papeis e status
- criar seeds minimos com uma barbearia inicial
- padronizar `createdAt` e `updatedAt`

Resultado esperado:

- o banco ja suporta mais de uma barbearia sem misturar dados

## Fase 2. Autenticacao e autorizacao

Objetivo: controlar acesso por tenant e por papel.

Entregas:

- login
- hash de senha e fluxo de autenticacao
- middleware de autenticacao
- middleware de escopo por barbearia
- middleware de permissao por papel
- identificacao da barbearia ativa no contexto da requisicao

Resultado esperado:

- cada usuario enxerga apenas os dados da barbearia correta

## Fase 3. Cadastros principais

Objetivo: habilitar a operacao basica do sistema.

Entregas:

- CRUD de barbearias
- CRUD de usuarios
- CRUD de barbeiros
- CRUD de clientes
- CRUD de servicos
- CRUD de produtos
- configuracoes da barbearia

Resultado esperado:

- ja e possivel configurar uma barbearia inteira no sistema

## Fase 4. Agenda e disponibilidade

Objetivo: entregar o coracao do produto.

Entregas:

- agenda por barbeiro
- cadastro de horarios de trabalho
- bloqueios e folgas
- endpoint de horarios disponiveis
- criacao, confirmacao, cancelamento e conclusao de agendamentos
- prevencao de conflito de horario
- suporte a duracao por servico

Resultado esperado:

- cliente ou recepcao consegue visualizar horarios validos e agendar com seguranca

## Fase 5. Comissao automatica

Objetivo: refletir a operacao real da barbearia.

Entregas:

- tabela de comissao por barbeiro/servico
- calculo de comissao no fechamento do atendimento
- historico de comissoes geradas
- relatorio por barbeiro e por periodo
- status de repasse

Resultado esperado:

- o dono consegue acompanhar quanto cada barbeiro gerou e quanto precisa receber

## Fase 6. Vendas, estoque e caixa

Objetivo: consolidar a operacao comercial.

Entregas:

- venda de produtos
- venda de servicos
- venda mista
- baixa automatica de estoque
- movimentacoes de estoque
- abertura e fechamento de caixa
- entradas e saidas manuais
- historico de vendas

Resultado esperado:

- o sistema passa a cobrir o dia a dia financeiro e operacional da loja

## Fase 7. Dashboard e relatorios

Objetivo: dar visibilidade de negocio.

Entregas:

- faturamento por periodo
- ticket medio
- barbeiro com maior receita
- servicos mais vendidos
- produtos com baixo estoque
- taxa de cancelamento e no-show
- total de comissao a pagar

Resultado esperado:

- o dono consegue tomar decisao com base em dados

## Fase 8. Recursos de crescimento

Objetivo: aumentar valor percebido e escala do SaaS.

Entregas:

- pagina publica de agendamento
- notificacoes por WhatsApp
- programa de fidelidade
- pacotes e assinaturas
- multiunidade
- dominio customizado para pagina publica

## Ordem tecnica de implementacao no backend

Sequencia recomendada:

1. refatorar schema Prisma para multi-barbearias
2. gerar migracoes
3. revisar seed
4. implementar autenticacao
5. implementar contexto de tenant
6. criar rotas base de usuarios, barbeiros, clientes e servicos
7. criar modulo de agenda
8. criar modulo de comissao
9. criar modulo de vendas e estoque
10. criar dashboard

## Ordem tecnica de implementacao no front

Sequencia recomendada:

1. login
2. selecao de barbearia ativa, se o usuario participar de mais de uma
3. layout admin padrao
4. cadastro de barbeiros, clientes, servicos e produtos
5. agenda
6. vendas e caixa
7. dashboard
8. configuracoes
9. pagina publica de agendamento

## MVP recomendado

Se a ideia e subir rapido sem perder base estrutural, o MVP deve incluir:

- multi-barbearias no banco
- login e permissoes
- barbeiros
- clientes
- servicos
- agenda com horarios disponiveis
- comissao por barbeiro/servico
- vendas simples
- estoque simples
- dashboard basico

Evitar no MVP:

- personalizacao profunda por cliente
- multiunidade
- integracoes complexas
- ERP financeiro completo
- app mobile nativo

## Riscos que valem atencao

- tentar fazer frontend personalizado por cliente cedo demais
- criar banco de uma barbearia e adaptar depois
- deixar permissao por papel para depois
- modelar agenda sem bloqueios e jornada real
- calcular comissao apenas com um campo fixo no barbeiro
- misturar fluxo de venda com fluxo de caixa sem separar conceitos

## Definicoes de produto que voce deve fechar cedo

- quem pode cadastrar barbeiros e usuarios
- se cliente final tera login ou apenas agendamento publico
- se um barbeiro pode atender em mais de uma barbearia
- se a comissao sera percentual, fixa ou ambas
- se um agendamento pode ter mais de um servico
- se a venda de servico acontece automaticamente ao concluir atendimento
- como sera tratado cancelamento, atraso e no-show

## Proxima etapa recomendada

A proxima etapa ideal no projeto e:

1. refatorar o schema Prisma para multi-barbearias
2. desenhar os modulos do backend
3. implementar autenticacao com contexto de tenant
4. iniciar pelos CRUDs base antes da agenda

## Entrega esperada por sprint inicial

### Sprint 1

- schema multi-barbearias
- migracao inicial
- seed atualizado
- auth base

### Sprint 2

- usuarios e papeis
- barbeiros
- clientes
- servicos

### Sprint 3

- agenda
- horarios disponiveis
- bloqueios

### Sprint 4

- comissao
- vendas
- estoque
- dashboard inicial

## Resumo executivo

O caminho mais seguro e escalavel e construir o backend como SaaS multi-barbearias desde ja, com front padrao e configuravel. O foco inicial deve estar na base estrutural, autenticacao, separacao por tenant, agenda real e comissao flexivel. Isso preserva velocidade no MVP e evita retrabalho pesado quando o sistema comecar a crescer.
