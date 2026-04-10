import { cpSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import type { Plugin } from "vite";

// @ts-expect-error process is a nodejs global
const host = process.env.TAURI_DEV_HOST;

/**
 * Copy pdfjs-dist assets (cmaps, standard_fonts) into public/ so they are
 * accessible at runtime in both dev and production Tauri builds.
 * The directories are listed in .gitignore and regenerated on every start.
 */
function copyPdfJsAssets(): Plugin {
  return {
    name: "copy-pdfjs-assets",
    buildStart() {
      const base = resolve(__dirname, "node_modules/pdfjs-dist");
      const publicDir = resolve(__dirname, "public");
      for (const dir of ["cmaps", "standard_fonts"] as const) {
        const src = resolve(base, dir);
        const dest = resolve(publicDir, dir);
        if (existsSync(src)) {
          cpSync(src, dest, { recursive: true });
        }
      }
    },
  };
}

// https://vite.dev/config/
export default defineConfig(async () => ({
  plugins: [react(), tailwindcss(), copyPdfJsAssets()],

  // Exclude pdfjs-dist from pre-bundling so Vite doesn't rewrite the worker
  // URL and ?url imports resolve to the actual file path.
  optimizeDeps: {
    exclude: ["pdfjs-dist"],
  },

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent Vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: "ws",
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      // 3. tell Vite to ignore watching `src-tauri`
      ignored: ["**/src-tauri/**"],
    },
  },
}));
