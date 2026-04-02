// background/service-worker.js 

// listen for Keyboard Shortcuts (Alt+C, Alt+V)
chrome.commands.onCommand.addListener((command) => {
  if (command === "capture-vibe") {
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
  
  if (command === "pause-vibe") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "TOGGLE_PAUSE" });
      }
    });
  }
});

// listen for Internal Messages (Popup Clicks & Screenshots)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

  // handle the Popup Button-Click
  if (request.action === "TRIGGER_FROM_POPUP") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "TOGGLE_SELECTION" });
      }
    });
    return true;
  }

  // Handle the Screenshot Request
  if (request.action === "CAPTURE_SCREENSHOT") {
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