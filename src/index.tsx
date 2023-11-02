import React, { useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import * as mapboxgl from 'mapbox-gl';

import 'mapbox-gl/dist/mapbox-gl.css';

import * as BABYLON from '@babylonjs/core'

import "@babylonjs/loaders";

import { CustomLayerInterface, LngLatLike } from 'mapbox-gl';

import axios from 'axios'
//import './mapbox-gl.css'


const App = () => {
  return <>
    <div id='map' style={{
      height: 1000,
      width: 2000
    }}></div>
    <ChildComp></ChildComp>
  </>;
};

const ChildComp = ()=> {
  

  useEffect(()=>{

    (async ()=>{

      const response = await axios.get('/data/Berlin_Buildings_Layer2_collada_MasterJSON.json'); 
      const boxData:{
        bbox: {
          xmin: number,
          ymin: number
        }
      } = response.data;
  
      mapboxgl.accessToken = 'pk.eyJ1IjoiZGV2aWRlZDAiLCJhIjoiY2xsbzE3cHp5MDV4ZzNycDZyNjMxaXIxbSJ9.ZTRvdmiOwP0AG8GetebzlQ'
      const map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/light-v10',
        zoom: 18,
        center: [boxData.bbox.xmin ,  boxData.bbox.ymin],
        // center:[0,0],
        pitch: 60,
        antialias: true // create the gl context with MSAA antialiasing, so custom layers are antialiased
    });
  
      map.on('load', () => {
        const babylonLayer = new BabylonLayer('babylon-layer-2');
        map.addLayer(babylonLayer);
      });

    })()

  }, [])

  return <>
  </>
}


createRoot(document.getElementById('root')!).render(<App></App>);


class BabylonLayer implements CustomLayerInterface {
  readonly id: string;
  readonly type: "custom" = "custom";
  readonly renderingMode: "3d" = "3d";

  private map: Map | undefined;
  private scene: BABYLON.Scene | undefined;
  private camera: BABYLON.Camera | undefined;
  private modelMatrix: BABYLON.Matrix | undefined;

  constructor(id: string) {
    this.id = id;
  }


  public async loadModels() {
    return new Promise(async (resolve, reject) => {

      const response = await axios.get('/data/Berlin_Buildings_Layer2.json'); 
      // const tilesetData = response.data;
      const kmlData = response.data

      // const modD = parseTilesetData(tilesetData); // 假设有一个解析函数来处理tilesetData

      const modD = parseKmlData(kmlData)


      const assetsManager = new BABYLON.AssetsManager(this.scene);

      let progress = 0

      modD.forEach(item => {
        const { filename, latitude, longitude } = item;
  
        const meshTask = assetsManager.addMeshTask(filename, '', '/data/', filename);
  
        meshTask.onSuccess = task => {
          
          progress ++
          console.log(progress)

          const meshes = task.loadedMeshes;
  
          const modelAltitude = 0;
          const modelCoords = mapboxgl.MercatorCoordinate.fromLngLat([longitude, latitude], modelAltitude);
          const scale = modelCoords.meterInMercatorCoordinateUnits();
  
          meshes.forEach(mesh => {
            if (mesh.id !== '__root__') return;
  
            mesh.scaling = new BABYLON.Vector3(scale, scale, scale);
            mesh.rotationQuaternion = BABYLON.Quaternion.FromEulerAngles(Math.PI / 2, 0, 0)
            mesh.position = new BABYLON.Vector3(modelCoords.x, modelCoords.y, 0);
            // console.log(mesh.position)
          });
        };
  
        meshTask.onError = (task, message, exception) => {
          console.error(`Error loading model ${filename}:`, message, exception);
          reject(task.errorObject);
        };
      });
  
      assetsManager.onFinish = tasks => {
        console.log('All tasks completed successfully.');
        resolve(tasks);
      };
  
      assetsManager.onTaskError = task => {
        console.error(`Task error for ${task.name}:`, task.errorObject);
        reject(task.errorObject);
      };
  
      assetsManager.load();
    });
  }
  
  

