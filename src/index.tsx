import React, { useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import * as mapboxgl from 'mapbox-gl';

import 'mapbox-gl/dist/mapbox-gl.css';

import * as BABYLON from '@babylonjs/core'

import "@babylonjs/loaders";

import { CustomLayerInterface, LngLatLike } from 'mapbox-gl';

import axios from 'axios'

import earcut from 'earcut'
//import './mapbox-gl.css'


const App = () => {
  return <>
    <canvas id='babylon-container' style={{
      height: 1000,
      width: 2000
    }}></canvas>
    <ChildComp></ChildComp>
  </>;
};

const ChildComp = ()=> {
  

  useEffect(()=>{

    (async ()=>{

      const canvas = document.getElementById("babylon-container");
      const engine = new BABYLON.Engine(
        canvas,
        true,
        {
          useHighPrecisionMatrix: true
        },
        true
      );
      
      const scene = new BABYLON.Scene(engine);
      scene.collisionsEnabled = true
      scene.shadowsEnabled = true



      window.ss = scene;

      const queryString = window.location.search;

      // 解析查询字符串以获取经纬度参数
      const urlParams = new URLSearchParams(queryString);
      const latitude = parseFloat(urlParams.get('lat')) || 0;
      const longitude = parseFloat(urlParams.get('lon')) || 0;

      const origin_coord = mapboxgl.MercatorCoordinate.fromLngLat({lon: longitude, lat:latitude}, 0)

      const origin_scale = origin_coord.meterInMercatorCoordinateUnits()

      const camera = new BABYLON.FreeCamera("camera", new BABYLON.Vector3(0, 100 ,0), scene);
      const observe_camera = new BABYLON.FreeCamera("camera", new BABYLON.Vector3(0, 300 ,0), scene);
      

      camera.setTarget(new BABYLON.Vector3(0, -1, 0));
      
      observe_camera.setTarget(new BABYLON.Vector3(0, 0, 0));
      observe_camera.viewport = new BABYLON.Viewport(0.8, 0.8, 0.2, 0.2);

      scene.activeCameras = [camera, observe_camera];

      const light = new BABYLON.DirectionalLight("dir01", new BABYLON.Vector3(0, -1, 1), scene);
      light.position = new BABYLON.Vector3(0, 1500, -30);

      const light2 = new BABYLON.HemisphericLight('light2', new BABYLON.Vector3(0, 10, 10), scene)
      light2.intensity = 0.7

      const shadowGenerator = new BABYLON.ShadowGenerator(4096, light);
      
      const ground = BABYLON.Mesh.CreateGround("ground", 100000, 100000, 1, scene);
      ground.checkCollisions= true;
      ground.receiveShadows = true

      camera.applyGravity = true;
      scene.gravity = new BABYLON.Vector3(0, -9.81, 0);

      camera.checkCollisions = true;
      camera.ellipsoid = new BABYLON.Vector3(1, 1, 1); // 调整椭球的半径，以便在移动时防止直接贴在地面上
      


      light.intensity = 0.7;

      light.shadowEnabled = true;

      camera.attachControl(canvas, true);


      // const character_builder = new BABYLON.PolygonMeshBuilder("polygon", 
          // [new BABYLON.Vector3(1, 0, 0),
          // new BABYLON.Vector3(-1, 0, 0),
          // new BABYLON.Vector3(0, 0, 10 )],
          // scene, earcut
      // );

      // const character = character_builder.build()

      // var character = BABYLON.MeshBuilder.CreatePolygon("polygon", {
      //   shape: [new BABYLON.Vector3(1, 0, 0),
      //     new BABYLON.Vector3(-1, 0, 0),
      //     new BABYLON.Vector3(0, 0, 10 )],
      // }, scene, earcut
      // )
      
      const character = BABYLON.MeshBuilder.CreateLines("zAxis", {
        points: [new BABYLON.Vector3(0,0,0), new BABYLON.Vector3(0, 0, 10)],
    }, scene);
  
      

      const material = new BABYLON.StandardMaterial("material", scene);
      material.diffuseColor = new BABYLON.Color3(0, 1, 0); // 设置为绿色
      
      character.material = material
      character.scaling = new BABYLON.Vector3(10, 10,10)
      character.material = material
      // character.parent = camera

      window.this_box = character


      character.layerMask = 0x0000FFFF
      camera.layerMask = 0xFFFF0000
      observe_camera.layerMask = 0x000FF000

      scene.onBeforeRenderObservable.add(()=>{

        camera.rotation
        
        const direction = new BABYLON.Vector3(0, 0, 1)

        // character = line

        // character.lookAt(new BABYLON.Vector3(cam_direction.x, 0, cam_direction.z))
        character.position = camera.position.clone()
        character.position.y = 10

        // character.rotation = camera.rotation

        const _vec = new BABYLON.Vector3(0, 0, 1)
        
        let {x, y, z} = camera.rotation

        _vec.applyRotationQuaternionInPlace(BABYLON.Quaternion.FromEulerAngles(x, y, z))

        

        character.lookAt(new BABYLON.Vector3(_vec.x + character.position.x, character.position.y, _vec.z + character.position.z))

        observe_camera.position = camera.position.clone()
        observe_camera.position.y = 300
        // line.rotation = camera.rotation
        // console.log('the cam dir', camera.rotation)
      })

      function createAxisIndicators(mesh: BABYLON.Mesh, scale: number) {
        // 获取 mesh 的绝对位置
        const meshPosition = mesh.position
      
        // 创建X轴箭头并设置位置
        const xAxis = BABYLON.MeshBuilder.CreateLines("xAxis", {
          points: [meshPosition, new BABYLON.Vector3(meshPosition.x + 1, meshPosition.y, meshPosition.z)],
          updatable: false,
          instance: null
        }, scene);
        xAxis.color = new BABYLON.Color3(1, 0, 0);
      
        // 创建Y轴箭头并设置位置
        const yAxis = BABYLON.MeshBuilder.CreateLines("yAxis", {
          points: [meshPosition, new BABYLON.Vector3(meshPosition.x, meshPosition.y + 1, meshPosition.z)],
          updatable: false,
          instance: null
        }, scene);
        yAxis.color = new BABYLON.Color3(0, 1, 0);
      
        // 创建Z轴箭头并设置位置
        const zAxis = BABYLON.MeshBuilder.CreateLines("zAxis", {
          points: [meshPosition, new BABYLON.Vector3(meshPosition.x, meshPosition.y, meshPosition.z + 1)],
          updatable: false,
          instance: null
        }, scene);
        zAxis.color = new BABYLON.Color3(0, 0, 1);
      }
          // Our built-in 'sphere' shape.
    const sphere = BABYLON.MeshBuilder.CreateSphere("sphere", {diameter: 10, segments: 32}, scene);
    sphere.checkCollisions = true




    engine.runRenderLoop(function () {
      scene.render();
});


      async function loadModels() {
        return new Promise(async (resolve, reject) => {
    
            // 从URL中获取查询字符串
          const queryString = window.location.search;
    
          // 解析查询字符串以获取经纬度参数
          const urlParams = new URLSearchParams(queryString);
          const origin_latitude = parseFloat(urlParams.get('lat')) || 0;
          const origin_longitude = parseFloat(urlParams.get('lon')) || 0;
    
          // 使用经纬度参数构建请求URL
          // const response = await axios.get(`http://${window.location.hostname}:5000/get_items_for_location?lat=${latitude}&lon=${longitude}`);
          const response = await axios.get(`http://${window.location.hostname}:5000/get_items_for_location?lat=${origin_latitude}&lon=${origin_longitude}`); 
    
          // const tilesetData = response.data;
          const kmlData = response.data
    
          // const modD = parseTilesetData(tilesetData); // 假设有一个解析函数来处理tilesetData
    
          const modD = parseKmlData(kmlData)
    
    
          const assetsManager = new BABYLON.AssetsManager(scene);
    
          let progress = 0
    
          modD.forEach(item => {
            const { filename, latitude, longitude } = item;
      
            const meshTask = assetsManager.addMeshTask(filename, '', '/data/', filename);
      
            meshTask.onSuccess = task => {
              
              progress ++
              console.log(progress)
    
              const meshes = task.loadedMeshes;
      
              const modelAltitude = 0;
              const modelCoords = mapboxgl.MercatorCoordinate.fromLngLat({lon: longitude, lat:latitude}, modelAltitude);
              console.log(modelCoords)
              const scale = modelCoords.meterInMercatorCoordinateUnits();
              
              
              meshes.forEach(mesh => {
                shadowGenerator.addShadowCaster(mesh, true)
                
                mesh.checkCollisions = true
                if (mesh.id !== '__root__') {
                  
                  return
                }
      
                mesh.receiveShadows = true
                
                mesh.position = new BABYLON.Vector3(modelCoords.x /scale -origin_coord.x/origin_scale, 0, modelCoords.y /scale -origin_coord.y / origin_scale);
                
    
            // 第一个旋转：绕 X 轴旋转 Math.PI / 2（90度）
            const rotationX = BABYLON.Quaternion.FromEulerAngles(Math.PI / 2, 0, 0);

            // 第二个旋转：绕 Z 轴旋转 Math.PI / 4（45度）
            const rotationZ = BABYLON.Quaternion.FromEulerAngles(0, 0,  -Math.PI / 4 );

            // 将两个旋转组合起来
            const combinedRotation = rotationZ.multiply(rotationX);

            // 将组合后的旋转应用于 mesh
            // mesh.rotationQuaternion = rotationX;

                // 将组合后的旋转应用于 mesh
                // mesh.rotationQuaternion = rotationX;
    
                // mesh.scaling = new BABYLON.Vector3(scale, scale, scale);
    
                
                // console.log(mesh.position)
    
    
              createAxisIndicators(mesh,scale)
    
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

      await loadModels()

      

    })()

  }, [])

  return <>
  </>
}


createRoot(document.getElementById('root')!).render(<App></App>);






function parseKmlData(kmlData: {
  [fileId: string]: {
    envelope: [number, number, number, number];
    tile: [number, number];
};

}) {
  const modelData: { filename:string, latitude:number, longitude:number }[] = [];
  Object.keys(kmlData).forEach(( fileId )=>{
    const envelope = kmlData[fileId].envelope 
    const latitude = (envelope[1]) 
    const longitude = (envelope[0])

    const filename = fileId + '.gltf'

    modelData.push({
      filename: filename,
      latitude: latitude,
      longitude: longitude
    })

  })
  return modelData
}