// popup/popup.js

document.addEventListener('DOMContentLoaded', () => {
  const btnCapture = document.getElementById('btn-capture');
  const radioFix = document.getElementById('mode-fix');
  const radioCopy = document.getElementById('mode-copy');
  const toggleScreenshot = document.getElementById('toggle-screenshot');
  const toggleAutoMic = document.getElementById('toggle-auto-mic');
  const btnReset = document.getElementById('btn-reset');

  // Ask the page if VibePaste is running, and change the button dynamically
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      chrome.tabs.sendMessage(tabs[0].id, { action: "IS_ACTIVE" }, (response) => {
       if (chrome.runtime.lastError) return; // Ignore un-injectable pages
        
        if (response && response.isActive) {
          btnCapture.innerHTML = '<span class="target-icon">✅</span> Finish Capturing';
          btnCapture.style.background = 'linear-gradient(135deg, #007bff, #0056b3)';
        }
      });
    }
  });

  // load last saved mode & settings
  chrome.storage.local.get(['vibepaste_mode', 'vp_include_screenshot','vp_auto_mic'], (result) => {
    
    if (result.vibepaste_mode === 'copy') {
      radioCopy.checked = true;
    } else {
      radioFix.checked = true;
      if (!result.vibepaste_mode) {
        chrome.storage.local.set({ vibepaste_mode: 'fix' });
      }
    }

    // allow SS (Default: true)
    if (result.vp_include_screenshot !== undefined) {
      toggleScreenshot.checked = result.vp_include_screenshot;
    } else {
      chrome.storage.local.set({ vp_include_screenshot: true });
    }

    if (result.vp_auto_mic !== undefined) {
      toggleAutoMic.checked = result.vp_auto_mic;
    } else {
      chrome.storage.local.set({ vp_auto_mic: false });
    }

    setTimeout(() => {
      document.body.classList.remove('preload-transitions');
    }, 20); 
  });

  // save mode when the user clicks the toggle
  const saveMode = (e) => {
    const selectedMode = e.target.value;
    chrome.storage.local.set({ vibepaste_mode: selectedMode });
  };
  
  radioFix.addEventListener('change', saveMode);
  radioCopy.addEventListener('change', saveMode);

  // save screenshot preference when clicked
  toggleScreenshot.addEventListener('change', (e) => {
    chrome.storage.local.set({ vp_include_screenshot: e.target.checked });
  });

  // save auto mic preference when clicked
  toggleAutoMic.addEventListener('change', (e) => {
    chrome.storage.local.set({ vp_auto_mic: e.target.checked });
  });

  // capture button
  btnCapture.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: "TRIGGER_FROM_POPUP" });
    window.close();
  });

  // reset 
    btnReset.addEventListener('click', () => {
    chrome.storage.local.remove('vibepaste_data'); 

    chrome.storage.local.set({ 
      vibepaste_mode: 'fix', 
      vp_include_screenshot: true,
      vp_auto_mic: false
    });

    radioFix.checked = true;
    toggleScreenshot.checked = true;
    toggleAutoMic.checked = false;

    btnReset.classList.add('vp-animate-reset');
    btnReset.textContent = '✅ Cleared!';

    setTimeout(() => {
      btnReset.classList.remove('vp-animate-reset');
      btnReset.textContent = '🔄 Reset';
    }, 800);
  });


// chrome's native shortcut manager
const btnShortcuts = document.getElementById('btn-shortcuts');
  btnShortcuts.addEventListener('click', () => {
    chrome.tabs.create({ url: 'chrome://extensions/shortcuts' });
  });
});