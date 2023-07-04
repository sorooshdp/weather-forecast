let cityName = document.querySelector('#city-name');
let cityDegree = document.querySelector('.city-degree');
let humidity = document.querySelector('#humidity');
const icon = document.querySelector('.icon');
const airConditions = document.querySelectorAll('.info');

const api = {
    API_KEY: "89519baf7c707c67fc8c7b0765aa8545",
    BASE_URL: 'https://api.openweathermap.org/data/2.5/'
}

const searchTerm = document.querySelector('.search-bar');
searchTerm.addEventListener('keypress', (event) => {
    if (event.keyCode === 13) {
        getWeatherData(searchTerm.value)
    }
})

function popAlert() {
    let alert = document.querySelector('.alert');
    alert.classList.add('show');
    setTimeout(() => {
        alert.classList.remove('show');
    }, 3000);
}

function getHourlyWeatherData(latitude, longitude) {
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,weathercode,uv_index&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto`)
        .then((response) => {
            if (!response.ok) {
                popAlert();
                throw new Error('network error');
            }
            return response.json();
        })
        .then((data) => { 
            console.log(data);
        })
        .catch(error => {
            console.log('There was an error fetching weather data' , error);
        })
}

function getWeatherData(searchTerm) {
    fetch(`${api.BASE_URL}weather?q=${searchTerm}&appid=${api.API_KEY}&units=metric`)
        .then((response) => {
            if (!response.ok) {
                popAlert();
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then((data) => {
            showResult(data);
            getHourlyWeatherData(data.coord.lat , data.coord.lon);
            console.log(data);
        })
        .catch((error) => {
            console.error('There was a problem with the fetch operation:', error);
        });
}

function showResult(data) {
    updateMainStatus(data);
    updateIcon(data.weather[0].main)
    updateConditions(data);
}

function updateMainStatus(data) {
    let number = parseInt(cityDegree.innerHTML);
    let humidityPercentage = parseInt(humidity.innerHTML);
    cityName.innerText = data.name;
    number = Math.floor(data.main.temp);
    humidityPercentage = data.main.humidity
    cityDegree.innerHTML = number + ' <span>&#8451;</span>';
    humidity.innerHTML = 'Humidity ' + humidityPercentage + '%';
    console.log(airConditions[0].innerText);
}

function updateIcon(data) {
    console.log(data);
    if (data === 'Clear') {
        icon.src = './icons/animated/clear-day.svg';
    } else if (data === 'Clouds') {
        icon.src = './icons/animated/cloudy.svg';
    } else if (data === 'Rain') {
        icon.src = './icons/animated/rain.svg';
    } else if (data === 'Drizzle') {
        icon.src = './icons/animated/drizzle.svg';
    } else if (data === 'Thunderstorm') {
        icon.src = './icons/animated/thunderstorms.svg';
    } else if (data === 'Snow') {
        icon.src = './icons/animated/snow.svg';
    } else if (data === 'Mist') {
        icon.src = './icons/animated/mist.svg';
    } else if (data === 'Smoke') {
        icon.src = './icons/animated/smoke.svg';
    } else if (data === 'Haze') {
        icon.src = './icons/animated/haze.svg';
    } else if (data === 'Dust') {
        icon.src = './icons/animated/dust.svg';
    } else if (data === 'Fog') {
        icon.src = './icons/animated/fog.svg';
    } else if (data === 'Squall') {
        icon.src = './icons/animated/wind.svg';
    } else if (data === 'Tornado') {
        icon.src = './icons/animated/tornado.svg';
    }
}

function updateConditions(data) {
    airConditions.forEach((element, index) => {
        if (index === 0) {
            element.innerText = Math.floor(data.main.feels_like)
        } else if (index === 1) {
            element.innerText = data.wind.speed
        } else if (index === 2) {
            element.innerText = data.wind.deg
        } else if (index === 3) {
            element.innerText = Math.floor(data.main.temp_max)
        }
    })
}
