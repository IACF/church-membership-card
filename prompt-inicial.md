# Prompt — Claude Code (Planning Mode) · MVP Carteirinha Digital COPVASF

---

## Contexto

Preciso criar um MVP de demonstração de uma carteirinha digital para o **COPVASF (Conselho de Pastores do Vale do São Francisco)**. O objetivo é demonstrar o conceito ao cliente para aprovação antes de desenvolver o produto completo. Os dados são **100% estáticos** — não há backend, banco de dados ou autenticação.

---

## O que precisa ser construído

Um app mobile em **React Native com Expo** que exiba uma carteirinha digital com o design da carteirinha física do COPVASF. O app deve ter uma tela principal com a carteirinha (frente e verso com efeito de virada) e um **menu hambúrguer lateral (Drawer)** que deixe claro que o app terá mais funcionalidades no futuro.

---

## Design da carteirinha (baseado no modelo físico)

### Paleta de cores

- Fundo principal: gradiente de cinza escuro `#2d3748` a `#1a202c` no lado esquerdo (faixa decorativa com curva)
- Área de conteúdo: branco `#ffffff` ou cinza muito claro `#f7f8fa`
- Textos de label: cinza médio `#718096`
- Textos de valor: cinza escuro `#1a202c`, peso bold
- Logo COPVASF: fundo cinza escuro `#2d3748`, texto/ícone branco
- Acento decorativo: faixa preta/grafite na lateral esquerda com curva orgânica

### FRENTE da carteirinha

Layout horizontal (landscape), proporção aproximada de cartão de crédito (85,6mm × 54mm em tela → ~340×215dp).

Elementos da esquerda para direita:

1. **Faixa lateral esquerda** (largura ~25% do card) — fundo escuro com curva decorativa à direita. Contém a foto 3x4 do membro centralizada (placeholder: ícone de pessoa ou imagem local).

2. **Área de conteúdo** (largura ~75%):
   - Topo: título em duas linhas
     - Linha 1: `CONSELHO DE PASTORES` (bold, tamanho grande)
     - Linha 2: `Do Vale do São Francisco` (peso normal, tamanho menor)
   - Abaixo do título, campos em grid:
     - Label `Nome:` + valor `Lucas de Souza Conceição`
     - Label `Função/Cargo:` + valor `Pastor/Secretário`
     - Label `Registro:` + valor `2024003`
     - Label `Igreja:` + valor `Assembleia de Deus Ministério Logos`
   - Canto inferior direito: **logo COPVASF** (card arredondado escuro com ícone de livro aberto e texto "COPVASF")
   - Canto inferior esquerdo: **Brasão do Brasil** (pode usar emoji 🇧🇷 ou placeholder circular dourado)
   - Rodapé: versículo em itálico — _"Um ao outro ajudou e ao seu companheiro disse: Esforça-te! (Is 41.6)"_

### VERSO da carteirinha

Mesma proporção. Layout:

1. **Faixa lateral esquerda** igual à frente (fundo escuro com curva).

2. **Área de conteúdo**:
   - Label `Filiação:` + valor `Maria Janete de Souza Conceição e Raimundo Marques da Conceição`
   - Grid 2 colunas:
     - Label `CPF:` + valor `058.178.655-64`
     - Label `Data de Nascimento:` + valor `19/07/1993`
     - Label `Estado Civil:` + valor `Casado`
     - Label `Validade:` + valor `31/12/2025`
   - Canto superior direito: **QR Code** (usar biblioteca `react-native-qrcode-svg` com valor estático `https://copvasf.org.br/membro/2024003`)
   - Área de assinaturas: dois blocos side-by-side com linha horizontal, nome e cargo:
     - `José Humberto S. Santos` / `Presidente do COPVASF`
     - `Lucas de Souza Conceição` / `Secretário Geral do COPVASF`
   - Rodapé: texto legal — _"O portador da presente, está apto a exercer suas atribuições como Capelão Eclesiástico de acordo com o Art. 5º, Inciso VII da CF e a Lei Federal nº 9.982 de 14 de julho de 2000."_
   - Canto superior esquerdo: label `AUTENTICIDADE` acima do QR Code

---

