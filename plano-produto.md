# Plano de Produto — App Carteirinha Digital COPVASF (Versão Produção)

## Contexto

O MVP da carteirinha digital do COPVASF (Conselho de Pastores do Vale do São Francisco) foi apresentado e aprovado pelo cliente. Foi construído em React Native + Expo com dados 100% estáticos, apenas para validar o conceito visual e a experiência do usuário. Não foi estruturado para manutenção e evolução.

Agora iniciamos o **produto real**, migrando o projeto existente (sem criar do zero), com dados dinâmicos vindos de uma API, TypeScript e testes onde fizer sentido.

### Os dois projetos e como se relacionam

O ecossistema tem **dois repositórios**, ambos sob `~/Documentos/Frela/`, desenvolvidos **juntos** via Spec-Driven Development:

- **`church-membership-card` (este repositório)** — app React Native + Expo. Cliente puro: renderiza a carteirinha, faz login pela API, guarda o token, consome os dados e funciona offline com o último cache.
- **`church-membership-card-server` (repositório à parte, ainda vazio)** — **monorepo** que concentra toda a parte server-side e administrativa:
  - `apps/api` — **NestJS + MongoDB (Mongoose)**. Uma única API que serve tanto o app mobile (endpoints do membro) quanto o admin (auth de admin + CRUD de membros), com autorização por papel. Dona de **toda a lógica de negócio**: autenticação, emissão/renovação de JWT e acesso ao banco.
  - `apps/admin` — **web React + Vite + Refine (ou React Admin)**. Painel de CRUD dos membros, consumindo a API NestJS. (NestJS não renderiza UI; o front do admin é um app web separado ao lado dele.)

O server roda **100% em Docker Compose** (api + MongoDB + admin), sem dependência instalada localmente — mesma filosofia do app.

**Por que construir junto:** app e API nascem na mesma iteração de cada feature, então o contrato é validado dos dois lados de uma vez — sem problemas de compatibilidade.

**Consequência para este repo (app):** o app **não implementa regra de autenticação nem de negócio**. Ele apenas: (1) envia credenciais para `/auth/login` e guarda o token; (2) anexa o token nas requisições; (3) renova via `/auth/refresh`; (4) consome `/members/me` e exibe; (5) mantém sessão e cache offline; (6) faz logout. Isso define a arquitetura enxuta adotada abaixo.

### Ambiente e repositório

O ambiente de desenvolvimento do app continua em Docker via Docker Compose (Node 20 Alpine). Este repositório já existe em `git@github-iacf:IACF/church-membership-card.git` com o MVP comitado na branch `master`. O produto real deve ser desenvolvido na branch `v2-production`.

---

## Como vamos trabalhar: Spec-Driven Development (cross-repo, assistido por IA)

O desenvolvimento é **totalmente assistido por IA e dirigido por specs**, cobrindo **os dois repositórios juntos**. A spec — não a prosa deste plano — é o artefato que dirige a implementação.

### Onde vivem as specs

As specs são **cross-cutting** e ficam no repositório do server (o hub que concentra API + admin + contrato):

```
church-membership-card-server/specs/<feature>/
├── requirements.md   # user stories + critérios de aceitação (Given/When/Then), cobrindo API, admin e app
├── design.md         # endpoints, modelo de dados, contrato, fluxo, decisões técnicas
└── tasks.md          # checklist de implementação dividido por lado (api / admin / app)
```

Este repositório do app **referencia** essas specs; não mantém uma pasta `specs/` própria.

### O ciclo de cada feature (nos dois repos)

1. **Spec** — escrever `requirements.md` → `design.md` → `tasks.md` no repo do server, cobrindo os dois lados. **Requer aprovação explícita da spec antes de implementar.**
2. **API primeiro** — implementar o(s) endpoint(s) no NestJS conforme a spec; o `@nestjs/swagger` atualiza o `openapi.json`.
3. **Tipos no app** — o app **regenera os tipos** a partir do OpenAPI (`openapi-typescript`), garantindo compatibilidade em tempo de compilação.
4. **Testes a partir dos critérios** — cada critério de aceitação vira um teste (TDD derivado da spec).
5. **Implementação assistida por IA** — app (e admin, quando aplicável) implementados contra a spec e os tipos gerados; `tasks.md` marcado.
6. **Verificação** — todo critério coberto por teste verde; comportamento conferido contra a spec e o contrato.
7. **Refatorar** — com a rede de testes protegendo.

