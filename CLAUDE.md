# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## O que é este repositório

App mobile (React Native + Expo) da **carteirinha digital do COPVASF** (Conselho de Pastores do Vale do São Francisco). É **somente o cliente** — não tem lógica de negócio própria.

Faz parte de um produto de **dois repositórios**, desenvolvidos juntos:

- `church-membership-card` (este) — app mobile / cliente.
- `../church-membership-card-server` — API NestJS + MongoDB e admin web. **Dono de toda a lógica de negócio**: autenticação, JWT, banco, regras server-side. Tem seu próprio `CLAUDE.md`.

O plano de produto completo (arquitetura, fases, decisões) está em **`plano-produto.md`** — leia antes de mudanças estruturais.

## Estado atual vs. direção

- **`master`**: MVP concluído — dados 100% estáticos em JavaScript, sem backend (ver `src/data/member.js`, `src/components/*.js`). Serve como base visual validada pelo cliente.
- **`v2-production`**: produto real (em construção) — TypeScript, dados dinâmicos via API, testes. A migração e as fases estão descritas em `plano-produto.md`.

Não confunda o código atual (MVP JS) com a arquitetura-alvo do v2. Ao trabalhar no v2, siga o plano.

## Regra fundamental: tudo roda em Docker

**Nunca instale dependências nem rode comandos Node/Expo direto no host.** O ambiente vive em containers (Node 20 Alpine) via Docker Compose — só Docker precisa estar instalado.

```bash
cp .env.example .env      # definir HOST_IP com o IP da máquina na Wi-Fi (para o Expo Go via LAN)
docker compose up         # sobe o Metro/Expo; escaneie o QR com o Expo Go
docker compose build      # rebuild da imagem após mudar dependências
```

O IP local: `ip route get 1 | awk '{print $7}'` (Linux). Celular e máquina na mesma rede Wi-Fi.

### Arquivos criados por container são `root`

Containers rodam como root, então arquivos gerados (ex.: `node_modules`, lockfiles) ficam com dono `root` no host. **`sudo` neste ambiente pede senha** — para ajustar dono/remover esses arquivos sem sudo interativo, use um container descartável:

```bash
docker run --rm -v "$(pwd)":/work alpine chown -R 1000:1000 /work/<arquivo>   # uid:gid do host = 1000:1000
```

## Arquitetura-alvo do v2 (right-sized)

Como o servidor é dono da lógica, **não** usar Clean Architecture livro-texto (nada de usecases/mappers/repositories/datasources). Camadas enxutas (ver `plano-produto.md` para o detalhe):

```
UI (app/ + src/ui) → hooks (React Query) → api (Axios) / session (SecureStore+Zustand) → model (tipos + erros)
```

Navegação com Expo Router (`app/`). Estado de sessão em Zustand; cache/servidor em React Query; token em Expo SecureStore.

### Contrato da API = OpenAPI gerado (não escrever tipos à mão)

O servidor NestJS expõe OpenAPI. O app gera `src/api/api-types.ts` a partir dele (`openapi-typescript`, script `gen:api`). **Nunca editar `api-types.ts` à mão** e nunca espelhar o contrato manualmente — a fonte da verdade é o `openapi.json` do server. Zod fica só para validação de formulário (login).

## Fluxo de trabalho: Spec-Driven Development

As features nascem de specs versionadas no **repo do server** (`../church-membership-card-server/specs/<feature>/`), cobrindo API + app juntos. **A spec é aprovada antes de qualquer código.** Cada critério de aceitação vira teste (TDD derivado da spec). Nenhuma lógica de cliente (hook, store, api, guard de sessão) é implementada sem um teste antes.

## Restrições técnicas críticas

- **Animação flip usa a `Animated` API nativa, não Reanimated** — Reanimated é incompatível com Expo Go SDK 54. Manter `Animated`.
- **EAS Build** (`eas.json`: perfis `preview`=APK, `production`=AAB): rodar não-interativo montando a sessão cacheada — `docker run` com `-v ~/.expo:/root/.expo` e `--non-interactive`. Projeto EAS: `iacf/copvasf`.
- **Git via SSH com alias** `github-iacf` (chave `~/.ssh/chave-iacf-github`): `GIT_SSH_COMMAND="ssh -i ~/.ssh/chave-iacf-github -o IdentitiesOnly=yes"` para push.
- **TypeScript strict** no v2: sem `any` — usar `unknown` + type guards.
