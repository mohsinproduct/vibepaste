// core/compiler.js

window.VP_Compiler = {
  buildElementsBlock: function(elements) {
    return elements.map(el => {
      // compress styles to a single line for context efficiency
      const s = Object.entries(el.styles).map(([p, v]) => `${p}:${v}`).join('; ');
      return `[#${el.index}] Selector: ${el.selector}\nHTML: ${el.html}\nCSS: ${s}`;
    }).join('\n\n');
  },

  getRules: function(isFixMode) {
    // Core logic
    const common = "\n1. If Additional Guidance or Rules conflict with Intent, ALWAYS follow Intent.\n2. Code in existing language/framework (Vue/React/etc).\n3. no talk/no markdown/no outside conventions while generating code.\n4. If in a codebase, Apply changes globally to all related files/elements/classes in project, not just the one selected element or provided in a screenshot.";

    if (isFixMode) {
      // fix Mode: minimal changes and global application
      return `${common}\n5. Make minimal, precise changes; do not rewrite everything. \n6. Preserve existing structure, classes, and styling approach.`;
    }
    // copy Mode: abstraction and improvement
    return `${common}\n5. Create proper abstraction ( after that add in my project ) and do not copy exactly until asked. \n6. The output design shouldn't feel odd when integrating in existing project.\n7. Improve structure, reusability, and clarity.\n8. Preserve my project elements and theme them according to prompt (either on the theme of my project (default) or from inspiration design (when copying exactly)).`;
  },

  buildGuidanceBlock: function(intent, isFixMode) {
    if (!intent) return "None";
    const rules = [
      { match: /modern|clean|improve|better/i, text: "Improve visual hierarchy and typography." },
      { match: /align|center|position/i, text: "Fix alignment via flex/grid." },
      { match: /responsive|mobile/i, text: "Ensure mobile responsiveness." },
      { match: /spacing|padding|margin|gap/i, text: "Balance spacing and margins." },
      { match: /color|theme|style/i, text: "Improve contrast and colors." },
      { match: /previous|revert|undo|rollback/i, text: "Revert attempt; use last working code from history." }
    ];
    if (!isFixMode) rules.push({ match: /react|vue|svelte|extract/i, text: "Encapsulate as reusable component with props." });

    const matched = rules.filter(r => r.match.test(intent)).map(r => "- " + r.text);
    return matched.length ? matched.join('\n') : "None";
  },

  compilePrompt: async function(mode, intent, extractedElements) {
    const isFixMode = mode === window.VP_Constants.MODES.FIX;
    const storage = await chrome.storage.local.get(['vp_enable_guidance']);
    const guidance = (storage.vp_enable_guidance !== false) ? this.buildGuidanceBlock(intent, isFixMode) : "None";

    return `System: You're an expert UI/UX developer.
Rules:
${this.getRules(isFixMode)}

User Intent (Highest Priority): ${intent || "Optimize code"}

Additional Guidance:
${guidance}

Target Elements:
${this.buildElementsBlock(extractedElements)}`.trim();
  }
};