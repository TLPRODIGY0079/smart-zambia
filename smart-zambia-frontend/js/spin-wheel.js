/**
 * js/spin-wheel.js
 * Logic for the Daily Spin Wheel gamification component
 */

window.SpinWheel = {
    rewards: [
        { type: 'cash', value: 5, label: 'K5' },
        { type: 'xp', value: 50, label: '50 XP' },
        { type: 'cash', value: 10, label: 'K10' },
        { type: 'xp', value: 100, label: '100 XP' },
        { type: 'cash', value: 20, label: 'K20' },
        { type: 'activity', value: 1, label: 'Free Activity' },
        { type: 'cash', value: 50, label: 'K50' },
        { type: 'cash', value: 100, label: 'K100' }
    ],
    isSpinning: false,

    init() {
        this.updateCooldown();
        // Periodically update timer if cooldown is active
        setInterval(() => this.updateCooldown(), 60000);
    },

    updateCooldown() {
        const lastSpin = localStorage.getItem('smartZambia_lastSpin');
        const btn = document.getElementById('spinBtn');
        const timer = document.getElementById('spinTimer');
        
        if (!btn || !timer) return;

        if (lastSpin) {
            const now = Date.now();
            const cooldown = 24 * 60 * 60 * 1000;
            const remaining = cooldown - (now - parseInt(lastSpin));
            
            if (remaining > 0) {
                btn.disabled = true;
                btn.classList.add('opacity-50', 'cursor-not-allowed');
                const hours = Math.floor(remaining / 3600000);
                const minutes = Math.floor((remaining % 3600000) / 60000);
                timer.textContent = `Next spin in: ${hours}h ${minutes}m`;
                return;
            }
        }
        btn.disabled = false;
        btn.classList.remove('opacity-50', 'cursor-not-allowed');
        timer.textContent = 'Spin now for a prize!';
    },

    spin() {
        if (this.isSpinning) return;
        
        const lastSpin = localStorage.getItem('smartZambia_lastSpin');
        if (lastSpin && (Date.now() - parseInt(lastSpin) < 24 * 60 * 60 * 1000)) {
            if (window.showAchievementToast) {
                window.showAchievementToast('Cooldown Active', 'You can only spin once every 24 hours.');
            }
            return;
        }

        this.isSpinning = true;
        const wheel = document.getElementById('wheelGraphic');
        
        // Calculate random spin: several full rotations plus a random segment
        const spinCount = 5 + Math.floor(Math.random() * 5); 
        const randomDegree = Math.floor(Math.random() * 360);
        const totalDegree = (spinCount * 360) + randomDegree;
        
        wheel.style.transition = 'transform 4s cubic-bezier(0.15, 0, 0.15, 1)';
        wheel.style.transform = `rotate(${totalDegree}deg)`;

        setTimeout(() => {
            this.isSpinning = false;
            
            // Identify winning segment (Pointer is at top/0deg relative to view)
            const normalizedDegree = totalDegree % 360;
            const segmentSize = 360 / this.rewards.length;
            const rewardIndex = Math.floor(((360 - normalizedDegree) % 360) / segmentSize);
            const reward = this.rewards[rewardIndex];

            this.grantReward(reward);
            localStorage.setItem('smartZambia_lastSpin', Date.now().toString());
            this.updateCooldown();
            
            if (window.createConfetti) window.createConfetti();
        }, 4000);
    },

    grantReward(reward) {
        if (reward.type === 'xp') {
            if (window.addScore) window.addScore(reward.value);
            if (window.showAchievementToast) window.showAchievementToast('Winner!', `You won ${reward.label}`);
        } else if (reward.type === 'cash') {
            window.state.cashEarned = (window.state.cashEarned || 0) + reward.value;
            
            // Record transaction
            if (!window.state.transactions) window.state.transactions = [];
            window.state.transactions.unshift({
                id: Date.now(),
                type: 'reward',
                amount: reward.value,
                source: 'Spin Wheel',
                label: reward.label,
                timestamp: new Date().toISOString()
            });

            if (window.saveUserData) window.saveUserData();
            if (window.showAchievementToast) window.showAchievementToast('Winner!', `You won ${reward.label}`);
            
            // Update UI displays
            const cashEl = document.getElementById('profileCash');
            if (cashEl) cashEl.textContent = window.state.cashEarned;
            
            // Refresh Transaction History UI
            if (window.renderTransactions) window.renderTransactions();
        } else if (window.showAchievementToast) {
            window.showAchievementToast('Winner!', `You won a ${reward.label}!`);
        }
    }
};