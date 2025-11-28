import cities from "./cities.js";

const loadingPage = document.querySelector("#loading-page");
const icon = document.querySelector(".icon");
const airConditions = document.querySelectorAll(".info");
const hourlyIcons = document.querySelectorAll(".hourly-icon");
const hourlyHeaders = document.querySelectorAll(".item-head");
const hourlyDegrees = document.querySelectorAll(".item-degree");
const asideIcons = document.querySelectorAll(".aside--icon");
const asideDegrees = document.querySelectorAll(".degree");
const asideDays = document.querySelectorAll(".day");
const searchButton = document.querySelector("#search-button");
const searchTerm = document.querySelector(".search-bar");
const alert = document.querySelector("#alert");
const cityName = document.querySelector("#city-name");
const cityDegree = document.querySelector(".city-degree");
const humidity = document.querySelector("#humidity");
let listContainer = document.querySelector(".list-container");

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

const weatherThemes = {
    clear: {
        gradient: "linear-gradient(135deg, #FDB813 0%, #F59E0B 50%, #EF4444 100%)",
        name: "clear"
    },
    clouds: {
        gradient: "linear-gradient(135deg, #334155 0%, #1E293B 50%, #0F172A 100%)",
        name: "cloudy"
    },
    rain: {
        gradient: "linear-gradient(135deg, #334155 0%, #1E3A5F 50%, #0C2340 100%)",
        name: "rainy"
    },
    drizzle: {
        gradient: "linear-gradient(135deg, #475569 0%, #334155 50%, #1E293B 100%)",
        name: "drizzle"
    },
    snow: {
        gradient: "linear-gradient(135deg, #E0F2FE 0%, #BAE6FD 50%, #7DD3FC 100%)",
        name: "snowy"
    },
    thunderstorm: {
        gradient: "linear-gradient(135deg, #312E81 0%, #1E1B4B 50%, #0F0A1E 100%)",
        name: "stormy"
    },
    fog: {
        gradient: "linear-gradient(135deg, #6B7280 0%, #4B5563 50%, #374151 100%)",
        name: "foggy"
    },
    mist: {
        gradient: "linear-gradient(135deg, #9CA3AF 0%, #6B7280 50%, #4B5563 100%)",
        name: "misty"
    },
    haze: {
        gradient: "linear-gradient(135deg, #D1D5DB 0%, #9CA3AF 50%, #6B7280 100%)",
        name: "hazy"
    }
};

const api = {
    API_KEY: "89519baf7c707c67fc8c7b0765aa8545",
    BASE_URL: "https://api.openweathermap.org/data/2.5/",
};

/**
 * Event listener for when the page loads. Displays the loading screen, 
 * then attempts to get the user's location and fetch the weather data.
 */
window.addEventListener("load", async function () {
    loadingPage.style.display = "block";

    try {
        // Call the getUserLocation function and wait for it to complete
        await getUserLocation();
        // Once the function completes, you can hide the loading page
        loadingPage.style.display = "none";
    } catch (error) {
        // Handle errors here
        loadingPage.style.display = "none";
        console.error("An error occurred:", error);
    }
});
/**
 * Event listener for the search input field. Listens for the 'Enter' keypress
 * and triggers a weather data fetch based on the search term if it's not empty.
 */
searchTerm.addEventListener("keypress", (event) => {
    if (event.keyCode === 13) {
        if (searchTerm.value !== "") {
            getMainWeatherData(searchTerm.value);
            searchTerm.value = "";
            changeDisplay(listContainer, "none");
        } else popAlert();
    }
});
/**
 * Event listener for the search button. Triggers a weather data fetch
 * based on the search term if it's not empty.
 */
searchButton.addEventListener("click", () => {
    if (searchTerm.value !== "") {
        getMainWeatherData(searchTerm.value);
        searchTerm.value = "";
        changeDisplay(listContainer, "none");
    } else popAlert();
});
/**
 * Throttles the execution of the callback function to prevent it from being called too frequently.
 * @param {Function} callback - The function to throttle.
 * @param {number} delay - The delay in milliseconds.
 * @returns {Function} - The throttled function.
 */
