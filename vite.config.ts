import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(() => ({
  server: {
    port: 3000,
    proxy: {
      // 🔥 PFORT + proxy APIs
      "/api/hotelcodelist": {
        target: "http://localhost:3001",
        changeOrigin: true,
        secure: false,
      },

      // 🔥 Other proxy APIs
      "/api/hotel-search": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },

      // 🔥 DB APIs (your Node backend on 4000)
      "/api/db": {
        target: "http://localhost:4000",
        changeOrigin: true,
      },

      // fallback (optional)
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },

  plugins: [react()],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  build: {
    rollupOptions: {
      output: {
        entryFileNames: "assets/[name].[hash].js",
        chunkFileNames: "assets/[name].[hash].js",
        assetFileNames: "assets/[name].[hash].[ext]",
      },
    },
  },
}));
