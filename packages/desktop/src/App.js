import React, { useState, useEffect } from 'react';
import './App.css';
import * as translations from './translations';

function App() {
  // State for password and its parameters
  const [password, setPassword] = useState("");
  const [passwordLength, setPasswordLength] = useState(16);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  
  // State for UI controls
  const [darkMode, setDarkMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [mode, setMode] = useState('simple'); // 'simple' or 'creative'
  const [copied, setCopied] = useState(false);
  const [generatorError, setGeneratorError] = useState(null);
  const [language, setLanguage] = useState(translations.defaultLanguage);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  
  // Get correct translation object
  const t = translations[language] || translations.en;

  // Check system dark mode preference and browser language
  useEffect(() => {
    // Check for dark mode preference
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(prefersDark);
    
    // Check for browser language
    const browserLang = navigator.language.split('-')[0];
    if (translations[browserLang]) {
      setLanguage(browserLang);
    }
    
    // Generate an initial password
    generatePassword();
  }, []);

  // Apply dark mode to document
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  const toggleMode = (newMode) => {
    setMode(newMode);
    if (newMode === 'simple') {
      generatePassword();
    }
  };

  const changeLanguage = (langCode) => {
    setLanguage(langCode);
    setShowLanguageMenu(false);
  };

  const generatePassword = () => {
    try {
      setGeneratorError(null);
      
      // Validate that at least one character type is selected
      if (!includeUppercase && !includeLowercase && !includeNumbers && !includeSymbols) {
        setGeneratorError(t.errorSelectType);
        return;
      }

      // Build character set based on options
      let charset = "";
      if (includeUppercase) charset += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      if (includeLowercase) charset += "abcdefghijklmnopqrstuvwxyz";
      if (includeNumbers) charset += "0123456789";
      if (includeSymbols) charset += "!@#$%^&*()_+[]{}|;:,.<>?";

      // Generate password
      let newPassword = "";
      for (let i = 0; i < passwordLength; i++) {
        newPassword += charset.charAt(Math.floor(Math.random() * charset.length));
      }

      setPassword(newPassword);
    } catch (err) {
      console.error("Password generation error:", err);
      setGeneratorError(err.message || "Error generating password");
    }
  };

  const copyToClipboard = () => {
    if (password) {
      navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset copied state after 2 seconds
    }
  };

  // Close language menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (showLanguageMenu && !event.target.closest('.language-selector-container')) {
        setShowLanguageMenu(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showLanguageMenu]);

  return (
    <div className={`app-container ${darkMode ? 'dark' : 'light'}`}>
      <div className="app-header">
        <div className="logo-container">
          <h1>{t.appName}</h1>
        </div>
        <div className="header-controls">
          <div className="language-selector-container">
            <button 
              className="language-button"
              onClick={() => setShowLanguageMenu(!showLanguageMenu)}
            >
              {translations.languages[language].flag} {translations.languages[language].name}
              <span className="dropdown-arrow">▼</span>
            </button>
            
            {showLanguageMenu && (
              <div className="language-menu">
                {Object.entries(translations.languages).map(([code, { name, flag }]) => (
                  <button
                    key={code}
                    className={`language-option ${language === code ? 'active' : ''}`}
                    onClick={() => changeLanguage(code)}
                  >
                    <span className="language-flag">{flag}</span> {name}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <button 
            className="theme-toggle" 
            onClick={toggleTheme} 
            aria-label="Toggle theme"
          >
            {darkMode ? "☀️" : "🌙"}
          </button>
        </div>
      </div>

      <div className="tabs">
        <button 
          className={`tab ${mode === 'simple' ? 'active' : ''}`} 
          onClick={() => toggleMode('simple')}
        >
          {t.simpleGenerator}
        </button>
        <button 
          className={`tab ${mode === 'creative' ? 'active' : ''}`} 
          onClick={() => toggleMode('creative')}
        >
          {t.creativeMode}
        </button>
      </div>

      {mode === 'simple' ? (
        <div className="generator-container">
          <div className="password-display">
            <input 
              type="text" 
              value={password} 
              readOnly 
              placeholder={t.passwordPlaceholder}
            />
            <button 
              className={`copy-button ${copied ? 'copied' : ''}`} 
              onClick={copyToClipboard}
              disabled={!password}
            >
              {copied ? t.copied : '📋'}
            </button>
          </div>

          {generatorError && <p className="error-message">{generatorError}</p>}

          <div className="controls">
            <button className="generate-button" onClick={generatePassword}>
              🔄 {t.generatePassword}
            </button>
            
            <button 
              className="settings-button" 
              onClick={() => setShowSettings(!showSettings)}
            >
              ⚙️ {showSettings ? t.hideOptions : t.showOptions}
            </button>
          </div>

          {showSettings && (
            <div className="settings-panel">
              <div className="setting-group">
                <label>{t.passwordLength}: {passwordLength}</label>
                <div className="slider-container">
                  <span className="slider-label">4</span>
                  <input
                    type="range"
                    min="4"
                    max="64"
                    value={passwordLength}
                    onChange={(e) => setPasswordLength(parseInt(e.target.value))}
                    className="slider"
                  />
                  <span className="slider-label">64</span>
                </div>
              </div>

              <div className="checkbox-group">
                <div className="checkbox-item">
                  <input
                    type="checkbox"
                    id="uppercase"
                    checked={includeUppercase}
                    onChange={() => setIncludeUppercase(!includeUppercase)}
                  />
                  <label htmlFor="uppercase">{t.uppercase}</label>
                </div>
                
                <div className="checkbox-item">
                  <input
                    type="checkbox"
                    id="lowercase"
                    checked={includeLowercase}
                    onChange={() => setIncludeLowercase(!includeLowercase)}
                  />
                  <label htmlFor="lowercase">{t.lowercase}</label>
                </div>
                
                <div className="checkbox-item">
                  <input
                    type="checkbox"
                    id="numbers"
                    checked={includeNumbers}
                    onChange={() => setIncludeNumbers(!includeNumbers)}
                  />
                  <label htmlFor="numbers">{t.numbers}</label>
                </div>
                
                <div className="checkbox-item">
                  <input
                    type="checkbox"
                    id="symbols"
                    checked={includeSymbols}
                    onChange={() => setIncludeSymbols(!includeSymbols)}
                  />
                  <label htmlFor="symbols">{t.symbols}</label>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="creative-container">
          <div className="coming-soon">
            <h2>{t.creativeModeTitle}</h2>
            <p>{t.creativeModeDescription}</p>
          </div>
        </div>
      )}

      <div className="footer">
        <p>{t.footer}</p>
      </div>
    </div>
  );
}

export default App;
