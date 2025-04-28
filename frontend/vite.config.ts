import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { createHtmlPlugin } from "vite-plugin-html";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  console.log("Environment variables:", env);
  console.log("VITE_API_BASE_URL:", env.VITE_API_BASE_URL);

  return {
    plugins: [
      react(),
      tailwindcss(),
      createHtmlPlugin({
        minify: true,
        inject: {
          data: {
            VITE_API_BASE_URL: env.VITE_API_BASE_URL || "/api",
          },
        },
      }),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
