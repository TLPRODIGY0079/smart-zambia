// js/main.js
import { fetchDestinations, fetchDestinationById, submitCivicReport, getUserCivicReports, getUserCivicProfile, awardAchievement } from './api.js';

let destinations = [];
let state = {
  score: 0,
  level: 1,
  foundEggs: [],
  foundTreasures: [],
  achievements: [],
  wishlist: [],
  currentDestination: null,
  droneRotation: 0,
  droneZoom: 1,
  autoFly: true,
  treasureHuntActive: false,
  treasureClues: [
    { clue: "Where the smoke thunders and rainbows dance...", destination: 1 },
    { clue: "Where elephants walk and leopards prowl at night...", destination: 2 },
    { clue: "Paddle along the mighty river...", destination: 3 },
    { clue: "Millions of wings darken the sky...", destination: 7 },
    { clue: "Swim on the edge of the world...", destination: 8 }
  ],
  currentTreasureIndex: 0,
  secretDoorClicks: 0,
  konamiCode: [],
  konamiSequence: ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'],
  // New features
  loginStreak: parseInt(localStorage.getItem('loginStreak') || '0'),
  lastLogin: localStorage.getItem('lastLogin'),
  visitedDestinations: JSON.parse(localStorage.getItem('visitedDestinations') || '[]'),
  userReviews: JSON.parse(localStorage.getItem('userReviews') || '{}'),
  travelStats: JSON.parse(localStorage.getItem('travelStats') || '{"totalVisits": 0, "favoriteCategory": "Nature", "totalDistance": 0}'),
  cashEarned: parseInt(localStorage.getItem('cashEarned') || '0'),
  // Civic gamification - now synced with database
  civicReports: [],
  civicLevel: 1,
  civicXP: 0,
  // User authentication
  user: null,
  token: localStorage.getItem('authToken')
};

const civicChallenges = [
  { id: 'flooded_area', name: 'Flooded Tourist Area', desc: 'Report flooded areas affecting tourists', icon: 'fa-water', xp: 40, cash: 5, color: 'bg-blue-500' },
  { id: 'blocked_trail', name: 'Blocked Trail', desc: 'Report blocked hiking/walking trails', icon: 'fa-hiking', xp: 35, cash: 4, color: 'bg-green-500' },
  { id: 'unsafe_viewpoint', name: 'Unsafe Viewpoint', desc: 'Report dangerous viewing areas', icon: 'fa-exclamation-triangle', xp: 45, cash: 6, color: 'bg-red-500' },
  { id: 'damaged_facilities', name: 'Damaged Facilities', desc: 'Report broken tourist facilities', icon: 'fa-tools', xp: 30, cash: 3, color: 'bg-yellow-500' },
  { id: 'wildlife_concern', name: 'Wildlife Safety', desc: 'Report wildlife-related safety issues', icon: 'fa-paw', xp: 50, cash: 7, color: 'bg-purple-500' },
  { id: 'tourist_safety', name: 'Tourist Safety', desc: 'General tourist safety concerns', icon: 'fa-shield-alt', xp: 55, cash: 8, color: 'bg-indigo-500' }
];

const achievementDefs = [
  { id: 'first_visit', name: 'First Steps', desc: 'View your first destination', icon: 'fa-shoe-prints', xp: 10 },
  { id: 'explorer', name: 'Explorer', desc: 'View 5 different destinations', icon: 'fa-compass', xp: 50 },
  { id: 'treasure_hunter', name: 'Treasure Hunter', desc: 'Find your first treasure', icon: 'fa-gem', xp: 100 },
  { id: 'easter_master', name: 'Easter Master', desc: 'Find 3 easter eggs', icon: 'fa-egg', xp: 75 },
  { id: 'secret_finder', name: 'Secret Finder', desc: 'Discover the secret door', icon: 'fa-door-open', xp: 150 },
  { id: 'konami_master', name: 'Konami Master', desc: 'Enter the secret code', icon: 'fa-gamepad', xp: 200 },
  { id: 'streak_3', name: 'Consistent Explorer', desc: '3-day login streak', icon: 'fa-fire', xp: 30 },
  { id: 'streak_7', name: 'Dedicated Traveler', desc: '7-day login streak', icon: 'fa-calendar-check', xp: 100 },
  { id: 'reviewer', name: 'Critic', desc: 'Write your first review', icon: 'fa-star', xp: 25 },
  { id: 'cash_500', name: 'Cash Reward!', desc: 'Earned K50 for reaching 500 XP', icon: 'fa-money-bill-wave', xp: 0, cash: 50 },
  { id: 'cash_1000', name: 'Big Winner!', desc: 'Earned K100 for reaching 1000 XP', icon: 'fa-coins', xp: 0, cash: 100 },
  { id: 'cash_2000', name: 'Champion!', desc: 'Earned K250 for reaching 2000 XP', icon: 'fa-trophy', xp: 0, cash: 250 },
  // Civic achievements
  { id: 'civic_hero', name: 'Civic Hero', desc: 'Make your first civic report', icon: 'fa-shield-alt', xp: 50 },
  { id: 'city_fixer', name: 'City Fixer', desc: 'Report 10 civic issues', icon: 'fa-tools', xp: 200 },
  { id: 'community_leader', name: 'Community Leader', desc: 'Reach Civic Level 5', icon: 'fa-crown', xp: 500 }
];

let mainMap = null;
let destinationMap = null;

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  // Skip authentication check for now
  // if (!state.token) {
  //   window.location.href = 'login.html';
  //   return;
  // }
  
  // Display user info
  displayUserInfo();
  
  checkDailyLogin();
  // await loadUserProfile();
  // await loadNotifications(); // Load notifications
  renderTabs();
  await loadDestinationsFromAPI();
  setupEventListeners();
  renderAchievements();
  renderLeaderboard();
  renderDailyChallenges();
  updateUI();
  
  // Set up periodic notification checks
  // setInterval(loadNotifications, 30000); // Check every 30 seconds
});

