"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
import * as vscode from "vscode";
import * as child_process from "child_process";
import * as fs from "fs";
import * as path from "path";
const win32 = process.platform === "win32";

function showWarningMessage(message: string) {
    vscode.window.showWarningMessage(message);
}
function getAePath() {
    return new Promise((resolve, reject) => {
        if (win32) {
            const ps = child_process.spawn("powershell.exe", ["-Command", `(Get-WmiObject -class Win32_Process -Filter 'Name="AfterFX.exe"').path`]);
            let output = "";

            ps.stdout.on("data", (chunk) => {
                output += chunk.toString();
            });
            ps.on("exit", () => {
                const aePaths = [];
                for (let aePath of output.split(/\r\n|\r|\n/)) {
                    if (aePath) {
                        aePaths.push(aePath);
                    }
                }
                if (aePaths.length) {
                    resolve(aePaths[0]);
                } else {
                    reject("请启动 After Effects.");
                }
            });
            ps.on("error", (err) => {
                reject(err);
            });
            ps.stdin.end();
        } else {
            reject(`暂不支持该系统`);
        }
    });
}

function activate(context: { subscriptions: vscode.Disposable[] }) {
    const disposable = vscode.commands.registerCommand("runrun.JSXScript", () => {
        getAePath()
            .then(async (aePath) => {
                const activeEditor = vscode.window.activeTextEditor;
                if (!activeEditor) {
                    vscode.window.showErrorMessage("请打开至少一个文档");
                    return;
                }
                let inputFilePath = activeEditor.document.uri.fsPath;
                const inputFileName = activeEditor.document.fileName;
                const workspaceFolder = (vscode.workspace.workspaceFolders as any)[0].uri.fsPath;

                // 如果文件名以tsx结尾, 就运行tsc脚本
                if (inputFileName.endsWith(".tsx")) {
                    let distFolder = "dist";
                    let tsConfigFile: string | undefined;

                    // 判断使用哪个配置文件
                    if (fs.existsSync(path.join(workspaceFolder!, "tsconfig-ae.json"))) {
                        tsConfigFile = "tsconfig-ae.json";
                    } else if (fs.existsSync(path.join(workspaceFolder!, "tsconfig.json"))) {
                        tsConfigFile = "tsconfig.json";
                    }

                    // 如果有配置文件, 就获取导出文件夹
                    if (tsConfigFile) {
                        try {
                            const tsConfig = require(path.join(workspaceFolder, tsConfigFile));
                            distFolder = tsConfig.compilerOptions.outDir || distFolder;
                        } catch {
                            // do nothing
                        }
                    }
                    // 获取源文件纯名称以及输出文件路径
                    const outFileBaseName = path.basename(inputFileName, ".tsx");
                    const outFilePath = `${distFolder}/${outFileBaseName}.jsx`;

                    try {
                        // 查看有没有使用rollup
                        const rollupConfigPath = path.join(workspaceFolder, "rollup.config.js");
                        if (fs.existsSync(rollupConfigPath)) {
                            const content = {
                                input: inputFilePath,
                                output: outFilePath,
                            };
                            const rollupPath = path.join(workspaceFolder, "node_modules", ".bin", "rollup");
                            fs.writeFileSync(path.join(workspaceFolder, "tsx-link.json"), JSON.stringify(content));

                            child_process.execSync(`"${rollupPath}" -c "${rollupConfigPath}"`, {
                                cwd: workspaceFolder,
                            });

                            // TODO: 输出调试信息
                        } else {
                            child_process.execSync(`tsc --project ${tsConfigFile}`, {
                                cwd: workspaceFolder,
                            });
                        }
                    } catch (err) {
                        console.log(err);
                    }
                    inputFilePath = path.join(workspaceFolder, outFilePath);
                }
                if (fs.existsSync(inputFilePath)) {
                    aePath = (aePath as string).indexOf(" ") === -1 ? aePath : `"${aePath}"`;
                    child_process.exec(`${aePath} -r ${inputFilePath}`, (err) => {
                        console.log(err);
                    });
                } else {
                    showWarningMessage("请检查文件/配置文件/语法是否错误");
                }
            })
            .catch((err) => {
                showWarningMessage(err);
            });
    });
    context.subscriptions.push(disposable);
}

exports.activate = activate;
//# sourceMappingURL=extension.js.map
