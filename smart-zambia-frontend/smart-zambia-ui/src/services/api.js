const API_BASE = "http://localhost:3001";

// TOURISM
export const getTourism = async () => {
  const res = await fetch(`${API_BASE}/api/tourism`);
  return res.json();
};

// CARBON
export const getCarbonStats = async () => {
  const res = await fetch(`${API_BASE}/api/carbon`);
  return res.json();
};

// GENERAL STATS
export const getStats = async () => {
  const res = await fetch(`${API_BASE}/api/stats`);
  return res.json();
};