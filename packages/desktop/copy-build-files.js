const fs = require('fs');
const path = require('path');

console.log('Starting copy-build-files.js script...');

// Make sure build directory exists
const buildDir = path.join(__dirname, 'build');
if (!fs.existsSync(buildDir)) {
  console.log('Creating build directory...');
  fs.mkdirSync(buildDir, { recursive: true });
}

// Copy electron.js to build directory
const electronSource = path.join(__dirname, 'public', 'electron.js');
const electronDest = path.join(buildDir, 'electron.js');

console.log(`Copying electron.js from ${electronSource} to ${electronDest}`);

try {
  fs.copyFileSync(electronSource, electronDest);
  console.log('Electron.js has been successfully copied');
} catch (error) {
  console.error('Error copying electron.js:', error);
  process.exit(1);
}

// Copy force-render.html to build directory
const htmlSource = path.join(__dirname, 'public', 'force-render.html');
const htmlDest = path.join(buildDir, 'force-render.html');

console.log(`Copying force-render.html from ${htmlSource} to ${htmlDest}`);

try {
  if (fs.existsSync(htmlSource)) {
    fs.copyFileSync(htmlSource, htmlDest);
    console.log('force-render.html has been successfully copied');
  } else {
    console.log('Creating force-render.html in build directory');
    
    // Create a basic HTML file with the password generator
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>EasyKey</title>
        <style>
          body {
            background-color: #282c34;
            color: white;
            font-family: sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
            padding: 20px;
            text-align: center;
          }
          h1 { color: #4CAF50; }
          button {
            background-color: #4CAF50;
            color: white;
            border: none;
            padding: 15px 32px;
            font-size: 16px;
            margin: 20px;
            cursor: pointer;
            border-radius: 4px;
          }
        </style>
      </head>
      <body>
        <h1>EasyKey Password Generator</h1>
        <p>Simple and secure password generation</p>
        <button onclick="generatePassword()">Generate Password</button>
        <script>
          function generatePassword() {
            const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
            let password = "";
            for (let i = 0; i < 12; i++) {
              password += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            alert('Generated password: ' + password);
          }
        </script>
      </body>
      </html>
    `;
    
    fs.writeFileSync(htmlDest, htmlContent);
  }
} catch (error) {
  console.error('Error with force-render.html:', error);
  process.exit(1);
}

console.log('All files copied successfully');
