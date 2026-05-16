/**
 * js/trip-planner.js
 * Logic for Itinerary generation, Cost calculator, and Cultural Events
 */

window.selectedDuration = 3;

function selectDuration(days) {
    window.selectedDuration = days;
    const durationInput = document.getElementById('tripDuration');
    if (durationInput) durationInput.value = days;
    
    document.querySelectorAll('.duration-btn').forEach(btn => {
        if (parseInt(btn.dataset.days) === days) {
            btn.style.borderColor = '#E85D04';
            btn.style.background = 'rgba(232,93,4,0.1)';
            btn.style.color = '#E85D04';
        } else {
            btn.style.borderColor = 'var(--border-color)';
            btn.style.background = 'transparent';
            btn.style.color = 'var(--text-primary)';
        }
    });
}

function generateItinerary() {
    const duration = window.selectedDuration || 3;
    const budget = parseFloat(document.getElementById('tripBudget')?.value) || 1500;

    if (!budget || budget < 100) {
        alert('Please enter a valid budget (minimum $100)');
        return;
    }

    const itinerary = optimizeRoute(duration, budget);
    const totalCost = itinerary.reduce((sum, day) => sum + day.cost, 0);

    const container = document.getElementById('generatedItinerary');
    if (container) {
        container.innerHTML = `
            <div class="rounded-2xl p-6 mt-6" style="background: var(--bg-primary); border: 1px solid var(--border-color);">
              <h3 class="font-bold mb-4" style="color: var(--text-primary)">Your Optimized ${duration}-Day Itinerary</h3>
              ${itinerary.map((day, i) => `
                <div class="mb-4 p-4 rounded-xl" style="background: var(--bg-card); border: 1px solid var(--border-color);">
                  <h4 class="font-semibold mb-2" style="color: var(--text-primary)">Day ${i + 1}: ${day.destination}</h4>
                  <p class="text-sm mb-2" style="color: var(--text-secondary)">${day.activities.join(' • ')}</p>
                  <div class="flex justify-between items-center">
                    <span class="text-xs font-semibold" style="color: var(--text-secondary)">Daily budget</span>
                    <span class="text-sm font-bold text-green-600">${day.cost} USD / K${Math.round(day.cost * 19)} ZMW</span>
                  </div>
                </div>
              `).join('')}
              <div class="mt-4 p-4 rounded-xl" style="background: linear-gradient(135deg, #16A34A, #15803D);">
                <div class="flex justify-between items-center text-white">
                  <span class="font-bold">Total Estimated Cost:</span>
                  <div class="text-right">
                    <div class="text-xl font-bold">${totalCost} USD</div>
                    <div class="text-sm opacity-90">K${Math.round(totalCost * 19)} ZMW</div>
                  </div>
                </div>
              </div>
            </div>
        `;
    }

    updateCostBreakdown();
    if (window.showAchievementToast) window.showAchievementToast('Itinerary Generated!', `${duration}-day trip planned`);
    if (window.addScore) window.addScore(30);

    // Hook into Daily Challenges system
    if (window.DailyChallenges && typeof window.DailyChallenges.trackAction === 'function') {
        window.DailyChallenges.trackAction('create_itinerary', { duration, budget });
        window.DailyChallenges.trackAction('use_planner', { days: duration });
    }
}

function optimizeRoute(duration, budget) {
    const dailyBudget = Math.round(budget / duration);
    const topDestinations = (window.destinations || []).filter(d => d.featured).slice(0, Math.min(duration, 7));
    const selectedDestinations = [];
    for (let i = 0; i < duration; i++) {
        selectedDestinations.push(topDestinations[i % topDestinations.length] || { name: 'Safari Explorer Spot', category: 'Wildlife' });
    }

    return selectedDestinations.map((dest, i) => ({
        destination: dest.name,
        activities: ['Morning exploration', dest.category === 'Wildlife' ? 'Game drive' : 'Sightseeing', 'Local cuisine', 'Evening relaxation'],
        cost: Math.round(dailyBudget * (0.8 + Math.random() * 0.4))
    }));
}

function updateCostCalculator(category, amount) {
    const inputEl = document.getElementById(`input${category.charAt(0).toUpperCase() + category.slice(1)}`);
    if (inputEl) {
        inputEl.value = (parseFloat(inputEl.value) || 0) + amount;
    }
    updateManualCosts();
}

