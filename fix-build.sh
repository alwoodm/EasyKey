#!/bin/bash

echo "=== EasyKey Fix and Rebuild ==="

# Navigate to project directory
cd "$(dirname "$0")"

# Clean previous builds and cache
echo "Cleaning previous builds..."
rm -rf packages/desktop/build packages/desktop/dist
rm -rf packages/desktop/node_modules/.cache
rm -rf node_modules/.cache

# Remove tailwind and related CSS tools
echo "Removing problematic dependencies..."
cd packages/desktop
yarn remove tailwindcss postcss autoprefixer
cd ../..

# Remove tailwind configuration files
rm -f packages/desktop/tailwind.config.js
rm -f packages/desktop/postcss.config.js

# Install regular dependencies
echo "Installing dependencies..."
yarn install

# Prepare electron.js for production
echo "Preparing electron.js..."
node packages/desktop/copy-electron.js

# Build desktop app with NODE_ENV explicitly set to production
echo "Building application..."
cd packages/desktop
yarn build
yarn electron:build

echo "Build complete! The app is available at packages/desktop/dist/"
echo "Run the app with: cd packages/desktop/dist && ./EasyKey-1.0.0.AppImage"
