/**
 * js/daily-challenges.js
 * Core logic for assigning, tracking, and completing daily challenges.
 */

window.DailyChallenges = {
    state: {
        activeChallenge: null,
        progress: 0,
        lastAssigned: null,
        completedToday: false
    },

    // Sample pool matching requirements (Exploration, Social, Learning, Civic, Creative)
    pool: [
        { id: 'create_itinerary', category: 'Creative', name: 'Master Planner', goal: 1, desc: 'Generate a new trip itinerary', xp: 100 },
        { id: 'calculate_costs', category: 'Learning', name: 'Budget Conscious', goal: 3, desc: 'Calculate trip costs 3 times', xp: 50 },
        { id: 'use_planner', category: 'Exploration', name: 'Future Traveler', goal: 1, desc: 'Use the trip planner tool', xp: 30 }
    ],

    init() {
        const saved = localStorage.getItem('smartZambia_dailyChallenges');
        if (saved) {
            this.state = JSON.parse(saved);
        }
        this.checkDailyReset();
        this.updateUI();
    },

    checkDailyReset() {
        const today = new Date().toDateString();
        if (this.state.lastAssigned !== today) {
            // Pick a random challenge from the pool
            const randomIndex = Math.floor(Math.random() * this.pool.length);
            this.state.activeChallenge = this.pool[randomIndex];
            this.state.progress = 0;
            this.state.completedToday = false;
            this.state.lastAssigned = today;
            this.save();
            if (window.showAchievementToast) {
                window.showAchievementToast('New Daily Challenge!', this.state.activeChallenge.desc);
            }
        }
    },

    trackAction(actionType, data = {}) {
        if (this.state.completedToday || !this.state.activeChallenge) return;

        if (this.state.activeChallenge.id === actionType) {
            this.state.progress++;
            console.log(`Challenge Progress: ${this.state.progress}/${this.state.activeChallenge.goal}`);
            
            if (this.state.progress >= this.state.activeChallenge.goal) {
                this.completeChallenge();
            } else {
                this.save();
                this.updateUI();
            }
        }
    },

    completeChallenge() {
        this.state.completedToday = true;
        const reward = this.state.activeChallenge.xp;
        
        if (window.addScore) window.addScore(reward);
        if (window.showAchievementToast) {
            window.showAchievementToast('Challenge Complete!', `+${reward} XP Earned`);
        }
        
        this.save();
        this.updateUI();
    },

    save() {
        localStorage.setItem('smartZambia_dailyChallenges', JSON.stringify(this.state));
    },

    updateUI() {
        const container = document.getElementById('activeChallengeCard');
        if (!container || !this.state.activeChallenge) return;

        const challenge = this.state.activeChallenge;
        const percent = Math.min(100, (this.state.progress / challenge.goal) * 100);

        container.innerHTML = `
            <div class="p-4 rounded-xl border-2 ${this.state.completedToday ? 'border-green-500 bg-green-50' : 'border-purple-500 bg-purple-50'}">
                <div class="flex justify-between items-center mb-2">
                    <span class="text-xs font-bold uppercase tracking-wider text-purple-600">${challenge.category}</span>
                    <span class="text-xs font-bold text-gray-500">${this.state.completedToday ? '✅' : `${this.state.progress}/${challenge.goal}`}</span>
                </div>
                <h4 class="font-bold text-gray-900">${challenge.name}</h4>
                <p class="text-sm text-gray-600 mb-3">${challenge.desc}</p>
                <div class="w-full bg-gray-200 rounded-full h-2">
                    <div class="bg-purple-600 h-2 rounded-full transition-all duration-500" style="width: ${percent}%"></div>
                </div>
            </div>
        `;
    }
};

// Auto-init
document.addEventListener('DOMContentLoaded', () => window.DailyChallenges.init());