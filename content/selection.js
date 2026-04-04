// content/selection.js

// Initialization
let sessionState = {
  mode: window.VP_Constants.MODES.FIX,
  isActive: false,
  isPaused: false,
  intent: "",
  selectedElements: []
};

// fetch saved mode when the page first loads
chrome.storage.local.get(['vibepaste_mode'], (result) => {
  if (result.vibepaste_mode) {
    sessionState.mode = result.vibepaste_mode;
  }
});

// listen for live changes from the popup toggle.
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && changes.vibepaste_mode) {
    sessionState.mode = changes.vibepaste_mode.newValue;
    console.log(`VibePaste: Mode live-updated to [${sessionState.mode}]`);
  }
});

// initialize ui & grab the inputs
const { input: vpInput, micBtn } = window.VP_UI.init();

// initialize voice module
window.VP_Voice.init(micBtn, vpInput, (newText) => {
  sessionState.intent = newText;
});


// CORE LOGIC & HANDLERS

function toggleSelectionMode() {
  sessionState.isActive = !sessionState.isActive;

  if (!sessionState.isActive) {
    window.VP_UI.hideHoverOverlay();
    window.VP_UI.toggleCommandBar(false);
    sessionState.selectedElements = [];
    sessionState.intent = "";
    vpInput.value = "";

    window.VP_Voice.stop();
    redrawAllOverlays();
  } else {
    window.VP_UI.toggleCommandBar(true);
    vpInput.focus();
  }
  console.log(`VibePaste: Selection mode ${sessionState.isActive ? 'ON' : 'OFF'}`);
}

function redrawAllOverlays() {
  window.VP_UI.clearAllStaticOverlays();
  sessionState.selectedElements.forEach((el, index) => {
    window.VP_UI.createStaticOverlay(el, index + 1);
  });
}

function updateOverlayPositions() {
  if (!sessionState.isActive) return;

  document.querySelectorAll('.vibepaste-static-overlay').forEach(overlayBox => {
    const el = overlayBox._vpTarget;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    
    overlayBox.style.width = `${rect.width}px`;
    overlayBox.style.height = `${rect.height}px`;
    overlayBox.style.top = `${rect.top + window.scrollY}px`;
    overlayBox.style.left = `${rect.left + window.scrollX}px`;
  });
}

// --- Event Handlers ---

function handleMessage(request, sender, sendResponse) {
  if (request.action === "IS_ACTIVE") { 
    sendResponse({ isActive: sessionState.isActive });
    return true;
  }

  if (request.action === "TOGGLE_SELECTION") {
    if (sessionState.isActive && sessionState.selectedElements.length > 0) {
      vpInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true })); 
    } else {
      toggleSelectionMode();
    }
  }

  if (request.action === "TOGGLE_PAUSE") {
    if (sessionState.isActive) {
      sessionState.isPaused = !sessionState.isPaused;
      
      if (sessionState.isPaused) {
        window.VP_UI.hideHoverOverlay();
        console.log('VibePaste: Paused for Interaction');
      } else {
        console.log('VibePaste: Resumed Selection');
      }
    }
  }
}

function handleMouseMove(e) {
  if (!sessionState.isActive || sessionState.isPaused) return;

  const target = e.target;

  if (target && (target.closest('.vibepaste-command-bar') || target.classList.contains('vibepaste-hover-overlay') || target.closest('.vibepaste-static-overlay'))) {
    window.VP_UI.hideHoverOverlay();
    return;
  }

  if (!target || target === document.body || target === document.documentElement) {
    window.VP_UI.hideHoverOverlay();
    return;
  }

  if (sessionState.selectedElements.includes(target)) {
    window.VP_UI.hideHoverOverlay();
    return;
  }

  const elProps = target.getBoundingClientRect();
  const style = window.getComputedStyle(target);
  window.VP_UI.showHoverOverlay(elProps, style.borderRadius);
}

function handleMouseClick(e) {
  if (!sessionState.isActive || sessionState.isPaused) return;

  let target = e.target;

  if (target.classList.contains('vibepaste-badge')) {
      const overlayContainer = target.parentElement;
      if (overlayContainer && overlayContainer._vpTarget) {
          target = overlayContainer._vpTarget;
      }
  }

  if (target && target.closest('.vibepaste-command-bar')) {
      return;
  }

  if (target && target !== document.body && target !== document.documentElement) {
    e.preventDefault();
    e.stopPropagation();

    const existingIndex = sessionState.selectedElements.indexOf(target);
    
    if (existingIndex > -1) {
      sessionState.selectedElements.splice(existingIndex, 1);
      console.log(`VibePaste: Element deselected. Total: ${sessionState.selectedElements.length}`);
    } else {
      sessionState.selectedElements.push(target);
      console.log(`VibePaste: Element selected. Total: ${sessionState.selectedElements.length}`);

      if (sessionState.selectedElements.length === 1) {
        chrome.storage.local.get(['vp_auto_mic'], (result) => {
          if (result.vp_auto_mic && !window.VP_Voice.isListening) {
            micBtn.click();
          }
        });
      }
    }
    window.VP_UI.hideHoverOverlay();
    redrawAllOverlays();
    vpInput.focus();
  }
}

function handleMouseLeave() {
  if (!sessionState.isActive) return;
  window.VP_UI.hideHoverOverlay();
}

function handleGlobalKeydown(e) {
  if (e.key === 'Escape' && sessionState.isActive) {
    toggleSelectionMode();
  }
}

function handleInputInput(e) {
  sessionState.intent = e.target.value;
  window.VP_Voice.stop();
}

async function handleInputKeydown(e) {
  if (e.key === 'Escape') {
    e.preventDefault();
    toggleSelectionMode();
    return;
  }
  e.stopPropagation(); 

  if (e.key === 'Enter') {
    if (e.shiftKey) return; 
    
    e.preventDefault();
    window.VP_Voice.stop();
    sessionState.intent = vpInput.value.trim();
    
    if (sessionState.selectedElements.length === 0) {
      console.warn("VibePaste: No element selected!");
      window.VP_UI.showInputError(null, 300);
      return;
    }

    const result = await window.VP_Action.execute(
      sessionState.selectedElements,
      sessionState.mode,
      sessionState.intent
    );

    if (result.success) {
      console.log(`VibePaste: Copied ${result.count} elements to clipboard!`);
      window.VP_UI.showInputSuccess("Copied to clipboard! 🚀");
      setTimeout(toggleSelectionMode, 700);
    } else {
      window.VP_UI.showInputError("Error: Check console");
      setTimeout(toggleSelectionMode, 2000);
    }
  }
}

let isUpdatingPosition = false;
function onScroll() {
  if (!sessionState.isActive) return;
  window.VP_UI.hideHoverOverlay();

  if (!isUpdatingPosition) {
    window.requestAnimationFrame(() => {
      updateOverlayPositions();
      isUpdatingPosition = false; 
    });
    isUpdatingPosition = true; 
  }
}

let resizeTimeout;
function onResize() {
  if (!sessionState.isActive) return;
  window.VP_UI.hideHoverOverlay();

  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    updateOverlayPositions();
  }, 100);
}

chrome.runtime.onMessage.addListener(handleMessage);

document.addEventListener('mousemove', handleMouseMove);
document.addEventListener('click', handleMouseClick, true);
document.addEventListener('mouseleave', handleMouseLeave);
document.addEventListener('keydown', handleGlobalKeydown);

vpInput.addEventListener('input', handleInputInput);
vpInput.addEventListener('keydown', handleInputKeydown);

window.addEventListener('scroll', onScroll, { capture: true, passive: true });
window.addEventListener('resize', onResize, { passive: true });