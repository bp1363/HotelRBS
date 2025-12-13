#!/bin/bash

# Script to create .env file for Telr configuration

echo "🔧 Creating backend/.env file for Telr Payment Gateway"
echo ""

# Check if .env already exists
if [ -f ".env" ]; then
    echo "⚠️  .env file already exists!"
    read -p "Do you want to overwrite it? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Cancelled. Keeping existing .env file."
        exit 1
    fi
fi

echo "📝 Please enter your Telr credentials:"
echo ""

# Prompt for Test Store ID
read -p "Test Store ID: " test_store_id

# Prompt for Test Auth Key
read -p "Test Auth Key: " test_auth_key

# Create .env file
cat > .env << EOF
# Telr Payment Gateway Configuration
# Generated on $(date)

# Test/Sandbox Credentials
TELR_TEST_STORE_ID=$test_store_id
TELR_TEST_AUTH_KEY=$test_auth_key

# Live/Production Credentials (leave empty for now)
TELR_LIVE_STORE_ID=
TELR_LIVE_AUTH_KEY=

# Mode (true = test, false = live)
TELR_USE_TEST_MODE=true
EOF

echo ""
echo "✅ .env file created successfully!"
echo ""
echo "📄 Contents:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
cat .env
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🚀 Next steps:"
echo "  1. Restart backend: python3 app.py"
echo "  2. Test payment flow in browser"
echo ""
echo "✨ Done!"

