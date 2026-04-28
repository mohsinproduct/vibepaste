# VibePaste Overview

> **Relevant source files**
> * [README.md](https://github.com/mohsinproduct/vibepaste/blob/f3147148/README.md?plain=1)
> * [manifest.json](https://github.com/mohsinproduct/vibepaste/blob/f3147148/manifest.json)

VibePaste is a browser extension designed to capture UI elements and their context to generate high-fidelity AI coding prompts [README.md L1](https://github.com/mohsinproduct/vibepaste/blob/f3147148/README.md?plain=1#L1-L1)

 It bridges the gap between a visual web interface and Large Language Models (LLMs) by extracting DOM structures, computed styles, and visual screenshots. These are then compiled into structured instructions for tasks like UI debugging ("Fix Mode") or component replication ("Copy Mode") [README.md L1](https://github.com/mohsinproduct/vibepaste/blob/f3147148/README.md?plain=1#L1-L1)

### Core Concept

VibePaste allows developers to "select" parts of a live website and instantly transform them into a prompt that describes exactly how those elements are built and how they should be modified or recreated.

### High-Level Architecture

The system follows a modular architecture where content scripts handle the UI and extraction, a background service worker handles global commands and privileged browser APIs, and a core processing pipeline transforms raw DOM data into AI-ready text.

#### System Component Map

The following diagram illustrates how natural language concepts map to specific code entities within the extension.

**VibePaste Entity Mapping**

```

```

**Sources:** [manifest.json L33-L65](https://github.com/mohsinproduct/vibepaste/blob/f3147148/manifest.json#L33-L65)

 [README.md L1](https://github.com/mohsinproduct/vibepaste/blob/f3147148/README.md?plain=1#L1-L1)

---

### Major Subsystems

#### 1. Extension Manifest & Environment

VibePaste is built on Chrome Extension Manifest V3 [manifest.json L2](https://github.com/mohsinproduct/vibepaste/blob/f3147148/manifest.json#L2-L2)

 It requests permissions for `activeTab`, `storage`, and `scripting` to interact with web pages and persist user settings [manifest.json L6-L11](https://github.com/mohsinproduct/vibepaste/blob/f3147148/manifest.json#L6-L11)

* For details, see [Extension Architecture & Manifest](/mohsinproduct/vibepaste/1.1-extension-architecture-and-manifest).

#### 2. User Interaction & Workflows

The extension provides two primary workflows:

* **Fix Mode:** Targeted at debugging existing UI by providing the LLM with the current implementation and a description of the issue.
* **Copy Mode:** Targeted at component replication, where the LLM is asked to recreate the selected elements from scratch.

Users interact with these modes via keyboard shortcuts (e.g., `Alt+C` to capture) or the popup interface [manifest.json L37-L50](https://github.com/mohsinproduct/vibepaste/blob/f3147148/manifest.json#L37-L50)

* For details, see [User Interaction Flows](/mohsinproduct/vibepaste/1.2-user-interaction-flows).

#### 3. Core Processing Pipeline

This is the "brain" of the extension. It consists of three main modules:

* **`VP_Extractor`**: Scans the DOM, whitelists essential CSS, and handles media sanitization [manifest.json L58](https://github.com/mohsinproduct/vibepaste/blob/f3147148/manifest.json#L58-L58)
* **`VP_Compiler`**: Merges extracted data with user intent into a markdown-formatted prompt [manifest.json L59](https://github.com/mohsinproduct/vibepaste/blob/f3147148/manifest.json#L59-L59)
* **`VP_Action`**: Orchestrates the flow between extraction, screenshotting, and compilation [manifest.json L60](https://github.com/mohsinproduct/vibepaste/blob/f3147148/manifest.json#L60-L60)

#### 4. Content Scripts

Injected into every page [manifest.json L52-L55](https://github.com/mohsinproduct/vibepaste/blob/f3147148/manifest.json#L52-L55)

 these scripts manage the interactive selection box (`VP_Selection`), the visual command bar (`VP_UI`), voice-to-text input (`VP_Voice`), and the final injection of the generated prompt back into the user's IDE or chat interface (`VP_Injector`).

#### 5. Background Service Worker

The service worker (`background/service-worker.js`) acts as the extension's central hub [manifest.json L34](https://github.com/mohsinproduct/vibepaste/blob/f3147148/manifest.json#L34-L34)

 It listens for global keyboard commands and performs privileged operations like `captureVisibleTab`, which content scripts cannot perform directly due to security restrictions.

**Subsystem Relationship Diagram**

```

```

**Sources:** [manifest.json L37-L50](https://github.com/mohsinproduct/vibepaste/blob/f3147148/manifest.json#L37-L50)

 [manifest.json L56-L65](https://github.com/mohsinproduct/vibepaste/blob/f3147148/manifest.json#L56-L65)

 [README.md L1](https://github.com/mohsinproduct/vibepaste/blob/f3147148/README.md?plain=1#L1-L1)

---

### Key Data Structures

VibePaste relies on a shared state stored in `chrome.storage.local` under the key `vibepaste_data`. This object typically includes:

* The compiled prompt string.
* The base64 screenshot.
* The current mode (Fix/Copy).
* User intent text.

**Sources:** [manifest.json L6-L11](https://github.com/mohsinproduct/vibepaste/blob/f3147148/manifest.json#L6-L11)

 [README.md L1](https://github.com/mohsinproduct/vibepaste/blob/f3147148/README.md?plain=1#L1-L1)