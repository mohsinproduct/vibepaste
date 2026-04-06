// content/selection.js

window.VP_Selection = {
  state: {
    mode: window.VP_Constants.MODES.FIX,
    isActive: false,
    isPaused: false,
    intent: "",
    selectedElements: []
  },
  
  uiControls: { input: null, micBtn: null },
  isUpdatingPosition: false,
  resizeTimeout: null,

  init: function() {
    // fetch saved mode
    chrome.storage.local.get(['vibepaste_mode'], (result) => {
      if (result.vibepaste_mode) this.state.mode = result.vibepaste_mode;
    });

    // listen for live mode changes
    chrome.storage.onChanged.addListener((changes, namespace) => {
      if (namespace === 'local' && changes.vibepaste_mode) {
        this.state.mode = changes.vibepaste_mode.newValue;
        console.log(`VibePaste: Mode live-updated to [${this.state.mode}]`);
      }
    });

    // initialize of ui & voice
    this.uiControls = window.VP_UI.init();
    window.VP_Voice.init(this.uiControls.micBtn, this.uiControls.input, (newText) => {
      this.state.intent = newText;
    });

    // attach all listeners
    this.attachListeners();
  },

  // CORE
  toggleSelectionMode: function() {
    this.state.isActive = !this.state.isActive;

    if (!this.state.isActive) {
      window.VP_UI.hideHoverOverlay();
      window.VP_UI.toggleCommandBar(false);
      this.state.selectedElements = [];
      this.state.intent = "";
      this.uiControls.input.value = "";

      window.VP_Voice.stop();
      this.redrawAllOverlays();
    } else {
      window.VP_UI.toggleCommandBar(true);
      this.uiControls.input.focus();
    }
    console.log(`VibePaste: Selection mode ${this.state.isActive ? 'ON' : 'OFF'}`);
  },

  redrawAllOverlays: function() {
    window.VP_UI.clearAllStaticOverlays();
    this.state.selectedElements.forEach((el, index) => {
      window.VP_UI.createStaticOverlay(el, index + 1);
    });
  },

  updateOverlayPositions: function() {
    if (!this.state.isActive) return;
    document.querySelectorAll('.vibepaste-static-overlay').forEach(overlayBox => {
      const el = overlayBox._vpTarget;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      overlayBox.style.width = `${rect.width}px`;
      overlayBox.style.height = `${rect.height}px`;
      overlayBox.style.top = `${rect.top + window.scrollY}px`;
      overlayBox.style.left = `${rect.left + window.scrollX}px`;
    });
  },

  // EVENT HANDLERS
  handleMessage: function(request, sender, sendResponse) {
    if (request.action === "IS_ACTIVE") { 
      sendResponse({ isActive: this.state.isActive });
      return true;
    }
    if (request.action === "TOGGLE_SELECTION") {
      if (this.state.isActive && this.state.selectedElements.length > 0) {
        this.uiControls.input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
      } else {
        this.toggleSelectionMode();
      }
    }
    if (request.action === "TOGGLE_PAUSE") {
      if (this.state.isActive) {
        this.state.isPaused = !this.state.isPaused;
        if (this.state.isPaused) {
          window.VP_UI.hideHoverOverlay();
        }
      }
    }
  },

  handleMouseMove: function(e) {
    if (!this.state.isActive || this.state.isPaused) return;

    const target = e.target;
    if (target && (target.closest('.vibepaste-command-bar') || target.classList.contains('vibepaste-hover-overlay') || target.closest('.vibepaste-static-overlay'))) {
      window.VP_UI.hideHoverOverlay();
      return;
    }
    if (!target || target === document.body || target === document.documentElement) {
      window.VP_UI.hideHoverOverlay();
      return;
    }
    if (this.state.selectedElements.includes(target)) {
      window.VP_UI.hideHoverOverlay();
      return;
    }

    const elProps = target.getBoundingClientRect();
    const style = window.getComputedStyle(target);
    window.VP_UI.showHoverOverlay(elProps, style.borderRadius);
  },

  handleMouseClick: function(e) {
    if (!this.state.isActive || this.state.isPaused) return;

    let target = e.target;
    if (target.classList.contains('vibepaste-badge')) {
        const overlayContainer = target.parentElement;
        if (overlayContainer && overlayContainer._vpTarget) target = overlayContainer._vpTarget;
    }
    if (target && target.closest('.vibepaste-command-bar')) return;

    if (target && target !== document.body && target !== document.documentElement) {
      e.preventDefault();
      e.stopPropagation();

      const existingIndex = this.state.selectedElements.indexOf(target);
      
      if (existingIndex > -1) {
        this.state.selectedElements.splice(existingIndex, 1);
      } else {
        this.state.selectedElements.push(target);
        if (this.state.selectedElements.length === 1) {
          chrome.storage.local.get(['vp_auto_mic'], (result) => {
            if (result.vp_auto_mic && !window.VP_Voice.isListening) {
              this.uiControls.micBtn.click();
            }
          });
        }
      }
      window.VP_UI.hideHoverOverlay();
      this.redrawAllOverlays();
      this.uiControls.input.focus();
    }
  },

  handleInputKeydown: async function(e) {
    if (e.key === 'Escape') {
      e.preventDefault();
      this.toggleSelectionMode();
      return;
    }
    e.stopPropagation(); 

    if (e.key === 'Enter') {
      if (e.shiftKey) return; 
      
      e.preventDefault();
      window.VP_Voice.stop();
      this.state.intent = this.uiControls.input.value.trim();
      
      if (this.state.selectedElements.length === 0) {
        window.VP_UI.showInputError(null, 300);
        return;
      }

      const result = await window.VP_Action.execute(
        this.state.selectedElements,
        this.state.mode,
        this.state.intent
      );

      if (result.success) {
        window.VP_UI.showInputSuccess("Copied to clipboard! 🚀");
        setTimeout(() => this.toggleSelectionMode(), 700);
      } else {
        window.VP_UI.showInputError("Error: Check console");
        setTimeout(() => this.toggleSelectionMode(), 2000);
      }
    }
  },

  onScroll: function() {
    if (!this.state.isActive) return;
    window.VP_UI.hideHoverOverlay();

    if (!this.isUpdatingPosition) {
      window.requestAnimationFrame(() => {
        this.updateOverlayPositions();
        this.isUpdatingPosition = false; 
      });
      this.isUpdatingPosition = true; 
    }
  },

  onResize: function() {
    if (!this.state.isActive) return;
    window.VP_UI.hideHoverOverlay();

    clearTimeout(this.resizeTimeout);
    this.resizeTimeout = setTimeout(() => this.updateOverlayPositions(), 100);
  },

  // LISTENER BINDINGS
  attachListeners: function() {
    chrome.runtime.onMessage.addListener((req, sender, sendRes) => this.handleMessage(req, sender, sendRes));
    
    document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    document.addEventListener('click', (e) => this.handleMouseClick(e), true);
    document.addEventListener('mouseleave', () => { if (this.state.isActive) window.VP_UI.hideHoverOverlay(); });
    
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.state.isActive) this.toggleSelectionMode();
    });

    this.uiControls.input.addEventListener('input', (e) => {
      this.state.intent = e.target.value;
      window.VP_Voice.stop();
    });
    this.uiControls.input.addEventListener('keydown', (e) => this.handleInputKeydown(e));
    
    window.addEventListener('scroll', () => this.onScroll(), { capture: true, passive: true });
    window.addEventListener('resize', () => this.onResize(), { passive: true });
  }
};

// Boot it up!
window.VP_Selection.init();