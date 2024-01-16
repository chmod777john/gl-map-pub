const express = require('express');
const path = require('path');

const app = express();
const port = 3000; // 服务器端口号
const publicDir = path.join(__dirname, 'dist'); // 静态文件目录"dev": "concurrently \"node ./server.js\" \"webpack --mode=development --watch\"",

// 使用express中间件来指定静态文件目录
app.use(express.static(publicDir));

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
