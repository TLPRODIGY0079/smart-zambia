// js/main.js - Clean Version (legacy; see main.js banner — production uses public/index.html.)
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
  loginStreak: parseInt(localStorage.getItem('loginStreak') || '0'),
  lastLogin: localStorage.getItem('lastLogin'),
  visitedDestinations: JSON.parse(localStorage.getItem('visitedDestinations') || '[]'),
  userReviews: JSON.parse(localStorage.getItem('userReviews') || '{}'),
  travelStats: JSON.parse(localStorage.getItem('travelStats') || '{"totalVisits": 0, "favoriteCategory": "Nature", "totalDistance": 0}'),
  cashEarned: parseInt(localStorage.getItem('cashEarned') || '0'),
  civicReports: [],
  civicLevel: 1,
  civicXP: 0,
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
  { id: 'civic_hero', name: 'Civic Hero', desc: 'Make your first civic report', icon: 'fa-shield-alt', xp: 50 },
  { id: 'city_fixer', name: 'City Fixer', desc: 'Report 10 civic issues', icon: 'fa-tools', xp: 200 },
  { id: 'community_leader', name: 'Community Leader', desc: 'Reach Civic Level 5', icon: 'fa-crown', xp: 500 }
];

let mainMap = null;
let destinationMap = null;

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

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  // Check authentication
  if (!state.token) {
    window.location.href = 'login.html';
    return;
  }
  
  displayUserInfo();
  checkDailyLogin();
  await loadUserProfile();
  renderTabs();
  await loadDestinationsFromAPI();
  setupEventListeners();
  renderAchievements();
  renderLeaderboard();
  renderDailyChallenges();
  updateUI();
});

async function loadUserProfile() {
  if (!state.token) return;
  
  try {
    const profile = await getUserCivicProfile(state.token);
    const reports = await getUserCivicReports(state.token);
    
    state.user = profile.user;
    state.civicXP = profile.user.civic_xp;
    state.civicLevel = profile.user.civic_level;
    state.cashEarned = profile.user.cash_earned;
    state.civicReports = reports;
    
  } catch (error) {
    console.error('Failed to load profile:', error);
    state.token = null;
    localStorage.removeItem('authToken');
  }
}

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
      </div>
    </div>
  `;

  document.getElementById('adventuresTab').innerHTML = `
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div class="bg-gradient-to-br from-green-400 to-blue-500 rounded-3xl shadow-2xl p-8 text-white">
        <h2 class="text-3xl font-bold mb-4 flex items-center gap-3">
          <i class="fas fa-fire"></i> Daily Streak
        </h2>
        <div class="bg-white/20 backdrop-blur-sm rounded-2xl p-6 mb-6">
          <p class="text-4xl font-bold mb-2">${state.loginStreak}</p>
          <p class="text-lg opacity-90">Days in a row!</p>
        </div>
      </div>

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
            <span>Cash Earned:</span>
            <span class="font-bold text-green-300">K${state.cashEarned}</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

async function loadDestinationsFromAPI() {
  try {
    destinations = await fetchDestinations();
    renderDestinations();
    initMainMap();
  } catch (err) {
    console.error('API Error:', err);
    document.getElementById('destinationsGrid').innerHTML = `
      <div class="col-span-full text-center py-16">
        <p class="text-red-500">Failed to load destinations. Please try again later.</p>
      </div>
    `;
  }
}

