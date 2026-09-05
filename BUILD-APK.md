# Gerar o APK do app (EAS Build)

Como buildar o app apontando para o servidor de produção. Este é o procedimento que foi usado e
validado em **03/09/2026** — o APK gerado por ele está com `https://copvasf.com.br` embutido no
bundle, confirmado por inspeção do artefato.

Tudo roda em Docker: nada de `npm`, `expo` ou `eas` instalados no host.

---

## O conceito que faz tudo funcionar

O app decide para onde falar com a API pelo **`EXPO_PUBLIC_API_URL`**. Em produção ele vale
`https://copvasf.com.br` e vem do **`eas.json`**:

```jsonc
// eas.json
"preview": {
  "distribution": "internal",
  "android": { "buildType": "apk", "image": "latest" },
  "env": { "EXPO_PUBLIC_API_URL": "https://copvasf.com.br" }
}
```

> ⚠️ **Não coloque a URL de produção no `.env`.** O `.env` está no `.gitignore`, e o EAS envia o
> projeto respeitando o `.gitignore` — o arquivo **nunca chega ao builder**. Se a URL estivesse só
> lá, a build sairia silenciosamente com o fallback `http://localhost:3000` de `src/api/client.ts`
> e o app não funcionaria em aparelho nenhum. O `.env` continua servindo só ao desenvolvimento
> local (IP da LAN, para o Expo Go).

Esse mesmo valor é a base do QR de autenticidade impresso no PDF da carteirinha
(`src/lib/config.ts` → `VALIDATION_BASE_URL` → `<base>/validar/<registro>`).

---

## Passo 1 — Confirme a branch

O app real vive em `main` e nas branches de feature. **`master` é um MVP antigo com dados fixos**,
sem conexão com a API — se o `src/` estiver cheio de `.js` e existir `src/data/member.js`, você
está na branch errada.

```bash
cd ~/Documentos/Frela/church-membership-card
git branch --show-current
git status --short          # confirme que não há trabalho pendente antes de trocar
```

Sinal de que está na branch certa: existe o diretório `app/` (expo-router) e `src/api/client.ts`.

## Passo 2 — Autentique no EAS com um token

Login por senha expira e não serve para build automatizada. Use um **token de acesso**:

1. Acesse https://expo.dev/settings/access-tokens (conta `iacf`)
2. *Create token* → dê um nome (ex.: `copvasf-builds`) → copie

Guarde-o **fora do repositório**, com permissão restrita, para não vazar em `ps` nem num commit:

```bash
umask 077
printf 'EXPO_TOKEN=<cole-o-token-aqui>\n' > /tmp/eas.env
chmod 600 /tmp/eas.env
```

Confirme:

```bash
docker compose run --rm --no-deps -v /tmp:/secrets:ro expo sh -c '
  . /secrets/eas.env && export EXPO_TOKEN
  npx --yes eas-cli@latest whoami
'
# esperado: iacf (authenticated using EXPO_TOKEN)
```

## Passo 3 — Rode a suíte antes de gastar fila

A fila do EAS é lenta; não vale descobrir um erro de tipo depois de 20 minutos esperando.

```bash
docker compose run --rm --no-deps expo sh -c 'npx tsc --noEmit && npx jest'
```

## Passo 4 — Dispare a build

```bash
docker compose run --rm --no-deps -v /tmp:/secrets:ro expo sh -c '
  git config --global --add safe.directory /app
  . /secrets/eas.env && export EXPO_TOKEN
  npx --yes eas-cli@latest build --platform android --profile preview --non-interactive --no-wait
'
```

Na saída, procure a linha que **prova** que a URL de produção entrou:

```
Environment variables loaded from the "preview" build profile "env" configuration: EXPO_PUBLIC_API_URL
```

E guarde o ID da build, impresso ao final no link `.../builds/<id>`.

### Por que cada pedaço do comando existe

