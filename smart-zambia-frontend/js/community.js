/**
 * Community & Civic Module
 * Handles Safety Reports, Travel Buddies, and Social Feed
 */

const civicChallenges = [
    { id: 'flooded_area', name: 'Flooded Tourist Area', desc: 'Report flooded areas affecting tourists', icon: 'fa-water', xp: 40, cash: 5, color: 'bg-blue-500' },
    { id: 'blocked_trail', name: 'Blocked Trail', desc: 'Report blocked hiking/walking trails', icon: 'fa-hiking', xp: 35, cash: 4, color: 'bg-green-500' },
    { id: 'unsafe_viewpoint', name: 'Unsafe Viewpoint', desc: 'Report dangerous viewing areas', icon: 'fa-exclamation-triangle', xp: 45, cash: 6, color: 'bg-red-500' },
    { id: 'damaged_facilities', name: 'Damaged Facilities', desc: 'Report broken tourist facilities', icon: 'fa-tools', xp: 30, cash: 3, color: 'bg-yellow-500' },
    { id: 'wildlife_concern', name: 'Wildlife Safety', desc: 'Report wildlife-related issues', icon: 'fa-paw', xp: 50, cash: 7, color: 'bg-purple-500' },
    { id: 'tourist_safety', name: 'Tourist Safety', desc: 'General tourist safety concerns', icon: 'fa-shield-alt', xp: 55, cash: 8, color: 'bg-indigo-500' }
];

let currentReportChallenge = null;

function renderCivicChallenges() {
    const container = document.getElementById('civicChallenges');
    if (!container) return;
    
    container.innerHTML = civicChallenges.map(challenge => `
        <div class="rounded-2xl p-6 text-white cursor-pointer transition-all hover:scale-105 hover:shadow-xl ${challenge.color}" onclick="startCivicChallenge('${challenge.id}')">
          <div class="flex items-center gap-4 mb-4">
            <div class="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <i class="fas ${challenge.icon} text-2xl"></i>
            </div>
            <div>
              <h3 class="font-bold">${challenge.name}</h3>
              <p class="text-sm opacity-90">${challenge.desc}</p>
            </div>
          </div>
          <div class="flex justify-between text-sm font-semibold">
            <span>+${challenge.xp} XP</span>
            <span>+K${challenge.cash}</span>
          </div>
        </div>
    `).join('');
    renderRecentReports();
}

function startCivicChallenge(challengeId) {
    const challenge = civicChallenges.find(c => c.id === challengeId);
    if (!challenge) return;
    currentReportChallenge = challenge;
    document.getElementById('reportIcon').className = `w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl ${challenge.color}`;
    document.getElementById('reportIcon').innerHTML = `<i class="fas ${challenge.icon}"></i>`;
    document.getElementById('reportTitle').textContent = challenge.name;
    document.getElementById('reportDesc').textContent = challenge.desc;
    document.getElementById('reportModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeReportModal() {
    document.getElementById('reportModal').classList.remove('active');
    document.body.style.overflow = '';
}

function submitReport(e) {
    if (e) e.preventDefault();
    if (!currentReportChallenge) return;
    const title = document.getElementById('reportTitleInput').value;
    const desc = document.getElementById('reportDescInput').value;
    
    const report = {
        id: Date.now(),
        type: currentReportChallenge.id,
        title,
        description: desc,
        xp: currentReportChallenge.xp,
        cash: currentReportChallenge.cash,
        timestamp: new Date().toISOString()
    };

    state.civicReports.push(report);
    state.civicXP += currentReportChallenge.xp;
    if (window.addScore) addScore(currentReportChallenge.xp);
    
    const newLevel = Math.floor(state.civicXP / 100) + 1;
    if (newLevel > state.civicLevel) {
        state.civicLevel = newLevel;
        if (window.showAchievementToast) showAchievementToast('Level Up!', `Safety Level ${state.civicLevel}!`);
    }
    
    if (state.civicReports.length === 1 && window.unlockAchievement) unlockAchievement('civic_hero');
    if (typeof saveUserData === 'function') saveUserData();
    
    closeReportModal();
    renderRecentReports();
    if (window.showAchievementToast) showAchievementToast('Report Submitted!', `+${currentReportChallenge.xp} XP, +K${currentReportChallenge.cash}`);
}

function renderRecentReports() {
    const container = document.getElementById('recentReports');
    if (!container) return;
    if (state.civicReports.length === 0) {
        container.innerHTML = '<p class="text-center py-4" style="color: var(--text-secondary)">No reports yet.</p>';
        return;
    }
    container.innerHTML = state.civicReports.slice(-5).reverse().map(report => {
        const challenge = civicChallenges.find(c => c.id === report.type);
        return `
          <div class="flex items-center gap-3 p-3 rounded-xl transition-all" style="background: var(--bg-primary)">
            <div class="w-10 h-10 rounded-full flex items-center justify-center ${challenge?.color || 'bg-gray-500'}">
              <i class="fas ${challenge?.icon || 'fa-info'} text-white"></i>
            </div>
            <div class="flex-1">
              <h4 class="font-semibold text-sm">${challenge?.name || 'Report'}</h4>
              <p class="text-xs" style="color: var(--text-secondary)">${new Date(report.timestamp).toLocaleDateString()}</p>
            </div>
            <div class="text-right text-xs font-bold text-green-600">+${report.xp} XP</div>
          </div>`;
    }).join('');
}

function findTravelBuddies() {
    const mockTravelers = [
        { name: 'Sarah M.', interests: ['Wildlife', 'Nature'], match: 85, avatar: 'S' },
        { name: 'John K.', interests: ['Adventure', 'Nature'], match: 78, avatar: 'J' }
    ];
    const container = document.getElementById('activeTravelers');
    if (!container) return;
    container.innerHTML = mockTravelers.map(traveler => `
        <div class="p-3 rounded-xl transition-all hover:scale-105" style="background: var(--bg-primary); border: 1px solid var(--border-color);">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">${traveler.avatar}</div>
            <div class="flex-1">
              <h4 class="font-bold text-sm">${traveler.name}</h4>
              <p class="text-xs" style="color: var(--text-secondary)">${traveler.match}% match</p>
            </div>
          </div>
          <button onclick="connectBuddy('${traveler.name}')" class="w-full py-2 rounded-lg text-xs font-bold text-white" style="background: linear-gradient(135deg, #8B5CF6, #EC4899);">Connect</button>
        </div>`).join('');
}

function connectBuddy(name) {
    if (window.showAchievementToast) showAchievementToast('Connection Sent!', `Request sent to ${name}`);
    if (window.addScore) addScore(10);
}

function handleMediaUpload(event) {
    const files = Array.from(event.target.files);
    files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
            state.pendingMedia.push({ id: Date.now() + Math.random(), url: e.target.result, type: file.type.startsWith('video/') ? 'video' : 'image' });
            renderPendingMedia();
        };
        reader.readAsDataURL(file);
    });
}

