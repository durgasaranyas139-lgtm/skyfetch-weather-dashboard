// WeatherApp Constructor Function
function WeatherApp(apiKey) {
    this.apiKey = apiKey;
    this.apiUrl = 'https://api.openweathermap.org/data/2.5/weather';
    this.forecastUrl = 'https://api.openweathermap.org/data/2.5/forecast';
    
    // Existing DOM references
    this.searchBtn = document.getElementById('search-btn');
    this.cityInput = document.getElementById('city-input');
    this.weatherDisplay = document.getElementById('weather-display');
    
    // New DOM references
    this.recentSearchesSection = document.getElementById('recent-searches-section');
    this.recentSearchesContainer = document.getElementById('recent-searches-container');
    
    // Initialize recent searches array
    this.recentSearches = [];
    
    // Maximum number of recent searches
    this.maxRecentSearches = 5;
    
    // Initialize the app
    this.init();
}


WeatherApp.prototype.init = function() {
    // Existing event listeners
    this.searchBtn.addEventListener('click', this.handleSearch.bind(this));

    this.cityInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            this.handleSearch();
        }
    }.bind(this));
    
    // Load recent searches from localStorage
    this.loadRecentSearches();
    
    // Load last searched city
    this.loadLastCity();
};

WeatherApp.prototype.showWelcome = function () {

    const welcomeHTML = `
        <div class="welcome-message">
            <h2>🌤 Weather App</h2>
            <p>Enter a city name to get started!</p>
        </div>
    `;

    this.weatherDisplay.innerHTML = welcomeHTML;
};


WeatherApp.prototype.handleSearch = function () {

    const city = this.cityInput.value.trim();

    if (!city) {
        this.showError("Please enter a city name.");
        return;
    }

    if (city.length < 2) {
        this.showError("City name must be at least 2 characters.");
        return;
    }

    this.getWeather(city);

    this.cityInput.value = "";
};


WeatherApp.prototype.getWeather = async function(city) {
    this.showLoading();
    this.searchBtn.disabled = true;
    this.searchBtn.textContent = 'Searching...';
    
    const currentUrl = `${this.apiUrl}?q=${city}&appid=${this.apiKey}&units=metric`;
    
    try {
        const [currentWeather, forecastData] = await Promise.all([
            axios.get(currentUrl),
            this.getForecast(city)
        ]);
        
        this.displayWeather(currentWeather.data);
        this.displayForecast(forecastData);
        
        // Save this successful search to recent searches
        this.saveRecentSearch(city);
        
        // Save as last searched city
        localStorage.setItem('lastCity', city);
        
    } catch (error) {
        console.error('Error:', error);
        
        if (error.response && error.response.status === 404) {
            this.showError('City not found. Please check spelling and try again.');
        } else {
            this.showError('Something went wrong. Please try again later.');
        }
        
    } finally {
        this.searchBtn.disabled = false;
        this.searchBtn.textContent = 'Search';
    }
};

WeatherApp.prototype.getForecast = async function (city) {

    const url =
        `${this.forecastUrl}?q=${city}&appid=${this.apiKey}&units=metric`;

    try {

        const response = await axios.get(url);

        return response.data;

    } catch (error) {

        console.error("Forecast error:", error);

        throw error;
    }
};


WeatherApp.prototype.displayWeather = function (data) {

    const cityName = data.name;

    const temperature = Math.round(data.main.temp);

    const description = data.weather[0].description;

    const icon = data.weather[0].icon;

    const iconUrl =
        `https://openweathermap.org/img/wn/${icon}@2x.png`;

    const weatherHTML = `
        <div class="weather-info">
            <h2 class="city-name">${cityName}</h2>

            <img src="${iconUrl}" class="weather-icon">

            <div class="temperature">${temperature}°C</div>

            <p class="description">${description}</p>
        </div>
    `;

    this.weatherDisplay.innerHTML = weatherHTML;

    this.cityInput.focus();
};


WeatherApp.prototype.processForecastData = function (data) {

    const dailyForecasts = data.list.filter(function (item) {

        return item.dt_txt.includes("12:00:00");

    });

    return dailyForecasts.slice(0, 5);
};


