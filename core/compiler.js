// core/compiler.js

window.VP_Compiler = {
  buildElementsBlock: function(elements, isFixMode) {
    return elements.map(el => {
      const stylesString = Object.entries(el.styles)
        .map(([prop, value]) => `${prop}: ${value};`)
        .join('\n');

      if (isFixMode) {
        return `
# Element ${el.index}
selector: ${el.selector}

HTML:
\`\`\`html
${el.html}
\`\`\`

STYLES:
\`\`\`css
${stylesString}
\`\`\`
        `.trim();
      } else {
        return `
# Element ${el.index}
selector: ${el.selector}

STRUCTURE:
${el.html}

VISUAL:
${stylesString}
        `.trim();
      }
    }).join('\n\n');
  },

  buildSystemBlock: function(isFixMode) {
    if (isFixMode) {
      return `
You are an expert frontend developer.

GOAL:
Modify the given UI elements based on the user's intent.

RULES:
- The user's intent is the highest priority.
- If additional guidance conflicts with the intent, ignore the guidance.
- Make minimal, precise changes (do not rewrite everything).
- Preserve existing structure, classes, and styling approach.
- Output ONLY the updated code (no explanations or following user's codebase conventions (if present)).
      `.trim();
    } else {
      return `
You are an expert UI/UX engineer.

GOAL:
Generate a clean, reusable component inspired by the reference elements.

RULES:
- The user's intent is the highest priority.
- If additional guidance conflicts with the intent, ignore the guidance.
- Do NOT copy blindly — create a proper abstraction.
- Improve structure, reusability, and clarity.
- Output ONLY the final code (no explanations or following user's codebase conventions (if present)).
      `.trim();
    }
  },

  buildGuidanceBlock: function(intent, isFixMode) {
    if (!intent) return "";

    const rules = [
      {
        match: /(modern|clean|improve|better)/i,
        text: "- Improve visual hierarchy, spacing, and typography"
      },
      {
        match: /(align|center|position)/i,
        text: "- Fix alignment using flexbox or grid with proper spacing"
      },
      {
        match: /(responsive|mobile)/i,
        text: "- Ensure responsiveness across screen sizes"
      },
      {
        match: /(spacing|padding|margin|gap)/i,
        text: "- Adjust spacing for visual balance"
      },
      {
        match: /(color|theme|style)/i,
        text: "- Improve colors and contrast for better UX"
      },
      {
        match: /(previous|revert|undo|rollback|instead)/i,
        text: "- Discard the most recent failed attempt. Base your new modifications strictly on the last known working version of the code from our chat history."
      }
    ];

    if (!isFixMode) {
      rules.push({
        match: /(react|vue|svelte|component|extract)/i,
        text: "- Extract this into a fully encapsulated, highly reusable component with proper props/state."
      });
    }

    const matched = rules
      .filter(rule => rule.match.test(intent))
      .map(rule => rule.text);

    if (matched.length === 0) return "";
    return matched.join('\n');
  },

  compilePrompt: async function(mode, intent, extractedElements) {
    const isFixMode = mode === window.VP_Constants.MODES.FIX;
    const elementsBlock = this.buildElementsBlock(extractedElements, isFixMode);
    const systemBlock = this.buildSystemBlock(isFixMode);

    const storage = await chrome.storage.local.get(['vp_enable_guidance']);
    const guidanceEnabled = storage.vp_enable_guidance !== false;

    let guidanceBlock = "";
    if (guidanceEnabled) {
      const generatedGuidance = this.buildGuidanceBlock(intent, isFixMode);
      if (generatedGuidance) {
        guidanceBlock = `\n\nADDITIONAL GUIDANCE:\n${generatedGuidance}`;
      }
    }

    return `
SYSTEM:
${systemBlock}

USER INTENT:
${intent || "No explicit intent provided"}
${guidanceBlock}

TARGET ELEMENTS:
${elementsBlock}
    `.trim();
  }
};