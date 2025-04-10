const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  // Create browser window
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      devTools: true
    }
  });

  // Load direct HTML file
  const htmlPath = path.join(__dirname, 'direct-test.html');
  console.log('Loading HTML from:', htmlPath);
  
  mainWindow.loadFile(htmlPath);
  
  // Always open DevTools for testing
  mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
  createWindow();
  
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
