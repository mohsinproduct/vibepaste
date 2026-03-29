// core/compiler.js

window.VibeCompiler = {
  buildElementsBlock: function(elements, isFixMode) {
    return elements.map(el => {
      const stylesString = Object.entries(el.styles)
        .map(([prop, value]) => `${prop}: ${value};`)
        .join('\n');

      if (isFixMode) {
        return `
<element index="${el.index}">
  <selector>${el.selector}</selector>
  <current_html>
${el.html}
  </current_html>
  <computed_styles>
${stylesString}
  </computed_styles>
</element>`.trim();
      } else {
        return `
<element index="${el.index}">
  <selector>${el.selector}</selector>
  <structure>
${el.html}
  </structure>
  <visual_vibe>
${stylesString}
  </visual_vibe>
</element>`.trim();
      }
    }).join('\n\n');
  },

  compileFixModePrompt: function(intent, elementsBlock) {
    return `<system>
You are an expert frontend developer. Your task is to modify specific UI elements based on the user's intent. Output ONLY the necessary code changes to achieve the goal. Maintain the existing styling approach (e.g., Tailwind, Bootstrap, CSS modules) based on the provided classes and structure.
</system>

<context>
<intent>${intent}</intent>

<target_elements>
${elementsBlock}
</target_elements>
</context>`;
  },

  compileInspirationModePrompt: function(intent, elementsBlock) {
    return `<system>
You are an expert UI/UX engineer. Analyze the provided UI elements to extract design patterns, layout, and visual hierarchy. Generate a clean, robust, and reusable component based on the user's intent. Do not just copy the provided code blindly; build a proper abstraction.
</system>

<context>
<intent>${intent}</intent>

<reference_elements>
${elementsBlock}
</reference_elements>
</context>`;
  },

  compilePrompt: function(mode, intent, extractedElements) {
    const isFixMode = mode === 'fix';
    const elementsBlock = this.buildElementsBlock(extractedElements, isFixMode);

    if (isFixMode) {
      return this.compileFixModePrompt(intent, elementsBlock);
    } else {
      return this.compileInspirationModePrompt(intent, elementsBlock);
    }
  }
};