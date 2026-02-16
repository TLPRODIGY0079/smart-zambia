// API Integration Layer for Smart Zambia
// This file bridges the existing frontend code with the new backend API
// Note: This file depends on api-config.js being loaded first

// ============================================
// ENHANCED AUTHENTICATION FUNCTIONS
// ============================================

// Override the existing handleLogin function
window.handleLoginAPI = async function(e) {
  e.preventDefault();
  
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  
  if (!email || !password) {
    alert('Please enter email and password');
    return;
  }
  
  try {
    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Logging in...';
    submitBtn.disabled = true;
    
    // Call backend API
    const data = await window.AuthAPI.login(email, password);
    
    // Update global state
    if (window.state) {
      window.state.isLoggedIn = true;
      window.state.user = {
        name: data.user.fullName,
        email: data.user.email,
        id: data.user.id,
        role: data.user.role,
        cashEarned: data.user.cashEarned
      };
    }
    
    // Hide login screen, show main app
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('mainApp').classList.remove('hidden');
    document.getElementById('userWelcome').textContent = data.user.fullName;
    document.getElementById('userInitial').textContent = data.user.fullName.charAt(0).toUpperCase();
    
    // Initialize app
    if (typeof initApp === 'function') {
      initApp();
    }
    
    // Load destinations from API
    await loadDestinationsFromAPI();
    
    // Show success message
    if (typeof showAchievementToast === 'function') {
      showAchievementToast('Welcome Back!', `Hello ${data.user.fullName}!`);
    }
    
  } catch (error) {
    console.error('Login error:', error);
    alert('Login failed: ' + error.message);
    
    // Reset button
    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.innerHTML = '<i class="fas fa-sign-in-alt mr-2"></i>Explore Zambia';
    submitBtn.disabled = false;
  }
};

// Override the existing handleRegister function
window.handleRegisterAPI = async function(e) {
  e.preventDefault();
  
  const fullName = document.getElementById('registerName').value;
  const email = document.getElementById('registerEmail').value;
  const password = document.getElementById('registerPassword').value;
  
  if (!fullName || !email || !password) {
    alert('Please fill in all fields');
    return;
  }
  
  if (password.length < 6) {
    alert('Password must be at least 6 characters');
    return;
  }
  
  try {
    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Creating account...';
    submitBtn.disabled = true;
    
    // Call backend API
    const data = await window.AuthAPI.register(fullName, email, password);
    
    // Update global state
    if (window.state) {
      window.state.isLoggedIn = true;
      window.state.user = {
        name: data.user.fullName,
        email: data.user.email,
        id: data.user.id,
        role: data.user.role,
        cashEarned: data.user.cashEarned
      };
    }
    
    // Hide login screen, show main app
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('mainApp').classList.remove('hidden');
    document.getElementById('userWelcome').textContent = data.user.fullName;
    document.getElementById('userInitial').textContent = data.user.fullName.charAt(0).toUpperCase();
    
    // Initialize app
    if (typeof initApp === 'function') {
      initApp();
    }
    
    // Load destinations from API
    await loadDestinationsFromAPI();
    
    // Show success message
    if (typeof showAchievementToast === 'function') {
      showAchievementToast('Account Created!', `Welcome ${data.user.fullName}!`);
    }
    
  } catch (error) {
    console.error('Registration error:', error);
    alert('Registration failed: ' + error.message);
    
    // Reset button
    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.innerHTML = '<i class="fas fa-user-plus mr-2"></i>Create Account';
    submitBtn.disabled = false;
  }
};

// Enhanced logout function
window.logoutAPI = function() {
  window.AuthAPI.logout();
  
  if (window.state) {
    window.state.isLoggedIn = false;
    window.state.user = null;
  }
  
  document.getElementById('mainApp').classList.add('hidden');
  document.getElementById('loginScreen').classList.remove('hidden');
};

// ============================================
// DESTINATIONS API INTEGRATION
// ============================================

