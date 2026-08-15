 # Smart Zambia Supabase Setup Guide

This guide walks you through setting up Supabase for the Smart Zambia production upgrade.

## Prerequisites

- A Supabase account (free tier is sufficient for MVP)
- Node.js 18+ installed
- Git installed

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in project details:
   - **Name**: `smart-zambia`
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose closest to your users (e.g., `South Africa` for Zambia)
   - **Pricing Plan**: Free tier
5. Click "Create new project"
6. Wait for project to be provisioned (2-3 minutes)

## Step 2: Configure Authentication Providers

### Email Authentication (Enabled by Default)

1. Go to **Authentication** → **Providers**
2. Click on **Email**
3. Ensure **Enable Email provider** is checked
4. Configure **Email Templates**:
   - **Confirm signup**: Customize with Smart Zambia branding
   - **Reset password**: Customize with Smart Zambia branding
   - **Email change**: Customize as needed

### Google OAuth

1. Go to **Authentication** → **Providers**
2. Click on **Google**
3. Enable **Enable Google provider**
4. Click **Get Google Client ID**:
   - This redirects to Google Cloud Console
   - Create a new OAuth 2.0 client ID
   - Add authorized redirect URI: `https://your-project.supabase.co/auth/v1/callback`
   - Copy Client ID and Client Secret
5. Paste into Supabase Google provider settings
6. Save

### Facebook OAuth