const throttle = (callback, delay) => {
    let isThrottled = false;

    return function (...args) {
        if (!isThrottled) {
            console.log("Throttle invoked");

            callback.apply(this, args);

            isThrottled = true;

            setTimeout(() => {
                isThrottled = false;
                console.log("Throttle reset");
            }, delay);
        }
    };
};
/**
 * Updates the list of city suggestions based on the user's input.
 * @param {string} userInput - The input provided by the user in the search bar.
 */
const updateList = (userInput) => {
    let suggestionsHTML = "";
    const filteredCities = cities.filter((city) => {
        return city.toLowerCase().startsWith(userInput.trim().toLowerCase());
    });

    const maxSuggestions = Math.min(filteredCities.length, 6);

    for (let i = 0; i < maxSuggestions; i++) {
        suggestionsHTML += `<li class="suggestion"> ${filteredCities[i]} </li>`;
    }

    listContainer.innerHTML = suggestionsHTML;

    if (maxSuggestions > 0) {
        addClickHandler(listContainer);
        changeDisplay(listContainer, "block");
    } else {
        changeDisplay(listContainer, "none");
    }
};
/**
 * Adds click event listeners to each suggestion in the container.
 * @param {HTMLElement} container - The container element that holds the suggestions.
 */
const addClickHandler = (container) => {
    const suggestions = container.querySelectorAll(".suggestion");

    suggestions.forEach((suggestion) => {
        suggestion.addEventListener("click", (event) => {
            const selectedCity = event.target.textContent.toLowerCase().trim();
            getMainWeatherData(selectedCity);
            changeDisplay(listContainer, "none");
            searchTerm.value = "";
        });
    });
};
/**
 * Throttled version of the updateList function to limit the frequency of its execution.
 */
const updateListThrottled = throttle(updateList, 555);

/**
 * Event listener for input events on the search bar. 
 * It triggers the throttled updateList function based on the user's input.
 */
searchTerm.addEventListener("input", () => {
    const userInput = searchTerm.value.trim();

    if (userInput === "") {
        changeDisplay(listContainer, "none");
    } else {
        changeDisplay(listContainer, "block");
        updateListThrottled(userInput);
    }
});
/**
 * Fetches the hourly weather data based on the provided coordinates and main weather data.
 * @param {number} latitude - The latitude of the location.
 * @param {number} longitude - The longitude of the location.
 * @param {object} mainData - The main weather data for the location.
 */