### Relação com TDD

SDD define **o quê** (critérios); TDD garante **que funciona** (teste falha → implementa → passa → refatora). Regra: nenhuma lógica de cliente (hook, store, cliente de API, guard de sessão) é implementada sem um teste derivado de um critério de aceitação. Componentes visuais puros podem ser implementados primeiro e testados com renderização/snapshot.

---

## Princípios de código (app)

### Arquitetura right-sized (proporcional ao cliente)

Como o servidor é dono da lógica, **não** usamos Clean Architecture livro-texto (usecases/repositories/mappers/datasources para poucos endpoints seria over-engineering). A separação é por responsabilidade técnica, enxuta e clara:

```
UI (telas, componentes)
  → hooks (React Query: estados de loading/erro/cache)
    → api (Axios + tipos gerados do OpenAPI)
    → session (token + SecureStore)
  ← model (tipos do app; aliases dos tipos gerados + erros)
```

Dependências apontam da UI para dentro; `model` é puro e sem dependências de framework.

### Clean Code

- Responsabilidade única em funções e componentes.
- Nomes que revelam intenção (`getMe`, não `getData`).
- Sem comentários de "o quê" — código autoexplicativo. Comentário só para "por quê" de regra não óbvia.
- Sem código morto ou imports não usados.
- **Máxima abstração necessária — sem over-engineering.**

---

## Estrutura de pastas (app)

```
/
├── app/                         # Expo Router (entry points de navegação)
│   ├── _layout.tsx              # Root: providers globais + guard de sessão
│   ├── (auth)/
│   │   └── login.tsx            # Tela de login
│   └── (app)/
│       ├── _layout.tsx          # Layout autenticado (drawer)
│       ├── index.tsx            # Tela da carteirinha
│       └── profile.tsx          # Tela de perfil
│
├── src/
│   ├── api/                     # Comunicação com a API do servidor
│   │   ├── client.ts            # Instância Axios + interceptors (JWT, refresh no 401)
│   │   ├── api-types.ts         # GERADO do OpenAPI do NestJS (não editar à mão)
│   │   ├── auth.api.ts          # login, refresh, logout
│   │   └── member.api.ts        # getMe
│   │
│   ├── model/                   # Tipos e erros do app (puro, sem framework)
│   │   ├── session.ts           # Session (alias dos tipos gerados)
│   │   ├── member.ts            # Member (alias dos tipos gerados)
│   │   └── errors.ts            # Erros do app (rede, auth, não encontrado)
│   │
│   ├── session/                 # Estado e persistência de sessão
│   │   ├── session.store.ts     # Zustand: token, isAuthenticated, ações
│   │   └── session.storage.ts   # SecureStore (persistência do token)
│   │
│   ├── hooks/                   # Ponte entre dados e UI (React Query)
│   │   ├── useLogin.ts
│   │   ├── useMember.ts
│   │   └── useSession.ts
│   │
│   ├── ui/                      # Apresentação
│   │   ├── card/                # Componentes visuais migrados do MVP
│   │   │   ├── CardFront.tsx
│   │   │   ├── CardBack.tsx
│   │   │   ├── MembershipCard.tsx
│   │   │   ├── LeftStrip.tsx
│   │   │   ├── CopvasfLogo.tsx
│   │   │   └── PhotoPlaceholder.tsx
│   │   └── components/          # Genéricos
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       └── LoadingOverlay.tsx
│   │
│   ├── lib/
│   │   └── queryClient.ts       # Config React Query + persistência offline
│   │
│   ├── theme/
│   │   └── theme.ts             # Paleta e espaçamentos do MVP
│   │
│   └── test/
│       ├── setup.ts             # jest-expo + jest-native
│       └── msw/
│           └── handlers.ts      # Mock do contrato (tipado pelos tipos gerados)
│
├── assets/
├── app.json
├── eas.json
├── tsconfig.json
├── jest.config.js
├── Dockerfile
└── docker-compose.yml
```

Testes ficam **colocados** ao lado do arquivo (`useMember.ts` + `useMember.test.ts`). As specs vivem no repo do server (ver acima).

---

## O que será reaproveitado do MVP

