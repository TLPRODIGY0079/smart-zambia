// localStorage to Supabase Migration Tool
// This script migrates existing user data from localStorage to Supabase

import { supabase } from './client.js';
import { profileService, roleService, checkInsService, achievementsService, tripPlansService, favoritesService, searchHistoryService } from './services.js';

/**
 * Detect if user has localStorage data to migrate
 */
export function hasLocalStorageData() {
  const keys = [
    'smartZambia_user',
    'smartZambia_xp',
    'smartZambia_level',
    'smartZambia_achievements',
    'smartZambia_checkIns',
    'smartZambia_tripPlans',
    'smartZambia_favorites',
    'smartZambia_searchHistory'
  ];

  return keys.some(key => localStorage.getItem(key) !== null);
}

/**
 * Get all localStorage data
 */
export function getLocalStorageData() {
  return {
    user: JSON.parse(localStorage.getItem('smartZambia_user') || 'null'),
    xp: parseInt(localStorage.getItem('smartZambia_xp') || '0'),
    level: parseInt(localStorage.getItem('smartZambia_level') || '1'),
    achievements: JSON.parse(localStorage.getItem('smartZambia_achievements') || '[]'),
    checkIns: JSON.parse(localStorage.getItem('smartZambia_checkIns') || '[]'),
    tripPlans: JSON.parse(localStorage.getItem('smartZambia_tripPlans') || '[]'),
    favorites: JSON.parse(localStorage.getItem('smartZambia_favorites') || '[]'),
    searchHistory: JSON.parse(localStorage.getItem('smartZambia_searchHistory') || '[]')
  };
}

/**
 * Migrate user profile to Supabase
 */
export async function migrateProfile(userId, localData) {
  try {
    const profile = await profileService.getProfile(userId);
    
    if (profile) {
      console.log('Profile already exists, updating...');
      return await profileService.updateProfile(userId, {
        xp_points: localData.xp,
        level: localData.level,
        total_bookings: localData.checkIns.length
      });
    } else {
      console.log('Creating new profile...');
      return await profileService.createProfile(userId, {
        username: localData.user?.username || `user_${userId.substring(0, 8)}`,
        full_name: localData.user?.fullName || 'User',
        xp_points: localData.xp,
        level: localData.level,
        total_bookings: localData.checkIns.length
      });
    }
  } catch (error) {
    console.error('Profile migration failed:', error);
    throw error;
  }
}

/**
 * Migrate user role to Supabase
 */
export async function migrateRole(userId) {
  try {
    const existingRoles = await roleService.getUserRoles(userId);
    
    if (existingRoles.length > 0) {
      console.log('Role already assigned');
      return existingRoles;
    }

    // Assign default role based on localStorage data or default to international_tourist
    const role = 'international_tourist';
    await roleService.assignRole(userId, role, userId);
    
    console.log(`Assigned role: ${role}`);
    return [{ role }];
  } catch (error) {
    console.error('Role migration failed:', error);
    throw error;
  }
}

/**
 * Migrate check-ins to Supabase
 */
export async function migrateCheckIns(userId, localCheckIns) {
  try {
    const migrated = [];
    
    for (const checkIn of localCheckIns) {
      try {
        // Map destination ID from localStorage to Supabase
        // This assumes destination IDs are consistent or you have a mapping
        const { data, error } = await supabase
          .from('destinations')
          .select('id')
          .eq('name', checkIn.destinationName)
          .single();

        if (error || !data) {
          console.warn(`Destination not found: ${checkIn.destinationName}`);
          continue;
        }

        const { data: newCheckIn, error: insertError } = await supabase
          .from('check_ins')
          .insert({
            user_id: userId,
            destination_id: data.id,
            checked_in_at: checkIn.date || new Date().toISOString(),
            xp_awarded: checkIn.xp || 10
          })
          .select()
          .single();

        if (insertError) {
          console.warn(`Check-in already exists or failed: ${checkIn.destinationName}`);
          continue;
        }

        migrated.push(newCheckIn);
      } catch (error) {
        console.warn(`Failed to migrate check-in: ${checkIn.destinationName}`, error);
      }
    }

    console.log(`Migrated ${migrated.length} check-ins`);
    return migrated;
  } catch (error) {
    console.error('Check-ins migration failed:', error);
    throw error;
  }
}

/**
 * Migrate achievements to Supabase
 */
