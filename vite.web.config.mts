import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    // Remove electron-specific globals
    global: "globalThis",
    "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV || "development"),
  },
  optimizeDeps: {
    // Include dependencies that need to be pre-bundled
    include: [
      "zod",
      "react",
      "react-dom",
      "@tanstack/react-router",
      "@tanstack/react-query",
      "jotai",
      "sonner",
      "date-fns",
      "posthog-js",
      "framer-motion"
    ],
    // Exclude Electron-specific dependencies
    exclude: [
      "electron",
      "better-sqlite3",
      "drizzle-orm",
      "electron-log"
    ]
  },
  build: {
    outDir: "dist-web",
    rollupOptions: {
      input: {
        main: "index.html"
      },
      // Exclude Electron and Node.js specific modules from the bundle
      external: (id) => {
        return id.includes("electron") || 
               id.includes("better-sqlite3") || 
               id.includes("node:") ||
               id.includes("drizzle-orm") ||
               id.includes("electron-log");
      }
    }
  },
  server: {
    port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
    host: process.env.VITE_ALLOW_ALL_HOSTS === 'true' ? true : 'localhost',
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      'dyad-web-app.weekendcodeproject.dev',
      // Allow all hosts if VITE_ALLOW_ALL_HOSTS is true
      ...(process.env.VITE_ALLOW_ALL_HOSTS === 'true' ? ['all'] : [])
    ]
  }
});
