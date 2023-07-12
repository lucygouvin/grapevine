console.log("search_results_script.js is running")
console.log($)

pollutionApiKey = "59939906650b56969f54c525743fa617" 
geoCodifyApiKey = '86fe7403b502100fa60e7cb286133efa36540f9c'

pollutionURL = "http://api.openweathermap.org/data/2.5/air_pollution?lat={lat}&lon={lon}&appid={API key}"
geoCodeBaseUrl = 'https://api.geocodify.com/v2'
// How to attach key to Geocode url
// ex:  curl -G https://api.geocodify.com/v2/geocode?api_key=baa9dc110aa712sd3a9fa2a3dwb6c01d4c875950dc32vs

// Forward GeoCoding to receive LAT/LONG
// https://api.geocodify.com/v2/geocode
//    ?api_key=_api_key_goes_here_
//    &q=900 Boston Post Road, Guilford Center, CT, USA

// Format For Risk by Location request
// https://api.precisely.com/risks/v1/crime/bylocation?latitude=35.0118&longitude=-81.9571&type=all&includeGeometry=N

function geoCode(city) {
    fetch(`https://api.geocodify.com/v2/geocode?api_key=${geoCodifyApiKey}&q=${city}`)
    .then(response => response.json())
    .then(data => {
        console.log(data)
        console.log(data.response.features[0].bbox[0])
        getPollution(data.response.features[0].bbox[1], data.response.features[0].bbox[0])
        getRisk(data.response.features[0].bbox[1], data.response.features[0].bbox[0])
    })
}
// Replace with userInput element
geoCode('boston')

function getPollution(lat,long) {
    fetch(`http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${long}&appid=59939906650b56969f54c525743fa617`)
    .then(response => response.json())
    .then(data => {
        console.log(data)
        
    })
}

function getRisk(lat,long) {
    fetch(`https://api.precisely.com/risks/v1/crime/bylocation?latitude=${lat}&longitude=${long}&type=all&includeGeometry=N`,
    {'Authorization': 'Basic RjdzUEduaEFSR1Q1WEpsbWo3a29CdE5PMGtSUFZhdVo6dE9LMFZsamdjZm5kVjl6dA',
    'Content-Type': 'application/x-www-form-urlencoded',
    'POST': 'https://api.precisely.com/oauth/token',
    'grant_type':'client_credentials'})
    .then(response => response.json())
    .then(data => {
        console.log(data)
        
    })
}