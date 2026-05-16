/**
 * Gamification System
 * Handles XP, Levels, Achievements, and Treasure Hunts
 */

const achievementDefs = [
    { id: 'first_visit', name: 'First Steps', desc: 'View your first destination', icon: 'fa-shoe-prints', xp: 10 },
    { id: 'explorer', name: 'Explorer', desc: 'View 5 different destinations', icon: 'fa-compass', xp: 50 },
    { id: 'treasure_hunter', name: 'Treasure Hunter', desc: 'Find your first treasure', icon: 'fa-gem', xp: 100 },
    { id: 'wishlist_pro', name: 'Dream Collector', desc: 'Add 5 places to wishlist', icon: 'fa-heart', xp: 30 },
    { id: 'civic_hero', name: 'Civic Hero', desc: 'Make your first safety report', icon: 'fa-shield-alt', xp: 50 }
];

function addScore(points) {
    state.score += points;
    updateLevel();
    updateUI();
    if (typeof saveSession === 'function') saveSession();
    if (window.saveUserXP) window.saveUserXP(state.score, state.level, state.cashEarned);
}

function updateLevel() {
    const newLevel = Math.floor(state.score / 100) + 1;
    if (newLevel > state.level) {
        state.level = newLevel;
        if (window.showAchievementToast) showAchievementToast('Level Up!', `You reached level ${newLevel}!`);
        if (typeof saveSession === 'function') saveSession();
    }
}

function unlockAchievement(id) {
    if (state.achievements.includes(id)) return;
    const ach = achievementDefs.find(a => a.id === id);
    if (!ach) return;
    state.achievements.push(id);
    addScore(ach.xp);
    if (window.showAchievementToast) showAchievementToast(ach.name, ach.desc);
    renderAchievements();
    if (window.saveUserAchievement) window.saveUserAchievement(ach);
}

function startTreasureHunt() {
    state.treasureHuntActive = true;
    state.currentTreasureIndex = 0;
    state.foundTreasures = [];
    if (!state.treasureHuntStats) state.treasureHuntStats = { totalHunts: 0, completedHunts: 0, treasuresFound: 0, totalRewards: 0 };
    state.treasureHuntStats.totalHunts++;
    updateClue();
    if (window.renderDestinations) renderDestinations();
    if (window.showAchievementToast) showAchievementToast('Treasure Hunt Started!', 'Find hidden treasures!');
    if (typeof saveUserData === 'function') saveUserData();
}

function updateClue() {
    const clueEl = document.getElementById('currentClue');
    const countEl = document.getElementById('treasureCount');
    const barEl = document.getElementById('treasureBar');
    
    if (state.currentTreasureIndex < state.treasureClues.length) {
        if (clueEl) clueEl.textContent = state.treasureClues[state.currentTreasureIndex].clue;
    } else {
        if (clueEl) clueEl.textContent = '🎉 All treasures found!';
        state.treasureHuntActive = false;
        if (state.treasureHuntStats) state.treasureHuntStats.completedHunts++;
    }
    if (countEl) countEl.textContent = `${state.foundTreasures.length}/5 Found`;
    if (barEl) barEl.style.width = `${(state.foundTreasures.length / 5) * 100}%`;
}

function findTreasure() {
    const treasureId = state.treasureClues[state.currentTreasureIndex].destination;
    if (!state.foundTreasures.includes(treasureId)) {
        state.foundTreasures.push(treasureId);
        if (!state.treasureHuntStats) state.treasureHuntStats = { totalHunts: 0, completedHunts: 0, treasuresFound: 0, totalRewards: 0 };
        state.treasureHuntStats.treasuresFound++;
        state.treasureHuntStats.totalRewards += 100;
        addScore(100);
        if (window.showAchievementToast) showAchievementToast('Treasure Found!', '+100 XP');
        if (state.foundTreasures.length === 1) unlockAchievement('treasure_hunter');
        state.currentTreasureIndex++;
        updateClue();
        if (window.renderDestinations) renderDestinations();
        if (typeof saveUserData === 'function') saveUserData();
    }
}

function updateUI() {
    const scoreEl = document.getElementById('adventureScore');
    const levelEl = document.getElementById('adventureLevel');
    const viewedEl = document.getElementById('placesViewedCount');
    const totalXPEl = document.getElementById('totalXPCount');
    const achCountEl = document.getElementById('achievementsCount');

    if (scoreEl) scoreEl.textContent = state.score;
    if (levelEl) levelEl.textContent = state.level;
    if (viewedEl) viewedEl.textContent = state.visitedDestinations.length;
    if (totalXPEl) totalXPEl.textContent = state.score;
    if (achCountEl) achCountEl.textContent = state.achievements.length;
    renderLeaderboard();
}

function renderAchievements() {
    const list = document.getElementById('achievementsList');
    if (!list) return;
    list.innerHTML = achievementDefs.map(ach => {
        const unlocked = state.achievements.includes(ach.id);
        return `
          <div class="flex items-center gap-4 p-4 rounded-xl" style="background: ${unlocked ? 'rgba(22,163,74,0.1)' : 'var(--bg-primary)'}">
            <div class="w-12 h-12 rounded-full flex items-center justify-center" style="background: ${unlocked ? 'linear-gradient(135deg, #16A34A, #15803D)' : 'var(--border-color)'}; color: ${unlocked ? 'white' : 'var(--text-secondary)'}">
              <i class="fas ${ach.icon}"></i>
            </div>
            <div class="flex-1">
              <h4 class="font-bold" style="color: ${unlocked ? '#16A34A' : 'var(--text-primary)'}">${ach.name}</h4>
              <p class="text-sm" style="color: var(--text-secondary)">${ach.desc}</p>
            </div>
            <span class="font-bold" style="color: ${unlocked ? '#16A34A' : 'var(--text-secondary)'}">+${ach.xp} XP</span>
          </div>
        `;
    }).join('');
}

function renderLeaderboard() {
    const leaderboard = document.getElementById('leaderboard');
    if (!leaderboard) return;
    const players = [
        { name: state.user?.name || 'You', score: state.score, isYou: true },
        { name: 'Safari Sam', score: 850 },
        { name: 'WildlifeWatcher', score: 720 },
        { name: 'ZambiaExplorer', score: 680 },
        { name: 'NatureLover', score: 550 }
    ].sort((a, b) => b.score - a.score);

    leaderboard.innerHTML = players.map((p, i) => `
        <div class="flex items-center gap-4 p-3 rounded-xl ${p.isYou ? 'bg-white/20' : 'bg-white/10'}">
          <span class="w-8 h-8 flex items-center justify-center font-bold rounded-full ${i === 0 ? 'bg-yellow-400 text-yellow-900' : ''}">${i + 1}</span>
          <span class="flex-1 font-medium">${p.name}</span>
          <span class="font-bold">${p.score} XP</span>
        </div>
    `).join('');
}

// Expose globally
window.achievementDefs = achievementDefs;
window.addScore = addScore;
window.updateLevel = updateLevel;
window.unlockAchievement = unlockAchievement;
window.startTreasureHunt = startTreasureHunt;
window.updateClue = updateClue;
window.findTreasure = findTreasure;
window.updateUI = updateUI;
window.renderAchievements = renderAchievements;
window.renderLeaderboard = renderLeaderboard;