# EasyKey - Cross-platform Password Generator

EasyKey is an application for generating secure, random passwords, available on mobile platforms (iOS, Android) and desktop platforms (Windows, macOS, Linux).

## Technologies

- **Mobile (iOS, Android)**: React Native with Expo
- **Desktop (Windows, macOS, Linux)**: React with Electron
- **Shared code**: Library of common components and logic

## Project Structure

```
EasyKey/
├── packages/
│   ├── mobile/       # React Native (Expo) application
│   ├── desktop/      # Electron application with React
│   └── shared/       # Shared code
```

## Installation and Running

### Prerequisites
- Node.js (version 16 or higher)
- Yarn
- Expo CLI (for mobile version)

### Installing Dependencies
```bash
yarn install
```

### Running the Mobile Application
```bash
cd packages/mobile
yarn start
```

### Running the Desktop Application
```bash
cd packages/desktop
yarn electron:start
```

### Building the Desktop Application
```bash
cd packages/desktop
yarn electron:build
```

## Troubleshooting

### Common Issues

#### Issue: Expo CLI not found
**Solution**: Ensure that Expo CLI is installed globally by running:
```bash
npm install -g expo-cli
```

#### Issue: Electron not starting
**Solution**: Ensure that all dependencies are installed correctly by running:
```bash
yarn install
```
If the issue persists, try deleting the `node_modules` folder and reinstalling dependencies:
```bash
rm -rf node_modules
yarn install
```

#### Issue: Electron build failing
**Solution**: Ensure that you have the necessary build tools installed. On Windows, you may need to install additional dependencies:
```bash
npm install --global --production windows-build-tools
```
On macOS, ensure that Xcode Command Line Tools are installed:
```bash
xcode-select --install
```