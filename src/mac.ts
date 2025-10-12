import { execSync } from "child_process";
import { AppVersionInfo } from "./types";
import * as nls from "vscode-nls";

const localize = nls.loadMessageBundle();

/**
 * 获取所有已安装的 After Effects 应用
 */
export function getApps(): AppVersionInfo[] {
  try {
    const command = `mdfind "kMDItemCFBundleIdentifier == 'com.adobe.AfterEffects'"`;
    const stdout = execSync(command, { encoding: "utf8" });

    const apps = stdout
      .split("\n")
      .filter((path) => path.trim() !== "")
      .map((fullPath) => {
        const fileName = fullPath.split("/").pop() || "Unknown";
        return {
          label: fileName.replace(/\.app$/, ""),
          description: fullPath.trim(),
        };
      });

    if (apps.length === 0) {
      throw new Error(
        localize("error.noAeFound", "No After Effects installation found")
      );
    }

    return apps;
  } catch (error) {
    console.error(`Failed to get AE apps: ${error}`);
    throw new Error(
      localize(
        "error.getAppsFailed",
        "Failed to get After Effects apps: {0}",
        String(error)
      )
    );
  }
}

/**
 * 在 After Effects 中执行 JSX 脚本
 */
export async function executeJsx(
  appPath: string,
  scriptPath: string
): Promise<void> {
  try {
    // 转义路径中的特殊字符
    const escapedAppPath = appPath.replace(/'/g, "'\\''");
    const escapedScriptPath = scriptPath.replace(/'/g, "'\\''");

    const command = `osascript -e 'tell application "${escapedAppPath}" to DoScriptFile (POSIX file "${escapedScriptPath}")'`;

    const output = execSync(command, {
      encoding: "utf8",
      timeout: 30000,
    });

    console.log(`✅ Script executed successfully: ${output}`);
  } catch (error) {
    console.error(
      localize(
        "error.executionFailed",
        "Failed to execute script: {0}",
        String(error)
      )
    );
  }
}
