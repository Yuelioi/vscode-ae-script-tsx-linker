# After Effects .jsx Script Runner (tsx version)

[English introduction](./README-ZH.md) | [中文介绍](./README-ZH.md)

## Platform

- Windows
- Mac Os (not supported yet)

## Features

- Run .jsx, .jsxbin, and .tsx script files.
- Multiple version detection: If only one instance of After Effects is running, the script will run directly. If multiple instances are running, a prompt will appear asking you to choose which version to test.

## Usage

To access the command in the editor title, context menu, or command panel, launch Adobe After Effects and open a .jsx or .tsx file in VS Code.

Command:

<div align=center><img src="./preview/pic.png" /></div>

Testing with multiple versions of After Effects:

<div align=center><img src="./preview/aes.png" /></div>

## fail?

1. make sure you have a `ts` environment (nodejs...)
2. make sure you get a right tsconfig-ae.json/tsconfig.json configuration file( if you don't have a `tsconfig-ae.json`, extension will use `tsconfig.json` instead)

## How it works

1. Retrieve the location of the running After Effects application using child_process.
2. If the `tsconfig-ae.json` file is not found, use `tsconfig.json` to get the outDir option.
3. Look for the rollup.config.js file. If found, create a `tsx-link.json` file, write input and output, and then compile using `rollup -c` (instead of tsc).
4. Run the final script.

## tsconfig.json

`outDir`: AE Script run directory

`ES3`: AE Script version

[types-for-adobe](https://github.com/aenhancers/Types-for-Adobe) :AE Script type support

your `tsconfig.json` (for testing your ae script) like:

```json
{
    "compilerOptions": {
        "target": "ES3",
        "ignoreDeprecations": "5.0",
        "strict": true,
        "noLib": true,
        "outDir": "./dist",
        "jsx": "preserve",
        "useDefineForClassFields": false,
        "noUnusedParameters": true,
        "noUnusedLocals": true,
        "skipLibCheck": true,
        "allowSyntheticDefaultImports": true,
        "noEmit": false,
        "resolveJsonModule": true,
        "esModuleInterop": true,
        "types": ["./node_modules/types-for-adobe/AfterEffects/22.0"]
    },
    "include": ["src/**/*.ts", "src/**/*.tsx"],
    "exclude": ["node_modules"]
}
```

## rollup

[Rollup](https://rollupjs.org/introduction/) is a module bundler for JavaScript which compiles small pieces of code into something larger and more complex.

▷ install

```txt
npm install typescript rollup rollup-plugin-typescript2 --save-dev
```

▷  Import Sample

```typescript
// A.tsx
export const str = "Hello World";

// B.tsx
import {num} from "./A"
alert(str)
```

▷ rollup.config.js

```javascript
import typescript from "rollup-plugin-typescript2";
import * as fs from "fs";

// tsk-link.json(auto generate) 

const readJSONFile = (filePath) => {
    const data = fs.readFileSync(filePath, { encoding: "utf8" });
    return JSON.parse(data);
};

const tsx_link = readJSONFile("./tsx-link.json");

export default {
    input: tsx_link["input"],
    output: {
        file: tsx_link["output"],
        format: "iife",
        name: "MyApp",
    },
    plugins: [
        typescript({
            tsconfig: "tsconfig.json",
        }),
    ],
};
```

## sample file containing

```txt
/.vscode
dist
src
--/lib
--/public
--/utils
--main.tsx
tsconfig-ae.json
tsconfig.json
rollup.config.js
tsx-link.json(auto generate)
```

## Reference

[atarabi.ae-script-runner](https://marketplace.visualstudio.com/items?itemName=atarabi.ae-script-runner)

[vscode-ae-script-linker](https://github.com/zpfz/vscode-ae-script-linker)
