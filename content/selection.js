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
commandBar.innerHTML = `<input type="text" id="vibe-input" placeholder="What should the AI do? (Press Enter)" autocomplete="off">`;
document.body.appendChild(commandBar);

const vibeInput = commandBar.querySelector('#vibe-input');

vibeInput.addEventListener('keydown', (e) => {
  e.stopPropagation(); 

  if (e.key === 'Enter') {
    sessionState.intent = vibeInput.value;
    console.log(`VibePaste Intent Saved: "${sessionState.intent}"`);

    // flash green
    vibeInput.style.backgroundColor = '#145c26'; 
    setTimeout(() => vibeInput.style.backgroundColor = '#2d2d2d', 200);
  }
});

vibeInput.addEventListener('keyup', (e) => {
    e.stopPropagation();
});