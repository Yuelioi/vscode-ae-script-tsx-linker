import * as vscode from "vscode";
import { exec } from "child_process";
import { existsSync, readFileSync } from "fs";
import * as path from "path";
import { promisify } from "util";
import { AppVersionInfo, TsConfig, BuildTool } from "./types";
import * as nls from "vscode-nls";

import JSON5 from "json5";

const localize = nls.loadMessageBundle();
const execAsync = promisify(exec);

let getApps: () => AppVersionInfo[];
let executeJsx: (aePath: string, scriptPath: string) => Promise<void>;

// 动态加载平台特定模块
async function loadPlatformModule() {
  if (process.platform === "win32") {
    const module = await import("./win");
    getApps = module.getApps;
    executeJsx = module.executeJsx;
  } else if (process.platform === "darwin") {
    const module = await import("./mac");
    getApps = module.getApps;
    executeJsx = module.executeJsx;
  } else {
    throw new Error(
      localize("error.unsupportedPlatform", "Unsupported platform")
    );
  }
}

// 常量配置
const CONFIG_SECTION = "ae-tsx-runner";
const DEFAULT_OUT_DIR = "dist";
const EXEC_TIMEOUT = 30000;

// 工具函数
function getWorkspaceFolder(): string {
  const folder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  if (!folder) {
    throw new Error(
      localize("error.noWorkspace", "Please open a workspace folder first")
    );
  }
  return folder;
}

function getConfiguration(): vscode.WorkspaceConfiguration {
  return vscode.workspace.getConfiguration(CONFIG_SECTION);
}

async function selectAeVersion(versions: AppVersionInfo[]): Promise<string> {
  const config = getConfiguration();
  const hostSpecifier = config.get<string>("hostSpecifier");

  // 优先使用配置版本
  if (hostSpecifier) {
    const matched = versions.find((v) => v.label === hostSpecifier);
    if (matched) {
      return matched.description;
    }
    vscode.window.showWarningMessage(
      localize(
        "warning.versionNotFound",
        "Configured version {0} not found",
        hostSpecifier
      )
    );
  }

  // 显示版本选择器
  const selection = await vscode.window.showQuickPick(
    versions.map((v) => ({
      label: `AE ${v.label}`,
      description: v.description,
      detail: localize(
        "detail.installPath",
        "Install path: {0}",
        v.description
      ),
    })),
    {
      placeHolder: localize(
        "placeholder.selectVersion",
        "Select running After Effects version"
      ),
      ignoreFocusOut: true,
    }
  );

  if (!selection) {
    throw new Error(
      localize("error.noVersionSelected", "No AE version selected")
    );
  }
  return selection.description;
}

function getTsconfig(): { tsConfigPath: string; tsConfig: TsConfig } {
  const workspaceFolder = getWorkspaceFolder();
  const tsConfigPath = path.join(workspaceFolder, "tsconfig.json");

  if (!existsSync(tsConfigPath)) {
    throw new Error(localize("error.noTsConfig", "tsconfig.json not found"));
  }

  try {
    const tsConfig: TsConfig = JSON5.parse(readFileSync(tsConfigPath, "utf-8"));
    return { tsConfigPath, tsConfig };
  } catch (error) {
    throw new Error(
      localize(
        "error.invalidTsConfig",
        "Failed to parse tsconfig.json: {0}",
        String(error)
      )
    );
  }
}

function getBuildTool(workspaceFolder: string): BuildTool {
  const config = getConfiguration();
  const buildTool = config.get<BuildTool>("buildTool");

  // 如果配置了构建工具，直接使用
  if (buildTool && buildTool !== "auto") {
    return buildTool;
  }

  // 自动检测
  if (
    existsSync(path.join(workspaceFolder, "rollup.config.js")) ||
    existsSync(path.join(workspaceFolder, "rollup.config.mjs"))
  ) {
    return "rollup";
  }

  if (existsSync(path.join(workspaceFolder, "webpack.config.js"))) {
    return "webpack";
  }

  if (existsSync(path.join(workspaceFolder, "esbuild.config.js"))) {
    return "esbuild";
  }

  return "tsc";
}

