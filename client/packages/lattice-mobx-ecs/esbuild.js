/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-var-requires */
const { pnpPlugin } = require("@yarnpkg/esbuild-plugin-pnp");
const esbuild = require("esbuild");

esbuild.build({
  entryPoints: {
    index: "src/index.ts",
  },
  bundle: true,
  sourcemap: true,
  outdir: "dist",
  format: "esm",
  plugins: [pnpPlugin()],
});
