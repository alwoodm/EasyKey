#!/bin/bash

echo "Building EasyKey Desktop Application..."

# Navigate to project directory
cd "$(dirname "$0")"

# Create assets directory if it doesn't exist
mkdir -p packages/desktop/assets

# Clean previous builds
rm -rf packages/desktop/build packages/desktop/dist

# Install dependencies
echo "Installing dependencies..."
yarn install

# Prepare electron.js for production
echo "Preparing electron.js..."
node packages/desktop/copy-electron.js

# Build desktop app with NODE_ENV explicitly set to production
echo "Building application..."
NODE_ENV=production yarn build:desktop

echo "Build complete! Check packages/desktop/dist for the application package."
