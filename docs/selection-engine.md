# Selection Engine (VP_Selection)

> **Relevant source files**
> * [content/selection.js](https://github.com/mohsinproduct/vibepaste/blob/f3147148/content/selection.js)

The `VP_Selection` module, defined in `content/selection.js`, is the primary state manager for VibePaste's interactive selection layer. It orchestrates the lifecycle of element selection, handles mouse and keyboard event streams, and synchronizes the visual overlays with the underlying DOM.

## State Machine Lifecycle

The engine maintains a centralized `state` object that governs the behavior of the content script.

| State Property | Description |
| --- | --- |
| `isActive` | Boolean. When `true`, the selection UI is visible and mouse events are intercepted. |
| `isPaused` | Boolean. When `true`, the hover overlay is disabled, allowing interaction with the page without exiting selection mode. |
| `mode` | Current operating mode (`FIX` or `COPY`), persisted in `chrome.storage.local`. |
| `selectedElements` | An array of DOM elements currently selected by the user. |
| `intent` | The natural language instruction entered via voice or keyboard. |

### Initialization

Upon loading, `VP_Selection.init()` performs the following:

1. Fetches the initial `vibepaste_mode` from storage [content/selection.js L18-L20](https://github.com/mohsinproduct/vibepaste/blob/f3147148/content/selection.js#L18-L20)
2. Sets up a listener for live mode changes to ensure the state stays in sync with the popup [content/selection.js L23-L28](https://github.com/mohsinproduct/vibepaste/blob/f3147148/content/selection.js#L23-L28)
3. Initializes `VP_UI` and `VP_Voice`, passing a callback to update `state.intent` whenever voice input is received [content/selection.js L31-L34](https://github.com/mohsinproduct/vibepaste/blob/f3147148/content/selection.js#L31-L34)

### Selection Toggle Logic

The `toggleSelectionMode` function [content/selection.js L41-L58](https://github.com/mohsinproduct/vibepaste/blob/f3147148/content/selection.js#L41-L58)

 handles the transition between active and inactive states. When deactivated, it clears all selection arrays, stops voice recognition, and resets the UI [content/selection.js L44-L52](https://github.com/mohsinproduct/vibepaste/blob/f3147148/content/selection.js#L44-L52)

 When activated, it reveals the command bar and focuses the input field [content/selection.js L54-L55](https://github.com/mohsinproduct/vibepaste/blob/f3147148/content/selection.js#L54-L55)

### Pause State

The `TOGGLE_PAUSE` message allows users to temporarily disable the "hover" effect while keeping their current selections intact [content/selection.js L93-L100](https://github.com/mohsinproduct/vibepaste/blob/f3147148/content/selection.js#L93-L100)

 This is useful for navigating complex menus without triggering the selection overlay.

**Sources:** [content/selection.js L3-L10](https://github.com/mohsinproduct/vibepaste/blob/f3147148/content/selection.js#L3-L10)

 [content/selection.js L16-L38](https://github.com/mohsinproduct/vibepaste/blob/f3147148/content/selection.js#L16-L38)

 [content/selection.js L41-L58](https://github.com/mohsinproduct/vibepaste/blob/f3147148/content/selection.js#L41-L58)

 [content/selection.js L93-L100](https://github.com/mohsinproduct/vibepaste/blob/f3147148/content/selection.js#L93-L100)

---

## Mouse Event Handling & Element Selection

`VP_Selection` intercepts mouse movements and clicks to provide visual feedback and manage the selection set.

### Hover Logic (handleMouseMove)

The engine tracks the mouse to highlight potential targets:

* **Exclusion Zones:** Overlays and the Command Bar are ignored to prevent the UI from selecting itself [content/selection.js L107-L110](https://github.com/mohsinproduct/vibepaste/blob/f3147148/content/selection.js#L107-L110)
* **Visual Feedback:** Calls `VP_UI.showHoverOverlay` with the target's bounding box and border-radius to ensure the highlight matches the element's shape [content/selection.js L120-L122](https://github.com/mohsinproduct/vibepaste/blob/f3147148/content/selection.js#L120-L122)

### Toggle Selection (handleMouseClick)

When an element is clicked:

1. **Prevention:** Default browser actions and event propagation are stopped [content/selection.js L136-L137](https://github.com/mohsinproduct/vibepaste/blob/f3147148/content/selection.js#L136-L137)
2. **Toggle:** If the element is already in `state.selectedElements`, it is removed; otherwise, it is added [content/selection.js L139-L152](https://github.com/mohsinproduct/vibepaste/blob/f3147148/content/selection.js#L139-L152)
3. **Auto-Mic Feature:** If the first element is selected and `vp_auto_mic` is enabled in settings, the microphone is automatically activated [content/selection.js L145-L151](https://github.com/mohsinproduct/vibepaste/blob/f3147148/content/selection.js#L145-L151)
4. **Redraw:** `redrawAllOverlays()` is called to update the numbered badges and static highlights [content/selection.js L60-L65](https://github.com/mohsinproduct/vibepaste/blob/f3147148/content/selection.js#L60-L65)

### Selection Data Flow

The following diagram illustrates how mouse interactions update the system state and UI.

**Selection Interaction Flow**

```

```

**Sources:** [content/selection.js L103-L123](https://github.com/mohsinproduct/vibepaste/blob/f3147148/content/selection.js#L103-L123)

 [content/selection.js L125-L157](https://github.com/mohsinproduct/vibepaste/blob/f3147148/content/selection.js#L125-L157)

 [content/selection.js L60-L65](https://github.com/mohsinproduct/vibepaste/blob/f3147148/content/selection.js#L60-L65)

---

## Overlay Synchronization

Because overlays are absolute-positioned elements in the top-level DOM, they must be manually synchronized with the target elements during layout changes.

### Throttled Scroll

To maintain performance during scrolling, `onScroll` uses `window.requestAnimationFrame` to throttle updates [content/selection.js L195-L206](https://github.com/mohsinproduct/vibepaste/blob/f3147148/content/selection.js#L195-L206)

 It hides the hover overlay immediately and schedules a recalculation of static overlay positions.

### Debounced Resize

Window resizing triggers `onResize`, which uses a 100ms debounce timer (`resizeTimeout`) to prevent excessive layout thrashing while the user is dragging the window edge [content/selection.js L208-L214](https://github.com/mohsinproduct/vibepaste/blob/f3147148/content/selection.js#L208-L214)

### Update Logic (updateOverlayPositions)

The engine iterates through all `.vibepaste-static-overlay` elements, retrieves the original target element via the `_vpTarget` property, and updates the overlay's CSS `top`, `left`, `width`, and `height` based on the target's current `getBoundingClientRect()` [content/selection.js L67-L78](https://github.com/mohsinproduct/vibepaste/blob/f3147148/content/selection.js#L67-L78)

**Sources:** [content/selection.js L67-L78](https://github.com/mohsinproduct/vibepaste/blob/f3147148/content/selection.js#L67-L78)

 [content/selection.js L195-L206](https://github.com/mohsinproduct/vibepaste/blob/f3147148/content/selection.js#L195-L206)

 [content/selection.js L208-L214](https://github.com/mohsinproduct/vibepaste/blob/f3147148/content/selection.js#L208-L214)

---

## Execution Pipeline

The `Enter` key (or a second press of the capture shortcut) triggers the data processing pipeline.

### The Enter-Key Pipeline

When `handleInputKeydown` detects an `Enter` keypress [content/selection.js L167](https://github.com/mohsinproduct/vibepaste/blob/f3147148/content/selection.js#L167-L167)

:

1. **Intent Capture:** Voice recognition is stopped, and the input value is trimmed into `state.intent` [content/selection.js L171-L172](https://github.com/mohsinproduct/vibepaste/blob/f3147148/content/selection.js#L171-L172)
2. **Validation:** If no elements are selected, an error is shown [content/selection.js L174-L177](https://github.com/mohsinproduct/vibepaste/blob/f3147148/content/selection.js#L174-L177)
3. **Action Dispatch:** The engine calls `window.VP_Action.execute`, passing the selected elements, the current mode, and the intent [content/selection.js L179-L183](https://github.com/mohsinproduct/vibepaste/blob/f3147148/content/selection.js#L179-L183)
4. **Success/Failure Feedback:** Depending on the result, `VP_UI` displays success or error messages, and the selection mode is automatically exited after a short delay [content/selection.js L185-L191](https://github.com/mohsinproduct/vibepaste/blob/f3147148/content/selection.js#L185-L191)

### Execution Data Flow

This diagram bridges the user's natural language input and selection into the core execution logic.

**Execution Pipeline Mapping**

```

```

**Sources:** [content/selection.js L159-L193](https://github.com/mohsinproduct/vibepaste/blob/f3147148/content/selection.js#L159-L193)

 [content/selection.js L86-L92](https://github.com/mohsinproduct/vibepaste/blob/f3147148/content/selection.js#L86-L92)