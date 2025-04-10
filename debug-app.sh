#!/bin/bash

echo "=== EasyKey Debug Script ==="

# Check if the packaged app exists
if [ ! -d "packages/desktop/dist/linux-unpacked" ]; then
    echo "Error: Packaged application not found. Build it first with ./simple-build.sh"
    exit 1
fi

# Examine the packaged app structure
echo "Examining packaged app structure..."
find packages/desktop/dist/linux-unpacked -type f | sort

# Check if the main HTML file exists
HTML_FILE="packages/desktop/dist/linux-unpacked/resources/app.asar/build/index.html"
echo "Checking for index.html in packaged app..."
if [ -f "$HTML_FILE" ]; then
    echo "HTML file exists in packaged app."
else
    echo "HTML file DOES NOT exist in packaged app!"
fi

# Extract the app.asar to inspect its contents
echo "Extracting app.asar for inspection..."
mkdir -p temp_asar_extract
npx asar extract packages/desktop/dist/linux-unpacked/resources/app.asar temp_asar_extract

echo "Contents of extracted app.asar:"
ls -la temp_asar_extract/
echo "Contents of build directory:"
ls -la temp_asar_extract/build/

echo "Checking if index.html includes the necessary root element:"
grep -n "root" temp_asar_extract/build/index.html

echo "Debug complete. Check the temp_asar_extract folder for the extracted app contents."