const getHourlyWeatherData = (latitude, longitude, mainData) => {
    fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,weathercode,uv_index&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto`
    )
        .then((response) => {
            if (!response.ok) {
                popAlert();
                throw new Error("network error");
            }
            return response.json();
        })
        .then((data) => {
            showResult(mainData);
            updateHourlyWeatherData(data);
            updateSevenDayForecast(data);
        })
        .catch((error) => {
            console.log("There was an error fetching weather data", error);
        });
};
/**
 * Fetches the main weather data based on the provided city name or coordinates.
 * @param {...string|number} coordinates - The city name or geographical coordinates.
 */
function getMainWeatherData(...coordinates) {
    console.log(coordinates);
    //handels user input
    if (coordinates.length === 1) {
        fetch(`${api.BASE_URL}weather?q=${coordinates[0]}&appid=${api.API_KEY}&units=metric`)
            .then((response) => {
                if (!response.ok) {
                    popAlert();
                    throw new Error("Network response was not ok");
                }
                return response.json();
            })
            .then((data) => {
                getHourlyWeatherData(data.coord.lat, data.coord.lon, data);
            })
            .catch((error) => {
                popAlert();
                console.error("There was a problem with the fetch operation:", error);
            });
    } else if (coordinates.length === 2) {
        /// handels getting information for user's location
        const [lat, lon] = coordinates;
        fetch(`${api.BASE_URL}weather?lat=${lat}&lon=${lon}&appid=${api.API_KEY}&units=metric`)
            .then((response) => {
                if (!response.ok) {
                    popAlert();
                    throw new Error("Network response was not ok");
                }
                return response.json();
            })
            .then((data) => {
                getHourlyWeatherData(lat, lon, data);
            })
            .catch((error) => {
                popAlert();
                console.error("There was a problem with the fetch operation:", error);
            });
    }
}
/**
 * Updates the main weather status and conditions based on the provided data.
 * @param {object} data - The main weather data for the location.
 */
function showResult(data) {
    updateMainStatus(data);
    const weatherCondition = data.weather[0].main.toLowerCase();
    updateIcon(weatherCondition);
    updateConditions(data);
    updateWeatherTheme(weatherCondition);
}

/**
 * Updates the background theme based on the weather condition.
 * @param {string} weatherCondition - The weather condition (e.g., 'clear', 'clouds', 'rain').
 */
function updateWeatherTheme(weatherCondition) {
    const app = document.querySelector("#app");
    const theme = weatherThemes[weatherCondition] || weatherThemes.clear;
    
    app.style.transition = "background 1s ease";
    app.style.background = theme.gradient;
}
/**
 * Sets the opacity of the provided elements to zero.
 * @param {HTMLElement[]} args - An array of HTML elements whose opacity will be set to zero.
 */
function setOpacityZero(args) {
    args.forEach((element) => {
        element.style.opacity = 0;
    });
}
/**
 * Updates the seven-day weather forecast using the provided data.
 * @param {object} data - The weather data containing daily temperature and weather codes.
 */
function updateSevenDayForecast(data) {
    const maxTemps = data.daily.temperature_2m_max;
    const minTemps = data.daily.temperature_2m_min;
    const weatherCodes = data.daily.weathercode;
    const times = data.daily.time;

    setOpacityZero([...asideDays, ...asideDegrees, ...asideIcons]);

    setTimeout(() => {
        asideDegrees.forEach((element, index) => {
            element.innerHTML = `${Math.floor(maxTemps[index])} / ${Math.floor(minTemps[index])}`;
            element.style.opacity = 1;
        });

        asideDays.forEach((element, index) => {
            element.innerText = dateToDay(times[index]);
            element.style.opacity = 1;
        });

        asideIcons.forEach((element, index) => {
            element.src = updateIconByWeatherCode(weatherCodes[index]);
            element.style.opacity = 1;
        });
    }, 200);
}
/**
 * Converts a date string to a day of the week.
 * @param {string} date - The date string in a standard format.
 * @returns {string} The day of the week corresponding to the given date.
 */
function dateToDay(date) {
    const newDate = new Date(date);
    const options = { weekday: "long" };
    return newDate.toLocaleString("en-US", options);
}
/**
 * Updates the hourly weather data display with the provided weather data.
 * @param {object} weatherData - The weather data containing hourly temperature and weather codes.
 */
function updateHourlyWeatherData(weatherData) {
    const todaysDate = new Date();
    const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ];
    const todayMonthAndDay = `${monthNames[todaysDate.getMonth()]} ${todaysDate.getDate()}`;
    const tomorrowsMonthAndDay = `${monthNames[todaysDate.getMonth()]} ${todaysDate.getDate() + 1}`;
    const hourlyDates = weatherData.hourly.time;
    const weatherCodes = weatherData.hourly.weathercode;
    const weatherDegrees = weatherData.hourly.temperature_2m;
    let todayHours = [];
    let hour = todaysDate.getHours();
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12;
    hour = hour ? hour : 12;
    hour = `${hour}:00 ${ampm}`;

    hourlyDates.forEach((apiDate, index) => {
        if (
            convertToDate(apiDate).monthAndDay.includes(todayMonthAndDay) ||
            convertToDate(apiDate).monthAndDay.includes(tomorrowsMonthAndDay)
        ) {
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
            if (todayHours[index][0].time.includes("rday")) {
                element.innerText = todayHours[index][0].time.substring(todayHours[index][0].time.length - 8);
                element.style.opacity = 1;
            } else {
                element.innerText = todayHours[index][0].time;
                element.style.opacity = 1;
            }
        });

        hourlyDegrees.forEach((element, index) => {
            element.innerHTML = `${weatherDegrees[todayHours[index][1]]} <span>&#8451;</span>`;
            element.style.opacity = 1;
        });

        hourlyIcons.forEach((element, index) => {
            element.src = updateIconByWeatherCode(weatherCodes[todayHours[index][1]]);
            element.style.opacity = 1;
        });
    }, 200);
}
/**
 * Returns the SVG icon path based on the provided weather code.
 * @param {number} weatherCode - The numerical code representing the weather condition.
 * @returns {string|null} The file path to the corresponding weather icon or null if not found.
 */
function updateIconByWeatherCode(weatherCode) {
    for (const weatherType in weatherIcons) {
        if (weatherIcons[weatherType].includes(weatherCode)) {
            return `./icons/animated/${weatherType.toLowerCase()}.svg`;
        }
    }
    return null;
}
/**
 * Updates the main status elements such as city name, temperature, and humidity based on the provided data.
 * @param {object} data - The main weather data including temperature, humidity, and city name.
 */
