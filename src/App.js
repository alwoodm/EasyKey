import { useState, useEffect } from 'react';
import './App.css';
import translations, { getActiveLanguage, getTranslations } from './translations';

// Icons for better UI - would be replaced with actual SVG icons in a real app
const Icons = {
  copy: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
      <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
    </svg>
  ),
  sun: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
    </svg>
  ),
  moon: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
    </svg>
  ),
  auto: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 2a6 6 0 100 12A6 6 0 0010 4z" clipRule="evenodd" />
      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
    </svg>
  ),
  settings: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
    </svg>
  ),
  check: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
  )
};

function App() {
  const [language, setLanguage] = useState(getActiveLanguage());
  const [mode, setMode] = useState('simple');
  const [password, setPassword] = useState('');
  const [passwordLength, setPasswordLength] = useState(14);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('easykey-theme') || 'auto');
  const [copied, setCopied] = useState(false);
  
  const t = getTranslations(language);
  
  // Theme management
  useEffect(() => {
    const handleTheme = () => {
      const html = document.documentElement;
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      if (theme === 'dark' || (theme === 'auto' && systemPrefersDark)) {
        html.classList.add('dark');
      } else {
        html.classList.remove('dark');
      }
    };
    
    handleTheme();
    localStorage.setItem('easykey-theme', theme);
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', handleTheme);
    
    return () => mediaQuery.removeEventListener('change', handleTheme);
  }, [theme]);
  
  // Language management
  useEffect(() => {
    localStorage.setItem('easykey-language', language);
  }, [language]);
  
  const calculatePasswordStrength = (pwd) => {
    if (!pwd) return 0;
    
    let score = 0;
    
    // Length
    if (pwd.length >= 8) score += 1;
    if (pwd.length >= 12) score += 1;
    if (pwd.length >= 16) score += 1;
    
    // Complexity
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[a-z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;
    
    // Normalize to 0-4 range
    return Math.min(4, Math.floor(score / 2));
  };
  
  const getStrengthText = (strength) => {
    const strengthTexts = [
      t.passwordStrength.veryWeak,
      t.passwordStrength.weak,
      t.passwordStrength.medium,
      t.passwordStrength.strong,
      t.passwordStrength.veryStrong
    ];
    return strengthTexts[strength];
  };
  
  const getStrengthColor = (strength) => {
    const colors = [
      'bg-red-500',
      'bg-orange-500',
      'bg-yellow-500',
      'bg-green-500',
      'bg-emerald-500'
    ];
    return colors[strength];
  };
  
  const generatePassword = () => {
    let charset = "";
    if (includeUppercase) charset += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (includeLowercase) charset += "abcdefghijklmnopqrstuvwxyz";
    if (includeNumbers) charset += "0123456789";
    if (includeSymbols) charset += "!@#$%^&*()_+-=[]{}|;:,.<>?";
    
    if (charset === "") {
      setPassword(t.emptyCharsetError);
      return;
    }
    
    let newPassword = "";
    for (let i = 0; i < passwordLength; i++) {
      newPassword += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    
    setPassword(newPassword);
    setCopied(false);
  };
  
  const copyToClipboard = () => {
    if (password && password !== t.emptyCharsetError) {
      navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  
  const passwordStrength = calculatePasswordStrength(password);
  
  return (
    <div className="min-h-screen transition-colors duration-300 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm py-4 px-4 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {t.appTitle}
            </h1>
            <span className="ml-2 text-sm text-gray-600 dark:text-gray-400 hidden sm:block">
              {t.tagline}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label={t.settings}
            >
              {Icons.settings}
            </button>
          </div>
        </div>
      </header>
      
      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-md px-4 py-3 transition-all">
          <div className="container mx-auto flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">{t.theme.auto}</label>
              <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setTheme('auto')}
                  className={`flex items-center justify-center p-2 rounded-md flex-1 ${
                    theme === 'auto' 
                      ? 'bg-white dark:bg-gray-600 shadow-sm' 
                      : 'hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                  aria-label={t.theme.auto}
                >
                  {Icons.auto}
                </button>
                <button
                  onClick={() => setTheme('light')}
                  className={`flex items-center justify-center p-2 rounded-md flex-1 ${
                    theme === 'light' 
                      ? 'bg-white dark:bg-gray-600 shadow-sm' 
                      : 'hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                  aria-label={t.theme.light}
                >
                  {Icons.sun}
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={`flex items-center justify-center p-2 rounded-md flex-1 ${
                    theme === 'dark' 
                      ? 'bg-white dark:bg-gray-600 shadow-sm' 
                      : 'hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                  aria-label={t.theme.dark}
                >
                  {Icons.moon}
                </button>
              </div>
            </div>
            
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">{t.language}</label>
              <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-3 py-1 rounded-md ${
                    language === 'en' 
                      ? 'bg-white dark:bg-gray-600 shadow-sm font-medium' 
                      : 'hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  EN
                </button>
                <button
                  onClick={() => setLanguage('pl')}
                  className={`px-3 py-1 rounded-md ${
                    language === 'pl' 
                      ? 'bg-white dark:bg-gray-600 shadow-sm font-medium' 
                      : 'hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  PL
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Main content */}
      <main className="container mx-auto p-4 my-6">
        <div className="max-w-3xl mx-auto">
          {/* Application description */}
          <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
            {t.description}
          </p>
          
          {/* Mode selection tabs */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setMode('simple')}
                className={`px-4 py-2 rounded-md font-medium transition-all ${
                  mode === 'simple'
                    ? 'bg-white dark:bg-gray-700 shadow text-blue-600 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                {t.simpleMode}
              </button>
              <button
                onClick={() => setMode('creative')}
                className={`px-4 py-2 rounded-md font-medium transition-all ${
                  mode === 'creative'
                    ? 'bg-white dark:bg-gray-700 shadow text-blue-600 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                {t.creativeMode}
              </button>
            </div>
          </div>
          
          {/* Password display area */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg mb-8 overflow-hidden">
            <div className="p-6 pb-4 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-lg font-medium text-gray-500 dark:text-gray-400">
                {t.generatedPassword}
              </h2>
              <div className="mt-2 flex items-center">
                {password && password !== t.emptyCharsetError ? (
                  <div className="font-mono text-xl md:text-2xl w-full break-all">
                    {password}
                  </div>
                ) : (
                  <div className="text-gray-400 dark:text-gray-500 font-medium">
                    {password || t.noPasswordYet}
                  </div>
                )}
              </div>
            </div>
            
            {/* Password strength indicator */}
            {password && password !== t.emptyCharsetError && (
              <div className="px-6 py-3 bg-gray-50 dark:bg-gray-750 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${getStrengthColor(passwordStrength)} transition-all`}
                      style={{ width: `${(passwordStrength + 1) * 20}%` }}
                    ></div>
                  </div>
                  <div className="text-sm font-medium">
                    {getStrengthText(passwordStrength)}
                  </div>
                </div>
              </div>
            )}
            
            {/* Action buttons */}
            <div className="p-4 bg-gray-50 dark:bg-gray-750 flex flex-col sm:flex-row gap-3">
              <button
                onClick={generatePassword}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors shadow-sm"
              >
                {t.generateButton}
              </button>
              <button
                onClick={copyToClipboard}
                disabled={!password || password === t.emptyCharsetError}
                className={`flex-1 flex items-center justify-center py-2 px-4 rounded-lg transition-all 
                  ${password && password !== t.emptyCharsetError
                    ? copied
                      ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                      : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                  }`}
              >
                {copied ? (
                  <>
                    <span className="mr-2">{Icons.check}</span>
                    {t.copiedToClipboard}
                  </>
                ) : (
                  <>
                    <span className="mr-2">{Icons.copy}</span>
                    {t.copyButton}
                  </>
                )}
              </button>
            </div>
          </div>
          
          {/* Simple mode options */}
          {mode === 'simple' && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="space-y-6">
                {/* Length slider */}
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t.passwordLength}
                    </label>
                    <span className="text-blue-600 dark:text-blue-400 font-semibold">
                      {passwordLength}
                    </span>
                  </div>
                  <input 
                    type="range" 
                    min="6" 
                    max="32" 
                    value={passwordLength} 
                    onChange={(e) => setPasswordLength(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>
                
                {/* Character options */}
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-750 flex items-center">
                    <input 
                      type="checkbox" 
                      id="uppercase" 
                      checked={includeUppercase} 
                      onChange={() => setIncludeUppercase(!includeUppercase)}
                      className="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-400 dark:bg-gray-700"
                    />
                    <label htmlFor="uppercase" className="ml-3 block text-sm font-medium">
                      {t.includeUppercase}
                    </label>
                  </div>
                  
                  <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-750 flex items-center">
                    <input 
                      type="checkbox" 
                      id="lowercase" 
                      checked={includeLowercase} 
                      onChange={() => setIncludeLowercase(!includeLowercase)}
                      className="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-400 dark:bg-gray-700"
                    />
                    <label htmlFor="lowercase" className="ml-3 block text-sm font-medium">
                      {t.includeLowercase}
                    </label>
                  </div>
                  
                  <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-750 flex items-center">
                    <input 
                      type="checkbox" 
                      id="numbers" 
                      checked={includeNumbers} 
                      onChange={() => setIncludeNumbers(!includeNumbers)}
                      className="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-400 dark:bg-gray-700"
                    />
                    <label htmlFor="numbers" className="ml-3 block text-sm font-medium">
                      {t.includeNumbers}
                    </label>
                  </div>
                  
                  <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-750 flex items-center">
                    <input 
                      type="checkbox" 
                      id="symbols" 
                      checked={includeSymbols} 
                      onChange={() => setIncludeSymbols(!includeSymbols)}
                      className="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-400 dark:bg-gray-700"
                    />
                    <label htmlFor="symbols" className="ml-3 block text-sm font-medium">
                      {t.includeSymbols}
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Creative mode (under construction) */}
          {mode === 'creative' && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center">
              <h3 className="text-xl font-semibold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
                {t.creativeMode} - {t.comingSoon}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-lg mx-auto">
                {t.creativeDescription}
              </p>
              <div className="inline-block py-4 px-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg text-amber-700 dark:text-amber-400">
                {t.underConstruction}
              </div>
            </div>
          )}
        </div>
      </main>
      
      {/* Footer */}
      <footer className="py-6 px-4 border-t border-gray-200 dark:border-gray-800 mt-auto">
        <div className="container mx-auto text-center text-sm text-gray-500 dark:text-gray-400">
          <p>© {new Date().getFullYear()} EasyKey</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