function renderTabs() {
  document.getElementById('discoverTab').innerHTML = `
    <div class="mb-8">
      <input type="text" id="searchInput" placeholder="Search destinations..." class="w-full px-6 py-4 rounded-2xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none text-lg">
    </div>
    <div class="flex gap-4 mb-8">
      <select id="provinceFilter" class="px-6 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none">
        <option value="All">All Provinces</option>
        <option value="Southern">Southern Province</option>
        <option value="Eastern">Eastern Province</option>
        <option value="Northern">Northern Province</option>
        <option value="Central">Central Province</option>
      </select>
      <select id="categoryFilter" class="px-6 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none">
        <option value="All">All Categories</option>
        <option value="Nature">Nature</option>
        <option value="Wildlife">Wildlife</option>
        <option value="Heritage">Heritage</option>
        <option value="Adventure">Adventure</option>
      </select>
    </div>
    <div id="destinationsGrid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"></div>
  `;

  document.getElementById('mapTab').innerHTML = `
    <div class="bg-white rounded-3xl shadow-2xl p-8">
      <h2 class="text-3xl font-bold mb-6 gradient-text">Explore Zambia</h2>
      <div id="fullMap" style="height: 600px; border-radius: 24px;"></div>
    </div>
  `;

  document.getElementById('civicTab').innerHTML = `
    <div class="bg-white rounded-3xl shadow-2xl p-8 mb-8">
      <h2 class="text-3xl font-bold mb-6 gradient-text flex items-center gap-3">
        <i class="fas fa-camera-retro"></i> Tourism Safety Reports
      </h2>
      <p class="text-gray-600 mb-6">Help keep Zambia's tourist destinations safe! Report issues you encounter during your explorations and earn rewards.</p>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        ${civicChallenges.map(challenge => `
          <div class="${challenge.color} rounded-2xl p-6 text-white cursor-pointer hover:scale-105 transition-all" onclick="startCivicChallenge('${challenge.id}')">
            <div class="flex items-center gap-4 mb-4">
              <div class="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <i class="fas ${challenge.icon} text-2xl"></i>
              </div>
              <div>
                <h3 class="font-bold text-lg">${challenge.name}</h3>
                <p class="text-sm opacity-90">${challenge.desc}</p>
              </div>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm font-semibold">+${challenge.xp} XP</span>
              <span class="text-sm font-semibold">+K${challenge.cash}</span>
            </div>
          </div>
        `).join('')}
      </div>
      
      <!-- Photo Upload Instructions -->
      <div class="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 mb-6">
        <h3 class="font-bold text-lg mb-3 flex items-center gap-2">
          <i class="fas fa-camera text-blue-500"></i> Photo Evidence Bonus
        </h3>
        <p class="text-gray-700 mb-3">Upload photos with your reports to earn <span class="font-bold text-green-600">+50% bonus XP</span>!</p>
        <div class="flex gap-4 text-sm text-gray-600">
          <span><i class="fas fa-check text-green-500 mr-1"></i>Clear photos</span>
          <span><i class="fas fa-check text-green-500 mr-1"></i>Multiple angles</span>
          <span><i class="fas fa-check text-green-500 mr-1"></i>GPS location</span>
        </div>
      </div>
    </div>
    
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div class="bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl shadow-2xl p-8 text-white">
        <h2 class="text-2xl font-bold mb-6">
          <i class="fas fa-shield-alt mr-2"></i>Tourism Safety Level
        </h2>
        <div class="bg-white/20 backdrop-blur-sm rounded-2xl p-6">
          <p class="text-4xl font-bold mb-2">${state.civicLevel}</p>
          <p class="text-lg opacity-90">Safety Guardian</p>
          <div class="mt-4">
            <div class="flex justify-between text-sm mb-2">
              <span>Safety XP: ${state.civicXP}</span>
              <span>Next: ${(state.civicLevel * 100) - state.civicXP}</span>
            </div>
            <div class="w-full bg-white/20 rounded-full h-2">
              <div class="bg-white rounded-full h-2" style="width: ${(state.civicXP % 100)}%"></div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-3xl shadow-2xl p-8">
        <h2 class="text-2xl font-bold mb-6 text-gray-800">
          <i class="fas fa-list-check text-blue-500 mr-2"></i>Your Safety Reports
        </h2>
        <div id="civicReportsList" class="space-y-3">
          ${state.civicReports.length === 0 ? 
            '<div class="text-center py-8"><i class="fas fa-camera text-4xl text-gray-300 mb-4"></i><p class="text-gray-500">No reports yet. Help keep tourists safe!</p></div>' :
            state.civicReports.slice(-5).map(report => `
              <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all">
                <div class="w-10 h-10 ${civicChallenges.find(c => c.id === report.type)?.color || 'bg-gray-500'} rounded-full flex items-center justify-center text-white">
                  <i class="fas ${civicChallenges.find(c => c.id === report.type)?.icon || 'fa-exclamation'}"></i>
                </div>
                <div class="flex-1">
                  <p class="font-semibold text-sm">${report.title || report.description}</p>
                  <p class="text-xs text-gray-500">${new Date(report.created_at || report.timestamp).toLocaleDateString()}</p>
                  ${report.votes ? `<p class="text-xs text-blue-600"><i class="fas fa-thumbs-up mr-1"></i>${report.votes} votes</p>` : ''}
                </div>
                <div class="text-right">
                  <span class="text-xs font-bold text-green-600">+K${report.cash_awarded || report.cash}</span>
                  <br>
                  <span class="text-xs text-gray-500">${report.xp_awarded || report.xp} XP</span>
                </div>
              </div>
            `).join('')
          }
        </div>
        
        <!-- Voting Section -->
        <div class="mt-6 p-4 bg-blue-50 rounded-xl">
          <h4 class="font-bold text-sm mb-2 flex items-center gap-2">
            <i class="fas fa-vote-yea text-blue-500"></i> Community Voting
          </h4>
          <p class="text-xs text-gray-600">Vote on other reports to help prioritize urgent issues. Each vote earns you +2 XP!</p>
        </div>
      </div>
    </div>
    
    <!-- Weather Widget -->
    <div class="mt-8 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-3xl shadow-2xl p-8 text-white">
      <h2 class="text-2xl font-bold mb-6 flex items-center gap-3">
        <i class="fas fa-cloud-sun"></i> Current Weather
      </h2>
      <div id="weatherWidget" class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="text-center">
          <div class="text-4xl mb-2">☀️</div>
          <div class="text-3xl font-bold">25°C</div>
          <div class="text-sm opacity-90">Sunny</div>
        </div>
        <div class="text-center">
          <div class="text-sm opacity-90 mb-1">Humidity</div>
          <div class="text-2xl font-bold">65%</div>
        </div>
        <div class="text-center">
          <div class="text-sm opacity-90 mb-1">Wind</div>
          <div class="text-2xl font-bold">12 km/h</div>
        </div>
      </div>
    </div>
  `;

  document.getElementById('adventuresTab').innerHTML = `
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Login Streak Card -->
      <div class="bg-gradient-to-br from-green-400 to-blue-500 rounded-3xl shadow-2xl p-8 text-white">
        <h2 class="text-3xl font-bold mb-4 flex items-center gap-3">
          <i class="fas fa-fire"></i> Daily Streak
        </h2>
        <div class="bg-white/20 backdrop-blur-sm rounded-2xl p-6 mb-6">
          <p class="text-4xl font-bold mb-2" id="streakCount">${state.loginStreak}</p>
          <p class="text-lg opacity-90">Days in a row!</p>
          <p class="text-sm opacity-75 mt-2" id="streakBonus">+${state.loginStreak * 5} XP bonus today</p>
        </div>
        <div class="flex justify-between text-sm">
          <span>Next milestone: ${Math.ceil(state.loginStreak / 7) * 7} days</span>
          <span>Keep it up! 🔥</span>
        </div>
      </div>

      <!-- Travel Stats Card -->
      <div class="bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl shadow-2xl p-8 text-white">
        <h2 class="text-2xl font-bold mb-6">
          <i class="fas fa-chart-bar mr-2"></i>Your Stats
        </h2>
        <div class="space-y-4">
          <div class="flex justify-between">
            <span>Places Visited:</span>
            <span class="font-bold">${state.visitedDestinations.length}</span>
          </div>
          <div class="flex justify-between">
            <span>Reviews Written:</span>
            <span class="font-bold">${Object.keys(state.userReviews).length}</span>
          </div>
          <div class="flex justify-between">
            <span>Cash Earned:</span>
            <span class="font-bold text-green-300">K${state.cashEarned}</span>
          </div>
          <div class="flex justify-between">
            <span>Favorite Category:</span>
            <span class="font-bold">${state.travelStats.favoriteCategory}</span>
          </div>
        </div>
      </div>

      <!-- Cash Rewards Card -->
      <div class="bg-gradient-to-br from-green-400 to-emerald-500 rounded-3xl shadow-2xl p-8 text-white">
        <h2 class="text-2xl font-bold mb-6">
          <i class="fas fa-money-bill-wave mr-2"></i>Cash Rewards
        </h2>
        <div class="space-y-4">
          <div class="bg-white/20 backdrop-blur-sm rounded-xl p-4">
            <h3 class="font-bold mb-2">Total Earned: K${state.cashEarned}</h3>
            <p class="text-sm opacity-90">Real Kwacha prizes for your exploration!</p>
          </div>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between ${state.score >= 500 ? 'text-green-200' : 'opacity-70'}">
              <span>500 XP:</span>
              <span>${state.score >= 500 ? '✅ K50 Earned!' : 'K50 Kwacha'}</span>
            </div>
            <div class="flex justify-between ${state.score >= 1000 ? 'text-green-200' : 'opacity-70'}">
              <span>1000 XP:</span>
              <span>${state.score >= 1000 ? '✅ K100 Earned!' : 'K100 Kwacha'}</span>
            </div>
            <div class="flex justify-between ${state.score >= 2000 ? 'text-green-200' : 'opacity-70'}">
              <span>2000 XP:</span>
              <span>${state.score >= 2000 ? '✅ K250 Earned!' : 'K250 Kwacha'}</span>
            </div>
          </div>
          <div class="mt-4 p-3 bg-white/10 rounded-lg text-xs">
            <p><i class="fas fa-info-circle mr-1"></i>Prizes paid via mobile money</p>
          </div>
        </div>
      </div>

      <div class="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-3xl shadow-2xl p-8 text-white">
        <h2 class="text-3xl font-bold mb-4 flex items-center gap-3">
          <i class="fas fa-gem"></i> Treasure Hunt
        </h2>
        <p class="mb-6 opacity-90">Find hidden treasures across Zambia's destinations!</p>
        <div class="bg-white/20 backdrop-blur-sm rounded-2xl p-6 mb-6">
          <p class="text-sm font-semibold mb-2">Current Clue:</p>
          <p id="currentClue" class="text-lg font-bold">Click Start to begin your adventure!</p>
        </div>
        <div class="mb-4">
          <div class="flex justify-between text-sm mb-2">
            <span id="treasureCount">0/5 Found</span>
            <span>+100 XP each</span>
          </div>
          <div class="treasure-progress">
            <div id="treasureBar" class="treasure-progress-bar" style="width: 0%"></div>
          </div>
        </div>
        <button onclick="startTreasureHunt()" class="w-full bg-white text-orange-600 font-bold py-4 rounded-xl hover:bg-orange-50 transition-all">
          <i class="fas fa-play mr-2"></i>Start Treasure Hunt
        </button>
      </div>

      <div class="bg-white rounded-3xl shadow-2xl p-8">
        <h2 class="text-2xl font-bold mb-6 text-gray-800">
          <i class="fas fa-trophy text-yellow-500 mr-2"></i>Achievements
        </h2>
        <div id="achievementsList" class="space-y-3"></div>
      </div>

      <div class="bg-gradient-to-br from-purple-600 to-blue-600 rounded-3xl shadow-2xl p-8 text-white">
        <h2 class="text-2xl font-bold mb-6">
          <i class="fas fa-crown mr-2"></i>Leaderboard
        </h2>
        <div id="leaderboard" class="space-y-2"></div>
      </div>

      <div class="bg-white rounded-3xl shadow-2xl p-8">
        <h2 class="text-2xl font-bold mb-6 text-gray-800">
          <i class="fas fa-calendar-check text-green-500 mr-2"></i>Daily Challenges
        </h2>
        <div id="dailyChallenges" class="space-y-4"></div>
      </div>
    </div>
  `;

  document.getElementById('destinationModal').innerHTML = `
    <div class="modal-content">
      <button onclick="closeModal()" class="absolute top-6 right-6 w-12 h-12 bg-white rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-all z-10">
        <i class="fas fa-times text-xl"></i>
      </button>
      <div class="drone-view">
        <div class="drone-scene">
          <img id="modalImage" class="drone-image w-full h-96 object-cover rounded-t-3xl" src="" alt="">
          <div class="drone-controls">
            <button class="drone-btn" onclick="rotateDrone(-15)" title="Rotate Left"><i class="fas fa-undo"></i></button>
            <button class="drone-btn" onclick="zoomDrone(1.2)" title="Zoom In"><i class="fas fa-search-plus"></i></button>
            <button class="drone-btn" onclick="zoomDrone(0.8)" title="Zoom Out"><i class="fas fa-search-minus"></i></button>
            <button class="drone-btn" onclick="toggleAutoFly()" title="Toggle Auto-Fly"><i id="autoFlyIcon" class="fas fa-plane"></i></button>
            <button class="drone-btn" onclick="rotateDrone(15)" title="Rotate Right"><i class="fas fa-redo"></i></button>
          </div>
          <div class="easter-egg" data-egg="golden" style="position: absolute; top: 20px; left: 20px; font-size: 24px;">🥚</div>
          <div class="easter-egg" data-egg="silver" style="position: absolute; top: 20px; right: 80px; font-size: 24px;">🥚</div>
          <div class="easter-egg" data-egg="bronze" style="position: absolute; bottom: 80px; left: 50%; font-size: 24px;">🥚</div>
        </div>
      </div>
      <div class="p-8">
        <div class="flex items-start justify-between mb-6">
          <div>
            <h2 id="modalName" class="text-4xl font-bold text-gray-800 mb-2"></h2>
            <p id="modalProvince" class="text-gray-500 flex items-center gap-2 text-lg">
              <i class="fas fa-map-marker-alt text-orange-500"></i>
              <span></span>
            </p>
          </div>
          <div class="text-right">
            <div id="modalRating" class="flex items-center gap-1 text-yellow-500 text-xl mb-2"></div>
            <span id="modalPrice" class="text-2xl font-bold text-green-600"></span>
          </div>
        </div>
        <div class="flex gap-3 mb-6">
          <span id="modalCategory" class="px-4 py-2 bg-orange-100 text-orange-600 rounded-full font-semibold"></span>
          <span id="modalFeatured" class="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full font-semibold hidden">
            <i class="fas fa-fire mr-1"></i>Featured
          </span>
        </div>
        <p id="modalDescription" class="text-gray-700 text-lg leading-relaxed mb-8"></p>
        
        <!-- User Reviews Section -->
        <div class="mb-8">
          <h3 class="text-xl font-bold mb-4">Reviews & Ratings</h3>
          <div id="reviewsSection">
            <div class="bg-gray-50 rounded-xl p-4 mb-4">
              <div class="flex gap-4 mb-3">
                <select id="userRating" class="px-3 py-2 border rounded-lg">
                  <option value="5">⭐⭐⭐⭐⭐ Excellent</option>
                  <option value="4">⭐⭐⭐⭐ Good</option>
                  <option value="3">⭐⭐⭐ Average</option>
                  <option value="2">⭐⭐ Poor</option>
                  <option value="1">⭐ Terrible</option>
                </select>
                <button onclick="submitReview()" class="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600">
                  <i class="fas fa-plus mr-1"></i>Add Review
                </button>
              </div>
              <textarea id="reviewText" placeholder="Share your experience..." class="w-full p-3 border rounded-lg resize-none" rows="3"></textarea>
            </div>
            <div id="existingReviews" class="space-y-3"></div>
          </div>
        </div>
        
        <div id="destination-map" class="mb-8"></div>
        <div class="flex gap-4">
          <button onclick="addToWishlist()" class="flex-1 bg-orange-500 text-white font-bold py-4 rounded-xl hover:bg-orange-600 transition-all">
            <i class="fas fa-heart mr-2"></i>Add to Wishlist
          </button>
          <button onclick="shareDestination()" class="flex-1 bg-blue-500 text-white font-bold py-4 rounded-xl hover:bg-blue-600 transition-all">
            <i class="fas fa-share-alt mr-2"></i>Share
          </button>
          <button onclick="getDirections()" class="flex-1 bg-green-500 text-white font-bold py-4 rounded-xl hover:bg-green-600 transition-all">
            <i class="fas fa-directions mr-2"></i>Directions
          </button>
        </div>
      </div>
    </div>
  `;

  document.getElementById('achievementToast').innerHTML = `
    <i class="fas fa-trophy text-3xl"></i>
    <div>
      <h3 id="achievementTitle" class="font-bold text-lg"></h3>
      <p id="achievementDesc" class="text-sm opacity-90"></p>
    </div>
  `;
}

