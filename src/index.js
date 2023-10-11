let currentLocation = null; // Global variable to store the current location

// Function to get the user's current location
async function getCurrentLocation() {
    return new Promise((resolve, reject) => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(resolve, reject);
        } else {
            reject("Geolocation is not available in this browser.");
        }
    });
}

// Function to perform reverse geocoding and set the currentLocation variable
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
            const city = data.results[0].components.city || data.results[0].components.town;
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

// Function to fetch and display weather data
async function fetchAndDisplayWeather(location) {
    const apiKey = '162d82459c2f4ebf8e0153904232209';
    const apiUrl = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${location}`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error("Network response was not ok.");
        }

        const data = await response.json();
        const weatherElement = document.getElementById("weather");
        if (data.location && data.current) {
            weatherElement.textContent = `Location: ${data.location.name}, Temperature: ${data.current.temp_c}°C, Weather: ${data.current.condition.text}`;
        } else {
            weatherElement.textContent = "Weather information not found for this location.";
        }
    } catch (error) {
        console.error("Error fetching weather data:", error);
    }
}

// Handle the search button click
const searchButton = document.getElementById("search-button");
searchButton.addEventListener("click", async function() {
    const locationInput = document.getElementById("location-input");
    const location = locationInput.value;
    if (location) {
        const apiKey = '162d82459c2f4ebf8e0153904232209';
        const apiUrl = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${location}`;

        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error("Network response was not ok.");
            }

            const data = await response.json();
            const weatherElement = document.getElementById("weather");
            if (data.location && data.current) {
                weatherElement.textContent = `Location: ${data.location.name}, Temperature: ${data.current.temp_c}°C, Weather: ${data.current.condition.text}`;
            } else {
                weatherElement.textContent = "Weather information not found for this location.";
            }
        } catch (error) {
            console.error("Error fetching weather data:", error);
        }
    }
});

// Call functions to get the user's location and display the weather when the page loads
window.addEventListener("load", async () => {
    await getCurrentLocationName(); // Get the user's current location
    await fetchAndDisplayWeather(currentLocation); // Fetch and display weather data
});
