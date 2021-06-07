// API Key and Saved Search Global Variables
var apiKey = "1b18ce13c84e21faafb19c931bb29331";
var savedEntry = [];

// Create list of previously saved cities
var historyEntry = function(cityName) {
    $('.past-search:contains("' + cityName + '")').remove();

    
    var historyEntry = $("<p>");
    historyEntry.addClass("past-search");
    historyEntry.text(cityName);

    
    var entryContainer = $("<section>");
    entryContainer.addClass("past-search-container");

    entryContainer.append(historyEntry);

    
    var searchHistoryContainerEl = $("#search-history-container");
    searchHistoryContainerEl.append(entryContainer);

    if (savedEntry.length > 0){
        var previousSavedSearches = localStorage.getItem("savedEntry");
        savedEntry = JSON.parse(previousSavedSearches);
    }

    savedEntry.push(cityName);
    localStorage.setItem("savedEntry", JSON.stringify(savedEntry));

    $("#search-input").val("");

};

// Load saved searches into search history container
var loadHistory = function() {
    
    var savedSearchHistory = localStorage.getItem("savedEntry");

    if (!savedSearchHistory) {
        return false;
    }

    savedSearchHistory = JSON.parse(savedSearchHistory);

    for (var i = 0; i < savedSearchHistory.length; i++) {
        historyEntry(savedSearchHistory[i]);
    }
};

// Fetch data from OpenWeather API for current weather
var currentWeather = function(cityName) {
    
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}`)
        
        .then(function(response) {
            return response.json();
        })
        .then(function(response) {
            
            var cityLon = response.coord.lon;
            var cityLat = response.coord.lat;

            fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${cityLat}&lon=${cityLon}&exclude=minutely,hourly,alerts&units=imperial&appid=${apiKey}`)
                
                .then(function(response) {
                    return response.json();
                })
                
                .then(function(response){
                    historyEntry(cityName);

                    var currentWeatherContainer = $("#current-weather-container");
                    currentWeatherContainer.addClass("current-weather-container");

                    var currentTitle = $("#current-title");
                    var currentDay = moment().format("M/D/YYYY");
                    currentTitle.text(`${cityName} (${currentDay})`);
                    var currentIcon = $("#current-weather-icon");
                    currentIcon.addClass("current-weather-icon");
                    var currentIconCode = response.current.weather[0].icon;
                    currentIcon.attr("src", `https://openweathermap.org/img/wn/${currentIconCode}@2x.png`);

                    var currentTemperature = $("#current-temperature");
                    currentTemperature.text("Temperature: " + response.current.temp + " \u00B0F");

                    var currentHumidity = $("#current-humidity");
                    currentHumidity.text("Humidity: " + response.current.humidity + "%");

                    var currentWindSpeed = $("#current-wind-speed");
                    currentWindSpeed.text("Wind Speed: " + response.current.wind_speed + " MPH");

                    var currentUvIndex = $("#current-uv-index");
                    currentUvIndex.text("UV Index: ");
                    var currentNumber = $("#current-number");
                    currentNumber.text(response.current.uvi);

                    if (response.current.uvi < 3 ) {
                        currentNumber.addClass("favorable");
                    } else if (response.current.uvi >= 3 && response.current.uvi < 8 ) {
                        currentNumber.addClass("moderate");
                    } else {
                        currentNumber.addClass("severe");
                    }
                })
        })
        .catch(function(err) {
            
            $("#search-input").val("");

            // Error Alert
            alert("The city you searched for could not be found. Try searching for another city.");

        });
};

// Fetch data from OpenWeather API for 5-day forecast
var fiveDayForecast = function(cityName) {

    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}`)
        
        .then(function(response) {
            return response.json();
        })
        .then(function(response) {
            
            var cityLon = response.coord.lon;
            var cityLat = response.coord.lat;

            fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${cityLat}&lon=${cityLon}&exclude=minutely,hourly,alerts&units=imperial&appid=${apiKey}`)
                .then(function(response) {
                    return response.json();
                })
                .then(function(response) {
                    console.log(response);

                    var futureTitle = $("#future-forecast-title");
                    futureTitle.text("5-Day Forecast:")

                    for (var i = 1; i <= 5; i++) {
                        
                        var futureCard = $(".future-card");
                        futureCard.addClass("future-card-details");

                        var futureDate = $("#future-date-" + i);
                        date = moment().add(i, "d").format("M/D/YYYY");
                        futureDate.text(date);

                        var futureIcon = $("#future-icon-" + i);
                        futureIcon.addClass("future-icon");
                        var futureIconCode = response.daily[i].weather[0].icon;
                        futureIcon.attr("src", `https://openweathermap.org/img/wn/${futureIconCode}@2x.png`);

                        var futureTemp = $("#future-temp-" + i);
                        futureTemp.text("Temp: " + response.daily[i].temp.day + " \u00B0F");

                        var futureHumidity = $("#future-humidity-" + i);
                        futureHumidity.text("Humidity: " + response.daily[i].humidity + "%");
                    }
                })
        })
};

// Call when search form is submitted
$("#search-form").on("submit", function() {
    event.preventDefault();
    
    var cityName = $("#search-input").val();

    if (cityName === "" || cityName == null) {
        alert("Please enter the name of a city.");
        event.preventDefault();
    } else {

        currentWeather(cityName);
        fiveDayForecast(cityName);
    }
});


$("#search-history-container").on("click", "p", function() {  
    var lastCity = $(this).text();
    currentWeather(lastCity);
    fiveDayForecast(lastCity);

    //
    var lastCityClick = $(this);
    lastCityClick.remove();
});

loadHistory();