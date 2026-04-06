// content/injector.js

window.VP_Injector = {
  init: function() {
    chrome.runtime.onMessage.addListener((request) => {
      if (request.action === "EXECUTE_PASTE") {
        this.executePaste();
      }
    });
  },

  executePaste: function() {
    const activeEl = document.activeElement;
    
    if (!activeEl || (!activeEl.isContentEditable && activeEl.tagName !== 'TEXTAREA' && activeEl.tagName !== 'INPUT')) {
      console.warn("VibePaste: Please focus a text input before pasting.");
      return;
    }

    chrome.storage.local.get(['vibepaste_data'], (result) => {
      const data = result.vibepaste_data;
      if (!data) {
        console.warn("VibePaste: No data found in storage.");
        return;
      }
      
      if (data.text) this.pasteText(activeEl, data.text);
      if (data.image) this.pasteImage(activeEl, data.image);
    });
  },

  pasteText: function(targetEl, text) {
    const inserted = document.execCommand('insertText', false, text);
    if (!inserted) {
      const textDt = new DataTransfer();
      textDt.setData('text/plain', text);
      targetEl.dispatchEvent(new ClipboardEvent('paste', {
        clipboardData: textDt,
        bubbles: true,
        cancelable: true
      }));
    }
  },

  pasteImage: function(targetEl, base64Image) {
    setTimeout(() => {
      try {
        const byteString = atob(base64Image.split(',')[1]);
        const mimeString = base64Image.split(',')[0].split(':')[1].split(';')[0];
 
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        
        const blob = new Blob([ab], { type: mimeString });
        const file = new File([blob], 'vibepaste_context.png', { type: mimeString });
        
        const imgDt = new DataTransfer();
        imgDt.items.add(file);
        
        targetEl.dispatchEvent(new ClipboardEvent('paste', {
          clipboardData: imgDt,
          bubbles: true,
          cancelable: true
        }));
        console.log("VibePaste: Double-tap injection complete! 🚀");
      } catch (error) {
        console.error("VibePaste Image Conversion Error:", error);
      }
    }, 150);
  }
};

window.VP_Injector.init();