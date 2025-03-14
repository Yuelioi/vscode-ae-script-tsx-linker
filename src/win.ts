import { execSync } from "child_process";
import { Buffer } from "buffer";
const EXEC_TIMEOUT = 30000; // 30秒超时

import { AppVersionInfo } from "./types";

/**
 * 获取所有正在运行的 After Effects 实例
 * @returns {Array}
 */
export function getApps(): AppVersionInfo[] {
  const psScript = `$AfterProcess = Get-WmiObject -Class Win32_Process -Filter 'Name="AfterFX.exe"' | Select-Object -ExpandProperty Path
    $ae = Get-ChildItem 'HKLM:\\SOFTWARE\\Adobe\\After Effects' |
    Select-Object -ExpandProperty Name |
    ForEach-Object {
        $name = $_ -replace 'HKEY_LOCAL_MACHINE\\\\SOFTWARE\\\\Adobe\\\\After Effects\\\\'
        $InstallPath = (Get-ItemPropertyValue ('HKLM:\\\\SOFTWARE\\\\Adobe\\\\After Effects\\\\' + $name) -Name "InstallPath") + 'AfterFX.exe'
        if ($AfterProcess -contains $InstallPath) {
            @{label = $name; description = $InstallPath }
        }
    }
    Write-Output ($ae | ConvertTo-Json -Compress)`;

  try {
    const psScriptBase64 = Buffer.from(psScript, "utf16le").toString("base64");
    const stdoutBuffer = execSync(`powershell.exe -NoProfile -ExecutionPolicy Bypass -EncodedCommand ${psScriptBase64}`, { encoding: "utf8" });
    const stdoutData = stdoutBuffer.trim();

    if (!stdoutData) {
      throw new Error("❌ 未找到运行中的 After Effects 实例");
    }

    const aes = JSON.parse(stdoutData);

    if (Array.isArray(aes)) {
      return aes;
    } else {
      return [aes];
    }
  } catch (error) {
    console.error("❌ 捕获到异常:", error);
    throw error;
  }
}

export function executeJsx(aePath: string, scriptPath: string) {
  try {
    execSync(`"${aePath}" -r ${scriptPath}`, {
      timeout: EXEC_TIMEOUT,
    });
  } catch (error) {
    throw new Error(`执行失败: ${error}`);
  }
}
