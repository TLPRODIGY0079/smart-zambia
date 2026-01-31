// js/api.js
const API_BASE = 'http://localhost:3001/api'; // Update when deployed

export async function fetchDestinations(filters = {}) {
  const params = new URLSearchParams(filters);
  const res = await fetch(`${API_BASE}/destinations?${params}`);
  if (!res.ok) throw new Error('Failed to fetch destinations');
  return await res.json();
}

export async function fetchDestinationById(id) {
  const res = await fetch(`${API_BASE}/destinations/${id}`);
  if (!res.ok) throw new Error('Destination not found');
  return await res.json();
}

// Auth
export async function registerUser(email, password, fullName) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, fullName })
  });
  return await res.json();
}

export async function loginUser(email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return await res.json(); // { token, user }
}

// Civic API functions
export async function submitCivicReport(reportData, token) {
  const res = await fetch(`${API_BASE}/civic/report`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(reportData)
  });
  if (!res.ok) throw new Error('Failed to submit report');
  return await res.json();
}

export async function getUserCivicReports(token) {
  const res = await fetch(`${API_BASE}/civic/my-reports`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch reports');
  return await res.json();
}

export async function getUserCivicProfile(token) {
  const res = await fetch(`${API_BASE}/civic/profile`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch profile');
  return await res.json();
}

export async function awardAchievement(achievementData, token) {
  const res = await fetch(`${API_BASE}/civic/achievement`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(achievementData)
  });
  if (!res.ok) throw new Error('Failed to award achievement');
  return await res.json();
}