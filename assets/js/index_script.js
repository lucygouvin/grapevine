console.log("index_script.js is running");

mapboxgl.accessToken =
  "pk.eyJ1IjoibHVjeWdvdXZpbiIsImEiOiJjbGswYzBpN28wNjB5M2tyY3p4N2FkZ2w2In0.j5zYh-z5brFrxATwtomcMg";
  const bounds = [
    [-122.483716, 37.732007], // Southwest coordinates
    [-122.370076, 37.810980] // Northeast coordinates
    ];
  const map = new mapboxgl.Map({
  container: "map", // container id
  // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
  style: "mapbox://styles/mapbox/streets-v12",
  center: [-122.483716, 37.732007], // starting position
  zoom: 9, // starting zoom
});

var lon;
var lat;

map.on("mousemove", (e) => {
  lon = e.lngLat.lng;
  lat = e.lngLat.lat;
});

$("#map").on("click", function (e) {
  console.log("lat: " + lat);
  console.log("lon: " + lon);
  getAuthToken()
});

function getAuthToken(){
console.log("running")
fetch('https://test.api.amadeus.com/v1/security/oauth2/token', {
    method: 'POST',
    body: new URLSearchParams({
        'grant_type': 'client_credentials',
        'client_id': 'AH16AW42PJimckbRBSsWHMEdxRK5Sw5e',
        'client_secret': 'y23o1seCk1n1jLfh'
    })
}).then(function(response){
    return response.json();
})
.then (function(data){
    console.log(data)
    var token = data.access_token
    console.log(token)
    getSafetyData(lat, lon, token)

    

});

}

function getSafetyData(lat, lon, token) {
if(lat && lon){
    var amadeusURL = new URL("https://test.api.amadeus.com/v1//safety/safety-rated-locations");
    amadeusURL.searchParams.append("latitude", lat)
    amadeusURL.searchParams.append("longitude", lon)
    amadeusURL.searchParams.append("page[limit]",1)

    fetch(amadeusURL,
        {
          headers: {
            "Authorization": "Bearer "+ token,
          },
        }
      )
        .then(function (response) {
          return response.json();
        })
        .then(function (data) {
          console.log(data.data[0].safetyScores);
        });
}

  
}
