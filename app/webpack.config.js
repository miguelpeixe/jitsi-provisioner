const path = require("path");
const webpack = require("webpack");
const HTMLWebpackPlugin = require("html-webpack-plugin");

module.exports = (env, argv) => {
  const entry = {
    api: path.resolve("client/api"),
    main: path.resolve("client/index"),
  };

  const plugins = [
    new webpack.DefinePlugin({
      DEMO: JSON.stringify(process.env.DEMO),
      MAX_INSTANCES: JSON.stringify(process.env.MAX_INSTANCES),
    }),
    new webpack.IgnorePlugin({
      resourceRegExp: /^\.\/locale$/,
      contextRegExp: /moment$/,
    }),
    new HTMLWebpackPlugin({
      template: path.resolve(__dirname, "client", "index.html"),
      filename: "index.html",
      inject: "body",
    }),
  ];

  if (!env.production) {
    entry.hmr =
      "webpack-hot-middleware/client?path=/__webpack_hmr&timeout=2000&overlay=false&reload=true";
    plugins.push(new webpack.HotModuleReplacementPlugin());
  }

  return {
    mode: env.production ? "production" : "development",
    devtool: "source-map",
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
      filename: "[name].[hash].js",
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
};
