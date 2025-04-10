#!/bin/bash

echo "=== EasyKey Final Clean Build ==="

# Navigate to project directory
cd "$(dirname "$0")"

# Clean previous builds and node_modules
echo "Cleaning previous builds and dependencies..."
rm -rf packages/desktop/build
rm -rf packages/desktop/dist
rm -rf packages/desktop/node_modules
rm -rf node_modules/.cache

# Create assets directory if it doesn't exist
mkdir -p packages/desktop/assets

# Install dependencies in desktop package only (cleaner approach)
echo "Installing dependencies..."
cd packages/desktop
yarn install

# Create build directory
mkdir -p build

# Copy Electron-related files directly (bypassing React build)
echo "Copying application files..."
cp public/electron.js build/
cp public/force-render.html build/

# Package the application
echo "Packaging the application..."
NODE_ENV=production yarn electron:package

echo "Build complete! Check the 'dist' directory for the application."
echo "Run with: ./dist/linux-unpacked/EasyKey"
