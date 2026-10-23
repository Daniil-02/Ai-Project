import { defineConfig } from "vitest/config";
import { loadEnv } from "vite";
import { fileURLToPath } from "node:url";

// Налаштування тестів (практична робота 4).
// Псевдонім @ — як у ПР 3. Змінні з .env.local стають доступні тестам,
// а тести, що звертаються до бази, мають 15 секунд на відповідь.
export default defineConfig(({ mode }) => ({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./", import.meta.url)) },
  },
  test: {
    env: loadEnv(mode, process.cwd(), ""),
    testTimeout: 15000,
  },
}));
