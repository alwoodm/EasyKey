#!/bin/bash

echo "=== EasyKey Ultra Simple Build ==="

# Navigate to project directory
cd "$(dirname "$0")"

# Clean previous build
rm -rf packages/desktop/dist
mkdir -p packages/desktop/build

# Copy the simple HTML file to build directory
cp packages/desktop/public/force-render.html packages/desktop/build/index.html
cp packages/desktop/public/electron.js packages/desktop/build/

# Package the application
cd packages/desktop
yarn electron:package

echo "Build complete!"
echo "Run the app with: ./dist/linux-unpacked/EasyKey"
