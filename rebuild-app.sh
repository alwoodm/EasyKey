#!/bin/bash

echo "=== EasyKey Complete Rebuild ==="

# Navigate to project directory
cd "$(dirname "$0")"

# Clean previous builds
echo "Cleaning previous builds..."
rm -rf packages/desktop/build packages/desktop/dist
rm -rf node_modules/.cache

# Clean existing TailwindCSS installations to avoid conflicts
echo "Cleaning up Tailwind dependencies..."
cd packages/desktop
yarn remove tailwindcss postcss autoprefixer
cd ../..

# Install dependencies
echo "Installing dependencies..."
yarn install

# Install specific versions of Tailwind dependencies for desktop
echo "Setting up Tailwind CSS..."
cd packages/desktop
yarn add -D tailwindcss@3.3.3 postcss@8.4.27 autoprefixer@10.4.14
cd ../..

# Prepare electron.js for production
echo "Preparing electron.js..."
node packages/desktop/copy-electron.js

# Build desktop app with NODE_ENV explicitly set to production
echo "Building application..."
NODE_ENV=production yarn build:desktop

echo "Build complete! The app is available at packages/desktop/dist/"
echo "Run the app with: cd packages/desktop/dist && ./EasyKey-1.0.0.AppImage"
