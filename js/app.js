import cities from './cities.js'

const icon = document.querySelector('.icon');
const airConditions = document.querySelectorAll('.info');
const hourlyIcons = document.querySelectorAll('.hourly-icon');
const hourlyHeaders = document.querySelectorAll('.item-head');
const hourlyDegrees = document.querySelectorAll('.item-degree');
const asideIcons = document.querySelectorAll('.aside--icon');
const asideDegrees = document.querySelectorAll('.degree');
const asideDays = document.querySelectorAll('.day');
const searchButton = document.querySelector('#search-button');
const searchTerm = document.querySelector('.search-bar');
const alert = document.querySelector('#alert');
let cityName = document.querySelector('#city-name');
let cityDegree = document.querySelector('.city-degree');
let humidity = document.querySelector('#humidity');
let listContainer = document.querySelector('.list-container');
let isFetchingCities = false;
let throttleTimeout;

const weatherIcons = {
    CLEAR: [0],
    CLOUDY: [1, 2, 3],
    FOG: [45, 48],
    DRIZZLE: [51, 53, 55, 56, 57],
    RAIN: [61, 63, 66, 67],
    SNOW: [71, 73, 75, 77, 85, 86],
    THUNDER: [80, 82, 81],
    THUNDERSTORMS: [95, 96, 99],
};

const api = {
    API_KEY: "89519baf7c707c67fc8c7b0765aa8545",
    BASE_URL: 'https://api.openweathermap.org/data/2.5/'
}

searchTerm.addEventListener('keypress', (event) => {
    if (event.keyCode === 13) {
        if (searchTerm.value !== '') getMainWeatherData(searchTerm.value)
        else popAlert();
    }
})

searchButton.addEventListener('click', () => {
    if (searchTerm.value !== '') getMainWeatherData(searchTerm.value)
    else popAlert();
})

searchTerm.addEventListener('input' , () => {
    const userInput = searchTerm.value.trim()

    if(userInput === ''){
        changeDisplay(listContainer,'none')
        return;
    } else if (userInput !== '') {
        changeDisplay(listContainer,'block')
        throttle(() => updateList(userInput),300)
    }
})

function getHourlyWeatherData(latitude, longitude, mainData) {
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,weathercode,uv_index&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto`)
        .then((response) => {
            if (!response.ok) {
                popAlert();
                throw new Error('network error');
            }
            return response.json();
        })
        .then((data) => {
            showResult(mainData);
            updateHourlyWeatherData(data);
            updateSevenDayForecast(data);
        })
        .catch(error => {
            console.log('There was an error fetching weather data', error);
        })
}

function getMainWeatherData(searchTerm) {
    fetch(`${api.BASE_URL}weather?q=${searchTerm}&appid=${api.API_KEY}&units=metric`)
        .then((response) => {
            if (!response.ok) {
                popAlert();
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then((data) => {
            getHourlyWeatherData(data.coord.lat, data.coord.lon, data);
        })
        .catch((error) => {
            popAlert();
            console.error('There was a problem with the fetch operation:', error);
        });
}

function showResult(data) {
    updateMainStatus(data);
    updateIcon(data.weather[0].main.toLowerCase())
    updateConditions(data);
}

function setOpacityZero(args) {
    args.forEach(element => {
        element.style.opacity = 0;
    })
}

const updateList = (userInput) =>{
    const suggestionsHTML = '';
    const filteredCities = cities.filter((city) => {
        city.toLowerCase().startsWith(userInput.trim().toLowerCase())
    })

    for (let i = 0; i < 5; i++) {
        suggestionsHTML += `<div class="suggestion">${filteredCities[i]}</div>`;
    }

    listContainer.innerHTML = suggestionsHTML;
}

function updateSevenDayForecast(data) {
    const maxTemps = data.daily.temperature_2m_max;
    const minTemps = data.daily.temperature_2m_min;
    const weatherCodes = data.daily.weathercode;
    const times = data.daily.time;

    setOpacityZero([...asideDays, ...asideDegrees, ...asideIcons])

    setTimeout(() => {
        asideDegrees.forEach((element, index) => {
            element.innerHTML = `${Math.floor(maxTemps[index])} / ${Math.floor(minTemps[index])}`;
            element.style.opacity = 1;
        })

        asideDays.forEach((element, index) => {
            element.innerText = dateToDay(times[index]);
            element.style.opacity = 1;
        })

        asideIcons.forEach((element, index) => {
            element.src = updateIconByWeatherCode(weatherCodes[index]);
            element.style.opacity = 1;
        })
    }, 500)
}

function dateToDay(date) {
    const newDate = new Date(date);
    const options = { weekday: 'long' };
    return newDate.toLocaleString('en-US', options);
}

function updateHourlyWeatherData(weatherData) {
    const todaysDate = new Date();
    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    const todayMonthAndDay = `${monthNames[todaysDate.getMonth()]} ${todaysDate.getDate()}`;
    const tomorrowsMonthAndDay = `${monthNames[todaysDate.getMonth()]} ${todaysDate.getDate() + 1}`;
    const hourlyDates = weatherData.hourly.time;
    const weatherCodes = weatherData.hourly.weathercode;
    const weatherDegrees = weatherData.hourly.temperature_2m;
    let todayHours = [];
    let hour = todaysDate.getHours();
    let ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12;
    hour = hour ? hour : 12;
    hour = `${hour}:00 ${ampm}`;

    hourlyDates.forEach((apiDate, index) => {
        if (convertToDate(apiDate).monthAndDay.includes(todayMonthAndDay) || convertToDate(apiDate).monthAndDay.includes(tomorrowsMonthAndDay)) {
            todayHours.push([convertToDate(apiDate), index]);
        }
    });

    for (let i = 0; i < todayHours.length; i++) {
        if (todayHours[i][0].time.includes(hour)) {
            todayHours = todayHours.slice(i, i + 7);
            break;
        }
    }

    setOpacityZero([...hourlyDegrees, ...hourlyHeaders, ...hourlyIcons]);

    setTimeout(() => {
        hourlyHeaders.forEach((element, index) => {
            if (todayHours[index][0].time.includes('rday')) {
                element.innerText = todayHours[index][0].time.substring(todayHours[index][0].time.length - 8)
                element.style.opacity = 1;
            }
            else {
                element.innerText = todayHours[index][0].time;
                element.style.opacity = 1
            }
        })

        hourlyDegrees.forEach((element, index) => {
            element.innerHTML = `${weatherDegrees[todayHours[index][1]]} <span>&#8451;</span>`;
            element.style.opacity = 1
        })

        hourlyIcons.forEach((element, index) => {
            element.src = updateIconByWeatherCode(weatherCodes[todayHours[index][1]]);
            element.style.opacity = 1
        });
    }, 500)

}