### Componentes visuais (migrar `.js` → `.tsx`)
- `src/components/CardFront.js` — layout da frente
- `src/components/CardBack.js` — verso com QR Code
- `src/components/LeftStrip.js` — faixa lateral com curva SVG (cubic bezier)
- `src/components/CopvasfLogo.js` — logo com borda dourada
- `src/components/PhotoPlaceholder.js` — foto ou fallback emoji
- `src/components/MembershipCard.js` — animação flip 3D (Animated API nativa)

### Design system (paleta validada pelo cliente)
- Background app: `#0f172a` · Header/Drawer: `#1e293b` · LeftStrip: `#2d3748`
- Accent azul: `#3b82f6` · Accent dourado: `#c9a227`
- Card background: `#f8fafc` · Texto primário: `#1a202c` · Texto secundário: `#718096`

### Infraestrutura
- `Dockerfile`, `docker-compose.yml` — ambiente Docker funcional
- `eas.json` — perfis `preview` (APK) e `production` (AAB)
- `app.json` — `android.package`, `projectId`, splash, tema
- Assets: `assets/photo.png`, ícones
- Dependências: `react-native-svg`, `react-native-qrcode-svg`, `react-native-safe-area-context`

---

## O que será descartado

- `src/data/member.js` — dados hardcoded
- `src/navigation/AppNavigator.js` e `src/components/CustomDrawerContent.js` — drawer customizado (workaround)
- `src/screens/MembershipCardScreen.js` — reconstruído como página Expo Router
- `App.js` legado — substituído pelo entry point do Expo Router
- `eas-build.sh` — script temporário de workaround

---

## Objetivo do produto (app)

App mobile para membros do COPVASF acessarem sua carteirinha digital. O app deve:

1. **Autenticar** o membro com email e senha via API (a validação é do servidor)
2. **Exibir a carteirinha** com dados reais (nome, função, registro, igreja, foto, QR Code)
3. **Manter sessão** entre aberturas (JWT persistido com SecureStore)
4. **Funcionar offline** com os dados da última sincronização
5. **Permitir logout**

Fora do escopo do app: cadastro de membros, painel admin e toda regra server-side — tudo isso é do `church-membership-card-server` (o CRUD de membros vive no admin web).

---

## Stack tecnológica (app)

| Camada | Tecnologia | Justificativa |
|---|---|---|
| Framework | Expo SDK 54+ managed | Continuidade do MVP, EAS já configurado |
| Linguagem | TypeScript strict | Tipagem end-to-end com o contrato da API |
| Navegação | Expo Router v4 | File-based routing, padrão atual Expo |
| HTTP | Axios | Interceptors para JWT e refresh automático |
| Tipos da API | openapi-typescript | Gerados do OpenAPI do NestJS — contrato sempre em sync |
| Cache / servidor | TanStack React Query v5 | Cache, loading/error states, offline |
| Estado de sessão | Zustand | Estado leve de sessão/UI |
| Auth storage | Expo SecureStore | Token seguro no device |
| Formulários | React Hook Form + Zod | Validação do formulário de login |
| Testes | Jest + jest-expo + RN Testing Library | Presets oficiais Expo |
| Mock de API | MSW | Intercepta requests em testes (tipado pelos tipos gerados) |
| SVG / QR | react-native-svg · react-native-qrcode-svg | Já no projeto |

Sem `usecases`, `mappers`, `datasources` ou `repositories` — a lógica que os justificaria está no servidor. Zod fica apenas para validação de formulário; a compatibilidade do contrato vem dos tipos gerados.

---

## Contrato da API (OpenAPI como fonte única)

A API NestJS é dona do contrato e o expõe via `@nestjs/swagger` (`openapi.json`). O app **gera** os tipos a partir dele — nada de tipos escritos à mão espelhando a API.

```
POST /auth/login
  body: { email: string, password: string }
  response: { token: string, refreshToken: string, expiresIn: number }

POST /auth/refresh
  body: { refreshToken: string }
  response: { token: string, expiresIn: number }

POST /auth/logout
  header: Authorization: Bearer <token>

GET /members/me
  header: Authorization: Bearer <token>
  response: {
    id, nome, funcao, registro, igreja, filiacao, cpf, nascimento,
    estadoCivil, validade, presidente, secretario, photoUrl, qrCodeValue
  }
```

