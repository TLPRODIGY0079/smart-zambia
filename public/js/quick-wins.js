// Quick Win Features for Smart Zambia
// Dark Mode, Share, Favorites, Search History, Weather, Currency, Notifications

// ============================================
// FEATURE 1: DARK MODE TOGGLE
// ============================================
function toggleDarkMode() {
  const html = document.documentElement;
  const isDark = html.classList.toggle('dark');
  
  // Save preference to localStorage
  localStorage.setItem('darkMode', isDark ? 'enabled' : 'disabled');
  
  // Show toast notification
  if (window.showAchievementToast) {
    showAchievementToast(
      isDark ? 'Dark Mode Enabled' : 'Light Mode Enabled',
      isDark ? 'Easy on the eyes!' : 'Bright and clear!'
    );
  }
}

// Initialize dark mode from localStorage
function initDarkMode() {
  const darkMode = localStorage.getItem('darkMode');
  if (darkMode === 'enabled') {
    document.documentElement.classList.add('dark');
  } else if (darkMode === null) {
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.add('dark');
    }
  }
}

// ============================================
// FEATURE 2: SHARE DESTINATION
// ============================================
function shareDestination(destination) {
  const url = `${window.location.origin}?destination=${destination.id}`;
  const text = `Check out ${destination.name} in Zambia! ${destination.description}`;
  
  // Check if Web Share API is available
  if (navigator.share) {
    navigator.share({
      title: `Smart Zambia - ${destination.name}`,
      text: text,
      url: url
    }).then(() => {
      if (window.showAchievementToast) {
        showAchievementToast('Shared!', 'Thanks for spreading the word!');
      }
      if (window.addScore) addScore(5);
    }).catch(err => console.log('Share cancelled'));
  } else {
    // Fallback: Show share modal with social media links
    showShareModal(destination, url, text);
  }
}

