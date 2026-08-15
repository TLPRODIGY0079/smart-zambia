-- Smart Zambia Row Level Security (RLS) Policies
-- These policies enforce role-based access control for all tables

-- ============================================
-- ENABLE RLS ON ALL TABLES
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE tour_guide_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE civic_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROFILES RLS POLICIES
-- ============================================
-- Users can view all profiles
CREATE POLICY "view_profiles" ON profiles
  FOR SELECT
  USING (true);

-- Users can update only their own profile
CREATE POLICY "update_own_profile" ON profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Users can insert their own profile (on signup)
CREATE POLICY "insert_own_profile" ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Admins can update any profile
CREATE POLICY "admin_update_profiles" ON profiles
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- USER ROLES RLS POLICIES
-- ============================================
-- Users can view their own roles
CREATE POLICY "view_own_roles" ON user_roles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can view all roles
CREATE POLICY "admin_view_roles" ON user_roles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Only admins can assign roles
CREATE POLICY "admin_assign_roles" ON user_roles
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Only admins can update roles
CREATE POLICY "admin_update_roles" ON user_roles
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- DESTINATIONS RLS POLICIES
-- ============================================
-- Everyone can view destinations
CREATE POLICY "view_destinations" ON destinations
  FOR SELECT
  USING (true);

-- Only admins can create destinations
CREATE POLICY "admin_create_destinations" ON destinations
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Only admins can update destinations
CREATE POLICY "admin_update_destinations" ON destinations
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Only admins can delete destinations
CREATE POLICY "admin_delete_destinations" ON destinations
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- BOOKINGS RLS POLICIES
-- ============================================
-- Users can view their own bookings
CREATE POLICY "view_own_bookings" ON bookings
  FOR SELECT
  USING (auth.uid() = user_id);

-- Tour guides can view bookings assigned to them
CREATE POLICY "tour_guide_view_bookings" ON bookings
  FOR SELECT
  USING (auth.uid() = tour_guide_id);

-- Admins can view all bookings
CREATE POLICY "admin_view_bookings" ON bookings
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Users can create their own bookings
CREATE POLICY "create_own_bookings" ON bookings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own bookings
CREATE POLICY "update_own_bookings" ON bookings
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Tour guides can update booking status
CREATE POLICY "tour_guide_update_bookings" ON bookings
  FOR UPDATE
  USING (
    auth.uid() = tour_guide_id AND
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'tour_guide'
    )
  );

-- Admins can update any booking
CREATE POLICY "admin_update_bookings" ON bookings
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- REVIEWS RLS POLICIES
-- ============================================
-- Everyone can view reviews
CREATE POLICY "view_reviews" ON reviews
  FOR SELECT
  USING (true);

-- International and local tourists can create reviews
CREATE POLICY "tourist_create_reviews" ON reviews
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('international_tourist', 'local_tourist')
    )
  );

-- Users can update their own reviews
CREATE POLICY "update_own_reviews" ON reviews
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Admins can delete reviews
CREATE POLICY "admin_delete_reviews" ON reviews
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- CHECK_INS RLS POLICIES
-- ============================================
-- Users can view their own check-ins
CREATE POLICY "view_own_check_ins" ON check_ins
  FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can view all check-ins
CREATE POLICY "admin_view_check_ins" ON check_ins
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Users can create their own check-ins
CREATE POLICY "create_own_check_ins" ON check_ins
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- ACHIEVEMENTS RLS POLICIES
-- ============================================
-- Everyone can view achievements
CREATE POLICY "view_achievements" ON achievements
  FOR SELECT
  USING (true);

-- Users can view their own unlocked achievements
CREATE POLICY "view_own_unlocks" ON user_achievements
  FOR SELECT
  USING (auth.uid() = user_id);

-- System (via triggers) can unlock achievements
CREATE POLICY "system_unlock_achievements" ON user_achievements
  FOR INSERT
  WITH CHECK (true);

-- ============================================
-- TRIP PLANS RLS POLICIES
-- ============================================
-- Users can view their own plans and public plans
CREATE POLICY "view_trip_plans" ON trip_plans
  FOR SELECT
  USING (
    auth.uid() = user_id OR
    is_public = true OR
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Users can manage their own plans
CREATE POLICY "manage_own_plans" ON trip_plans
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- FAVORITES RLS POLICIES
-- ============================================
-- Users can view their own favorites
CREATE POLICY "view_own_favorites" ON favorites
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can manage their own favorites
CREATE POLICY "manage_own_favorites" ON favorites
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- SEARCH HISTORY RLS POLICIES
-- ============================================
-- Users can view their own search history
CREATE POLICY "view_own_search_history" ON search_history
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own search history
CREATE POLICY "create_own_search_history" ON search_history
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own search history
CREATE POLICY "delete_own_search_history" ON search_history
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- NOTIFICATIONS RLS POLICIES
-- ============================================
-- Users can view their own notifications
CREATE POLICY "view_own_notifications" ON notifications
  FOR SELECT
  USING (auth.uid() = user_id);

-- System can create notifications
CREATE POLICY "system_create_notifications" ON notifications
  FOR INSERT
  WITH CHECK (true);

-- Users can update their own notifications (mark as read)
CREATE POLICY "update_own_notifications" ON notifications
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own notifications
CREATE POLICY "delete_own_notifications" ON notifications
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- CHAT MESSAGES RLS POLICIES
-- ============================================
-- Users can view messages they sent or received
CREATE POLICY "view_own_chat_messages" ON chat_messages
  FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Users can create messages they send
CREATE POLICY "create_own_chat_messages" ON chat_messages
  FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- Users can update messages they sent (mark as read)
CREATE POLICY "update_own_chat_messages" ON chat_messages
  FOR UPDATE
  USING (auth.uid() = receiver_id);

-- ============================================
-- TOUR GUIDE APPLICATIONS RLS POLICIES
-- ============================================
-- Users can view their own applications
CREATE POLICY "view_own_applications" ON tour_guide_applications
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own applications
CREATE POLICY "create_own_applications" ON tour_guide_applications
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can view all applications
CREATE POLICY "admin_view_applications" ON tour_guide_applications
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can update applications
CREATE POLICY "admin_update_applications" ON tour_guide_applications
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- COMMISSIONS RLS POLICIES
-- ============================================
-- Tour guides can view their own commissions
CREATE POLICY "view_own_commissions" ON commissions
  FOR SELECT
  USING (auth.uid() = tour_guide_id);

-- Admins can view all commissions
CREATE POLICY "admin_view_commissions" ON commissions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- System can create commissions
CREATE POLICY "system_create_commissions" ON commissions
  FOR INSERT
  WITH CHECK (true);

-- ============================================
-- CIVIC REPORTS RLS POLICIES
-- ============================================
-- Users can view their own civic reports
CREATE POLICY "view_own_civic_reports" ON civic_reports
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own civic reports
CREATE POLICY "create_own_civic_reports" ON civic_reports
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can view all civic reports
CREATE POLICY "admin_view_civic_reports" ON civic_reports
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can update civic reports
CREATE POLICY "admin_update_civic_reports" ON civic_reports
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- ADMIN AUDIT LOG RLS POLICIES
-- ============================================
-- Only admins can view audit logs
CREATE POLICY "admin_view_audit_log" ON admin_audit_log
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- System can create audit log entries
CREATE POLICY "system_create_audit_log" ON admin_audit_log
  FOR INSERT
  WITH CHECK (true);

-- Success message
SELECT 'RLS policies created successfully!' as message;
