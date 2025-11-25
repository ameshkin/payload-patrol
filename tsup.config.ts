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
      skipLibCheck: true,
      esModuleInterop: true,
      allowSyntheticDefaultImports: true,
    },
  },
  sourcemap: true,
  clean: true,
  tsconfig: "tsconfig.build.json",
  external: ["express", "hono", "zod"],
  splitting: true,
  treeshake: true,
  esbuildOptions(options) {
    options.alias = {
      "@lib": "./src",
      "@adapters": "./src/adapters",
      "@data": "./data",
    };
  },
});
