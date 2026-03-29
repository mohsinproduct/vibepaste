// content/selection.js

let sessionState = {
  selectedElements: [],
  mode: 'fix',
  isActive: false,
  isPaused: false,
  intent: ""
};

// initialize ui & grab the inputs
const { input: vibeInput, micBtn } = window.VibeUI.init();

// initialize voice module
window.VibeVoice.init(micBtn, vibeInput, (newText) => {
  sessionState.intent = newText;
});

function toggleSelectionMode() {
  sessionState.isActive = !sessionState.isActive;

  if (!sessionState.isActive) {
    window.VibeUI.hideHoverOverlay();
    window.VibeUI.toggleCommandBar(false);
    sessionState.selectedElements = [];
    sessionState.intent = "";
    vibeInput.value = "";

    window.VibeVoice.stop();
    redrawAllOverlays();
  } else {
    window.VibeUI.toggleCommandBar(true);
    vibeInput.focus();
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
    window.VibeUI.hideHoverOverlay();
    return;
  }

  if (!target || target === document.body || target === document.documentElement) {
    window.VibeUI.hideHoverOverlay();
    return;
  }

  if (sessionState.selectedElements.includes(target)) {
    window.VibeUI.hideHoverOverlay();
    return;
  }

  const elProps = target.getBoundingClientRect();
  const style = window.getComputedStyle(target);
  window.VibeUI.showHoverOverlay(elProps, style.borderRadius);
});

// to select clicked element 
document.addEventListener('click', (e) => {
  if (!sessionState.isActive || sessionState.isPaused) return;

  let target = e.target;

  if (target.classList.contains('vibepaste-badge')) {
      const overlayContainer = target.parentElement;
      if (overlayContainer && overlayContainer._vibeTarget) {
          target = overlayContainer._vibeTarget;
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

    window.VibeUI.hideHoverOverlay();
    redrawAllOverlays();
    vibeInput.focus();
  }
}, true);

// to clean display
document.addEventListener('mouseleave', () => {
  if (!sessionState.isActive) return;
  window.VibeUI.hideHoverOverlay();
});

// to sync UI with state
function redrawAllOverlays() {
  window.VibeUI.clearAllStaticOverlays();
  sessionState.selectedElements.forEach((el, index) => {
    window.VibeUI.createStaticOverlay(el, index + 1); 
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
      window.VibeUI.hideHoverOverlay();
      console.log('VibePaste: Paused for Interaction');
    } else {
      console.log('VibePaste: Resumed Selection');
    }
  }
});

vibeInput.addEventListener('input', (e) => {
  sessionState.intent = e.target.value;
  window.VibeVoice.stop();
});

vibeInput.addEventListener('keydown', async (e) => {
  e.stopPropagation(); 

  if (e.key === 'Enter') {

    if (e.shiftKey) return; 
    
    e.preventDefault();
    window.VibeVoice.stop();
    sessionState.intent = vibeInput.value.trim();
    
    if (sessionState.selectedElements.length === 0) {
      console.warn("VibePaste: No element selected!");
      vibeInput.style.backgroundColor = '#8b0000';
      setTimeout(() => vibeInput.style.backgroundColor = '#2d2d2d', 300);
      return;
    }

    try {
      // Loop through ALL selected elements
      const extractedElements = sessionState.selectedElements.map((el, index) => {
        
        const data = window.VibeExtractor.extractElementData(el); 
        const selector = el.tagName.toLowerCase() + (el.id ? `#${el.id}` : '');
        
        return {
          index: index + 1, 
          selector: selector,
          html: data.html,
          styles: data.styles
        };
      });

      
      const finalPrompt = window.VibeCompiler.compilePrompt( 
        sessionState.mode, 
        sessionState.intent, 
        extractedElements
      );

      // copy to clipboard
      await navigator.clipboard.writeText(finalPrompt);
      console.log(`VibePaste: Copied ${extractedElements.length} elements to clipboard!`);

      // visual feedback 
      vibeInput.style.backgroundColor = '#145c26'; 
      vibeInput.value = "Copied to clipboard! 🚀";
    
      setTimeout(() => {
        toggleSelectionMode(); 
      }, 700);

    } catch (error) {
      console.error("VibePaste Error generating prompt:", error);
      vibeInput.value = "Error: Check console";
      vibeInput.style.backgroundColor = '#8b0000';
    }
  }
});

vibeInput.addEventListener('keyup', (e) => {
    e.stopPropagation();
});

function updateOverlayPositions() {
  if (!sessionState.isActive) return;

  document.querySelectorAll('.vibepaste-static-overlay').forEach(overlayBox => {
    const el = overlayBox._vibeTarget;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    
    overlayBox.style.width = `${rect.width}px`;
    overlayBox.style.height = `${rect.height}px`;
    
    overlayBox.style.top = `${rect.top + window.scrollY}px`;
    overlayBox.style.left = `${rect.left + window.scrollX}px`;
  });
}

let isUpdatingPosition = false;

function onScrollOrResize() {
  if (!sessionState.isActive) return;
  window.VibeUI.hideHoverOverlay();

  if (!isUpdatingPosition) {
    window.requestAnimationFrame(() => {
      updateOverlayPositions();
      isUpdatingPosition = false; 
    });
    isUpdatingPosition = true; 
  }
}

window.addEventListener('scroll', onScrollOrResize, { capture: true, passive: true });
window.addEventListener('resize', onScrollOrResize, { passive: true });