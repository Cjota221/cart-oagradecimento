(function () {
  'use strict';

  const PAGE_PADDING_MM = 20;
  const MAX_DIMENSION = 10;
  const MAX_GAP_MM = 20;

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function getOrientationDimensions(orientation) {
    return orientation === 'landscape'
      ? { width: 297, height: 210 }
      : { width: 210, height: 297 };
  }

  function getState() {
    return window.ImprimaxState;
  }

  function getElements() {
    return window.ImprimaxElements;
  }

  function syncNumericInput(input, min, max) {
    if (!input) return min;
    const next = clamp(parseInt(input.value, 10) || min, min, max);
    input.value = String(next);
    return next;
  }

  function updateIdealSize() {
    const state = getState();
    const elements = getElements();
    if (!state || !elements) return;

    const { width: pageWidth, height: pageHeight } = getOrientationDimensions(state.orientation);
    const availableWidth = pageWidth - PAGE_PADDING_MM;
    const availableHeight = pageHeight - PAGE_PADDING_MM;
    const totalGapWidth = (state.cols - 1) * state.gap;
    const totalGapHeight = (state.rows - 1) * state.gap;

    const cardWidthMm = Math.max(0, (availableWidth - totalGapWidth) / state.cols);
    const cardHeightMm = Math.max(0, (availableHeight - totalGapHeight) / state.rows);
    const cardWidthPx = Math.round(cardWidthMm * (300 / 25.4));
    const cardHeightPx = Math.round(cardHeightMm * (300 / 25.4));

    elements.idealSizeMm.textContent = `${cardWidthMm.toFixed(1)} mm x ${cardHeightMm.toFixed(1)} mm`;
    elements.idealSizePx.textContent = `(${cardWidthPx} px × ${cardHeightPx} px a 300 DPI)`;
  }

  function createCardCell(side, row, col, totalCols, imageSrc, rotate) {
    const wrapper = document.createElement('div');
    wrapper.className = 'card-item-wrapper';
    wrapper.dataset.row = String(row);
    wrapper.dataset.col = String(col);
    wrapper.dataset.side = side;
    wrapper.style.gridRow = String(row + 1);
    wrapper.style.gridColumn = String(col + 1);

    if (imageSrc) {
      const img = document.createElement('img');
      img.src = imageSrc;
      img.alt = `${side === 'front' ? 'Frente' : 'Verso'} do cartão`;
      if (rotate) {
        img.classList.add('rotate-90');
      }
      wrapper.appendChild(img);
    } else {
      const placeholder = document.createElement('div');
      placeholder.className = 'card-placeholder';
      placeholder.textContent = side === 'front' && row === 0 && col === 0
        ? 'Adicione uma arte de frente'
        : side === 'back' && row === 0 && col === 0
          ? 'Adicione uma arte de verso'
          : '';
      wrapper.appendChild(placeholder);
    }

    return wrapper;
  }

  function buildFrontGrid(gridFront) {
    const state = getState();
    gridFront.innerHTML = '';

    for (let row = 0; row < state.rows; row += 1) {
      for (let col = 0; col < state.cols; col += 1) {
        gridFront.appendChild(
          createCardCell('front', row, col, state.cols, state.frontImage, state.rotateFront)
        );
      }
    }
  }

  function buildBackGrid(gridBack) {
    const state = getState();
    gridBack.innerHTML = '';

    for (let row = 0; row < state.rows; row += 1) {
      // No verso, a coluna correspondente é espelhada para coincidir ao virar a folha.
      for (let col = 0; col < state.cols; col += 1) {
        const mirroredCol = state.cols - 1 - col;
        const cell = createCardCell('back', row, mirroredCol, state.cols, state.backImage, state.rotateBack);
        cell.dataset.mirroredFrom = `${row}-${col}`;
        gridBack.appendChild(cell);
      }
    }
  }

  function applyGridLayout(grid, cols, rows, gap) {
    grid.style.gridTemplateColumns = `repeat(${cols}, minmax(0, 1fr))`;
    grid.style.gridTemplateRows = `repeat(${rows}, minmax(0, 1fr))`;
    grid.style.gap = `${gap}mm`;
  }

  function generateGrids() {
    const state = getState();
    const elements = getElements();
    if (!state || !elements) return;

    state.cols = syncNumericInput(elements.colsInput, 1, MAX_DIMENSION);
    state.rows = syncNumericInput(elements.rowsInput, 1, MAX_DIMENSION);
    state.gap = syncNumericInput(elements.gapInput, 0, MAX_GAP_MM);
    state.rotateFront = Boolean(elements.rotateFrontCheckbox?.checked);
    state.rotateBack = Boolean(elements.rotateBackCheckbox?.checked);

    updateIdealSize();
    applyGridLayout(elements.gridFront, state.cols, state.rows, state.gap);
    applyGridLayout(elements.gridBack, state.cols, state.rows, state.gap);
    buildFrontGrid(elements.gridFront);
    buildBackGrid(elements.gridBack);

    if (window.ImprimaxPrint && typeof window.ImprimaxPrint.syncPrintPageStyle === 'function') {
      window.ImprimaxPrint.syncPrintPageStyle();
    }
  }

  function setOrientation(orientation) {
    const state = getState();
    const elements = getElements();
    if (!state || !elements) return;

    state.orientation = orientation;
    elements.pageFront.classList.toggle('landscape', orientation === 'landscape');
    elements.pageBack.classList.toggle('landscape', orientation === 'landscape');
    document.body.classList.toggle('printing-landscape', orientation === 'landscape');
    document.body.classList.toggle('printing-portrait', orientation !== 'landscape');
    generateGrids();
  }

  window.ImprimaxGrid = {
    clamp,
    generateGrids,
    setOrientation,
    updateIdealSize,
    getOrientationDimensions
  };
}());