function renderDestinations() {
  const grid = document.getElementById('destinationsGrid');
  if (!grid) return;
  
  const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
  const province = document.getElementById('provinceFilter')?.value || 'All';
  const category = document.getElementById('categoryFilter')?.value || 'All';

  const filtered = destinations.filter(dest => {
    const matchesSearch = dest.name.toLowerCase().includes(searchTerm) || 
                          dest.description.toLowerCase().includes(searchTerm);
    const matchesProvince = province === 'All' || dest.province.includes(province);
    const matchesCategory = category === 'All' || dest.category === category;
    return matchesSearch && matchesProvince && matchesCategory;
  });

  grid.innerHTML = filtered.map(dest => `
    <div class="destination-card" onclick="openDestination(${dest.id})">
      <div class="relative h-48 overflow-hidden">
        <img src="${dest.image_url}" alt="${dest.name}" class="card-image w-full h-full object-cover">
        <div class="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg text-sm font-bold text-gray-800 flex items-center gap-1">
          <i class="fas fa-star text-yellow-500"></i>
          ${dest.rating}
        </div>
        ${dest.featured ? `
          <div class="absolute top-3 left-3 bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-lg text-xs font-bold shadow-lg">
            <i class="fas fa-fire mr-1"></i>Featured
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
}

async function openDestination(id) {
  try {
    const dest = await fetchDestinationById(id);
    state.currentDestination = dest;
    trackVisit(id);
    
    // Show modal with destination details
    alert(`Opening ${dest.name} - ${dest.description.substring(0, 100)}...`);
    
    addScore(5);
  } catch (err) {
    alert('Failed to load destination');
  }
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

function initMainMap() {
  // Map initialization would go here
  console.log('Map initialized with', destinations.length, 'destinations');
}

async function startCivicChallenge(challengeId) {
  if (!state.token) {
    alert('Please login first to submit safety reports!');
    showLoginForm();
    return;
  }
  
  const challenge = civicChallenges.find(c => c.id === challengeId);
  if (!challenge) return;
  
  const title = prompt(`Report: ${challenge.name}\nTitle:`);
  if (!title) return;
  
  const description = prompt('Describe the issue:');
  if (!description) return;
  
  try {
    const result = await submitCivicReport({
      type: challengeId,
      title: title.trim(),
      description: description.trim(),
      latitude: -15.4167 + (Math.random() - 0.5) * 0.1,
      longitude: 28.2833 + (Math.random() - 0.5) * 0.1,
      address: `Tourist area - ${title}`
    }, state.token);
    
    state.civicXP += result.reward.xp;
    state.cashEarned += result.reward.cash;
    
    if (result.levelUp) {
      state.civicLevel++;
      alert(`Level Up! You reached Safety Level ${state.civicLevel}!`);
    }
    
    addScore(result.reward.xp);
    alert(`Report Submitted! +${result.reward.xp} XP, +K${result.reward.cash}`);
    
    await loadUserProfile();
    renderTabs();
    
  } catch (error) {
    console.error('Failed to submit report:', error);
    alert('Failed to submit report. Please try again.');
  }
}

function setupEventListeners() {
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', renderDestinations);
  }
  
  const provinceFilter = document.getElementById('provinceFilter');
  if (provinceFilter) {
    provinceFilter.addEventListener('change', loadDestinationsFromAPI);
  }
  
  const categoryFilter = document.getElementById('categoryFilter');
  if (categoryFilter) {
    categoryFilter.addEventListener('change', loadDestinationsFromAPI);
  }

  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
      document.getElementById(`${btn.dataset.tab}Tab`).classList.remove('hidden');
    });
  });
}

function renderAchievements() {
  console.log('Rendering achievements...');
}

function renderLeaderboard() {
  console.log('Rendering leaderboard...');
}

function renderDailyChallenges() {
  console.log('Rendering daily challenges...');
}

function updateUI() {
  const scoreEl = document.getElementById('adventureScore');
  const levelEl = document.getElementById('adventureLevel');
  
  if (scoreEl) scoreEl.textContent = state.score;
  if (levelEl) levelEl.textContent = state.level;
}

function addScore(points) {
  state.score += points;
  updateLevel();
  updateUI();
}

function updateLevel() {
  const newLevel = Math.floor(state.score / 100) + 1;
  if (newLevel > state.level) {
    state.level = newLevel;
    alert(`Level Up! You reached level ${newLevel}!`);
  }
}

function unlockAchievement(id) {
  if (state.achievements.includes(id)) return;

  const ach = achievementDefs.find(a => a.id === id);
  if (!ach) return;

  state.achievements.push(id);
  addScore(ach.xp);
  alert(`Achievement Unlocked: ${ach.name} - ${ach.desc}`);
}

function checkDailyLogin() {
  const today = new Date().toDateString();
  const lastLogin = state.lastLogin;
  
  if (lastLogin !== today) {
    if (lastLogin === new Date(Date.now() - 86400000).toDateString()) {
      state.loginStreak++;
    } else if (lastLogin) {
      state.loginStreak = 1;
    } else {
      state.loginStreak = 1;
    }
    
    state.lastLogin = today;
    localStorage.setItem('lastLogin', today);
    localStorage.setItem('loginStreak', state.loginStreak.toString());
    
    const bonus = state.loginStreak * 5;
    addScore(bonus);
    alert(`Daily Login! ${state.loginStreak} day streak! +${bonus} XP`);
  }
}

// Make functions globally accessible
window.openDestination = openDestination;
window.startCivicChallenge = startCivicChallenge;
window.logout = logout;