import { forecast, forecastHistory } from "./script.js";

export const throwError = (message) => {
  const statusContainer = document.querySelector(".status-container");
  if (message !== "") statusContainer.textContent = message;
  statusContainer.classList.toggle("hide");
  setTimeout(() => {
    statusContainer.classList.toggle("hide");
  }, 3000);
};

async function getGeolocationWeather() {
  try {
    const position = await getCurrentPosition();
    const { latitude, longitude } = position.coords;
    const locationData = await fetchLocationData(latitude, longitude);
    const city = locationData.results[0].components.city;
    search(city);
  } catch (error) {
    throwError("Unable to retrieve geolocation data.");
  }
}

function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
}

async function fetchLocationData(latitude, longitude) {
  const apiKey = "ba4ab3be760d49c6ace293c0fdf1fa6f";
  const url = `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${apiKey}`;
  const response = await fetch(url);
  const locationData = await response.json();
  return locationData;
}
function addForecastDay(data, history = false) {
  const weekContainer = document.querySelector(".js-week-container");
  const dayTemplate = document.getElementById("day-template");

  const dayContainer = dayTemplate.content.cloneNode(true);
  const dayIcon = dayContainer.querySelector(".js-day-icon");
  const dayTempMax = dayContainer.querySelector(".js-temp-max");
  const dayTempMin = dayContainer.querySelector(".js-temp-min");
  const dayDate = dayContainer.querySelector(".js-day-date");

  dayIcon.setAttribute("src", data.day.condition.icon);
  dayTempMax.textContent = data.day.maxtemp_c;
  dayTempMin.textContent = data.day.mintemp_c;
  dayDate.textContent = data.date.substr(5, 5);
  if (history) {
    weekContainer.insertBefore(dayContainer, weekContainer.firstChild);
  } else {
    weekContainer.appendChild(dayContainer);
  }
}

function updateWeatherData(weatherData) {
  const weekContainer = document.querySelector(".js-week-container");
  const todayTemplate = document.getElementById("today-template");
  const cityName = document.querySelector(".js-city-name");
  const location = document.querySelector(".js-location");
  const date = document.querySelector(".js-date");
  const ctemperature = document.querySelector(".js-temperature");
  const condition = document.querySelector(".js-condition");
  const feelslike = document.querySelector(".js-feelslike");
  const wind = document.querySelector(".js-wind");
  const humidity = document.querySelector(".js-humidity");
  const icon = document.querySelector(".js-city-icon");

  const temperature = weatherData.current.temp_c.toFixed(0);
  ctemperature.textContent = `${temperature}`;

  cityName.textContent = `${weatherData.location.name}`;
  location.textContent = `${weatherData.location.region}, ${weatherData.location.country}`;
  date.textContent = `${weatherData.location.localtime}`;
  condition.textContent = `${weatherData.current.condition.text}`;
  feelslike.textContent = `Feels like: ${weatherData.current.feelslike_c}`;
  wind.textContent = `Wind: ${weatherData.current.wind_kph}`;
  humidity.textContent = `Humidity: ${weatherData.current.humidity} %`;

  icon.setAttribute("src", weatherData.current.condition.icon);

  const todayContainer = todayTemplate.content.cloneNode(true);
  const todayIcon = todayContainer.querySelector(".js-today-icon");
  const todayTempMax = todayContainer.querySelector(".js-temp-max");
  const todayTempMin = todayContainer.querySelector(".js-temp-min");

  todayIcon.setAttribute("src", weatherData.current.condition.icon);
  todayTempMax.textContent = weatherData.forecast.forecastday[0].day.maxtemp_c;
  todayTempMin.textContent = weatherData.forecast.forecastday[0].day.mintemp_c;
  weekContainer.innerHTML = "";
  weekContainer.appendChild(todayContainer);
}

export function eventHandler() {
  const btnSearch = document.querySelector(".js-btn-search");
  const inputSearch = document.querySelector(".js-input-search");

  const search = (city) => {
    //format city name
    const cityClean = city.normalize("NFD").replace(/\p{Mn}/gu, "");

    const weatherData = forecast(cityClean);
    const historyDayOne = forecastHistory(cityClean, 1);
    const historyDayTwo = forecastHistory(cityClean, 2);
    weatherData
      .then((data) => {
        if ("error" in data) {
          throwError("Not found.");
          return;
        }
        updateWeatherData(data);
        addForecastDay(data.forecast.forecastday[1]);
        addForecastDay(data.forecast.forecastday[2]);
        historyDayOne.then((data) => {
          addForecastDay(data.forecast.forecastday[0], true);
        });
        historyDayTwo.then((data) => {
          addForecastDay(data.forecast.forecastday[0], true);
        });
      })
      .catch((err) => {
        console.log("catch: ", err);
        return;
      });
  };
  const handleGeolocationWeather = async () => {
    try {
      const position = await getCurrentPosition();
      const { latitude, longitude } = position.coords;
      const locationData = await fetchLocationData(latitude, longitude);
      const city = locationData.results[0].components.city;
      search(city);
    } catch (error) {
      throwError("Unable to retrieve geolocation data.");
    }
  };

  btnSearch.addEventListener("click", () => {
    const city = inputSearch.value;
    if (city !== "") {
      search(city);
    }
  });

  inputSearch.addEventListener("keydown", (key) => {
    const city = inputSearch.value;
    if (key.keyCode === 13 && city !== "") {
      search(city);
    }
  });

  document.addEventListener('DOMContentLoaded', () => {
    handleGeolocationWeather();
  });
}
