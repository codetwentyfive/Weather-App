let currentLocation = null; // Global variable to store the current location

let currentWeatherInfo = {
  location: "",
  temperature: "",
  condition: "",
};

/**
 * Retrieves the user's current location using the browser's geolocation API.
 * @returns {Promise<Position>} A promise that resolves with the user's current position.
 * @throws {string} If geolocation is not available in the browser.
 */
async function getCurrentLocation() {
  return new Promise((resolve, reject) => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    } else {
      reject("Geolocation is not available in this browser.");
    }
  });
}

/**
 * Retrieves the user's current location name and displays it on the webpage.
 * @returns {Promise<void>} A promise that resolves when the location is fetched and displayed.
 */
async function getCurrentLocationName() {
  try {
    const location = await getCurrentLocation();
    const latitude = location.coords.latitude;
    const longitude = location.coords.longitude;

    // Reverse geocoding request using the OpenCage Data API
    const reverseGeocodeApiUrl = `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=ba4ab3be760d49c6ace293c0fdf1fa6f`;
    const response = await fetch(reverseGeocodeApiUrl);

    if (!response.ok) {
      throw new Error("Reverse geocoding request failed.");
    }

    const data = await response.json();
    if (data.results && data.results.length > 0) {
      const city =
        data.results[0].components.city || data.results[0].components.town;
      currentLocation = city; // Store the current location in the global variable
      const locationElement = document.getElementById("location");
      locationElement.textContent = `Current Location: ${city}`;
    } else {
      currentLocation = "Location not found"; // Handle the case where location is not found
    }
  } catch (error) {
    console.error("Error fetching location data:", error);
  }
}

/**
 * Fetches and displays the weather data for a given location.
 * @param {string} location - The location for which to fetch the weather data.
 * @returns {Promise<void>} A promise that resolves when the weather data is fetched and displayed.
 */
async function fetchAndDisplayWeather(location) {
  const apiKey = "162d82459c2f4ebf8e0153904232209";
  const apiUrl = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${location}`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error("Network response was not ok.");
    }

    const data = await response.json();
    const weatherElement = document.getElementById("weather");
    if (data.location && data.current) {
      currentWeatherInfo.location = data.location.name;
      currentWeatherInfo.temperature = `${data.current.temp_c}°C`;
      currentWeatherInfo.condition = data.current.condition.text;

      const weatherInfo = `Location: ${currentWeatherInfo.location}, Temperature: ${currentWeatherInfo.temperature}, Weather: ${currentWeatherInfo.condition}`;
      weatherElement.textContent = weatherInfo;
    } else {
      weatherElement.textContent =
        "Weather information not found for this location.";
      // Clear the properties in case of an error
      currentWeatherInfo.location = "";
      currentWeatherInfo.temperature = "";
      currentWeatherInfo.condition = "";
    }
  } catch (error) {
    console.error("Error fetching weather data:", error);
    // Clear the properties in case of an error
    currentWeatherInfo.location = "";
    currentWeatherInfo.temperature = "";
    currentWeatherInfo.condition = "";
  }
}

// Handle the search button click
const searchButton = document.getElementById("search-button");
searchButton.addEventListener("click", async function () {
  const locationInput = document.getElementById("location-input");
  const location = locationInput.value;
  if (location) {
    const apiKey = "162d82459c2f4ebf8e0153904232209";
    const apiUrl = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${location}`;

    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error("Network response was not ok.");
      }
      const data = await response.json();
      const weatherElement = document.getElementById("weather");
      if (data.location && data.current) {
        currentWeatherInfo.location = data.location.name;
        currentWeatherInfo.temperature = `${data.current.temp_c}°C`;
        currentWeatherInfo.condition = data.current.condition.text;

        const weatherInfo = `Location: ${currentWeatherInfo.location}, Temperature: ${currentWeatherInfo.temperature}, Weather: ${currentWeatherInfo.condition}`;
        weatherElement.textContent = weatherInfo;
      } else {
        weatherElement.textContent =
          "Weather information not found for this location.";
        // Clear the properties in case of an error
        currentWeatherInfo.location = "";
        currentWeatherInfo.temperature = "";
        currentWeatherInfo.condition = "";
      }
    } catch (error) {
      console.error("Error fetching weather data:", error);
      // Clear the properties in case of an error
      currentWeatherInfo.location = "";
      currentWeatherInfo.temperature = "";
      currentWeatherInfo.condition = "";
    }
  }
  displayGifForCurrentWeather();
});

/**
 * Displays a GIF based on the current weather condition.
 * @returns {Promise<void>} A promise that resolves when the GIF is fetched and displayed.
 */
async function displayGifForCurrentWeather() {
  const giphyApiKey = "03jvLycdCqOiaZgJKu2fi2NlzRV0ANHt";
  // Create a query based on the current weather condition
  const query = currentWeatherInfo.condition;

  // Construct the Giphy API URL
  const giphyApiUrl = `https://api.giphy.com/v1/stickers/random?api_key=${giphyApiKey}&offset=0&tag=${query}`;

  try {
    const response = await fetch(giphyApiUrl);
    if (!response.ok) {
      throw new Error("Giphy API request failed.");
    }

    const data = await response.json();
    if (data.data && data.data.images) {
      const gifUrl = data.data.images.original.url;
      const gifElement = document.getElementById("gif");
      gifElement.innerHTML = `<img src="${gifUrl}" alt="${query} GIF">`;
    } else {
      console.error("No GIFs found for the given query.");
    }
  } catch (error) {
    console.error("Error fetching GIF data:", error);
  }
}

// Call functions to get the user's location and display the weather when the page loads
window.addEventListener("load", async () => {
  await getCurrentLocationName(); // Get the user's current location
  await fetchAndDisplayWeather(currentLocation); // Fetch and display weather data
  await displayGifForCurrentWeather(); // Display a GIF for the current weather
});
