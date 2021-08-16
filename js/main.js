// Import variables from hidden sheet. Meant to protect information
import { apiToken, locToken, revToken } from "./guard.js";

// Setting global variables
var lat;
var lon;
var city;

// Creating days of the week dictionary
var keys = [0,1,2,3,4,5,6];
var values = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
var map = new Map();
for(let i = 0; i < keys.length; i++){
    map.set(keys[i], values[i])
}

// Hiding display as default setting
document.getElementById('display').style.display = 'none'

/**
 * @param current - an integer representing the current day of the week
 * @param target - an integer representing how many days ahead to advance
 * 
 * This function will take in the current day of the week and how many days it wants to advance.
 * It then returns the day of the week.
 */
const getForecastDay = (current, target) => {
    if(current + target <=6){
        return current + target
    }else{
        return (current + target) - 7
    }
}

/**
 * @param s - any string
 * 
 * This function takes in a string and returns the same string with the first letter capitalized.
 */
const toCapitalize =(s) => {
    return s.charAt(0).toUpperCase() + s.slice(1)
}

/** 
 * @param locList - array of coordinates and city name.
 * 
 * Function to return the api call for a location. Index 2 of the parameter is not used.
*/
const getData = async (locList) => {
    lat = locList[0];
    lon = locList[1]
    const result = await fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&appid=${apiToken}`, {
        method: 'POST'
    });
    const data = await result.json();
    return data
}

// Function to return the coordinates of the user's device
const getLocation = async () => {
    const pos = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
    });
    return{
        lat: pos.coords.latitude.toFixed(2),
        lon: pos.coords.longitude.toFixed(2)
    }
}

/**
 * @param coords - array of coordinates
 * 
 * This function returns a city name from the coordinates provided.
 */
const getCity = async (coords) => {
    lat = coords[0];
    lon = coords[1];;
    const temp = await fetch(`https://us1.locationiq.com/v1/reverse.php?key=${revToken}&lat=${lat}&lon=${lon}&format=json`, {
        method: 'GET'
    });
    const name = await temp.json();
    return name.address.city
};

/**
 * 
 * @param zip - zip/postal code
 * @param code - two letter country code
 * 
 * This function returns the coordinates and city name based on the user supplied zip/postal code
 * and country code.
 */
const fetchData = async (zip, code) => {
    if(code == 'GB'){
            const gbLocation = await fetch(`http://api.postcodes.io/postcodes/${zip}`, {
                method: 'GET'
            });
            const locale = await gbLocation.json()
            lat = locale.result.latitude;
            lon = locale.result.longitude;
            city = locale.result.admin_district;
        }else{
            const location = await fetch(`https://thezipcodes.com/api/v1/search?zipCode=${zip}&countryCode=${code}&apiKey=${locToken}`, { json: true }, (err, res, body) => {
                if (err) { return console.log(err); }
            });
            const locData = await location.json();
            lat = locData.location[0].latitude;
            lon = locData.location[0].longitude;
            city = locData.location[0].city;
        }
    return [lat, lon, city]
};

let form = document.querySelector('#infoDataForm')

/**
 * Event listener: Listens for a submit button click and then runs the code to get and display all the information.
 * If the zip code and country code are not chosen, the function gets the device's location and city name.
 * If the zip and country codes are provided, it returns coordinates for that location.
 * The function then grabs the weather data, parses it appropriately and displays it.
 */
