export interface AppVersionInfo {
  label: string; // 版本号/别名
  description: string; // 完整路径
}

export interface WorkspaceSettings {
  input: string;
  output: string;
  hostSpecifier: string;
}

export interface TsConfig {
  compilerOptions?: {
    outDir?: string;
  };
}
