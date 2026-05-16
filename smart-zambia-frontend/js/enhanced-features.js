// Enhanced Features for Smart Zambia
// Travel Stories, Photo Upload, Travel Buddy, Bookings, VR Tours, etc.

// ============================================
// GLOBAL STATE (Shared with main.js)
// ============================================
window.enhancedState = window.enhancedState || {
  travelStories: [],
  userPhotos: [],
  travelBuddies: [],
  bookings: [],
  culturalEvents: [],
  emergencyContacts: [],
  medicalFacilities: [],
  safetyAlerts: [],
  offlineData: null,
  vrTours: [],
  routeOptimization: null,
  costCalculator: { accommodation: 0, transport: 0, activities: 0, food: 0 }
};

// Global destinations array (fallback)
window.destinations = window.destinations || [];

// Helper functions
function addScore(points) {
  if (window.state) {
    window.state.score += points;
    updateUI();
  }
}

function showAchievementToast(title, desc) {
  const toast = document.getElementById('achievementToast');
  if (toast) {
    document.getElementById('achievementTitle').textContent = title;
    document.getElementById('achievementDesc').textContent = desc;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 4000);
  }
}

function updateUI() {
  if (window.state) {
    const scoreEl = document.getElementById('adventureScore');
    const levelEl = document.getElementById('adventureLevel');
    if (scoreEl) scoreEl.textContent = window.state.score;
    if (levelEl) levelEl.textContent = window.state.level;
  }
}

// ============================================
// TRAVEL STORIES & PHOTO UPLOAD
// ============================================
function initPhotoUpload() {
  document.getElementById('photoUpload').addEventListener('change', handlePhotoUpload);
}

function handlePhotoUpload(event) {
  const files = Array.from(event.target.files);
  files.forEach(file => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const photo = {
          id: Date.now() + Math.random(),
          url: e.target.result,
          name: file.name,
          destination: state.currentDestination?.name || 'Unknown',
          timestamp: new Date().toISOString(),
          likes: 0
        };
        enhancedState.userPhotos.push(photo);
        renderTravelStories();
        addScore(15);
        showAchievementToast('Photo Uploaded!', '+15 XP for sharing your adventure');
      };
      reader.readAsDataURL(file);
    }
  });
}

function renderTravelStories() {
  const container = document.getElementById('travelStories');
  if (!container) return;
  
  const stories = window.enhancedState.userPhotos.slice(-10).reverse();
  
  container.innerHTML = stories.length ? stories.map(story => `
    <div class="rounded-2xl p-4 border" style="background: var(--bg-card); border-color: var(--border-color);">
      <div class="flex items-center gap-3 mb-3">
        <div class="w-10 h-10 rounded-full bg-gradient-to-br from-zambia-orange to-zambia-copper flex items-center justify-center text-white font-bold">
          ${window.state?.user?.name?.charAt(0) || 'U'}
        </div>
        <div>
          <p class="font-semibold" style="color: var(--text-primary)">${window.state?.user?.name || 'User'}</p>
          <p class="text-xs" style="color: var(--text-secondary)">${new Date(story.timestamp).toLocaleDateString()}</p>
        </div>
      </div>
      <img src="${story.url}" alt="${story.name}" class="w-full h-48 object-cover rounded-xl mb-3">
      <p class="text-sm mb-2" style="color: var(--text-primary)">📍 ${story.destination}</p>
      <div class="flex items-center gap-4 text-sm">
        <button onclick="likeStory(${story.id})" class="flex items-center gap-1 text-red-500 hover:text-red-600">
          <i class="fas fa-heart"></i> ${story.likes}
        </button>
        <span style="color: var(--text-secondary)">Amazing view!</span>
      </div>
    </div>
  `).join('') : '<p class="text-center py-8" style="color: var(--text-secondary)">Share your first photo to start your travel story!</p>';
}

function likeStory(storyId) {
  const story = window.enhancedState.userPhotos.find(s => s.id === storyId);
  if (story) {
    story.likes++;
    renderTravelStories();
  }
}

// ============================================
// TRAVEL BUDDY MATCHING
// ============================================
function findTravelBuddies() {
  const buddies = [
    { name: 'Sarah Explorer', interests: ['Wildlife', 'Photography'], location: 'Lusaka', rating: 4.8 },
    { name: 'Mike Adventure', interests: ['Hiking', 'Culture'], location: 'Livingstone', rating: 4.9 },
    { name: 'Lisa Nature', interests: ['Nature', 'Birds'], location: 'Ndola', rating: 4.7 }
  ];
  
  enhancedState.travelBuddies = buddies;
  renderActiveTravelers();
  showAchievementToast('Travel Buddies Found!', 'Connect with fellow adventurers');
}

function renderActiveTravelers() {
  const container = document.getElementById('activeTravelers');
  if (!container) return;
  
  container.innerHTML = window.enhancedState.travelBuddies.map(buddy => `
    <div class="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-gray-50" style="background: var(--bg-primary)">
      <div class="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
        ${buddy.name.charAt(0)}
      </div>
      <div class="flex-1">
        <p class="font-semibold text-sm" style="color: var(--text-primary)">${buddy.name}</p>
        <p class="text-xs" style="color: var(--text-secondary)">${buddy.location} • ⭐ ${buddy.rating}</p>
        <p class="text-xs" style="color: var(--text-secondary)">${buddy.interests.join(', ')}</p>
      </div>
      <button onclick="connectBuddy('${buddy.name}')" class="text-xs bg-purple-500 text-white px-3 py-1 rounded-full">Connect</button>
    </div>
  `).join('');
}

function connectBuddy(name) {
  showAchievementToast('Connection Sent!', `Message sent to ${name}`);
}

