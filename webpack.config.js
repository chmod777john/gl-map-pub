const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

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
        },
        {
          from: 'static/gltf2',  // 特殊处理的源文件夹路径
          to: '',  // 将文件解压到输出根目录下的static文件夹中
          // context: 'static/gltf2',  // 设置上下文路径，只有匹配上下文路径的文件才会复制
        },
      ],
    }),
  ],
  cache: true,
  devtool: 'inline-source-map',
  mode: 'development',
  watchOptions: {
    aggregateTimeout: 300, // 延迟等待时间
    poll: 3000, // 轮询间隔
  },

};
