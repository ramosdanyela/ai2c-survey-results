import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    // Configuração para React Router - redireciona todas as rotas para index.html
    historyApiFallback: true,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    // Pré-empacota o módulo docx para evitar 504 (Outdated Optimize Dep) no export Word
    include: ["docx"],
  },
}));
