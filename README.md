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

## How it works

1. Use child_process to retrieve the location of the running After Effects application.
2. Search for the `tsconfig-ae.json` file, if not found, fall back to using `tsconfig.json`.
3. Search for the `rollup.config.js` file, if found, use `rollup -c` to compile.
4. Run the final script.

## tsconfig.json

`outDir`: AE Script run directory

`ES3`: AE Script version

[types-for-adobe](https://github.com/aenhancers/Types-for-Adobe) :AE Script type support

your `tsconfig-dev.json`  (for testing your ont script) like:

```json
{
    "compilerOptions": {
        "target": "ES3",
        "strict": true,
        "module": "None",
        "noLib": true,
        "outDir": "./dist",
        "jsx": "preserve",
        "types": [
            "./node_modules/types-for-adobe/AfterEffects/22.0"
        ]
    },
    "include": [
        "src/test/*.tsx"
    ],
}
```

your `tsconfig.json`:

```json
{
    "compilerOptions": {
        "target": "ES3",
        "strict": true,
        "module": "None",
        "noLib": true,
        "outDir": "./dist",
        "jsx": "preserve",
        "types": [
            "./node_modules/types-for-adobe/AfterEffects/22.0"
        ]
    },
    "include": [
        "src/**/*.ts",
        "src/**/*.tsx"
    ]
}

your `tsconfig-build.json`:

```json
{
    "extends": "./tsconfig-dev.json",
    "compilerOptions": {
        "removeComments": true
    }
}
```

## rollup

[Rollup](https://rollupjs.org/introduction/) is a module bundler for JavaScript which compiles small pieces of code into something larger and more complex.

▷

install

```txt
npm install typescript rollup rollup-plugin-typescript2 rollup-plugin-uglify --save-dev
```

rollup.config.js

```javascript
import typescript from "rollup-plugin-typescript2";
import { uglify } from "rollup-plugin-uglify";

export default {
  input: "src/main.ts",
  output: {
    file: "dist/bundle.js",
    format: "iife",
    name: "MyApp"
  },
  plugins: [
    typescript(),
    uglify()
  ]
};

```

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

## Reference

[atarabi.ae-script-runner](https://marketplace.visualstudio.com/items?itemName=atarabi.ae-script-runner)

[vscode-ae-script-linker](https://github.com/zpfz/vscode-ae-script-linker)