*(O esquema acima é o ponto de partida acordado; a verdade final é o `openapi.json` gerado pelo NestJS.)*

### Fluxo de geração de tipos

- O NestJS expõe o OpenAPI (ex.: `GET /api-json`).
- O app tem um script (ex.: `npm run gen:api`) que roda `openapi-typescript` sobre esse OpenAPI e grava `src/api/api-types.ts`.
- `model/member.ts` e `model/session.ts` fazem **alias** dos tipos gerados; `api/*.api.ts` usa os tipos gerados nas requisições/respostas.
- Os handlers do **MSW** são tipados pelos mesmos tipos gerados — mock e app nunca divergem.

**Compatibilidade garantida:** qualquer mudança no contrato do servidor quebra a compilação do app na regeração — o problema aparece cedo, não em runtime. Como app e API nascem juntos na mesma feature (SDD cross-repo), a regeração faz parte do ciclo.

---

## Fases de desenvolvimento (app)

Cada fase de feature é dirigida por uma spec no repo do server (`specs/<feature>/`) que cobre API + app (e admin quando aplicável), e é **independente**: uma vez pronta a Fase 1 (fundação), as features podem ser especificadas, aprovadas e implementadas de forma modular. Cada fase **requer aprovação explícita** — primeiro da spec, depois da entrega.

Fluxo por feature: **spec (aprovar) → endpoint no NestJS → regenerar tipos no app → testes dos critérios → implementação assistida por IA → verificação → refatorar**.

> As fases 1–5 descrevem o lado do **app**. Cada uma pressupõe o endpoint correspondente implementado no NestJS na mesma iteração da feature. A **Fase 0** é pré-requisito e acontece no repo do server.

---

### Fase 0 — Bootstrap do Server (pré-requisito · repo `church-membership-card-server`)

**Objetivo:** monorepo do server rodando **100% em Docker Compose** (sem dependência local), com NestJS conectado ao **MongoDB** e expondo **OpenAPI** — a base de onde o app gera tipos (`gen:api`) e onde as specs serão escritas.

**O que fazer:**
- Inicializar o repositório e o monorepo (pnpm workspaces + Turborepo):
  - `apps/api` — NestJS
  - `apps/admin` — React + Vite + Refine (pode ser esqueleto vazio nesta fase; ganha corpo na feature de CRUD)
  - `packages/` — reservado para código compartilhado futuro
- `apps/api` (NestJS): `@nestjs/config`, `@nestjs/mongoose` (Mongoose), `@nestjs/swagger`
  - Módulo de **health** (`GET /health`)
  - **Swagger** em `/api-docs` (UI) e `/api-json` (documento OpenAPI que o app consome)
  - Conexão MongoDB via `MONGODB_URI` (nada hardcoded), lida via `@nestjs/config`
- **Docker Compose** com os serviços:
  - `api` — Node 20 Alpine, monta o código, roda `nest start --watch` (hot reload)
  - `mongo` — imagem `mongo:7`, com **volume nomeado** para persistência
  - `admin` — Node 20 Alpine, `vite dev` (opcional nesta fase)
- **Inspeção do banco:** usar o **MongoDB Compass** (app desktop) conectando na instância do container. Em dev, o serviço `mongo` publica a porta apenas em `127.0.0.1:27017` (loopback, não exposto à rede) para o Compass conectar localmente. Não usar mongo-express.
- `Dockerfile` multi-stage por app (dev com watch, build para produção)
- `.env.example` com `MONGODB_URI`, `MONGO_INITDB_ROOT_*`, `JWT_SECRET`, portas — **sem instalar Node/Mongo local**
- `.dockerignore`, scripts de conveniência (`docker compose up`, `docker compose run --rm api ...`)

**Nota:** JWT/auth de fato é implementado na feature `auth-sessao` (Fase 2). Aqui só sobe o esqueleto, a conexão com o Mongo e o Swagger.

**Critério de conclusão:** `docker compose up` sobe `api` + `mongo`; `GET /health` responde; Swagger acessível em `/api-docs`; `openapi.json` disponível em `/api-json` para o app rodar `gen:api`; Compass conecta na porta local do Mongo.

#### Local + Produção com o mesmo Docker (deploy em droplet DigitalOcean)

