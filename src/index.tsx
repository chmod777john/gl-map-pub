import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import * as mapboxgl from 'mapbox-gl';
//import './mapbox-gl.css';

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
    mapboxgl.accessToken = 'pk.eyJ1IjoibWFwYm94LWdsLWpzIiwiYSI6ImNram9ybGI1ajExYjQyeGxlemppb2pwYjIifQ.LGy5UGNIsXUZdYMvfYRiAQ'
    new mapboxgl.Map({
        container: 'map',
        zoom: 12.5,
        center: [-122.4194, 37.7749],
        hash: true,
    });        
  }, [])
  return <>
  </>
}


createRoot(document.getElementById('root')).render(<App></App>);