async function loadDestinationsFromAPI() {
  try {
    const filters = {
      province: document.getElementById('provinceFilter')?.value || 'All',
      category: document.getElementById('categoryFilter')?.value || 'All'
    };
    destinations = await fetchDestinations(filters);
    renderDestinations();
    initMainMap();
  } catch (err) {
    console.error('API Error:', err);
    // Use mock data if API fails
    destinations = [
      {
        id: 1,
        name: 'Victoria Falls',
        province: 'Southern Province',
        category: 'Nature',
        rating: 4.8,
        description: 'One of the Seven Natural Wonders of the World',
        image_url: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=500',
        entry_fee_foreign: 30,
        featured: true,
        lat: -17.9243,
        lng: 25.8572
      },
      {
        id: 2,
        name: 'South Luangwa National Park',
        province: 'Eastern Province',
        category: 'Wildlife',
        rating: 4.7,
        description: 'Famous for its walking safaris and diverse wildlife',
        image_url: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=500',
        entry_fee_foreign: 25,
        featured: false,
        lat: -13.0865,
        lng: 31.8844
      },
      {
        id: 3,
        name: 'Lower Zambezi National Park',
        province: 'Southern Province',
        category: 'Adventure',
        rating: 4.6,
        description: 'Perfect for canoeing and river safaris',
        image_url: 'https://images.unsplash.com/photo-1549366021-9f761d040a94?w=500',
        entry_fee_foreign: 20,
        featured: false,
        lat: -15.6167,
        lng: 29.4167
      }
    ];
    renderDestinations();
    initMainMap();
  }
}

