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

      // to Master Prompt
      const finalPrompt = window.VP_Compiler.compilePrompt(
        mode, 
        intent, 
        extractedElements
      );

      // to clipboard
      await navigator.clipboard.writeText(finalPrompt);

      return { success: true, count: extractedElements.length };

    } catch (error) {
      console.error("VibePaste Action Error:", error);
      return { success: false, error: error.message };
    }
  }
};