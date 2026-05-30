(function () {
  'use strict';

  function getState() {
    return window.ImprimaxState;
  }

  function getElements() {
    return window.ImprimaxElements;
  }

  function showAlert(message, type = 'info') {
    if (typeof window.ImprimaxShowAlert === 'function') {
      window.ImprimaxShowAlert(message, type);
    }
  }

  function ensurePrintStyle() {
    let styleEl = document.getElementById('dynamic-print-page-style');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'dynamic-print-page-style';
      document.head.appendChild(styleEl);
    }
    return styleEl;
  }

  function syncPrintPageStyle() {
    const state = getState();
    const styleEl = ensurePrintStyle();
    const size = state.orientation === 'landscape' ? 'A4 landscape' : 'A4 portrait';
    styleEl.textContent = `@page { size: ${size}; margin: 0; }`;
  }

  function resetPrintBodyClasses() {
    document.body.classList.remove('printing-front', 'printing-back');
    document.body.classList.remove('printing-portrait', 'printing-landscape');
    const state = getState();
    document.body.classList.add(state.orientation === 'landscape' ? 'printing-landscape' : 'printing-portrait');
  }

  function showPrintControls() {
    getElements().printControls.classList.remove('hidden');
  }

  function hidePrintControls() {
    getElements().printControls.classList.add('hidden');
  }

  function saveUiStateForPrint() {
    const elements = getElements();
    const body = document.body;

    elements.zoomWrapper.dataset.oldTransform = elements.zoomWrapper.style.transform || '';
    elements.zoomWrapper.style.transform = 'none';
    elements.previewContainer.dataset.prevClassList = elements.previewContainer.className;
    elements.previewContainer.classList.remove('h-[46vh]');
    body.dataset.prevBodyClass = body.className;
    body.classList.remove('h-screen', 'overflow-hidden');
    elements.mainWrapper?.classList.remove('min-h-0');
  }

  function restoreUiStateAfterPrint() {
    const elements = getElements();

    if (elements.zoomWrapper.dataset.oldTransform !== undefined) {
      elements.zoomWrapper.style.transform = elements.zoomWrapper.dataset.oldTransform;
    }

    document.body.className = document.body.dataset.prevBodyClass || document.body.className;
    document.body.classList.add('min-h-screen', 'overflow-hidden');

    if (elements.previewContainer.dataset.prevClassList) {
      elements.previewContainer.className = elements.previewContainer.dataset.prevClassList;
    }
    elements.mainWrapper?.classList.add('min-h-0');
    resetPrintBodyClasses();
    hidePrintControls();
  }

  function markPrinting(side) {
    const state = getState();
    document.body.classList.remove('printing-front', 'printing-back');
    document.body.classList.add(`printing-${side}`);
    document.body.classList.toggle('printing-landscape', state.orientation === 'landscape');
    document.body.classList.toggle('printing-portrait', state.orientation !== 'landscape');
  }

  function validateBeforePrint(side) {
    const state = getState();
    if (side === 'front' && !state.frontImage) {
      showAlert('Adicione uma arte da frente antes de imprimir.', 'warning');
      return false;
    }
    if (side === 'back' && !state.backImage) {
      showAlert('Adicione uma arte do verso antes de imprimir.', 'warning');
      return false;
    }
    return true;
  }

  function triggerPrint(side) {
    const state = getState();
    const elements = getElements();

    if (!validateBeforePrint(side)) return;

    if (state.currentView !== side) {
      window.ImprimaxUI.switchView(side);
    }

    syncPrintPageStyle();
    markPrinting(side);
    showPrintControls();
    saveUiStateForPrint();

    state.isPrinting = true;

    // Garante que o navegador processe a troca de estado antes de abrir o diálogo de impressão.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.print();
        if (!elements.printDialogFallbackTimer) {
          elements.printDialogFallbackTimer = window.setTimeout(() => {
            if (state.isPrinting) {
              restoreAfterPrint();
            }
          }, 1000);
        }
      });
    });
  }

  function restoreAfterPrint() {
    const state = getState();
    if (!state.isPrinting) return;

    state.isPrinting = false;
    const elements = getElements();
    if (elements.printDialogFallbackTimer) {
      clearTimeout(elements.printDialogFallbackTimer);
      elements.printDialogFallbackTimer = null;
    }
    restoreUiStateAfterPrint();
    showAlert('Você voltou para a edição.', 'success');
  }

  function openFlipGuide() {
    getElements().flipModal.classList.remove('hidden');
  }

  function closeFlipGuide() {
    getElements().flipModal.classList.add('hidden');
  }

  function proceedToPrintBack() {
    closeFlipGuide();
    triggerPrint('back');
  }

  function bindPrintLifecycle() {
    window.addEventListener('afterprint', restoreAfterPrint);

    const mediaQuery = window.matchMedia ? window.matchMedia('print') : null;
    if (mediaQuery) {
      const listener = (event) => {
        if (!event.matches) {
          restoreAfterPrint();
        }
      };
      if (typeof mediaQuery.addEventListener === 'function') {
        mediaQuery.addEventListener('change', listener);
      } else if (typeof mediaQuery.addListener === 'function') {
        mediaQuery.addListener(listener);
      }
    }

    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && getState().isPrinting) {
        restoreAfterPrint();
      }
    });
  }

  window.ImprimaxPrint = {
    triggerPrint,
    restoreAfterPrint,
    restoreUiStateAfterPrint,
    syncPrintPageStyle,
    openFlipGuide,
    closeFlipGuide,
    proceedToPrintBack,
    bindPrintLifecycle
  };
}());
