//service-worker.js 

chrome.commands.onCommand.addListener((command) => {
  if (command === "toggle-selection") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "TOGGLE_SELECTION" });
      }
    });
  }
});