import { defineConfig } from "vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";

export default defineConfig({
  base: "/core-1-mastery/",

  plugins: [
    tailwindcss(),
    tanstackStart({
      srcDirectory: ".",
      prerender: {
        enabled: true,
        autoSubfolderIndex: true,
        autoStaticPathsDiscovery: true,
        crawlLinks: true,
        failOnError: true,
      },
    }),
    viteReact(),
  ],

  build: {
    target: "es2022",
  },

  resolve: {
    tsconfigPaths: true,
    dedupe: ["tslib"],
  },

  ssr: {
    noExternal: ["tslib"],
  },

  optimizeDeps: {
    include: ["tslib"],
  },
});