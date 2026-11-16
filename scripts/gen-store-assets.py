"""Gera o material grafico da ficha da Google Play.

    docker run --rm -v "$PWD":/app -w /app python:3.12-alpine sh -c \
      "pip install --quiet pillow && python -I scripts/gen-store-assets.py"

Entrada:  assets/source/livro-dourado.png   (simbolo isolado, RGBA)
          assets/source/lockup-dourado.png  (livro + COPVASF + subtitulo)
Saida:    store/icone-512.png               512x512, SEM alfa
          store/feature-graphic-1024x500.png

POR QUE SEM ALFA: a Play Console recusa o icone da ficha com canal alfa, e a
feature graphic e exibida sobre fundos variaveis — transparencia ali vira
retangulo branco ou preto conforme o tema do aparelho.

POR QUE O ICONE DA FICHA LEVA SO O LIVRO: e o mesmo motivo do icone do app
(ver gen-app-icons.py) — a Play Console aplica cantos arredondados e o icone
aparece em tamanhos pequenos nas listas. Texto nao sobrevive.

A FEATURE GRAPHIC, ao contrario, e grande e nunca mascarada: ali cabe o lockup
completo, com o nome e o subtitulo legiveis.
"""

from PIL import Image

FUNDO = (15, 23, 42)  # #0f172a, o mesmo do tema e do icone do app
MESTRA = 'assets/source/livro-dourado.png'
MESTRA_LOCKUP = 'assets/source/lockup-dourado.png'

OCUPACAO_ICONE = 0.62  # mesma zona segura do icone do app
# Na feature graphic a arte ocupa ~58% da ALTURA: a Play Console sobrepoe
# elementos proprios nas bordas em algumas superficies, e o conteudo precisa
# ficar longe delas.
OCUPACAO_LOCKUP = 0.58


def centraliza(arte: Image.Image, largura: int, altura: int, escala_alvo: int) -> Image.Image:
    r = escala_alvo / max(arte.width, arte.height)
    if arte.height * r > escala_alvo:
        r = escala_alvo / arte.height
    arte = arte.resize((max(int(arte.width * r), 1), max(int(arte.height * r), 1)), Image.LANCZOS)
    base = Image.new('RGB', (largura, altura), FUNDO)
    base.paste(arte, ((largura - arte.width) // 2, (altura - arte.height) // 2), arte)
    return base


def main() -> None:
    livro = Image.open(MESTRA).convert('RGBA')
    icone = centraliza(livro, 512, 512, int(512 * OCUPACAO_ICONE))
    icone.save('store/icone-512.png')
    print('  store/icone-512.png: 512x512, sem alfa')

    lockup = Image.open(MESTRA_LOCKUP).convert('RGBA')
    largura, altura = 1024, 500
    alvo = int(altura * OCUPACAO_LOCKUP)
    r = min(alvo / lockup.height, (largura * 0.70) / lockup.width)
    arte = lockup.resize(
        (max(int(lockup.width * r), 1), max(int(lockup.height * r), 1)), Image.LANCZOS
    )
    base = Image.new('RGB', (largura, altura), FUNDO)
    base.paste(arte, ((largura - arte.width) // 2, (altura - arte.height) // 2), arte)
    base.save('store/feature-graphic-1024x500.png')
    print(f'  store/feature-graphic-1024x500.png: {largura}x{altura}, sem alfa')


if __name__ == '__main__':
    main()
