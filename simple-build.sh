#!/bin/bash

echo "=== EasyKey Simple Linux Build ==="

# Navigate to project directory
cd "$(dirname "$0")"

# Clean everything
echo "Cleaning everything..."
rm -rf packages/desktop/build packages/desktop/dist packages/desktop/node_modules
yarn cache clean

# Install dependencies
echo "Installing dependencies..."
cd packages/desktop
yarn install

# Build application
echo "Building React app..."
yarn build

# Copy electron.js to build directory
echo "Copying electron.js..."
cp public/electron.js build/

# Package application - Linux only
echo "Packaging with Electron (Linux only)..."
yarn electron:package
yarn electron:make

echo "Build complete!"
echo "Check packages/desktop/dist for the application."
echo "You can run the app with: ./dist/linux-unpacked/EasyKey"
