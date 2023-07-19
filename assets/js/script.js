// Declare global variables
var lon; // longitude
var lat; // latitude
var crimeCategory; // category of crime
var crimePercentile; // crime percentile
var mapNorth = 37.81098; // northern boundary of the map
var mapWest = -122.483716; // western boundary of the map
var mapSouth = 37.732007; // southern boundary of the map
var mapEast = -122.370076; // eastern boundary of the map
var cityName = "San Francisco"; // current city name

// API key for Mapbox
mapboxgl.accessToken =
  "pk.eyJ1IjoibHVjeWdvdXZpbiIsImEiOiJjbGswYzBpN28wNjB5M2tyY3p4N2FkZ2w2In0.j5zYh-z5brFrxATwtomcMg";

// Define initial bounds of the map
// When the page first loads, constrain it to San Francisco
const bounds = [
  [mapWest, mapNorth], //West, South coordinates
  [mapEast, mapSouth], // East, North coordinates
];

// Instantiate a new Mapbox map
const map = new mapboxgl.Map({
  container: "map", // container id 
  style: "mapbox://styles/mapbox/streets-v12", // map style
  center: [(mapWest+mapEast)/2, (mapNorth+mapSouth)/2], // starting position
  zoom: 12, // starting zoom
  maxBounds: bounds, // constrain the map to these bounds
});

// When the map loads, resize it to fit the container
map.on("load", function () {
  map.resize();
});

// Initialize city modal dialog with custom position and width
$(function () {
  $("#City-Modal").dialog({
    position: { my: "center bottom-100%", at: "center bottom", of: $("#map") },
    width: screen.width < 550 ? "50%" : 550,
    closeText: "X",
  });
  $(".ui-dialog").css("display", "none");
});