function renderDestinations() {
  const grid = document.getElementById('destinationsGrid');
  const searchTerm = document.getElementById('searchInput').value.toLowerCase();
  const province = document.getElementById('provinceFilter').value;
  const category = document.getElementById('categoryFilter').value;

  const filtered = destinations.filter(dest => {
    const matchesSearch = dest.name.toLowerCase().includes(searchTerm) || 
                          dest.description.toLowerCase().includes(searchTerm);
    const matchesProvince = province === 'All' || dest.province.includes(province);
    const matchesCategory = category === 'All' || dest.category === category;
    return matchesSearch && matchesProvince && matchesCategory;
  });

  grid.innerHTML = filtered.map(dest => `
    <div class="destination-card">
      <div class="relative h-48 overflow-hidden" onclick="openDestination(${dest.id})"
        <img src="${dest.image_url}" alt="${dest.name}" class="card-image w-full h-full object-cover" onerror="this.src='https://via.placeholder.com/400x300/E85D04/FFFFFF?text=${encodeURIComponent(dest.name)}'">
        <div class="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg text-sm font-bold text-gray-800 flex items-center gap-1">
          <i class="fas fa-star text-yellow-500"></i>
          ${dest.rating}
        </div>
        ${dest.featured ? `
          <div class="absolute top-3 left-3 bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-lg text-xs font-bold shadow-lg">
            <i class="fas fa-fire mr-1"></i>Featured
          </div>
        ` : ''}
        ${state.treasureHuntActive && state.treasureClues[state.currentTreasureIndex]?.destination === dest.id ? `
          <div class="absolute bottom-3 left-3 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-lg text-xs font-bold animate-pulse">
            <i class="fas fa-gem mr-1"></i>Treasure Here!
          </div>
        ` : ''}
      </div>
      <div class="p-5">
        <div class="flex justify-between items-start mb-2">
          <div>
            <h3 class="text-lg font-bold text-gray-800">${dest.name}</h3>
            <p class="text-gray-500 text-sm flex items-center gap-1 mt-1">
              <i class="fas fa-map-marker-alt text-orange-500"></i>
              ${dest.province}
            </p>
          </div>
          <span class="text-green-600 font-bold bg-green-50 px-3 py-1 rounded-lg text-sm">
            $${dest.entry_fee_foreign}
          </span>
        </div>
        <p class="text-gray-600 text-sm line-clamp-2 mb-4">${dest.description}</p>
        
        <!-- Quick Win Buttons: Share & Favorite -->
        <div class="flex items-center gap-2 mb-4">
          <button onclick="event.stopPropagation(); toggleFavorite(${dest.id})" 
                  data-favorite-btn 
                  data-destination-id="${dest.id}"
                  class="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg transition-all hover:scale-105 bg-gray-50 hover:bg-gray-100"
                  title="Add to favorites">
            <i class="${isFavorite(${dest.id}) ? 'fas text-red-500' : 'far text-gray-600'} fa-heart"></i>
            <span class="text-sm font-medium text-gray-700">Save</span>
          </button>
          <button onclick="event.stopPropagation(); shareDestination(${JSON.stringify(dest).replace(/"/g, '&quot;')})" 
                  class="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg transition-all hover:scale-105 bg-gray-50 hover:bg-gray-100"
                  title="Share destination">
            <i class="fas fa-share-alt text-gray-600"></i>
            <span class="text-sm font-medium text-gray-700">Share</span>
          </button>
        </div>
        
        <div class="flex items-center justify-between pt-4 border-t border-gray-100">
          <span class="text-xs font-semibold text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
            ${dest.category}
          </span>
          <span class="text-sm font-semibold text-gray-700 flex items-center hover:text-orange-500 transition-colors">
            Explore <i class="fas fa-arrow-right ml-2"></i>
          </span>
        </div>
      </div>
    </div>
  `).join('');

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full text-center py-16">
        <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <i class="fas fa-search text-3xl text-gray-400"></i>
        </div>
        <h3 class="text-xl font-bold text-gray-800 mb-2">No destinations found</h3>
        <p class="text-gray-500">Try adjusting your search or filters</p>
      </div>
    `;
  }
}

async function openDestination(id) {
  try {
    const dest = await fetchDestinationById(id);
    state.currentDestination = dest;
    trackVisit(id);

    document.getElementById('modalImage').src = dest.image_url;
    document.getElementById('modalName').textContent = dest.name;
    document.getElementById('modalProvince').querySelector('span').textContent = dest.province;
    document.getElementById('modalDescription').textContent = dest.description;
    document.getElementById('modalCategory').textContent = dest.category;
    document.getElementById('modalPrice').textContent = `$${dest.entry_fee_foreign} entry`;
    document.getElementById('modalFeatured').classList.toggle('hidden', !dest.featured);

    let stars = '';
    for (let i = 0; i < 5; i++) {
      stars += `<i class="fas fa-star ${i < Math.floor(dest.rating) ? '' : 'opacity-30'}"></i>`;
    }
    document.getElementById('modalRating').innerHTML = stars + `<span class="text-gray-600 ml-2">${dest.rating}</span>`;

    document.getElementById('destinationModal').classList.add('active');
    document.body.style.overflow = 'hidden';

    initDestinationMap(dest.lat, dest.lng, dest.name);
    renderReviews(id);

    state.droneRotation = 0;
    state.droneZoom = 1;
    state.autoFly = true;

    unlockAchievement('first_visit');

    if (state.treasureHuntActive && state.treasureClues[state.currentTreasureIndex]?.destination === id) {
      findTreasure();
    }

    addScore(5);
  } catch (err) {
    alert('Failed to load destination');
  }
}

function closeModal() {
  document.getElementById('destinationModal').classList.remove('active');
  document.body.style.overflow = '';
  if (destinationMap) {
    destinationMap.remove();
    destinationMap = null;
  }
}

function initMainMap() {
  if (mainMap) return;

  mainMap = L.map('fullMap').setView([-15.5, 28.5], 6);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(mainMap);

  destinations.forEach(dest => {
    const marker = L.marker([dest.lat, dest.lng]).addTo(mainMap);
    marker.bindPopup(`
      <div style="min-width: 200px;">
        <img src="${dest.image_url}" alt="${dest.name}" style="width: 100%; height: 100px; object-fit: cover; border-radius: 8px; margin-bottom: 8px;" onerror="this.src='https://via.placeholder.com/200x100/E85D04/FFFFFF?text=${encodeURIComponent(dest.name)}'">
        <h3 style="font-weight: bold; margin-bottom: 4px;">${dest.name}</h3>
        <p style="color: #666; font-size: 12px; margin-bottom: 8px;">${dest.province}</p>
        <button onclick="openDestination(${dest.id})" style="background: #f97316; color: white; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer; width: 100%;">
          View Details
        </button>
      </div>
    `);
  });
}

function initDestinationMap(lat, lng, name) {
  if (destinationMap) {
    destinationMap.remove();
  }

  setTimeout(() => {
    destinationMap = L.map('destination-map').setView([lat, lng], 14);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(destinationMap);

    L.marker([lat, lng]).addTo(destinationMap)
      .bindPopup(name)
      .openPopup();
  }, 100);
}

function rotateDrone(deg) {
  state.droneRotation += deg;
  updateDroneView();
}

function zoomDrone(factor) {
  state.droneZoom = Math.max(0.5, Math.min(2, state.droneZoom * factor));
  updateDroneView();
}

function toggleAutoFly() {
  state.autoFly = !state.autoFly;
  const scene = document.querySelector('.drone-scene');
  scene.style.animationPlayState = state.autoFly ? 'running' : 'paused';
  document.getElementById('autoFlyIcon').style.color = state.autoFly ? '' : '#f97316';
}

function updateDroneView() {
  const img = document.getElementById('modalImage');
  img.style.transform = `rotateY(${state.droneRotation}deg) scale(${state.droneZoom})`;
}

function addScore(points) {
  const oldScore = state.score;
  state.score += points;
  
  // Check for cash rewards
  checkCashRewards(oldScore, state.score);
  
  updateLevel();
  updateUI();
  renderLeaderboard();
  createParticles(points);
}

function checkCashRewards(oldScore, newScore) {
  const milestones = [
    { xp: 500, cash: 50, id: 'cash_500' },
    { xp: 1000, cash: 100, id: 'cash_1000' },
    { xp: 2000, cash: 250, id: 'cash_2000' }
  ];
  
  milestones.forEach(milestone => {
    if (oldScore < milestone.xp && newScore >= milestone.xp && !state.achievements.includes(milestone.id)) {
      state.cashEarned += milestone.cash;
      localStorage.setItem('cashEarned', state.cashEarned.toString());
      unlockAchievement(milestone.id);
      showCashReward(milestone.cash);
    }
  });
}

function showCashReward(amount) {
  const toast = document.getElementById('achievementToast');
  toast.style.background = 'linear-gradient(135deg, #10b981, #059669)';
  document.getElementById('achievementTitle').textContent = `💰 Cash Prize Won!`;
  document.getElementById('achievementDesc').textContent = `You earned K${amount} Kwacha!`;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 5000);
}

function updateLevel() {
  const newLevel = Math.floor(state.score / 100) + 1;
  if (newLevel > state.level) {
    state.level = newLevel;
    showAchievementToast('Level Up!', `You reached level ${newLevel}!`);
  }
}

function updateUI() {
  document.getElementById('adventureScore').textContent = state.score;
  document.getElementById('adventureLevel').textContent = state.level;
  document.getElementById('treasureCount').textContent = `${state.foundTreasures.length}/5 Found`;
  document.getElementById('treasureBar').style.width = `${(state.foundTreasures.length / 5) * 100}%`;
  renderLeaderboard();
}

function unlockAchievement(id) {
  if (state.achievements.includes(id)) return;

  const ach = achievementDefs.find(a => a.id === id);
  if (!ach) return;

  state.achievements.push(id);
  addScore(ach.xp);
  showAchievementToast(ach.name, ach.desc);
  renderAchievements();
}

function showAchievementToast(title, desc) {
  const toast = document.getElementById('achievementToast');
  document.getElementById('achievementTitle').textContent = title;
  document.getElementById('achievementDesc').textContent = desc;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 4000);
}

function createParticles(count) {
  for (let i = 0; i < Math.min(count, 10); i++) {
    setTimeout(() => {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.textContent = '✨';
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.top = `${Math.random() * 100}%`;
      particle.style.fontSize = `${20 + Math.random() * 20}px`;
      document.body.appendChild(particle);
      setTimeout(() => particle.remove(), 2000);
    }, i * 100);
  }
}

function startTreasureHunt() {
  state.treasureHuntActive = true;
  state.currentTreasureIndex = 0;
  updateClue();
  renderDestinations();
  showAchievementToast('Treasure Hunt Started!', 'Find hidden treasures across Zambia!');
}

function updateClue() {
  if (state.currentTreasureIndex < state.treasureClues.length) {
    document.getElementById('currentClue').textContent = state.treasureClues[state.currentTreasureIndex].clue;
  } else {
    document.getElementById('currentClue').textContent = '🎉 Congratulations! You found all treasures!';
    state.treasureHuntActive = false;
  }
}

function findTreasure() {
  const treasureId = state.treasureClues[state.currentTreasureIndex].destination;
  if (!state.foundTreasures.includes(treasureId)) {
    state.foundTreasures.push(treasureId);
    addScore(100);
    showAchievementToast('Treasure Found!', 'You discovered a hidden gem!');

    if (state.foundTreasures.length === 1) {
      unlockAchievement('treasure_hunter');
    }

    state.currentTreasureIndex++;
    updateClue();
    updateUI();
    renderDestinations();
  }
}

function renderAchievements() {
  const list = document.getElementById('achievementsList');
  list.innerHTML = achievementDefs.map(ach => {
    const unlocked = state.achievements.includes(ach.id);
    const isCashReward = ach.cash > 0;
    return `
      <div class="flex items-center gap-4 p-4 rounded-xl ${unlocked ? (isCashReward ? 'bg-green-50 border-2 border-green-200' : 'bg-green-50') : 'bg-gray-50'}">
        <div class="w-12 h-12 rounded-full flex items-center justify-center ${unlocked ? (isCashReward ? 'bg-green-500 text-white' : 'bg-green-500 text-white') : 'bg-gray-200 text-gray-400'}">
          <i class="fas ${ach.icon}"></i>
        </div>
        <div class="flex-1">
          <h4 class="font-bold ${unlocked ? (isCashReward ? 'text-green-700' : 'text-green-700') : 'text-gray-700'}">${ach.name}</h4>
          <p class="text-sm ${unlocked ? (isCashReward ? 'text-green-600' : 'text-green-600') : 'text-gray-500'}">${ach.desc}</p>
        </div>
        <span class="font-bold ${unlocked ? (isCashReward ? 'text-green-600' : 'text-green-600') : 'text-gray-400'}">
          ${isCashReward ? `K${ach.cash}` : `+${ach.xp} XP`}
        </span>
      </div>
    `;
  }).join('');
}

function renderLeaderboard() {
  const leaderboard = document.getElementById('leaderboard');
  const players = [
    { name: 'You', score: state.score, isYou: true },
    { name: 'Safari Sam', score: 850 },
    { name: 'WildlifeWatcher', score: 720 },
    { name: 'ZambiaExplorer', score: 680 },
    { name: 'NatureLover', score: 550 }
  ].sort((a, b) => b.score - a.score);

  leaderboard.innerHTML = players.map((p, i) => `
    <div class="flex items-center gap-4 p-3 rounded-xl ${p.isYou ? 'bg-white/20' : 'bg-white/10'}">
      <span class="w-8 h-8 flex items-center justify-center font-bold ${i === 0 ? 'text-yellow-400' : ''}">${i + 1}</span>
      <span class="flex-1 font-medium">${p.name}</span>
      <span class="font-bold">${p.score} XP</span>
    </div>
  `).join('');
}

function renderDailyChallenges() {
  const challenges = [
    { name: 'Visit 3 destinations', progress: 1, max: 3, xp: 30 },
    { name: 'Find an easter egg', progress: state.foundEggs.length > 0 ? 1 : 0, max: 1, xp: 20 },
    { name: 'Use the magic compass', progress: 0, max: 1, xp: 15 }
  ];

  const container = document.getElementById('dailyChallenges');
  container.innerHTML = challenges.map(c => `
    <div class="p-4 bg-gray-50 rounded-xl">
      <div class="flex justify-between items-center mb-2">
        <span class="font-medium text-gray-700">${c.name}</span>
        <span class="text-orange-500 font-bold">+${c.xp} XP</span>
      </div>
      <div class="treasure-progress">
        <div class="treasure-progress-bar" style="width: ${(c.progress / c.max) * 100}%"></div>
      </div>
      <p class="text-sm text-gray-500 mt-1">${c.progress}/${c.max} completed</p>
    </div>
  `).join('');
}

function setupEventListeners() {
  const searchInput = document.getElementById('searchInput');

  // Search with history tracking
  searchInput.addEventListener('input', () => {
    renderDestinations();
    if (searchInput.value.trim()) {
      addToSearchHistory(searchInput.value.trim());
    }
  });

  document.getElementById('provinceFilter').addEventListener('change', renderDestinations);
  document.getElementById('categoryFilter').addEventListener('change', renderDestinations);

  // Tabs
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
      document.getElementById(`${btn.dataset.tab}Tab`).classList.remove('hidden');
      if (btn.dataset.tab === 'map') {
        setTimeout(() => {
          if (!mainMap) initMainMap();
          else mainMap.invalidateSize();
        }, 100);
      }
    });
  });

  // Modal close
  document.getElementById('destinationModal').addEventListener('click', (e) => {
    if (e.target.id === 'destinationModal') closeModal();
  });

  // Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal();
    }
  });
}

function secretDoorClick() {
  state.secretDoorClicks++;
  if (state.secretDoorClicks >= 5) {
    unlockAchievement('secret_finder');
    state.secretDoorClicks = 0;
    document.body.style.filter = 'hue-rotate(180deg)';
    setTimeout(() => document.body.style.filter = '', 2000);
  }
}

function showRandomDestination() {
  const randomDest = destinations[Math.floor(Math.random() * destinations.length)];
  openDestination(randomDest.id);
  addScore(10);
}

function addToWishlist() {
  if (!state.currentDestination) return;
  if (!state.wishlist.includes(state.currentDestination.id)) {
    state.wishlist.push(state.currentDestination.id);
    showAchievementToast('Added to Wishlist!', state.currentDestination.name);
    addScore(5);
  }
}

function shareDestination() {
  if (state.currentDestination) {
    const text = `Check out ${state.currentDestination.name} in Zambia! 🇿🇲`;
    if (navigator.share) {
      navigator.share({ title: state.currentDestination.name, text });
    } else {
      showAchievementToast('Share', 'Link copied to clipboard!');
    }
  }
}

function getDirections() {
  if (state.currentDestination) {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${state.currentDestination.lat},${state.currentDestination.lng}`, '_blank');
  }
}

