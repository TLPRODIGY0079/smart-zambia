// API Configuration for Smart Zambia Backend Integration
// This file handles all API calls to the backend

const API_BASE_URL = 'http://localhost:3001/api';

// Helper function to get auth token
function getAuthToken() {
  return localStorage.getItem('authToken');
}

// Helper function to make authenticated requests
async function apiRequest(endpoint, options = {}) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// ============================================
// AUTHENTICATION API
// ============================================

window.AuthAPI = {
  // Register new user
  async register(fullName, email, password) {
    const data = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ fullName, email, password }),
    });
    
    // Store token and user data
    if (data.token) {
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    
    return data;
  },

  // Login existing user
  async login(email, password) {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    // Store token and user data
    if (data.token) {
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    
    return data;
  },

  // Logout
  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  },

  // Get current user from localStorage
  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Check if user is logged in
  isLoggedIn() {
    return !!getAuthToken();
  },
};

// ============================================
// DESTINATIONS API
// ============================================

window.DestinationsAPI = {
  // Get all destinations
  async getAll() {
    return await apiRequest('/destinations');
  },

  // Get single destination by ID
  async getById(id) {
    return await apiRequest(`/destinations/${id}`);
  },
};

// ============================================
// FAVORITES API (Quick Win)
// ============================================

window.FavoritesAPI = {
  // Get user's favorites
  async getAll() {
    return await apiRequest('/me/favorites');
  },

  // Add destination to favorites
  async add(destinationId) {
    return await apiRequest(`/me/favorites/${destinationId}`, {
      method: 'POST',
    });
  },

  // Remove destination from favorites
  async remove(destinationId) {
    return await apiRequest(`/me/favorites/${destinationId}`, {
      method: 'DELETE',
    });
  },
};

// ============================================
// SEARCH HISTORY API (Quick Win)
// ============================================

window.SearchHistoryAPI = {
  // Get user's search history
  async getAll() {
    return await apiRequest('/me/search-history');
  },

  // Save search query
  async save(query) {
    return await apiRequest('/me/search-history', {
      method: 'POST',
      body: JSON.stringify({ query }),
    });
  },
};

// ============================================
// NOTIFICATIONS API (Quick Win)
// ============================================

window.NotificationsAPI = {
  // Get user's notifications
  async getAll() {
    return await apiRequest('/me/notifications');
  },

  // Mark notification as read
  async markAsRead(notificationId) {
    return await apiRequest(`/me/notifications/${notificationId}/read`, {
      method: 'POST',
    });
  },
};

// ============================================
// ADMIN API
// ============================================

window.AdminAPI = {
  // Add new destination (admin only)
  async addDestination(destinationData) {
    return await apiRequest('/admin/destinations', {
      method: 'POST',
      body: JSON.stringify(destinationData),
    });
  },

  // Get civic reports (admin only)
  async getCivicReports(filters = {}) {
    const params = new URLSearchParams(filters);
    return await apiRequest(`/admin/civic-reports?${params}`);
  },

  // Update civic report status (admin only)
  async updateCivicReport(reportId, updates) {
    return await apiRequest(`/admin/civic-reports/${reportId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  // Get civic analytics (admin only)
  async getCivicAnalytics() {
    return await apiRequest('/admin/civic-analytics');
  },
};

// ============================================
// HEALTH CHECK
// ============================================

window.HealthAPI = {
  async check() {
    return await apiRequest('/health');
  },
};

// Make API_BASE_URL globally available
window.API_BASE_URL = API_BASE_URL;

console.log('API Config loaded - Base URL:', API_BASE_URL);
