(function () {
  'use strict';

  const state = {
    frontImage: null,
    backImage: null,
    cols: 3,
    rows: 3,
    gap: 0,
    orientation: 'portrait',
    rotateFront: false,
    rotateBack: false,
    currentView: 'front',
    isPrinting: false
  };

  const elements = {};

  function cacheElements() {
    elements.alert = document.getElementById('app-alert');
    elements.printControls = document.getElementById('print-mode-controls');
    elements.flipModal = document.getElementById('flip-modal');
    elements.pageFront = document.getElementById('page-front');
    elements.pageBack = document.getElementById('page-back');
    elements.gridFront = document.getElementById('grid-front');
    elements.gridBack = document.getElementById('grid-back');
    elements.zoomWrapper = document.getElementById('zoom-wrapper');
    elements.previewContainer = document.getElementById('preview-container');
    elements.mainWrapper = document.getElementById('main-wrapper');
    elements.zoomSlider = document.getElementById('zoom-slider');
    elements.zoomText = document.getElementById('zoom-text');
    elements.btnViewFront = document.getElementById('btn-view-front');
    elements.btnViewBack = document.getElementById('btn-view-back');
    elements.btnZoomIn = document.getElementById('btn-zoom-in');
    elements.btnZoomOut = document.getElementById('btn-zoom-out');
    elements.btnAutoFit = document.getElementById('btn-auto-fit');
    elements.btnPrintFront = document.getElementById('btn-print-front');
    elements.btnOpenFlip = document.getElementById('btn-open-flip');
    elements.btnPrintBack = document.getElementById('btn-print-back');
    elements.btnExitPrint = document.getElementById('btn-exit-print');
    elements.btnCloseFlip = document.getElementById('btn-close-flip');
    elements.btnCancelFlip = document.getElementById('btn-cancel-flip');
    elements.colsInput = document.getElementById('cols');
    elements.rowsInput = document.getElementById('rows');
    elements.gapInput = document.getElementById('gap');
    elements.orientationSelect = document.getElementById('orientation');
    elements.rotateFrontCheckbox = document.getElementById('rotate-front');
    elements.rotateBackCheckbox = document.getElementById('rotate-back');
    elements.showGuidelines = document.getElementById('show-guidelines');
    elements.idealSizeMm = document.getElementById('ideal-size-mm');
    elements.idealSizePx = document.getElementById('ideal-size-px');
    elements.frontInput = document.getElementById('upload-front');
    elements.backInput = document.getElementById('upload-back');
    elements.frontPreview = document.getElementById('preview-img-front');
    elements.backPreview = document.getElementById('preview-img-back');
    elements.frontLoading = document.querySelector('[data-loading-state="front"]');
    elements.backLoading = document.querySelector('[data-loading-state="back"]');
    elements.printDialogFallbackTimer = null;
  }

  function showAlert(message, type = 'info') {
    const alert = elements.alert;
    if (!alert) return;

    alert.className = `app-alert show ${type}`;
    alert.textContent = message;
    window.clearTimeout(alert._timer);
    alert._timer = window.setTimeout(() => {
      alert.classList.remove('show');
    }, 2800);
  }

  function setLoading(side, isLoading) {
    const loadingNode = side === 'front' ? elements.frontLoading : elements.backLoading;
    const card = document.querySelector(`[data-upload-card="${side}"]`);
    const input = side === 'front' ? elements.frontInput : elements.backInput;

    if (loadingNode) loadingNode.classList.toggle('hidden', !isLoading);
    if (card) card.classList.toggle('pointer-events-none', isLoading);
    if (input) input.disabled = isLoading;
  }

  function clearUpload(side) {
    const input = side === 'front' ? elements.frontInput : elements.backInput;
    const preview = side === 'front' ? elements.frontPreview : elements.backPreview;

    if (input) input.value = '';
    if (preview) {
      preview.src = '';
      preview.classList.add('hidden');
    }
  }

  function readImageFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onerror = () => reject(new Error('Não foi possível ler o arquivo.'));
      reader.onload = () => {
        const dataUrl = String(reader.result || '');
        const image = new Image();
        image.onload = () => resolve(dataUrl);
        image.onerror = () => reject(new Error('O arquivo parece estar corrompido ou não é uma imagem válida.'));
        image.src = dataUrl;
      };

      reader.readAsDataURL(file);
    });
  }

  async function handleImageUpload(event, side) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type || !file.type.startsWith('image/')) {
      clearUpload(side);
      showAlert('Formato inválido. Escolha um arquivo de imagem válido.', 'error');
      return;
    }

    setLoading(side, true);

    try {
      const dataUrl = await readImageFile(file);
      state[`${side}Image`] = dataUrl;
      const preview = side === 'front' ? elements.frontPreview : elements.backPreview;
      if (preview) {
        preview.src = dataUrl;
        preview.classList.remove('hidden');
      }
      showAlert(`Arte da ${side === 'front' ? 'frente' : 'verso'} carregada com sucesso.`, 'success');
      window.ImprimaxGrid.generateGrids();
    } catch (error) {
      state[`${side}Image`] = null;
      clearUpload(side);
      showAlert(error.message || 'Falha ao carregar a imagem.', 'error');
    } finally {
      setLoading(side, false);
    }
  }

  function switchView(side) {
    state.currentView = side;

    elements.pageFront.classList.toggle('hidden', side !== 'front');
    elements.pageBack.classList.toggle('hidden', side !== 'back');

    elements.btnViewFront.classList.toggle('active', side === 'front');
    elements.btnViewBack.classList.toggle('active', side === 'back');
  }

  function updateZoom() {
    const value = parseInt(elements.zoomSlider.value, 10);
    elements.zoomText.textContent = `${value}%`;
    elements.zoomWrapper.style.transform = `scale(${value / 100})`;
  }

  function zoomIn() {
    elements.zoomSlider.value = String(Math.min(parseInt(elements.zoomSlider.value, 10) + 10, 150));
    updateZoom();
  }

  function zoomOut() {
    elements.zoomSlider.value = String(Math.max(parseInt(elements.zoomSlider.value, 10) - 10, 20));
    updateZoom();
  }

  function autoFitMobile() {
    const container = elements.previewContainer;
    const availableWidth = Math.max(240, container.clientWidth - 40);
    const isLandscape = state.orientation === 'landscape';
    const pageWidthMm = isLandscape ? 297 : 210;
    const pageWidthPx = (pageWidthMm * 96) / 25.4;

    const scale = Math.max(20, Math.min((availableWidth / pageWidthPx) * 100, 100));
    elements.zoomSlider.value = String(Math.floor(scale));
    updateZoom();
  }

  function toggleGuidelines() {
    document.querySelectorAll('.a4-page').forEach((page) => {
      page.classList.toggle('show-guidelines', elements.showGuidelines.checked);
    });
  }

  function sanitizeDimensions() {
    elements.colsInput.value = String(window.ImprimaxGrid.clamp(parseInt(elements.colsInput.value, 10) || 1, 1, 10));
    elements.rowsInput.value = String(window.ImprimaxGrid.clamp(parseInt(elements.rowsInput.value, 10) || 1, 1, 10));
    elements.gapInput.value = String(window.ImprimaxGrid.clamp(parseInt(elements.gapInput.value, 10) || 0, 0, 20));
  }

  function handleReadyArtClick(event) {
    const button = event.target.closest('[data-art-card]');
    if (!button) return;

    if (button.dataset.available !== 'true') {
      showAlert('Essa arte estará disponível em breve.', 'warning');
      return;
    }

    state.frontImage = button.dataset.front || null;
    state.backImage = button.dataset.back || null;
    if (state.frontImage) {
      elements.frontPreview.src = state.frontImage;
      elements.frontPreview.classList.remove('hidden');
    }
    if (state.backImage) {
      elements.backPreview.src = state.backImage;
      elements.backPreview.classList.remove('hidden');
    }

    window.ImprimaxGrid.generateGrids();
    showAlert('Arte pronta carregada com sucesso.', 'success');
  }

  function wireEvents() {
    elements.frontInput.addEventListener('change', (event) => handleImageUpload(event, 'front'));
    elements.backInput.addEventListener('change', (event) => handleImageUpload(event, 'back'));
    elements.btnViewFront.addEventListener('click', () => switchView('front'));
    elements.btnViewBack.addEventListener('click', () => switchView('back'));
    elements.btnZoomIn.addEventListener('click', zoomIn);
    elements.btnZoomOut.addEventListener('click', zoomOut);
    elements.btnAutoFit.addEventListener('click', autoFitMobile);
    elements.zoomSlider.addEventListener('input', updateZoom);
    elements.orientationSelect.addEventListener('change', (event) => {
      window.ImprimaxGrid.setOrientation(event.target.value);
      autoFitMobile();
    });
    elements.showGuidelines.addEventListener('change', toggleGuidelines);
    elements.rotateFrontCheckbox.addEventListener('change', window.ImprimaxGrid.generateGrids);
    elements.rotateBackCheckbox.addEventListener('change', window.ImprimaxGrid.generateGrids);
    elements.colsInput.addEventListener('input', () => {
      sanitizeDimensions();
      window.ImprimaxGrid.generateGrids();
    });
    elements.rowsInput.addEventListener('input', () => {
      sanitizeDimensions();
      window.ImprimaxGrid.generateGrids();
    });
    elements.gapInput.addEventListener('input', () => {
      sanitizeDimensions();
      window.ImprimaxGrid.generateGrids();
    });
    elements.btnPrintFront.addEventListener('click', () => window.ImprimaxPrint.triggerPrint('front'));
    elements.btnOpenFlip.addEventListener('click', window.ImprimaxPrint.openFlipGuide);
    elements.btnPrintBack.addEventListener('click', window.ImprimaxPrint.proceedToPrintBack);
    elements.btnExitPrint.addEventListener('click', window.ImprimaxPrint.restoreAfterPrint);
    elements.btnCloseFlip.addEventListener('click', window.ImprimaxPrint.closeFlipGuide);
    elements.btnCancelFlip.addEventListener('click', window.ImprimaxPrint.closeFlipGuide);
    document.getElementById('flip-modal').addEventListener('click', (event) => {
      if (event.target.id === 'flip-modal') {
        window.ImprimaxPrint.closeFlipGuide();
      }
    });
    document.addEventListener('click', handleReadyArtClick);
    window.addEventListener('resize', () => {
      window.clearTimeout(window.ImprimaxResizeTimer);
      window.ImprimaxResizeTimer = window.setTimeout(autoFitMobile, 250);
    });
  }

  function initialize() {
    cacheElements();

    window.ImprimaxState = state;
    window.ImprimaxElements = elements;
    window.ImprimaxShowAlert = showAlert;
    window.ImprimaxUI = { switchView };

    if (state.orientation === 'landscape') {
      document.body.classList.add('printing-landscape');
    } else {
      document.body.classList.add('printing-portrait');
    }

    wireEvents();
    window.ImprimaxPrint.bindPrintLifecycle();
    window.ImprimaxGrid.generateGrids();
    updateZoom();
    autoFitMobile();
    toggleGuidelines();
    window.ImprimaxPrint.syncPrintPageStyle();
  }

  window.addEventListener('DOMContentLoaded', initialize);
}());
