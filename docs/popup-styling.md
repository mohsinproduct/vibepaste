# Popup UI & Styling

> **Relevant source files**
> * [popup/popup.html](https://github.com/mohsinproduct/vibepaste/blob/f3147148/popup/popup.html)
> * [popup/styles.css](https://github.com/mohsinproduct/vibepaste/blob/f3147148/popup/styles.css)

The VibePaste popup provides a compact control interface for the extension's operational modes and settings. It serves as the primary manual entry point for starting element selection and configuring the behavior of the processing pipeline.

## HTML Structure & Component Layout

The popup is structured as a single-column interface with a fixed width of `280px` [popup/styles.css L36](https://github.com/mohsinproduct/vibepaste/blob/f3147148/popup/styles.css#L36-L36)

 The layout is divided into functional zones:

1. **Header**: Displays the VibePaste logo and branding [popup/popup.html L9-L20](https://github.com/mohsinproduct/vibepaste/blob/f3147148/popup/popup.html#L9-L20)
2. **Mode Toggle**: A sliding radio-button group to switch between `fix` and `copy` modes [popup/popup.html L22-L38](https://github.com/mohsinproduct/vibepaste/blob/f3147148/popup/popup.html#L22-L38)
3. **Hero Action**: A primary button (`#btn-capture`) that triggers the selection engine in the active tab [popup/popup.html L40-L49](https://github.com/mohsinproduct/vibepaste/blob/f3147148/popup/popup.html#L40-L49)
4. **Settings Grid**: A collection of toggle switches for feature flags like screenshots and smart guidance [popup/popup.html L53-L89](https://github.com/mohsinproduct/vibepaste/blob/f3147148/popup/popup.html#L53-L89)
5. **Footer**: Contains a quick-reference for keyboard shortcuts and utility actions (Reset, Edit Shortcuts) [popup/popup.html L92-L111](https://github.com/mohsinproduct/vibepaste/blob/f3147148/popup/popup.html#L92-L111)

### Component Hierarchy Diagram

The following diagram maps the HTML structure to the functional regions defined in the CSS.

**Popup UI Hierarchy**

```

```

**Sources:** [popup/popup.html L1-L115](https://github.com/mohsinproduct/vibepaste/blob/f3147148/popup/popup.html#L1-L115)

 [popup/styles.css L33-L43](https://github.com/mohsinproduct/vibepaste/blob/f3147148/popup/styles.css#L33-L43)

---

## Design System & Styling

The design system uses CSS variables to support both Light and Dark modes, automatically switching based on the user's system preferences via `@media (prefers-color-scheme: dark)` [popup/styles.css L17-L31](https://github.com/mohsinproduct/vibepaste/blob/f3147148/popup/styles.css#L17-L31)

### CSS Variables & Theming

| Variable | Light Mode (Default) | Dark Mode |
| --- | --- | --- |
| `--bg-main` | `#ffffff` | `#1a1a1a` |
| `--text-main` | `#1a1a1a` | `#ffffff` |
| `--bg-secondary` | `#f0f0f0` | `#2d2d2d` |
| `--icon-filter` | `none` | `brightness(0) invert(1)` |
| `--accent-green` | `#28a745` | `#28a745` |

**Sources:** [popup/styles.css L3-L31](https://github.com/mohsinproduct/vibepaste/blob/f3147148/popup/styles.css#L3-L31)

### Icon System

Icons are implemented as standard `<img>` tags referencing SVG assets. To maintain visibility across themes, icons use the `--icon-filter` variable [popup/styles.css L309-L311](https://github.com/mohsinproduct/vibepaste/blob/f3147148/popup/styles.css#L309-L311)

 except for the full-color logo which bypasses the filter [popup/styles.css L334-L336](https://github.com/mohsinproduct/vibepaste/blob/f3147148/popup/styles.css#L334-L336)

---

## Interactive Components

### Mode Toggle (Checkbox Hack)

The mode selector uses a "checkbox hack" implementation where hidden radio inputs control the position of a decorative slider.

* **Implementation**: The `.vp-toggle-slider` is an absolute-positioned `div` [popup/styles.css L100-L111](https://github.com/mohsinproduct/vibepaste/blob/f3147148/popup/styles.css#L100-L111)
* **Animation**: When `#mode-copy` is checked, the slider uses `transform: translateX(100%)` to move to the right [popup/styles.css L118-L120](https://github.com/mohsinproduct/vibepaste/blob/f3147148/popup/styles.css#L118-L120)
* **Flicker Prevention**: The class `.preload-transitions` is applied to the body to disable transitions during initial load (preventing the slider from visibly "sliding" into place when the popup opens) [popup/styles.css L62-L64](https://github.com/mohsinproduct/vibepaste/blob/f3147148/popup/styles.css#L62-L64)

### Hero Action Button

The `#btn-capture` button uses a green gradient and transforms to provide tactile feedback.

* **Hover**: Scales slightly and increases brightness [popup/styles.css L154-L158](https://github.com/mohsinproduct/vibepaste/blob/f3147148/popup/styles.css#L154-L158)
* **Active**: Depresses via `translateY(1px)` [popup/styles.css L160-L163](https://github.com/mohsinproduct/vibepaste/blob/f3147148/popup/styles.css#L160-L163)

### Settings Switches

The toggle switches are built using a standard label-wrapped checkbox pattern.

* **Structure**: A `.vp-switch` label containing a hidden input and a `.vp-slider` span [popup/popup.html L60-L63](https://github.com/mohsinproduct/vibepaste/blob/f3147148/popup/popup.html#L60-L63)
* **State**: The `:checked` pseudo-class changes the background color to `--accent-green` and moves the internal circle (`:before`) [popup/styles.css L225-L230](https://github.com/mohsinproduct/vibepaste/blob/f3147148/popup/styles.css#L225-L230)

**Component State Logic**

```

```

**Sources:** [popup/styles.css L114-L125](https://github.com/mohsinproduct/vibepaste/blob/f3147148/popup/styles.css#L114-L125)

 [popup/styles.css L133-L163](https://github.com/mohsinproduct/vibepaste/blob/f3147148/popup/styles.css#L133-L163)

 [popup/styles.css L287-L304](https://github.com/mohsinproduct/vibepaste/blob/f3147148/popup/styles.css#L287-L304)

---

## Utility Animations

### Reset Pulse

When the user clicks the "Reset" button, the `.vp-animate-reset` class is applied to trigger a scaling pulse and color shift [popup/styles.css L287-L304](https://github.com/mohsinproduct/vibepaste/blob/f3147148/popup/styles.css#L287-L304)

 This provides visual confirmation that the configuration has been restored to defaults.

**Sources:** [popup/styles.css L302-L304](https://github.com/mohsinproduct/vibepaste/blob/f3147148/popup/styles.css#L302-L304)