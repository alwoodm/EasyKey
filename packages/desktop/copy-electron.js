const fs = require('fs');
const path = require('path');

// Make sure build directory exists
const buildDir = path.join(__dirname, 'build');
if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir, { recursive: true });
}

// Copy the electron.js file from public to build
const source = path.join(__dirname, 'public', 'electron.js');
const destination = path.join(__dirname, 'build', 'electron.js');

fs.copyFileSync(source, destination);
console.log('Electron.js has been copied to the build directory');
