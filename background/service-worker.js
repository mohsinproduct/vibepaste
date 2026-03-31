// background/service-worker.js 

chrome.commands.onCommand.addListener((command) => {
  if (command === "toggle-selection") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "TOGGLE_SELECTION" });
      }
    });
  }
  
  if (command === "vibe-paste") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "EXECUTE_PASTE" });
      }
    });
  }
});

// listen for SS requests from the content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "CAPTURE_SCREENSHOT") {
    
    // use the native chrome api to take SS
    chrome.tabs.captureVisibleTab(null, { format: "png" }, (dataUrl) => {
      if (chrome.runtime.lastError) {
        console.error("VibePaste Screenshot Error:", chrome.runtime.lastError.message);
        sendResponse({ success: false, error: chrome.runtime.lastError.message });
        return;
      }
      
      // Send the base64 image data back to the content script
      sendResponse({ success: true, dataUrl: dataUrl });
    });

    return true; 
  }
});