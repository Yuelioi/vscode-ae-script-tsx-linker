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
2. Search for the `tsconfig-ae.json` file, if not found, fall back to using `tsconfig.json`. to get the `outDir` option.
3. Search for the `rollup.config.js` file, if found, create `tsx-link.json` file, write `input` and `output` , then use `rollup -c` to compile.(replace using `tsc`)
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

```

```
