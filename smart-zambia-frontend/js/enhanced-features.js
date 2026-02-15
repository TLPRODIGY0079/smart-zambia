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
// BOOKING SYSTEMS
// ============================================
function initBookingSystems() {
  renderTourGuides();
  renderActivityReservations();
}

function renderTourGuides() {
  const guides = [
    { name: 'Joseph Mwanza', specialty: 'Wildlife Safari', rating: 4.9, price: 50, languages: ['English', 'Bemba'] },
    { name: 'Grace Phiri', specialty: 'Cultural Tours', rating: 4.8, price: 40, languages: ['English', 'Nyanja'] },
    { name: 'David Banda', specialty: 'Adventure Sports', rating: 4.7, price: 60, languages: ['English', 'Tonga'] }
  ];
  
  document.getElementById('tourGuides').innerHTML = guides.map(guide => `
    <div class="p-4 rounded-xl border" style="border-color: var(--border-color)">
      <div class="flex items-center gap-3 mb-3">
        <div class="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center text-white font-bold">
          ${guide.name.charAt(0)}
        </div>
        <div>
          <h3 class="font-bold" style="color: var(--text-primary)">${guide.name}</h3>
          <p class="text-sm" style="color: var(--text-secondary)">${guide.specialty}</p>
          <p class="text-xs">⭐ ${guide.rating} • ${guide.languages.join(', ')}</p>
        </div>
      </div>
      <div class="flex justify-between items-center">
        <span class="font-bold text-green-600">$${guide.price}/day</span>
        <button onclick="bookGuide('${guide.name}')" class="bg-green-500 text-white px-4 py-2 rounded-lg text-sm">Book Now</button>
      </div>
    </div>
  `).join('');
}

function renderActivityReservations() {
  const activities = [
    { name: "Devil's Pool", price: 100, duration: '4 hours', difficulty: 'High' },
    { name: 'Gorge Swing', price: 85, duration: '2 hours', difficulty: 'High' },
    { name: 'Helicopter Flight', price: 150, duration: '15 mins', difficulty: 'Low' },
    { name: 'White Water Rafting', price: 120, duration: '6 hours', difficulty: 'High' },
    { name: 'Sunset Cruise', price: 45, duration: '3 hours', difficulty: 'Low' },
    { name: 'Walking Safari', price: 60, duration: '5 hours', difficulty: 'Medium' }
  ];
  
  document.getElementById('activityReservations').innerHTML = activities.map(activity => `
    <div class="p-4 rounded-xl border" style="border-color: var(--border-color)">
      <h3 class="font-bold mb-2" style="color: var(--text-primary)">${activity.name}</h3>
      <div class="space-y-1 text-sm mb-4" style="color: var(--text-secondary)">
        <p>💰 $${activity.price} USD / K${Math.round(activity.price * 19)} ZMW</p>
        <p>⏱️ ${activity.duration}</p>
        <p>📊 ${activity.difficulty} difficulty</p>
      </div>
      <button onclick="bookActivity('${activity.name}', ${activity.price})" class="w-full bg-orange-500 text-white py-2 rounded-lg">Reserve Now</button>
    </div>
  `).join('');
}

function bookGuide(name) {
  window.enhancedState.bookings.push({ type: 'guide', name, date: new Date().toISOString() });
  showAchievementToast('Guide Booked!', `${name} reserved for your trip`);
}

function bookActivity(name, price) {
  window.enhancedState.bookings.push({ type: 'activity', name, price, date: new Date().toISOString() });
  updateCostCalculator('activities', price);
  showAchievementToast('Activity Booked!', `${name} reserved`);
}

