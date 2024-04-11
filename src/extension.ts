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
            const psScript = `
                $AfterProcess = Get-WmiObject -Class Win32_Process -Filter 'Name="AfterFX.exe"' | Select-Object -ExpandProperty Path

                $ae = Get-ChildItem 'HKLM:\\SOFTWARE\\Adobe\\After Effects' |
                Select-Object -ExpandProperty Name |
                ForEach-Object {
                    $name = $_ -replace 'HKEY_LOCAL_MACHINE\\\\SOFTWARE\\\\Adobe\\\\After Effects\\\\'
                    $InstallPath = (Get-ItemPropertyValue ('HKLM:\\\\SOFTWARE\\\\Adobe\\\\After Effects\\\\' + $name) -Name "InstallPath") + 'AfterFX.exe'
                    if ($AfterProcess -contains $InstallPath) {
                        @{label = $name; description = $InstallPath }
                    }
                }

                Write-Output ($ae | ConvertTo-Json -Compress)
                `;

            const ps = child_process.spawn("powershell.exe", ["-command", "-"], {
                stdio: ["pipe", "pipe", "pipe"],
            });

            let output = "";
            ps.stdout.on("data", (data) => {
                output += data.toString();
            });

            ps.stdin.write(psScript);
            ps.stdin.write("\n"); // 添加一个换行符表示 PowerShell 脚本已经结束
            ps.stdin.end();

            ps.on("close", (code) => {
                if (code === 0) {
                    const result = JSON.parse(output);
                    resolve(result);
                } else {
                    console.error(`PowerShell 进程结束时出错，退出码：${code}`);
                }
            });
        } else {
            reject(`暂不支持该系统`);
        }
    });
}

async function selectAePath(aePaths: any) {
    let aePath;
    if (Array.isArray(aePaths)) {
        const config = vscode.workspace.getConfiguration("ae-tsx-runner");

        // 查找.vscode/settings 下有没有 tsxRunner.hostSpecifier, 这个是版本号, 比如`22.0`
        // 具体取决于ae版本号, 可以通过注册表查看 HKEY_LOCAL_MACHINE\SOFTWARE\Adobe\After Effects\version

        const hostSpecifier = config.hostSpecifier || "";

        if (hostSpecifier) {
            for (let i = 0; i < aePaths.length; i++) {
                const element = aePaths[i];
                if (element.label === hostSpecifier) {
                    aePath = element.description;
                    break;
                }
            }
        } else {
            aePath = undefined;
        }

        // 如果没有配置, 那么使用vscode选择器
        if (!aePath) {
            const selection = await vscode.window.showQuickPick(aePaths, {
                placeHolder: "请选择一个选项",
                ignoreFocusOut: true,
            });
            if (selection) {
                aePath = selection.description;
            } else {
                return null;
            }
        }
    } else {
        aePath = aePaths.description;
    }
    return aePath;
}

function activate(context: { subscriptions: vscode.Disposable[] }) {
    const disposable = vscode.commands.registerCommand("runrun.JSXScript", () => {
        getAePath()
            .then(async (aePaths: any) => {
                let aePath = await selectAePath(aePaths);
                if (!aePath) {
                    return;
                }
                console.log(aePath);
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
                    console.log(`"${aePath}" -r ${inputFilePath}`);
                    child_process.exec(`"${aePath}" -r "${inputFilePath}"`, (err) => {
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
