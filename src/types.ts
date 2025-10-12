export interface AppVersionInfo {
  label: string; // 版本号/别名
  description: string; // 完整路径
}

export type BuildTool = "auto" | "tsc" | "rollup" | "webpack" | "esbuild";

export interface WorkspaceSettings {
  input: string;
  output: string;
  hostSpecifier: string;
  buildTool?: BuildTool;
  customBuildCommand?: string;
}

export interface TsConfig {
  compilerOptions?: {
    outDir?: string;
    [key: string]: any;
  };
  [key: string]: any;
}
