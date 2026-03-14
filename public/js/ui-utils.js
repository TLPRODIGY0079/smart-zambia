// ============================================
// UI UTILITIES - Toast, Skeleton Loaders, Cache
// ============================================

// ============================================
// GLOBAL TOAST SYSTEM
// ============================================

function showToast(message, type = 'info', duration = 4000) {
  const container = document.getElementById('toastContainer');
  if (!container) {
    console.warn('Toast container not found');
    return;
  }
  
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  const icons = {
    success: 'fa-check-circle',
    error: 'fa-exclamation-circle',
    warning: 'fa-exclamation-triangle',
    info: 'fa-info-circle'
  };
  
  toast.innerHTML = `
    <i class="fas ${icons[type] || icons.info} toast-icon"></i>
    <div class="toast-content">${message}</div>
    <button class="toast-close" onclick="closeToast(this)">
      <i class="fas fa-times"></i>
    </button>
  `;
  
  container.appendChild(toast);
  
  // Trigger animation
  setTimeout(() => toast.classList.add('show'), 10);
  
  // Auto remove
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

function closeToast(btn) {
  const toast = btn.closest('.toast');
  if (toast) {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }
}

// ============================================
// CACHE MANAGER
// ============================================

const CacheManager = {
  set: function(key, data, ttl = 300000) { // 5 minutes default
    const item = {
      data: data,
      timestamp: Date.now(),
      ttl: ttl
    };
    try {
      localStorage.setItem(`cache_${key}`, JSON.stringify(item));
    } catch (e) {
      console.warn('Cache storage failed:', e);
    }
  },
  
  get: function(key) {
    try {
      const item = localStorage.getItem(`cache_${key}`);
      if (!item) return null;
      
      const parsed = JSON.parse(item);
      if (this.isStale(key)) {
        this.clear(key);
        return null;
      }
      
      return parsed.data;
    } catch (e) {
      console.warn('Cache retrieval failed:', e);
      return null;
    }
  },
  
  isStale: function(key) {
    try {
      const item = localStorage.getItem(`cache_${key}`);
      if (!item) return true;
      
      const parsed = JSON.parse(item);
      return (Date.now() - parsed.timestamp) > parsed.ttl;
    } catch (e) {
      return true;
    }
  },
  
  clear: function(key) {
    localStorage.removeItem(`cache_${key}`);
  },
  
  clearAll: function() {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('cache_')) {
        localStorage.removeItem(key);
      }
    });
  }
};

// ============================================
// SKELETON LOADERS
// ============================================

function showDestinationsSkeleton() {
  const grid = document.getElementById('destinationsGrid');
  if (!grid) return;
  
  grid.innerHTML = Array(6).fill(0).map(() => `
    <div class="skeleton-card">
      <div class="skeleton skeleton-image"></div>
      <div class="p-6">
        <div class="skeleton skeleton-title"></div>
        <div class="skeleton skeleton-text"></div>
        <div class="skeleton skeleton-text" style="width: 80%"></div>
      </div>
    </div>
  `).join('');
}

function showMapSkeleton() {
  const mapContainer = document.getElementById('map');
  if (!mapContainer) return;
  
  mapContainer.innerHTML = `
    <div class="w-full h-full flex items-center justify-center">
      <div class="text-center">
        <div class="skeleton" style="width: 200px; height: 200px; border-radius: 50%; margin: 0 auto 16px;"></div>
        <div class="skeleton skeleton-text" style="width: 150px; margin: 0 auto;"></div>
      </div>
    </div>
  `;
}

function showBookingsSkeleton() {
  const container = document.getElementById('bookingsContainer');
  if (!container) return;
  
  container.innerHTML = Array(3).fill(0).map(() => `
    <div class="skeleton-card p-6">
      <div class="skeleton skeleton-title"></div>
      <div class="skeleton skeleton-text"></div>
      <div class="skeleton skeleton-text" style="width: 60%"></div>
    </div>
  `).join('');
}

function showEventsSkeleton() {
  const container = document.getElementById('eventsContainer');
  if (!container) return;
  
  container.innerHTML = Array(4).fill(0).map(() => `
    <div class="skeleton-card">
      <div class="skeleton skeleton-image" style="height: 150px;"></div>
      <div class="p-4">
        <div class="skeleton skeleton-title"></div>
        <div class="skeleton skeleton-text"></div>
      </div>
    </div>
  `).join('');
}

// ============================================
// ACHIEVEMENT TOAST
// ============================================

function showAchievementToast(title, description) {
  const toast = document.getElementById('achievementToast');
  if (!toast) return;
  
  document.getElementById('achievementTitle').textContent = title;
  document.getElementById('achievementDesc').textContent = description;
  toast.classList.add('show');
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 4000);
}

// Export to window
window.showToast = showToast;
window.closeToast = closeToast;
window.CacheManager = CacheManager;
window.showDestinationsSkeleton = showDestinationsSkeleton;
window.showMapSkeleton = showMapSkeleton;
window.showBookingsSkeleton = showBookingsSkeleton;
window.showEventsSkeleton = showEventsSkeleton;
window.showAchievementToast = showAchievementToast;