export async function migrateAchievements(userId, localAchievements) {
  try {
    const migrated = [];
    
    for (const achievement of localAchievements) {
      try {
        // Map achievement code from localStorage to Supabase
        const { data, error } = await supabase
          .from('achievements')
          .select('id')
          .eq('code', achievement.code)
          .single();

        if (error || !data) {
          console.warn(`Achievement not found: ${achievement.code}`);
          continue;
        }

        const unlocked = await achievementsService.unlockAchievement(userId, achievement.code);
        if (unlocked) {
          migrated.push(unlocked);
        }
      } catch (error) {
        console.warn(`Failed to migrate achievement: ${achievement.code}`, error);
      }
    }

    console.log(`Migrated ${migrated.length} achievements`);
    return migrated;
  } catch (error) {
    console.error('Achievements migration failed:', error);
    throw error;
  }
}

/**
 * Migrate trip plans to Supabase
 */
export async function migrateTripPlans(userId, localTripPlans) {
  try {
    const migrated = [];
    
    for (const plan of localTripPlans) {
      try {
        const { data, error } = await tripPlansService.createTripPlan({
          user_id: userId,
          name: plan.name || 'My Trip',
          description: plan.description,
          start_date: plan.startDate,
          end_date: plan.endDate,
          destinations: plan.destinations || [],
          budget: plan.budget,
          currency: plan.currency || 'USD',
          is_public: plan.isPublic || false
        });

        if (error) throw error;
        migrated.push(data);
      } catch (error) {
        console.warn(`Failed to migrate trip plan: ${plan.name}`, error);
      }
    }

    console.log(`Migrated ${migrated.length} trip plans`);
    return migrated;
  } catch (error) {
    console.error('Trip plans migration failed:', error);
    throw error;
  }
}

/**
 * Migrate favorites to Supabase
 */
export async function migrateFavorites(userId, localFavorites) {
  try {
    const migrated = [];
    
    for (const favorite of localFavorites) {
      try {
        // Map destination ID from localStorage to Supabase
        const { data, error } = await supabase
          .from('destinations')
          .select('id')
          .eq('name', favorite.destinationName)
          .single();

        if (error || !data) {
          console.warn(`Destination not found: ${favorite.destinationName}`);
          continue;
        }

        await favoritesService.addFavorite(userId, data.id, favorite.collection || 'Default');
        migrated.push(favorite);
      } catch (error) {
        console.warn(`Failed to migrate favorite: ${favorite.destinationName}`, error);
      }
    }

    console.log(`Migrated ${migrated.length} favorites`);
    return migrated;
  } catch (error) {
    console.error('Favorites migration failed:', error);
    throw error;
  }
}

/**
 * Migrate search history to Supabase
 */
export async function migrateSearchHistory(userId, localSearchHistory) {
  try {
    const migrated = [];
    
    for (const search of localSearchHistory.slice(0, 50)) { // Limit to last 50
      try {
        await searchHistoryService.addSearch(userId, search.query);
        migrated.push(search);
      } catch (error) {
        console.warn(`Failed to migrate search: ${search.query}`, error);
      }
    }

    console.log(`Migrated ${migrated.length} search history entries`);
    return migrated;
  } catch (error) {
    console.error('Search history migration failed:', error);
    throw error;
  }
}

/**
 * Full migration process
 */
export async function migrateAllData(userId) {
  const localData = getLocalStorageData();
  const results = {
    profile: null,
    role: null,
    checkIns: [],
    achievements: [],
    tripPlans: [],
    favorites: [],
    searchHistory: [],
    errors: []
  };

  try {
    // Migrate profile
    results.profile = await migrateProfile(userId, localData);
    
    // Migrate role
    results.role = await migrateRole(userId);
    
    // Migrate check-ins
    if (localData.checkIns.length > 0) {
      results.checkIns = await migrateCheckIns(userId, localData.checkIns);
    }
    
    // Migrate achievements
    if (localData.achievements.length > 0) {
      results.achievements = await migrateAchievements(userId, localData.achievements);
    }
    
    // Migrate trip plans
    if (localData.tripPlans.length > 0) {
      results.tripPlans = await migrateTripPlans(userId, localData.tripPlans);
    }
    
    // Migrate favorites
    if (localData.favorites.length > 0) {
      results.favorites = await migrateFavorites(userId, localData.favorites);
    }
    
    // Migrate search history
    if (localData.searchHistory.length > 0) {
      results.searchHistory = await migrateSearchHistory(userId, localData.searchHistory);
    }

    return results;
  } catch (error) {
    console.error('Migration failed:', error);
    results.errors.push(error.message);
    throw error;
  }
}

