import { execSync } from "child_process";
import { Buffer } from "buffer";
import { AppVersionInfo } from "./types";
import * as nls from "vscode-nls";

const localize = nls.loadMessageBundle();
const EXEC_TIMEOUT = 30000;

/**
 * 获取所有正在运行的 After Effects 实例
 */
export function getApps(): AppVersionInfo[] {
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
    if ($ae) {
        Write-Output ($ae | ConvertTo-Json -Compress)
    } else {
        Write-Output "[]"
    }
  `.trim();

  try {
    const psScriptBase64 = Buffer.from(psScript, "utf16le").toString("base64");
    const stdoutBuffer = execSync(
      `powershell.exe -NoProfile -ExecutionPolicy Bypass -EncodedCommand ${psScriptBase64}`,
      { encoding: "utf8", timeout: EXEC_TIMEOUT }
    );

    const stdoutData = stdoutBuffer.trim();

    if (!stdoutData || stdoutData === "[]") {
      throw new Error(
        localize("error.noRunningAe", "No running After Effects instance found")
      );
    }

    const aes = JSON.parse(stdoutData);
    return Array.isArray(aes) ? aes : [aes];
  } catch (error) {
    console.error("Failed to get AE apps:", error);
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
  aePath: string,
  scriptPath: string
): Promise<void> {
  try {
    execSync(`"${aePath}" -r ${scriptPath}`, {
      timeout: EXEC_TIMEOUT,
    });
    console.log(`✅ Script executed successfully`);
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
