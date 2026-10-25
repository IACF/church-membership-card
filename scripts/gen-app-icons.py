"""Gera os assets de icone e splash a partir da arte-mestra.

    docker run --rm -v "$PWD":/app -w /app python:3.12-alpine sh -c \
      "pip install --quiet pillow && python -I scripts/gen-app-icons.py"

Entrada:  assets/source/livro-dourado.png   (simbolo isolado, RGBA)
          assets/source/lockup-dourado.png  (livro + COPVASF + subtitulo)
Saida:    assets/{icon,adaptive-icon,splash-icon,favicon}.png
          assets/copvasf-marca.png          (lockup exibido no boot do app)

POR QUE SO O LIVRO, SEM O NOME: o Android aplica uma MASCARA CIRCULAR ao icone
e, desde o Android 12, tambem a imagem da splash nativa. Qualquer texto no
quadro e cortado — "COPVASF" vira "COPVAS" e o subtitulo vira borrao. A 48px,
tamanho real na gaveta de apps, nenhum texto e legivel. O lockup completo
aparece no boot do app (app/_layout.tsx), onde a tela e livre.

Rode de novo sempre que a arte-mestra mudar.
"""

from PIL import Image

FUNDO = (15, 23, 42)  # colors.background do tema (#0f172a)
MESTRA = 'assets/source/livro-dourado.png'
MESTRA_LOCKUP = 'assets/source/lockup-dourado.png'
LARGURA_MARCA = 900  # suficiente para telas @3x sem inflar o bundle

# Fracao do quadro ocupada pelo simbolo. A zona segura do adaptive icon do
# Android e ~66% do lado: o que passar disso pode ser cortado conforme a
# mascara do fabricante (circulo, squircle, gota...).
OCUPACAO_ICONE = 0.62
OCUPACAO_SPLASH = 0.58  # um pouco menor: a mascara da splash do Android 12 e mais apertada


def compoe(mestra: Image.Image, lado: int, ocupacao: float, opaco: bool) -> Image.Image:
    alvo = int(lado * ocupacao)
    r = min(alvo / mestra.width, alvo / mestra.height)
    simbolo = mestra.resize((max(int(mestra.width * r), 1), max(int(mestra.height * r), 1)),
                            Image.LANCZOS)
    if opaco:
        base = Image.new('RGB', (lado, lado), FUNDO)
        base.paste(simbolo, ((lado - simbolo.width) // 2, (lado - simbolo.height) // 2), simbolo)
        return base
    base = Image.new('RGBA', (lado, lado), (0, 0, 0, 0))
    base.paste(simbolo, ((lado - simbolo.width) // 2, (lado - simbolo.height) // 2), simbolo)
    return base


def main() -> None:
    mestra = Image.open(MESTRA).convert('RGBA')

    saidas = [
        # O icone do iOS NAO pode ter canal alfa — a App Store recusa o envio.
        ('assets/icon.png', 1024, OCUPACAO_ICONE, True),
        # O adaptive icon do Android e so o PRIMEIRO PLANO: o fundo vem do
        # `android.adaptiveIcon.backgroundColor` no app.json. Precisa de alfa.
        ('assets/adaptive-icon.png', 1024, OCUPACAO_ICONE, False),
        ('assets/splash-icon.png', 1024, OCUPACAO_SPLASH, False),
        ('assets/favicon.png', 196, OCUPACAO_ICONE, True),
    ]

    for caminho, lado, ocupacao, opaco in saidas:
        img = compoe(mestra, lado, ocupacao, opaco)
        img.save(caminho)
        alfa = 'sem alfa' if opaco else 'com alfa'
        print(f'  {caminho}: {lado}x{lado}, {alfa}')

    # Lockup do boot: aqui o texto PODE aparecer, porque a tela e livre — nao ha
    # mascara como no icone e na splash nativa.
    lockup = Image.open(MESTRA_LOCKUP).convert('RGBA')
    r = LARGURA_MARCA / lockup.width
    lockup = lockup.resize((LARGURA_MARCA, max(int(lockup.height * r), 1)), Image.LANCZOS)
    lockup.save('assets/copvasf-marca.png')
    print(f'  assets/copvasf-marca.png: {lockup.width}x{lockup.height}, com alfa')


if __name__ == '__main__':
    main()