## Interação

- Toque na carteirinha → vira para o outro lado (animação de flip horizontal com `Animated` do React Native)
- Fundo da tela: cor neutra escura `#0f172a` para destacar o card
- Pequeno texto abaixo do card: _"Toque para virar"_ com ícone de rotação

---

## Menu Hambúrguer (Drawer lateral)

Adicionar um ícone de hambúrguer (☰) no canto superior esquerdo da tela. Ao tocar, abre um drawer lateral com as seguintes opções **estáticas e sem navegação real** — servem apenas para demonstrar que o app terá mais seções no futuro:

- 🪪 **Minha Carteirinha** _(item ativo — destaque visual)_
- 👤 Meu Perfil _(desabilitado ou com badge "Em breve")_
- ⛪ Igrejas do Conselho _(desabilitado ou com badge "Em breve")_
- 📋 Informações do Conselho _(desabilitado ou com badge "Em breve")_

No topo do drawer: nome e função do membro (`Lucas de Souza Conceição` / `Pastor/Secretário`) com o mesmo placeholder de foto da carteirinha.

Implementar com **`@react-navigation/drawer`** + **`@react-navigation/native`**. Não criar telas reais para os itens desabilitados — ao tocar, apenas fechar o drawer.

---

## Dados estáticos (hardcoded)

```js
const membro = {
  nome: "Lucas de Souza Conceição",
  funcao: "Pastor/Secretário",
  registro: "2024003",
  igreja: "Assembleia de Deus Ministério Logos",
  filiacao: "Maria Janete de Souza Conceição e Raimundo Marques da Conceição",
  cpf: "058.178.655-64",
  nascimento: "19/07/1993",
  estadoCivil: "Casado",
  validade: "31/12/2025",
  presidente: "José Humberto S. Santos",
  secretario: "Lucas de Souza Conceição",
};
```

---

## Stack e dependências

- **Expo** (managed workflow) — `npx create-expo-app`
- **react-native-qrcode-svg** + **react-native-svg** — QR Code no verso
- **@react-navigation/native** + **@react-navigation/drawer** + **react-native-gesture-handler** + **react-native-reanimated** — menu hambúrguer
- Sem estado global, sem backend
- TypeScript opcional — use JS simples para agilizar

---

## Restrições do MVP

- Não criar telas reais para os itens "Em breve" do menu
- Não conectar a API ou banco de dados
- Não usar imagem real — usar placeholder para a foto (ícone de pessoa com fundo cinza)
- O objetivo é rodar com `npx expo start` e funcionar no Expo Go imediatamente

---

## Planejamento por fases

**Quero que o plano seja estruturado em fases sequenciais e aprovadas uma a uma. Não avance para a próxima fase sem minha confirmação explícita.**

- **Fase 1 — Setup do projeto**
  Criar o projeto Expo, instalar todas as dependências, configurar `babel.config.js` para o Reanimated e validar que `npx expo start` sobe sem erros.

- **Fase 2 — Estrutura de navegação e menu hambúrguer**
  Implementar o Drawer Navigator com o menu lateral: cabeçalho do drawer com nome/foto placeholder, item ativo "Minha Carteirinha" e demais itens com badge "Em breve". Validar que o menu abre e fecha corretamente.

- **Fase 3 — Layout base da carteirinha**
  Construir o card no tamanho e proporção corretos, com a faixa lateral escura com curva, área de conteúdo branca e todos os campos de texto estáticos (frente e verso). Sem animação ainda.

- **Fase 4 — Animação de flip e QR Code**
  Adicionar a animação de virada (flip horizontal com `Animated`) ao tocar no card. Integrar o QR Code estático no verso com `react-native-qrcode-svg`. Adicionar o texto "Toque para virar" abaixo do card.

- **Fase 5 — Polimento visual final**
  Ajustar espaçamentos, tipografia, cores e detalhes visuais para fidelidade máxima ao design da carteirinha física. Revisar em modo claro e escuro.

---

## Entregável esperado por fase

Ao final de cada fase: lista dos arquivos criados/modificados, comando para testar e confirmação do que foi implementado. Aguardar meu "ok" antes de iniciar a próxima fase.
