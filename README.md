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