function updateManualCosts() {
    const acc = parseFloat(document.getElementById('inputAccommodation')?.value) || 0;
    const trans = parseFloat(document.getElementById('inputTransport')?.value) || 0;
    const act = parseFloat(document.getElementById('inputActivities')?.value) || 0;
    const food = parseFloat(document.getElementById('inputFood')?.value) || 0;
    const total = acc + trans + act + food;

    // Check for Local Explorer status (assuming a toggle or state exists)
    const isLocal = window.state?.isLocalExplorer || false;
    const zmwRate = 19;
    let totalZMW = total * zmwRate;

    // Apply Local Explorer Bonus: 50% discount on activities and accommodation
    if (isLocal) {
        const localTotal = (acc * 0.5) + trans + (act * 0.5) + food;
        totalZMW = localTotal * zmwRate;
        
        // Visual cue for the bonus
        const zmwEl = document.getElementById('totalZMW');
        if (zmwEl) zmwEl.classList.add('text-green-600', 'animate-pulse');
    }

    const totalUSDEl = document.getElementById('totalUSD');
    const totalZMWEl = document.getElementById('totalZMW');

    if (totalUSDEl) totalUSDEl.textContent = `$${total.toFixed(0)}`;
    if (totalZMWEl) totalZMWEl.textContent = `K${Math.round(totalZMW)}`;

    // Hook into Daily Challenges for budgeting tasks
    if (window.DailyChallenges && typeof window.DailyChallenges.trackAction === 'function' && total > 0) {
        window.DailyChallenges.trackAction('calculate_costs', { total });
    }
}

function updateCostBreakdown() {
    const budget = parseFloat(document.getElementById('tripBudget')?.value) || 1500;
    const acc = document.getElementById('inputAccommodation');
    const trans = document.getElementById('inputTransport');
    const act = document.getElementById('inputActivities');
    const food = document.getElementById('inputFood');

    if (acc) acc.value = Math.round(budget * 0.4);
    if (trans) trans.value = Math.round(budget * 0.25);
    if (act) act.value = Math.round(budget * 0.25);
    if (food) food.value = Math.round(budget * 0.1);
    updateManualCosts();
}

function resetCostCalculator() {
    ['Accommodation', 'Transport', 'Activities', 'Food'].forEach(id => {
        const el = document.getElementById(`input${id}`);
        if (el) el.value = 0;
    });
    updateManualCosts();
}

function initCulturalEvents() {
    window.enhancedState.culturalEvents = [
        { name: 'Kuomboka Ceremony', date: '2024-04-15', location: 'Western Province', type: 'Traditional' },
        { name: 'Nc\'wala Ceremony', date: '2024-02-24', location: 'Eastern Province', type: 'Traditional' },
        { name: 'Zambia International Trade Fair', date: '2024-07-01', location: 'Ndola', type: 'Commercial' },
        { name: 'Livingstone Cultural Festival', date: '2024-08-15', location: 'Livingstone', type: 'Cultural' }
    ];
    renderCulturalEvents();
}

function renderCulturalEvents() {
    const container = document.getElementById('culturalEvents');
    if (!container) return;
    container.innerHTML = window.enhancedState.culturalEvents.map(event => `
        <div class="p-4 rounded-xl border" style="border-color: var(--border-color);">
          <h3 class="font-bold" style="color: var(--text-primary)">${event.name}</h3>
          <p class="text-sm" style="color: var(--text-secondary)">📅 ${new Date(event.date).toLocaleDateString()}</p>
          <p class="text-sm" style="color: var(--text-secondary)">📍 ${event.location}</p>
          <span class="inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold" style="background: rgba(232,93,4,0.1); color: #E85D04;">${event.type}</span>
        </div>`).join('');
}

window.selectDuration = selectDuration;
window.generateItinerary = generateItinerary;
window.updateCostCalculator = updateCostCalculator;
window.updateManualCosts = updateManualCosts;
window.updateCostBreakdown = updateCostBreakdown;
window.resetCostCalculator = resetCostCalculator;
window.initCulturalEvents = initCulturalEvents;