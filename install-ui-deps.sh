#!/bin/bash

echo "=== Installing UI Dependencies ==="

# Navigate to desktop package
cd "$(dirname "$0")/packages/desktop"

# Install Feather Icons directly to the desktop package
echo "Installing React Feather Icons..."
yarn add react-feather

# Update App.js to use a default UI first to test integration
echo "Creating basic App.js implementation..."
cat > src/App.js << 'EOF'
import React, { useState } from 'react';
import './App.css';

function App() {
  const [password, setPassword] = useState("");
  
  const generatePassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let newPassword = "";
    for (let i = 0; i < 12; i++) {
      newPassword += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(newPassword);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>EasyKey Password Generator</h1>
        <p>Simple and secure password generation</p>
        <div style={{margin: '20px', padding: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px'}}>
          {password || "Your password will appear here"}
        </div>
        <button 
          onClick={generatePassword}
          style={{
            backgroundColor: '#4CAF50',
            border: 'none',
            color: 'white',
            padding: '15px 32px',
            textAlign: 'center',
            fontSize: '16px',
            margin: '20px',
            cursor: 'pointer',
            borderRadius: '4px',
          }}
        >
          Generate Password
        </button>
      </header>
    </div>
  );
}

export default App;
EOF

# Create a basic CSS file
cat > src/App.css << 'EOF'
.App {
  text-align: center;
}

.App-header {
  background-color: #282c34;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: calc(10px + 2vmin);
  color: white;
}

button:hover {
  opacity: 0.9;
}
EOF

echo "Dependencies installed successfully!"
echo "Run 'cd packages/desktop && yarn electron:start' to test the basic UI"
echo "After verifying this works, use the full UI implementation"
