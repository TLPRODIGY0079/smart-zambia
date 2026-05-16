/**
 * js/bookings.js
 * Consolidated logic for Tour Guides, Transport, and Activities
 */

// Guide Data
const tourGuides = [
    { name: 'John Mwale', rating: 4.9, tours: 150, price: 50, specialty: 'Wildlife Safari', languages: ['English', 'Bemba'], img: 'https://i.pravatar.cc/150?img=12' },
    { name: 'Sarah Banda', rating: 4.8, tours: 120, price: 45, specialty: 'Cultural Tours', languages: ['English', 'Nyanja'], img: 'https://i.pravatar.cc/150?img=47' },
    { name: 'David Phiri', rating: 4.7, tours: 95, price: 40, specialty: 'Adventure Tours', languages: ['English', 'Tonga'], img: 'https://i.pravatar.cc/150?img=33' }
];

// Activity Data
const activityList = [
    { name: 'Bungee Jumping', location: 'Victoria Falls', price: 160, duration: '2 hours', difficulty: 'High', img: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=300' },
    { name: 'White Water Rafting', location: 'Zambezi River', price: 120, duration: '4 hours', difficulty: 'High', img: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=300' },
    { name: 'Walking Safari', location: 'South Luangwa', price: 80, duration: '3 hours', difficulty: 'Medium', img: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=300' },
    { name: 'Canoe Safari', location: 'Lower Zambezi', price: 95, duration: '5 hours', difficulty: 'Medium', img: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=300' },
    { name: 'Helicopter Tour', location: 'Victoria Falls', price: 250, duration: '30 min', difficulty: 'Low', img: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=300' },
    { name: 'Night Game Drive', location: 'Kafue NP', price: 70, duration: '3 hours', difficulty: 'Low', img: 'https://images.unsplash.com/photo-1549366021-9f761d450615?w=300' }
];

function loadTourGuides() {
    const container = document.getElementById('tourGuides');
    if (!container) return;
    
    container.innerHTML = tourGuides.map(g => `
        <div class="flex items-center gap-4 p-4 rounded-xl border cursor-pointer hover:bg-gray-50 transition-all" style="border-color: var(--border-color)" onclick="bookGuide('${g.name}')">
          <img src="${g.img}" class="w-16 h-16 rounded-full object-cover shadow-sm" alt="${g.name}">
          <div class="flex-1">
            <h3 class="font-bold" style="color: var(--text-primary)">${g.name}</h3>
            <p class="text-sm" style="color: var(--text-secondary)">${g.specialty}</p>
            <div class="flex items-center gap-2 mt-1">
              <span class="text-yellow-500 text-sm">⭐ ${g.rating}</span>
              <span class="text-xs" style="color: var(--text-secondary)">${g.tours} tours • ${g.languages.slice(0, 2).join(', ')}</span>
            </div>
          </div>
          <div class="text-right">
            <p class="font-bold text-green-600">$${g.price}/day</p>
            <button class="mt-2 text-xs bg-green-500 text-white px-3 py-1 rounded-lg">Book</button>
          </div>
        </div>
    `).join('');
}

function bookGuide(name) {
    if (typeof showAchievementToast === 'function') {
        showAchievementToast('Guide Booked!', `${name} will contact you soon`);
    }
    if (typeof addScore === 'function') {
        addScore(15);
    }
}

function bookTransport(type) {
    const types = { flight: 'Flight', bus: 'Bus', car: 'Car Rental' };
    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.innerHTML = `
        <div class="modal-content p-8" style="max-width: 500px;">
          <h2 class="text-2xl font-bold mb-6" style="color: var(--text-primary)">Book ${types[type]}</h2>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-semibold mb-2" style="color: var(--text-secondary)">From</label>
              <input type="text" class="input-field" placeholder="Departure city" value="Lusaka">
            </div>
            <div>
              <label class="block text-sm font-semibold mb-2" style="color: var(--text-secondary)">To</label>
              <input type="text" class="input-field" placeholder="Destination city">
            </div>
            <div>
              <label class="block text-sm font-semibold mb-2" style="color: var(--text-secondary)">Date</label>
              <input type="date" class="input-field">
            </div>
            <div class="flex gap-3 mt-6">
              <button onclick="this.closest('.modal-overlay').remove()" class="flex-1 py-3 rounded-xl font-semibold" style="background: var(--bg-primary); color: var(--text-primary); border: 2px solid var(--border-color);">Cancel</button>
              <button onclick="confirmTransport('${types[type]}')" class="flex-1 py-3 rounded-xl font-semibold text-white" style="background: linear-gradient(135deg, #16A34A, #15803D);">Search ${types[type]}</button>
            </div>
          </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function confirmTransport(type) {
    const modal = document.querySelector('.modal-overlay');
    if (modal) modal.remove();
    if (typeof showAchievementToast === 'function') {
        showAchievementToast('Searching...', `Finding best ${type} options`);
    }
    if (typeof addScore === 'function') {
        addScore(10);
    }
    // Sync with cost calculator if present
    if (typeof updateManualCosts === 'function') {
        const prices = { Flight: 200, Bus: 25, 'Car Rental': 50 };
        const price = prices[type] || 50;
        const transportInput = document.getElementById('inputTransport');
        if (transportInput) {
            transportInput.value = (parseFloat(transportInput.value) || 0) + price;
            updateManualCosts();
        }
    }
}

function loadActivities() {
    const container = document.getElementById('activityReservations');
    if (!container) return;
    
    container.innerHTML = activityList.map(a => `
        <div class="rounded-xl overflow-hidden border cursor-pointer hover:shadow-lg transition-all" style="background: var(--bg-card); border-color: var(--border-color)" onclick="bookActivity('${a.name}', ${a.price})">
          <img src="${a.img}" class="w-full h-40 object-cover" alt="${a.name}">
          <div class="p-4">
            <h3 class="font-bold mb-1" style="color: var(--text-primary)">${a.name}</h3>
            <p class="text-sm mb-2" style="color: var(--text-secondary)"><i class="fas fa-map-marker-alt mr-1 text-zambia-orange"></i>${a.location}</p>
            <div class="flex justify-between items-center">
              <span class="text-xs" style="color: var(--text-secondary)"><i class="fas fa-clock mr-1"></i>${a.duration} • ${a.difficulty}</span>
              <span class="font-bold text-green-600">$${a.price}</span>
            </div>
            <button class="w-full mt-3 bg-orange-500 text-white py-2 rounded-lg text-sm font-bold">Reserve Now</button>
          </div>
        </div>
    `).join('');
}

function bookActivity(name, price) {
    if (typeof showAchievementToast === 'function') {
        showAchievementToast('Activity Booked!', `${name} - $${price}`);
    }
    if (typeof addScore === 'function') {
        addScore(20);
    }
    // Update trip planner cost
    if (typeof updateManualCosts === 'function') {
        const activitiesInput = document.getElementById('inputActivities');
        if (activitiesInput) {
            activitiesInput.value = (parseFloat(activitiesInput.value) || 0) + price;
            updateManualCosts();
        }
    }
}

// Global Exports
window.loadTourGuides = loadTourGuides;
window.bookGuide = bookGuide;
window.bookTransport = bookTransport;
window.confirmTransport = confirmTransport;
window.loadActivities = loadActivities;
window.bookActivity = bookActivity;

// Auto-initialize if container exists
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('tourGuides')) {
        setTimeout(loadTourGuides, 500);
    }
    if (document.getElementById('activityReservations')) {
        setTimeout(loadActivities, 500);
    }
});