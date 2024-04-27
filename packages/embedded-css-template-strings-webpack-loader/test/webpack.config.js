const path = require("path");

const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const { NODE_ENV } = process.env;

module.exports = {
  mode: NODE_ENV === "production" ? "production" : "development",
  devtool: "source-map",
  entry: "./src/index.js",
  output: {
    filename: "[name].bundle.js",
    path: path.resolve(__dirname, "dist"),
    clean: true,
  },
  optimization: {
    runtimeChunk: "single",
  },

  // --------------------------------------------------------
  // RULES+PLUGINS

  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /(node_modules)/,
        use: [
          { loader: "babel-loader" },
          {
            loader: "embedded-css-template-strings-webpack-loader",
            options: {
              sourceMap: true,
            },
          },
        ],
      },
      {
        test: /\.css$/i,
        use: [
          NODE_ENV === "production" ? MiniCssExtractPlugin.loader : "style-loader",
          {
            loader: "css-loader",
            // When using the cssup-loader modules _must_ be set to true, the auto detection no longer works 🤔
            options: {
              sourceMap: true,
              modules: {
                mode: "local",
                localIdentName: "[name]_[local]_[hash:base64:5]",
              },
            },
          },
          {
            loader: "postcss-loader",
            options: {
              sourceMap: true,
            },
          },
        ],
      },
    ],
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/index.html",
    }),
    new MiniCssExtractPlugin(),
  ],

  // --------------------------------------------------------
  // DEV SERVER

  devServer: {
    static: "./dist",
    historyApiFallback: true,
  },
};
