import { fileURLToPath, URL } from "url";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";
import { config } from "dotenv";

config();
const env = config({ path: "./.env.test" });

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    setupFiles: ["./vitest-setup.ts"],
    environment: "node",
    env: env.parsed,
    coverage: {
      include: [
        "app.js",
        "src/**",
        "!src/tests/**",
        "!src/keys/**",
        "!src/locales/**",
      ],
    },
  },
  resolve: {
    alias: [
      {
        find: "@/",
        replacement: fileURLToPath(new URL("./src/", import.meta.url)),
      },
    ],
    extensions: [".js", ".json", ".jsx", ".mjs", ".ts", ".tsx"],
  },
});
