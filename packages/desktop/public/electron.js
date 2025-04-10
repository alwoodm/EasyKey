const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
const fs = require('fs');

// More reliable environment detection
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

function createWindow() {
  // Create browser window
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // Load React app
  const appPath = app.isPackaged 
    ? path.join(__dirname, './index.html')
    : 'http://localhost:3000';
  
  console.log(`Loading app from: ${appPath}`);
  console.log(`isDev: ${isDev}, isPackaged: ${app.isPackaged}`);
  
  mainWindow.loadURL(appPath);

  // Forcefully hide menu bar in production
  mainWindow.setMenuBarVisibility(isDev);
  if (!isDev) {
    Menu.setApplicationMenu(null);
  }

  // Open developer tools only in dev mode
  if (isDev) {
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  }
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
