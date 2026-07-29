# COPVASF — Carteirinha Digital (MVP)

App mobile em React Native + Expo que exibe a carteirinha digital do **Conselho de Pastores do Vale do São Francisco (COPVASF)**. Dados 100% estáticos — sem backend ou autenticação.

---

## Pré-requisitos

- [Docker](https://docs.docker.com/get-docker/) (com Docker Compose incluído)
- [Expo Go](https://expo.dev/go) instalado no celular (iOS ou Android)
- Computador e celular na **mesma rede Wi-Fi**

---

## Como executar

### 1. Configure o IP da sua máquina

Descubra o IP local da sua máquina na rede Wi-Fi:

```bash
# Linux
ip route get 1 | awk '{print $7}'

# macOS
ipconfig getifaddr en0

# Windows (PowerShell)
(Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias Wi-Fi).IPAddress
```

Crie o arquivo `.env` na raiz do projeto:

```bash
cp .env.example .env
```

Abra `.env` e substitua pelo IP encontrado:

```
HOST_IP=192.168.1.10
```

### 2. Suba o servidor de desenvolvimento

```bash
docker compose up
```

Na primeira execução, o Docker constrói a imagem (pode levar alguns minutos). Nas próximas execuções é instantâneo.

Quando o servidor estiver pronto, você verá um QR Code no terminal, assim:

```
› Metro waiting on exp://192.168.1.10:8081
› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)
```

### 3. Abra no celular

**Android:** Abra o app **Expo Go** → toque em "Scan QR Code" → aponte para o QR Code no terminal.

**iOS:** Abra a **Câmera** do iPhone → aponte para o QR Code → toque na notificação que aparece.

O app carrega automaticamente no celular.

---

## Testando o app

- **Carteirinha (frente):** aparece ao abrir o app
- **Virar o card:** toque na carteirinha para ver o verso (efeito de flip na Fase 4)
- **Menu hambúrguer:** toque no ícone `☰` no canto superior esquerdo do header
- **Itens "Em breve":** ao tocar, fecham o drawer sem navegar (comportamento intencional do MVP)

---

## Comandos úteis

```bash
# Subir o servidor
docker compose up

# Subir em background (sem travar o terminal)
docker compose up -d

# Ver logs quando estiver em background
docker compose logs -f expo

# Parar o servidor
docker compose down

# Instalar nova dependência (Expo resolve a versão compatível)
docker compose exec expo npx expo install <nome-do-pacote>

# Rebuild da imagem (necessário após alterar package.json manualmente)
docker compose build --no-cache
```

---

## Estrutura do projeto

```
church-membership-card/
├── Dockerfile                  # Imagem Node 20 Alpine com Expo
├── docker-compose.yml          # Serviço expo com volumes e portas
├── .env.example                # Modelo para configurar HOST_IP
├── App.js                      # Entrada: monta o AppNavigator
├── babel.config.js             # Plugin do Reanimated
├── package.json                # Dependências
└── src/
    ├── data/
    │   └── member.js           # Dados estáticos do membro
    ├── navigation/
    │   └── AppNavigator.js     # DrawerNavigator + cabeçalho
    ├── screens/
    │   └── MembershipCardScreen.js
    └── components/
        ├── MembershipCard.js   # Container do card (toggle frente/verso)
        ├── CardFront.js        # Frente da carteirinha
        ├── CardBack.js         # Verso da carteirinha
        ├── LeftStrip.js        # Faixa lateral escura com curva SVG
        ├── PhotoPlaceholder.js # Placeholder da foto 3x4
        ├── CopvasfLogo.js      # Logo COPVASF
        └── CustomDrawerContent.js  # Menu lateral
```

---

## Solução de problemas

**O QR Code não aparece / app não abre no celular**

- Verifique se o `HOST_IP` no `.env` é o IP correto da sua máquina
- Confirme que o celular e o computador estão na mesma rede Wi-Fi
- Se usar VPN no computador, desative-a

**Erro de porta em uso**

```bash
# Verifique qual processo usa a porta 8081
lsof -i :8081
# Pare o processo e tente novamente
docker compose down && docker compose up
```

**Imagem desatualizada após alterar dependências**

```bash
docker volume rm church-membership-card_node_modules
docker compose build --no-cache
docker compose up
```
