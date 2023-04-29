const api = {
    API_KEY: "89519baf7c707c67fc8c7b0765aa8545",
    BASE_URL: 'https://api.openweathermap.org/data/2.5/'
}


function getWeatherData(searchTerm) {
    fetch(`${api.BASE_URL}weather?q=${searchTerm}&appid=${api.API_KEY}&units=metric`)
        .then((response) => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then((data) => {
            // parseData(data);
            console.log(data);
        })
        .catch((error) => {
            console.error('There was a problem with the fetch operation:', error);
        });
}

getWeatherData("tehran")