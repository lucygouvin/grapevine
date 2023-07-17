// GLOBAL VARIABLES
var lon;
var lat;
var crimeCategory;
var crimePercentile;

// INSTANTIATE MAP INSTANCE
mapboxgl.accessToken =
  "pk.eyJ1IjoibHVjeWdvdXZpbiIsImEiOiJjbGswYzBpN28wNjB5M2tyY3p4N2FkZ2w2In0.j5zYh-z5brFrxATwtomcMg";
// When the page first loads, constrain it to San Francisco
const bounds = [
  [-122.483716, 37.732007], //West, South coordinates
  [-122.370076, 37.81098], // East, North coordinates
];
const map = new mapboxgl.Map({
  container: "map", // container id
  style: "mapbox://styles/mapbox/streets-v12",
  center: [-122.426896, 37.7714935], // starting position
  zoom: 12, // starting zoom
  maxBounds: bounds,
});

map.on('load', function () {
  map.resize();
});


// CHANGE MAP VIEW
// Get new bounds from the button that was clicked
$("a").on("click", function (e) {
  var mapWest = parseFloat(e.target.getAttribute("data-west"));
  var mapEast = parseFloat(e.target.getAttribute("data-east"));
  var mapSouth = parseFloat(e.target.getAttribute("data-south"));
  var mapNorth = parseFloat(e.target.getAttribute("data-north"));
  var avgLat = (mapSouth + mapNorth) / 2;
  var avgLon = (mapEast + mapWest) / 2;

  const bounds = [
    [mapWest, mapSouth],
    [mapEast, mapNorth],
  ];
  console.log("🚀 ~ file: index_script.js:33 ~ bounds:", bounds)
  var center = [avgLon, avgLat];
  // Reset the map bounds and pan to it
  map.setMaxBounds(bounds);
  map.panTo(center);
});

// GET LATITUDE AND LONGITUDE
// As the mouse moves over the map, get the lat and longitude of where it is hovering
map.on("mousemove", function (e) {
  lon = e.lngLat.lng;
  lat = e.lngLat.lat;
});


// USE LAT AND LON TO GET LOCATION DATA
$("#map").on("click", function (e) {
  console.log("lat: " + lat);
  console.log("lon: " + lon);
  getAuthToken(); //AuthToken for Amadeus stats, automatidally goes to get safety stats 
  getPollution(lat, lon); //Get air pollution data
  getRiskData(lat, lon); //Get crime rate data
});

// GET AUTHORIZATION TOKEN FOR AMADEUS, THEN GET SAFETY STATS
function getAuthToken() {
  fetch("https://test.api.amadeus.com/v1/security/oauth2/token", {
    method: "POST",
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: "AH16AW42PJimckbRBSsWHMEdxRK5Sw5e",
      client_secret: "y23o1seCk1n1jLfh",
    }),
  })
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      var token = data.access_token;
      getSafetyData(lat, lon, token); //Get safety stats
    });
}

// GET SAFETY STATS FOR AN AREA
function getSafetyData(lat, lon, token) {
  if (lat && lon) {
    var amadeusURL = new URL(
      "https://test.api.amadeus.com/v1//safety/safety-rated-locations"
    );
    amadeusURL.searchParams.append("latitude", lat);
    amadeusURL.searchParams.append("longitude", lon);
    amadeusURL.searchParams.append("page[limit]", 1);

    fetch(amadeusURL, {
      headers: {
        Authorization: "Bearer " + token,
      },
    })
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        console.log(data)
        if (data.data) {
          console.log(data.data[0].safetyScores);
        } else {
          console.log("No data available for this location");
        }
      });
  }
}
// GET AIR POLLUTION FOR AN AREA
function getPollution(lat, lon) {
  fetch(
    `http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=59939906650b56969f54c525743fa617`
  )
    .then((response) => response.json())
    .then((data) => {
      console.log(data);

      if (data.list[0].main.aqi === 1) {
        alert("Air Quality is Good!");
      } else if (data.list[0].main.aqi === 2) {
        alert("Air Quality is Fair!");
      } else if (data.list[0].main.aqi === 3) {
        alert("Air Quality is Moderate!");
      } else if (data.list[0].main.aqi === 4) {
        alert("Air Quality is Poor!");
      } else if (data.list[0].main.aqi === 5) {
        alert("Air Quality is Very Poor!");
      }
    });
}

// GET CRIME RISK PRECISELY API TOKEN
function getRiskData(data) {
  fetch("https://api.precisely.com/oauth/token", {
    method: "POST",
    headers: {
      Authorization:
          `Basic RjdzUEduaEFSR1Q1WEpsbWo3a29CdE5PMGtSUFZhdVo6dE9LMFZsamdjZm5kVjl6dA`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  })
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      riskResponse(data);
      console.log(data);
    });
}

// GET CRIME RISK DATA FOR AN AREA
function riskResponse(data) {
  var riskToken =data.access_token
  fetch(
    `https://api.precisely.com/risks/v1/crime/bylocation?latitude=${lat}8&longitude=${lon}&type=all&includeGeometry=N`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${riskToken}`,
        //   "Content-Type": "application/x-www-form-urlencoded",
      },
      // body: ("grant_type=client_credentials")
    }
  )
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      console.log(data);
      console.log(data.themes[0].crimeIndexTheme.indexVariable[0].category);
      var crimeCategory =
        data.themes[0].crimeIndexTheme.indexVariable[0].category;

      console.log(data.themes[0].crimeIndexTheme.indexVariable[0].percentile);
      var crimePercentile =
        data.themes[0].crimeIndexTheme.indexVariable[0].percentile;
    });
}
