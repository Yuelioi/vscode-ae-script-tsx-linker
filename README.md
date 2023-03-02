# After Effects \*.jsx Script Runner (tsx version)

Run Adobe After Effects _.tsx / _.jsx Script without ExtendScript Toolkit.

## Requires

[nodejs](https://nodejs.org/en/)

tsc: npm install -g typescript

[Types-for-Adobe](https://github.com/aenhancers/Types-for-Adobe)

## Support

- Windows

## Usage

Press F1(or Ctrl+Shift+P) and select `运行 After Effects 脚本`

---

# After Effects \*.jsx 脚本运行器

该插件是基于国外大佬 [@Kare Obana](https://marketplace.visualstudio.com/items?itemName=atarabi.ae-script-runner) 开发的插件基础上进行修改，

再基于国内大佬 [zpfz](https://github.com/zpfz/vscode-ae-script-linker) 开发的基础上, 追加了 `tsx` 编译功能,

## 支持平台

- Windows

## 用法

在开启 Adobe After Effects 前提下，打开 _.jsx/ _.tsx 文件都能激活该插件，直接在编辑器标题栏右上角找到三角按钮，点击它按钮即可。

<div align=center><img src="./preview/pic.png" /></div>

另：在 编辑器上下文菜单/编辑器选项卡上下文菜单 都可以激活运行菜单。

## 失败?

1. 正确安装 ts 环境(nodejs 等等)
2. 请确保您的 tsconfig.json 文件配置正确

合理的项目结构

```txt
.vscode
src
--test
---main.tsx
tsconfig.json
```

## tsconfig.json

```txt
{
    "compilerOptions": {
        "target": "ES3",
        "strict": true,
        "module": "None",
        "noLib": true,
        "noEmit": false,
        "rootDirs": [
            "./src"
        ],
        "outDir": "./dist",
        "types": [
            "./node_modules/types-for-adobe/AfterEffects/22.0",
        ]
    },
    "include": [
        "src/**/*.ts",
        "src/**/*.tsx"
    ],
    "exclude": [
        "node_modules"
    ]
}
```
