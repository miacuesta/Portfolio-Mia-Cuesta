// @ts-check
import { defineConfig } from "astro/config";

// En Vercel el sitio se sirve desde la raíz del dominio ("/").
// Solo para GitHub Pages hace falta la subcarpeta: construir con
//   BASE_PATH=/Portfolio-Mia-Cuesta npm run build
export default defineConfig({
  base: process.env.BASE_PATH || "/",
});
