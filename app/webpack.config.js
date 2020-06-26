const path = require("path");
const webpack = require("webpack");
const HTMLWebpackPlugin = require("html-webpack-plugin");

const env = process.env.WEBPACK_MODE || "development";

let entry = [path.resolve("client")];

const htmlPlugin = new HTMLWebpackPlugin({
  template: path.resolve(__dirname, "client", "index.html"),
  filename: "index.html",
  inject: "body",
});

let plugins;

if (env !== "production") {
  entry = entry.concat([
    "webpack-hot-middleware/client?path=/__webpack_hmr&timeout=2000&overlay=false&reload=true",
  ]);
  plugins = [
    htmlPlugin,
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
  ];
} else {
  plugins = [htmlPlugin, new webpack.NoEmitOnErrorsPlugin()];
}

module.exports = {
  mode: env || "development",
  devtool: "#source-map",
  entry,
  resolve: {
    alias: {
      react: "preact/compat",
      "react-dom/test-utils": "preact/test-utils",
      "react-dom": "preact/compat",
    },
    modules: ["client", "node_modules"],
  },
  output: {
    path: path.resolve(__dirname, "public"),
    publicPath: "/",
    filename: "[name]-[hash].js",
  },
  plugins,
  module: {
    rules: [
      {
        test: /\.js(x)?$/,
        use: {
          loader: "babel-loader",
        },
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
};
