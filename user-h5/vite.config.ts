import fs from "node:fs";
import path from "node:path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

/** 同时支持 user-h5/.env* 与 仓库根目录 .env*（后者常被 monorepo 误放在上级目录导致读不到） */
export default defineConfig(({ mode }) => {
  const readViteEnvFromExample = (filePath: string) => {
    if (!fs.existsSync(filePath)) return {} as Record<string, string>;
    const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
    const env: Record<string, string> = {};
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const idx = trimmed.indexOf("=");
      if (idx <= 0) continue;
      const key = trimmed.slice(0, idx).trim();
      const value = trimmed.slice(idx + 1).trim();
      if (key.startsWith("VITE_")) env[key] = value;
    }
    return env;
  };

  const pkgDir = __dirname;
  const repoRoot = path.resolve(__dirname, "..");
  const envPkg = loadEnv(mode, pkgDir, "VITE_");
  const envRoot = loadEnv(mode, repoRoot, "VITE_");
  const envPkgExample = readViteEnvFromExample(path.join(pkgDir, ".env.example"));
  const envRootExample = readViteEnvFromExample(path.join(repoRoot, ".env.example"));
  const amapKey =
    envPkg.VITE_AMAP_KEY ||
    envRoot.VITE_AMAP_KEY ||
    envPkgExample.VITE_AMAP_KEY ||
    envRootExample.VITE_AMAP_KEY ||
    "";
  const amapSecurity =
    envPkg.VITE_AMAP_SECURITY_CODE ||
    envRoot.VITE_AMAP_SECURITY_CODE ||
    envPkgExample.VITE_AMAP_SECURITY_CODE ||
    envRootExample.VITE_AMAP_SECURITY_CODE ||
    "";

  console.log(
    "[vite amap env]",
    `mode=${mode}`,
    `keyLen=${amapKey.length}`,
    `securityLen=${amapSecurity.length}`
  );

  return {
    define: {
      "import.meta.env.VITE_AMAP_KEY": JSON.stringify(amapKey),
      "import.meta.env.VITE_AMAP_SECURITY_CODE": JSON.stringify(amapSecurity)
    },
    plugins: [react()]
  };
});
