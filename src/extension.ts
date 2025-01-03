"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
import * as vscode from "vscode";
import * as child_process from "child_process";
import * as fs from "fs";
import * as path from "path";
const win32 = process.platform === "win32";

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
      ps.stdin.write("\n");
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
      reject(`Unsupported platform: ${process.platform}`);
    }
  });
}

async function selectAePath(aePaths: any) {
  let aePath: string | undefined;

  if (Array.isArray(aePaths)) {
    const config = vscode.workspace.getConfiguration("ae-tsx-runner");
    const hostSpecifier = config.hostSpecifier || "";

    aePath = aePaths.find((element: any) => element.label === hostSpecifier)?.description;

    if (!aePath) {
      const selection = await vscode.window.showQuickPick(aePaths, {
        placeHolder: "Select After Effects version",
        ignoreFocusOut: true,
      });
      aePath = selection ? selection.description : null;
    }
  } else {
    aePath = aePaths.description;
  }

  return aePath;
}

export function activate(context: vscode.ExtensionContext) {
  const runner = vscode.commands.registerCommand("ae-tsx-runner.run", async () => {
    const aePaths: any = await getAePath();
    let aePath = await selectAePath(aePaths);
    if (!aePath) {
      return;
    }

    aePath = aePath.replace(".exe", "");
    const activeEditor = vscode.window.activeTextEditor;
    if (!activeEditor) {
      vscode.window.showErrorMessage("please open a script file");
      return;
    }
    let scriptPath = activeEditor.document.uri.fsPath;
    const inputFileName = activeEditor.document.fileName;
    const workspaceFolder = (vscode.workspace.workspaceFolders as any)[0].uri.fsPath;

    if (inputFileName.endsWith(".tsx")) {
      const outFileBaseName = path.basename(inputFileName, ".tsx");
      const outFilePath = `dist/${outFileBaseName}.jsx`;
      let vsc_settings: any = {};

      // TODO 使用vscode配置文件保存输入输出路径
      const vscodeSettingsPath = "./.vscode/settings.json";
      if (fs.existsSync(vscodeSettingsPath)) {
        vsc_settings = JSON.parse(fs.readFileSync(vscodeSettingsPath, "utf-8"));
      } else {
        if (!fs.existsSync("./.vscode")) {
          fs.mkdirSync("./.vscode", { recursive: true });
        }
      }

      if (!vsc_settings["ae-tsx-runner"]) {
        vsc_settings["ae-tsx-runner"] = {};
      }

      vsc_settings["ae-tsx-runner"]["input"] = scriptPath;
      vsc_settings["ae-tsx-runner"]["output"] = outFilePath;
      fs.writeFileSync(vscodeSettingsPath, JSON.stringify(vsc_settings, null, 2));

      const rollupPath = path.join(workspaceFolder, "node_modules", ".bin", "rollup");
      try {
        child_process.execSync(`"${rollupPath}" -c`, {
          cwd: workspaceFolder,
        });
      } catch (error) {
        console.warn(error);
        vscode.window.showWarningMessage("rollup error");
        return;
      }

      scriptPath = path.join(workspaceFolder, outFilePath);
    }

    if (!fs.existsSync(scriptPath)) {
      vscode.window.showWarningMessage("script file not found");
      return;
    }

    if (fs.existsSync(scriptPath)) {
      child_process.exec(`"${aePath}" -r "${scriptPath}"`, (err) => {
        console.log(err);
      });
    } else {
    }
  });

  context.subscriptions.push(runner);
}
