import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/adapters/zod.ts", "src/react.tsx"],
  format: ["esm", "cjs"],
  dts: {
    compilerOptions: {
      module: "ESNext",
      moduleResolution: "Bundler",
      resolveJsonModule: true,
      jsx: "react-jsx",
    },
  },
  sourcemap: true,
  clean: true,
  tsconfig: "tsconfig.build.json",
  external: ["react", "react-dom"],
  esbuildOptions(options) {
    options.alias = {
      "@lib": "./src",
      "@adapters": "./src/adapters",
      "@data": "./data",
    };
  },
});