// Attach click event listener to the anchor tags
// CHANGE MAP VIEW
$("a").on("click", function (e) {
  e.preventDefault;
  // Get new bounds from the data attributes of the clicked anchor tag
  mapWest = parseFloat(e.target.getAttribute("data-west"));
  mapEast = parseFloat(e.target.getAttribute("data-east"));
  mapSouth = parseFloat(e.target.getAttribute("data-south"));
  mapNorth = parseFloat(e.target.getAttribute("data-north"));
  cityName = e.target.textContent;

  // Compute average latitude and longitude
  var avgLat = (mapSouth + mapNorth) / 2;
  var avgLon = (mapEast + mapWest) / 2;

  // Create new bounds
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

// Attach click event listener to the map
// USE LAT AND LON TO GET LOCATION DATA
$("#map").on("click", function (e) {
  getAuthToken(); //AuthToken for Amadeus stats, automatidally goes to get safety stats
  getPollution(lat, lon); //Get air pollution data
  getRiskData(lat, lon); //Get crime rate data

  // Store latitude and longitude in the local storage
  localStorage.setItem("latitude", lat);
  localStorage.setItem("longitude", lon);

  // Open the city modal dialog
  $("#City-Modal").dialog({
    position: { my: "center bottom-100%", at: "center bottom", of: $("#map") },
    title: cityName,
  });

  $("#City-Modal").dialog("open")
  $(".ui-dialog").css("display", "block");
});

// A function to get the authorization token from Amadeus API
function getAuthToken() {
  // Make a POST request to the Amadeus API's security endpoint
  fetch("https://test.api.amadeus.com/v1/security/oauth2/token", {
    method: "POST",
    // The body of the request contains the credentials for the Amadeus API
    body: new URLSearchParams({
      grant_type: "client_credentials", // The type of OAuth2 grant
      client_id: "BbMH5XJupUUcOHxKonQBhuCGjJNbKAao", // The API Key
      client_secret: "Xb7HbQSJ4LBZmdC9", // The client secret
    }),
  })
    .then(function (response) {
      return response.json(); // Parse the response as JSON
    })
    .then(function (data) {
      var token = data.access_token; // Extract the access token from the JSON data
      // Call the getSafetyData function to get safety data, passing in the latitude, longitude, and the access token
      getSafetyData(lat, lon, token); //Get safety stats
    });
}

// GET SAFETY STATS FOR AN AREA
function getSafetyData(lat, lon, token) {
  // If the latitude and longitude are provided, proceed
  if (lat && lon) {
    // Create a URL object for the Amadeus safety API endpoint
    var amadeusURL = new URL(
      "https://test.api.amadeus.com/v1//safety/safety-rated-locations"
    );
    // Append the latitude and longitude to the query string of the URL
    amadeusURL.searchParams.append("latitude", lat);
    amadeusURL.searchParams.append("longitude", lon);
    // Limit the response to 1 result
    amadeusURL.searchParams.append("page[limit]", 1);

    // Make a GET request to the constructed URL
    fetch(amadeusURL, {
      // Include the Authorization header in the request, using the token
      headers: {
        Authorization: "Bearer " + token,
      },
    })
      .then(function (response) {
        return response.json(); // Parse the response as JSON
      })
      .then(function (data) {
        // If data exists in the response, proceed
        if (data.data) {
          // Display the "Likelihood of harm" header
          $(".likelihoodHeader").html("Likelihood of harm:");
          // Make the safety stats visible
          $(".safetyStats").css("display", "block");
          // Fill in the safety stats for each category
          $("#overall").html(
            "Overall safety score: " +
            categorizeData(data.data[0].safetyScores.overall)
          );
          $("#lgbtq").html(
            "Harm to LGBTQ people: " +
            categorizeData(data.data[0].safetyScores.lgbtq)
          );
          $("#medical").html(
            "Illness: " + categorizeData(data.data[0].safetyScores.medical)
          );
          $("#women").html(
            "Harm to women: " + categorizeData(data.data[0].safetyScores.women)
          );
          $("#poliFreedom").html(
            "Politcal unrest: " +
            categorizeData(data.data[0].safetyScores.politicalFreedom)
          );
        } else {
          $(".likelihoodHeader").html("");
          $("#overall").html("No safety data available for this location");
          $("#lgbtq").html("");
          $("#medical").html("");
          $("#women").html("");
          $("#poliFreedom").html("");
        }
      });
  }
}

// A function to categorize data based on numeric values
function categorizeData(num) {
  // Array of categories representing risk levels
  var categories = ["Very Low", "Low", "Moderate", "High", "Very High"];
  // Divide the provided number by 20 and round down to get an index
  var index = Math.floor(num / 20);
  // Get the risk level category corresponding to the calculated index
  var text = categories[index];
  // Return the category text colored based on the risk level
  if (index === 0) {
    return text.fontcolor("green");
  }

  if (index === 1) {
    return text.fontcolor("#add633");
  }
  if (index === 2) {
    return text.fontcolor("#ffd934");
  }
  if (index === 3) {
    return text.fontcolor("#ffb234");
  }
  if (index === 4) {
    return text.fontcolor("red");
  }
}

// GET AIR POLLUTION FOR AN AREA
function getPollution(lat, lon) {
  // Fetch air pollution data from OpenWeatherMap's Air Pollution API
  fetch(
    `http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=59939906650b56969f54c525743fa617`
  )
    .then((response) => response.json()) // Parse the response as JSON
    .then((data) => {
      // Color code and present the Air Quality Index (AQI) fetched from the data

      //ACTUAL FUNCTIONALITY BELOW//
      if (data.list[0].main.aqi === 1) {
        $("#air").html("Air Quality: <font color='green'>Good</font>");
      } else if (data.list[0].main.aqi === 2) {
        $("#air").html("Air Quality: <font color='#add633'>Fair</font>");
      } else if (data.list[0].main.aqi === 3) {
        $("#air").html("Air Quality: <font color='#ffd934'>Moderate</font>");
      } else if (data.list[0].main.aqi === 4) {
        $("#air").html("Air Quality: <font color='#ffb234'>Poor</font>");
      } else if (data.list[0].main.aqi === 5) {
        $("#air").html("Air Quality: <font color='red'>Very Poor</font>");
      }
    });
}

// GET CRIME RISK PRECISELY API TOKEN
function getRiskData(data) {
  // Fetch authorization token from Precisely's OAuth endpoint
  fetch("https://api.precisely.com/oauth/token", {
    method: "POST", // The HTTP method is POST
    // Include the Authorization and Content-Type headers
    headers: {
      Authorization: `Basic RjdzUEduaEFSR1Q1WEpsbWo3a29CdE5PMGtSUFZhdVo6dE9LMFZsamdjZm5kVjl6dA`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials", // The type of OAuth2 grant
  })
    .then(function (response) {
      return response.json(); // Parse the response as JSON
    })
    .then(function (data) {
      // Pass the parsed data to the riskResponse function
      riskResponse(data);
    });
}

// GET CRIME RISK DATA FOR AN AREA
function riskResponse(data) {
  // Get the access token from the data
  var riskToken = data.access_token;
  // Make a GET request to Precisely's Crime Risk API endpoint
  fetch(
    `https://api.precisely.com/risks/v1/crime/bylocation?latitude=${lat}8&longitude=${lon}&type=all&includeGeometry=N`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${riskToken}`,
        //   "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  )
    .then(function (response) {
      // Process and present the fetched crime data
      return response.json();
    })
    .then(function (data) {
      if (data.themes) {
        var crimeCategory =
          data.themes[0].crimeIndexTheme.indexVariable[0].category;

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
  // Store the current search bounds in local storage
  localStorage.setItem("latitude north", mapNorth);
  localStorage.setItem("latitude south", mapSouth);
  localStorage.setItem("longitude east", mapEast);
  localStorage.setItem("longitude west", mapWest);
  localStorage.setItem("city name",cityName);
});

// Check if there are stored search bounds in local storage
// Retrieving from Local Storage and Displaying on UI
if (
  localStorage.getItem("latitude north") &&
  localStorage.getItem("latitude south") &&
  localStorage.getItem("longitude east") &&
  localStorage.getItem("longitude west") &&
  localStorage.getItem("city name")
) {
  var lsNorth = parseFloat(localStorage.getItem("latitude north"));
  var lsSouth = parseFloat(localStorage.getItem("latitude south"));
  var lsEast = parseFloat(localStorage.getItem("longitude east"));
  var lsWest = parseFloat(localStorage.getItem("longitude west"));
  // Define the bounds
  const bounds = [
    [lsWest, lsSouth],
    [lsEast, lsNorth],
  ];
  var center = [(lsEast + lsWest) / 2, (lsNorth + lsSouth) / 2];
  // Set the maximum bounds of the map and pan to the center
  cityName = localStorage.getItem("city name");
  map.setMaxBounds(bounds);
  map.panTo(center);
}
