import { execSync } from "child_process";

import { AppVersionInfo } from "./types";

// 同步获取 AE 应用列表
export function getApps(): AppVersionInfo[] {
  try {
    const command = `mdfind "kMDItemCFBundleIdentifier == 'com.adobe.AfterEffects'"`;
    const stdout = execSync(command).toString();

    return stdout
      .split("\n")
      .filter((path) => path.trim() !== "")
      .map((fullPath) => {
        const fileName = fullPath.split("/").pop() || "Unknown";
        return {
          label: fileName.replace(/\.app$/, ""),
          description: fullPath.trim(),
        };
      });
  } catch (error) {
    console.error(`❌ 获取 AE 应用失败: ${error}`);
    return [];
  }
}

// 同步执行 AppleScript
export function executeJsx(appPath: string, scriptPath: string) {
  try {
    const command = `osascript -e 'tell application "${appPath}" to DoScriptFile (POSIX file "${scriptPath}")'`;
    const output = execSync(command).toString();
    console.log(`✅ 执行成功: ${output}`);
  } catch (error) {
    console.error(`❌ 执行出错: ${error}`);
  }
}
