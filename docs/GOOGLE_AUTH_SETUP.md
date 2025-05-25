# Google OAuth Setup Guide for VibeScript

This guide will walk you through setting up Google OAuth authentication for your VibeScript app using Supabase.

## Prerequisites

- Google Cloud Console account
- Supabase project
- VibeScript app with Supabase configured

## Step 1: Create Google OAuth Credentials

### 1.1 Go to Google Cloud Console

1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API (if not already enabled)

### 1.2 Configure OAuth Consent Screen

1. Go to **APIs & Services** > **OAuth consent screen**
2. Choose **External** user type (unless you have a Google Workspace)
3. Fill in the required information:
   - **App name**: VibeScript
   - **User support email**: Your email
   - **Developer contact information**: Your email
4. Add scopes (optional for basic auth):
   - `../auth/userinfo.email`
   - `../auth/userinfo.profile`
5. Save and continue

### 1.3 Create OAuth 2.0 Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **+ CREATE CREDENTIALS** > **OAuth 2.0 Client IDs**
3. Choose **Application type**:
   - For development: **Web application**
   - For production mobile: **iOS** and **Android** (separate credentials)

#### For Web Application (Development):

- **Name**: VibeScript Web Client
- **Authorized JavaScript origins**:
  - `http://localhost:54321` (Supabase local)
  - Your Supabase project URL: `https://your-project-ref.supabase.co`
- **Authorized redirect URIs**:
  - `http://localhost:54321/auth/v1/callback`
  - `https://your-project-ref.supabase.co/auth/v1/callback`

#### For Mobile Application (Production):

- **Name**: VibeScript Mobile Client
- **Bundle ID** (iOS): `com.vibescript.app`
- **Package name** (Android): `com.vibescript.app`

## Step 2: Configure Supabase

### 2.1 Update Local Configuration

The Google OAuth configuration has already been added to your `supabase/config.toml`:

```toml
[auth.external.google]
enabled = false
client_id = ""
secret = "env(SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET)"
redirect_uri = ""
url = ""
skip_nonce_check = false
```

### 2.2 Set Environment Variables

Create a `.env.local` file in your project root (if it doesn't exist):

```bash
# Google OAuth
SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET=your_google_client_secret_here
```

### 2.3 Enable Google Auth in Local Config

Update your `supabase/config.toml`:

```toml
[auth.external.google]
enabled = true
client_id = "your_google_client_id_here"
secret = "env(SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET)"
redirect_uri = ""
url = ""
skip_nonce_check = false
```

## Step 3: Configure Production Supabase

### 3.1 Supabase Dashboard

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Authentication** > **Providers**
4. Find **Google** and click **Configure**

### 3.2 Add Google Credentials

1. **Enable Google provider**: Toggle ON
2. **Client ID**: Paste your Google OAuth Client ID
3. **Client Secret**: Paste your Google OAuth Client Secret
4. **Redirect URL**: Should be auto-filled as `https://your-project-ref.supabase.co/auth/v1/callback`
5. Click **Save**

### 3.3 Configure Redirect URLs

In **Authentication** → **URL Configuration**, add these to **Redirect URLs**:

```
com.vibescript.app://auth/callback
https://yskhbyggmblznwofjrnm.supabase.co/auth/v1/callback
```

## Step 4: Update App Configuration

### 4.1 Update Redirect URI in app.json

Make sure your `app.json` has the correct scheme:

```json
{
  "expo": {
    "scheme": "com.vibescript.app",
    "ios": {
      "bundleIdentifier": "com.vibescript.app"
    },
    "android": {
      "package": "com.vibescript.app"
    }
  }
}
```

### 4.2 Test the Implementation

The Google sign-in functionality is already implemented in your app:

- `AuthContext.tsx` has the `signInWithGoogle` method
- `LoginScreen.tsx` has the Google sign-in button

## Step 5: Testing

### 5.1 Local Development

1. Start your Supabase local development:

   ```bash
   npx supabase start
   ```

2. Start your Expo development server:

   ```bash
   npx expo start
   ```

3. Test Google sign-in on your device/simulator

### 5.2 Production Testing

1. Deploy your Supabase configuration
2. Build and test your app with production Supabase credentials

## Troubleshooting

### Common Issues:

1. **"OAuth client not found"**

   - Check that your Client ID is correct in both Google Console and Supabase
   - Ensure the redirect URI matches exactly

2. **"redirect_uri_mismatch"**

   - Verify redirect URIs in Google Console match your Supabase URLs
   - Check for trailing slashes or protocol mismatches

3. **"Access blocked"**

   - Ensure your OAuth consent screen is properly configured
   - Check that your app is not in testing mode with restricted users

4. **Mobile app issues**
   - Ensure bundle ID/package name matches in Google Console and app.json
   - For iOS, you may need additional configuration for custom URL schemes

### Environment Variables:

Make sure these are set correctly:

- `SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET` in your environment
- Google Client ID in your Supabase config

## Security Notes

- Never commit your Google Client Secret to version control
- Use environment variables for sensitive data
- Regularly rotate your OAuth credentials
- Monitor your Google Cloud Console for unusual activity

## Next Steps

After successful setup:

1. Test both Apple and Google sign-in flows
2. Implement user profile management
3. Add proper error handling for edge cases
4. Consider adding additional OAuth providers if needed

---

For more information, refer to:

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Expo AuthSession Documentation](https://docs.expo.dev/versions/latest/sdk/auth-session/)
