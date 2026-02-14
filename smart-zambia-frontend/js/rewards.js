// rewards.js - Kwacha Rewards & Wallet System

const RewardsSystem = {
  kwacha: parseInt(localStorage.getItem('kwacha') || '0'),
  isLocal: localStorage.getItem('isLocal') === 'true',
  lastSpin: localStorage.getItem('lastSpin'),
  
  // Kwacha conversion rate
  USD_TO_ZMW: 27,
  XP_TO_ZMW: 0.10,
  
  // Add Kwacha
  addKwacha(amount) {
    const bonus = this.isLocal ? amount * 2 : amount;
    this.kwacha += bonus;
    localStorage.setItem('kwacha', this.kwacha.toString());
    this.updateWalletDisplay();
    return bonus;
  },
  
  // Update wallet display
  updateWalletDisplay() {
    const display = document.getElementById('kwachaBalance');
    if (display) {
      display.textContent = `K${this.kwacha}`;
    }
  },
  
  // Convert USD to ZMW
  usdToZmw(usd) {
    return Math.round(usd * this.USD_TO_ZMW);
  },
  
  // Check if can spin today
  canSpinToday() {
    if (!this.lastSpin) return true;
    const lastSpinDate = new Date(this.lastSpin);
    const today = new Date();
    return lastSpinDate.toDateString() !== today.toDateString();
  },
  
  // Daily spin wheel
  spinWheel() {
    if (!this.canSpinToday()) {
      return { success: false, message: 'Come back tomorrow!' };
    }
    
    const prizes = [
      { type: 'kwacha', amount: 5, weight: 25 },
      { type: 'kwacha', amount: 10, weight: 20 },
      { type: 'kwacha', amount: 20, weight: 15 },
      { type: 'kwacha', amount: 50, weight: 10 },
      { type: 'kwacha', amount: 100, weight: 5 },
      { type: 'xp', amount: 50, weight: 15 },
      { type: 'xp', amount: 100, weight: 8 },
      { type: 'bonus', amount: 0, weight: 2, label: 'Free Activity!' }
    ];
    
    // Weighted random selection
    const totalWeight = prizes.reduce((sum, p) => sum + p.weight, 0);
    let random = Math.random() * totalWeight;
    let prize = prizes[0];
    
    for (const p of prizes) {
      random -= p.weight;
      if (random <= 0) {
        prize = p;
        break;
      }
    }
    
    // Award prize
    if (prize.type === 'kwacha') {
      const bonus = this.addKwacha(prize.amount);
      this.lastSpin = new Date().toISOString();
      localStorage.setItem('lastSpin', this.lastSpin);
      return { success: true, type: 'kwacha', amount: bonus, message: `You won K${bonus}!` };
    } else if (prize.type === 'xp') {
      this.lastSpin = new Date().toISOString();
      localStorage.setItem('lastSpin', this.lastSpin);
      return { success: true, type: 'xp', amount: prize.amount, message: `You won ${prize.amount} XP!` };
    } else {
      this.lastSpin = new Date().toISOString();
      localStorage.setItem('lastSpin', this.lastSpin);
      return { success: true, type: 'bonus', amount: 0, message: prize.label };
    }
  },
  
  // Toggle local explorer status
  toggleLocal(isLocal) {
    this.isLocal = isLocal;
    localStorage.setItem('isLocal', isLocal.toString());
  },
  
  // Get local pricing
  getLocalPrice(foreignPrice) {
    return this.isLocal ? Math.round(foreignPrice * 0.3 * this.USD_TO_ZMW) : this.usdToZmw(foreignPrice);
  }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = RewardsSystem;
}
