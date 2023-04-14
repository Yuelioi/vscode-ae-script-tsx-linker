## 初始化

pnpm install

## 修改

需要修改 `launch.json`, 因为默认生成的项目不带build选项, 导致配置不对

```json
"preLaunchTask": "${defaultBuildTask}"
↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓
"tasks: watch-tests"
```

## 使用 vsc 调试

NPM脚本: `watch` (如果在第二步修改后,也可以直接f5)

F5 / 运行与调试 -> Run Extension

## 打包

`npm i vsce -g`

`vsce  package`

`vsce  publish`
