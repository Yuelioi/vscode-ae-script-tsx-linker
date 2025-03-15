# AE Script Runner for VS Code 🚀

[![VS Code Marketplace](https://img.shields.io/badge/VS%2520Code-Marketplace-blue)](https://marketplace.visualstudio.com/items?itemName=yourname.ae-script-runner)
[![License](https://img.shields.io/badge/License-MIT-green)](https://license/)
[![Windows Support](https://img.shields.io/badge/Platform-Windows-0078D6)](https://www.adobe.com/products/aftereffects.html)
[![macOS Support](https://img.shields.io/badge/Platform-macOS-999999)](https://www.adobe.com/products/aftereffects.html)

A professional-grade VS Code extension for After Effects developers, offering seamless TypeScript workflow integration and multi-version AE script execution capabilities.

*▲ Direct script execution from VS Code interface*

[中文说明](README-ZH.md) | [English](README.md) | [Japanese](README-JP.md)

---

## ✨ Key Features

* **Full Format Support**
  Native execution of `.jsx`, `.jsxbin`, and `.tsx` script formats
* **Intelligent Version Detection**
  Auto-detects installed AE versions with interactive selection menu
* **Cross-Platform Operation**
  Full compatibility with both Windows and macOS environments
* **TypeScript-Centric Workflow**
  Integrated Rollup build system with modern ES features support
* **Real-Time Development**
  Instant compilation through Rollup's `--watch` mode

---

## 🚀 Usage Guide

1. **Open AE Script File**
   Launch any `.jsx` or `.tsx` file in VS Code
2. **Execute Script**
   * Click the **▶ Run Script** button in editor toolbar
   * Right-click in editor and select `Run AE Script`
   * Use keyboard shortcut **`<kbd>`**F5** `</kbd>`**

![Version Selection](./preview/aes.png)
*▲ Multi-version AE detection interface*

---

## 🛠 Quick Start (typescript projects)

You can start with [Adobe-Scripting-With-Typescript-Demo](https://github.com/Yuelioi/Adobe-Scripting-With-Typescript-Demo)

### Prerequisites

* [Node.js](https://nodejs.org/) v16+
* [TypeScript](https://www.typescriptlang.org/) 4.9+ (TypeScript projects only)
* [Rollup](https://rollupjs.org/) 3.x (TypeScript projects only)

### Installation (TypeScript Required Dependencies)

```bash
npm install -D \
  rollup \
  json5 \
  @rollup/plugin-typescript \
  types-for-adobe \
  @babel/core
```

## ⚙ Configuration

### Recommended tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES3",
    "outDir": "./dist",
    "strict": true,
    "types": ["./node_modules/types-for-adobe/AfterEffects/22.0"]
  },
  "include": ["src/**/*.ts", "src/**/*.tsx"]
}
```

### Standard Project Structure

```txt
.
├── .vscode/
│   └── settings.json    # Configuration storage
├── dist/                # Compiled outputs
├── src/
│   ├── lib/             # Shared libraries
│   ├── utils/           # Utility functions
│   └── main.tsx         # Entry point
├── rollup.config.js     # Build configuration
└── tsconfig.json        # TypeScript settings
```

---

## 🔧 Advanced Configuration (TypeScript Projects)

### Rollup Build Example

```javascript
// rollup.config.js
import typescript from '@rollup/plugin-typescript';
import jsxbin2 from 'rollup-plugin-jsxbin2';

export default {
  input: 'src/main.tsx',
  output: {
    file: 'dist/script.jsx',
    format: 'cjs'
  },
  plugins: [
    typescript()
  
  ]
};
```

### multi-version AE detection configuration

```json
.vscode/settings.json

  "ae-tsx-runner": {
    "input": "....tsx",
    "output": "....jsx",
    "hostSpecifier": "22.0(win)/Adobe After Effects 2025(mac)" // special id for windows and app name for macOS
  },
```

---

## 📜 Version History

| Version | Date       | Highlights                      |
| ------- | ---------- | ------------------------------- |
| 0.7.0   | 2025-03-14 | macOS compatibility implemented |
| 0.6.0   | 2023-04-11 | Multi-version AE detection      |
| 0.5.0   | 2023-03-15 | .jsxbin format support added    |

[Full Changelog](https://changelog.md/)

---

## 🙌 Acknowledgments

* Type definitions provided by [Types-for-Adobe](https://github.com/aenhancers/Types-for-Adobe)
* Inspired by [ae-script-runner](https://marketplace.visualstudio.com/items?itemName=atarabi.ae-script-runner)

---

## 📄 License

[MIT License](https://license/) © 2025 Yueli