  onAdd = (map: Map, gl: WebGLRenderingContext) => {
    this.map = map;
    const engine = new BABYLON.Engine(
      gl,
      true,
      {
        useHighPrecisionMatrix: true
      },
      true
    );

    this.scene = new BABYLON.Scene(engine);
    this.scene.autoClear = false;
    this.scene.detachControl();
    this.scene.beforeRender = function () {
      engine.wipeCaches(true);
    };
    this.camera = new BABYLON.Camera(
      "mapbox-camera",
      new BABYLON.Vector3(),
      this.scene
    );
    const light = new BABYLON.HemisphericLight(
      "mapbox-light",
      new BABYLON.Vector3(0.5, 0.5, 4000),
      this.scene
    );


  
    // const boxCoord = mapboxgl.MercatorCoordinate.fromLngLat(
    //   [13.381, 52.532],
    //   // [0,0],
    //   // 200
    // );
    // const boxMesh = BABYLON.MeshBuilder.CreateBox(
    //   "box",
    //   {
    //     // size: 10 * boxCoord.meterInMercatorCoordinateUnits()
    //     size: 30
    //   },
    //   this.scene
    // );
    // console.log(boxCoord.meterInMercatorCoordinateUnits())
    // boxMesh.position = new BABYLON.Vector3(boxCoord.x, boxCoord.y, boxCoord.z);

    // const sphereCoord = mapboxgl.MercatorCoordinate.fromLngLat(
    //   [13.3, 52.5],
    //   // 400
    // );
    // const sphereMesh = BABYLON.MeshBuilder.CreateSphere(
    //   "sphere",
    //   {
    //     // diameter: 30 * sphereCoord.meterInMercatorCoordinateUnits()
    //     diameter: 30
    //   },
    //   this.scene
    // );
    // sphereMesh.position = new BABYLON.Vector3(
    //   sphereCoord.x,
    //   sphereCoord.y,
    //   sphereCoord.z
    // );

    // const cone = BABYLON.MeshBuilder.CreateCylinder("cone", { height: 20, diameterTop: 10, diameterBottom: 20, tessellation: 40 }, this.scene);

    // const coneCoord = mapboxgl.MercatorCoordinate.fromLngLat(
    //   [13.381455644224731, 52.532437942637095]
    // )
    // cone.position = new BABYLON.Vector3(
    //   coneCoord.x,
    //   coneCoord.y,
    //   coneCoord.z
    // )

    // const modelOrigin = [13.381455644224731, 52.532437942637095] as LngLatLike;
    // // 计算模型的初始位置
    // const modelAltitude = 0;
    // const modelCoords = mapboxgl.MercatorCoordinate.fromLngLat(modelOrigin, modelAltitude);

    // const scale = modelCoords.meterInMercatorCoordinateUnits()


    // const group = [boxMesh, sphereMesh, cone]
    // group.map(( mesh )=>{
      
    //   // mesh.position = new BABYLON.Vector3(
    //   //   modelCoords.x,
    //   //   modelCoords.y,
    //   // )
    //   mesh.scaling = new BABYLON.Vector3(scale, scale, scale)
    //   mesh.rotationQuaternion = BABYLON.Quaternion.FromEulerAngles(Math.PI / 2, 0, 0)
    // })



    // console.log(sphereMesh.position)
    // window.box = boxMesh
    // window.sp = sphereMesh
    window.camera = this.camera
    window.babylon = BABYLON
    window.ss  = this.scene

    // BABYLON.SceneLoader.Append("/", "TORONTO3D_mesh_2.gltf", this.scene, (results) => {
    //   // 获取导入的模型对象
    //   const meshes = results.meshes;
    //   const modelOrigin = [148.9819, -35.3981] as LngLatLike;
    //   // 计算模型的初始位置
    //   const modelAltitude = 0;
    //   const modelCoords = mapboxgl.MercatorCoordinate.fromLngLat(modelOrigin, modelAltitude);
  
    //   // 处理缩放
    //   const scale = modelCoords.meterInMercatorCoordinateUnits()

    //   console.log(meshes.length, 'l')
    //   meshes.map(( mesh )=>{

    //     // mesh 可以是刚刚加载进来的gltf  也可以是别处的圆或者方块；  圆和方块要保持不变，我们只想要设置 gltf 的 position 
    //     if (mesh.id !== '__root__') return

    //     console.log('the scale', scale)
    //     mesh.scaling = new BABYLON.Vector3(scale, scale, scale)
    //     mesh.position = new BABYLON.Vector3(
    //       modelCoords.x,
    //       modelCoords.y,
    //       0
    //     )
    //   })

    //   console.log(meshes[0].getBoundingInfo(), 'info')

    //   // 将模型移动到合适的位置
    // });

  
    this.loadModels()
  }

  render = (gl: WebGLRenderingContext, matrix: number[]) => {
    // projection & view matrix
    const cameraMatrix = BABYLON.Matrix.FromArray(matrix);
    this.camera!.freezeProjectionMatrix(cameraMatrix);

    this.scene!.render(false);
    this.map!.triggerRepaint();
  }
}



function parseKmlData(kmlData: {
  [fileId: string]: {
    envelope: [number, number, number, number];
    tile: [number, number];
};

}) {
  const modelData: { filename:string, latitude:number, longitude:number }[] = [];
  Object.keys(kmlData).forEach(( fileId )=>{
    const envelope = kmlData[fileId].envelope 
    const latitude = (envelope[1] + envelope[3]) / 2
    const longitude = (envelope[0] + envelope[2]) / 2

    const filename = fileId + '.gltf'

    modelData.push({
      filename: filename,
      latitude: latitude,
      longitude: longitude
    })

  })
  return modelData
}