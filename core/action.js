window.VP_Action = {
  execute: async function(selectedElements, mode, intent) {
    if (!selectedElements || selectedElements.length === 0) {
      return { success: false, error: "No elements selected." };
    }

    try {
      // extract selected elements data
      const extractedElements = selectedElements.map((el, index) => {
        const data = window.VP_Extractor.extractElementData(el);
        const selector = window.VP_Extractor.generateSelector(el);

        return {
          index: index + 1, 
          selector: selector,
          html: data.html,
          styles: data.styles
        };
      });

      document.body.classList.add('vibepaste-capturing');
      
      await new Promise(resolve => {
        window.requestAnimationFrame(() => {
          setTimeout(resolve, 150);
        });
      });

      const screenshotResponse = await chrome.runtime.sendMessage({ action: "CAPTURE_SCREENSHOT" });

      document.body.classList.remove('vibepaste-capturing');

      let screenshotDataUrl = null;
      
      if (screenshotResponse && screenshotResponse.success) {
        screenshotDataUrl = screenshotResponse.dataUrl;
        console.log("VibePaste: Screenshot captured successfully!");
      } else {
        console.warn("VibePaste: Failed to capture screenshot. Proceeding with text only.");
      }

      // to Master Prompt
      const finalPrompt = window.VP_Compiler.compilePrompt(
        mode, 
        intent, 
        extractedElements,
        screenshotDataUrl
      );

      // save to extension's storage
      await chrome.storage.local.set({
        vibepaste_data: {
          text: finalPrompt,
          image: screenshotDataUrl
        }
      });

      return { success: true, count: extractedElements.length };

    } catch (error) {
      document.body.classList.remove('vibepaste-capturing'); 
      console.error("VibePaste Action Error:", error);
      return { success: false, error: error.message };
    }
  }
};