// ============================================
// VR TOURS & 360° EXPERIENCES
// ============================================
function initVRTours() {
  window.enhancedState.vrTours = [
    { id: 1, name: 'Victoria Falls VR', destination: 'Victoria Falls', type: '360°', duration: '5 min' },
    { id: 2, name: 'Safari Experience', destination: 'South Luangwa', type: 'VR', duration: '10 min' },
    { id: 3, name: "Devil's Pool Preview", destination: "Devil's Pool", type: '360°', duration: '3 min' }
  ];
}

function startVRTour(tourId) {
  const tour = window.enhancedState.vrTours.find(t => t.id === tourId);
  if (tour) {
    showAchievementToast('VR Tour Started!', `Experiencing ${tour.name}`);
    addScore(20);
    // In real implementation, would launch VR viewer
    setTimeout(() => {
      showAchievementToast('VR Tour Complete!', 'Ready to visit for real?');
    }, 3000);
  }
}

// ============================================
// ROUTE OPTIMIZATION
// ============================================

// ============================================
// SAFETY & EMERGENCY FEATURES
// ============================================
function initSafetyFeatures() {
  window.enhancedState.emergencyContacts = [
    { name: 'Police Emergency', number: '999', type: 'emergency' },
    { name: 'Tourist Police', number: '+260-211-229087', type: 'tourist' },
    { name: 'Medical Emergency', number: '991', type: 'medical' }
  ];
  
  window.enhancedState.medicalFacilities = [
    { name: 'University Teaching Hospital', location: 'Lusaka', phone: '+260-211-256067', type: 'Hospital' },
    { name: 'Livingstone General Hospital', location: 'Livingstone', phone: '+260-213-320891', type: 'Hospital' },
    { name: 'Ndola Central Hospital', location: 'Ndola', phone: '+260-212-612100', type: 'Hospital' }
  ];
  
  window.enhancedState.safetyAlerts = [
    { title: 'Weather Alert', message: 'Heavy rains expected in Southern Province', level: 'warning', date: new Date().toISOString() },
    { title: 'Road Closure', message: 'M10 road temporarily closed near Kafue', level: 'info', date: new Date().toISOString() }
  ];
  
  renderSafetyInfo();
}

function renderSafetyInfo() {
  // Medical Facilities
  const medicalEl = document.getElementById('medicalFacilities');
  if (medicalEl) {
    medicalEl.innerHTML = window.enhancedState.medicalFacilities.map(facility => `
    <div class="flex items-center gap-4 p-4 rounded-xl" style="background: var(--bg-primary)">
      <div class="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center text-white">
        <i class="fas fa-hospital"></i>
      </div>
      <div>
        <h3 class="font-bold" style="color: var(--text-primary)">${facility.name}</h3>
        <p class="text-sm" style="color: var(--text-secondary)">${facility.location}</p>
        <p class="font-bold text-red-500">${facility.phone}</p>
      </div>
    </div>
  `).join('');
  }
  
  // Safety Alerts
  const alertsEl = document.getElementById('safetyAlerts');
  if (alertsEl) {
    alertsEl.innerHTML = window.enhancedState.safetyAlerts.map(alert => `
    <div class="p-4 rounded-xl border-l-4 ${alert.level === 'warning' ? 'border-yellow-500 bg-yellow-50' : 'border-blue-500 bg-blue-50'}">
      <h3 class="font-bold ${alert.level === 'warning' ? 'text-yellow-800' : 'text-blue-800'}">${alert.title}</h3>
      <p class="text-sm ${alert.level === 'warning' ? 'text-yellow-700' : 'text-blue-700'}">${alert.message}</p>
      <p class="text-xs mt-1 ${alert.level === 'warning' ? 'text-yellow-600' : 'text-blue-600'}">${new Date(alert.date).toLocaleDateString()}</p>
    </div>
  `).join('');
  }
}

function showEmbassies() {
  const embassies = [
    { country: 'United States', phone: '+260-211-357000', address: 'Lusaka' },
    { country: 'United Kingdom', phone: '+260-211-423200', address: 'Lusaka' },
    { country: 'South Africa', phone: '+260-211-260340', address: 'Lusaka' }
  ];
  
  const embassyList = embassies.map(embassy => `
    <div class="p-3 rounded-lg" style="background: var(--bg-primary)">
      <h4 class="font-bold">${embassy.country} Embassy</h4>
      <p class="text-sm">📞 ${embassy.phone}</p>
      <p class="text-sm">📍 ${embassy.address}</p>
    </div>
  `).join('');
  
  showAchievementToast('Embassy Info', 'Embassy contacts loaded');
  // In real app, would show in modal
}

// ============================================
// OFFLINE FUNCTIONALITY
// ============================================
function initOfflineSupport() {
  // Cache essential data for offline use
  window.enhancedState.offlineData = {
    destinations: (window.destinations || []).slice(0, 10), // Cache top destinations
    emergencyContacts: window.enhancedState.emergencyContacts,
    basicMap: true // Simplified offline map data
  };
  
  // Service Worker registration
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(console.error);
  }
}

// ============================================
// INITIALIZATION
// ============================================
function initEnhancedFeatures() {
  initPhotoUpload();
  initVRTours();
  initCulturalEvents();
  initSafetyFeatures();
  initOfflineSupport();
  
  // Render initial content
  renderTravelStories();
  renderActiveTravelers();
}

// Global functions
window.likeStory = likeStory;
window.findTravelBuddies = findTravelBuddies;
window.connectBuddy = connectBuddy;
window.generateItinerary = generateItinerary;
window.showEmbassies = showEmbassies;
window.startVRTour = startVRTour;
window.updateManualCosts = updateManualCosts;
window.updateCostBreakdown = updateCostBreakdown;
window.resetCostCalculator = resetCostCalculator;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initEnhancedFeatures);