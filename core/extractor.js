// core/extractor.js

window.VP_Extractor = {
  KEY_STYLES: [
    'display', 'flex-direction', 'justify-content', 'align-items', 'gap',
    'padding', 'margin', 'width', 'height',
    'color', 'background-color', 'border', 'border-radius',
    'font-size', 'font-weight', 'text-align'
  ],

  generateSelector: function(el) {
    let selector = el.tagName.toLowerCase();
    
    if (el.id) {
      selector += `#${el.id}`;
    } else if (el.className && typeof el.className === 'string') {
      // to grab up to first 3 classes & ignore empty strings
      const classes = el.className.trim().split(/\s+/).filter(Boolean).slice(0, 3);
      if (classes.length > 0) {
        selector += '.' + classes.join('.');
      }
    }
    return selector;
  },

  extractStyles: function(element) {
    const computed = window.getComputedStyle(element);
    const styles = {};

    this.KEY_STYLES.forEach(prop => {
      const value = computed.getPropertyValue(prop);
      if (value && value !== 'none' && value !== 'normal' && value !== '0px' && value !== 'rgba(0, 0, 0, 0)') {
        styles[prop] = value;
      }
    });

    return styles;
  },

  extractHTML: function(element) {
    const clone = element.cloneNode(true);
    return clone.outerHTML;
  },

  extractElementData: function(element) {
    return {
      tagName: element.tagName.toLowerCase(),
      html: this.extractHTML(element),
      styles: this.extractStyles(element)
    };
  }
};