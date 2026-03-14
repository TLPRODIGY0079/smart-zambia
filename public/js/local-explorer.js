// local-explorer.js - Local Explorer Program for Zambians

const LocalExplorer = {
  // Initialize local explorer features
  init() {
    this.checkLocalStatus();
    this.createLocalBadge();
  },
  
  // Check if user is local
  checkLocalStatus() {
    const isLocal = RewardsSystem.isLocal;
    if (isLocal) {
      this.showLocalBenefits();
    }
  },
  
  // Create local badge
  createLocalBadge() {
    if (!RewardsSystem.isLocal) return;
    
    const badge = document.createElement('div');
    badge.className = 'fixed top-24 right-6 z-50';
    badge.innerHTML = `
      <div class="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm font-bold">
        <i class="fas fa-flag"></i>
        <span>Local Explorer</span>
        <span class="bg-white/20 px-2 py-0.5 rounded-full text-xs">2x Rewards</span>
      </div>
    `;
    document.body.appendChild(badge);
  },
  
  // Show local benefits modal
  showLocalBenefits() {
    const benefits = `
      <div class="rounded-3xl p-6 mb-6" style="background: linear-gradient(135deg, #16A34A 0%, #15803D 100%); color: white;">
        <h3 class="text-xl font-bold mb-4"><i class="fas fa-star mr-2"></i>Local Explorer Benefits</h3>
        <ul class="space-y-2 text-sm">
          <li><i class="fas fa-check-circle mr-2"></i>70% discount on entry fees</li>
          <li><i class="fas fa-check-circle mr-2"></i>2x Kwacha rewards on all activities</li>
          <li><i class="fas fa-check-circle mr-2"></i>Exclusive local challenges</li>
          <li><i class="fas fa-check-circle mr-2"></i>Priority in monthly leaderboard</li>
          <li><i class="fas fa-check-circle mr-2"></i>Special "Proud Zambian" badge</li>
        </ul>
      </div>
    `;
    
    const container = document.getElementById('localBenefitsContainer');
    if (container) {
      container.innerHTML = benefits;
    }
  },
  
  // Toggle local status
  toggleLocalStatus() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.innerHTML = `
      <div class="modal-content p-8" style="max-width: 500px;">
        <h2 class="text-2xl font-bold mb-6" style="color: var(--text-primary)">Are you a Zambian?</h2>
        <p class="mb-6" style="color: var(--text-secondary)">Zambians get special benefits including discounted prices and 2x Kwacha rewards!</p>
        
        <div class="space-y-4 mb-6">
          <div class="p-4 rounded-xl border-2 border-green-500 bg-green-50">
            <h3 class="font-bold text-green-700 mb-2">Local Explorer Benefits:</h3>
            <ul class="text-sm text-green-600 space-y-1">
              <li>✓ Entry fees in Kwacha (70% off)</li>
              <li>✓ Double Kwacha rewards</li>
              <li>✓ Exclusive local challenges</li>
              <li>✓ Monthly K500 prize pool</li>
            </ul>
          </div>
        </div>
        
        <div class="flex gap-3">
          <button onclick="LocalExplorer.setLocal(false)" class="flex-1 py-3 rounded-xl font-semibold" style="background: var(--bg-primary); color: var(--text-primary); border: 2px solid var(--border-color);">
            I'm a Tourist
          </button>
          <button onclick="LocalExplorer.setLocal(true)" class="flex-1 py-3 rounded-xl font-semibold text-white" style="background: linear-gradient(135deg, #16A34A, #15803D);">
            I'm Zambian 🇿🇲
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  },
  
  // Set local status
  setLocal(isLocal) {
    RewardsSystem.toggleLocal(isLocal);
    document.querySelector('.modal-overlay').remove();
    
    if (isLocal) {
      this.createLocalBadge();
      this.showLocalBenefits();
      if (typeof showAchievementToast === 'function') {
        showAchievementToast('Local Explorer Activated!', '2x Kwacha rewards enabled');
      }
    }
    
    // Refresh pricing
    if (typeof renderDestinations === 'function') renderDestinations();
  },
  
  // Get local challenges
  getLocalChallenges() {
    return [
      { id: 'visit_home_province', name: 'Visit Your Home Province', desc: 'Explore destinations in your province', xp: 100, kwacha: 50 },
      { id: 'local_guide', name: 'Be a Local Guide', desc: 'Help 5 tourists with recommendations', xp: 150, kwacha: 75 },
      { id: 'cultural_ambassador', name: 'Cultural Ambassador', desc: 'Share 10 cultural insights', xp: 200, kwacha: 100 },
      { id: 'zambian_pride', name: 'Zambian Pride', desc: 'Visit 10 different destinations', xp: 300, kwacha: 150 }
    ];
  }
};

// Auto-initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => LocalExplorer.init());
} else {
  LocalExplorer.init();
}
