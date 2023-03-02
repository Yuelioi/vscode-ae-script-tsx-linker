# After Effects .jsx Script Runner (tsx version)

## Platform

- Windows
- Mac Os (not supported yet)

## Usage

Open Adobe After Effects, and open `.jsx` or `.tsx` file in vscode, you can get the cammand in editor title /context menu/ command

<div align=center><img src="./preview/pic.png" /></div>

## fail?

1. make sure you have a `ts` environment (nodejs...)
2. make sure you get a right tsconfig-ae.json/tsconfig.json configuration file( if you don't have a `tsconfig-ae.json`, extension will use `tsconfig.json` instead)
3. `tsconfig.json` donot add extra commas (like this {... [ opA:1, opB:2,] ...})  

## sample file containing

```txt
.vscode
dist
src
--lib
--public
--test
---main.tsx
tsconfig-ae.json/tsconfig.json
```

## tsconfig.json

`outDir`: AE Script run directory

`ES3`: AE Script version

[types-for-adobe](https://github.com/aenhancers/Types-for-Adobe) :AE Script type support

```txt
your tsconfig-ae.json
{
    "compilerOptions": {
        "target": "ES3",
        "strict": true,
        "module": "None",
        "noLib": true,
        "outDir": "./dist",
        "types": [
            "./node_modules/types-for-adobe/AfterEffects/22.0"
        ]
    },
    "include": [
        "src/test/*.tsx"
    ]
}

your tsconfig.json
{
    "compilerOptions": {
        "target": "ES3",
        "strict": true,
        "module": "None",
        "noLib": true,
        "outDir": "./dist",
        "types": [
            "./node_modules/types-for-adobe/AfterEffects/22.0"
        ]
    },
    "include": [
        "src/**/*.ts",
        "src/**/*.tsx"
    ]
}
```

## Reference

[atarabi.ae-script-runner](https://marketplace.visualstudio.com/items?itemName=atarabi.ae-script-runner)

[vscode-ae-script-linker](https://github.com/zpfz/vscode-ae-script-linker)
