const { app, BrowserWindow, Menu, shell } = require('electron');
const path = require('path');
const fs = require('fs');

// More reliable environment detection
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

function createWindow() {
  // Create browser window
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    title: "EasyKey",
    backgroundColor: '#282c34', // Set background color to match the HTML
    show: false, // Don't show until content is loaded
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false // Disable web security for local content
    }
  });

  // Load app
  let appPath;
  let forceRenderPath = '';
  
  if (isDev) {
    // In development, load from dev server
    appPath = 'http://localhost:3000';
  } else {
    // In production, try multiple paths to find a working HTML file
    const indexPath = path.join(__dirname, './index.html');
    const forcePath = path.join(__dirname, './force-render.html');
    
    try {
      if (fs.existsSync(forcePath)) {
        appPath = `file://${forcePath}`;
        forceRenderPath = forcePath;
        console.log('Force render HTML found at:', forcePath);
      } else if (fs.existsSync(indexPath)) {
        appPath = `file://${indexPath}`;
        console.log('Index HTML found at:', indexPath);
      } else {
        console.log('No HTML file found in:', __dirname);
        console.log('Directory contents:', fs.readdirSync(__dirname));
        
        // Create a simple HTML page directly
        const tempPath = path.join(app.getPath('temp'), 'easykey-fallback.html');
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
              console.log('Fallback script running');
            </script>
          </body>
          </html>
        `;
        
        fs.writeFileSync(tempPath, htmlContent);
        appPath = `file://${tempPath}`;
      }
    } catch (err) {
      console.error('Error finding HTML files:', err);
      appPath = `data:text/html,<html><body style="background: #282c34; color: white; font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh;"><h1 style="color: #4CAF50;">EasyKey</h1><p>Error loading content: ${err.message}</p></body></html>`;
    }
  }
  
  console.log(`Loading app from: ${appPath}`);
  console.log(`isDev: ${isDev}, isPackaged: ${app.isPackaged}`);
  console.log(`Current directory: ${__dirname}`);

  // Print content of force-render.html for debugging
  if (forceRenderPath && fs.existsSync(forceRenderPath)) {
    try {
      console.log('First 100 characters of force-render.html:');
      const content = fs.readFileSync(forceRenderPath, 'utf8');
      console.log(content.substring(0, 100) + '...');
    } catch (err) {
      console.error('Error reading force-render.html:', err);
    }
  }
  
  // Load the URL
  mainWindow.loadURL(appPath).catch(err => {
    console.error('Failed to load URL:', err);
    mainWindow.loadURL(`data:text/html,<html><body style="background: #282c34; color: white; font-family: sans-serif; text-align: center; padding-top: 100px;"><h1 style="color: #4CAF50;">EasyKey Error</h1><p>${err.message}</p></body></html>`);
  });

  // Show window when content is ready to prevent flashing
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Handle errors
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Page failed to load:', errorCode, errorDescription);
    mainWindow.loadURL(`data:text/html,<html><body style="background: #282c34; color: white; font-family: sans-serif; text-align: center; padding-top: 100px;"><h1 style="color: #4CAF50;">EasyKey Error</h1><p>Failed to load: ${errorDescription}</p></body></html>`);
  });

  // Set application name
  app.setName("EasyKey");
  mainWindow.setTitle("EasyKey");

  // Forcefully hide menu bar in production
  mainWindow.setMenuBarVisibility(isDev);
  if (!isDev) {
    Menu.setApplicationMenu(null);
  }

  // Open developer tools only in dev mode
  if (isDev) {
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  }

  // Open links in external browser
  mainWindow.webContents.on('new-window', (event, url) => {
    event.preventDefault();
    shell.openExternal(url);
  });
}

// When Electron is ready, create window
app.whenReady().then(createWindow);

// Close app when all windows are closed (Windows & Linux)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS, re-create the application window when clicking on its dock icon
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