function updateMainStatus(data) {
    let number = parseInt(cityDegree.innerHTML);
    let humidityPercentage = parseInt(humidity.innerHTML);

    setOpacityZero([cityName, cityDegree, humidity]);

    setTimeout(() => {
        if (data.name.length > 15) {
            cityName.style.fontSize = "1.9rem";
        } else {
            cityName.style.fontSize = "3rem";
        }
        cityName.innerText = data.name;
        number = Math.floor(data.main.temp);
        humidityPercentage = data.main.humidity;
        cityDegree.innerHTML = ` ${number} <span>&#8451;</span> `;
        humidity.innerHTML = `Humidity ${humidityPercentage}  %`;

        cityDegree.style.opacity = 1;
        humidity.style.opacity = 1;
        cityName.style.opacity = 1;
    }, 200);
}
/**
 * Updates the weather icon displayed on the page based on the provided icon name.
 * @param {string} iconName - The name of the weather icon to display.
 */
function updateIcon(iconName) {
    setOpacityZero([icon]);
    setTimeout(() => {
        icon.src = `./icons/animated/${iconName}.svg`;
        icon.style.opacity = 1;
    }, 200);
}
/**
 * Updates the displayed weather conditions such as feels like temperature, wind speed, and direction.
 * @param {object} data - The main weather data including feels like temperature, wind speed, and direction.
 */
function updateConditions(data) {
    setOpacityZero(airConditions);

    setTimeout(() => {
        airConditions.forEach((element, index) => {
            if (index === 0) {
                element.innerText = Math.floor(data.main.feels_like);
                element.style.opacity = 1;
            } else if (index === 1) {
                element.innerText = data.wind.speed;
                element.style.opacity = 1;
            } else if (index === 2) {
                element.innerText = data.wind.deg;
                element.style.opacity = 1;
            } else if (index === 3) {
                element.innerText = Math.floor(data.main.temp_max);
                element.style.opacity = 1;
            }
        });
    }, 200);
}
/**
 * Converts an API date string to an object containing the day, month and day, and time.
 * @param {string} apiDate - The date string from the API.
 * @returns {object} An object containing the day, monthAndDay, and time properties.
 */
function convertToDate(apiDate) {
    const date = new Date(apiDate);
    const options = { weekday: "long", month: "long", day: "numeric", hour: "numeric", minute: "numeric" };
    const dateString = date.toLocaleString("en-US", options);

    return {
        day: dateString.substring(0, dateString.indexOf(",")).trim(),
        monthAndDay: dateString.substring(dateString.indexOf(",") + 2, dateString.indexOf(" at")),
        time: dateString.substring(dateString.indexOf("at") + 3),
    };
}
/**
 * Displays an alert to the user and changes the appearance of the search term input.
 */
function popAlert() {
    alert.classList.add("show");
    searchTerm.classList.add("alert");
    setTimeout(() => {
        alert.classList.remove("show");
        searchTerm.classList.remove("alert");
    }, 3000);
}

/**
 * Changes the display property of the specified element.
 * @param {HTMLElement} element - The HTML element to modify.
 * @param {string} state - The display state to set ('block', 'none', etc.).
 */
const changeDisplay = (element, state) => {
    element.style.display = `${state}`;
};

/**
 * Retrieves the user's current location using the Geolocation API.
 * @returns {Promise<void>} A promise that resolves when the user's location is successfully obtained.
 */
const getUserLocation = function () {
    return new Promise((resolve, reject) => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                function (position) {
                    const coordinates = [position.coords.latitude, position.coords.longitude];
                    getMainWeatherData(coordinates[0], coordinates[1]);
                    resolve();
                },
                function (error) {
                    // Handle any errors that occur
                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            console.error("User denied the request for Geolocation.");
                            break;
                        case error.POSITION_UNAVAILABLE:
                            console.error("Location information is unavailable.");
                            break;
                        case error.TIMEOUT:
                            console.error("The request to get user location timed out.");
                            break;
                        default:
                            console.error("An unknown error occurred.");
                            break;
                    }
                    reject(error);
                }
            );
        } else {
            console.log("Geolocation is not available");
        }
    });
};

getUserLocation();
getMainWeatherData("london");
