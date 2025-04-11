# EasyKey - Password Generator

EasyKey is a modern, responsive password generator application built with React. It helps users create secure passwords with customizable options.

## Features

- **Password Generator with Customizable Options**:
  - Adjustable password length
  - Include/exclude uppercase letters, lowercase letters, numbers, and symbols
  - One-click copy to clipboard functionality
  - Password strength indicator

- **Multilingual Support**:
  - English language interface
  - Polish language interface
  - German language interface
  - French language interface
  - Spanish language interface
  - Automatically detects browser language
  - Easily expandable to other languages

- **Responsive Design**:
  - Works on mobile devices, tablets, and desktops
  - Adaptive layout for different screen sizes
  - Smooth mode switching with tabs on mobile devices
  - Centered content for better readability
  - Fully optimized touch interface

- **Theme Support**:
  - Automatic theme based on system preferences
  - Manual toggle between light and dark modes via a floating button
  - Theme preference is saved between sessions
  - Smooth transition animations

## Technical Details

This project was built with:
- React
- Tailwind CSS for styling
- Modern JavaScript features
- SVG icons for optimal display quality
- LocalStorage for saving user preferences

## Development Setup

### Prerequisites

- Node.js (version 14.x or higher recommended)
- npm or yarn package manager

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/easykey.git
   cd easykey
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

The application should now be running at [http://localhost:3000](http://localhost:3000).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

### `npm test`

Launches the test runner in interactive watch mode.

### `npm run build`

Builds the app for production to the `build` folder.

## Adding New Languages

To add a new language to EasyKey:

1. Add the new language object to `translations.js`
2. Add flag SVG for the language in the `FlagSVGs` object in `App.js`
3. Add the language name to the `getLanguageName` function in `App.js`
4. Add the language selector button to the dropdown menu

## Future Plans

- Password history and saved passwords
- Export/import password functionality
- Additional languages support
- Additional customization options
- Password sharing capabilities
- Progressive Web App (PWA) implementation

## License

This project is licensed under the MIT License - see the LICENSE file for details.
