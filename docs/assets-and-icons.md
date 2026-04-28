# Assets & Icon System

> **Relevant source files**
> * [assets/icons/arrows-counter-clockwise.svg](https://github.com/mohsinproduct/vibepaste/blob/f3147148/assets/icons/arrows-counter-clockwise.svg)
> * [assets/icons/brain.svg](https://github.com/mohsinproduct/vibepaste/blob/f3147148/assets/icons/brain.svg)
> * [assets/icons/check-circle.svg](https://github.com/mohsinproduct/vibepaste/blob/f3147148/assets/icons/check-circle.svg)
> * [assets/icons/copy-simple.svg](https://github.com/mohsinproduct/vibepaste/blob/f3147148/assets/icons/copy-simple.svg)
> * [assets/icons/crosshair-simple.svg](https://github.com/mohsinproduct/vibepaste/blob/f3147148/assets/icons/crosshair-simple.svg)
> * [assets/icons/icon-128.png](https://github.com/mohsinproduct/vibepaste/blob/f3147148/assets/icons/icon-128.png)
> * [assets/icons/icon-16.png](https://github.com/mohsinproduct/vibepaste/blob/f3147148/assets/icons/icon-16.png)
> * [assets/icons/icon-32.png](https://github.com/mohsinproduct/vibepaste/blob/f3147148/assets/icons/icon-32.png)
> * [assets/icons/icon-48.png](https://github.com/mohsinproduct/vibepaste/blob/f3147148/assets/icons/icon-48.png)
> * [assets/icons/keyboard.svg](https://github.com/mohsinproduct/vibepaste/blob/f3147148/assets/icons/keyboard.svg)
> * [assets/icons/logo.svg](https://github.com/mohsinproduct/vibepaste/blob/f3147148/assets/icons/logo.svg)
> * [assets/icons/mic_off.svg](https://github.com/mohsinproduct/vibepaste/blob/f3147148/assets/icons/mic_off.svg)
> * [assets/icons/mic_on.svg](https://github.com/mohsinproduct/vibepaste/blob/f3147148/assets/icons/mic_on.svg)
> * [assets/icons/microphone.svg](https://github.com/mohsinproduct/vibepaste/blob/f3147148/assets/icons/microphone.svg)
> * [assets/icons/monitor.svg](https://github.com/mohsinproduct/vibepaste/blob/f3147148/assets/icons/monitor.svg)
> * [assets/icons/sparkle.svg](https://github.com/mohsinproduct/vibepaste/blob/f3147148/assets/icons/sparkle.svg)
> * [assets/icons/wrench.svg](https://github.com/mohsinproduct/vibepaste/blob/f3147148/assets/icons/wrench.svg)

The `assets/icons/` directory contains the visual language of VibePaste, categorized into two distinct systems: static PNG assets for browser-level identification and dynamic SVG assets for the in-page user interface. These assets are critical for providing visual feedback during the selection, recording, and processing phases of the VibePaste workflow.

## Asset Architecture Overview

VibePaste separates its assets based on their consumption context. The browser chrome requires standard raster formats (PNG) for performance and compatibility, while the injected content UI utilizes scalable vectors (SVG) to maintain visual fidelity across varying website zoom levels and resolutions.

### Component Relationship Diagram

The following diagram illustrates how different system components resolve and utilize assets from the `assets/icons/` directory.

"Asset Resolution and Consumption"

```

```

**Sources:**

* `assets/icons/`
* [manifest.json L1-L10](https://github.com/mohsinproduct/vibepaste/blob/f3147148/manifest.json#L1-L10)  (Referenced in [Extension Architecture & Manifest](/mohsinproduct/vibepaste/1.1-extension-architecture-and-manifest))
* [content/ui.js L1-L50](https://github.com/mohsinproduct/vibepaste/blob/f3147148/content/ui.js#L1-L50)  (Referenced in [UI Overlay System (VP_UI)](/mohsinproduct/vibepaste/3.2-ui-overlay-system-(vp_ui)))

---

## Extension Toolbar Icons

The extension uses a set of four PNG icons to represent VibePaste within the browser's ecosystem. These icons are defined in the manifest and are used by the browser to identify the extension in the toolbar, the `chrome://extensions` management page, and the Chrome Web Store.

| File | Size | Usage Context |
| --- | --- | --- |
| `icon-16.png` | 16x16 px | Favicon in extension pages, small toolbar icon. |
| `icon-32.png` | 32x32 px | Standard Windows/macOS toolbar icon. |
| `icon-48.png` | 48x48 px | Extension management page icon. |
| `icon-128.png` | 128x128 px | Chrome Web Store and installation dialogs. |

For details on how these are registered, see [Extension Toolbar Icons](/mohsinproduct/vibepaste/6.1-extension-toolbar-icons).

**Sources:**

* [assets/icons/icon-16.png L1-L3](https://github.com/mohsinproduct/vibepaste/blob/f3147148/assets/icons/icon-16.png#L1-L3)
* [assets/icons/icon-32.png L1-L3](https://github.com/mohsinproduct/vibepaste/blob/f3147148/assets/icons/icon-32.png#L1-L3)
* [assets/icons/icon-48.png L1-L3](https://github.com/mohsinproduct/vibepaste/blob/f3147148/assets/icons/icon-48.png#L1-L3)
* [assets/icons/icon-128.png L1-L3](https://github.com/mohsinproduct/vibepaste/blob/f3147148/assets/icons/icon-128.png#L1-L3)

---

## Content UI SVG Icons

The interactive Command Bar and selection overlays utilize a semantic SVG icon set. These icons are loaded dynamically by the `VP_UI` module using `chrome.runtime.getURL()`. This allows the content script to reference extension assets even when running within the context of an external web page.

### Semantic Mapping

Icons are mapped to specific application states and modes:

| Icon Name | Code Entity / State | Description |
| --- | --- | --- |
| `mic_on.svg` | `VP_Voice` (Active) | Displayed when voice recording is in progress. |
| `mic_off.svg` | `VP_Voice` (Idle/Muted) | Displayed when the microphone is available but inactive. |
| `sparkle.svg` | `Fix Mode` | Represents the AI-driven "Fix" transformation. |
| `copy-simple.svg` | `Copy Mode` | Represents the "Copy" and structured extraction mode. |
| `wrench.svg` | `Settings` | Used for the configuration and options triggers. |
| `brain.svg` | `Processing` | Displayed during LLM prompt compilation or execution. |

### Icon State Transition Logic

"UI State to Icon Mapping"

```

```

For details on implementation and the full icon list, see [Content UI SVG Icons](/mohsinproduct/vibepaste/6.2-content-ui-svg-icons).

**Sources:**

* [assets/icons/mic_on.svg L1](https://github.com/mohsinproduct/vibepaste/blob/f3147148/assets/icons/mic_on.svg#L1-L1)
* [assets/icons/mic_off.svg L1](https://github.com/mohsinproduct/vibepaste/blob/f3147148/assets/icons/mic_off.svg#L1-L1)
* [assets/icons/sparkle.svg L1](https://github.com/mohsinproduct/vibepaste/blob/f3147148/assets/icons/sparkle.svg#L1-L1)
* [assets/icons/copy-simple.svg L1](https://github.com/mohsinproduct/vibepaste/blob/f3147148/assets/icons/copy-simple.svg#L1-L1)
* [assets/icons/brain.svg L1](https://github.com/mohsinproduct/vibepaste/blob/f3147148/assets/icons/brain.svg#L1-L1)
* [assets/icons/check-circle.svg L1](https://github.com/mohsinproduct/vibepaste/blob/f3147148/assets/icons/check-circle.svg#L1-L1)
* [assets/icons/crosshair-simple.svg L1](https://github.com/mohsinproduct/vibepaste/blob/f3147148/assets/icons/crosshair-simple.svg#L1-L1)
* [content/ui.js L100-L150](https://github.com/mohsinproduct/vibepaste/blob/f3147148/content/ui.js#L100-L150)  (Referenced in [UI Overlay System (VP_UI)](/mohsinproduct/vibepaste/3.2-ui-overlay-system-(vp_ui)))

---

## Loading Mechanism

Assets in the `assets/` directory are protected by the browser's Same-Origin Policy. To use them within a content script injected into a third-party website, they must be declared as `web_accessible_resources` in the manifest.

1. **Resolution:** `VP_UI` calls `chrome.runtime.getURL('assets/icons/[name].svg')`.
2. **Injection:** The resulting URL is set as the `src` for `<img>` tags or used as a `mask-image` in `content/styles.css`.
3. **Branding:** The `logo.svg` is used specifically for the primary branding in the `popup.html` and the main Command Bar.

**Sources:**

* [assets/icons/logo.svg L1-L18](https://github.com/mohsinproduct/vibepaste/blob/f3147148/assets/icons/logo.svg#L1-L18)
* [content/ui.js L10-L25](https://github.com/mohsinproduct/vibepaste/blob/f3147148/content/ui.js#L10-L25)  (Referenced in [UI Overlay System (VP_UI)](/mohsinproduct/vibepaste/3.2-ui-overlay-system-(vp_ui)))
* [manifest.json L20-L30](https://github.com/mohsinproduct/vibepaste/blob/f3147148/manifest.json#L20-L30)  (Referenced in [Extension Architecture & Manifest](/mohsinproduct/vibepaste/1.1-extension-architecture-and-manifest))