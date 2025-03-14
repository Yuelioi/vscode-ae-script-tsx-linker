# AEスクリプト実行ツール for VS Code 🚀

[![VS Code Marketplace](https://img.shields.io/badge/VS%2520Code-Marketplace-blue)](https://marketplace.visualstudio.com/items?itemName=yourname.ae-script-runner)
[![ライセンス](https://img.shields.io/badge/License-MIT-green)](https://license/)
[![Windows対応](https://img.shields.io/badge/Platform-Windows-0078D6)](https://www.adobe.com/products/aftereffects.html)
[![macOS対応](https://img.shields.io/badge/Platform-macOS-999999)](https://www.adobe.com/products/aftereffects.html)

After Effects 開発者のためのVS Code拡張機能 - TypeScriptワークフローとマルチバージョンAE対応スクリプト実行環境

*▲ VS Codeからの直接スクリプト実行*

[中文说明](README-ZH.md) | [English](README.md) | [Japanese](README-JP.md)

---

## ✨ 主な特徴

* **全フォーマット対応**
  `.jsx`/`.jsxbin`/`.tsx` 形式のスクリプトを直接実行
* **インテリジェントバージョン検出**
  インストール済みAEバージョンの自動検出と選択メニュー表示
* **クロスプラットフォーム対応**
  Windows/macOS の完全互換環境
* **TypeScript最適化**
  Rollupビルドシステムによる最新ES機能サポート
* **リアルタイムコンパイル**
  ファイル監視モード（`--watch`）による即時反映

---

## 🚀 使用方法

1. **スクリプトファイルを開く**
   VS Codeで `.jsx`または `.tsx`ファイルを開く
2. **スクリプトを実行**
   * エディタ上部の **▶ スクリプト実行** ボタンをクリック
   * 右クリックメニューから `AEスクリプトを実行`を選択
   * ショートカット**`<kbd>`**F5** `</kbd>`**を押下

*▲ マルチバージョンAE検出インターフェース*

---

## 🛠 クイックスタート (typescript利用時)

### 前提条件

* [Node.js](https://nodejs.org/) v16+
* [TypeScript](https://www.typescriptlang.org/) 4.9+（TypeScript利用時）
* [Rollup](https://rollupjs.org/) 3.x（TypeScript利用時）

### インストール（TypeScript必要依存）

```bash
npm install -D \
  rollup \
  json5 \
  @rollup/plugin-typescript \
  types-for-adobe \
  @babel/core
```

---

## ⚙ 設定詳細

### 推奨tsconfig.json（TypeScript利用時）

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

### 標準プロジェクト構成

```text
.
├── .vscode/
│   └── settings.json    # 設定ファイル
├── dist/                # コンパイル出力
├── src/
│   ├── lib/             # 共通ライブラリ
│   ├── utils/           # ユーティリティ関数
│   └── main.tsx         # エントリポイント
├── rollup.config.js     # ビルド設定
└── tsconfig.json        # TypeScript設定
```

---

## 🔧 高度な設定（TypeScript利用時）

### Rollup設定例

```javascript
// rollup.config.js
import typescript from '@rollup/plugin-typescript';

export default {
  input: 'src/main.tsx',
  output: {
    file: 'dist/script.jsx',
    format: 'cjs'
  },
  plugins: [
    typescript(),
 
  ]
};
```

### multi-version AE detection configuration

```json
.vscode/settings.json
  /// ...
  "ae-tsx-runner": {
    "input": "....tsx",
    "output": "....jsx",
    "hostSpecifier": "22.0(win)/Adobe After Effects 2025(mac)" // special id for windows and app name for macOS
  },
```

## 📜 バージョン履歴

| バージョン | リリース日 | 主な変更点                 |
| ---------- | ---------- | -------------------------- |
| 0.7.0      | 2025-03-14 | macOS対応を実装            |
| 0.6.0      | 2023-04-11 | マルチバージョンAE検出機能 |
| 0.5.0      | 2023-03-15 | .jsxbin形式サポート追加    |

[完全な変更履歴](https://changelog.md/)

---

## 🙌 謝辞

* 型定義提供: [Types-for-Adobe](https://github.com/aenhancers/Types-for-Adobe)
* 原型参考: [ae-script-runner](https://marketplace.visualstudio.com/items?itemName=atarabi.ae-script-runner)

---

## 📄 ライセンス

[MITライセンス](https://license/) © 2023 あなたの名前
