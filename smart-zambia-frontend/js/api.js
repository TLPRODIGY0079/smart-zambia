// js/api.js - Updated to use Supabase
import { supabase, authService, destinationsService } from '../../supabase/client.js';

export async function fetchDestinations(filters = {}) {
  try {
    return await destinationsService.getDestinations(filters);
  } catch (error) {
    console.error('Failed to fetch destinations:', error);
    throw error;
  }
}

export async function fetchDestinationById(id) {
  try {
    return await destinationsService.getDestination(id);
  } catch (error) {
    console.error('Failed to fetch destination:', error);
    throw error;
  }
}

// Auth - using Supabase auth service
export async function registerUser(email, password, fullName) {
  try {
    return await authService.signUp(email, password, { full_name: fullName });
  } catch (error) {
    console.error('Registration failed:', error);
    throw error;
  }
}

export async function loginUser(email, password) {
  try {
    return await authService.signIn(email, password);
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
}

// Civic API functions - using Supabase directly
export async function submitCivicReport(reportData) {
  try {
    const { data, error } = await supabase
      .from('civic_reports')
      .insert({
        user_id: (await supabase.auth.getUser()).data.user.id,
        ...reportData
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Failed to submit report:', error);
    throw error;
  }
}

export async function getUserCivicReports() {
  try {
    const userId = (await supabase.auth.getUser()).data.user.id;
    const { data, error } = await supabase
      .from('civic_reports')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Failed to fetch reports:', error);
    throw error;
  }
}

export async function getUserCivicProfile() {
  try {
    const userId = (await supabase.auth.getUser()).data.user.id;
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Failed to fetch profile:', error);
    throw error;
  }
}

export async function awardAchievement(achievementData) {
  try {
    const userId = (await supabase.auth.getUser()).data.user.id;
    const { data, error } = await supabase
      .from('user_achievements')
      .insert({
        user_id: userId,
        ...achievementData
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Failed to award achievement:', error);
    throw error;
  }
}