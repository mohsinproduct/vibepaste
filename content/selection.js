// content/selection.js

let sessionState = {
  selectedElements: [],
  mode: 'fix'
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
  staticOverlay.style.top = `${rect.top}px`;
  staticOverlay.style.left = `${rect.left}px`;
  staticOverlay.style.borderRadius = style.borderRadius;

  const badge = document.createElement('div');
  badge.className = 'vibepaste-badge'; 
  badge.textContent = number;

  staticOverlay.appendChild(badge);
  document.body.appendChild(staticOverlay);
}

// to track mouse movement 
document.addEventListener('mousemove', (e) => {
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
  overlay.style.top = `${elProps.top}px`;
  overlay.style.left = `${elProps.left}px`;

  const style = window.getComputedStyle(target);
  overlay.style.borderRadius = style.borderRadius;
});

// to select clicked element 
document.addEventListener('click', (e) => {
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
  overlay.style.display = 'none';
});

// to sync UI with state
function redrawAllOverlays() {
  document.querySelectorAll('.vibepaste-static-overlay').forEach(box => box.remove());
  sessionState.selectedElements.forEach((el, index) => {
    createStaticOverlay(el, index + 1); 
  });
}