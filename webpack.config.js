const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack'); // 修改此处

module.exports = {
  entry: {
    index: './src/index.tsx',  // 第一个入口文件路径
    main: './src/main.ts'      // 第二个入口文件路径
  },  
  output: {
    filename: '[name].bundle.js',   // 输出的文件名
    path: path.resolve(__dirname, 'dist')  // 输出目录路径
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx']  // 支持的文件扩展名
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        loader: 'ts-loader',
        options: {
          transpileOnly: true
        }
      },
      {
        test: /\.css$/,
        use: ["style-loader" ,"css-loader", "postcss-loader"],
      },
    ]
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    compress: true,
    port: 3000  // dev server 使用的端口号
  },
  plugins: [
    // ...其他插件
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'static',  // 源文件夹路径
          to: '',  // 目标文件夹路径（此处为空，表示复制到输出根目录）
        }
      ],
    }),
    new webpack.DefinePlugin({
      DATASET: JSON.stringify(process.env.DATASET) // 使用 JSON.stringify
    })
  ],
  cache: true,
  devtool: 'inline-source-map',
  mode: 'development'
};
