import React from 'react';
import ReactDOM from 'react-dom';
import * as mapboxgl from 'mapbox-gl';
//import './mapbox-gl.css';

const App = () => {
  return <>
    <div>nothisng</div>
  </>;
};

ReactDOM.render(<App />, document.getElementById('root'));




mapboxgl.accessToken = 'pk.eyJ1IjoibWFwYm94LWdsLWpzIiwiYSI6ImNram9ybGI1ajExYjQyeGxlemppb2pwYjIifQ.LGy5UGNIsXUZdYMvfYRiAQ'
new mapboxgl.Map({
    container: 'A',
    zoom: 12.5,
    center: [-122.4194, 37.7749],
    hash: true,
});
