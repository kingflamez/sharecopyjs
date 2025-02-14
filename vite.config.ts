import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  build: {
    lib: {
      entry: "src/index.ts",
      name: "ShareCopyJS",
      fileName: (format) => `sharecopyjs.${format}.js`,
    },
  },
  plugins: [dts()],
  test: {
    globals: true,
    environment: "jsdom",
  },
});
