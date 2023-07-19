// GLOBAL VARIABLES
var lon;
var lat;
var crimeCategory;
var crimePercentile;
var mapNorth = 37.81098;
var mapWest = -122.483716;
var mapSouth = 37.732007;
var mapEast = -122.370076;
var cityName = "San Francisco";
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

map.on("load", function () {
  map.resize();
});

$(function () {
  $("#City-Modal").dialog({
    position: { my: "center bottom-100%", at: "center bottom", of: $("#map") },
    width: 550,
    closeText: "X",
  });
  $(".ui-dialog").css("display", "none");
});

// CHANGE MAP VIEW
// Get new bounds from the button that was clicked
$("a").on("click", function (e) {
  e.preventDefault;
  mapWest = parseFloat(e.target.getAttribute("data-west"));
  mapEast = parseFloat(e.target.getAttribute("data-east"));
  mapSouth = parseFloat(e.target.getAttribute("data-south"));
  mapNorth = parseFloat(e.target.getAttribute("data-north"));
  cityName = e.target.textContent;
  var avgLat = (mapSouth + mapNorth) / 2;
  var avgLon = (mapEast + mapWest) / 2;

  const bounds = [
    [mapWest, mapSouth],
    [mapEast, mapNorth],
  ];
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
  getAuthToken(); //AuthToken for Amadeus stats, automatidally goes to get safety stats
  getPollution(lat, lon); //Get air pollution data
  getRiskData(lat, lon); //Get crime rate data
  localStorage.setItem("latitude", lat);
  localStorage.setItem("longitude", lon);
  $("#City-Modal").dialog("option", "title", cityName);
  $(".ui-dialog").css("display", "block");
});

// GET AUTHORIZATION TOKEN FOR AMADEUS, THEN GET SAFETY STATS
function getAuthToken() {
  fetch("https://test.api.amadeus.com/v1/security/oauth2/token", {
    method: "POST",
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: "fVizsTLL8V8dE2jGcoq8mj1ETYQ87DY3",
      client_secret: "B7vAx8AQGk1gHpz7",
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
        if (data.data) {
          $(".likelihoodHeader").text("Likelihood of harm:");
          $(".safetyStats").css("display", "block");
          $("#overall").text(
            "Overall safety score: " +
              categorizeData(data.data[0].safetyScores.overall)
          );
          $("#lgbtq").text(
            "Harm to LGBTQ people: " +
              categorizeData(data.data[0].safetyScores.lgbtq)
          );
          $("#medical").text(
            "Illness: " + categorizeData(data.data[0].safetyScores.medical)
          );
          $("#women").text(
            "Harm to women: " + categorizeData(data.data[0].safetyScores.women)
          );
          $("#poliFreedom").text(
            "Politcal unrest: " +
              categorizeData(data.data[0].safetyScores.politicalFreedom)
          );
        } else {
          $(".likelihoodHeader").text("");
          $("#overall").text("No safety data available for this location");
          $("#lgbtq").text("");
          $("#medical").text("");
          $("#women").text("");
          $("#poliFreedom").text("");
        }
      });
  }
}

function categorizeData(num) {
  var categories = ["Very Low", "Low", "Moderate", "High", "Very High"];
  var index = Math.floor(num / 20);
  return categories[index];
}

// GET AIR POLLUTION FOR AN AREA
function getPollution(lat, lon) {
  fetch(
    `http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=59939906650b56969f54c525743fa617`
  )
    .then((response) => response.json())
    .then((data) => {
      // console.log(data);

      //ACTUAL FUNCTIONALITY BELOW//
      if (data.list[0].main.aqi === 1) {
        $("#air").text("Air Quality: Good");
      } else if (data.list[0].main.aqi === 2) {
        $("#air").text("Air Quality: Fair");
      } else if (data.list[0].main.aqi === 3) {
        $("#air").text("Air Quality: Moderate");
      } else if (data.list[0].main.aqi === 4) {
        $("#air").text("Air Quality: Poor");
      } else if (data.list[0].main.aqi === 5) {
        $("#air").text("Air Quality: Very Poor");
      }
    });
}

// GET CRIME RISK PRECISELY API TOKEN
function getRiskData(data) {
  fetch("https://api.precisely.com/oauth/token", {
    method: "POST",
    headers: {
      Authorization: `Basic RjdzUEduaEFSR1Q1WEpsbWo3a29CdE5PMGtSUFZhdVo6dE9LMFZsamdjZm5kVjl6dA`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  })
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      riskResponse(data);
      // console.log(data);
    });
}

// GET CRIME RISK DATA FOR AN AREA
function riskResponse(data) {
  var riskToken = data.access_token;
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
      if (data) {
        // console.log(data);
        // console.log(data.themes[0].crimeIndexTheme.indexVariable[0].category);
        var crimeCategory =
          data.themes[0].crimeIndexTheme.indexVariable[0].category;

        // console.log(data.themes[0].crimeIndexTheme.indexVariable[0].percentile);
        var crimePercentile =
          data.themes[0].crimeIndexTheme.indexVariable[0].percentile;

        $("#percentile").text(
          "Crime Rate Percentile: " +
            data.themes[0].crimeIndexTheme.indexVariable[0].percentile
        );
      } else {
        $("#percentile").text("No crime rate data for this area");
      }
    });
}

// Favorite Button Allows User to Save Searches to Local Storage
$("#faveBtn").click(function (event) {
  event.preventDefault;

  localStorage.setItem("latitude north", mapNorth);
  localStorage.setItem("latitude south", mapSouth);
  localStorage.setItem("longitude east", mapEast);
  localStorage.setItem("longitude west", mapWest);
});

// Retrieving from Local Storage and Displaying on UI

if (
  localStorage.getItem("latitude north") &&
  localStorage.getItem("latitude south") &&
  localStorage.getItem("longitude east") &&
  localStorage.getItem("longitude west")
) {
  var lsNorth = parseFloat(localStorage.getItem("latitude north"));
  var lsSouth = parseFloat(localStorage.getItem("latitude south"));
  var lsEast = parseFloat(localStorage.getItem("longitude east"));
  var lsWest = parseFloat(localStorage.getItem("longitude west"));
  const bounds = [
    [lsWest, lsSouth],
    [lsEast, lsNorth],
  ];
  var center = [(lsEast + lsWest) / 2, (lsNorth + lsSouth) / 2];
  // Reset the map bounds and pan to it
  map.setMaxBounds(bounds);
  map.panTo(center);
}
