const path = require("path");
const CleanPlugin = require("clean-webpack-plugin");

module.exports = {
  mode: "production",
  entry: {
    exercise_01: "./ajax/exercise_01.ts",
    exercise_02: "./ajax/exercise_02.ts",
  },
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "public", "js"),
  },
  devtool: "none",
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  plugins: [new CleanPlugin.CleanWebpackPlugin()],
};
