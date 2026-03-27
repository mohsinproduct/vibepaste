// core/extractor.js

const KEY_STYLES = [
  'display', 'flex-direction', 'justify-content', 'align-items', 'gap',
  'padding', 'margin', 'width', 'height',
  'color', 'background-color', 'border', 'border-radius',
  'font-size', 'font-weight', 'text-align'
];

function extractStyles(element) {
  const computed = window.getComputedStyle(element);
  const styles = {};

  KEY_STYLES.forEach(prop => {
    const value = computed.getPropertyValue(prop);

    if (value && value !== 'none' && value !== 'normal' && value !== '0px' && value !== 'rgba(0, 0, 0, 0)') {
      styles[prop] = value;
    }
  });

  return styles;
}

function extractHTML(element) {
  const clone = element.cloneNode(true);
  return clone.outerHTML;
}

function extractElementData(element) {
  return {
    tagName: element.tagName.toLowerCase(),
    html: extractHTML(element),
    styles: extractStyles(element)
  };
}