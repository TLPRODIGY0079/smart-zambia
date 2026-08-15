// Supabase Integration for Smart Zambia Frontend
// This file handles authentication state and Supabase client initialization

import { supabase, authService, roleService, profileService } from '../supabase/client.js';
import { hasLocalStorageData, showMigrationPrompt } from '../supabase/migration.js';

// Global state
window.supabaseState = {
  user: null,
  profile: null,
  roles: [],
  isAuthenticated: false,
  isLoading: true
};

/**
 * Initialize Supabase authentication
 */
async function initSupabaseAuth() {
  try {
    // Check for existing session
    const session = await authService.getSession();
    
    if (session?.user) {
      window.supabaseState.user = session.user;
      window.supabaseState.isAuthenticated = true;
      
      // Load user profile
      try {
        const profile = await profileService.getProfile(session.user.id);
        window.supabaseState.profile = profile;
      } catch (error) {
        console.log('Profile not found, will create on first login');
      }
      
      // Load user roles
      try {
        const roles = await roleService.getUserRoles(session.user.id);
        window.supabaseState.roles = roles.map(r => r.role);
      } catch (error) {
        console.log('No roles assigned');
      }
      
      // Check for localStorage data migration
      if (hasLocalStorageData()) {
        await showMigrationPrompt(session.user.id);
      }
    }
    
    window.supabaseState.isLoading = false;
    
    // Dispatch event for other components to listen
    window.dispatchEvent(new CustomEvent('supabaseAuthChanged', {
      detail: window.supabaseState
    }));
    
  } catch (error) {
    console.error('Supabase auth initialization failed:', error);
    window.supabaseState.isLoading = false;
  }
}

/**
 * Sign in with email and password
 */
async function signIn(email, password) {
  try {
    const { data, error } = await authService.signIn(email, password);
    if (error) throw error;
    
    // Reload page to update state
    window.location.reload();
    return data;
  } catch (error) {
    console.error('Sign in failed:', error);
    throw error;
  }
}

/**
 * Sign up new user
 */
async function signUp(email, password, metadata) {
  try {
    const { data, error } = await authService.signUp(email, password, metadata);
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Sign up failed:', error);
    throw error;
  }
}

/**
 * Sign out current user
 */
async function signOut() {
  try {
    await authService.signOut();
    
    // Clear local state
    window.supabaseState = {
      user: null,
      profile: null,
      roles: [],
      isAuthenticated: false,
      isLoading: false
    };
    
    // Dispatch event
    window.dispatchEvent(new CustomEvent('supabaseAuthChanged', {
      detail: window.supabaseState
    }));
    
    // Redirect to home
    window.location.href = '/index.html';
  } catch (error) {
    console.error('Sign out failed:', error);
    throw error;
  }
}

/**
 * Check if user has specific role
 */
function hasRole(role) {
  return window.supabaseState.roles.includes(role);
}

/**
 * Check if user is admin
 */
function isAdmin() {
  return hasRole('admin');
}

/**
 * Check if user is tour guide
 */
function isTourGuide() {
  return hasRole('tour_guide');
}

/**
 * Check if user is local tourist
 */
function isLocalTourist() {
  return hasRole('local_tourist');
}

/**
 * Check if user is international tourist
 */
function isInternationalTourist() {
  return hasRole('international_tourist');
}

/**
 * Get user's primary role
 */
function getPrimaryRole() {
  const rolePriority = ['admin', 'tour_guide', 'local_tourist', 'international_tourist'];
  for (const role of rolePriority) {
    if (hasRole(role)) return role;
  }
  return 'international_tourist'; // Default
}

/**
 * Update user profile
 */
async function updateProfile(updates) {
  if (!window.supabaseState.user) {
    throw new Error('User not authenticated');
  }
  
  try {
    const profile = await profileService.updateProfile(
      window.supabaseState.user.id,
      updates
    );
    window.supabaseState.profile = profile;
    return profile;
  } catch (error) {
    console.error('Profile update failed:', error);
    throw error;
  }
}

/**
 * Listen to auth state changes
 */
function onAuthStateChange(callback) {
  return authService.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' && session?.user) {
      window.supabaseState.user = session.user;
      window.supabaseState.isAuthenticated = true;
      
      // Load profile and roles
      profileService.getProfile(session.user.id)
        .then(profile => {
          window.supabaseState.profile = profile;
          return roleService.getUserRoles(session.user.id);
        })
        .then(roles => {
          window.supabaseState.roles = roles.map(r => r.role);
          callback(window.supabaseState);
        });
    } else if (event === 'SIGNED_OUT') {
      window.supabaseState = {
        user: null,
        profile: null,
        roles: [],
        isAuthenticated: false,
        isLoading: false
      };
      callback(window.supabaseState);
    }
  });
}

// Initialize on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSupabaseAuth);
} else {
  initSupabaseAuth();
}

// Export functions to global scope
window.supabaseAuth = {
  signIn,
  signUp,
  signOut,
  hasRole,
  isAdmin,
  isTourGuide,
  isLocalTourist,
  isInternationalTourist,
  getPrimaryRole,
  updateProfile,
  onAuthStateChange,
  state: window.supabaseState
};

// Export supabase client for direct use
window.supabase = supabase;
