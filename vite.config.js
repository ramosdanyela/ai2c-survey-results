import react from "@vitejs/plugin-react-swc";
import path from "path";
import { defineConfig, loadEnv } from "vite";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    base: ["production", "staging"].includes(mode) ? "/reports/" : "/",
    server: {
      host: true,
      port: parseInt(env.PORT),
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
  };
});