function bookTransport(type) {
  const prices = { flight: 200, bus: 25, car: 50 };
  const price = prices[type] || 50;
  window.enhancedState.bookings.push({ type: 'transport', name: type, price, date: new Date().toISOString() });
  updateCostCalculator('transport', price);
  showAchievementToast('Transport Booked!', `${type} reservation confirmed`);
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
function generateItinerary() {
  // Get duration from either window.selectedDuration or the hidden input
  const duration = window.selectedDuration || parseInt(document.getElementById('tripDuration')?.value) || 3;
  const budget = parseFloat(document.getElementById('tripBudget').value) || 1500;

  if (!budget || budget < 100) {
    alert('Please enter a valid budget (minimum $100)');
    return;
  }

  const itinerary = optimizeRoute(duration, budget);
  const totalCost = itinerary.reduce((sum, day) => sum + day.cost, 0);

  document.getElementById('generatedItinerary').innerHTML = `
    <div class="rounded-2xl p-6 mt-6" style="background: var(--bg-primary); border: 1px solid var(--border-color);">
      <h3 class="font-bold mb-4" style="color: var(--text-primary)">Your Optimized ${duration}-Day Itinerary</h3>
      ${itinerary.map((day, i) => `
        <div class="mb-4 p-4 rounded-xl" style="background: var(--bg-card); border: 1px solid var(--border-color);">
          <h4 class="font-semibold mb-2" style="color: var(--text-primary)">Day ${i + 1}: ${day.destination}</h4>
          <p class="text-sm mb-2" style="color: var(--text-secondary)">${day.activities.join(' • ')}</p>
          <div class="flex justify-between items-center">
            <span class="text-xs font-semibold" style="color: var(--text-secondary)">Daily budget</span>
            <span class="text-sm font-bold text-green-600">${day.cost} USD / K${Math.round(day.cost * 19)} ZMW</span>
          </div>
        </div>
      `).join('')}
      <div class="mt-4 p-4 rounded-xl" style="background: linear-gradient(135deg, #16A34A, #15803D);">
        <div class="flex justify-between items-center text-white">
          <span class="font-bold">Total Estimated Cost:</span>
          <div class="text-right">
            <div class="text-xl font-bold">${totalCost} USD</div>
            <div class="text-sm opacity-90">K${Math.round(totalCost * 19)} ZMW</div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Auto-fill cost calculator with breakdown
  updateCostBreakdown();

  // Show achievement
  if (window.showAchievementToast) {
    window.showAchievementToast('Itinerary Generated!', `${duration}-day trip planned`);
  }
  if (window.addScore) {
    window.addScore(30);
  }
}

function optimizeRoute(duration, budget) {
  const dailyBudget = Math.round(budget / duration);
  const topDestinations = (window.destinations || []).filter(d => d.featured).slice(0, Math.min(duration, 7));

  // If we have fewer destinations than days, repeat some
  const selectedDestinations = [];
  for (let i = 0; i < duration; i++) {
    selectedDestinations.push(topDestinations[i % topDestinations.length]);
  }

  return selectedDestinations.map((dest, i) => {
    // Vary daily cost slightly (±20%)
    const variance = 0.8 + (Math.random() * 0.4);
    const dayCost = Math.round(dailyBudget * variance);

    return {
      destination: dest.name,
      activities: [
        'Morning exploration',
        dest.category === 'Wildlife' ? 'Game drive' : dest.category === 'Adventure' ? 'Adventure activity' : 'Sightseeing',
        'Local cuisine',
        'Evening relaxation'
      ],
      cost: dayCost
    };
  });
}

// ============================================
// CULTURAL EVENTS CALENDAR
// ============================================
function initCulturalEvents() {
  window.enhancedState.culturalEvents = [
    { name: 'Kuomboka Ceremony', date: '2024-04-15', location: 'Western Province', type: 'Traditional' },
    { name: 'Nc\'wala Ceremony', date: '2024-02-24', location: 'Eastern Province', type: 'Traditional' },
    { name: 'Zambia International Trade Fair', date: '2024-07-01', location: 'Ndola', type: 'Commercial' },
    { name: 'Livingstone Cultural Festival', date: '2024-08-15', location: 'Livingstone', type: 'Cultural' }
  ];
  
  renderCulturalEvents();
}

function renderCulturalEvents() {
  const container = document.getElementById('culturalEvents');
  if (!container) return;
  
  container.innerHTML = window.enhancedState.culturalEvents.map(event => `
    <div class="p-4 rounded-xl border" style="border-color: var(--border-color);">
      <h3 class="font-bold" style="color: var(--text-primary)">${event.name}</h3>
      <p class="text-sm" style="color: var(--text-secondary)">📅 ${new Date(event.date).toLocaleDateString()}</p>
      <p class="text-sm" style="color: var(--text-secondary)">📍 ${event.location}</p>
      <span class="inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold" style="background: rgba(232,93,4,0.1); color: #E85D04;">${event.type}</span>
    </div>
  `).join('');
}

// ============================================
// COST CALCULATOR & LOCAL PAYMENTS
// ============================================
function updateCostCalculator(category, amount) {
  // This function is called when booking activities/transport
  const inputEl = document.getElementById(`input${category.charAt(0).toUpperCase() + category.slice(1)}`);
  if (inputEl) {
    const currentValue = parseFloat(inputEl.value) || 0;
    inputEl.value = currentValue + amount;
  }
  updateManualCosts();
}

function updateManualCosts() {
  // Get values from input fields
  const accommodation = parseFloat(document.getElementById('inputAccommodation')?.value) || 0;
  const transport = parseFloat(document.getElementById('inputTransport')?.value) || 0;
  const activities = parseFloat(document.getElementById('inputActivities')?.value) || 0;
  const food = parseFloat(document.getElementById('inputFood')?.value) || 0;
  
  const total = accommodation + transport + activities + food;
  const zmwRate = 19; // 1 USD = 19 ZMW (current rate)
  
  // Update totals
  const totalUSDEl = document.getElementById('totalUSD');
  const totalZMWEl = document.getElementById('totalZMW');
  
  if (totalUSDEl) totalUSDEl.textContent = `$${total.toFixed(0)}`;
  if (totalZMWEl) totalZMWEl.textContent = `K${Math.round(total * zmwRate)}`;
}

function updateCostBreakdown() {
  // Auto-fill based on budget input
  const budget = parseFloat(document.getElementById('tripBudget')?.value) || 1500;
  
  // Typical breakdown percentages
  const accommodation = Math.round(budget * 0.40); // 40%
  const transport = Math.round(budget * 0.25);     // 25%
  const activities = Math.round(budget * 0.25);    // 25%
  const food = Math.round(budget * 0.10);          // 10%
  
  // Set input values
  document.getElementById('inputAccommodation').value = accommodation;
  document.getElementById('inputTransport').value = transport;
  document.getElementById('inputActivities').value = activities;
  document.getElementById('inputFood').value = food;
  
  updateManualCosts();
}

function resetCostCalculator() {
  document.getElementById('inputAccommodation').value = 0;
  document.getElementById('inputTransport').value = 0;
  document.getElementById('inputActivities').value = 0;
  document.getElementById('inputFood').value = 0;
  updateManualCosts();
}

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
  initBookingSystems();
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
window.bookGuide = bookGuide;
window.bookActivity = bookActivity;
window.bookTransport = bookTransport;
window.generateItinerary = generateItinerary;
window.showEmbassies = showEmbassies;
window.startVRTour = startVRTour;
window.updateManualCosts = updateManualCosts;
window.updateCostBreakdown = updateCostBreakdown;
window.resetCostCalculator = resetCostCalculator;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initEnhancedFeatures);