function showShareModal(destination, url, text) {
  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(text);
  
  const modal = document.createElement('div');
  modal.className = 'modal-overlay active';
  modal.innerHTML = `
    <div class="modal-content p-8 max-w-md">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold gradient-text">Share ${destination.name}</h2>
        <button onclick="this.closest('.modal-overlay').remove()" class="text-2xl" style="color: var(--text-secondary)">&times;</button>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <a href="https://wa.me/?text=${encodedText}%20${encodedUrl}" target="_blank" class="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-gray-50 transition-all" style="background: var(--bg-primary); text-decoration: none;">
          <i class="fab fa-whatsapp text-4xl text-green-500"></i>
          <span style="color: var(--text-primary)">WhatsApp</span>
        </a>
        <a href="https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}" target="_blank" class="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-gray-50 transition-all" style="background: var(--bg-primary); text-decoration: none;">
          <i class="fab fa-facebook text-4xl text-blue-600"></i>
          <span style="color: var(--text-primary)">Facebook</span>
        </a>
        <a href="https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}" target="_blank" class="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-gray-50 transition-all" style="background: var(--bg-primary); text-decoration: none;">
          <i class="fab fa-twitter text-4xl text-blue-400"></i>
          <span style="color: var(--text-primary)">Twitter</span>
        </a>
        <button onclick="copyToClipboard('${url}')" class="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-gray-50 transition-all" style="background: var(--bg-primary);">
          <i class="fas fa-copy text-4xl text-gray-600"></i>
          <span style="color: var(--text-primary)">Copy Link</span>
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  
  // Close on outside click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    if (window.showAchievementToast) {
      showAchievementToast('Link Copied!', 'Share it with your friends');
    }
  });
}

// ============================================
// FEATURE 3: FAVORITE/BOOKMARK DESTINATIONS
// ============================================
async function toggleFavorite(destinationId) {
  try {
    // Check if using API or localStorage
    if (window.FavoritesAPI && window.AuthAPI && window.AuthAPI.isLoggedIn()) {
      // Use API
      const favorites = await window.FavoritesAPI.getAll();
      const isFav = favorites.some(f => f.id === destinationId);
      
      if (isFav) {
        await window.FavoritesAPI.remove(destinationId);
        if (window.showAchievementToast) {
          showAchievementToast('Removed from Favorites', 'Destination unbookmarked');
        }
      } else {
        await window.FavoritesAPI.add(destinationId);
        if (window.showAchievementToast) {
          showAchievementToast('Added to Favorites!', '+5 XP for bookmarking');
        }
        if (window.addScore) addScore(5);
      }
    } else {
      // Fallback to localStorage
      let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
      const index = favorites.indexOf(destinationId);
      
      if (index > -1) {
        favorites.splice(index, 1);
        if (window.showAchievementToast) {
          showAchievementToast('Removed from Favorites', 'Destination unbookmarked');
        }
      } else {
        favorites.push(destinationId);
        if (window.showAchievementToast) {
          showAchievementToast('Added to Favorites!', '+5 XP for bookmarking');
        }
        if (window.addScore) addScore(5);
      }
      
      localStorage.setItem('favorites', JSON.stringify(favorites));
    }
    
    updateFavoriteButtons();
  } catch (error) {
    console.error('Error toggling favorite:', error);
    alert('Failed to update favorites. Please try again.');
  }
}

async function isFavorite(destinationId) {
  try {
    if (window.FavoritesAPI && window.AuthAPI && window.AuthAPI.isLoggedIn()) {
      const favorites = await window.FavoritesAPI.getAll();
      return favorites.some(f => f.id === destinationId);
    } else {
      const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
      return favorites.includes(destinationId);
    }
  } catch (error) {
    console.error('Error checking favorite:', error);
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    return favorites.includes(destinationId);
  }
}

async function updateFavoriteButtons() {
  // Update all favorite button states
  const buttons = document.querySelectorAll('[data-favorite-btn]');
  for (const btn of buttons) {
    const destId = parseInt(btn.dataset.destinationId);
    const icon = btn.querySelector('i');
    const isFav = await isFavorite(destId);
    if (isFav) {
      icon.classList.remove('far');
      icon.classList.add('fas');
      icon.classList.add('text-red-500');
      icon.classList.remove('text-gray-600');
    } else {
      icon.classList.remove('fas');
      icon.classList.add('far');
      icon.classList.remove('text-red-500');
      icon.classList.add('text-gray-600');
    }
  }
}

async function getFavorites() {
  try {
    if (window.FavoritesAPI && window.AuthAPI && window.AuthAPI.isLoggedIn()) {
      const favorites = await window.FavoritesAPI.getAll();
      return favorites.map(f => f.id);
    } else {
      return JSON.parse(localStorage.getItem('favorites') || '[]');
    }
  } catch (error) {
    console.error('Error getting favorites:', error);
    return JSON.parse(localStorage.getItem('favorites') || '[]');
  }
}

// ============================================
// FEATURE 4: SEARCH HISTORY
// ============================================
function addToSearchHistory(query) {
  if (!query || query.trim() === '') return;
  
  let history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
  
  // Remove if already exists
  history = history.filter(item => item.query !== query);
  
  // Add to beginning
  history.unshift({
    query: query,
    timestamp: new Date().toISOString()
  });
  
  // Keep only last 10 searches
  history = history.slice(0, 10);
  
  localStorage.setItem('searchHistory', JSON.stringify(history));
}

function getSearchHistory() {
  return JSON.parse(localStorage.getItem('searchHistory') || '[]');
}

function clearSearchHistory() {
  localStorage.removeItem('searchHistory');
  if (window.showAchievementToast) {
    showAchievementToast('History Cleared', 'Search history deleted');
  }
}

function showSearchHistory() {
  const history = getSearchHistory();
  if (history.length === 0) return '';
  
  return `
    <div class="absolute top-full left-0 right-0 mt-2 rounded-2xl shadow-lg z-50" style="background: var(--bg-card); border: 1px solid var(--border-color);">
      <div class="p-3 border-b flex justify-between items-center" style="border-color: var(--border-color)">
        <span class="text-sm font-semibold" style="color: var(--text-secondary)">Recent Searches</span>
        <button onclick="clearSearchHistory(); this.closest('div').parentElement.remove();" class="text-xs text-red-500 hover:text-red-600">Clear</button>
      </div>
      <div class="p-2">
        ${history.map(item => `
          <button onclick="document.getElementById('searchInput').value='${item.query}'; document.getElementById('searchInput').dispatchEvent(new Event('input')); this.closest('.absolute').remove();" 
                  class="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2 transition-all">
            <i class="fas fa-history text-sm" style="color: var(--text-secondary)"></i>
            <span style="color: var(--text-primary)">${item.query}</span>
          </button>
        `).join('')}
      </div>
    </div>
  `;
}

// ============================================
// FEATURE 5: WEATHER WIDGET
// ============================================
async function getWeather(lat, lng, locationName) {
  // Using Open-Meteo API (free, no API key required)
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true&timezone=Africa/Lusaka`
    );
    const data = await response.json();
    
    return {
      temperature: Math.round(data.current_weather.temperature),
      weatherCode: data.current_weather.weathercode,
      windSpeed: data.current_weather.windspeed,
      location: locationName
    };
  } catch (error) {
    console.error('Weather fetch failed:', error);
    return null;
  }
}

function getWeatherIcon(weatherCode) {
  // WMO Weather interpretation codes
  if (weatherCode === 0) return '☀️';
  if (weatherCode <= 3) return '⛅';
  if (weatherCode <= 48) return '🌫️';
  if (weatherCode <= 67) return '🌧️';
  if (weatherCode <= 77) return '🌨️';
  if (weatherCode <= 82) return '🌧️';
  if (weatherCode <= 86) return '🌨️';
  return '⛈️';
}

function getWeatherDescription(weatherCode) {
  if (weatherCode === 0) return 'Clear sky';
  if (weatherCode <= 3) return 'Partly cloudy';
  if (weatherCode <= 48) return 'Foggy';
  if (weatherCode <= 67) return 'Rainy';
  if (weatherCode <= 77) return 'Snowy';
  if (weatherCode <= 82) return 'Rain showers';
  if (weatherCode <= 86) return 'Snow showers';
  return 'Thunderstorm';
}

