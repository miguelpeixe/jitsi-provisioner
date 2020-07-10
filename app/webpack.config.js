const path = require("path");
const webpack = require("webpack");
const HTMLWebpackPlugin = require("html-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");

module.exports = (env, argv) => {
  const entry = {
    main: path.resolve("client/index"),
  };

  const plugins = [
    new webpack.DefinePlugin({
      DOMAIN: JSON.stringify(process.env.DOMAIN),
      DEMO: JSON.stringify(!!parseInt(process.env.DEMO)),
      MAX_INSTANCES: JSON.stringify(parseInt(process.env.MAX_INSTANCES)),
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
    new MiniCssExtractPlugin({
      filename: "[name].[hash].css",
      chunkFilename: "[id].[hash].css",
    }),
  ];

  if (!env.production) {
    entry.hmr =
      "webpack-hot-middleware/client?path=/__webpack_hmr&timeout=2000&overlay=false&reload=true";
    plugins.push(new webpack.HotModuleReplacementPlugin());
  }

  return {
    mode: env.production ? "production" : "development",
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
            options: {
              presets: [
                ["@babel/preset-env", { modules: false }],
                ["@babel/preset-react"],
              ],
              plugins: [
                "@babel/plugin-proposal-class-properties",
                "@babel/plugin-proposal-export-default-from",
                "@babel/plugin-transform-spread",
                "@babel/plugin-transform-runtime",
              ],
            },
          },
          exclude: /node_modules/,
          sideEffects: false,
        },
        {
          test: /\.((c|le)ss)$/,
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
              options: {
                hmr: !env.production,
                esModule: true,
              },
            },
            {
              loader: "css-loader",
            },
            {
              loader: "less-loader",
              options: {
                lessOptions: {
                  javascriptEnabled: true,
                  modifyVars: { "@reset-import": false },
                },
              },
            },
          ],
          sideEffects: true,
        },
      ],
    },
  };
};
