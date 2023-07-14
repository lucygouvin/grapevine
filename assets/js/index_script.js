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

var crimeCategory 
var crimePercentile

$("#map").on("click", function(e){
    console.log("lat: "+lat)
    console.log("lon: " +lon)

    getPollution(lat,lon);
    getRiskData(lat,lon);
   
    // Air Quality Index. Possible values: 1, 2, 3, 4, 5. Where 1 = Good, 2 = Fair, 3 = Moderate, 
    // 4 = Poor, 5 = Very Poor.
})

map.on('mousemove', (e) => {

lon = e.lngLat.lng
lat = e.lngLat.lat


});

function getPollution(lat, lon) {
    fetch(`http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=59939906650b56969f54c525743fa617`)
        .then(response => response.json())
        .then(data => {
            console.log(data)

            if(data.list[0].main.aqi === 1){
                alert("Air Quality is Good!")
            }else if (data.list[0].main.aqi === 2){
                alert("Air Quality is Fair!")
            }else if(data.list[0].main.aqi === 3){
                alert("Air Quality is Moderate!")
            }else if(data.list[0].main.aqi === 4){
                alert("Air Quality is Poor!")
            }else if(data.list[0].main.aqi === 5){
                alert("Air Quality is Very Poor!")
            }

        })
}


    function getRiskData(data){
        fetch("https://api.precisely.com/oauth/token", {
    method: "POST",
    headers: {
      "Authorization": "Basic RjdzUEduaEFSR1Q1WEpsbWo3a29CdE5PMGtSUFZhdVo6dE9LMFZsamdjZm5kVjl6dA",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: ("grant_type=client_credentials") 
  
  }).then(function (response) {
    return response.json();
  })
  .then(function (data) {
    riskResponse(data);
    console.log(data)
    })
    }
    
    function riskResponse(data){
        fetch(`https://api.precisely.com/risks/v1/crime/bylocation?latitude=${lat}8&longitude=${lon}&type=all&includeGeometry=N`,{
            method: "GET",
            headers: {
              "Authorization": "Bearer GHRMGo7wd7bmWhcjY2Xqr9G487Bf",
            //   "Content-Type": "application/x-www-form-urlencoded",
            },
            // body: ("grant_type=client_credentials") 
          
          }).then(function (response) {
            return response.json();
          })
          .then(function (data) {

            console.log(data)
            console.log(data.themes[0].crimeIndexTheme.indexVariable[0].category)
            var crimeCategory =data.themes[0].crimeIndexTheme.indexVariable[0].category
           
            console.log(data.themes[0].crimeIndexTheme.indexVariable[0].percentile)
            var crimePercentile = data.themes[0].crimeIndexTheme.indexVariable[0].percentile
            })
    }

