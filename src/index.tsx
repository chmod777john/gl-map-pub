import React, { useEffect, useState } from 'react'

import * as mapboxgl from 'mapbox-gl'
import { createRoot } from 'react-dom/client'

import 'mapbox-gl/dist/mapbox-gl.css'

import * as BABYLON from '@babylonjs/core'
import * as GUI from '@babylonjs/gui'

import "@babylonjs/loaders"

import axios from 'axios'

import earcut from 'earcut'

declare const DATASET: string

const App = () => {
  return <>
    <canvas id='babylon-container' style={{
      height: "100%",
      width: "100%"
    }}></canvas>
    <Playground></Playground>
  </>
}

const Playground = () => {
  const [currentFilename, setCurrentFilename] = useState(null)

  useEffect(() => {
    console.log(DATASET)
    const canvas = document.getElementById("babylon-container")
    if (!(canvas instanceof HTMLCanvasElement)) return
    const engine = new BABYLON.Engine(
      canvas,
      true,
      {
        useHighPrecisionMatrix: true
      },
      true
    )

    const scene = new BABYLON.Scene(engine)
    scene.collisionsEnabled = true
    scene.shadowsEnabled = true
    
    const queryString = window.location.search

    const urlParams = new URLSearchParams(queryString)
    const latitude = parseFloat(urlParams.get('lat') || '0')
    const longitude = parseFloat(urlParams.get('lon') || '0')

    const origin_coord = mapboxgl.MercatorCoordinate.fromLngLat({ lon: longitude, lat: latitude }, 0)

    const origin_scale = origin_coord.meterInMercatorCoordinateUnits()

    const camera = new BABYLON.FreeCamera("camera", new BABYLON.Vector3(10, 3, 10), scene)
    camera.onCollide = (mesh) => {
      if (!mesh.metadata)
        return

      const { filename } = mesh.metadata
      console.log(filename)
      if (!(currentFilename === filename))
        setCurrentFilename(filename)

    }

    const observe_camera = new BABYLON.FreeCamera("camera", new BABYLON.Vector3(0, 300, 0), scene)


    camera.setTarget(new BABYLON.Vector3(0, -1, 0))

    observe_camera.setTarget(new BABYLON.Vector3(0, 0, 0))
    observe_camera.viewport = new BABYLON.Viewport(0.8, 0.8, 0.2, 0.2)

    scene.activeCameras = [camera, observe_camera]

    const light = new BABYLON.DirectionalLight("dir01", new BABYLON.Vector3(0, -1, 1), scene)
    light.position = new BABYLON.Vector3(0, 1500, -30)

    const light2 = new BABYLON.HemisphericLight('light2', new BABYLON.Vector3(0, 10, 10), scene)
    light2.intensity = 0.7

    const shadowGenerator = new BABYLON.ShadowGenerator(4096, light)

    const skybox_size = 3000
    const skydome = BABYLON.MeshBuilder.CreateBox("sky", { size: skybox_size, sideOrientation: BABYLON.Mesh.BACKSIDE }, scene)

    skydome.isPickable = false
    skydome.receiveShadows = true
    skydome.position.y = skybox_size / 2
    const sky = new BABYLON.BackgroundMaterial("skyMaterial", scene)
    sky.reflectionTexture = new BABYLON.CubeTexture("./skybox/skybox", scene)
    sky.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE
    sky.enableGroundProjection = true
    sky.projectedGroundRadius = skybox_size
    sky.projectedGroundHeight = skybox_size / 30
    skydome.material = sky

    skydome.checkCollisions = true
    skydome.receiveShadows = true
    camera.applyGravity = true
    scene.gravity = new BABYLON.Vector3(0, -9.81, 0)

    camera.checkCollisions = true
    camera.ellipsoid = new BABYLON.Vector3(1, 1, 1) // 调整椭球的半径，以便在移动时防止直接贴在地面上

    const label = new GUI.Rectangle()
    label.width = "240px"
    label.height = "200px"
    label.cornerRadius = 20
    label.color = "white"
    label.thickness = 4
    label.background = "black"
    label.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT
    label.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM
    label.top = "10px"
    label.left = "10px"
    label.paddingBottom = "50px" 
    label.zIndex = 5
    label.alpha = 0.7
    const labelContent = new GUI.TextBlock()
    labelContent.text = "FPC mode\nLeft arrow key: move left\nRight arrow key: move right\nUp arrow key: move forward\nDown arrow key: move\nbackward\nMouse: rotate"
    labelContent.color = "white"
    labelContent.fontSize = 16
    label.addControl(labelContent)
    const advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI")
    advancedTexture.addControl(label)

    light.intensity = 0.7

    light.shadowEnabled = true

    camera.attachControl(canvas, true)

    const character = BABYLON.MeshBuilder.CreatePolygon("polygon", {
      shape: [new BABYLON.Vector3(1, 0, 0),
      new BABYLON.Vector3(-1, 0, 0),
      new BABYLON.Vector3(0, 0, 10)],
    }, scene, earcut
    )

    const material = new BABYLON.StandardMaterial("material", scene)
    material.diffuseColor = new BABYLON.Color3(0, 1, 0)

    character.material = material
    character.scaling = new BABYLON.Vector3(10, 10, 10)
    character.material = material

    character.layerMask = 0x0000FFFF
    camera.layerMask = 0xFFFF0000
    advancedTexture.layer!.layerMask = 0xFFF00FFF
    observe_camera.layerMask = 0x000FF000

    scene.onBeforeRenderObservable.add(() => {

      camera.rotation
      character.position = camera.position.clone()
      character.position.y = 10


      const _vec = new BABYLON.Vector3(0, 0, 1)

      let { x, y, z } = camera.rotation

      _vec.applyRotationQuaternionInPlace(BABYLON.Quaternion.FromEulerAngles(x, y, z))



      character.lookAt(new BABYLON.Vector3(_vec.x + character.position.x, character.position.y, _vec.z + character.position.z), 0, 0, Math.PI / 4)

      observe_camera.position = camera.position.clone()
      observe_camera.position.y = 300
    })

    function createAxisIndicators(mesh: BABYLON.AbstractMesh) {
      // 获取 mesh 的绝对位置
      const meshPosition = mesh.position

      // 创建X轴箭头并设置位置
      const xAxis = BABYLON.MeshBuilder.CreateLines("xAxis", {
        points: [meshPosition, new BABYLON.Vector3(meshPosition.x + 1, meshPosition.y, meshPosition.z)],
        updatable: false,
        instance: null
      }, scene)
      xAxis.color = new BABYLON.Color3(1, 0, 0)

      // 创建Y轴箭头并设置位置
      const yAxis = BABYLON.MeshBuilder.CreateLines("yAxis", {
        points: [meshPosition, new BABYLON.Vector3(meshPosition.x, meshPosition.y + 1, meshPosition.z)],
        updatable: false,
        instance: null
      }, scene)
      yAxis.color = new BABYLON.Color3(0, 1, 0)

      // 创建Z轴箭头并设置位置
      const zAxis = BABYLON.MeshBuilder.CreateLines("zAxis", {
        points: [meshPosition, new BABYLON.Vector3(meshPosition.x, meshPosition.y, meshPosition.z + 1)],
        updatable: false,
        instance: null
      }, scene)
      zAxis.color = new BABYLON.Color3(0, 0, 1)
    }
    const sphere = BABYLON.MeshBuilder.CreateSphere("sphere", { diameter: 10, segments: 32 }, scene)
    sphere.checkCollisions = true



    engine.runRenderLoop(function () {
      scene.render()
    })
    function getMemoryUsage() {
      if ('memory' in performance) {
          return (performance.memory as any).usedJSHeapSize
      } 
      console.warn('The "performance.memory" API is not supported in this browser. Memory usage information cannot be retrieved.')
      return null
  }
  

    (async () => {
      const startTime = performance.now() // 获取开始加载时间
      const startMemory = getMemoryUsage() // 获取加载前的内存使用情况
      console.log('Memory before loading:', startMemory, 'bytes')

      async function loadModels() {
        return new Promise(async (resolve, reject) => {

          // 从URL中获取查询字符串
          const queryString = window.location.search

          // 解析查询字符串以获取经纬度参数
          const urlParams = new URLSearchParams(queryString)
          const origin_latitude = parseFloat(urlParams.get('lat') || '0')
          const origin_longitude = parseFloat(urlParams.get('lon') || '0')

          // 使用经纬度参数构建请求URL
          // const response = await axios.get(`http://${window.location.hostname}:5000/get_items_for_location?lat=${latitude}&lon=${longitude}`)
          const response = await axios.get(`http://${window.location.hostname}:5000/get_items_for_location?lat=${origin_latitude}&lon=${origin_longitude}`)

          // const tilesetData = response.data
          const kmlData = response.data

          // const modD = parseTilesetData(tilesetData) // 假设有一个解析函数来处理tilesetData

          const modD = parseKmlData(kmlData)


          const assetsManager = new BABYLON.AssetsManager(scene)

          let progress = 0

          modD.forEach(item => {
            const { filename, latitude, longitude } = item

            const meshTask = assetsManager.addMeshTask(filename, '', `/${DATASET}/`, filename)

            meshTask.onSuccess = task => {

              progress++
              console.log(progress)

              const meshes = task.loadedMeshes

              const modelAltitude = 0
              const modelCoords = mapboxgl.MercatorCoordinate.fromLngLat({ lon: longitude, lat: latitude }, modelAltitude)
              console.log(modelCoords)
              const scale = modelCoords.meterInMercatorCoordinateUnits()


              meshes.forEach(mesh => {
                mesh.metadata = item

                shadowGenerator.addShadowCaster(mesh, true)

                mesh.checkCollisions = true
                if (mesh.id !== '__root__') {

                  return
                }

                mesh.receiveShadows = true

                mesh.position = new BABYLON.Vector3(modelCoords.x / scale - origin_coord.x / origin_scale, 0, modelCoords.y / scale - origin_coord.y / origin_scale)

                createAxisIndicators(mesh)

              })
            }

            meshTask.onError = (task, message, exception) => {
              console.error(`Error loading model ${filename}:`, message, exception)
              reject(task.errorObject)
            }
          })

          assetsManager.onFinish = tasks => {
            console.log('All tasks completed successfully.')

            const endTime = performance.now() // 获取加载结束时间
            const loadTime = endTime - startTime // 计算加载时间
            console.log('Total load time:', loadTime.toFixed(2), 'milliseconds')


            const endMemory = getMemoryUsage() // 获取加载后的内存使用情况
            console.log('Memory after loading:', endMemory, 'bytes')

            const resourceUsage = endMemory - startMemory // 计算加载模型所占用的资源
            console.log('Resource usage:', resourceUsage, 'bytes')


            resolve(tasks)
          }

          assetsManager.onTaskError = task => {

            console.error(`Task error for ${task.name}:`, task.errorObject)
            reject(task.errorObject)
          }

          assetsManager.load()
        })
      }

      await loadModels()



    })()

    return
  }, [])

  return (
    <>
      {true && (
        <div style={{
          position: 'absolute',
          top: 10,
          left: 10,
          padding: '5px 10px',
          borderRadius: 5,
          zIndex: 9999,
          color: 'red',
          fontSize: 32
        }}>
          ID: {currentFilename}
        </div>
      )}
    </>
  )

}

createRoot(document.getElementById('root')!).render(<App></App>)

function parseKmlData(kmlData: {
  [fileId: string]: {
    envelope: [number, number, number, number]
    tile: [number, number]
  }

}) {
  const modelData: { filename: string, latitude: number, longitude: number }[] = []
  Object.keys(kmlData).forEach((fileId) => {
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