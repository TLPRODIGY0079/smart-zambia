/**
 * js/map-controller.js
 * Logic for Maps (Leaflet) and Drone view controls
 */

window.mainMap = null;
window.destinationMap = null;
window.droneRotation = 0;
window.droneZoom = 1;
window.autoFly = true;

function initMainMap() {
    if (window.mainMap) return;
    window.mainMap = L.map('fullMap').setView([-14.5, 28], 6);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
    }).addTo(window.mainMap);

    if (window.destinations) {
        window.destinations.forEach(dest => {
            const marker = L.marker([dest.lat, dest.lng]).addTo(window.mainMap);
            marker.bindPopup(`
              <div style="min-width: 180px; font-family: 'DM Sans', sans-serif;">
                <img src="${dest.image_url}" alt="${dest.name}" style="width: 100%; height: 80px; object-fit: cover; border-radius: 8px; margin-bottom: 8px;">
                <h3 style="font-weight: bold; margin-bottom: 4px; font-size: 14px;">${dest.name}</h3>
                <p style="color: #666; font-size: 11px; margin-bottom: 8px;">${dest.province}</p>
                <button onclick="openDestination(${dest.id})" style="background: linear-gradient(135deg, #E85D04, #C45508); color: white; border: none; padding: 8px 12px; border-radius: 8px; cursor: pointer; width: 100%; font-size: 12px; font-weight: 600;">
                  View Details
                </button>
              </div>`);
        });
    }
}

function initDestinationMap(lat, lng, name) {
    if (window.destinationMap) window.destinationMap.remove();
    window.destinationMap = L.map('destination-map').setView([lat, lng], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
    }).addTo(window.destinationMap);
    L.marker([lat, lng]).addTo(window.destinationMap).bindPopup(name).openPopup();
}

function rotateDrone(deg) {
    window.droneRotation += deg;
    updateDroneView();
}

function zoomDrone(factor) {
    window.droneZoom = Math.max(0.5, Math.min(2, window.droneZoom * factor));
    updateDroneView();
}

function toggleAutoFly() {
    window.autoFly = !window.autoFly;
    const scene = document.querySelector('.drone-scene');
    if (scene) scene.style.animationPlayState = window.autoFly ? 'running' : 'paused';
    const icon = document.getElementById('autoFlyIcon');
    if (icon) icon.style.color = window.autoFly ? '' : '#E85D04';
}

function updateDroneView() {
    const img = document.getElementById('modalImage');
    if (img) img.style.transform = `rotateY(${window.droneRotation}deg) scale(${window.droneZoom})`;
}

window.initMainMap = initMainMap;
window.initDestinationMap = initDestinationMap;
window.rotateDrone = rotateDrone;
window.zoomDrone = zoomDrone;
window.toggleAutoFly = toggleAutoFly;
window.updateDroneView = updateDroneView;

document.addEventListener('keydown', (e) => {
    if (!document.getElementById('destinationModal')?.classList.contains('active')) return;
    if (e.key === 'ArrowLeft') rotateDrone(-15);
    if (e.key === 'ArrowRight') rotateDrone(15);
});