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

            ps.stdout.on("data", chunk => {
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
            ps.on("error", err => {
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
            .then(async aePath => {
                const activeEditor = vscode.window.activeTextEditor;
                if (!activeEditor) {
                    vscode.window.showErrorMessage('请打开至少一个文档');
                    return;
                }
                let filePath = activeEditor.document.uri.fsPath;
                const fileName = activeEditor.document.fileName;
                const workspaceFolder = (vscode.workspace.workspaceFolders as any)[0].uri.fsPath;

                // 如果文件名以tsx结尾, 就运行tsc脚本
                if (fileName.endsWith(".tsx")) {
                    const tsconfigPath = path.join(workspaceFolder, "tsconfig.json");
                    const tsConfigFile = fs.readFileSync(tsconfigPath, "utf8");
                    const tsConfig = JSON.parse(tsConfigFile);

                    // 查看有没有设置outDir 有则用
                    const aeScriptDist = tsConfig["compilerOptions"]["outDir"] || "dist";
                    child_process.execSync(`tsc --project ${tsconfigPath}`);
                    const distFolder = path.join(workspaceFolder, aeScriptDist);
                    const fileBaseName = path.basename(fileName, ".tsx");
                    filePath = path.join(distFolder, `${fileBaseName}.jsx`);
                }

                if (fs.existsSync(filePath)) {
                    aePath = (aePath as string).indexOf(" ") === -1 ? aePath : `"${aePath}"`;
                    child_process.exec(`${aePath} -r ${filePath}`, (err) => {
                        console.log(err);
                    });
                } else {
                    showWarningMessage("请检查文件是否存在, 配置文件是否错误, 以及是否保存文件");
                }
            })
            .catch(err => {
                showWarningMessage(err);
            });
    });
    context.subscriptions.push(disposable);
}

exports.activate = activate;
//# sourceMappingURL=extension.js.map