// New feature functions
function checkDailyLogin() {
  const today = new Date().toDateString();
  const lastLogin = state.lastLogin;
  
  if (lastLogin !== today) {
    if (lastLogin === new Date(Date.now() - 86400000).toDateString()) {
      // Consecutive day
      state.loginStreak++;
    } else if (lastLogin) {
      // Streak broken
      state.loginStreak = 1;
    } else {
      // First login
      state.loginStreak = 1;
    }
    
    state.lastLogin = today;
    localStorage.setItem('lastLogin', today);
    localStorage.setItem('loginStreak', state.loginStreak.toString());
    
    // Streak bonuses
    const bonus = state.loginStreak * 5;
    addScore(bonus);
    showAchievementToast('Daily Login!', `${state.loginStreak} day streak! +${bonus} XP`);
    
    // Streak achievements
    if (state.loginStreak === 3) unlockAchievement('streak_3');
    if (state.loginStreak === 7) unlockAchievement('streak_7');
  }
}

function submitReview() {
  const rating = document.getElementById('userRating').value;
  const text = document.getElementById('reviewText').value.trim();
  
  if (!text) {
    alert('Please write a review!');
    return;
  }
  
  const destId = state.currentDestination.id;
  const review = {
    rating: parseInt(rating),
    text: text,
    date: new Date().toLocaleDateString(),
    user: 'You'
  };
  
  state.userReviews[destId] = review;
  localStorage.setItem('userReviews', JSON.stringify(state.userReviews));
  
  document.getElementById('reviewText').value = '';
  renderReviews(destId);
  addScore(25);
  unlockAchievement('reviewer');
  showAchievementToast('Review Added!', '+25 XP for sharing your experience');
}

