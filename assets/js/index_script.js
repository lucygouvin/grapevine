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
    var address = getAddress(lat,lon)
    
    getWalkScore(lat, lon, address)
})

map.on('mousemove', (e) => {

lon = e.lngLat.lng
lat = e.lngLat.lat


});

// Use Geocodify to reverse geocode in order to get an address to use with walk score
var geocodifyAPI = "926f258af28cb7ac81d46148e4575f02cf08b499"

function getAddress(lat, lon){
    if(lat && lon){
        var geocodifyURL = new URL("https://api.geocodify.com/v2/reverse")
        geocodifyURL.searchParams.append("api_key", geocodifyAPI)
        geocodifyURL.searchParams.append("lat", lat)
        geocodifyURL.searchParams.append("lng", lon)

        fetch(geocodifyURL)
        .then(function(response){
            console.log(response)
            response.json().then(function(data){
                    var address = data.response.features[0].properties.label
                    console.log(address)
                    return(address)
                })
            }
        )
    }
}

// Take address from Geocodify, pass to Walk Score
var walkScoreAPI= "a8a76ee5ddc4bc92883fc4122373ec33"

function getWalkScore(lat, lon, address){
    console.log(lat)
    console.log(lon)
    console.log(address)
    if (lat && lon && address){
      var walkScoreURL = new URL("https://api.walkscore.com/score");
      walkScoreURL.searchParams.append("format", "json");
      walkScoreURL.searchParams.append("address", address);
      walkScoreURL.searchParams.append("lat", lat);
      walkScoreURL.searchParams.append("lon", lon);
      walkScoreURL.searchParams.append("apikey", walkScoreAPI);

      fetch(walkScoreURL).then(function (response) {
        return response.json()
        
      }).then(function (data) {
        console.log(data);
      }).catch(function(err){
        console.log(err)
      });
    }

    
}