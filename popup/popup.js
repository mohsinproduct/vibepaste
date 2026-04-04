// popup/popup.js

document.addEventListener('DOMContentLoaded', () => {
  const btnCapture = document.getElementById('btn-capture');
  const btnShortcuts = document.getElementById('btn-shortcuts');
  const btnReset = document.getElementById('btn-reset');

  const SettingsManager = {
    config: [
      { key: 'vibepaste_mode', id: 'mode-fix', type: 'radio', default: 'fix' },
      { key: 'vp_include_screenshot', id: 'toggle-screenshot', type: 'checkbox', default: true },
      { key: 'vp_auto_mic', id: 'toggle-auto-mic', type: 'checkbox', default: false },
      { key: 'vp_enable_guidance', id: 'toggle-guidance', type: 'checkbox', default: true }
    ],

    init: function() {
      const keys = this.config.map(item => item.key);

      chrome.storage.local.get(keys, (result) => {
        this.config.forEach(item => {
          
          const value = result[item.key] !== undefined ? result[item.key] : item.default;

          if (result[item.key] === undefined) this.save(item.key, value);

          // to sync ui & storage
          this.updateUI(item, value);
          this.attachListener(item);
        });

        setTimeout(() => document.body.classList.remove('preload-transitions'), 20);
      });
    },

    updateUI: function(item, value) {
      if (item.type === 'checkbox') {
        document.getElementById(item.id).checked = value;
      } else if (item.type === 'radio') {
        const radio = document.querySelector(`input[name="vp-mode"][value="${value}"]`);
        if (radio) radio.checked = true;
      }
    },

    attachListener: function(item) {
      if (item.type === 'checkbox') {
        document.getElementById(item.id).addEventListener('change', (e) => {
          this.save(item.key, e.target.checked);
        });
      } else if (item.type === 'radio') {
        document.querySelectorAll(`input[name="vp-mode"]`).forEach(radio => {
          radio.addEventListener('change', (e) => {
            if (e.target.checked) this.save(item.key, e.target.value);
          });
        });
      }
    },

    save: function(key, value) {
      chrome.storage.local.set({ [key]: value });
    },

    reset: function() {
      chrome.storage.local.remove('vibepaste_data'); 

      this.config.forEach(item => {
        this.save(item.key, item.default);
        this.updateUI(item, item.default);
      });
    }
  };

  
  SettingsManager.init();


  // UI BUTTONS' Logic
  
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      chrome.tabs.sendMessage(tabs[0].id, { action: "IS_ACTIVE" }, (response) => {
       if (chrome.runtime.lastError) return;
        
        if (response && response.isActive) {
          btnCapture.innerHTML = '<span class="target-icon">✅</span> Finish Capturing';
          btnCapture.style.background = 'linear-gradient(135deg, #007bff, #0056b3)';
        }
      });
    }
  });

  // "start capture" button
  btnCapture.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: "TRIGGER_FROM_POPUP" });
    window.close();
  });

  // "reset" button
  btnReset.addEventListener('click', () => {
    SettingsManager.reset();

    btnReset.classList.add('vp-animate-reset');
    btnReset.textContent = '✅ Cleared!';

    setTimeout(() => {
      btnReset.classList.remove('vp-animate-reset');
      btnReset.textContent = '🔄 Reset';
    }, 800);
  });

  // "shortcuts" button
  btnShortcuts.addEventListener('click', () => {
    chrome.tabs.create({ url: 'chrome://extensions/shortcuts' });
  });
});