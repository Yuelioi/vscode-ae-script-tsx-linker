import * as vscode from "vscode";
import { exec } from "child_process";
import { existsSync, readFileSync } from "fs";
import * as path from "path";
import { promisify } from "util";
import { AppVersionInfo, TsConfig, WorkspaceSettings } from "./types";

import JSON5 from "json5";

const execAsync = promisify(exec);

let getApps: () => AppVersionInfo[];
let executeJsx: (aePath: string, scriptPath: string) => any;

if (process.platform === "win32") {
  import("./win").then((module) => {
    getApps = module.getApps;
    executeJsx = module.executeJsx;
  });
} else if (process.platform === "darwin") {
  import("./mac").then((module) => {
    getApps = module.getApps;
    executeJsx = module.executeJsx;
  });
} else {
  throw new Error("不支持的平台");
}

// 默认配置
const DEFAULT_OUT_DIR = "dist";
const EXEC_TIMEOUT = 30000; // 30秒超时

// 工具函数
function checkWorkspaceFolder(): string {
  const folder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  if (!folder) {
    throw new Error("请先打开工作目录");
  }
  return folder;
}

async function selectAeVersion(versions: AppVersionInfo[]): Promise<string> {
  const config = vscode.workspace.getConfiguration("ae-tsx-runner");
  const hostSpecifier = config.get<string>("hostSpecifier");

  // 优先使用配置版本
  if (hostSpecifier) {
    const matched = versions.find((v) => v.label === hostSpecifier);
    if (matched) {
      return matched.description;
    }
    vscode.window.showWarningMessage(`配置版本 ${hostSpecifier} 未找到`);
  }

  // 显示版本选择器
  const selection = await vscode.window.showQuickPick(
    versions.map((v) => ({
      label: `AE ${v.label}`,
      description: v.description,
      detail: `安装路径: ${v.description}`,
    })),
    {
      placeHolder: "选择正在运行的 After Effects 版本",
      ignoreFocusOut: true,
    }
  );

  if (!selection) {
    throw new Error("未选择 AE 版本");
  }
  return selection.description;
}

function getTsconfig() {
  const workspaceFolder = checkWorkspaceFolder();
  const tsConfigPath = path.join(workspaceFolder, "tsconfig.json");
  if (!existsSync(tsConfigPath)) {
    throw new Error("未找到 tsconfig 文件");
  }

  const tsConfig: TsConfig = JSON5.parse(readFileSync(tsConfigPath, "utf-8"));
  return { tsConfigPath, tsConfig };
}

async function compileTsx(inputPath: string): Promise<string> {
  const workspaceFolder = checkWorkspaceFolder();

  const { tsConfigPath, tsConfig } = getTsconfig();
  let outDir = DEFAULT_OUT_DIR;
  try {
    outDir = tsConfig.compilerOptions?.outDir || DEFAULT_OUT_DIR;
  } catch (error) {
    console.warn("读取 tsconfig 失败，使用默认输出目录", error);
  }

  // 构建输出路径
  const outFileBase = path.basename(inputPath, ".tsx");
  const outputPath = path.join(workspaceFolder, outDir, `${outFileBase}.jsx`);

  // 写入配置
  await writeToConfig(inputPath, outputPath);

  // 选择构建工具
  const useRollup = existsSync(path.join(workspaceFolder, "rollup.config.js"));

  try {
    if (useRollup) {
      const rollupBin = path.join(workspaceFolder, "node_modules", ".bin", "rollup");
      await execAsync(`"${rollupBin}" -c`, {
        cwd: workspaceFolder,
        timeout: EXEC_TIMEOUT,
      });
    } else {
      await execAsync(`tsc --project ${tsConfigPath}`, {
        cwd: workspaceFolder,
        timeout: EXEC_TIMEOUT,
      });
    }

    if (!existsSync(outputPath)) {
      throw new Error("输出文件未生成");
    }
    return outputPath;
  } catch (error) {
    const err = error as Error & { code?: number };
    throw new Error(`构建失败: ${err.message} (code ${err.code || "未知"})`);
  }
}

async function writeToConfig(input: string, output: string) {
  const config = vscode.workspace.getConfiguration();
  try {
    // 读取现有配置
    let configObj = config.get<WorkspaceSettings>("ae-tsx-runner", { input: "", output: "", hostSpecifier: "" });

    // 更新配置对象
    configObj.input = input;
    configObj.output = output;
    configObj.hostSpecifier = configObj.hostSpecifier || "";

    // 存回 settings.json
    await config.update("ae-tsx-runner", configObj, vscode.ConfigurationTarget.Workspace);
  } catch (error) {
    vscode.window.showErrorMessage("配置保存失败: " + error);
  }
}
export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand("runrun.JSXScript", async () => {
    try {
      // 1. 获取工作区信息
      const editor = vscode.window.activeTextEditor;

      if (!editor) {
        return;
      }

      // 2. 获取 AE 路径
      const versions = getApps();
      if (versions.length === 0) {
        throw new Error("未找到运行的 AE 实例");
      }

      // 3. 选择版本
      const aePath = await selectAeVersion(versions);

      const fileName = editor.document.fileName;

      if (fileName.endsWith(".jsx") || fileName.endsWith(".jsxbin")) {
        // 4. 执行JSX脚本
        executeJsx(aePath, fileName);
        return;
      }

      if (fileName.endsWith(".tsx") || fileName.endsWith(".ts")) {
        // 5. 编译TSX文件
        const outputPath = await compileTsx(editor.document.fileName);
        // 6. 执行JSX脚本
        executeJsx(aePath, outputPath);
      }
    } catch (error) {
      const err = error as Error;
      vscode.window.showWarningMessage(err.message);
      console.error(err.stack);
    }
  });

  context.subscriptions.push(disposable);
}