async function loadDestinationsFromAPI() {
  try {
    console.log('Loading destinations from API...');
    const destinations = await window.DestinationsAPI.getAll();
    
    // Update global destinations array
    if (window.destinations) {
      window.destinations = destinations;
    }
    
    // Re-render destinations if function exists
    if (typeof renderDestinations === 'function') {
      renderDestinations();
    }
    
    console.log(`Loaded ${destinations.length} destinations from API`);
    return destinations;
  } catch (error) {
    console.error('Failed to load destinations from API:', error);
    console.log('Using hardcoded destinations as fallback');
    // Fallback to hardcoded destinations
    return window.destinations || [];
  }
}

// ============================================
// FAVORITES API INTEGRATION
// ============================================

window.addToWishlistAPI = async function() {
  if (!window.state || !window.state.currentDestination) return;
  
  const destinationId = window.state.currentDestination.id;
  
  try {
    await window.FavoritesAPI.add(destinationId);
    
    // Update local state
    if (!window.state.wishlist.includes(destinationId)) {
      window.state.wishlist.push(destinationId);
    }
    
    if (typeof showAchievementToast === 'function') {
      showAchievementToast('Added to Wishlist!', window.state.currentDestination.name);
    }
    
    if (typeof addScore === 'function') {
      addScore(5);
    }
  } catch (error) {
    console.error('Failed to add to wishlist:', error);
    alert('Failed to add to wishlist. Please try again.');
  }
};

window.loadFavoritesAPI = async function() {
  try {
    const favorites = await window.FavoritesAPI.getAll();
    
    // Update local state
    if (window.state) {
      window.state.wishlist = favorites.map(f => f.id);
    }
    
    return favorites;
  } catch (error) {
    console.error('Failed to load favorites:', error);
    return [];
  }
};

// ============================================
// SEARCH HISTORY API INTEGRATION
// ============================================

window.saveSearchQueryAPI = async function(query) {
  if (!query || query.trim().length === 0) return;
  
  try {
    await window.SearchHistoryAPI.save(query.trim());
    console.log('Search query saved:', query);
  } catch (error) {
    console.error('Failed to save search query:', error);
    // Don't show error to user, just log it
  }
};

window.loadSearchHistoryAPI = async function() {
  try {
    const history = await window.SearchHistoryAPI.getAll();
    return history.map(h => h.query);
  } catch (error) {
    console.error('Failed to load search history:', error);
    return [];
  }
};

// ============================================
// NOTIFICATIONS API INTEGRATION
// ============================================

window.loadNotificationsAPI = async function() {
  try {
    const notifications = await window.NotificationsAPI.getAll();
    return notifications;
  } catch (error) {
    console.error('Failed to load notifications:', error);
    return [];
  }
};

window.markNotificationReadAPI = async function(notificationId) {
  try {
    await window.NotificationsAPI.markAsRead(notificationId);
    console.log('Notification marked as read:', notificationId);
  } catch (error) {
    console.error('Failed to mark notification as read:', error);
  }
};

// ============================================
// AUTO-LOGIN ON PAGE LOAD
// ============================================

window.checkAutoLogin = function() {
  if (window.AuthAPI && window.AuthAPI.isLoggedIn()) {
    const user = window.AuthAPI.getCurrentUser();
    
    if (user && window.state) {
      window.state.isLoggedIn = true;
      window.state.user = {
        name: user.fullName,
        email: user.email,
        id: user.id,
        role: user.role,
        cashEarned: user.cashEarned
      };
      
      // Hide login screen, show main app
      document.getElementById('loginScreen').classList.add('hidden');
      document.getElementById('mainApp').classList.remove('hidden');
      document.getElementById('userWelcome').textContent = user.fullName;
      document.getElementById('userInitial').textContent = user.fullName.charAt(0).toUpperCase();
      
      // Initialize app
      if (typeof initApp === 'function') {
        initApp();
      }
      
      // Load destinations from API
      loadDestinationsFromAPI();
      
      console.log('Auto-login successful:', user.fullName);
    }
  }
};

// ============================================
// INITIALIZATION
// ============================================

// Check for auto-login when page loads
document.addEventListener('DOMContentLoaded', () => {
  console.log('API Integration loaded');
  // Wait a bit for API config to load
  setTimeout(() => {
    if (window.AuthAPI) {
      checkAutoLogin();
    }
  }, 100);
});

// Make functions globally available
window.loadDestinationsFromAPI = loadDestinationsFromAPI;
