# AE Script Runner for VS Code 🚀

[![VS Code Marketplace](https://img.shields.io/badge/VS%2520Code-Marketplace-blue)](https://marketplace.visualstudio.com/items?itemName=yourname.ae-script-runner)
[![License](https://img.shields.io/badge/License-MIT-green)](https://license/)
[![Supports Windows](https://img.shields.io/badge/Platform-Windows-0078D6)](https://www.adobe.com/products/aftereffects.html)
[![Supports macOS](https://img.shields.io/badge/Platform-macOS-999999)](https://www.adobe.com/products/aftereffects.html)

专为 After Effects 开发者设计的 VS Code 扩展，提供 TypeScript 工作流支持与多版本 AE 脚本执行能力。

*▲ 在 VS Code 中直接运行 AE 脚本*

[中文说明](README-ZH.md) | [English](README.md) | [Japanese](README-JP.md)

## ✨ 功能特性

* 🎯 **一键运行** - 直接在 VS Code 中执行 AE 脚本
* 📦 **支持 TypeScript** - 完整支持 `.tsx` / `.ts` 编译
* 🔄 **多种构建工具** - 自动检测 Rollup、Webpack、esbuild 或 tsc
* 🌍 **多语言界面** - 支持英文与中文
* 🖥️ **跨平台** - 兼容 Windows 与 macOS
* ⚡ **智能检测** - 自动识别正在运行的 AE 实例

## 🚀 快速开始

### 1️⃣ 安装

在 VS Code 插件市场中搜索并安装 **Adobe After Effects Script Runner**

---

### 2️⃣ 使用方法

1. 打开任意 `.jsx`、`.tsx`、`.ts` 或 `.jsxbin` 文件
2. 确保 Adobe After Effects 已经运行
3. 点击编辑器工具栏中的 ▶ **运行脚本** 按钮

![Version Selector](./preview/aes.png)
*▲ 支持多版本 AE 自动检测*

---

### 3️⃣ TypeScript 项目配置安装扩展依赖

```bash
npm install -D typescript rollup @rollup/plugin-typescript
```

---

创建 `tsconfig.json`：

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

## ⚙️ 插件配置

打开 VS Code 设置或 `.vscode/settings.json`：

```json
{
  "ae-tsx-runner.hostSpecifier": "aftereffects-25.0",
  "ae-tsx-runner.buildTool": "auto"
}

```

更多关于 `hostSpecifier` 的信息请参考：

👉 [Adobe.extendscript-debug hostAppSpecifier](https://marketplace.visualstudio.com/items?itemName=Adobe.extendscript-debug)

### 配置选项说明

| 设置项                 | 说明                                                                  | 默认值                       |
| ---------------------- | --------------------------------------------------------------------- | ---------------------------- |
| `hostSpecifier`      | 要使用的 AE 版本（如 `"aftereffects-25.0"`）                        | `""`（若为空则弹出选择器） |
| `buildTool`          | 构建工具类型：`auto`、`tsc`、`rollup`、`webpack`、`esbuild` | `auto`                     |
| `customBuildCommand` | 自定义构建命令（例如 `npm run build`）                              | `""`                       |

### Rollup 配置示例

可以从 `.vscode/settings.json` 中读取输入/输出路径：

```js
// rollup.config.js
import { readFileSync } from 'fs';
import JSON5 from 'json5';

const settings = JSON5.parse(readFileSync('.vscode/settings.json', 'utf8'));
const input = settings['ae-tsx-runner.input'] || 'src/main.tsx';
const output = settings['ae-tsx-runner.output'] || 'dist/main.jsx';

export default {
  input,
  output: { file: output, format: 'cjs' },
  // ... 其他配置
};
```

## 📁 项目结构

your-project/
├── .vscode/
│   └── settings.json       # 自动生成的配置文件
├── src/
│   └── main.tsx            # 你的脚本源码
├── dist/
│   └── main.jsx            # 编译输出
├── tsconfig.json
├── rollup.config.js        # 可选构建配置
└── package.json

## 🔧 构建工具选项

自动检测（推荐）

```json
{
  "ae-tsx-runner.buildTool": "auto" // 默认
}
```

手动选择

```json
{
  "ae-tsx-runner.buildTool": "rollup" // 或 "webpack"、"esbuild"、"tsc"
}
```

自定义命令

```json
{
  "ae-tsx-runner.customBuildCommand": "npm run build:ae"
}
```

## 📋 示例

### 示例 1：简单 JSX 脚本

```js
// script.jsx
alert("Hello from AE!");

```

直接点击 ▶ 运行 即可，无需额外配置！

### 示例 2：TypeScript 项目

```js

// src/main.tsx
interface CompSettings {
  name: string;
  duration: number;
}

const settings: CompSettings = {
  name: "My Comp",
  duration: 5
};

const comp = app.project.items.addComp(
  settings.name,
  1920,
  1080,
  1,
  settings.duration,
  30
);

alert(`已创建合成: ${comp.name}`);
```

插件会自动编译并运行脚本！

## 🐛 常见问题（FAQ）

### ❌ “No running After Effects instance found”

 **解决方案** ：运行脚本前请确保 AE 已启动。

---

### ⚠️ “Build failed”

 **解决方案** ：

1. 检查 `tsconfig.json` 配置
2. 确认已安装构建工具（`npm install`）
3. 打开 VS Code “输出” 面板查看详细错误信息

---

### ⚠️ “Output file not generated”

 **解决方案** ：

1. 检查 `tsconfig.json` 中的 `outDir`
2. 确认 `dist` 文件夹可写
3. 尝试手动执行构建命令

---

## 📝 更新日志

### v0.9.0（最新）

* ✨ 新增多构建工具支持（Rollup、Webpack、esbuild、tsc）
* 🌍 新增国际化（i18n）支持
* ⚡ 改进配置管理机制
* 🐛 修复配置保存问题
* 📚 优化错误提示信息

### v0.7.0

* ✅ 新增 macOS 支持
* 🔧 改进 AE 版本检测

👉 [查看完整更新日志](CHANGELOG.md)

## 📄 许可证

[MIT License](LICENSE) © 2025 Yueli

---

## 🙏 致谢

特别感谢以下项目：

* [Types-for-Adobe](https://github.com/aenhancers/Types-for-Adobe) - 提供 AE 类型定义
* [ae-script-runner](https://github.com/atarabi/vscode-ae-script-runner) - 插件灵感来源

---

## 💬 反馈与建议

发现 Bug 或有新功能想法？

👉 [在 GitHub 提交 Issue](https://github.com/Yuelioi/vscode-ae-script-tsx-linker/issues)
