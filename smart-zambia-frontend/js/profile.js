// ============================================
// PROFILE MANAGEMENT
// ============================================

// ============================================
// MAIN PROFILE DATA LOADER
// ============================================

async function loadProfileData() {
  try {
    // Get user data from state or API
    const user = window.state?.user;
    
    if (!user) {
      console.error('No user data available');
      return;
    }
    
    console.log('Loading profile data...');
    
    // Update profile header
    const profileName = document.getElementById('profileName');
    const profileEmail = document.getElementById('profileEmail');
    const profileInitial = document.getElementById('profileInitial');
    const profileLocation = document.getElementById('profileLocation');
    const profileBio = document.getElementById('profileBio');
    
    if (profileName) profileName.textContent = user.name || 'User';
    if (profileEmail) profileEmail.textContent = user.email || '';
    if (profileInitial) profileInitial.textContent = (user.name || 'U').charAt(0).toUpperCase();
    
    // Show/hide location
    if (profileLocation) {
      if (user.location) {
        profileLocation.querySelector('span').textContent = user.location;
        profileLocation.classList.remove('hidden');
      } else {
        profileLocation.classList.add('hidden');
      }
    }
    
    // Show/hide bio
    if (profileBio) {
      if (user.bio) {
        profileBio.textContent = user.bio;
        profileBio.classList.remove('hidden');
      } else {
        profileBio.classList.add('hidden');
      }
    }
    
    // Load profile image
    loadProfileImage();
    
    // Update XP and Level
    const xp = window.state?.score || 0;
    const level = window.state?.level || 1;
    const cash = window.state?.cashEarned || 0;
    
    console.log('Displaying values:', { xp, level, cash });
    
    // Animate counters
    setTimeout(() => {
      animateCounter(document.getElementById('profileXP'), xp, 800);
      animateCounter(document.getElementById('profileLevel'), level, 600);
      animateCounter(document.getElementById('profileCash'), cash, 800);
      animateCounter(document.getElementById('profileLevelBig'), level, 600);
      animateCounter(document.getElementById('profileCashBig'), cash, 800);
    }, 200);
    
    // Calculate level progress
    const nextLevelXP = level * 100;
    const currentLevelXP = (level - 1) * 100;
    const progress = ((xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;
    
    // Animate progress bar
    setTimeout(() => {
      const progressBar = document.getElementById('profileLevelBar');
      if (progressBar) {
        progressBar.style.width = `${Math.min(progress, 100)}%`;
      }
    }, 300);
    
    // Update level ring (SVG circle)
    const circumference = 2 * Math.PI * 65; // radius = 65
    const offset = circumference - (progress / 100) * circumference;
    const ring = document.getElementById('profileLevelRing');
    if (ring) {
      setTimeout(() => {
        ring.style.strokeDashoffset = offset;
      }, 300);
    }
    
    // Update level badge
    const levelBadge = document.getElementById('profileLevelBadge');
    if (levelBadge) {
      levelBadge.textContent = level;
    }
    
    // Update progress labels
    const currentXPLabel = document.getElementById('profileCurrentXPLabel');
    const nextLevelLabel = document.getElementById('profileNextLevelLabel');
    if (currentXPLabel) currentXPLabel.textContent = `${xp} XP`;
    if (nextLevelLabel) nextLevelLabel.textContent = `${nextLevelXP - xp} XP to next level`;
    
    // Update stats
    const destCount = window.state?.visitedDestinations?.length || 0;
    const reviewsCount = Object.keys(window.state?.userReviews || {}).length;
    const streakCount = window.state?.loginStreak || 0;
    
    // Treasure hunt stats
    const treasureStats = window.state?.treasureHuntStats || {
      totalHunts: 0,
      completedHunts: 0,
      treasuresFound: 0,
      totalRewards: 0
    };
    
    // Animate stat counters
    setTimeout(() => {
      animateCounter(document.getElementById('statsDestinations'), destCount, 600);
      animateCounter(document.getElementById('statsReviews'), reviewsCount, 600);
      animateCounter(document.getElementById('statsStreak'), streakCount, 600);
      animateCounter(document.getElementById('profileStreakBig'), streakCount, 600);
      
      // Animate treasure hunt stats
      animateCounter(document.getElementById('statsTreasuresFound'), treasureStats.treasuresFound, 600);
      animateCounter(document.getElementById('statsHuntsCompleted'), treasureStats.completedHunts, 600);
      animateCounter(document.getElementById('statsTreasureRewards'), treasureStats.totalRewards, 600);
      animateCounter(document.getElementById('statsTotalHunts'), treasureStats.totalHunts, 600);
    }, 400);
    
    // Update streak visualization
    const streak = window.state?.loginStreak || 0;
    for (let i = 1; i <= 7; i++) {
      const dayEl = document.getElementById(`streakDay${i}`);
      if (dayEl) {
        if (i <= streak) {
          dayEl.style.background = 'linear-gradient(135deg, #F59E0B, #EF4444)';
          dayEl.style.color = 'white';
          dayEl.innerHTML = '<i class="fas fa-fire text-xs"></i>';
        } else {
          dayEl.style.background = '#E5E7EB';
          dayEl.style.color = '#9CA3AF';
          dayEl.textContent = i;
        }
      }
    }
    
    // Update cash rewards
    const reward500 = document.getElementById('reward500');
    const reward1000 = document.getElementById('reward1000');
    const reward2000 = document.getElementById('reward2000');
    
    if (reward500) reward500.textContent = xp >= 500 ? '✅ K50' : 'K50';
    if (reward1000) reward1000.textContent = xp >= 1000 ? '✅ K100' : 'K100';
    if (reward2000) reward2000.textContent = xp >= 2000 ? '✅ K250' : 'K250';
    
    // Load favorites, achievements, and activity
    await loadProfileFavorites();
    loadProfileAchievements();
    loadRecentActivity();
    
    console.log('Profile data loaded successfully');
    
  } catch (error) {
    console.error('Error loading profile data:', error);
  }
}

// ============================================
// PROFILE FAVORITES
// ============================================

async function loadProfileFavorites() {
  try {
    const favorites = window.state?.wishlist || [];
    const statsFavEl = document.getElementById('statsFavorites');
    if (statsFavEl) {
      statsFavEl.textContent = favorites.length;
    }
    
    const container = document.getElementById('profileFavorites');
    if (!container) return;
    
    if (favorites.length === 0) {
      container.innerHTML = `
        <div class="col-span-2 text-center py-8" style="color: var(--text-secondary)">
          <i class="fas fa-heart text-4xl mb-3 opacity-30"></i>
          <p>No favorites yet</p>
        </div>
      `;
      return;
    }
    
    // Get favorite destinations
    const favDestinations = window.destinations?.filter(d => favorites.includes(d.id)).slice(0, 6) || [];
    
    container.innerHTML = favDestinations.map((dest, index) => `
      <div class="favorite-card group rounded-2xl overflow-hidden cursor-pointer hover:scale-105 hover:shadow-2xl transition-all animate-fadeInUp relative" 
           style="border: 2px solid var(--border-color); 
                  animation-delay: ${index * 0.1}s; 
                  opacity: 0;" 
           onclick="openDestination(${dest.id})">
        <!-- Image with zoom effect -->
        <div class="relative overflow-hidden">
          <img src="${dest.image_url}" 
               alt="${dest.name}" 
               class="w-full h-40 object-cover group-hover:scale-110 transition-transform duration-500" 
               onerror="this.src='https://via.placeholder.com/300x200/E85D04/FFFFFF?text=${encodeURIComponent(dest.name)}'">
          <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent group-hover:from-black/80 transition-all"></div>
          
          <!-- Animated heart -->
          <div class="absolute top-3 right-3 w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center text-white shadow-xl group-hover:scale-125 group-hover:rotate-12 transition-all">
            <i class="fas fa-heart text-base animate-pulse"></i>
          </div>
          
          <!-- Rating badge -->
          <div class="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/50 backdrop-blur-sm text-white text-xs font-bold flex items-center gap-1">
            <i class="fas fa-star text-yellow-400"></i>
            ${dest.rating}
          </div>
        </div>
        
        <!-- Content with gradient background -->
        <div class="p-4 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 group-hover:from-orange-50 group-hover:to-red-50 dark:group-hover:from-orange-900/20 dark:group-hover:to-red-900/20 transition-all" style="background: var(--bg-card);">
          <h4 class="font-bold text-base mb-2 group-hover:text-orange-600 transition-colors" style="color: var(--text-primary)">${dest.name}</h4>
          <p class="text-xs flex items-center mb-2" style="color: var(--text-secondary)">
            <i class="fas fa-map-marker-alt text-orange-500 mr-2"></i>${dest.province}
          </p>
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold px-3 py-1 rounded-full" style="background: rgba(232,93,4,0.1); color: #E85D04;">
              ${dest.category}
            </span>
            <span class="text-xs font-bold text-green-600">
              $${dest.entry_fee_foreign}
            </span>
          </div>
        </div>
        
        <!-- Bottom shine effect -->
        <div class="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform"></div>
      </div>
    `).join('');
    
    // Trigger animations
    setTimeout(() => {
      container.querySelectorAll('.animate-fadeInUp').forEach(el => {
        el.style.opacity = '1';
      });
    }, 100);
    
  } catch (error) {
    console.error('Error loading favorites:', error);
  }
}

// ============================================
// PROFILE ACHIEVEMENTS
// ============================================

function loadProfileAchievements() {
  const achievements = window.state?.achievements || [];
  const container = document.getElementById('profileAchievements');
  
  if (!container) return;
  
  if (achievements.length === 0) {
    container.innerHTML = `
      <div class="col-span-2 text-center py-8" style="color: var(--text-secondary)">
        <i class="fas fa-trophy text-4xl mb-3 opacity-30"></i>
        <p>No achievements yet. Start exploring!</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = achievements.map((ach, index) => `
    <div class="achievement-card group p-5 rounded-2xl hover:scale-105 hover:shadow-2xl transition-all cursor-pointer animate-fadeInUp relative overflow-hidden" 
         style="background: linear-gradient(135deg, rgba(251,191,36,0.05), rgba(245,158,11,0.1)); 
                border: 2px solid rgba(251,191,36,0.2); 
                animation-delay: ${index * 0.1}s; 
                opacity: 0;">
      <!-- Shine effect on hover -->
      <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
      
      <div class="relative flex items-center gap-4">
        <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 flex items-center justify-center text-white shadow-xl group-hover:rotate-12 group-hover:scale-110 transition-all">
          <i class="fas ${ach.icon || 'fa-trophy'} text-2xl"></i>
        </div>
        <div class="flex-1">
          <h4 class="font-bold text-base mb-1 group-hover:text-orange-600 transition-colors" style="color: var(--text-primary)">${ach.name}</h4>
          <p class="text-xs mb-2 leading-relaxed" style="color: var(--text-secondary)">${ach.desc}</p>
          <div class="flex items-center gap-2 flex-wrap">
            <span class="text-xs font-bold px-3 py-1 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-md">
              <i class="fas fa-plus-circle mr-1"></i>${ach.xp} XP
            </span>
            ${ach.cash ? `<span class="text-xs font-bold px-3 py-1 rounded-full bg-gradient-to-r from-blue-400 to-cyan-500 text-white shadow-md">
              <i class="fas fa-coins mr-1"></i>K${ach.cash}
            </span>` : ''}
          </div>
        </div>
      </div>
      
      <!-- Bottom glow effect -->
      <div class="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 transform scale-x-0 group-hover:scale-x-100 transition-transform"></div>
    </div>
  `).join('');
  
  // Trigger animations
  setTimeout(() => {
    container.querySelectorAll('.animate-fadeInUp').forEach(el => {
      el.style.opacity = '1';
    });
  }, 100);
}

// ============================================
// RECENT ACTIVITY
// ============================================

function loadRecentActivity() {
  const container = document.getElementById('recentActivity');
  if (!container) return;
  
  const activities = [];
  
  // Add visited destinations
  if (window.state?.visitedDestinations) {
    window.state.visitedDestinations.slice(-5).forEach(destId => {
      const dest = window.destinations?.find(d => d.id === destId);
      if (dest) {
        activities.push({
          icon: 'fa-map-marker-alt',
          color: 'text-orange-500',
          bgColor: 'bg-orange-100',
          bgGradient: 'from-orange-400 to-red-500',
          text: `Visited ${dest.name}`,
          time: 'Recently'
        });
      }
    });
  }
  
  // Add achievements
  if (window.state?.achievements) {
    window.state.achievements.slice(-3).forEach(ach => {
      activities.push({
        icon: 'fa-trophy',
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-100',
        bgGradient: 'from-yellow-400 to-orange-500',
        text: `Unlocked "${ach.name}"`,
        time: 'Recently'
      });
    });
  }
  
  if (activities.length === 0) {
    container.innerHTML = `
      <div class="text-center py-8" style="color: var(--text-secondary)">
        <i class="fas fa-history text-4xl mb-3 opacity-30"></i>
        <p>No recent activity yet</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = `
    <!-- Timeline line with gradient -->
    <div class="absolute left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500 opacity-30 rounded-full"></div>
    
    ${activities.slice(0, 10).map((activity, index) => `
      <div class="activity-item group relative flex items-start gap-4 p-4 rounded-2xl mb-3 hover:bg-gradient-to-r hover:from-gray-50 hover:to-transparent dark:hover:from-gray-800 dark:hover:to-transparent transition-all cursor-pointer animate-fadeInUp hover:scale-[1.02] hover:shadow-lg" 
           style="animation-delay: ${index * 0.08}s; opacity: 0;">
        <!-- Timeline dot with pulse animation -->
        <div class="absolute left-6 w-4 h-4 rounded-full ${activity.bgColor} border-3 border-white dark:border-gray-900 z-10 group-hover:scale-125 transition-transform shadow-lg" 
             style="transform: translateX(-50%); box-shadow: 0 0 0 0 rgba(249, 115, 22, 0.4);">
          <div class="absolute inset-0 rounded-full bg-gradient-to-br ${activity.bgGradient} animate-ping opacity-75"></div>
        </div>
        
        <!-- Icon container with gradient -->
        <div class="w-12 h-12 rounded-xl bg-gradient-to-br ${activity.bgGradient} flex items-center justify-center flex-shrink-0 ml-8 shadow-lg group-hover:rotate-6 group-hover:scale-110 transition-all">
          <i class="fas ${activity.icon} text-white text-lg"></i>
        </div>
        
        <!-- Content -->
        <div class="flex-1 pt-1">
          <p class="text-sm font-semibold mb-1 group-hover:text-orange-600 transition-colors" style="color: var(--text-primary)">${activity.text}</p>
          <div class="flex items-center gap-2">
            <p class="text-xs" style="color: var(--text-secondary)">
              <i class="fas fa-clock mr-1"></i>${activity.time}
            </p>
          </div>
        </div>
        
        <!-- Hover arrow -->
        <div class="opacity-0 group-hover:opacity-100 transition-opacity">
          <i class="fas fa-chevron-right text-gray-400"></i>
        </div>
      </div>
    `).join('')}
  `;
  
  // Trigger animations
  setTimeout(() => {
    container.querySelectorAll('.animate-fadeInUp').forEach(el => {
      el.style.opacity = '1';
    });
  }, 100);
}

// ============================================
// PROFILE EDITING
// ============================================

function editProfile() {
  console.log('NEW editProfile function called - modal version');
  
  // Create and show profile edit modal
  const modal = document.createElement('div');
  modal.className = 'modal-overlay active';
  modal.id = 'profileEditModal';
  
  const currentUser = window.state?.user || {};
  
  modal.innerHTML = `
    <div class="modal-content max-w-md">
      <div class="p-6 md:p-8">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold" style="color: var(--text-primary)">Edit Profile</h2>
          <button onclick="closeProfileEditModal()" class="text-gray-400 hover:text-gray-600 text-2xl">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <form onsubmit="saveProfileChanges(event)">
          <div class="mb-5">
            <label class="block text-sm font-semibold mb-2" style="color: var(--text-secondary)">
              <i class="fas fa-user mr-2 text-zambia-orange"></i>Full Name
            </label>
            <input type="text" id="editProfileName" required class="input-field" value="${currentUser.name || ''}" placeholder="Your Name">
          </div>
          
          <div class="mb-5">
            <label class="block text-sm font-semibold mb-2" style="color: var(--text-secondary)">
              <i class="fas fa-envelope mr-2 text-zambia-orange"></i>Email
            </label>
            <input type="email" id="editProfileEmail" required class="input-field" value="${currentUser.email || ''}" placeholder="your@email.com">
          </div>
          
          <div class="mb-6">
            <label class="block text-sm font-semibold mb-2" style="color: var(--text-secondary)">
              <i class="fas fa-map-marker-alt mr-2 text-zambia-orange"></i>Location (Optional)
            </label>
            <input type="text" id="editProfileLocation" class="input-field" value="${currentUser.location || ''}" placeholder="City, Country">
          </div>
          
          <div class="mb-6">
            <label class="block text-sm font-semibold mb-2" style="color: var(--text-secondary)">
              <i class="fas fa-info-circle mr-2 text-zambia-orange"></i>Bio (Optional)
            </label>
            <textarea id="editProfileBio" class="input-field" rows="3" placeholder="Tell us about yourself...">${currentUser.bio || ''}</textarea>
          </div>
          
          <div class="flex gap-3">
            <button type="button" onclick="closeProfileEditModal()" class="flex-1 px-6 py-3 border border-gray-300 rounded-xl font-semibold transition-all hover:bg-gray-50" style="color: var(--text-secondary)">
              Cancel
            </button>
            <button type="submit" class="flex-1 btn-primary">
              <i class="fas fa-save mr-2"></i>Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Focus on name field
  setTimeout(() => {
    document.getElementById('editProfileName').focus();
  }, 100);
}

function closeProfileEditModal() {
  const modal = document.getElementById('profileEditModal');
  if (modal) {
    modal.remove();
  }
}

function saveProfileChanges(event) {
  event.preventDefault();
  
  const name = document.getElementById('editProfileName').value.trim();
  const email = document.getElementById('editProfileEmail').value.trim();
  const location = document.getElementById('editProfileLocation').value.trim();
  const bio = document.getElementById('editProfileBio').value.trim();
  
  if (!name || !email) {
    if (window.showToast) {
      window.showToast('Name and email are required!', 'error');
    } else {
      alert('Name and email are required!');
    }
    return;
  }
  
  // Update user data in state
  if (!window.state) window.state = {};
  if (!window.state.user) window.state.user = {};
  
  const oldName = window.state.user.name;
  
  window.state.user.name = name;
  window.state.user.email = email;
  window.state.user.location = location;
  window.state.user.bio = bio;

  if (typeof window.checkProfileSecret === 'function') {
    window.checkProfileSecret(bio);
  }
  
  // Save to localStorage using the new system
  if (window.saveUserData) {
    window.saveUserData();
  } else if (window.saveSession) {
    window.saveSession();
  }
  
  // Update UI elements
  const profileName = document.getElementById('profileName');
  const profileEmail = document.getElementById('profileEmail');
  const profileInitial = document.getElementById('profileInitial');
  const userWelcome = document.getElementById('userWelcome');
  const userInitial = document.getElementById('userInitial');
  
  if (profileName) profileName.textContent = name;
  if (profileEmail) profileEmail.textContent = email;
  if (profileInitial) profileInitial.textContent = name.charAt(0).toUpperCase();
  if (userWelcome) userWelcome.textContent = name;
  if (userInitial) userInitial.textContent = name.charAt(0).toUpperCase();
  
  // Close modal
  closeProfileEditModal();
  
  // Show success message
  if (window.showAchievementToast) {
    window.showAchievementToast('Profile Updated!', 'Your profile has been successfully updated');
  } else if (window.showToast) {
    window.showToast('Profile updated successfully!', 'success');
  }
  
  // Award XP for first profile update
  if (oldName !== name && !localStorage.getItem('profileUpdated')) {
    localStorage.setItem('profileUpdated', 'true');
    if (window.addScore) {
      window.addScore(15);
    }
    if (window.showAchievementToast) {
      setTimeout(() => {
        window.showAchievementToast('Bonus XP!', '+15 XP for updating your profile');
      }, 1000);
    }
  }
}

// ============================================
// ANIMATED COUNTER
// ============================================

function animateCounter(element, target, duration = 1000) {
  if (!element) return;
  
  const start = parseInt(element.textContent) || 0;
  const increment = (target - start) / (duration / 16);
  let current = start;
  
  const timer = setInterval(() => {
    current += increment;
    if ((increment > 0 && current >= target) || (increment < 0 && current <= target)) {
      element.textContent = target;
      clearInterval(timer);
    } else {
      element.textContent = Math.floor(current);
    }
  }, 16);
}

// ============================================
// PROFILE IMAGE UPLOAD
// ============================================

function triggerImageUpload() {
  const input = document.getElementById('profileImageInput');
  if (input) {
    input.click();
  }
}

function handleProfileImageUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  // Validate file type
  if (!file.type.startsWith('image/')) {
    if (window.showToast) {
      window.showToast('Please select an image file', 'error');
    } else {
      alert('Please select an image file');
    }
    return;
  }
  
  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    if (window.showToast) {
      window.showToast('Image size must be less than 5MB', 'error');
    } else {
      alert('Image size must be less than 5MB');
    }
    return;
  }
  
  // Read and display the image
  const reader = new FileReader();
  reader.onload = function(e) {
    const imageUrl = e.target.result;
    
    // Update profile image
    const profileImage = document.getElementById('profileImage');
    const profileInitial = document.getElementById('profileInitial');
    
    if (profileImage && profileInitial) {
      profileImage.src = imageUrl;
      profileImage.classList.remove('hidden');
      profileInitial.classList.add('hidden');
    }
    
    // Save to localStorage
    localStorage.setItem('profileImage', imageUrl);
    
    // Update user avatar in navbar
    const userInitial = document.getElementById('userInitial');
    if (userInitial && userInitial.parentElement) {
      userInitial.parentElement.style.backgroundImage = `url(${imageUrl})`;
      userInitial.parentElement.style.backgroundSize = 'cover';
      userInitial.parentElement.style.backgroundPosition = 'center';
      userInitial.textContent = '';
    }
    
    // Show success message
    if (window.showAchievementToast) {
      window.showAchievementToast('Profile Updated!', 'Your profile picture has been changed');
    } else if (window.showToast) {
      window.showToast('Profile picture updated successfully!', 'success');
    }
    
    // Award XP for first profile picture
    if (!localStorage.getItem('profileImageUploaded')) {
      localStorage.setItem('profileImageUploaded', 'true');
      if (window.addScore) {
        window.addScore(10);
      }
      if (window.showAchievementToast) {
        window.showAchievementToast('Bonus XP!', '+10 XP for adding a profile picture');
      }
    }
  };
  
  reader.readAsDataURL(file);
}

function loadProfileImage() {
  const savedImage = localStorage.getItem('profileImage');
  if (savedImage) {
    const profileImage = document.getElementById('profileImage');
    const profileInitial = document.getElementById('profileInitial');
    
    if (profileImage && profileInitial) {
      profileImage.src = savedImage;
      profileImage.classList.remove('hidden');
      profileInitial.classList.add('hidden');
    }
    
    // Update navbar avatar
    const userInitial = document.getElementById('userInitial');
    if (userInitial && userInitial.parentElement) {
      userInitial.parentElement.style.backgroundImage = `url(${savedImage})`;
      userInitial.parentElement.style.backgroundSize = 'cover';
      userInitial.parentElement.style.backgroundPosition = 'center';
      userInitial.textContent = '';
    }
  }
}

// Export to window
window.loadProfileData = loadProfileData;
window.loadProfileFavorites = loadProfileFavorites;
window.loadProfileAchievements = loadProfileAchievements;
window.loadRecentActivity = loadRecentActivity;
window.editProfile = editProfile;
window.closeProfileEditModal = closeProfileEditModal;
window.saveProfileChanges = saveProfileChanges;
window.animateCounter = animateCounter;
window.triggerImageUpload = triggerImageUpload;
window.handleProfileImageUpload = handleProfileImageUpload;
window.loadProfileImage = loadProfileImage;