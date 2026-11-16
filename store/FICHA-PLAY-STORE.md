# Ficha da Google Play — Carteirinha Digital COPVASF

Tudo o que a Play Console pede, pronto para copiar. O material gráfico está nesta mesma
pasta; as respostas do formulário de Segurança de Dados estão em
`docs/legal/pendencias.md` § 4, no repositório do servidor.

---

## Identificação

| campo | valor |
|---|---|
| Nome do app | **Copvasf** |
| Pacote | `br.org.copvasf.carteirinha` |
| Categoria | **Estilo de vida** |
| Tags | carteirinha, membro, documento, credencial |
| Classificação indicativa | Livre (questionário sem conteúdo sensível) |
| Público-alvo | **Adultos (18+)** — o cadastro é recusado pelo sistema para menores |
| Contém anúncios | **Não** |
| Compras no app | **Não** |
| Política de Privacidade | **https://copvasf.com.br/privacidade** |
| Termos de Uso | https://copvasf.com.br/termos |
| E-mail de contato | copvasf@gmail.com |

> A categoria **Estilo de vida** foi escolhida em vez de *Produtividade* porque o app atende
> a uma comunidade religiosa específica e não é uma ferramenta de trabalho de uso geral. Não
> usamos a categoria *Social*: não há interação entre usuários.

---

## Descrição curta (até 80 caracteres)

```
A carteirinha de membro do COPVASF, sempre com você no celular.
```

*(63 caracteres)*

## Descrição completa (até 4000 caracteres)

```
Carteirinha Digital do Conselho de Pastores do Vale do São Francisco (COPVASF).

O aplicativo é a versão digital da carteirinha de membro do conselho. Ele é de uso
restrito: acessa apenas quem já foi cadastrado pela administração do COPVASF. Não há
cadastro pelo aplicativo nem autoatendimento.

O QUE VOCÊ FAZ NO APLICATIVO

• Consulta a sua carteirinha de membro, frente e verso, com a sua foto, o número de
  registro e o vínculo com a sua igreja.
• Gira o aparelho e vê a carteirinha ampliada, ocupando a tela inteira.
• Exporta a carteirinha em PDF, com código QR de autenticidade, para imprimir ou
  apresentar onde for necessário.
• Consulta documentos e informações publicados pelo conselho.
• Altera a sua senha de acesso.

FUNCIONA SEM INTERNET

A última versão sincronizada da sua carteirinha fica disponível no aparelho, então você
consegue apresentá-la mesmo sem conexão.

AUTENTICIDADE

O PDF exportado traz um código QR que aponta para o endereço de validação mantido pelo
conselho. Quem recebe o documento pode conferi-lo na hora, pela câmera do celular. A
página de validação não expõe nenhum dado pessoal.

PRIVACIDADE

O aplicativo não exibe anúncios, não tem ferramentas de análise de uso nem bibliotecas de
terceiros que coletem dados, e não solicita nenhuma permissão do seu aparelho: não acessa
câmera, microfone, localização, contatos, agenda nem arquivos. Ao usar a opção "Sair", os
dados da sua carteirinha são apagados imediatamente do aparelho.

Política de Privacidade: https://copvasf.com.br/privacidade
Termos de Uso: https://copvasf.com.br/termos

COMO OBTER ACESSO

Se você é membro do conselho e ainda não tem acesso, procure a administração do COPVASF.
```

---

## Acesso para a revisão do Google

A ficha **precisa** destes dados. Sem eles, o app é reprovado por login inacessível — é um
dos motivos mais comuns de rejeição.

Em *Conteúdo do app → Acesso ao app*, marque **"Todas ou algumas funcionalidades são
restritas"** e informe:

| campo | valor |
|---|---|
| Nome de usuário | `202600003` |
| Senha | *(ver nota abaixo)* |

**Instruções para o revisor**, para colar no campo de texto:

```
O aplicativo é de uso restrito a membros cadastrados do conselho; não há cadastro público.
Use as credenciais acima na tela de login (campo "Registro ou CPF" e campo "Senha").
A conta é fictícia, criada apenas para esta revisão, e não contém dados de pessoa real.
Após entrar, a carteirinha é exibida na tela inicial. Gire o aparelho para vê-la ampliada
e toque no cartão para ver o verso. O menu lateral dá acesso ao perfil, aos documentos,
aos consentimentos e à opção de sair.
```

> **Sobre a senha.** A conta já teve a troca obrigatória do primeiro acesso realizada, de
> propósito: se entregássemos a senha inicial, o primeiro login do revisor forçaria a troca
> e as credenciais informadas deixariam de valer no mesmo instante. A senha definitiva foi
> passada ao conselho em separado e **não é versionada neste repositório** — ela vive no
> campo correspondente da Play Console.

---

## Material gráfico nesta pasta

| arquivo | onde entra | observação |
|---|---|---|
| `icone-512.png` | Ícone do app na ficha | 512×512, **sem alfa** — a Play Console recusa com canal alfa |
| `feature-graphic-1024x500.png` | Gráfico de destaque | 1024×500, sem alfa |
| `screenshots/store-01-carteirinha.png` | Captura 1 | a carteirinha, frente |
| `screenshots/store-02-verso.png` | Captura 2 | verso, com filiação e assinaturas |
| `screenshots/store-03-consentimentos.png` | Captura 3 | consentimento da transferência internacional |
| `screenshots/store-04-perfil.png` | Captura 4 | perfil do membro |
| `screenshots/store-05-menu.png` | Captura 5 | menu, com os links legais |
| `screenshots/store-06-paisagem.png` | Captura 6 | carteirinha ampliada em paisagem |

Todas as capturas são **540×1080** (a de paisagem, 1080×540): razão exata de **2:1**, que é o
limite aceito pela Play Console para telefone. A proporção importa — captura mais alongada
que isso é recusada no envio.

As capturas foram feitas com um cadastro **fictício** ("Pastor Exemplo", CPF de teste,
"Igreja Exemplo") contra um servidor local, de propósito: material de loja não deve conter
dado de membro real nem depender do ambiente de produção.

Os dois gráficos são **gerados** por `scripts/gen-store-assets.py` a partir da mesma
arte-mestra do ícone do app. Se a marca mudar, rode o script em vez de editar PNG à mão.

## Checklist antes de enviar

- [x] AAB gerado com `--profile production`, **versionCode 11**, verificado: só a permissão
      `INTERNET`, aponta para `https://copvasf.com.br`, sem `localhost` nem IP de LAN
      (`~/Downloads/copvasf-v11-playstore.aab`)
- [x] Ícone 512×512 (`store/icone-512.png`) **pronto**
- [x] Feature graphic (`store/feature-graphic-1024x500.png`) **pronta**
- [x] Capturas de telefone (`store/screenshots/`, 6 arquivos) **prontas**
- [x] URL da política de privacidade **no ar**: https://copvasf.com.br/privacidade
- [ ] Formulário de Segurança de Dados preenchido conforme `docs/legal/pendencias.md` § 4
- [ ] Questionário de classificação indicativa respondido
- [x] Conta de revisão **criada em produção** (registro 202600003); falta informá-la na console
- [ ] Público-alvo declarado como adulto
