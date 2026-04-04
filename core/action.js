// core/action.js

window.VP_Action = {
  execute: async function(selectedElements, mode, intent) {
    if (!selectedElements || selectedElements.length === 0) {
      return { success: false, error: "No elements selected." };
    }

    try {
      // Extract selected elements data
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

      // take SS only if the setting is ON
      const storageData = await chrome.storage.local.get(['vp_include_screenshot']);
      
      const shouldTakeScreenshot = storageData.vp_include_screenshot !== false; 
      
      let screenshotDataUrl = null;

      if (shouldTakeScreenshot) {
        await window.VP_UI.prepareForScreenshot();
        
        const screenshotResponse = await chrome.runtime.sendMessage({ action: "CAPTURE_SCREENSHOT" });

        window.VP_UI.restoreAfterScreenshot();

        if (screenshotResponse && screenshotResponse.success) {
          screenshotDataUrl = screenshotResponse.dataUrl;
          console.log("VibePaste: Screenshot captured successfully!");
        } else {
          console.warn("VibePaste: Failed to capture screenshot. Proceeding with text only.");
        }
      } else {
        console.log("VibePaste: Screenshot skipped (disabled in settings).");
      }

      // compile Master Prompt
      const finalPrompt = await window.VP_Compiler.compilePrompt(
        mode, 
        intent, 
        extractedElements
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