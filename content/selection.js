// content/selection.js

let sessionState = {
  selectedElements: [],
  mode: 'fix',
  isActive: false,
  isPaused: false,
  intent: ""
};

// overlay on hover
const overlay = document.createElement('div');
overlay.className = 'vibepaste-hover-overlay'; 
document.body.appendChild(overlay);

// overlay on selected elements
function createStaticOverlay(el, number) {
  const rect = el.getBoundingClientRect();
  const style = window.getComputedStyle(el);

  const staticOverlay = document.createElement('div');
  staticOverlay.className = 'vibepaste-static-overlay'; 
  staticOverlay._vibeTarget = el;

  // Only dynamic position variables stay in JS
  staticOverlay.style.width = `${rect.width}px`;
  staticOverlay.style.height = `${rect.height}px`;

  staticOverlay.style.top = `${rect.top + window.scrollY}px`;
  staticOverlay.style.left = `${rect.left + window.scrollX}px`;

  staticOverlay.style.borderRadius = style.borderRadius;

  const badge = document.createElement('div');
  badge.className = 'vibepaste-badge'; 
  badge.textContent = number;

  staticOverlay.appendChild(badge);
  document.body.appendChild(staticOverlay);
}

function toggleSelectionMode() {
  sessionState.isActive = !sessionState.isActive;

  if (!sessionState.isActive) {
    overlay.style.display = 'none';
    commandBar.style.display = 'none';
    sessionState.selectedElements = [];
    sessionState.intent = "";
    vibeInput.value = "";

    if (isListening && recognition) {
      recognition.stop();
    }

    redrawAllOverlays();
  } else {
    commandBar.style.display = 'block';
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
    overlay.style.display = 'none';
    return;
  }

  if (!target || target === document.body || target === document.documentElement) {
    overlay.style.display = 'none';
    return;
  }

  if (sessionState.selectedElements.includes(target)) {
    overlay.style.display = 'none';
    return;
  }

  const elProps = target.getBoundingClientRect();
  overlay.style.display = 'block';
  overlay.style.width = `${elProps.width}px`;
  overlay.style.height = `${elProps.height}px`;

  overlay.style.top = `${elProps.top + window.scrollY}px`;
  overlay.style.left = `${elProps.left + window.scrollX}px`;

  const style = window.getComputedStyle(target);
  overlay.style.borderRadius = style.borderRadius;
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

    overlay.style.display = 'none';
    redrawAllOverlays();
  }
}, true);

// to clean display
document.addEventListener('mouseleave', () => {
  if (!sessionState.isActive) return;
  overlay.style.display = 'none';
});

// to sync UI with state
function redrawAllOverlays() {
  document.querySelectorAll('.vibepaste-static-overlay').forEach(box => box.remove());
  sessionState.selectedElements.forEach((el, index) => {
    createStaticOverlay(el, index + 1); 
  });
}

// keyboard shortcuts (control layer)
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
      overlay.style.display = 'none';
      console.log('VibePaste: Paused for Interaction');
    } else {
      console.log('VibePaste: Resumed Selection');
    }
  }
});

// command bar ui
const commandBar = document.createElement('div');
commandBar.className = 'vibepaste-command-bar';
commandBar.innerHTML = `
  <div style="display: flex; gap: 8px; align-items: flex-end;">
    <textarea id="vibe-input" placeholder="What should the AI do? (Press Enter)" rows="1" autocomplete="off"></textarea>
    <button id="vibe-mic-btn" title="Voice Input" style="background: none; border: none; cursor: pointer; font-size: 18px; padding: 0 4px; margin-bottom: 6px;">🎙️</button>
  </div>
`;
document.body.appendChild(commandBar);

const vibeInput = commandBar.querySelector('#vibe-input');
const micBtn = commandBar.querySelector('#vibe-mic-btn');



// voice recognition
let recognition = null;
let isListening = false;
let textBeforeMic = '';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (SpeechRecognition) {
  recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = 'en-US';

  micBtn.addEventListener('click', () => {
    if (!isListening) {
      textBeforeMic = vibeInput.value.trim(); 
      if (textBeforeMic.length > 0) textBeforeMic += ' ';
      recognition.start();
    } else {
      recognition.stop();
    }
  });

  recognition.onstart = () => {
    isListening = true;
    micBtn.textContent = '🛑';
    micBtn.style.filter = "grayscale(0) sepia(1) hue-rotate(320deg)";
    vibeInput.placeholder = "Listening...";
  };

  recognition.onresult = (event) => {
    let currentVoiceSession = '';

    for (let i = 0; i < event.results.length; ++i) {
      currentVoiceSession += event.results[i][0].transcript;
    }

    vibeInput.value = textBeforeMic + currentVoiceSession;
    sessionState.intent = vibeInput.value;
  };

  recognition.onend = () => {
    isListening = false;
    micBtn.textContent = '🎙️';
    micBtn.style.filter = "grayscale(1)";
    vibeInput.placeholder = "What should the AI do? (Press Enter)";
    vibeInput.focus();
  };

  recognition.onerror = (event) => {
    console.error("VibePaste Voice Error:", event.error);
    isListening = false;
    micBtn.textContent = '🎙️';
    micBtn.style.filter = "grayscale(1)";
  }; 

  vibeInput.addEventListener('input', (e) => {
    sessionState.intent = e.target.value;
  });

} else {
  micBtn.style.display = 'none'; 
  console.warn("VibePaste: Web Speech API not supported in this browser.");
}


vibeInput.addEventListener('input', (e) => {
  sessionState.intent = e.target.value;
  if (isListening && recognition) {
    recognition.stop();
  }
});


vibeInput.addEventListener('keydown', async (e) => {
  e.stopPropagation(); 

  if (e.key === 'Enter') {
    sessionState.intent = vibeInput.value.trim();
    
    if (sessionState.selectedElements.length === 0) {
      console.warn("VibePaste: No element selected!");
      vibeInput.style.backgroundColor = '#8b0000';
      setTimeout(() => vibeInput.style.backgroundColor = '#2d2d2d', 300);
      return;
    }

    try {
      // Loop through ALL selected elements instead of just [0]
      const extractedElements = sessionState.selectedElements.map((el, index) => {
        const data = extractElementData(el);
        const selector = el.tagName.toLowerCase() + (el.id ? `#${el.id}` : '');
        
        return {
          index: index + 1, 
          selector: selector,
          html: data.html,
          styles: data.styles
        };
      });

      // pass the entire array to our compiler
      const finalPrompt = compilePrompt(
        sessionState.mode, 
        sessionState.intent, 
        extractedElements
      );

      // copy to clipboard
      await navigator.clipboard.writeText(finalPrompt);
      console.log(`VibePaste: Copied ${extractedElements.length} elements to clipboard!`);

      // visual feedback 
      vibeInput.style.backgroundColor = '#145c26'; // Flash green
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
  overlay.style.display = 'none';

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