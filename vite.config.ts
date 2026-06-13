import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  build: {
    target: "es2020",
    chunkSizeWarningLimit: 1100,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;
          if (id.includes("ionicons")) return "vendor-icons";
          if (id.includes("@ionic/react-router")) return "vendor-router";
          if (id.includes("@ionic/react")) return "vendor-ionic-react";
          if (id.includes("@ionic/core")) return "vendor-ionic-core";
          if (id.includes("react-router")) return "vendor-router";
          if (id.includes("react")) return "vendor-react";
          if (id.includes("axios")) return "vendor-http";
          return undefined;
        },
      },
    },
  },

  server: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: true,
    allowedHosts: [
      "localhost",
      "127.0.0.1",
      "guitar-reel-trusts-allowance.trycloudflare.com",
    ],
  },
});
