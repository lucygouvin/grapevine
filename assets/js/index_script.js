console.log("index_script.js is running")

mapboxgl.accessToken = 'pk.eyJ1IjoibHVjeWdvdXZpbiIsImEiOiJjbGswYzBpN28wNjB5M2tyY3p4N2FkZ2w2In0.j5zYh-z5brFrxATwtomcMg';
const map = new mapboxgl.Map({
container: 'map', // container id
// Choose from Mapbox's core styles, or make your own style with Mapbox Studio
style: 'mapbox://styles/mapbox/streets-v12',
center: [-74.5, 40], // starting position
zoom: 9 // starting zoom
});

var lon
var lat

$("#map").on("click", function(e){
    console.log("lat: "+lat)
    console.log("lon: " +lon)
})

map.on('mousemove', (e) => {

lon = e.lngLat.lng
lat = e.lngLat.lat

});
