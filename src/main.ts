import * as mapboxgl from 'mapbox-gl';

mapboxgl.accessToken = getAccessToken();

function getAccessToken() {
    var accessToken = (
        undefined ||
        undefined ||
        getURLParameter('access_token') ||
        localStorage.getItem('accessToken') ||
        // this token is a fallback for CI and testing. it is domain restricted to localhost
        'pk.eyJ1IjoibWFwYm94LWdsLWpzIiwiYSI6ImNram9ybGI1ajExYjQyeGxlemppb2pwYjIifQ.LGy5UGNIsXUZdYMvfYRiAQ'
    );
    try {
        localStorage.setItem('accessToken', accessToken);
    } catch (_) {}
    return accessToken;
}

function getURLParameter(name) {
    var regexp = new RegExp('[?&]' + name + '=([^&#]*)', 'i');
    var output = regexp.exec(window.location.href);
    return output && output[1];
}

export function createMap () {
    new mapboxgl.Map({
        container: 'map',
        zoom: 12.5,
        center: [-122.4194, 37.7749],
        //hash: true,
      })
}

createMap()
