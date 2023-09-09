import React, { useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import * as mapboxgl from 'mapbox-gl';

import 'mapbox-gl/dist/mapbox-gl.css';

import * as BABYLON from '@babylonjs/core'

import "@babylonjs/loaders";

import { CustomLayerInterface, LngLatLike } from 'mapbox-gl';


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
    console.log('执行了一次')
    mapboxgl.accessToken = 'pk.eyJ1IjoibWFwYm94LWdsLWpzIiwiYSI6ImNram9ybGI1ajExYjQyeGxlemppb2pwYjIifQ.LGy5UGNIsXUZdYMvfYRiAQ'
    const map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/light-v10',
      zoom: 18,
      center: [148.9819, -35.3981],
      pitch: 60,
      antialias: true // create the gl context with MSAA antialiasing, so custom layers are antialiased
  });

    map.on('load', () => {
      console.log('检测')
      const babylonLayer = new BabylonLayer('babylon-layer-2');
      map.addLayer(babylonLayer);
    });

  }, [])
  return <>
  </>
}


createRoot(document.getElementById('root')!).render(<App></App>);


class BabylonLayer implements CustomLayerInterface {
  readonly id: string;
  readonly type: 'custom' = 'custom';
  readonly renderingMode: '3d' = '3d';

  private map: Map | undefined;
  private scene: BABYLON.Scene | undefined;
  private camera: BABYLON.Camera | undefined;
  private modelMatrix: BABYLON.Matrix | undefined;

  constructor(id: string) {
    this.id = id;
  }

  onAdd = (map: Map, gl: WebGLRenderingContext) => {
    this.map = map;
    const engine = new BABYLON.Engine(gl, true, {
      useHighPrecisionMatrix: true
    }, true);

    this.scene = new BABYLON.Scene(engine);
    this.scene.autoClear = false;
    this.scene.detachControl();
    this.scene.beforeRender = function(){
      engine.wipeCaches(true);
    }
    this.camera = new BABYLON.Camera("mapbox-camera", new BABYLON.Vector3(), this.scene);
    const light = new BABYLON.HemisphericLight("mapbox-light", BABYLON.Vector3.One(), this.scene);

    BABYLON.SceneLoader.Append("/", "TORONTO3D_mesh_2.gltf", this.scene);

    // parameters to ensure the model is georeferenced correctly on the map
    const modelOrigin = [148.9819, -35.39847] as LngLatLike;
    const modelAltitude = 0;
    const modelRotate = [Math.PI / 2, 0, 0];
    const modelCoords = mapboxgl.MercatorCoordinate.fromLngLat(
        modelOrigin,
        modelAltitude
    );
    const modelScale = modelCoords.meterInMercatorCoordinateUnits();

    this.modelMatrix = BABYLON.Matrix.Compose(
      new BABYLON.Vector3(modelScale, modelScale, modelScale),
      BABYLON.Quaternion.FromEulerAngles(modelRotate[0], modelRotate[1], modelRotate[2]),
      new BABYLON.Vector3(modelCoords.x, modelCoords.y, modelCoords.z)
    );
  }

  render = (gl: WebGLRenderingContext, matrix: number[]) => {
    // projection & view matrix
    const cameraMatrix = BABYLON.Matrix.FromArray(matrix);
    const mvpMatrix = this.modelMatrix!.multiply(cameraMatrix);
    this.camera!.freezeProjectionMatrix(mvpMatrix);

    this.scene!.render(false);
    this.map!.triggerRepaint();
  }
}
