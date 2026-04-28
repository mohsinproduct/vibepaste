# Content UI SVG Icons

> **Relevant source files**
> * [assets/icons/arrows-counter-clockwise.svg](https://github.com/mohsinproduct/vibepaste/blob/f3147148/assets/icons/arrows-counter-clockwise.svg)
> * [assets/icons/brain.svg](https://github.com/mohsinproduct/vibepaste/blob/f3147148/assets/icons/brain.svg)
> * [assets/icons/check-circle.svg](https://github.com/mohsinproduct/vibepaste/blob/f3147148/assets/icons/check-circle.svg)
> * [assets/icons/copy-simple.svg](https://github.com/mohsinproduct/vibepaste/blob/f3147148/assets/icons/copy-simple.svg)
> * [assets/icons/crosshair-simple.svg](https://github.com/mohsinproduct/vibepaste/blob/f3147148/assets/icons/crosshair-simple.svg)
> * [assets/icons/keyboard.svg](https://github.com/mohsinproduct/vibepaste/blob/f3147148/assets/icons/keyboard.svg)
> * [assets/icons/logo.svg](https://github.com/mohsinproduct/vibepaste/blob/f3147148/assets/icons/logo.svg)
> * [assets/icons/mic_off.svg](https://github.com/mohsinproduct/vibepaste/blob/f3147148/assets/icons/mic_off.svg)
> * [assets/icons/mic_on.svg](https://github.com/mohsinproduct/vibepaste/blob/f3147148/assets/icons/mic_on.svg)
> * [assets/icons/microphone.svg](https://github.com/mohsinproduct/vibepaste/blob/f3147148/assets/icons/microphone.svg)
> * [assets/icons/monitor.svg](https://github.com/mohsinproduct/vibepaste/blob/f3147148/assets/icons/monitor.svg)
> * [assets/icons/sparkle.svg](https://github.com/mohsinproduct/vibepaste/blob/f3147148/assets/icons/sparkle.svg)
> * [assets/icons/wrench.svg](https://github.com/mohsinproduct/vibepaste/blob/f3147148/assets/icons/wrench.svg)
> * [content/ui.js](https://github.com/mohsinproduct/vibepaste/blob/f3147148/content/ui.js)

This page documents the SVG icon system used by the `VP_UI` module within the content script layer. These icons provide visual feedback for state transitions, tool identification, and interaction cues within the command bar and overlays.

## Icon Asset Management

Icons are stored as standalone SVG files in the `assets/icons/` directory. Because content scripts operate within the context of a web page, they cannot reference these assets using relative paths. Instead, `VP_UI` resolves the full extension URL for each icon during initialization using `chrome.runtime.getURL`.

### Implementation Detail: Icon Registry

The `VP_UI` object maintains a registry of these resolved URLs to be used as `src` attributes for `<img>` elements within the UI.

[content/ui.js L9-L16](https://github.com/mohsinproduct/vibepaste/blob/f3147148/content/ui.js#L9-L16)

```

```

**Sources:** [content/ui.js L9-L16](https://github.com/mohsinproduct/vibepaste/blob/f3147148/content/ui.js#L9-L16)

---

## Command Bar Icons & States

The `vibepaste-command-bar` uses icons to represent the extension's brand and the current status of the voice input system.

### The VibePaste Logo

The logo is a custom SVG featuring a dark background, a green gradient "magic" spark effect, and a white chevron. It is injected into the command bar during `VP_UI.init()`.

[assets/icons/logo.svg L1-L18](https://github.com/mohsinproduct/vibepaste/blob/f3147148/assets/icons/logo.svg#L1-L18)

[content/ui.js L28-L30](https://github.com/mohsinproduct/vibepaste/blob/f3147148/content/ui.js#L28-L30)

### Voice Input Toggle

The microphone button (`#vibepaste-mic-btn`) dynamically switches between `mic_on.svg` and `mic_off.svg` based on the state of the `VP_Voice` engine.

| Icon | File | VP_UI State | Semantic Meaning |
| --- | --- | --- | --- |
| ![mic_off](https://github.com/mohsinproduct/vibepaste/blob/f3147148/mic_off) | `mic_off.svg` | `isListening: false` | Voice input is idle. Default state. |
| ![mic_on](https://github.com/mohsinproduct/vibepaste/blob/f3147148/mic_on) | `mic_on.svg` | `isListening: true` | Web Speech API is active; capturing audio. |

The transition is handled by the `updateMicUI` function:
[content/ui.js L46-L59](https://github.com/mohsinproduct/vibepaste/blob/f3147148/content/ui.js#L46-L59)

### UI State Flow Diagram

The following diagram illustrates how user interactions and system events trigger icon swaps in the DOM.

**Icon State Transition Logic**

```

```

**Sources:** [content/ui.js L46-L59](https://github.com/mohsinproduct/vibepaste/blob/f3147148/content/ui.js#L46-L59)

 [content/ui.js L9-L16](https://github.com/mohsinproduct/vibepaste/blob/f3147148/content/ui.js#L9-L16)

 [assets/icons/mic_on.svg L1](https://github.com/mohsinproduct/vibepaste/blob/f3147148/assets/icons/mic_on.svg#L1-L1)

 [assets/icons/mic_off.svg L1](https://github.com/mohsinproduct/vibepaste/blob/f3147148/assets/icons/mic_off.svg#L1-L1)

---

## Functional Icon Library

Beyond the command bar, the codebase includes a library of Phosphor-style icons used for semantic representation in settings, mode selection, and status indicators.

### Interaction & Selection Icons

These icons are used to represent selection modes and targeting actions.

* **`crosshair-simple.svg`**: Represents the "Element Selection" mode where the user targets specific DOM nodes. [assets/icons/crosshair-simple.svg L1](https://github.com/mohsinproduct/vibepaste/blob/f3147148/assets/icons/crosshair-simple.svg#L1-L1)
* **`copy-simple.svg`**: Represents "Copy Mode," indicating that the LLM output will be sent to the clipboard. [assets/icons/copy-simple.svg L1](https://github.com/mohsinproduct/vibepaste/blob/f3147148/assets/icons/copy-simple.svg#L1-L1)
* **`wrench.svg`**: Represents "Fix Mode," indicating that the LLM will modify existing content. [assets/icons/wrench.svg L1](https://github.com/mohsinproduct/vibepaste/blob/f3147148/assets/icons/wrench.svg#L1-L1)

### Processing & Status Icons

These icons provide feedback on the internal logic states of the extension.

* **`brain.svg`**: Used to represent the AI processing/LLM compilation phase. [assets/icons/brain.svg L1](https://github.com/mohsinproduct/vibepaste/blob/f3147148/assets/icons/brain.svg#L1-L1)
* **`sparkle.svg`**: Visual cue for "Magic" or AI-enhanced actions. [assets/icons/sparkle.svg L1](https://github.com/mohsinproduct/vibepaste/blob/f3147148/assets/icons/sparkle.svg#L1-L1)
* **`check-circle.svg`**: Indicates successful completion of a task (e.g., successful injection). [assets/icons/check-circle.svg L1](https://github.com/mohsinproduct/vibepaste/blob/f3147148/assets/icons/check-circle.svg#L1-L1)
* **`arrows-counter-clockwise.svg`**: Represents a reset or refresh action for settings or selection state. [assets/icons/arrows-counter-clockwise.svg L1](https://github.com/mohsinproduct/vibepaste/blob/f3147148/assets/icons/arrows-counter-clockwise.svg#L1-L1)

### Input Method Icons

* **`keyboard.svg`**: Represents manual text input or keyboard shortcuts. [assets/icons/keyboard.svg L1](https://github.com/mohsinproduct/vibepaste/blob/f3147148/assets/icons/keyboard.svg#L1-L1)
* **`microphone.svg`**: Standard representation for voice input settings. [assets/icons/microphone.svg L1](https://github.com/mohsinproduct/vibepaste/blob/f3147148/assets/icons/microphone.svg#L1-L1)
* **`monitor.svg`**: Represents screen-wide context or screenshot capture capabilities. [assets/icons/monitor.svg L1](https://github.com/mohsinproduct/vibepaste/blob/f3147148/assets/icons/monitor.svg#L1-L1)

---

## Icon Mapping to UI Components

The following diagram maps specific SVG assets to the functional components of the VibePaste UI layer.

**Asset to Component Mapping**

```

```

**Sources:** [content/ui.js L25-L44](https://github.com/mohsinproduct/vibepaste/blob/f3147148/content/ui.js#L25-L44)

 [content/ui.js L46-L59](https://github.com/mohsinproduct/vibepaste/blob/f3147148/content/ui.js#L46-L59)

 [assets/icons/logo.svg L1-L18](https://github.com/mohsinproduct/vibepaste/blob/f3147148/assets/icons/logo.svg#L1-L18)

 [assets/icons/mic_on.svg L1](https://github.com/mohsinproduct/vibepaste/blob/f3147148/assets/icons/mic_on.svg#L1-L1)

 [assets/icons/mic_off.svg L1](https://github.com/mohsinproduct/vibepaste/blob/f3147148/assets/icons/mic_off.svg#L1-L1)

## Technical Specifications

| Property | Value |
| --- | --- |
| **Format** | SVG (Scalable Vector Graphics) |
| **Standard Dimensions** | 32x32 (viewBox 0 0 256 256 for Phosphor icons) |
| **Command Bar Logo Size** | 24x24 [content/ui.js L30](https://github.com/mohsinproduct/vibepaste/blob/f3147148/content/ui.js#L30-L30) |
| **Mic Button Icon Size** | 25x25 [content/ui.js L33](https://github.com/mohsinproduct/vibepaste/blob/f3147148/content/ui.js#L33-L33) |
| **Injection Method** | `chrome.runtime.getURL` via `img.src` |

**Sources:** [content/ui.js L30-L33](https://github.com/mohsinproduct/vibepaste/blob/f3147148/content/ui.js#L30-L33)

 [assets/icons/logo.svg L1](https://github.com/mohsinproduct/vibepaste/blob/f3147148/assets/icons/logo.svg#L1-L1)

 [assets/icons/mic_on.svg L1](https://github.com/mohsinproduct/vibepaste/blob/f3147148/assets/icons/mic_on.svg#L1-L1)