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
    
    // Load user profile data from backend
    await window.loadUserProfileData();
    
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
    
    // Load user profile data from backend (new user will have defaults)
    await window.loadUserProfileData();
    
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
// USER PROFILE DATA SYNC
// ============================================

// Load user profile data from backend
window.loadUserProfileData = async function() {
  if (!window.AuthAPI || !window.AuthAPI.isLoggedIn()) {
    console.log('Not logged in, skipping profile data load');
    return null;
  }
  
  try {
    console.log('Fetching profile data from backend...');
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${window.API_BASE_URL}/api/me/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to load profile data');
    }
    
    const data = await response.json();
    
    console.log('Backend profile data received:', data);
    
    // Update window.state with backend data
    if (window.state) {
      window.state.score = data.user.xp || 0;
      window.state.level = data.user.level || 1;
      window.state.cashEarned = data.user.cashEarned || 0;
      window.state.loginStreak = data.user.loginStreak || 0;
      window.state.lastLogin = data.user.lastLogin;
      window.state.visitedDestinations = data.visitedDestinations || [];
      window.state.achievements = data.achievements || [];
      
      console.log('Updated window.state:', {
        score: window.state.score,
        level: window.state.level,
        cashEarned: window.state.cashEarned,
        visitedCount: window.state.visitedDestinations.length,
        achievementsCount: window.state.achievements.length
      });
      
      // Store profile image URL
      if (data.user.profileImageUrl) {
        localStorage.setItem('profileImage', data.user.profileImageUrl);
      }
      
      // Update UI immediately after loading data
      if (typeof updateUI === 'function') {
        updateUI();
      }
    }
    
    console.log('Profile data loaded from backend successfully');
    return data;
  } catch (error) {
    console.error('Failed to load profile data:', error);
    return null;
  }
};

// Save XP and level to backend
window.saveUserXP = async function(xp, level, cashEarned) {
  if (!window.AuthAPI || !window.AuthAPI.isLoggedIn()) {
    console.log('Not logged in, saving to localStorage only');
    return;
  }
  
  try {
    const token = localStorage.getItem('authToken');
    await fetch(`${window.API_BASE_URL}/api/me/profile/xp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ xp, level, cashEarned })
    });
    
    console.log('XP saved to backend:', { xp, level, cashEarned });
  } catch (error) {
    console.error('Failed to save XP:', error);
  }
};

// Save achievement to backend
window.saveUserAchievement = async function(achievement) {
  if (!window.AuthAPI || !window.AuthAPI.isLoggedIn()) {
    console.log('Not logged in, saving to localStorage only');
    return;
  }
  
  try {
    const token = localStorage.getItem('authToken');
    await fetch(`${window.API_BASE_URL}/api/me/profile/achievements`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        achievementId: achievement.id,
        name: achievement.name,
        desc: achievement.desc,
        icon: achievement.icon,
        xp: achievement.xp
      })
    });
    
    console.log('Achievement saved to backend:', achievement);
  } catch (error) {
    console.error('Failed to save achievement:', error);
  }
};

// Mark destination as visited in backend
window.saveVisitedDestination = async function(destinationId) {
  if (!window.AuthAPI || !window.AuthAPI.isLoggedIn()) {
    console.log('Not logged in, saving to localStorage only');
    return;
  }
  
  try {
    const token = localStorage.getItem('authToken');
    await fetch(`${window.API_BASE_URL}/api/me/profile/visited/${destinationId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Visited destination saved to backend:', destinationId);
  } catch (error) {
    console.error('Failed to save visited destination:', error);
  }
};

// Save login streak to backend
window.saveLoginStreak = async function(loginStreak) {
  if (!window.AuthAPI || !window.AuthAPI.isLoggedIn()) {
    console.log('Not logged in, saving to localStorage only');
    return;
  }
  
  try {
    const token = localStorage.getItem('authToken');
    await fetch(`${window.API_BASE_URL}/api/me/profile/streak`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ loginStreak })
    });
    
    console.log('Login streak saved to backend:', loginStreak);
  } catch (error) {
    console.error('Failed to save login streak:', error);
  }
};

// Save profile image to backend
window.saveProfileImage = async function(imageUrl) {
  if (!window.AuthAPI || !window.AuthAPI.isLoggedIn()) {
    console.log('Not logged in, saving to localStorage only');
    return;
  }
  
  try {
    const token = localStorage.getItem('authToken');
    await fetch(`${window.API_BASE_URL}/api/me/profile/image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ imageUrl })
    });
    
    console.log('Profile image saved to backend');
  } catch (error) {
    console.error('Failed to save profile image:', error);
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
      
      // Load user profile data from backend
      window.loadUserProfileData().then(() => {
        // Initialize app after profile data is loaded
        if (typeof initApp === 'function') {
          initApp();
        }
      });
      
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