| trecho | motivo |
|---|---|
| `docker compose run` (e não `docker run`) | o serviço `expo` tem o volume com `node_modules`; sem ele o EAS falha ao resolver o plugin do `expo-router` |
| `git config --global --add safe.directory /app` | o container roda como root e o repositório é do uid 1000 → o git recusa por *dubious ownership*, e o EAS interpreta isso como "não há repositório", pedindo um `git init` |
| `-v /tmp:/secrets:ro` + `. /secrets/eas.env` | passa o token sem expô-lo na linha de comando (visível em `ps`) |
| `--non-interactive` | não há TTY; falha na hora em vez de travar num prompt |
| `--no-wait` | devolve o terminal; a fila pode demorar |

## Passo 5 — Acompanhe

```bash
docker compose run --rm --no-deps -v /tmp:/secrets:ro expo sh -c '
  git config --global --add safe.directory /app
  . /secrets/eas.env && export EXPO_TOKEN
  npx --yes eas-cli@latest build:view <BUILD_ID> --json
' 2>/dev/null | python3 -c "
import sys,json
raw=sys.stdin.read(); d=json.loads(raw[raw.find('{'):])
print('status:', d.get('status'))
print('APK   :', (d.get('artifacts') or {}).get('buildUrl') or '(ainda não)')
"
```

Estados: `IN_QUEUE` → `IN_PROGRESS` → `FINISHED` (ou `ERRORED`). No plano gratuito a fila costuma
consumir mais tempo que a compilação, que leva por volta de 10–15 min.

> ⚠️ `build:view` **não aceita** `--non-interactive` — a flag não existe nesse subcomando e o
> comando falha inteiro. Só `--json`.

## Passo 6 — Verifique o APK antes de distribuir

Compilar não prova que a URL certa entrou. Baixe e inspecione o bundle:

```bash
curl -sSL -o /tmp/app.apk '<URL_DO_APK>'
mkdir -p /tmp/apkx && cd /tmp/apkx && unzip -qo /tmp/app.apk 'assets/*'

grep -ao 'https://copvasf\.com\.br' assets/index.android.bundle | head -1   # deve achar
grep -c 'http://localhost:3000'     assets/index.android.bundle             # deve ser 0
grep -c '192\.168\.'                assets/index.android.bundle             # deve ser 0
```

Se aparecer `localhost` ou um IP de LAN, a build pegou o `.env` errado — revise o `eas.json`.

## Passo 7 — Instale e teste

Baixe o APK no Android e autorize "instalar de fontes desconhecidas". Para o login é preciso um
membro cadastrado: a **senha inicial são os 5 primeiros dígitos do CPF**, definida automaticamente
na criação, e o app exige a troca no primeiro acesso (`mustChangePassword`).

Confirme antes que o servidor responde:

```bash
curl -sS https://copvasf.com.br/health
curl -sS -o /dev/null -w '%{http_code}\n' -X POST https://copvasf.com.br/auth/login \
  -H 'Content-Type: application/json' -d '{"identifier":"<registro>","password":"<5 díg. CPF>"}'
```

---

## Armadilhas do release que já custaram builds

Estas três só aparecem no APK — nunca no desenvolvimento. Estão aqui para não custarem
outra rodada de fila.

### 1. Assets de `require()` viram recursos Android, não arquivos

`Asset.fromModule(...)` + `new File(uri).base64()` funciona no dev, onde o Metro serve a imagem por
HTTP e ela vai para o cache com um `file://` absoluto. **No APK não existe arquivo:** as imagens de
`require()` são compiladas na tabela de recursos (inspecionando o pacote: 959 entradas em `res/`
contra 4 em `assets/`). A leitura falha com:

```
Call to function 'FileSystemFile.base64' has been rejected.
→ Caused by: java.lang.IllegalArgumentException: URI is not absolute
```