// ============================================
// FEATURE 6: CURRENCY CONVERTER
// ============================================
function convertCurrency(amount, fromCurrency = 'USD', toCurrency = 'ZMW') {
  // Exchange rates (Current rate: 1 USD = 19 ZMW as of 2024)
  const rates = {
    'USD_TO_ZMW': 19.0,
    'ZMW_TO_USD': 1 / 19.0  // 0.0526
  };
  
  if (fromCurrency === 'USD' && toCurrency === 'ZMW') {
    return Math.round(amount * rates.USD_TO_ZMW * 100) / 100;
  } else if (fromCurrency === 'ZMW' && toCurrency === 'USD') {
    return Math.round(amount * rates.ZMW_TO_USD * 100) / 100;
  }
  return amount;
}

function showCurrencyConverter() {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay active';
  modal.innerHTML = `
    <div class="modal-content p-8 max-w-md">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold gradient-text">Currency Converter</h2>
        <button onclick="this.closest('.modal-overlay').remove()" class="text-2xl" style="color: var(--text-secondary)">&times;</button>
      </div>
      
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-semibold mb-2" style="color: var(--text-secondary)">Amount (USD)</label>
          <input type="number" id="usdAmount" value="100" class="input-field" oninput="updateConversion()">
        </div>
        
        <div class="text-center">
          <i class="fas fa-exchange-alt text-2xl" style="color: var(--text-secondary)"></i>
        </div>
        
        <div>
          <label class="block text-sm font-semibold mb-2" style="color: var(--text-secondary)">Amount (ZMW)</label>
          <input type="number" id="zmwAmount" value="1900" class="input-field" oninput="updateConversionReverse()">
        </div>
        
        <div class="p-4 rounded-xl" style="background: var(--bg-primary)">
          <p class="text-sm" style="color: var(--text-secondary)">Exchange Rate</p>
          <p class="text-lg font-bold" style="color: var(--text-primary)">1 USD = 19.00 ZMW</p>
          <p class="text-xs mt-1" style="color: var(--text-secondary)">Current market rate</p>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  
  // Close on outside click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });
}

function updateConversion() {
  const usd = parseFloat(document.getElementById('usdAmount').value) || 0;
  const zmw = convertCurrency(usd, 'USD', 'ZMW');
  document.getElementById('zmwAmount').value = zmw;
}

function updateConversionReverse() {
  const zmw = parseFloat(document.getElementById('zmwAmount').value) || 0;
  const usd = convertCurrency(zmw, 'ZMW', 'USD');
  document.getElementById('usdAmount').value = usd;
}

// ============================================
// FEATURE 7: BROWSER NOTIFICATIONS
// ============================================
async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return false;
  }
  
  if (Notification.permission === 'granted') {
    return true;
  }
  
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      if (window.showAchievementToast) {
        showAchievementToast('Notifications Enabled!', 'Stay updated on your adventures');
      }
      return true;
    }
  }
  
  return false;
}

function sendNotification(title, body, icon = '/assets/icon-192.png') {
  if (Notification.permission === 'granted') {
    new Notification(title, {
      body: body,
      icon: icon,
      badge: icon,
      tag: 'smart-zambia',
      requireInteraction: false
    });
  }
}

function notifyBookingConfirmation(bookingType, name) {
  sendNotification(
    'Booking Confirmed! 🎉',
    `Your ${bookingType} "${name}" has been confirmed. Get ready for an amazing experience!`
  );
}

function notifyAchievement(achievement) {
  sendNotification(
    'New Achievement Unlocked! 🏆',
    achievement
  );
}

// ============================================
// INITIALIZATION
// ============================================
function initQuickWins() {
  // Initialize dark mode
  initDarkMode();
  
  // Request notification permission after user interaction
  setTimeout(() => {
    if (Notification.permission === 'default') {
      // Don't auto-request, wait for user action
      console.log('Notifications available - will request on first booking');
    }
  }, 5000);
  
  // Update favorite buttons on page load
  updateFavoriteButtons();
}

// Export functions to window
window.toggleDarkMode = toggleDarkMode;
window.shareDestination = shareDestination;
window.toggleFavorite = toggleFavorite;
window.isFavorite = isFavorite;
window.getFavorites = getFavorites;
window.addToSearchHistory = addToSearchHistory;
window.getSearchHistory = getSearchHistory;
window.showSearchHistory = showSearchHistory;
window.getWeather = getWeather;
window.getWeatherIcon = getWeatherIcon;
window.getWeatherDescription = getWeatherDescription;
window.showCurrencyConverter = showCurrencyConverter;
window.convertCurrency = convertCurrency;
window.requestNotificationPermission = requestNotificationPermission;
window.sendNotification = sendNotification;
window.notifyBookingConfirmation = notifyBookingConfirmation;
window.notifyAchievement = notifyAchievement;

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initQuickWins);
} else {
  initQuickWins();
}