function renderReviews(destId) {
  const container = document.getElementById('existingReviews');
  const review = state.userReviews[destId];
  
  if (review) {
    container.innerHTML = `
      <div class="bg-white border rounded-xl p-4">
        <div class="flex justify-between items-start mb-2">
          <div class="flex items-center gap-2">
            <span class="font-semibold">${review.user}</span>
            <span class="text-yellow-500">${'⭐'.repeat(review.rating)}</span>
          </div>
          <span class="text-sm text-gray-500">${review.date}</span>
        </div>
        <p class="text-gray-700">${review.text}</p>
      </div>
    `;
  } else {
    container.innerHTML = '<p class="text-gray-500 text-center py-4">No reviews yet. Be the first!</p>';
  }
}

// Civic challenge functions - now with enhanced features
async function startCivicChallenge(challengeId) {
  if (!state.token) {
    alert('Please login first to submit safety reports!');
    showLoginForm();
    return;
  }
  
  const challenge = civicChallenges.find(c => c.id === challengeId);
  if (!challenge) return;
  
  // Enhanced reporting modal
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4';
  modal.innerHTML = `
    <div class="bg-white rounded-3xl max-w-md w-full p-8 max-h-[90vh] overflow-y-auto">
      <div class="text-center mb-6">
        <div class="w-16 h-16 ${challenge.color} rounded-full flex items-center justify-center mx-auto mb-4">
          <i class="fas ${challenge.icon} text-2xl text-white"></i>
        </div>
        <h2 class="text-2xl font-bold">${challenge.name}</h2>
        <p class="text-gray-600">${challenge.desc}</p>
      </div>
      
      <form id="reportForm">
        <div class="mb-4">
          <label class="block text-sm font-bold mb-2">Report Title</label>
          <input type="text" id="reportTitle" required class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none" placeholder="Brief title for this issue">
        </div>
        
        <div class="mb-4">
          <label class="block text-sm font-bold mb-2">Description</label>
          <textarea id="reportDescription" required rows="3" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none" placeholder="Describe the issue in detail..."></textarea>
        </div>
        
        <div class="mb-4">
          <label class="block text-sm font-bold mb-2 flex items-center gap-2">
            <i class="fas fa-camera text-blue-500"></i> Photos (Optional - +50% XP Bonus)
          </label>
          <input type="file" id="reportPhotos" multiple accept="image/*" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none">
          <p class="text-xs text-gray-500 mt-1">Upload up to 3 photos for bonus XP</p>
        </div>
        
        <div class="mb-6">
          <label class="flex items-center gap-2">
            <input type="checkbox" id="useLocation" checked class="rounded">
            <span class="text-sm">Use my current location (GPS)</span>
          </label>
        </div>
        
        <div class="flex gap-3">
          <button type="button" onclick="this.closest('.fixed').remove()" class="flex-1 px-6 py-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-all">
            Cancel
          </button>
          <button type="submit" class="flex-1 px-6 py-3 ${challenge.color} text-white rounded-xl hover:opacity-90 transition-all">
            Submit Report
          </button>
        </div>
      </form>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Handle form submission
  modal.querySelector('#reportForm').onsubmit = async (e) => {
    e.preventDefault();
    
    const title = document.getElementById('reportTitle').value.trim();
    const description = document.getElementById('reportDescription').value.trim();
    const photos = document.getElementById('reportPhotos').files;
    const useLocation = document.getElementById('useLocation').checked;
    
    if (!title || !description) {
      alert('Please fill in all required fields');
      return;
    }
    
    try {
      // Get location
      let latitude, longitude;
      if (useLocation && navigator.geolocation) {
        try {
          const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              timeout: 10000,
              enableHighAccuracy: false
            });
          });
          latitude = position.coords.latitude;
          longitude = position.coords.longitude;
        } catch (locationError) {
          console.warn('Location access failed:', locationError);
          // Default to Lusaka coordinates
          latitude = -15.4167 + (Math.random() - 0.5) * 0.1;
          longitude = 28.2833 + (Math.random() - 0.5) * 0.1;
        }
      } else {
        // Default to Lusaka coordinates
        latitude = -15.4167 + (Math.random() - 0.5) * 0.1;
        longitude = 28.2833 + (Math.random() - 0.5) * 0.1;
      }
      
      // Simulate photo upload (in production, upload to cloud storage)
      const imageUrls = [];
      if (photos.length > 0) {
        for (let i = 0; i < Math.min(photos.length, 3); i++) {
          imageUrls.push(`https://via.placeholder.com/400x300?text=Photo+${i+1}`);
        }
      }
      
      // Get weather data
      const weatherData = {
        temperature: Math.round(20 + Math.random() * 15),
        condition: 'Sunny',
        timestamp: new Date().toISOString()
      };
      
      const result = await submitCivicReport({
        type: challengeId,
        title,
        description,
        latitude,
        longitude,
        address: `Tourist area near ${title}`,
        imageUrls,
        weatherData
      }, state.token);
      
      // Calculate bonus XP for photos
      let totalXP = result.reward.xp;
      if (imageUrls.length > 0) {
        const bonusXP = Math.floor(totalXP * 0.5);
        totalXP += bonusXP;
        showAchievementToast('Photo Bonus!', `+${bonusXP} bonus XP for photos!`);
      }
      
      // Update local state
      state.civicXP += totalXP;
      state.cashEarned += result.reward.cash;
      
      if (result.levelUp) {
        state.civicLevel++;
        showAchievementToast('Level Up!', `You reached Safety Level ${state.civicLevel}!`);
      }
      
      addScore(totalXP);
      showAchievementToast('Report Submitted!', `+${totalXP} XP, +K${result.reward.cash}`);
      
      // Close modal and reload
      modal.remove();
      await loadUserProfile();
      renderTabs();
      
    } catch (error) {
      console.error('Failed to submit report:', error);
      alert('Failed to submit report. Please try again.');
    }
  };
}

