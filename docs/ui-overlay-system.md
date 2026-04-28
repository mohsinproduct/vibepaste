# UI Overlay System (VP_UI)

> **Relevant source files**
> * [content/injector.js](https://github.com/mohsinproduct/vibepaste/blob/f3147148/content/injector.js)
> * [content/styles.css](https://github.com/mohsinproduct/vibepaste/blob/f3147148/content/styles.css)
> * [content/ui.js](https://github.com/mohsinproduct/vibepaste/blob/f3147148/content/ui.js)

The `VP_UI` module, defined in `content/ui.js`, manages the visual feedback and interactive elements injected into the web page's DOM. It provides a non-intrusive interface for element selection, voice input, and user intent entry.

## System Architecture

The UI system consists of three primary visual layers:

1. **Overlays**: Highlighting elements during selection (hover) and persistence (static).
2. **Command Bar**: A fixed-position bar containing the intent input and microphone controls.
3. **Feedback System**: Visual flashes for success/error states and specialized handling for screenshot capture.

### UI Component Interaction

The following diagram illustrates how `VP_UI` components map to specific code entities and their relationships.

**VP_UI Component Mapping**

```

```

**Sources:** [content/ui.js L3-L44](https://github.com/mohsinproduct/vibepaste/blob/f3147148/content/ui.js#L3-L44)

 [content/ui.js L61-L81](https://github.com/mohsinproduct/vibepaste/blob/f3147148/content/ui.js#L61-L81)

 [content/styles.css L24-L88](https://github.com/mohsinproduct/vibepaste/blob/f3147148/content/styles.css#L24-L88)

---

## Command Bar & Input Logic

The Command Bar is the primary interaction hub. It is initialized as a `div` with class `vibepaste-command-bar` [content/ui.js L26-L27](https://github.com/mohsinproduct/vibepaste/blob/f3147148/content/ui.js#L26-L27)

### Initialization and Structure

The `init()` function sets up the DOM structure, including a `textarea` for user intent and a microphone button for voice interaction [content/ui.js L28-L43](https://github.com/mohsinproduct/vibepaste/blob/f3147148/content/ui.js#L28-L43)

| Element | ID / Class | Purpose |
| --- | --- | --- |
| **Command Bar** | `.vibepaste-command-bar` | Container for UI tools [content/ui.js L27](https://github.com/mohsinproduct/vibepaste/blob/f3147148/content/ui.js#L27-L27) |
| **Input Area** | `#vibepaste-input` | Captures LLM instructions [content/ui.js L31](https://github.com/mohsinproduct/vibepaste/blob/f3147148/content/ui.js#L31-L31) |
| **Mic Button** | `#vibepaste-mic-btn` | Toggles voice recognition [content/ui.js L32](https://github.com/mohsinproduct/vibepaste/blob/f3147148/content/ui.js#L32-L32) |

### Voice Input States

The UI reflects the state of the Web Speech API via `updateMicUI(isListening)`. When active, it applies the `.vibepaste-mic-active` class and updates the input placeholder to "Listening..." [content/ui.js L46-L59](https://github.com/mohsinproduct/vibepaste/blob/f3147148/content/ui.js#L46-L59)

 The styling for the active mic includes a `drop-shadow` to indicate recording [content/styles.css L155-L158](https://github.com/mohsinproduct/vibepaste/blob/f3147148/content/styles.css#L155-L158)

**Sources:** [content/ui.js L25-L59](https://github.com/mohsinproduct/vibepaste/blob/f3147148/content/ui.js#L25-L59)

 [content/styles.css L70-L158](https://github.com/mohsinproduct/vibepaste/blob/f3147148/content/styles.css#L70-L158)

---

## Overlay & Badge System

`VP_UI` distinguishes between temporary hover states and persistent selections using two overlay types.

### Selection Lifecycle

1. **Hover Overlay**: A blue outline (`#007bff`) that follows the mouse cursor to indicate the current selection target [content/styles.css L30-L36](https://github.com/mohsinproduct/vibepaste/blob/f3147148/content/styles.css#L30-L36)
2. **Static Overlay**: A green outline (`#28a745`) that marks an element as "selected" for processing [content/styles.css L38-L42](https://github.com/mohsinproduct/vibepaste/blob/f3147148/content/styles.css#L38-L42)

### Numbered Badges

When a static overlay is created via `createStaticOverlay(el, number)`, a badge is appended to the overlay [content/ui.js L61-L81](https://github.com/mohsinproduct/vibepaste/blob/f3147148/content/ui.js#L61-L81)

* **Identification**: The badge displays the selection index (`number`), which corresponds to the order in the extraction payload [content/ui.js L77](https://github.com/mohsinproduct/vibepaste/blob/f3147148/content/ui.js#L77-L77)
* **Styling**: Badges are positioned at the top-left of the selection (`top: -12px; left: -12px`) [content/styles.css L45-L63](https://github.com/mohsinproduct/vibepaste/blob/f3147148/content/styles.css#L45-L63)

**Overlay Data Flow**

```

```

**Sources:** [content/ui.js L61-L99](https://github.com/mohsinproduct/vibepaste/blob/f3147148/content/ui.js#L61-L99)

 [content/styles.css L23-L68](https://github.com/mohsinproduct/vibepaste/blob/f3147148/content/styles.css#L23-L68)

---

## Screenshot Preparation

To ensure the LLM receives a clean visual context without VibePaste's own UI elements, the system uses a specialized "capturing" state.

### The vibepaste-capturing Class

The function `prepareForScreenshot()` adds the `vibepaste-capturing` class to the `document.body` [content/ui.js L127-L129](https://github.com/mohsinproduct/vibepaste/blob/f3147148/content/ui.js#L127-L129)

* **Visibility**: CSS rules hide the Command Bar and Hover Overlay when this class is present [content/styles.css L175-L178](https://github.com/mohsinproduct/vibepaste/blob/f3147148/content/styles.css#L175-L178)
* **Static Overlays**: Persistent selections are converted to a subtle 1px dashed outline to provide context without obscuring details [content/styles.css L180-L183](https://github.com/mohsinproduct/vibepaste/blob/f3147148/content/styles.css#L180-L183)
* **Timing**: The system uses `requestAnimationFrame` and a 150ms timeout to ensure the browser has rendered the UI-free state before the service worker captures the tab [content/ui.js L130-L132](https://github.com/mohsinproduct/vibepaste/blob/f3147148/content/ui.js#L130-L132)

**Sources:** [content/ui.js L127-L137](https://github.com/mohsinproduct/vibepaste/blob/f3147148/content/ui.js#L127-L137)

 [content/styles.css L175-L184](https://github.com/mohsinproduct/vibepaste/blob/f3147148/content/styles.css#L175-L184)

---

## Feedback & Theming

### Flash States

`VP_UI` provides immediate feedback on the success or failure of an action through background color transitions on the input field:

* **Success**: `showInputSuccess()` applies `.vibepaste-input-success` (green background) for 700ms [content/ui.js L107-L115](https://github.com/mohsinproduct/vibepaste/blob/f3147148/content/ui.js#L107-L115)
* **Error**: `showInputError()` applies `.vibepaste-input-error` (red background) for a configurable duration (default 2000ms) [content/ui.js L117-L125](https://github.com/mohsinproduct/vibepaste/blob/f3147148/content/ui.js#L117-L125)

### Dark Mode Support

The system uses CSS variables defined in `:root` to support system-level dark mode preferences via `@media (prefers-color-scheme: dark)` [content/styles.css L3-L21](https://github.com/mohsinproduct/vibepaste/blob/f3147148/content/styles.css#L3-L21)

| Variable | Light Mode | Dark Mode |
| --- | --- | --- |
| `--vp-bar-bg` | `rgba(255, 255, 255, 0.85)` | `rgba(30, 30, 30, 0.85)` |
| `--vp-text` | `#1a1a1a` | `#ffffff` |
| `--vp-icon` | `none` | `brightness(0) invert(1)` |

**Sources:** [content/ui.js L107-L125](https://github.com/mohsinproduct/vibepaste/blob/f3147148/content/ui.js#L107-L125)

 [content/styles.css L3-L21](https://github.com/mohsinproduct/vibepaste/blob/f3147148/content/styles.css#L3-L21)

 [content/styles.css L161-L173](https://github.com/mohsinproduct/vibepaste/blob/f3147148/content/styles.css#L161-L173)