/**
 * Clear localStorage after successful migration
 */
export function clearLocalStorage() {
  const keys = [
    'smartZambia_user',
    'smartZambia_xp',
    'smartZambia_level',
    'smartZambia_achievements',
    'smartZambia_checkIns',
    'smartZambia_tripPlans',
    'smartZambia_favorites',
    'smartZambia_searchHistory'
  ];

  keys.forEach(key => localStorage.removeItem(key));
  console.log('localStorage cleared');
}

/**
 * Migration UI helper - shows migration prompt
 */
export function showMigrationPrompt(userId) {
  return new Promise((resolve, reject) => {
    const localData = getLocalStorageData();
    
    // Create modal
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
    `;

    modal.innerHTML = `
      <div style="background: white; padding: 32px; border-radius: 16px; max-width: 500px; width: 90%;">
        <h2 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 700;">Migrate Your Data?</h2>
        <p style="margin: 0 0 24px 0; color: #6B7280; line-height: 1.6;">
          We found your existing data from localStorage. Would you like to migrate it to your Supabase account?
          This will preserve your:
        </p>
        <ul style="margin: 0 0 24px 0; padding-left: 20px; color: #374151;">
          <li>XP points and level (${localData.xp} XP, Level ${localData.level})</li>
          <li>${localData.achievements.length} achievements</li>
          <li>${localData.checkIns.length} check-ins</li>
          <li>${localData.tripPlans.length} trip plans</li>
          <li>${localData.favorites.length} favorites</li>
          <li>${localData.searchHistory.length} search history entries</li>
        </ul>
        <div style="display: flex; gap: 12px;">
          <button id="migrateYes" style="flex: 1; padding: 12px 24px; background: #E85D04; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">
            Yes, Migrate Data
          </button>
          <button id="migrateNo" style="flex: 1; padding: 12px 24px; background: #F3F4F6; color: #374151; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">
            No, Start Fresh
          </button>
        </div>
        <div id="migrationStatus" style="margin-top: 16px; padding: 12px; border-radius: 8px; display: none;"></div>
      </div>
    `;

    document.body.appendChild(modal);

    const statusEl = modal.querySelector('#migrationStatus');
    const yesBtn = modal.querySelector('#migrateYes');
    const noBtn = modal.querySelector('#migrateNo');

    yesBtn.onclick = async () => {
      yesBtn.disabled = true;
      noBtn.disabled = true;
      statusEl.style.display = 'block';
      statusEl.style.background = '#DBEAFE';
      statusEl.style.color = '#1E40AF';
      statusEl.textContent = 'Migrating your data...';

      try {
        const results = await migrateAllData(userId);
        
        statusEl.style.background = '#D1FAE5';
        statusEl.style.color = '#065F46';
        statusEl.innerHTML = `
          <strong>Migration successful!</strong><br>
          Profile: ✓<br>
          Role: ✓<br>
          Check-ins: ${results.checkIns.length}<br>
          Achievements: ${results.achievements.length}<br>
          Trip plans: ${results.tripPlans.length}<br>
          Favorites: ${results.favorites.length}<br>
          Search history: ${results.searchHistory.length}
        `;

        clearLocalStorage();

        setTimeout(() => {
          document.body.removeChild(modal);
          resolve(results);
        }, 3000);
      } catch (error) {
        statusEl.style.background = '#FEE2E2';
        statusEl.style.color = '#991B1B';
        statusEl.innerHTML = `<strong>Migration failed:</strong> ${error.message}<br>Your localStorage data has been preserved.`;
        
        yesBtn.disabled = false;
        noBtn.disabled = false;
        
        setTimeout(() => {
          document.body.removeChild(modal);
          reject(error);
        }, 5000);
      }
    };

    noBtn.onclick = () => {
      document.body.removeChild(modal);
      resolve(null);
    };
  });
}

// Export all functions
export default {
  hasLocalStorageData,
  getLocalStorageData,
  migrateProfile,
  migrateRole,
  migrateCheckIns,
  migrateAchievements,
  migrateTripPlans,
  migrateFavorites,
  migrateSearchHistory,
  migrateAllData,
  clearLocalStorage,
  showMigrationPrompt
};
