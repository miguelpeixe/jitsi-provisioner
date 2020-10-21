import external from "rollup-plugin-peer-deps-external";
import babel from "rollup-plugin-babel";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";

const packageJson = require("./package.json");

const EXTENSIONS = [".ts", ".tsx", ".js", ".jsx", ".json"];

export default {
  external: ["axios", "lodash"],
  input: "src/index.js",
  output: [
    {
      file: packageJson.main,
      format: "cjs",
      sourcemap: true,
    },
    {
      file: packageJson.module,
      format: "esm",
      sourcemap: true,
    },
  ],
  plugins: [
    external({
      includeDependencies: true,
    }),
    babel({
      babelrc: false,
      runtimeHelpers: true,
      presets: [["@babel/preset-env"]],
      plugins: [
        "@babel/plugin-proposal-class-properties",
        "@babel/plugin-proposal-export-default-from",
        "@babel/plugin-transform-spread",
        "@babel/plugin-transform-runtime",
      ],
      extensions: EXTENSIONS,
      exclude: "node_modules/**",
    }),
    commonjs({
      include: /node_modules/,
    }),
    resolve({
      extensions: EXTENSIONS,
      preferBuiltins: false,
    }),
  ],
};
