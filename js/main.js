const apiToken = 'ffe326f396521129f55388a8313ab948';
const locToken = 'b7ac516e81fc5dd06dd77938dba59cad';
var lat;
var lon;

var keys = [0,1,2,3,4,5,6];
var values = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
var map = new Map();
for(let i = 0; i < keys.length; i++){
    map.set(keys[i], values[i])
}


document.getElementById('display').style.display = 'none'

const getForecastDay = (current, target) => {
    if(current + target <=6){
        return current + target
    }else{
        return (current + target) - 7
    }
}

const toCapitalize =(s) => {
    return s.charAt(0).toUpperCase() + s.slice(1)
}

const getData = async (locList) => {
    lat = locList[0];
    lon = locList[1]
    const result = await fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&appid=${apiToken}`, {
        method: 'POST'
    });
    const data = await result.json();
    return data
}

const getLocation = async () => {
    const pos = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
    });
    return{
        lat: pos.coords.latitude.toFixed(2),
        lon: pos.coords.longitude.toFixed(2)
    }
}

const fetchData = async (zip, code) => {
    if(code == 'GB'){
            const gbLocation = await fetch(`http://api.postcodes.io/postcodes/${zip}`, {
                method: 'GET'
            });
            const locale = await gbLocation.json()
            lat = locale.result.latitude
            lon = locale.result.longitude
        }else{
            const location = await fetch(`https://thezipcodes.com/api/v1/search?zipCode=${zip}&countryCode=${code}&apiKey=b7ac516e81fc5dd06dd77938dba59cad`, { json: true }, (err, res, body) => {
                if (err) { return console.log(err); }
            });
            const locData = await location.json();
            lat = locData.location[0].latitude;
            lon = locData.location[0].longitude;
        }    
    return [lat, lon]
};

let form = document.querySelector('#infoDataForm')

form.addEventListener('submit', async (event) => {
    event.preventDefault()
    document.getElementById('display').style.display = 'block'
    var coords;
    let zipPostal = event.path[0][0].value;
    let countryCode = event.path[0][1].value;
    let units = event.path[0][2].value;
    if(zipPostal == "" && countryCode == ""){
        stuff = await getLocation();
        coords = [stuff.lat, stuff.lon]
    }else{
        coords = await fetchData(zipPostal, countryCode);
    }
    let data = await getData(coords);
    if(data.alerts){
        alert(`There is a weather alert for this area:\n ${data.alerts[0].description}`)
    }
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
            let desc = toCapitalize(data.current.weather[0].description);
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
            let desc = toCapitalize(data.current.weather[0].description);
            document.getElementById("desc" + String(i)).innerHTML = `${desc}`
        }
    }
    
})

const clearScreen = () => {
    document.getElementById('display').style.display = 'none'
    document.getElementById('post').value = ''
    document.getElementById('country-code-field').value = ''
    document.getElementById('units').value = ''
}