form.addEventListener('submit', async (event) => {
    event.preventDefault()
    clearFields()

    // Sets global variables
    var coords;
    var location;

    // Grabs information from the website fields
    let zipPostal = event.path[0][0].value;
    let countryCode = event.path[0][1].value;
    let units = event.path[0][2].value;

    // determines course of action based on the presence of information in the fields
    if(zipPostal == "" && countryCode == ""){
        location = await getLocation();
        city = await getCity([location.lat, location.lon])
        coords = [location.lat, location.lon, city]
    }else{
        coords = await fetchData(zipPostal, countryCode);
    }

    // Gets the weather data
    let data = await getData(coords);

    // Appends city name
    document.getElementById("location").innerHTML = `Weather for ${coords[2]}`

    // Searches for alerts and, if present, displays a popup
    if(data.alerts){
        alert(`There is a weather alert for this area:\n ${data.alerts[0].description}`)
    }

    // Displays the weather information based on selection of Celsius or Fahrenheit
    if(units == 'Celsius'){
        document.getElementById("img0").src = `http://openweathermap.org/img/wn/${data.current.weather[0].icon}@2x.png`
        document.getElementById("current0").innerHTML = `Current Temp: ${(data.current.temp-273.15).toFixed(0)}\xB0C`
        document.getElementById("feels0").innerHTML = `Feels Like: ${(data.current.feels_like-273.15).toFixed(0)}\xB0C`
        document.getElementById("high0").innerHTML = `Today's High: ${(data.daily[0].temp.max-273.15).toFixed(0)}\xB0C`
        document.getElementById("low0").innerHTML = `Today's Low: ${(data.daily[0].temp.min-273.15).toFixed(0)}\xB0C`
        let desc = toCapitalize(data.current.weather[0].description)
        document.getElementById("desc0").innerHTML = `${desc}`
        for(let i = 1; i < 6; i++){
            let d = new Date();
            let n = d.getUTCDay();
            let day = getForecastDay(n, i);
            document.getElementById("day" + String(i)).innerHTML = `${map.get(day)}`
            document.getElementById("img" + String(i)).src = `http://openweathermap.org/img/wn/${data.daily[i].weather[0].icon}@2x.png`
            document.getElementById("high" + String(i)).innerHTML = `${(data.daily[i].temp.max-273.15).toFixed(0)}\xB0C`
            document.getElementById("low" + String(i)).innerHTML = `${(data.daily[i].temp.min-273.15).toFixed(0)}\xB0C`
            let desc = toCapitalize(data.daily[i].weather[0].description);
            document.getElementById("desc" + String(i)).innerHTML = `${desc}`
        }
    }else{
        document.getElementById("img0").src = `http://openweathermap.org/img/wn/${data.current.weather[0].icon}@2x.png`
        document.getElementById("current0").innerHTML = `Current Temp: ${(((data.current.temp-273.15)*1.8)+32).toFixed(0)}\xB0F`
        document.getElementById("feels0").innerHTML = `Feels Like: ${(((data.current.feels_like-273.15)*1.8)+32).toFixed(0)}\xB0F`
        document.getElementById("high0").innerHTML = `Today's High: ${(((data.daily[0].temp.max-273.15)*1.8)+32).toFixed(0)}\xB0F`
        document.getElementById("low0").innerHTML = `Today's Low: ${(((data.daily[0].temp.min-273.15)*1.8)+32).toFixed(0)}\xB0F`
        let desc = toCapitalize(data.current.weather[0].description)
        document.getElementById("desc0").innerHTML = `${desc}`
        for(let i = 1; i < 6; i++){
            let d = new Date();
            let n = d.getUTCDay();
            let day = getForecastDay(n, i);
            document.getElementById("day" + String(i)).innerHTML = `${map.get(day)}`
            document.getElementById("img" + String(i)).src = `http://openweathermap.org/img/wn/${data.daily[i].weather[0].icon}@2x.png`
            document.getElementById("high" + String(i)).innerHTML = `${(((data.daily[i].temp.max-273.15)*1.8)+32).toFixed(0)}\xB0F`
            document.getElementById("low" + String(i)).innerHTML = `${(((data.daily[i].temp.min-273.15)*1.8)+32).toFixed(0)}\xB0F`
            let desc = toCapitalize(String(data.daily[i].weather[0].description));
            document.getElementById("desc" + String(i)).innerHTML = `${desc}`
        }
    }
    // Makes the information display visible
    document.getElementById('display').style.display = 'block'
});

// Clears all the fields. For use between searches or to clear the slate.
const clearFields = () => {
    document.getElementById("location").innerHTML = ''
    document.getElementById("img0").src = ''
    document.getElementById("current0").innerHTML = ''
    document.getElementById("feels0").innerHTML = ''
    document.getElementById("high0").innerHTML = ''
    document.getElementById("low0").innerHTML = ''
    document.getElementById("desc0").innerHTML = ''
    for(let i = 1; i < 6; i++){
        document.getElementById("day" + String(i)).innerHTML = ''
        document.getElementById("img" + String(i)).src = ''
        document.getElementById("high" + String(i)).innerHTML = ''
        document.getElementById("low" + String(i)).innerHTML = ''
        document.getElementById("desc" + String(i)).innerHTML = ''
    }
};

// Code to activate the clearing of all information on the website upon button click.
const btn = document.getElementById("clearBtn");
btn.addEventListener("click", function() {
    clearFields()
    document.getElementById('display').style.display = 'none'
    document.getElementById('post').value = ''
    document.getElementById('country-code-field').value = ''
    document.getElementById('units').value = ''
}, false);