function updateIconByWeatherCode(weatherCode) {
    for (const weatherType in weatherIcons) {
        if (weatherIcons[weatherType].includes(weatherCode)) {
            return `./icons/animated/${weatherType.toLowerCase()}.svg`;
        }
    }
}

function updateMainStatus(data) {
    let number = parseInt(cityDegree.innerHTML);
    let humidityPercentage = parseInt(humidity.innerHTML);

    setOpacityZero([cityName, cityDegree, humidity]);

    setTimeout(() => {
        cityName.innerText = data.name;
        number = Math.floor(data.main.temp);
        humidityPercentage = data.main.humidity
        cityDegree.innerHTML = number + ' <span>&#8451;</span>';
        humidity.innerHTML = 'Humidity ' + humidityPercentage + '%';

        cityDegree.style.opacity = 1;
        humidity.style.opacity = 1;
        cityName.style.opacity = 1;
    }, 500)
}

function updateIcon(iconName) {
    setOpacityZero([icon]);
    setTimeout(() => {
        icon.src = `./icons/animated/${iconName}.svg`;
        icon.style.opacity = 1;
    }, 500)
}

function updateConditions(data) {
    setOpacityZero(airConditions)

    setTimeout(() => {
        airConditions.forEach((element, index) => {
            if (index === 0) {
                element.innerText = Math.floor(data.main.feels_like)
                element.style.opacity = 1;
            } else if (index === 1) {
                element.innerText = data.wind.speed
                element.style.opacity = 1;
            } else if (index === 2) {
                element.innerText = data.wind.deg
                element.style.opacity = 1;
            } else if (index === 3) {
                element.innerText = Math.floor(data.main.temp_max)
                element.style.opacity = 1;
            }
        })
    }, 500)
}

function convertToDate(apiDate) {
    const date = new Date(apiDate);
    const options = { weekday: "long", month: "long", day: "numeric", hour: "numeric", minute: "numeric" };
    const dateString = date.toLocaleString("en-US", options);

    return {
        day: dateString.substring(0, dateString.indexOf(',')).trim(),
        monthAndDay: dateString.substring(dateString.indexOf(',') + 2, dateString.indexOf(' at')),
        time: dateString.substring(dateString.indexOf('at') + 3)
    }
}

function popAlert() {
    alert.classList.add('show');
    searchTerm.classList.add('alert');
    setTimeout(() => {
        alert.classList.remove('show');
        searchTerm.classList.remove('alert')
    }, 3000);
}

const changeDisplay = (element,state) => {
    element.style.display = `${state}`
}

const throttle = (callback , delay) => {
    isFetchingCities = false;

    if(!isFetchingCities){
        isFetchingCities = true;
        callback();
        throttleTimeout = setTimeout(() => {
            clearTimeout(throttleTimeout);
            isFetchingCities = false;

        }, delay)
    }
}
