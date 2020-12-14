const path = require("path");

module.exports = {
  mode: "development",
  entry: "./src/extension/darkify.ts",
  output: {
    filename: "darkify.js",
    path: path.resolve(__dirname, "dist"),
    publicPath: "dist",
  },
  devtool: "inline-source-map",
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
};
