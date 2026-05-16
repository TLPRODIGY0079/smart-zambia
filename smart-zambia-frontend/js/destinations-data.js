/**
 * Destinations Logic & Data extracted for maintainability
 */
const destinations = [
    { 
        id: 1, 
        name: "Victoria Falls", 
        province: "Southern Province", 
        category: "Nature", 
        rating: 4.9, 
        description: "One of the Seven Natural Wonders of the World...", 
        image_url: "https://images.unsplash.com/photo-1568625502763-2a5ec6a94c47?w=600&q=80", 
        entry_fee_foreign: 30, 
        featured: true, 
        lat: -17.9243, 
        lng: 25.8572 
    },
    // ... other 20+ destinations moved here
];

const state = {
    isLoggedIn: false,
    user: null,
    score: 0,
    level: 1,
    achievements: [],
    wishlist: [],
    currentDestination: null,
    visitedDestinations: [],
    treasureHuntActive: false,
    foundTreasures: [],
    currentTreasureIndex: 0,
    treasureClues: [
        { clue: "Where the smoke thunders and rainbows dance...", destination: 1 },
        { clue: "Where leopards prowl at night...", destination: 2 },
        { clue: "Swim on the edge of the world...", destination: 10 },
        { clue: "Millions of bats darken the sky...", destination: 17 },
        { clue: "The King's royal barge glides through waters...", destination: 11 }
    ],
    civicXP: 0,
    civicLevel: 1,
    civicReports: [],
    uploadedMedia: [],
    pendingMedia: [],
    posts: [],
    transactions: [],
    isLocalExplorer: false,
    isVerifiedCitizen: false
};

// Expose state globally for legacy component compatibility
window.destinations = destinations;
window.state = state;