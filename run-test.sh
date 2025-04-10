#!/bin/bash

echo "=== EasyKey Ultra Simple Test ==="

# Navigate to project directory
cd "$(dirname "$0")"

# Run directly with electron
echo "Running direct test with Electron..."
npx electron test-electron.js

echo "Test complete."
