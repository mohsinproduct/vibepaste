# Prompt Compilation (VP_Compiler)

> **Relevant source files**
> * [core/compiler.js](https://github.com/mohsinproduct/vibepaste/blob/f3147148/core/compiler.js)
> * [shared/constants.js](https://github.com/mohsinproduct/vibepaste/blob/f3147148/shared/constants.js)

The `VP_Compiler` module is the intelligence layer of the VibePaste pipeline. Its primary responsibility is to transform raw data—extracted DOM elements, user intent strings, and operational modes—into a highly structured, instruction-dense prompt suitable for Large Language Models (LLMs). It balances technical precision (CSS/HTML data) with heuristic-based guidance to ensure the LLM output aligns with the user's visual and functional goals.

## Core Logic & Data Flow

The compilation process is triggered by `VP_Action` after DOM extraction is complete. The compiler takes the raw `extractedElements` array and the user's `intent` to produce a single string payload.

### The Compilation Pipeline

The `compilePrompt` function [core/compiler.js L40-L56](https://github.com/mohsinproduct/vibepaste/blob/f3147148/core/compiler.js#L40-L56)

 serves as the entry point, orchestrating three sub-processes:

1. **Mode Identification**: Determining if the system is in `FIX` or `COPY` mode [shared/constants.js L3-L6](https://github.com/mohsinproduct/vibepaste/blob/f3147148/shared/constants.js#L3-L6)
2. **Element Serialization**: Converting DOM objects into a context-efficient text block.
3. **Heuristic Guidance**: Analyzing the `intent` string to inject specific developer best practices.

### System Data Flow

The following diagram illustrates how `VP_Compiler` bridges the gap between the browser's DOM state and the LLM's prompt space.

**Diagram: Prompt Assembly Architecture**

```

```

Sources: [core/compiler.js L3-L57](https://github.com/mohsinproduct/vibepaste/blob/f3147148/core/compiler.js#L3-L57)

 [shared/constants.js L1-L7](https://github.com/mohsinproduct/vibepaste/blob/f3147148/shared/constants.js#L1-L7)

---

## Element Serialization

To keep the prompt within LLM context limits while providing enough data for accurate styling, `VP_Compiler` implements a compression strategy for CSS styles.

### buildElementsBlock(elements)

This function iterates through the `elements` array provided by the extractor [core/compiler.js L4-L10](https://github.com/mohsinproduct/vibepaste/blob/f3147148/core/compiler.js#L4-L10)

* **Style Compression**: Instead of multi-line JSON, it maps the `el.styles` object into a single semicolon-delimited string [core/compiler.js L7](https://github.com/mohsinproduct/vibepaste/blob/f3147148/core/compiler.js#L7-L7)
* **Structure**: Each element is prefixed with its index (matching the UI badge number) to allow the LLM to refer to specific elements [core/compiler.js L8](https://github.com/mohsinproduct/vibepaste/blob/f3147148/core/compiler.js#L8-L8)

**Output Format Example:**

```

```

Sources: [core/compiler.js L4-L10](https://github.com/mohsinproduct/vibepaste/blob/f3147148/core/compiler.js#L4-L10)

---

## Mode-Based Rule Sets

The compiler enforces different developer personas based on the active `VP_Constants.MODES` [shared/constants.js L3-L6](https://github.com/mohsinproduct/vibepaste/blob/f3147148/shared/constants.js#L3-L6)

### Common Rules

All prompts include a "Common" block that establishes the LLM's operational boundaries [core/compiler.js L14](https://github.com/mohsinproduct/vibepaste/blob/f3147148/core/compiler.js#L14-L14)

:

* **Intent Supremacy**: User intent overrides all other rules.
* **Framework Adherence**: Must use existing project languages (React/Vue).
* **No Talk**: Forces raw code output (no markdown or conversational filler).

### Fix vs. Copy Heuristics

The `getRules(isFixMode)` function branches the prompt logic [core/compiler.js L12-L22](https://github.com/mohsinproduct/vibepaste/blob/f3147148/core/compiler.js#L12-L22)

:

| Mode | Objective | Specific Instructions |
| --- | --- | --- |
| **Fix** | Precision | "Make minimal, precise changes; do not rewrite everything." [core/compiler.js L18](https://github.com/mohsinproduct/vibepaste/blob/f3147148/core/compiler.js#L18-L18) |
| **Copy** | Abstraction | "Create proper abstraction; do not copy blindly. Improve structure." [core/compiler.js L21](https://github.com/mohsinproduct/vibepaste/blob/f3147148/core/compiler.js#L21-L21) |

Sources: [core/compiler.js L12-L22](https://github.com/mohsinproduct/vibepaste/blob/f3147148/core/compiler.js#L12-L22)

 [shared/constants.js L2-L7](https://github.com/mohsinproduct/vibepaste/blob/f3147148/shared/constants.js#L2-L7)

---

## Intent-Based Guidance (Heuristics)

One of the most powerful features of `VP_Compiler` is its ability to "read between the lines" of a user's intent. If `vp_enable_guidance` is enabled in storage [core/compiler.js L42-L43](https://github.com/mohsinproduct/vibepaste/blob/f3147148/core/compiler.js#L42-L43)

 the `buildGuidanceBlock` function applies regex matching to the intent string to suggest specific technical improvements [core/compiler.js L24-L38](https://github.com/mohsinproduct/vibepaste/blob/f3147148/core/compiler.js#L24-L38)

### Guidance Mapping Table

The compiler uses a `rules` array to map keywords to developer directives [core/compiler.js L26-L34](https://github.com/mohsinproduct/vibepaste/blob/f3147148/core/compiler.js#L26-L34)

:

| Regex Match | Injected Guidance |
| --- | --- |
| `/modern\|clean\|improve/i` | Improve visual hierarchy and typography. |
| `/align\|center\|position/i` | Fix alignment via flex/grid. |
| `/responsive\|mobile/i` | Ensure mobile responsiveness. |
| `/spacing\|padding\|margin/i` | Balance spacing and margins. |
| `/react\|vue\|svelte/i` | Encapsulate as reusable component with props. (Copy Mode only) |

**Diagram: Heuristic Matching Logic**

```

```

Sources: [core/compiler.js L24-L38](https://github.com/mohsinproduct/vibepaste/blob/f3147148/core/compiler.js#L24-L38)

---

## Context Optimization Strategies

To ensure the LLM remains focused and stays within token limits, the compiler employs several strategies:

1. **Storage Check**: It checks `chrome.storage.local` for the `vp_enable_guidance` flag before running heuristics, allowing users to disable the automated guidance if it interferes with specific requests [core/compiler.js L42-L43](https://github.com/mohsinproduct/vibepaste/blob/f3147148/core/compiler.js#L42-L43)
2. **Strict Formatting**: The `compilePrompt` function uses a template literal that strictly organizes the system role, rules, intent, guidance, and target elements in a consistent order [core/compiler.js L45-L55](https://github.com/mohsinproduct/vibepaste/blob/f3147148/core/compiler.js#L45-L55)
3. **Default Intent**: If the user provides no intent, the compiler defaults to `"Optimize code"` to ensure the LLM has a baseline directive [core/compiler.js L49](https://github.com/mohsinproduct/vibepaste/blob/f3147148/core/compiler.js#L49-L49)

Sources: [core/compiler.js L40-L56](https://github.com/mohsinproduct/vibepaste/blob/f3147148/core/compiler.js#L40-L56)