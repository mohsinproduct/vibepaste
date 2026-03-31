// content/injector.js

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "EXECUTE_PASTE") {
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

      // 💥 1. FIRE TEXT PASTE EVENT
      if (data.text) {
        const inserted = document.execCommand('insertText', false, data.text);
        
        if (!inserted) {
          const textDt = new DataTransfer();
          textDt.setData('text/plain', data.text);
          activeEl.dispatchEvent(new ClipboardEvent('paste', {
            clipboardData: textDt,
            bubbles: true,
            cancelable: true
          }));
        }
      }

      // img paste event
      if (data.image) {
        setTimeout(() => {
          try {
            // Manually decode Base64 to bypass strict CSP fetch rules
            const byteString = atob(data.image.split(',')[1]);
            const mimeString = data.image.split(',')[0].split(':')[1].split(';')[0];
            const ab = new ArrayBuffer(byteString.length);
            const ia = new Uint8Array(ab);
            
            for (let i = 0; i < byteString.length; i++) {
              ia[i] = byteString.charCodeAt(i);
            }
            
            const blob = new Blob([ab], { type: mimeString });
            const file = new File([blob], 'vibepaste_context.png', { type: mimeString });
            
            const imgDt = new DataTransfer();
            imgDt.items.add(file);
            
            activeEl.dispatchEvent(new ClipboardEvent('paste', {
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
    });
  }
});