1. Go to **Authentication** → **Providers**
2. Click on **Facebook**
3. Enable **Enable Facebook provider**
4. Go to [Facebook Developers](https://developers.facebook.com)
5. Create a new app:
   - Select **Consumer** app type
   - Add **Facebook Login** product
6. Configure OAuth settings:
   - Add redirect URI: `https://your-project.supabase.co/auth/v1/callback`
7. Copy App ID and App Secret
8. Paste into Supabase Facebook provider settings
9. Save

## Step 3: Run Database Schema

1. Go to **SQL Editor** in Supabase dashboard
2. Click **New Query**
3. Copy contents of `supabase/schema.sql`
4. Paste into SQL Editor
5. Click **Run**
6. Verify success message: "Smart Zambia Supabase schema created successfully!"

## Step 4: Apply RLS Policies

1. In SQL Editor, click **New Query**
2. Copy contents of `supabase/rls_policies.sql`
3. Paste into SQL Editor
4. Click **Run**
5. Verify success message: "RLS policies created successfully!"

## Step 5: Get Supabase Credentials

1. Go to **Project Settings** → **API**
2. Copy these values:
   - **Project URL**: `https://your-project.supabase.co`
   - **anon public**: `eyJ...` (starts with `eyJ`)
   - **service_role secret**: `eyJ...` (starts with `eyJ` - keep this secret!)

## Step 6: Configure Local Environment

1. Copy `supabase/.env.example` to `.env.local`:
   ```bash
   cp supabase/.env.example .env.local
   ```

2. Edit `.env.local` and fill in your credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   ```

3. Keep `.env.local` in `.gitignore` (already configured)

## Step 7: Install Supabase Client

```bash
npm install @supabase/supabase-js
```

## Step 8: Seed Initial Data

### Create Admin User

1. Go to **Authentication** → **Users**
2. Click **Add User**
3. Enter admin email and password
4. After creation, note the user ID (UUID)

### Assign Admin Role

1. Go to **SQL Editor**
2. Run:
   ```sql
   INSERT INTO user_roles (user_id, role, granted_by, verified)
   VALUES ('YOUR_ADMIN_UUID', 'admin', 'YOUR_ADMIN_UUID', true);
   ```

### Create Admin Profile

1. Go to **SQL Editor**
2. Run:
   ```sql
   INSERT INTO profiles (id, username, full_name, xp_points, level)
   VALUES ('YOUR_ADMIN_UUID', 'admin', 'System Administrator', 0, 1);
   ```

### Migrate Existing Destinations

If you have existing destinations in your PostgreSQL database:

1. Export from existing database:
   ```bash
   pg_dump -h localhost -U postgres smart_zambia -t destinations > destinations_backup.sql
   ```

2. Import to Supabase:
   - Go to **SQL Editor**
   - Paste the exported data (adjust column names if needed)
   - Run

## Step 9: Enable Realtime

1. Go to **Database** → **Replication**
2. Enable replication for these tables:
   - `notifications`
   - `chat_messages`
   - `bookings`
   - `profiles`

## Step 10: Configure Storage

1. Go to **Storage** → **New bucket**
2. Create buckets:
   - `avatars` (public)
   - `destinations` (public)
   - `reviews` (public)
   - `documents` (private - for tour guide verification)

3. Set storage policies (in SQL Editor):
   ```sql
   -- Public can view avatars
   CREATE POLICY "public_view_avatars" ON storage.objects
   FOR SELECT USING (bucket_id = 'avatars');

   -- Users can upload their own avatar
   CREATE POLICY "user_upload_avatar" ON storage.objects
   FOR INSERT WITH CHECK (
     bucket_id = 'avatars' AND 
     auth.uid()::text = (storage.foldername(name))[1]
   );
   ```

## Step 11: Configure Vercel Environment Variables

1. Go to your Vercel project dashboard
2. Go to **Settings** → **Environment Variables**
3. Add these variables:
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key
4. Deploy to apply changes

## Step 12: Test Connection

Create a test file `test-supabase.html`:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Test Supabase</title>
</head>
<body>
  <h1>Supabase Connection Test</h1>
  <button onclick="testConnection()">Test Connection</button>
  <div id="result"></div>

  <script type="module">
    import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

    const supabase = createClient(
      'YOUR_SUPABASE_URL',
      'YOUR_SUPABASE_ANON_KEY'
    );

    window.testConnection = async () => {
      const { data, error } = await supabase
        .from('destinations')
        .select('count')
        .single();

      const resultDiv = document.getElementById('result');
      if (error) {
        resultDiv.innerHTML = `<p style="color: red">Error: ${error.message}</p>`;
      } else {
        resultDiv.innerHTML = `<p style="color: green">Success! Found ${data.count} destinations</p>`;
      }
    };
  </script>
</body>
</html>
```

Open in browser and test.

## Troubleshooting

### "Connection refused"
- Check Supabase project is active (not paused)
- Verify URL and API key are correct
- Check network/firewall settings

### "Permission denied"
- Verify RLS policies are applied
- Check user has appropriate role
- Ensure you're authenticated

### "Realtime not working"
- Verify replication is enabled for the table
- Check you're subscribed to the correct channel
- Ensure WebSocket connection is not blocked

### "Storage upload failed"
- Check bucket exists
- Verify storage policies are applied
- Ensure file size within limits (50MB free tier)

## Next Steps

After setup is complete:

1. **Phase 2**: Implement authentication UI in frontend
2. **Phase 2**: Implement role-based access control
3. **Phase 3**: Migrate localStorage data to Supabase
4. **Phase 4**: Implement real-time features
5. **Phase 5**: Integrate payment systems

See the main implementation roadmap for details.

## Security Checklist

- [ ] Never commit `.env.local` to git
- [ ] Never expose `SUPABASE_SERVICE_ROLE_KEY` in frontend
- [ ] Use `VITE_SUPABASE_ANON_KEY` only (it's safe for public use)
- [ ] Enable 2FA on your Supabase account
- [ ] Regularly rotate API keys
- [ ] Monitor Supabase logs for suspicious activity
- [ ] Set up database backups (enabled by default)
- [ ] Configure rate limiting in Supabase dashboard

## Support

- Supabase Documentation: https://supabase.com/docs
- Supabase Discord: https://supabase.com/discord
- Smart Zambia Issues: Create issue in GitHub repository