O mesmo ambiente Docker roda local e em produção. A diferença fica em **arquivos de override do Compose**, não em código:

- **Base + overrides:**
  - `docker-compose.yml` — definição comum dos serviços
  - `docker-compose.override.yml` — **dev** (aplicado automático): hot reload, volumes montados, portas expostas em loopback, Swagger ligado
  - `docker-compose.prod.yml` — **produção**: usa imagens buildadas (sem montar código), `restart: unless-stopped`, healthchecks, sem publicar a porta do Mongo
  - Subir em prod: `docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d`
- **Dockerfile de produção (multi-stage):** estágio de build → estágio de runtime rodando só `node dist/main` com dependências de produção, `NODE_ENV=production` e **usuário não-root**.
- **Segurança do MongoDB:**
  - Autenticação habilitada nos dois ambientes (root + usuário de app com privilégio mínimo no banco da aplicação), credenciais via env — nunca hardcoded.
  - **Produção não publica a porta do Mongo** para a internet; o banco fica só na rede interna do Compose. Acesso pontual via Compass em prod é feito por **túnel SSH** no droplet.
  - Volume nomeado para os dados + rotina de backup (`mongodump` agendado).
- **Borda / TLS:** reverse proxy à frente da `api` (e do `admin`) com HTTPS automático — **Caddy** (Let's Encrypt sem configuração) ou Traefik. A `api` não é exposta direto; só o proxy publica 80/443.
- **Segredos:** `.env` fora do versionamento; em produção as variáveis vêm do ambiente do droplet (ou Docker secrets). `JWT_SECRET` forte e distinto de dev.
- **CORS:** liberar apenas a origem do `admin` (o app mobile é nativo, não usa CORS).
- **Swagger em produção:** desligar `/api-docs` público ou protegê-lo — em prod, gerar tipos do app a partir de um `openapi.json` versionado, não de um endpoint aberto.

**Critério de conclusão (produção):** `docker compose -f ... -f docker-compose.prod.yml up -d` sobe api + mongo no droplet atrás do proxy com TLS; Mongo sem porta pública; `/health` acessível via HTTPS.

---

### Fase 1 — Fundação (migração + setup)

**Objetivo:** projeto existente virado em base sólida para desenvolvimento assistido por IA.

**O que fazer:**
- Criar branch `v2-production` a partir de `master`
- Remover arquivos do MVP: `src/navigation/`, `src/screens/`, `src/data/`, `src/components/CustomDrawerContent.js`, `App.js` legado, `eas-build.sh`
- Adicionar TypeScript strict: `typescript`, `@types/react`; `tsconfig.json` com `strict: true` e alias `@/*` → `src/*`
- Instalar Expo Router v4 e configurar entry point
- Instalar a stack: `zustand`, `@tanstack/react-query`, `axios`, `react-hook-form`, `zod`, `expo-secure-store`, `@react-native-async-storage/async-storage`
- Instalar testes: `@testing-library/react-native`, `@testing-library/jest-native`, `msw`; `jest.config.js` com preset `jest-expo`; `src/test/setup.ts`
- Configurar geração de tipos: `openapi-typescript` + script `gen:api` (aponta para o OpenAPI do NestJS quando disponível)
- Criar `src/theme/theme.ts` com a paleta do MVP
- Migrar componentes visuais `.js` → `.tsx` em `src/ui/card/`
- Criar a estrutura de pastas (`src/api`, `model`, `session`, `hooks`, `lib`, `test/msw`)

**Verificação (smoke test):** um teste que renderiza os componentes migrados sem erro — valida o ambiente de testes.

**Critério de conclusão:** `npm test` verde, app abrindo no Docker sem erros de TypeScript.

---

### Fase 2 — Autenticação e Sessão · spec `auth-sessao`

**Objetivo:** login funcional e sessão persistente, consumindo o servidor (sem regra de auth no app).

**Pré-requisito (server):** endpoints `/auth/login`, `/auth/refresh`, `/auth/logout` no NestJS + OpenAPI atualizado; app roda `gen:api`.

**O que fazer no app:**
1. `model/session.ts` — `Session` como alias dos tipos gerados
2. `api/client.ts` — Axios + interceptor que injeta o JWT e chama `/auth/refresh` em 401
3. `api/auth.api.ts` — `login`, `refresh`, `logout`
4. `session/session.storage.ts` (SecureStore) e `session/session.store.ts` (Zustand: token, isAuthenticated, ações)
5. `hooks/useLogin.ts` e `hooks/useSession.ts` — **teste primeiro** (loading, sucesso, erro), MSW mockando o servidor
6. `app/(auth)/login.tsx` — React Hook Form + Zod; **teste** de renderização, submissão e erro
7. `app/_layout.tsx` — guard: autenticado → `(app)`, não autenticado → `(auth)/login`

**Critério de conclusão:** critérios da spec verdes; login e persistência de sessão funcionando contra o NestJS (e MSW nos testes).

---

### Fase 3 — Carteirinha Dinâmica · spec `carteirinha`

**Objetivo:** buscar os dados do membro e exibi-los na carteirinha real.

**Pré-requisito (server):** endpoint `/members/me` no NestJS + OpenAPI atualizado; app roda `gen:api`.

**O que fazer no app:**
1. `model/member.ts` — `Member` como alias dos tipos gerados
2. `api/member.api.ts` — `getMe`
3. `hooks/useMember.ts` — **teste primeiro** com MSW; React Query com loading/erro
4. Ajustar `CardFront.tsx` / `CardBack.tsx` para receber `Member` como prop: foto via `{ uri: member.photoUrl }`, QR via `member.qrCodeValue`
5. `MembershipCard.tsx` recebe e repassa `Member`
6. `app/(app)/index.tsx` usando `useMember` com loading e erro
7. Testes de componente: `CardFront`, `CardBack`, `MembershipCard` (flip + render frente/verso)

**Critério de conclusão:** carteirinha com foto e QR Code dinâmicos; critérios da spec verdes.

---

### Fase 4 — App Shell: Navegação, Perfil e Logout · spec `app-shell`

**Objetivo:** navegação completa com drawer, tela de perfil e logout.

**O que fazer no app:**
1. Drawer com Expo Router em `app/(app)/_layout.tsx`
2. `app/(app)/profile.tsx` com dados completos do membro
3. Logout: limpar SecureStore + Zustand + redirecionar para login (**teste** do fluxo)
4. Teste do fluxo login → carteirinha → perfil → logout

**Critério de conclusão:** fluxo completo funcionando; critérios da spec verdes.

---

### Fase 5 — Resiliência e Entrega · spec `resiliencia-entrega`

**Objetivo:** app robusto (offline/erros) e build de distribuição.

**O que fazer no app:**
1. React Query com `staleTime`, `gcTime` e persistência offline (`@tanstack/query-async-storage-persister`)
2. Refresh de token: interceptor Axios chama `/auth/refresh` automaticamente em 401 (fechar o fluxo da Fase 2)
3. Estados de erro na UI: rede offline, token expirado, membro não encontrado (usando `model/errors.ts`)
4. Suite completa verde; cobertura mínima nos módulos de lógica (`api`, `hooks`, `session`)
5. Testar no device via APK (EAS Build `preview`)
6. Build de produção (`eas build --platform android --profile production`)

**Critério de conclusão:** app instalado e funcionando no device do cliente.

---

## Observações técnicas críticas

- **Expo Go + Reanimated**: incompatível com Expo Go SDK 54. A animação flip usa `Animated` API nativa — manter.
- **EAS Build sem login interativo**: montar `-v ~/.expo:/root/.expo` no `docker run` e usar `--non-interactive`. Sessão `iacf` cacheada em `~/.expo/state.json`.
- **Git SSH**: remote usa alias `github-iacf` com chave `~/.ssh/chave-iacf-github`. Push: `GIT_SSH_COMMAND="ssh -i ~/.ssh/chave-iacf-github -o IdentitiesOnly=yes"`.
- **Permissões Docker**: arquivos criados no container pertencem ao `root`. Após operações Docker, rodar `sudo chown -R $USER:$USER` nos diretórios afetados.
- **TypeScript strict**: `strict: true`. Sem `any` — preferir `unknown` com type guards.
- **Testes no Docker**: `docker compose run --rm expo npx jest --watchAll=false`.
- **Contrato**: a fonte da verdade é o `openapi.json` do NestJS. Mudanças de contrato começam na spec (repo do server) e chegam ao app via `gen:api`; nunca editar `src/api/api-types.ts` à mão.
