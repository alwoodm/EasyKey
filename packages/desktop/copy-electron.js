const fs = require('fs');
const path = require('path');

console.log('Starting copy-electron.js script...');

// Make sure build directory exists
const buildDir = path.join(__dirname, 'build');
if (!fs.existsSync(buildDir)) {
  console.log('Creating build directory...');
  fs.mkdirSync(buildDir, { recursive: true });
}

// Copy the electron.js file from public to build
const source = path.join(__dirname, 'public', 'electron.js');
const destination = path.join(__dirname, 'build', 'electron.js');

console.log(`Copying from ${source} to ${destination}`);

// Check if source exists
if (!fs.existsSync(source)) {
  console.error('Source file does not exist!');
  process.exit(1);
}

try {
  fs.copyFileSync(source, destination);
  console.log('Electron.js has been successfully copied to the build directory');
} catch (error) {
  console.error('Error copying file:', error);
  process.exit(1);
}

// Also create a test.txt file in the build directory to verify it's accessible
fs.writeFileSync(path.join(buildDir, 'test.txt'), 'This is a test file to verify the build directory is accessible.');
console.log('Created test.txt in build directory');
