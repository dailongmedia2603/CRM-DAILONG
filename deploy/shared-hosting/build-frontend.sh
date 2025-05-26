#!/bin/bash

# CRM Frontend Build Script for Shared Hosting
# This script builds the React frontend for production deployment

echo "🚀 Building CRM Frontend for Production..."

# Set production environment
export NODE_ENV=production
export REACT_APP_BACKEND_URL=https://crm-backend-vuaseeding.up.railway.app

# Navigate to frontend directory
cd "$(dirname "$0")/../../frontend" || exit 1

echo "📦 Installing dependencies..."
yarn install --frozen-lockfile

echo "🔨 Building production bundle..."
yarn build

# Copy build files to shared hosting deployment directory
echo "📋 Copying files to deployment directory..."
DEPLOY_DIR="../deploy/shared-hosting/build"
rm -rf "$DEPLOY_DIR"
mkdir -p "$DEPLOY_DIR"

cp -r build/* "$DEPLOY_DIR/"

# Update index.html with correct paths
echo "🔧 Updating asset paths..."
sed -i 's|/static/|static/|g' "$DEPLOY_DIR/index.html"

# Create upload directory
mkdir -p "$DEPLOY_DIR/uploads"

echo "✅ Frontend build completed!"
echo "📁 Files ready in: $DEPLOY_DIR"
echo "🌐 Ready for upload to: crm.vuaseeding.top"

# Show deployment instructions
echo ""
echo "📖 NEXT STEPS:"
echo "1. Upload all files from '$DEPLOY_DIR' to your shared hosting public_html/"
echo "2. Upload .htaccess, api-proxy.php, config.php, install.php"
echo "3. Visit https://crm.vuaseeding.top/install.php"
echo "4. Follow the installation wizard"