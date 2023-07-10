const icon = document.querySelector('.icon');
const airConditions = document.querySelectorAll('.info');
const hourlyIcons = document.querySelectorAll('.hourly-icon');
const hourlyHeaders = document.querySelectorAll('.item-head');
const hourlyDegrees = document.querySelectorAll('.item-degree');
const asideIcons = document.querySelectorAll('.aside--icon');
const asideDegrees = document.querySelectorAll('.degree');
const asideDays = document.querySelectorAll('.day');
let cityName = document.querySelector('#city-name');
let cityDegree = document.querySelector('.city-degree');
let humidity = document.querySelector('#humidity');

const api = {
    API_KEY: "89519baf7c707c67fc8c7b0765aa8545",
    BASE_URL: 'https://api.openweathermap.org/data/2.5/'
}

const searchTerm = document.querySelector('.search-bar');
searchTerm.addEventListener('keypress', (event) => {
    if (event.keyCode === 13) {
        getMainWeatherData(searchTerm.value)
    }
})

function getHourlyWeatherData(latitude, longitude ,mainData) {
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
            console.log(data);
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
            getHourlyWeatherData(data.coord.lat, data.coord.lon , data);
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

function updateSevenDayForecast(data) {
    const maxTemps = data.daily.temperature_2m_max;
    const minTemps = data.daily.temperature_2m_min;
    const weatherCodes = data.daily.weathercode;
    const times = data.daily.time;

    asideDegrees.forEach((element, index) => {
        element.innerHTML = `${Math.floor(maxTemps[index])} / ${Math.floor(minTemps[index])}`;
    })

    asideDays.forEach((element, index) => {
        element.innerText = dateToDay(times[index]);
    })

    asideIcons.forEach((element, index) => {
        element.src = updateIconByWeatherCode(weatherCodes[index]);
    })
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

    console.log(hour);
    hourlyDates.forEach((apiDate, index) => {
        if (convertToDate(apiDate).monthAndDay.includes(todayMonthAndDay) || convertToDate(apiDate).monthAndDay.includes(tomorrowsMonthAndDay)) {
            todayHours.push([convertToDate(apiDate), index]);
        }
    });

    console.log(todayHours);

    for (let i = 0; i < todayHours.length; i++) {
        if (todayHours[i][0].time.includes(hour)) {
            todayHours = todayHours.slice(i, i + 7);
            break;
        }
    }

    hourlyHeaders.forEach((element, index) => {
        element.innerText = todayHours[index][0].time;
    })

    hourlyDegrees.forEach((element, index) => {
        element.innerHTML = `${weatherDegrees[todayHours[index][1]]} <span>&#8451;</span>`;
    })

    hourlyIcons.forEach((element, index) => {
        element.src = updateIconByWeatherCode(weatherCodes[todayHours[index][1]]);
    });

    console.log(todayHours);
}

function updateIconByWeatherCode(weatherCode) {
    if (weatherCode === 0) {
        return "./icons/animated/clear.svg";
    } else if (weatherCode === 1 || weatherCode === 2 || weatherCode === 3) {
        return "./icons/animated/cloudy.svg";
    } else if (weatherCode === 45 || weatherCode === 48) {
        return "./icons/animated/fog.svg";
    } else if (weatherCode === 51 || weatherCode === 53 || weatherCode === 55 || weatherCode === 56 || weatherCode === 57) {
        return "./icons/animated/drizzle.svg";
    } else if (weatherCode === 61 || weatherCode === 63 || weatherCode === 66 || weatherCode === 67) {
        return "./icons/animated/rain.svg";
    } else if (weatherCode === 71 || weatherCode === 73 || weatherCode === 75 || weatherCode === 77 || weatherCode === 85 || weatherCode === 86) {
        return "./icons/animated/snow.svg";
    } else if (weatherCode === 80 || weatherCode === 82 || weatherCode === 81) {
        return "./icons/animated/thunder.svg";
    } else if (weatherCode === 95 || weatherCode === 96 || weatherCode === 99) {
        return "./icons/animated/thunderstorms.svg";
    }
}

function updateMainStatus(data) {
    let number = parseInt(cityDegree.innerHTML);
    let humidityPercentage = parseInt(humidity.innerHTML);

    cityName.innerText = data.name;
    number = Math.floor(data.main.temp);
    humidityPercentage = data.main.humidity
    cityDegree.innerHTML = number + ' <span>&#8451;</span>';
    humidity.innerHTML = 'Humidity ' + humidityPercentage + '%';
}

function updateIcon(data) {
    data = data.toLowerCase();
    icon.src = `./icons/animated/${data}.svg`;
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
    let alert = document.querySelector('.alert');
    alert.classList.add('show');
    setTimeout(() => {
        alert.classList.remove('show');
    }, 3000);
}