WeatherApp.prototype.displayForecast = function (data) {

    const dailyForecasts = this.processForecastData(data);

    const forecastHTML = dailyForecasts.map(function (day) {

        const date = new Date(day.dt * 1000);

        const dayName = date.toLocaleDateString("en-US", {
            weekday: "short"
        });

        const temp = Math.round(day.main.temp);

        const description = day.weather[0].description;

        const icon = day.weather[0].icon;

        const iconUrl =
            `https://openweathermap.org/img/wn/${icon}@2x.png`;

        return `
            <div class="forecast-card">

                <h4>${dayName}</h4>

                <img src="${iconUrl}" width="60">

                <div class="forecast-temp">${temp}°C</div>

                <p class="forecast-desc">${description}</p>

            </div>
        `;

    }).join("");

    const forecastSection = `
        <div class="forecast-section">

            <h3 class="forecast-title">5-Day Forecast</h3>

            <div class="forecast-container">

                ${forecastHTML}

            </div>

        </div>
    `;

    this.weatherDisplay.innerHTML += forecastSection;
};


WeatherApp.prototype.showLoading = function () {

    const loadingHTML = `
        <div class="loading-container">
            <div class="spinner"></div>
            <p>Loading weather data...</p>
        </div>
    `;

    this.weatherDisplay.innerHTML = loadingHTML;
};


WeatherApp.prototype.showError = function (message) {

    const errorHTML = `
        <div class="error-message">

            <h3>⚠️ Oops!</h3>

            <p>${message}</p>

        </div>
    `;

    this.weatherDisplay.innerHTML = errorHTML;
};


// Create WeatherApp instance
const app = new WeatherApp(CONFIG.API_KEY);
// Create loadRecentSearches method
WeatherApp.prototype.loadRecentSearches = function() {
    // Get recent searches from localStorage
    const saved = localStorage.getItem('recentSearches');
    
    // If data exists, parse it and store in this.recentSearches
    if (saved) {
        this.recentSearches = JSON.parse(saved);
    }
    
    // Display the recent searches
    this.displayRecentSearches();
};
WeatherApp.prototype.saveRecentSearch = function(city) {
    // Convert city to title case
    const cityName = city.charAt(0).toUpperCase() + city.slice(1).toLowerCase();

    // Check if city already exists
    const index = this.recentSearches.indexOf(cityName);
    if (index > -1) {
        this.recentSearches.splice(index, 1);
    }

    // Add city to the beginning
    this.recentSearches.unshift(cityName);

    // Keep only the last 5 searches
    if (this.recentSearches.length > this.maxRecentSearches) {
        this.recentSearches.pop();
    }

    // Save to localStorage
    localStorage.setItem('recentSearches', JSON.stringify(this.recentSearches));

    // Update display
    this.displayRecentSearches();
};
WeatherApp.prototype.displayRecentSearches = function() {
    // Clear existing buttons
    this.recentSearchesContainer.innerHTML = '';

    // If no recent searches, hide the section
    if (this.recentSearches.length === 0) {
        this.recentSearchesSection.style.display = 'none';
        return;
    }

    // Show the section
    this.recentSearchesSection.style.display = 'block';

    // Create a button for each recent search
    this.recentSearches.forEach(function(city) {
        const btn = document.createElement('button');
        btn.className = 'recent-search-btn';
        btn.textContent = city;

        // Add click handler
        btn.addEventListener('click', function() {
            this.cityInput.value = city;
            this.getWeather(city);
        }.bind(this));

        this.recentSearchesContainer.appendChild(btn);
    }.bind(this));
};
WeatherApp.prototype.loadLastCity = function() {
    // Get last city from localStorage
    const lastCity = localStorage.getItem('lastCity');

    // If exists, fetch weather for that city
    if (lastCity) {
        this.getWeather(lastCity);
    } else {
        // Show welcome message if no last city
        this.showWelcome();
    }
};
<div id="recent-searches-section" class="recent-searches-section">
    <div style="display: flex; justify-content: space-between; align-items: center;">
        <h4>Recent Searches</h4>

        <button id="clear-history-btn" class="clear-history-btn">
            Clear
        </button>

    </div>
    <div id="recent-searches-container"></div>
</div>
WeatherApp.prototype.clearHistory = function() {

    // Confirm with user
    if (confirm('Clear all recent searches?')) {

        this.recentSearches = [];

        // Remove from localStorage
        localStorage.removeItem('recentSearches');

        // Refresh UI
        this.displayRecentSearches();
    }
};