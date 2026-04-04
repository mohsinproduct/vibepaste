// content/ui.js

  window.VP_UI = {
  hoverOverlay: null,
  commandBar: null,
  vpInput: null,
  micBtn: null,

  init: function() {

    // create hover overlay
    this.hoverOverlay = document.createElement('div');
    this.hoverOverlay.className = 'vibepaste-hover-overlay';
    document.body.appendChild(this.hoverOverlay);

    // create command bar
    this.commandBar = document.createElement('div');
    this.commandBar.className = 'vibepaste-command-bar';
    this.commandBar.innerHTML = `
      <div style="display: flex; gap: 8px; align-items: flex-end;">
        <textarea id="vibepaste-input" placeholder="What should the AI do? (Press Enter)" rows="1" autocomplete="off"></textarea>
        <button id="vibepaste-mic-btn" title="Voice Input" style="background: none; border: none; cursor: pointer; font-size: 18px; padding: 0 4px; margin-bottom: 6px;">🎙️</button>
      </div>
    `;
    
    document.body.appendChild(this.commandBar);

    this.vpInput = this.commandBar.querySelector('#vibepaste-input');
    this.micBtn = this.commandBar.querySelector('#vibepaste-mic-btn');

    return { input: this.vpInput, micBtn: this.micBtn };
  },

  createStaticOverlay: function(el, number) {
    const rect = el.getBoundingClientRect();
    const style = window.getComputedStyle(el);

    const staticOverlay = document.createElement('div');
    staticOverlay.className = 'vibepaste-static-overlay';
    staticOverlay._vpTarget = el;

    staticOverlay.style.width = `${rect.width}px`;
    staticOverlay.style.height = `${rect.height}px`;
    staticOverlay.style.top = `${rect.top + window.scrollY}px`;
    staticOverlay.style.left = `${rect.left + window.scrollX}px`;
    staticOverlay.style.borderRadius = style.borderRadius;

    const badge = document.createElement('div');
    badge.className = 'vibepaste-badge';
    badge.textContent = number;

    staticOverlay.appendChild(badge);
    document.body.appendChild(staticOverlay);
  },

  clearAllStaticOverlays: function() {
    document.querySelectorAll('.vibepaste-static-overlay').forEach(box => box.remove());
  },

  hideHoverOverlay: function() {
    if (this.hoverOverlay) this.hoverOverlay.style.display = 'none';
  },

  showHoverOverlay: function(rect, borderRadius) {
    if (!this.hoverOverlay) return;
    this.hoverOverlay.style.display = 'block';
    this.hoverOverlay.style.width = `${rect.width}px`;
    this.hoverOverlay.style.height = `${rect.height}px`;
    this.hoverOverlay.style.top = `${rect.top + window.scrollY}px`;
    this.hoverOverlay.style.left = `${rect.left + window.scrollX}px`;
    this.hoverOverlay.style.borderRadius = borderRadius;
  },

  toggleCommandBar: function(show) {
    if (this.commandBar) {
      this.commandBar.style.display = show ? 'block' : 'none';
    }
  },

  showInputSuccess: function(message) {
    if (!this.vpInput) return;
    this.vpInput.classList.add('vibepaste-input-success');
    this.vpInput.value = message;
    
    setTimeout(() => {
      this.vpInput.classList.remove('vibepaste-input-success');
    }, 700);
  },

  showInputError: function(message, duration = 2000) {
    if (!this.vpInput) return;
    this.vpInput.classList.add('vibepaste-input-error');
    if (message) this.vpInput.value = message;
    
    setTimeout(() => {
      this.vpInput.classList.remove('vibepaste-input-error');
    }, duration);
  },
  
  prepareForScreenshot: async function() {
    document.body.classList.add('vibepaste-capturing');

    return new Promise(resolve => {
      window.requestAnimationFrame(() => setTimeout(resolve, 150));
    });
  },

  restoreAfterScreenshot: function() {
    document.body.classList.remove('vibepaste-capturing');
  }

};