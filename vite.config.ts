import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

declare const process: {
  env: {
    VITE_BASE_PATH?: string;
  };
};

export default defineConfig({
  base: process.env.VITE_BASE_PATH ?? "/",
  plugins: [react()],
  test: {
    environment: "node",
    globals: true
  }
});
