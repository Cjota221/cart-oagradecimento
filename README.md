# Imprimax

Gerador de cartões para impressão frente/verso em HTML puro, sem build e sem servidor.

## Estrutura

```text
imprimax/
  index.html
  css/
    styles.css
  js/
    app.js
    grid.js
    print.js
  assets/
    artes/
  README.md
```

## Como usar

1. Abra `index.html` diretamente no navegador.
2. Adicione a arte da frente e, se quiser, a do verso.
3. Ajuste colunas, linhas, espaçamento e orientação.
4. Clique em `Imprimir frente` e depois em `Imprimir verso`.

## Observações

- O projeto usa Tailwind CDN e vanilla JS.
- As artes prontas ficam preparadas em `assets/artes/`.
- O fluxo de impressão usa restauração automática após o diálogo de impressão, inclusive no mobile.
