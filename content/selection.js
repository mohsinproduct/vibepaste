// content/selection.js

let sessionState = {
  mode: window.VP_Constants.MODES.FIX,
  isActive: false,
  isPaused: false,
  intent: "",
  selectedElements: []
};

// initialize ui & grab the inputs
const { input: vpInput, micBtn } = window.VP_UI.init();

// initialize voice module
window.VP_Voice.init(micBtn, vpInput, (newText) => {
  sessionState.intent = newText;
});

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

chrome.runtime.onMessage.addListener((request) => {
  if (request.action === "TOGGLE_SELECTION") {
    toggleSelectionMode();
  }
});

// to track mouse movement 
document.addEventListener('mousemove', (e) => {
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
});

// to select clicked element 
document.addEventListener('click', (e) => {
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
    }

    window.VP_UI.hideHoverOverlay();
    redrawAllOverlays();
    vpInput.focus();
  }
}, true);

// to clean display
document.addEventListener('mouseleave', () => {
  if (!sessionState.isActive) return;
  window.VP_UI.hideHoverOverlay();
});

// to sync UI with state
function redrawAllOverlays() {
  window.VP_UI.clearAllStaticOverlays();
  sessionState.selectedElements.forEach((el, index) => {
    window.VP_UI.createStaticOverlay(el, index + 1);
  });
}

// keyboard shortcuts
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && sessionState.isActive) {
    toggleSelectionMode();
  }
});

document.addEventListener('keyup', (e) => {
  if (e.key.toLowerCase() === 'p' && sessionState.isActive) {
    if (document.activeElement && document.activeElement.tagName === 'INPUT') {
      return; 
    }

    sessionState.isPaused = !sessionState.isPaused;

    if (sessionState.isPaused) {
      window.VP_UI.hideHoverOverlay();
      console.log('VibePaste: Paused for Interaction');
    } else {
      console.log('VibePaste: Resumed Selection');
    }
  }
});

vpInput.addEventListener('input', (e) => {
  sessionState.intent = e.target.value;
  window.VP_Voice.stop();
});

vpInput.addEventListener('keydown', async (e) => {
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
      vpInput.classList.add('vibepaste-input-error');
      setTimeout(() => vpInput.classList.remove('vibepaste-input-error'), 300);
      return;
    }

    const result = await window.VP_Action.execute(
      sessionState.selectedElements,
      sessionState.mode,
      sessionState.intent
    );

    if (result.success) {
      console.log(`VibePaste: Copied ${result.count} elements to clipboard!`);
      vpInput.classList.add('vibepaste-input-success');
      vpInput.value = "Copied to clipboard! 🚀";
    
      setTimeout(() => {
        vpInput.classList.remove('vibepaste-input-success');
        toggleSelectionMode();
      }, 700);

    } else {
      vpInput.value = "Error: Check console";
      vpInput.classList.add('vibepaste-input-error');
      
      setTimeout(() => {
        vpInput.classList.remove('vibepaste-input-error');
        toggleSelectionMode();
      }, 2000);
    }
  }
});


vpInput.addEventListener('keyup', (e) => {
    e.stopPropagation();
});

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

let isUpdatingPosition = false;

// 1. onscroll ui handler
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

// 2. on resize ui handler
let resizeTimeout;
function onResize() {
  if (!sessionState.isActive) return;
  window.VP_UI.hideHoverOverlay();

  // Clear the timer if the window is still moving
  clearTimeout(resizeTimeout);
  
  // Wait 100ms after the window STOPS moving before drawing the boxes
  resizeTimeout = setTimeout(() => {
    updateOverlayPositions();
  }, 100);
}

// Attach the separated listeners
window.addEventListener('scroll', onScroll, { capture: true, passive: true });
window.addEventListener('resize', onResize, { passive: true });