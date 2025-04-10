#!/bin/bash

echo "Cleaning Electron installation..."
rm -rf node_modules/electron
rm -rf packages/desktop/node_modules/electron

echo "Installing dependencies..."
yarn install

echo "Rebuilding Electron..."
cd packages/desktop
yarn postinstall

echo "Done! Try running the app now."
