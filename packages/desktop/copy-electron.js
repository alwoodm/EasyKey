const fs = require('fs');
const path = require('path');

// Make sure build directory exists
const buildDir = path.join(__dirname, 'build');
if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir, { recursive: true });
}

// Copy the electron.js file from public to build with proper modifications
const source = path.join(__dirname, 'public', 'electron.js');
const destination = path.join(__dirname, 'build', 'electron.js');

// Read the source file
let electronCode = fs.readFileSync(source, 'utf8');

// Make sure path to index.html is correct in production
electronCode = electronCode.replace(
  `file://${path.join(__dirname, '../build/index.html')}`,
  `file://${path.join(__dirname, './index.html')}`
);

// Write the updated electron.js to build directory
fs.writeFileSync(destination, electronCode);
console.log('Electron.js has been copied to the build directory with proper path config');
