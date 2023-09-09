本仓库实际上是把最新版本的 React + Mapbox + Babylonjs 链接在一起。其中Mapbox和Babylonjs 不再以 npm 远程包的方式来安装，而是下载二者源码到本地，编译后链接到项目中。这非常重要，因为后续要做更多功能（例如懒加载）的话，基本上就是要能够调试和修改这两个库的源码。



当你克隆本仓库到本地后，请继续克隆 Mapbox 和 Babylon 到你的电脑上。

此时你的计算机里面应该有三个目录: gl-map （本仓库）     Babylon.js      mapbox-gl-js



在本仓库的`package.json`中，看 `dependencies`，里面有三处是 `link`的，代表它们不是从网络安装的，而是本地链接。

```json
  "dependencies": {
    "@types/react": "^18.2.21",
    "@types/react-dom": "^18.2.7",
    "@types/three": "^0.155.1",
    "@babylonjs/core": "link:D:/GithubLocalRepository/Babylon.js/packages/public/@babylonjs/core",
    "@babylonjs/loaders": "link:D:/GithubLocalRepository/Babylon.js/packages/public/@babylonjs/loaders",
    "mapbox-gl": "link:D:/GithubLocalRepository/mapbox-gl-js",
    "npkill": "^0.11.3",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "three": "^0.155.0",
    "typescript": "^5.2.2"
  },
```