async function buildWithTool(
  buildTool: BuildTool,
  workspaceFolder: string,
  tsConfigPath: string
): Promise<void> {
  const config = getConfiguration();
  const customBuildCommand = config.get<string>("customBuildCommand");

  let command: string;

  if (customBuildCommand) {
    command = customBuildCommand;
  } else {
    switch (buildTool) {
      case "rollup":
        const rollupBin = path.join(
          workspaceFolder,
          "node_modules",
          ".bin",
          "rollup"
        );
        command = `"${rollupBin}" -c`;
        break;
      case "webpack":
        const webpackBin = path.join(
          workspaceFolder,
          "node_modules",
          ".bin",
          "webpack"
        );
        command = `"${webpackBin}"`;
        break;
      case "esbuild":
        const esbuildBin = path.join(
          workspaceFolder,
          "node_modules",
          ".bin",
          "esbuild"
        );
        command = `"${esbuildBin}" --bundle`;
        break;
      case "tsc":
      default:
        command = `tsc --project "${tsConfigPath}"`;
        break;
    }
  }

  try {
    await execAsync(command, {
      cwd: workspaceFolder,
      timeout: EXEC_TIMEOUT,
    });
  } catch (error) {
    const err = error as Error & { code?: number };
    throw new Error(
      localize(
        "error.buildFailed",
        "Build failed: {0} (code {1})",
        err.message,
        err.code || "unknown"
      )
    );
  }
}

async function compileTsx(inputPath: string): Promise<string> {
  const workspaceFolder = getWorkspaceFolder();
  const { tsConfigPath, tsConfig } = getTsconfig();

  const outDir = tsConfig.compilerOptions?.outDir || DEFAULT_OUT_DIR;
  const outFileBase = path.basename(inputPath, path.extname(inputPath));
  const outputPath = path.join(workspaceFolder, outDir, `${outFileBase}.jsx`);

  // 保存配置
  await saveToConfig(inputPath, outputPath);

  // 获取并执行构建工具
  const buildTool = getBuildTool(workspaceFolder);

  // 打包
  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: localize("progress.building", "Building with {0}...", buildTool),
      cancellable: false,
    },
    async () => {
      await buildWithTool(buildTool, workspaceFolder, tsConfigPath);
    }
  );

  if (!existsSync(outputPath)) {
    throw new Error(
      localize("error.outputNotGenerated", "Output file was not generated")
    );
  }

  return outputPath;
}

async function saveToConfig(input: string, output: string): Promise<void> {
  try {
    const config = vscode.workspace.getConfiguration(CONFIG_SECTION);

    // 分别更新每个配置项
    await config.update("input", input, vscode.ConfigurationTarget.Workspace);
    await config.update("output", output, vscode.ConfigurationTarget.Workspace);
  } catch (error) {
    vscode.window.showErrorMessage(
      localize(
        "error.configSaveFailed",
        "Failed to save configuration: {0}",
        String(error)
      )
    );
  }
}

export async function activate(context: vscode.ExtensionContext) {
  // 加载平台模块
  await loadPlatformModule();

  const disposable = vscode.commands.registerCommand(
    "runrun.JSXScript",
    async () => {
      try {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
          vscode.window.showWarningMessage(
            localize("warning.noActiveEditor", "No active editor")
          );
          return;
        }

        // 获取 AE 实例
        const versions = getApps();
        if (versions.length === 0) {
          throw new Error(
            localize(
              "error.noAeInstance",
              "No running After Effects instance found"
            )
          );
        }

        // 选择版本
        const aePath = await selectAeVersion(versions);
        const fileName = editor.document.fileName;
        const ext = path.extname(fileName);

        // 直接执行 .jsx 或 .jsxbin
        if (ext === ".jsx" || ext === ".jsxbin") {
          await executeJsx(aePath, fileName);
          vscode.window.showInformationMessage(
            localize("success.executed", "Script executed successfully")
          );
          return;
        }

        // 编译并执行 .tsx 或 .ts
        if (ext === ".tsx" || ext === ".ts") {
          const outputPath = await compileTsx(fileName);
          await executeJsx(aePath, outputPath);
          vscode.window.showInformationMessage(
            localize(
              "success.compiledAndExecuted",
              "Script compiled and executed successfully"
            )
          );
          return;
        }

        vscode.window.showWarningMessage(
          localize(
            "warning.unsupportedFileType",
            "Unsupported file type: {0}",
            ext
          )
        );
      } catch (error) {
        const err = error as Error;
        vscode.window.showErrorMessage(err.message);
        console.error(err.stack);
      }
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {
  // 清理资源
}
