import { defineConfig } from "tsup";

export default defineConfig({
  entry: [
    "src/index.ts",
    "src/adapters/zod.ts",
    "src/adapters/express.ts",
    "src/adapters/hono.ts",
  ],
  format: ["esm", "cjs"],
  dts: {
    resolve: true,
    compilerOptions: {
      module: "ESNext",
      moduleResolution: "bundler",
      resolveJsonModule: true,
      jsx: "react-jsx",
      skipLibCheck: true,
      esModuleInterop: true,
      allowSyntheticDefaultImports: true,
    },
  },
  sourcemap: true,
  clean: true,
  tsconfig: "tsconfig.build.json",
  external: ["react", "react-dom", "express", "hono"],
  esbuildOptions(options) {
    options.alias = {
      "@lib": "./src",
      "@adapters": "./src/adapters",
      "@data": "./data",
    };
  },
});