// User authentication functions
function displayUserInfo() {
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  const welcomeEl = document.getElementById('userWelcome');
  if (welcomeEl && userData.fullName) {
    welcomeEl.textContent = userData.fullName;
  }
}

function logout() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userData');
  window.location.href = 'login.html';
}

function showLoginForm() {
  window.location.href = 'login.html';
}

async function loginUser(email, password) {
  try {
    const { loginUser: login } = await import('./api.js');
    const result = await login(email, password);
    
    if (result.token) {
      state.token = result.token;
      state.user = result.user;
      localStorage.setItem('authToken', result.token);
      localStorage.setItem('userData', JSON.stringify(result.user));
      showAchievementToast('Login Successful!', `Welcome back, ${result.user.fullName}!`);
      await loadUserProfile();
      displayUserInfo();
    } else {
      alert(result.error || 'Login failed');
    }
  } catch (error) {
    console.error('Login error:', error);
    alert('Login failed. Please check your credentials.');
  }
}

// Load weather data for destination
async function loadDestinationWeather(destinationId) {
  try {
    const response = await fetch(`http://localhost:3001/api/destinations/${destinationId}/weather`);
    const weather = await response.json();
    
    const weatherContainer = document.getElementById('destinationWeather');
    if (weatherContainer) {
      weatherContainer.innerHTML = `
        <div>
          <div class="text-3xl mb-2">${weather.icon}</div>
          <div class="text-2xl font-bold">${weather.temperature}°C</div>
          <div class="text-sm opacity-90">${weather.condition}</div>
        </div>
        <div>
          <div class="text-sm opacity-90 mb-1">Humidity</div>
          <div class="text-xl font-bold">${weather.humidity}%</div>
        </div>
        <div>
          <div class="text-sm opacity-90 mb-1">Wind</div>
          <div class="text-xl font-bold">${weather.windSpeed} km/h</div>
        </div>
      `;
    }
  } catch (error) {
    console.error('Weather load error:', error);
    const weatherContainer = document.getElementById('destinationWeather');
    if (weatherContainer) {
      weatherContainer.innerHTML = '<p class="text-sm opacity-75">Weather data unavailable</p>';
    }
  }
}

