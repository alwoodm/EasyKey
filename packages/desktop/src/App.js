import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [error, setError] = useState(null);

  useEffect(() => {
    // Log that the component has mounted
    console.log("App component mounted successfully");
  }, []);

  // Function to generate a random password
  const generatePassword = () => {
    try {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
      let password = "";
      for (let i = 0; i < 12; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      alert(`Generated password: ${password}`);
      return password;
    } catch (err) {
      console.error("Password generation error:", err);
      setError(err.message);
      return null;
    }
  };

  // If there's an error, show it
  if (error) {
    return (
      <div className="App" style={{ color: 'red', padding: '20px' }}>
        <h1>Error:</h1>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>EasyKey Password Generator</h1>
        <p>Simple and secure password generation</p>
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
