const { spawn } = require('child_process');
const path = require('path');

console.log('Starting application with debugging enabled...');

// Path to packaged Electron application
const appPath = path.join(__dirname, 'dist', 'linux-unpacked', 'EasyKey');

// Environment variables for debugging
const env = Object.assign({}, process.env, {
  ELECTRON_ENABLE_LOGGING: 1,
  ELECTRON_ENABLE_STACK_DUMPING: 1,
  NODE_ENV: 'development'
});

// Launch the application
const electronProcess = spawn(appPath, [], { env });

// Output stdout
electronProcess.stdout.on('data', (data) => {
  console.log(`stdout: ${data}`);
});

// Output stderr
electronProcess.stderr.on('data', (data) => {
  console.error(`stderr: ${data}`);
});

// Handle process exit
electronProcess.on('exit', (code) => {
  console.log(`Child process exited with code ${code}`);
});
