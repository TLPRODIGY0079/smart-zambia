// spin-wheel.js - Daily Spin Wheel UI Component

const SpinWheel = {
  // Initialize spin wheel
  init() {
    this.createSpinWheelHTML();
    this.updateSpinButton();
  },
  
  // Create HTML structure
  createSpinWheelHTML() {
    const container = document.getElementById('spinWheelContainer');
    if (!container) return;
    
    container.innerHTML = `
      <div class="rounded-3xl p-8 text-white" style="background: linear-gradient(135deg, #F59E0B 0%, #E85D04 100%);">
        <h2 class="text-2xl font-bold mb-4 flex items-center gap-3">
          <i class="fas fa-gift"></i> Daily Spin Wheel
        </h2>
        <p class="mb-6 opacity-90">Spin once per day for Kwacha prizes!</p>
        
        <div class="bg-white/20 backdrop-blur-sm rounded-2xl p-6 mb-6 text-center">
          <div class="text-6xl mb-4">🎰</div>
          <p id="spinResult" class="text-xl font-bold">Ready to spin!</p>
        </div>
        
        <button id="spinButton" onclick="SpinWheel.spin()" class="w-full bg-white text-orange-600 font-bold py-4 rounded-xl hover:bg-orange-50 transition-all">
          <i class="fas fa-sync-alt mr-2"></i>Spin Now!
        </button>
        
        <div class="mt-4 text-sm opacity-75 text-center">
          <p>Prizes: K5, K10, K20, K50, K100, XP & More!</p>
        </div>
      </div>
    `;
  },
  
  // Update button state
  updateSpinButton() {
    const button = document.getElementById('spinButton');
    const result = document.getElementById('spinResult');
    
    if (!button || !result) return;
    
    if (!RewardsSystem.canSpinToday()) {
      button.disabled = true;
      button.classList.add('opacity-50', 'cursor-not-allowed');
      button.innerHTML = '<i class="fas fa-clock mr-2"></i>Come Back Tomorrow';
      result.textContent = 'Already spun today!';
    }
  },
  
  // Spin animation and logic
  async spin() {
    const button = document.getElementById('spinButton');
    const result = document.getElementById('spinResult');
    
    if (!RewardsSystem.canSpinToday()) {
      result.textContent = 'Come back tomorrow!';
      return;
    }
    
    // Disable button
    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Spinning...';
    
    // Animate
    const emojis = ['🎰', '💰', '🎁', '💎', '🏆', '⭐'];
    let count = 0;
    const interval = setInterval(() => {
      result.textContent = emojis[count % emojis.length];
      count++;
    }, 100);
    
    // Wait 2 seconds
    await new Promise(resolve => setTimeout(resolve, 2000));
    clearInterval(interval);
    
    // Get prize
    const prize = RewardsSystem.spinWheel();
    
    if (prize.success) {
      if (prize.type === 'kwacha') {
        result.textContent = `🎉 Won K${prize.amount}!`;
        RewardsSystem.updateWalletDisplay();
      } else if (prize.type === 'xp') {
        result.textContent = `⭐ Won ${prize.amount} XP!`;
        if (typeof addScore === 'function') addScore(prize.amount);
      } else {
        result.textContent = `🎁 ${prize.message}`;
      }
      
      if (typeof showAchievementToast === 'function') {
        showAchievementToast('Daily Spin!', prize.message);
      }
    }
    
    // Update button
    button.innerHTML = '<i class="fas fa-check mr-2"></i>Spun Today!';
    button.classList.add('opacity-50');
  }
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => SpinWheel.init());
} else {
  SpinWheel.init();
}
