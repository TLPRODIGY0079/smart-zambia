// Supabase Client Configuration
// This file initializes the Supabase client for frontend use

import { createClient } from '@supabase/supabase-js';

// Environment variables (loaded from Vercel or .env.local)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

// Validate required environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
  );
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
    storageKey: 'smart-zambia-auth-token'
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  },
  global: {
    headers: {
      'X-Client-Info': 'smart-zambia-web'
    }
  }
});

// ============================================
// AUTHENTICATION SERVICE
// ============================================
export const authService = {
  /**
   * Sign up a new user
   * @param {string} email - User email
   * @param {string} password - User password (min 8 chars, uppercase, lowercase, number)
   * @param {object} metadata - Additional user metadata (full_name, role, etc.)
   */
  async signUp(email, password, metadata = {}) {
    // Validate password strength
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      throw new Error(
        'Password must be at least 8 characters with uppercase, lowercase, and numbers'
      );
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: metadata.full_name,
          role: metadata.role || 'international_tourist',
          ...metadata
        }
      }
    });

    if (error) throw error;
    return data;
  },

  /**
   * Sign in with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   */
  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    return data;
  },

  /**
   * Sign in with Google OAuth
   */
  async signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });

    if (error) throw error;
    return data;
  },

  /**
   * Sign in with Facebook OAuth
   */
  async signInWithFacebook() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });

    if (error) throw error;
    return data;
  },

  /**
   * Sign out current user
   */
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  /**
   * Reset password - send reset email
   * @param {string} email - User email
   */
  async resetPassword(email) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });

    if (error) throw error;
  },

  /**
   * Update user password
   * @param {string} newPassword - New password
   */
  async updatePassword(newPassword) {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) throw error;
  },

  /**
   * Get current session
   */
  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  /**
   * Get current user
   */
  async getUser() {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data.user;
  },

  /**
   * Listen to auth state changes
   * @param {function} callback - Callback function (event, session)
   */
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
  }
};

// ============================================
// ROLE MANAGEMENT SERVICE
// ============================================
export const roleService = {
  /**
   * Get user roles
   * @param {string} userId - User UUID
   */
  async getUserRoles(userId) {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role, granted_at, verified')
      .eq('user_id', userId);

    if (error) throw error;
    return data;
  },

  /**
   * Check if user has specific role
   * @param {string} userId - User UUID
   * @param {string} role - Role to check
   */
  async hasRole(userId, role) {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', role)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return false; // Not found
      throw error;
    }
    return !!data;
  },

  /**
   * Assign role to user (admin only)
   * @param {string} userId - User UUID
   * @param {string} role - Role to assign
   * @param {string} grantedBy - Admin user UUID
   */
  async assignRole(userId, role, grantedBy) {
    const { data, error } = await supabase
      .from('user_roles')
      .insert({
        user_id: userId,
        role,
        granted_by: grantedBy
      });

    if (error) throw error;
    return data;
  },

  /**
   * Remove role from user (admin only)
   * @param {string} userId - User UUID
   * @param {string} role - Role to remove
   */
  async removeRole(userId, role) {
    const { error } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId)
      .eq('role', role);

    if (error) throw error;
  }
};

// ============================================
// PROFILE SERVICE
// ============================================
export const profileService = {
  /**
   * Get user profile
   * @param {string} userId - User UUID
   */
  async getProfile(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update user profile
   * @param {string} userId - User UUID
   * @param {object} updates - Profile updates
   */
  async updateProfile(userId, updates) {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Create profile for new user
   * @param {string} userId - User UUID
   * @param {object} profileData - Profile data
   */
  async createProfile(userId, profileData) {
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        ...profileData
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// ============================================
// DESTINATIONS SERVICE
// ============================================
export const destinationsService = {
  /**
   * Get all destinations with optional filters
   * @param {object} filters - Filter options (province, category, featured, search)
   */
  async getDestinations(filters = {}) {
    let query = supabase
      .from('destinations')
      .select('*');

    if (filters.province) {
      query = query.eq('province', filters.province);
    }

    if (filters.category) {
      query = query.eq('category', filters.category);
    }

    if (filters.featured !== undefined) {
      query = query.eq('featured', filters.featured);
    }

    if (filters.search) {
      query = query.textSearch('search_vector', filters.search);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  /**
   * Get single destination by ID
   * @param {string} id - Destination UUID
   */
  async getDestination(id) {
    const { data, error } = await supabase
      .from('destinations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Create destination (admin only)
   * @param {object} destinationData - Destination data
   */
  async createDestination(destinationData) {
    const { data, error } = await supabase
      .from('destinations')
      .insert(destinationData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update destination (admin only)
   * @param {string} id - Destination UUID
   * @param {object} updates - Destination updates
   */
  async updateDestination(id, updates) {
    const { data, error } = await supabase
      .from('destinations')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete destination (admin only)
   * @param {string} id - Destination UUID
   */
  async deleteDestination(id) {
    const { error } = await supabase
      .from('destinations')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

// Export default supabase client
export default supabase;
