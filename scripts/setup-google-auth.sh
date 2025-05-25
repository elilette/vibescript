#!/bin/bash

# Google OAuth Setup Script for VibeScript
# This script helps you configure Google OAuth authentication

echo "🚀 VibeScript Google OAuth Setup"
echo "================================="
echo ""

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "📝 Creating .env.local file..."
    touch .env.local
    echo "# Google OAuth Configuration" >> .env.local
    echo "SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET=" >> .env.local
    echo "✅ Created .env.local file"
else
    echo "📄 .env.local file already exists"
fi

echo ""
echo "📋 Next Steps:"
echo "1. Go to Google Cloud Console: https://console.cloud.google.com/"
echo "2. Create OAuth 2.0 credentials"
echo "3. Copy your Client ID and Client Secret"
echo "4. Update the following files:"
echo ""
echo "   📁 .env.local:"
echo "   SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET=your_google_client_secret"
echo ""
echo "   📁 supabase/config.toml:"
echo "   [auth.external.google]"
echo "   enabled = true"
echo "   client_id = \"your_google_client_id\""
echo ""
echo "5. Configure Supabase Dashboard:"
echo "   - Go to Authentication > Providers"
echo "   - Enable Google provider"
echo "   - Add your Client ID and Secret"
echo ""
echo "📖 For detailed instructions, see: docs/GOOGLE_AUTH_SETUP.md"
echo ""
echo "🔧 To test your setup:"
echo "   npx supabase start"
echo "   npx expo start"
echo ""
echo "✨ Happy coding!" 
