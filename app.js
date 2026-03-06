// Your OpenWeatherMap API Key
const API_KEY = '3ccf1111ce4986c8029486ec2113c611';  // Replace with your actual API key
const API_URL = 'https://api.openweathermap.org/data/2.5/weather';

// Function to fetch weather data using async/await
async function getWeather(city) {

    showLoading();

    searchBtn.disabled = true;
    searchBtn.textContent = "Searching...";

    const url = `${API_URL}?q=${city}&appid=${API_KEY}&units=metric`;

    try {

        const response = await axios.get(url);

        displayWeather(response.data);

    } catch (error) {

        if (error.response && error.response.status === 404) {
            showError("City not found.");
        } else {
            showError("Something went wrong.");
        }

    } finally {

        searchBtn.disabled = false;
        searchBtn.textContent = "🔍 Search";
    }
}

// Function to display weather data
function displayWeather(data) {
    // Extract the data we need
    const cityName = data.name;
    const temperature = Math.round(data.main.temp);
    const description = data.weather[0].description;
    const icon = data.weather[0].icon;
    const iconUrl = `https://openweathermap.org/img/wn/${icon}@2x.png`;
    
    // Create HTML to display
    const weatherHTML = `
        <div class="weather-info">
            <h2 class="city-name">${cityName}</h2>
            <img src="${iconUrl}" alt="${description}" class="weather-icon">
            <div class="temperature">${temperature}°C</div>
            <p class="description">${description}</p>
        </div>
    `;
    
    // Put it on the page
    document.getElementById('weather-display').innerHTML = weatherHTML;
    cityInput.focus();
}
// Function to display error messages
function showError(message) {
    // Create error message HTML
    const errorHTML = `
        <div class="error-message">
            <h3>⚠️ Oops! Something went wrong</h3>
            <p>${message}</p>
        </div>
    `;

    // Display the error inside weather-display div
    document.getElementById('weather-display').innerHTML = errorHTML;
}
function showLoading() {
    const loadingHTML = `
        <div class="loading-container">
            <div class="spinner"></div>
            <p>Loading weather data...</p>
        </div>
    `;

    document.getElementById('weather-display').innerHTML = loadingHTML;
}
// Get references to HTML elements
const searchBtn = document.getElementById('search-btn');
const cityInput = document.getElementById('city-input');

// Click event for search button
searchBtn.addEventListener('click', function () {
    const city = cityInput.value.trim();

    if (!city) {
    showError("Please enter a city name.");
    return;
}

if (city.length < 2) {
    showError("City name must be at least 2 characters.");
    return;
}

    getWeather(city);
    cityInput.value = ""; // clear input
});

// Enter key support
cityInput.addEventListener('keypress', function (event) {
    if (event.key === 'Enter') {
        const city = cityInput.value.trim();

        if (!city) {
            showError("Please enter a city name.");
            return;
        }

        getWeather(city);
        cityInput.value = "";
    }
});
// Call the function when page loads
//getWeather('New York');
document.getElementById('weather-display').innerHTML = `
    <div class="welcome-message">
        <h2>🌤 Weather App</h2>
        <p>Enter a city name to get started!</p>
    </div>
`;

// Your OpenWeatherMap API Key
const API_KEY = '3ccf1111ce4986c8029486ec2113c611';  // Replace with your actual API key
const API_URL = 'https://api.openweathermap.org/data/2.5/weather';

// Function to fetch weather data
function getWeather(city) {
    // Build the complete URL
    const url = `${API_URL}?q=${city}&appid=${API_KEY}&units=metric`;
    
    // Make API call using Axios
    axios.get(url)
        .then(function(response) {
            // Success! We got the data
            console.log('Weather Data:', response.data);
            displayWeather(response.data);
        })
        .catch(function(error) {
            // Something went wrong
            console.error('Error fetching weather:', error);
            document.getElementById('weather-display').innerHTML = 
                '<p class="loading">Could not fetch weather data. Please try again.</p>';
        });
}

// Function to display weather data
function displayWeather(data) {
    // Extract the data we need
    const cityName = data.name;
    const temperature = Math.round(data.main.temp);
    const description = data.weather[0].description;
    const icon = data.weather[0].icon;
    const iconUrl = `https://openweathermap.org/img/wn/${icon}@2x.png`;
    
    // Create HTML to display
    const weatherHTML = `
        <div class="weather-info">
            <h2 class="city-name">${cityName}</h2>
            <img src="${iconUrl}" alt="${description}" class="weather-icon">
            <div class="temperature">${temperature}°C</div>
            <p class="description">${description}</p>
        </div>
    `;
    
    // Put it on the page
    document.getElementById('weather-display').innerHTML = weatherHTML;
}

// Call the function when page loads
getWeather('London');
