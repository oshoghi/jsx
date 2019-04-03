const webpack = require("webpack");
const path = require("path");
//const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
//const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");

module.exports = {
    entry: {
        main: "./src/index.js",
    },
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "[name].bundle.js",
        library: "jsx",
        libraryTarget: "umd",
        umdNamedDefine: true
    },
    externals: [
        "react",
        "react-dom",
    ],
    plugins: [
        //new BundleAnalyzerPlugin(),
        new UglifyJsPlugin(),
        //new MiniCssExtractPlugin({
          //filename: "[name].bundle.css"
        //})
    ],
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader"
                }
            },
            {
                test: /\.scss$/,
                use: [
                    "style-loader",
                    //MiniCssExtractPlugin.loader,
                    "css-loader",
                    "sass-loader"
                ]
            }
        ]
    }
};

