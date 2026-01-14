# Adobe After Effects Script Runner for VS Code 🚀

[![VS Code Marketplace](https://img.shields.io/badge/VS%2520Code-Marketplace-blue)](https://marketplace.visualstudio.com/items?itemName=yourname.ae-script-runner)
[![License](https://img.shields.io/badge/License-MIT-green)](https://license/)
[![Windows Support](https://img.shields.io/badge/Platform-Windows-0078D6)](https://www.adobe.com/products/aftereffects.html)
[![macOS Support](https://img.shields.io/badge/Platform-macOS-999999)](https://www.adobe.com/products/aftereffects.html)

Run Adobe After Effect scripts (`.jsx`, `.tsx`, `.ts`, `.jsxbin`) directly from VS Code

*▲ Direct script execution from VS Code interface*

[中文说明](README-ZH.md) | [English](README.md) | [Japanese](README-JP.md)

## ✨ Features

* 🎯 **Direct Execution** - Run AE scripts with one click
* 📦 **TypeScript Support** - Full `.tsx`/`.ts` compilation support
* 🔄 **Multiple Build Tools** - Auto-detect Rollup, Webpack, esbuild, or tsc
* 🌍 **Multi-Language** - English and Chinese interface
* 🖥️ **Cross-Platform** - Works on Windows and macOS
* ⚡ **Smart Detection** - Auto-detect running AE instances

## 🚀 Quick Start

### 1. Installation

Install from VS Code Marketplace

### 2. Usage

Open any `.jsx`, `.tsx`, `.ts`, or `.jsxbin` file

Make sure After Effects is running

Click the ▶ Run Script button in the editor toolbar

![Version Selection](./preview/aes.png)
*▲ Multi-version AE detection interface*

### 3. For TypeScript Projects

You can start with [Adobe After Effects TypeScript Script Demo](https://github.com/Yuelioi/adobe-after-effects-scripting-demo)

Install dependencies:

```cmd
npm install -D typescript rollup @rollup/plugin-typescript
```

Create `tsconfig.json`:

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

## ⚙️ Configuration

Open VS Code settings and configure:

Basic Settings `.vscode/settings.json`

```json
{
  "ae-tsx-runner.hostSpecifier": "25.0",
  "ae-tsx-runner.buildTool": "auto"
}
```

### Available Options

| Setting                | Description                                                    | Default                 |
| ---------------------- | -------------------------------------------------------------- | ----------------------- |
| `hostSpecifier`      | AE version to use (e.g., "25.0")                               | `""`(or shows picker) |
| `buildTool`          | Build tool:`auto`,`tsc`,`rollup`,`webpack`,`esbuild` | `auto`                |
| `customBuildCommand` | Custom build command (e.g.,`npm run build`)                  | `""`                  |

### Rollup Configuration

You can read input/output paths from `.vscode/settings.json`:

javascript

```javascript
// rollup.config.js
import{ readFileSync }from'fs';
importJSON5from'json5';

const settings =JSON5.parse(readFileSync('.vscode/settings.json','utf8'));
const input = settings['ae-tsx-runner.input']||'src/main.tsx';
const output = settings['ae-tsx-runner.output']||'dist/main.jsx';

exportdefault{
  input,
output:{file: output,format:'cjs'},
// ... other config
};
```

---

## 📁 Project Structure

```text
your-project/
├── .vscode/
│   └── settings.json       # Auto-generated config
├── src/
│   └── main.tsx            # Your script
├── dist/
│   └── main.jsx            # Compiled output
├── tsconfig.json
├── rollup.config.js        # Optional
└── package.json
```

---

## 🔧 Build Tool Options

The extension supports multiple build tools:

### Auto-detect (Recommended)

json

```json
{
"ae-tsx-runner.buildTool":"auto" // default
}
```

Auto-detects: Rollup → Webpack → esbuild → tsc

### Manual Selection

json

```json
{
"ae-tsx-runner.buildTool":"rollup"// or "webpack", "esbuild", "tsc"
}
```

### Custom Command

json

```json
{
"ae-tsx-runner.customBuildCommand":"npm run build:ae"
}
```

---

## 📋 Examples

### Example 1: Simple JSX Script

javascript

```javascript
// script.jsx
alert("Hello from AE!");
```

Just click **▶ Run** - no configuration needed!

### Example 2: TypeScript Project

typescript

```typescript
// src/main.tsx
interfaceCompSettings{
  name:string;
  duration:number;
}

const settings:CompSettings={
  name:"My Comp",
  duration:5
};

const comp = app.project.items.addComp(
  settings.name,
1920,
1080,
1,
  settings.duration,
30
);

alert(`Created: ${comp.name}`);
```

The extension will automatically compile and run!

---

## 🐛 Troubleshooting

### "Build failed"

 **Solution** :

1. Check your `tsconfig.json` configuration
2. Make sure build tools are installed: `npm install`
3. Check the Output panel for detailed errors

### "Output file not generated"

 **Solution** :

1. Verify `outDir` in `tsconfig.json`
2. Check if `dist` folder has write permissions
3. Try running the build command manually

## 📝 Changelog

### v0.9.0 (Latest)

* ✨ Added multi-build-tool support (Rollup, Webpack, esbuild, tsc)
* 🌍 Added internationalization (i18n) support
* ⚡ Improved configuration management
* 🐛 Fixed configuration save issues
* 📚 Enhanced error messages

### v0.7.0

* ✅ Added macOS support
* 🔧 Improved AE version detection

[Full Changelog](CHANGELOG.md)

---

## 📄 License

[MIT License](LICENSE) © 2025 Yueli

---

## 🙏 Credits

Special thanks to:

* [Types-for-Adobe](https://github.com/aenhancers/Types-for-Adobe) for type definitions
* [ae-script-runner](https://github.com/atarabi/vscode-ae-script-runner) for inspiration

---

## 💬 Feedback

Found a bug or have a feature request?

👉 [Open an issue](https://github.com/Yuelioi/vscode-ae-script-tsx-linker/issues)