function renderPendingMedia() {
    const preview = document.getElementById('mediaPreview');
    const publishBtn = document.getElementById('publishBtn');
    if (!preview) return;
    preview.innerHTML = state.pendingMedia.map(m => `
        <div class="relative rounded-xl overflow-hidden">
          <img src="${m.url}" class="w-full h-48 object-cover">
          <button onclick="removePendingMedia(${m.id})" class="absolute top-2 left-2 w-8 h-8 bg-red-500 text-white rounded-full">×</button>
        </div>`).join('');
    if (publishBtn) publishBtn.classList.toggle('hidden', state.pendingMedia.length === 0);
}

function removePendingMedia(id) {
    state.pendingMedia = state.pendingMedia.filter(m => m.id !== id);
    renderPendingMedia();
}

function publishPost() {
    const caption = document.getElementById('mediaCaption').value;
    const post = { id: Date.now(), caption: caption || 'Exploring Zambia!', media: [...state.pendingMedia], timestamp: new Date().toISOString(), likes: 0 };
    state.posts.unshift(post);
    state.pendingMedia = [];
    document.getElementById('mediaCaption').value = '';
    renderPendingMedia();
    renderTravelStories();
    if (window.addScore) addScore(20);
}

function renderTravelStories() {
    const container = document.getElementById('travelStories');
    if (!container) return;
    container.innerHTML = state.posts.map(post => `
        <div class="rounded-xl overflow-hidden bg-white border mb-4">
          <div class="p-4 flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold">${state.user?.name?.charAt(0) || 'U'}</div>
            <div><p class="font-bold text-sm">${state.user?.name || 'User'}</p></div>
          </div>
          <img src="${post.media[0]?.url}" class="w-full h-64 object-cover">
          <div class="p-4">
            <p class="text-sm mb-3">${post.caption}</p>
            <button onclick="likeStory(${post.id})" class="text-xs text-gray-500"><i class="fas fa-heart"></i> ${post.likes} Likes</button>
          </div>
        </div>`).join('');
}

function likeStory(id) {
    const post = state.posts.find(p => p.id === id);
    if (post) { post.likes++; renderTravelStories(); }
}

// Expose globally
window.civicChallenges = civicChallenges;
window.renderCivicChallenges = renderCivicChallenges;
window.startCivicChallenge = startCivicChallenge;
window.closeReportModal = closeReportModal;
window.submitReport = submitReport;
window.findTravelBuddies = findTravelBuddies;
window.connectBuddy = connectBuddy;
window.handleMediaUpload = handleMediaUpload;
window.removePendingMedia = removePendingMedia;
window.publishPost = publishPost;
window.renderTravelStories = renderTravelStories;
window.likeStory = likeStory;