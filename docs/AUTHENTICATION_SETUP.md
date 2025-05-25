# VibeScript Authentication Setup

This guide will help you set up Supabase authentication with Apple Sign In for the VibeScript app.

## Prerequisites

1. A Supabase project
2. Apple Developer Account (for Apple Sign In)
3. Expo development environment

## Step 1: Supabase Project Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to your project dashboard
3. Navigate to **Settings** > **API**
4. Copy your **Project URL** and **anon public** key

## Step 2: Environment Variables

Create a `.env` file in your project root with the following variables:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

Replace the placeholder values with your actual Supabase project URL and anon key.

## Step 3: Apple Sign In Configuration

### In Apple Developer Console:

1. Go to [developer.apple.com](https://developer.apple.com)
2. Navigate to **Certificates, Identifiers & Profiles**
3. Select **Identifiers** and find your app's identifier (`com.vibescript.app`)
4. Enable **Sign In with Apple** capability
5. Configure the **Sign In with Apple** settings:
   - Add your domain (if you have a website)
   - Add return URLs for your Supabase project

### In Supabase Dashboard:

1. Go to **Authentication** > **Providers**
2. Find **Apple** in the list and click **Configure**
3. Enable Apple provider
4. Add your Apple configuration:
   - **Services ID**: Your app's bundle identifier (`com.vibescript.app`)
   - **Team ID**: Your Apple Developer Team ID
   - **Key ID**: Your Apple Sign In key ID
   - **Private Key**: Your Apple Sign In private key

### Getting Apple Credentials:

1. In Apple Developer Console, go to **Keys**
2. Create a new key with **Sign In with Apple** enabled
3. Download the key file (.p8)
4. Note the Key ID
5. Use your Team ID (found in the top right of the developer console)

## Step 4: Database Schema

The app expects a `profiles` table in your Supabase database. Run this SQL in your Supabase SQL editor:

```sql
-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  email TEXT,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  total_analyses INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  average_score INTEGER DEFAULT 0,
  PRIMARY KEY (id)
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policy for users to read their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Create policy for users to update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Create policy for users to insert their own profile
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
```

## Step 5: URL Scheme Configuration

The app is configured with the URL scheme `com.vibescript.app`. This is already set up in:

- `app.json` (scheme and iOS configuration)
- `AuthContext.tsx` (redirect URL generation)

## Step 6: Testing

1. Start your Expo development server: `npm start`
2. Run on iOS simulator or device
3. Test the Apple Sign In flow
4. Check that user profiles are created in your Supabase database

## Troubleshooting

### Common Issues:

1. **"Invalid redirect URL"**: Make sure your Supabase Apple provider configuration includes the correct redirect URLs
2. **"Apple Sign In not available"**: Ensure you're testing on iOS and have enabled Apple Sign In in your Apple Developer account
3. **Database errors**: Check that your `profiles` table exists and has the correct RLS policies

### Debug Tips:

1. Check the Expo logs for authentication errors
2. Monitor your Supabase dashboard for authentication events
3. Verify your environment variables are loaded correctly
4. Test the authentication flow in the Supabase dashboard

## Security Notes

- Never commit your `.env` file to version control
- Keep your Apple private key secure
- Regularly rotate your API keys
- Monitor authentication logs for suspicious activity

## Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Apple Sign In Documentation](https://developer.apple.com/sign-in-with-apple/)
- [Expo AuthSession Documentation](https://docs.expo.dev/versions/latest/sdk/auth-session/)