Não há caminho para corrigir — não há caminho. A solução é **embutir em tempo de build**:
`scripts/gen-pdf-assets.mjs` gera `src/lib/pdf/assets.base64.ts` com os PNGs como data URI, e o
mesmo código passa a servir dev, release, nativo e web.

> Rode `node scripts/gen-pdf-assets.mjs` sempre que trocar uma imagem do card.

Vale para qualquer leitura de asset empacotado — não só PDF.

### 2. `Sharing.shareAsync` NÃO abre no visualizador

No Android ela dispara `ACTION_SEND`, a folha de **compartilhamento** ("enviar para…", "imprimir").
Para abrir no leitor de PDF é `ACTION_VIEW`, e ele exige URI `content://` — desde o Android 7,
passar `file://` a outro app lança `FileUriExposedException`. A flag `1`
(`FLAG_GRANT_READ_URI_PERMISSION`) é obrigatória, senão o leitor não consegue ler o arquivo.

Está resolvido em `src/lib/files/openPdf.ts`, usado tanto pela exportação quanto pela tela de
Documentos. No iOS o comportamento é outro de propósito: lá não existe "abrir com" e a folha de
compartilhamento é o mecanismo nativo.

### 3. Erro engolido é erro indiagnosticável

O `toAppError` mapeia qualquer exceção desconhecida para "Algo deu errado. Tente novamente." e
descartava o original — o que tornou a falha do item 1 invisível por duas builds. Hoje o
`exportCardPdf` marca a etapa (`assets`, `qr`, `html`, `print`, `file`, `open`) e preserva a causa
em `AppError.detail`, com `console.error` para o logcat.

> ⚠️ O detalhe técnico ainda aparece na tela para o usuário final. Foi essencial no diagnóstico,
> mas `[assets] java.lang.IllegalArgumentException` não é algo que um membro deva ver. Decidir se
> fica só no log ou apenas em builds internas.

### Como verificar sem aparelho

Boa parte disso dá para conferir inspecionando o APK, antes de instalar:

```bash
unzip -qo app.apk 'assets/*'
B=assets/index.android.bundle
grep -ao 'data:image/png;base64' $B | wc -l      # 4 = assets embutidos
grep -ac 'android.intent.action.VIEW' $B          # 1 = abre no visualizador
grep -ac 'https://copvasf.com.br' $B              # 1 = aponta para producao

# modulo nativo compilado? (classes ficam nos .dex, nao como arquivos soltos)
unzip -qo app.apk 'classes*.dex'
grep -ac 'IntentLauncher' classes*.dex
```

## Antes de cada nova rodada: o `versionCode`

`eas.json` usa `"appVersionSource": "local"`, então o `versionCode` vem do `app.json` e **não é
incrementado automaticamente**. Se você distribuir um APK novo com o mesmo número, o Android não o
reconhece como atualização — o usuário precisa desinstalar antes.

```jsonc
// app.json
"android": {
  "package": "br.org.copvasf.carteirinha",
  "versionCode": 2      // ← incremente a cada build distribuída
}
```

O `version` (ex.: `1.0.0`) é o que aparece para o usuário; o `versionCode` é o que o sistema compara.

## Build de produção (AAB, para a Play Store)

Mesmo procedimento, trocando o perfil — o `production` gera *app bundle* em vez de APK:

```bash
--profile production
```

O AAB não se instala direto no aparelho; serve para envio à Play Store.

---

## Referência rápida

| | |
|---|---|
| Projeto EAS | `iacf/copvasf` (`projectId` em `app.json`) |
| Builds | https://expo.dev/accounts/iacf/projects/copvasf/builds |
| Tokens | https://expo.dev/settings/access-tokens |
| Perfil de teste | `preview` → APK, `distribution: internal` |
| Perfil de loja | `production` → AAB |
| API de produção | https://copvasf.com.br |
| Painel admin | https://admin.copvasf.com.br |

O deploy do servidor é assunto do repositório vizinho — ver `docs/deploy-playbook.md` em
`church-membership-card-server`.