// Load and display notifications
async function loadNotifications() {
  if (!state.token) return;
  
  try {
    const response = await fetch('http://localhost:3001/api/notifications', {
      headers: { 'Authorization': `Bearer ${state.token}` }
    });
    const notifications = await response.json();
    
    // Show unread notifications
    const unreadCount = notifications.filter(n => !n.read).length;
    if (unreadCount > 0) {
      showNotificationBadge(unreadCount);
    }
    
    // Show latest notification as toast
    const latestUnread = notifications.find(n => !n.read);
    if (latestUnread && !localStorage.getItem(`notif_${latestUnread.id}`)) {
      showAchievementToast(latestUnread.title, latestUnread.message);
      localStorage.setItem(`notif_${latestUnread.id}`, 'shown');
    }
  } catch (error) {
    console.error('Notifications error:', error);
  }
}

// Show notification badge
function showNotificationBadge(count) {
  const badge = document.createElement('div');
  badge.className = 'fixed top-4 right-4 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold z-50';
  badge.textContent = count;
  badge.onclick = () => {
    alert(`You have ${count} new notifications!`);
    badge.remove();
  };
  document.body.appendChild(badge);
  
  // Auto-hide after 10 seconds
  setTimeout(() => badge.remove(), 10000);
}

function trackVisit(destId) {
  if (!state.visitedDestinations.includes(destId)) {
    state.visitedDestinations.push(destId);
    localStorage.setItem('visitedDestinations', JSON.stringify(state.visitedDestinations));
    
    state.travelStats.totalVisits++;
    localStorage.setItem('travelStats', JSON.stringify(state.travelStats));
    
    if (state.visitedDestinations.length === 5) {
      unlockAchievement('explorer');
    }
  }
}

async function loadUserProfile() {
  if (!state.token) return;
  
  try {
    const profile = await getUserCivicProfile(state.token);
    const reports = await getUserCivicReports(state.token);
    
    // Update state with database data
    state.user = profile.user;
    state.civicXP = profile.user.civic_xp;
    state.civicLevel = profile.user.civic_level;
    state.cashEarned = profile.user.cash_earned;
    state.civicReports = reports;
    
  } catch (error) {
    console.error('Failed to load profile:', error);
    // Token might be expired
    state.token = null;
    localStorage.removeItem('authToken');
  }
}

// Make functions globally accessible
window.openDestination = openDestination;
window.closeModal = closeModal;
window.rotateDrone = rotateDrone;
window.zoomDrone = zoomDrone;
window.toggleAutoFly = toggleAutoFly;
window.startTreasureHunt = startTreasureHunt;
window.secretDoorClick = secretDoorClick;
window.showRandomDestination = showRandomDestination;
window.addToWishlist = addToWishlist;
window.shareDestination = shareDestination;
window.getDirections = getDirections;
window.submitReview = submitReview;
window.startCivicChallenge = startCivicChallenge;
window.logout = logout;