#!/bin/bash

# Navigate to project directory
cd "$(dirname "$0")"

# Create assets directory if it doesn't exist
mkdir -p packages/desktop/assets

# Install dependencies
yarn install 

# Build desktop app
yarn build:desktop

echo "Build complete! Check packages/desktop/dist for the application package."
