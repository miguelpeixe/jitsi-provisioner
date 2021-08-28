const path = require("path");
const webpack = require("webpack");
const HTMLWebpackPlugin = require("html-webpack-plugin");
const TerserJSPlugin = require("terser-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const BundleAnalyzerPlugin =
  require("webpack-bundle-analyzer").BundleAnalyzerPlugin;

module.exports = (env, argv) => {
  const entry = [path.resolve("client")];

  const plugins = [
    new webpack.DefinePlugin({
      "process.env": {},
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
      filename: "[name].[contenthash].css",
      chunkFilename: "[id].[contenthash].css",
    }),
  ];

  let analyzerOptions = {
    analyzerMode: "static",
    reportFilename: path.resolve("bundle-report.html"),
    openAnalyzer: false,
  };

  if (!env.production) {
    entry.push(
      "webpack-hot-middleware/client?path=/__webpack_hmr&timeout=2000&overlay=false&reload=true"
    );
    plugins.push(new webpack.HotModuleReplacementPlugin());
    analyzerOptions = {
      analyzerMode: "server",
      analyzerHost: "0.0.0.0",
      analyzerPort: "8888",
      openAnalyzer: false,
    };
  }

  plugins.push(new BundleAnalyzerPlugin(analyzerOptions));
  return {
    mode: env.production ? "production" : "development",
    entry,
    devtool: env.production ? undefined : "source-map",
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
      filename: env.production ? "[name].[contenthash].js" : "[name].js",
    },
    plugins,
    optimization: env.production
      ? {
          splitChunks: {
            maxSize: 250000,
            chunks: "all",
          },
          minimize: true,
          minimizer: [new TerserJSPlugin(), new CssMinimizerPlugin()],
        }
      : {},
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
          exclude: /node_modules|..\/api/,
          sideEffects: false,
        },
        {
          test: /\.((c|le)ss)$/,
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
            },
            {
              loader: "css-loader",
            },
            {
              loader: "less-loader",
              options: {
                lessOptions: {
                  javascriptEnabled: true,
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
