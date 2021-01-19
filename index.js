// Local Store Pull
var cityList = JSON.parse(localStorage.getItem("allCities"));
if (cityList != null) {
    generateCityList(cityList);
}


// List of Cities Generator
function generateCityList(cityList) {
    $(".list-of-city-cards").css("visibility", "visible");
    $(".city-list-group").empty();
    for (let i = 0; i < cityList.length; i++) {
        var cityButtonList = $("<li>");
        cityButtonList.addClass("list-group-item city-card").text(cityList[i].city);
        cityButtonList.attr("type", "button");
        $(".city-list-group").append(cityButtonList);
    }
}

// Search City Event Listener
$(".search-city-button").on("click", function (event) {
    event.preventDefault();
    cityList = JSON.parse(localStorage.getItem("allCities"));
    if (cityList != null) {
        cityList.push({ city: $(".search-city-form").val() });
        localStorage.setItem("allCities", JSON.stringify(cityList));
        generateCityList(cityList);
        getCityCoords($(".search-city-form").val());
    }
    else {
        cityList = [{ city: $(".search-city-form").val() }];
        localStorage.setItem("allCities", JSON.stringify(cityList));
        generateCityList(cityList);
        getCityCoords($(".search-city-form").val());
    }
})

// City List Event Listener
$(document).on("click", ".city-card", function () {
    console.log($(this).text())
    getCityCoords($(this).text());
})


// Calls API to pull coordinates for searched city
function getCityCoords(cityName) {
    $(".city-name").text(cityName)
    var coordsURL = "https://api.openweathermap.org/data/2.5/weather?q=" + cityName + "&appid=362001ca18aa50ad6cce0cd209741e8b";
    $.ajax({
        url: coordsURL,
        method: "GET",
        error: function() {
            console.log("ERROR HEHE");
            cityList.pop();
            localStorage.setItem("allCities", JSON.stringify(cityList));
            alert("Unknown city, please try again");
            generateCityList(cityList);
        } ,
        success: function (coordsResponse) {
            console.log(coordsResponse);
            var lat = coordsResponse.coord.lat;
            var lon = coordsResponse.coord.lon;
            getCityWeather(lat, lon);
        }
    })
}

// Calls API with coordinates from getCityCoords() to pull weather information
function getCityWeather(lat, lon) {
    var queryURL = "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lon + "&units=imperial&exclude=hourly,minutely&appid=362001ca18aa50ad6cce0cd209741e8b";
    $.ajax({
        url: queryURL,
        method: "GET",
        success: function (response) {
            console.log(response)
            //current weather
            var currentIcon = "https://openweathermap.org/img/w/" + response.current.weather[0].icon + ".png";
            var currentTemp = response.current.temp;
            var currentHumidity = response.current.humidity;
            var currentWind = response.current.wind_speed;
            var currentUV = response.current.uvi;
            var currentPrecip = Math.round(response.daily[0].pop * 100);
            var currentDescription = response.current.weather[0].description;
            var currentDay = moment.unix(response.current.dt).format('dddd MMMM Do YYYY');
            $(".city-icon").attr("src", currentIcon);
            $(".city-description").text(currentDescription);
            $(".city-temp").text("Temperature: " + currentTemp + " °F");
            $(".city-precip").text("Precipitation: " + currentPrecip + "%")
            $(".city-humidity").text("Humidity: " + currentHumidity + "%");
            $(".city-wind").text("Wind Speed: " + currentWind + " MPH")
            $(".city-UV").text(currentUV);
            $(".city-date").text(currentDay);

            //UV Index Color Formatting
            if (currentUV < 3) {
                $(".city-UV").css("background-color", "green");
            } else if (currentUV > 2 && currentUV < 6) {
                $(".city-UV").css("background-color", "yellow");
                $(".city-UV").css("color", "black");
            } else if (currentUV > 5 && currentUV < 8) {
                $(".city-UV").css("background-color", "orange");
                $(".city-UV").css("color", "black");
            } else if (currentUV > 7 && currentUV < 11) {
                $(".city-UV").css("background-color", "red");
            } else {
                $(".city-UV").css("background-color", "#954F71");
            }

            //5 day forecast
            for (let i = 1; i < response.daily.length - 2; i++) {
                var forecastIcon = "https://openweathermap.org/img/w/" + response.daily[i].weather[0].icon + ".png";
                var forecastTemp = response.daily[i].temp.day;
                var forecastPrecip = Math.round(response.daily[i].pop * 100);
                var forecastHumidity = response.daily[i].humidity;
                var forecastDay = moment.unix(response.daily[i].dt).format('ddd D');
                $(".city-day").each(function () {
                    if (i == $(this).attr("data-value")) {
                        $(this).empty();
                        $(this).append(forecastDay);
                    }
                })
                $(".city-card-daily").each(function () {
                    if (i == $(this).attr("data-value")) {
                        $(this).empty();
                        $(this).append("Temp: " + forecastTemp + " °F" + "<br>" + "Humidity: " + forecastHumidity
                            + "%" + "<br>" + "Precipitation: " + forecastPrecip + "%");
                    }
                })
                $(".city-card-icon").each(function () {
                    if (i == $(this).attr("alt")) {
                        $(this).attr("src", forecastIcon);
                    }
                })
            }
        }
    })
}

// If no local available run default New York City
if (cityList === null) {
    $(".list-of-city-cards").css("visibility", "hidden");
    getCityCoords("New York City");
} else {
    getCityCoords(cityList[0].city);
}
