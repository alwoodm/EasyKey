import { useState, useEffect } from 'react';
import './App.css';
import { getActiveLanguage, getTranslations } from './translations'; // Removed unused import
import { Icons } from './components/Icons';
import { FlagEN, FlagPL, FlagDE, FlagFR, FlagES } from './components/Flags';

// Country flags as components
const FlagSVGs = {
  en: <FlagEN className="h-5 w-7" />,
  pl: <FlagPL className="h-5 w-7" />,
  de: <FlagDE className="h-5 w-7" />,
  fr: <FlagFR className="h-5 w-7" />,
  es: <FlagES className="h-5 w-7" />
};

// Mode options - Added translations for all languages
const modes = [
  { 
    id: 'simple', 
    name: {
      en: "Simple",
      pl: "Prosty",
      de: "Einfach",
      fr: "Simple",
      es: "Simple"
    }
  },
  { 
    id: 'creative', 
    name: {
      en: "Creative",
      pl: "Kreatywny",
      de: "Kreativ",
      fr: "Créatif",
      es: "Creativo"
    }
  }
];

function App() {
  const [language, setLanguage] = useState(getActiveLanguage());
  const [mode, setMode] = useState('simple');
  const [password, setPassword] = useState('');
  const [passwordLength, setPasswordLength] = useState(14);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [theme, setTheme] = useState(localStorage.getItem('easykey-theme') || 'auto');
  const [copied, setCopied] = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  // Removed unused state variables tooltipVisible and setTooltipVisible
  
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
  
  // Handle window resize for sidebar
  useEffect(() => {
    // We don't need to track sidebarCollapsed state since it's handled via CSS
    const handleResize = () => {
      // No action needed as responsive design is handled by Tailwind classes
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Language management
  useEffect(() => {
    localStorage.setItem('easykey-language', language);
  }, [language]);
  
  const calculatePasswordStrength = (pwd) => {
    if (!pwd) return 0;
    
    let score = 0;
    
    // Length - Give more weight to length
    if (pwd.length >= 8) score += 1;
    if (pwd.length >= 12) score += 1;
    if (pwd.length >= 16) score += 1;
    if (pwd.length >= 20) score += 2; // Extra points for very long passwords
    
    // Complexity
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[a-z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 2; // Extra point for special chars
    
    // Check pattern variety (don't just use the same char repeatedly)
    const uniqueChars = new Set(pwd).size;
    if (uniqueChars > pwd.length * 0.5) score += 1; // More unique chars
    if (uniqueChars > pwd.length * 0.75) score += 1; // Very diverse password
    
    // Normalize to 0-4 range
    return Math.min(4, Math.floor(score / 3));
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
  
  const toggleTheme = () => {
    setTheme(prevTheme => {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prevTheme === 'auto') {
        return systemPrefersDark ? 'light' : 'dark';
      } else {
        return prevTheme === 'dark' ? 'light' : 'dark';
      }
    });
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

  // Click outside to close language dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showLangDropdown && !event.target.closest('.lang-dropdown')) {
        setShowLangDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showLangDropdown]);
  
  // Get language name for display
  const getLanguageName = (code) => {
    const names = {
      en: 'English',
      pl: 'Polski',
      de: 'Deutsch',
      fr: 'Français',
      es: 'Español'
    };
    return names[code] || code;
  };
  
  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm py-2 px-3 border-b border-gray-200 dark:border-gray-700 z-30">
        <div className="container mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent flex items-center">
            {t.appTitle}
            <span className="ml-2 text-xs text-gray-500 dark:text-gray-400 hidden sm:inline">
              {t.tagline}
            </span>
          </h1>
          
          <div className="lang-dropdown relative">
            <button
              onClick={() => setShowLangDropdown(!showLangDropdown)}
              className="flex items-center gap-1.5 py-1.5 px-2.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
            >
              <span className="flex-shrink-0">
                {FlagSVGs[language]}
              </span>
              <span className="font-medium ml-1">
                {getLanguageName(language)}
              </span>
              <span className="text-gray-500 dark:text-gray-400 ml-0.5">{Icons.chevronDown}</span>
            </button>
            
            {showLangDropdown && (
              <div className="absolute right-0 mt-1 w-40 bg-white dark:bg-gray-800 rounded-md shadow-md py-1 z-40 border border-gray-200 dark:border-gray-700 text-sm">
                <button
                  onClick={() => { setLanguage('en'); setShowLangDropdown(false); }}
                  className={`flex items-center w-full px-3 py-2 text-left ${language === 'en' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                >
                  <span className="mr-2">{FlagSVGs.en}</span>
                  <span>English</span>
                </button>
                <button
                  onClick={() => { setLanguage('pl'); setShowLangDropdown(false); }}
                  className={`flex items-center w-full px-3 py-2 text-left ${language === 'pl' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                >
                  <span className="mr-2">{FlagSVGs.pl}</span>
                  <span>Polski</span>
                </button>
                <button
                  onClick={() => { setLanguage('de'); setShowLangDropdown(false); }}
                  className={`flex items-center w-full px-3 py-2 text-left ${language === 'de' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                >
                  <span className="mr-2">{FlagSVGs.de}</span>
                  <span>Deutsch</span>
                </button>
                <button
                  onClick={() => { setLanguage('fr'); setShowLangDropdown(false); }}
                  className={`flex items-center w-full px-3 py-2 text-left ${language === 'fr' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                >
                  <span className="mr-2">{FlagSVGs.fr}</span>
                  <span>Français</span>
                </button>
                <button
                  onClick={() => { setLanguage('es'); setShowLangDropdown(false); }}
                  className={`flex items-center w-full px-3 py-2 text-left ${language === 'es' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                >
                  <span className="mr-2">{FlagSVGs.es}</span>
                  <span>Español</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
      
      {/* Mode selector tabs for mobile - Always visible */}
      <div className="md:hidden bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-20">
        <div className="flex justify-center">
          {modes.map(modeOption => (
            <button
              key={modeOption.id}
              onClick={() => setMode(modeOption.id)}
              className={`flex items-center justify-center py-3 px-4 text-sm font-medium transition-all ${
                mode === modeOption.id
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <span className={`mr-2 ${mode === modeOption.id ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
                {modeOption.id === 'simple' ? Icons.simpleMode : Icons.advancedMode}
              </span>
              {modeOption.name[language]}
            </button>
          ))}
        </div>
      </div>
      
      {/* Layout with sidebar on left and centered main content */}
      <div className="flex-grow relative">
        {/* Sidebar - Only visible on desktop, positioned at left edge */}
        <aside className="hidden md:block absolute left-4 top-4 w-48">
          <div className="sticky top-4 flex flex-col py-3 px-3 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <div className="text-xs uppercase text-gray-500 dark:text-gray-400 mb-3 font-medium">{t.selectMode}</div>
            {modes.map(modeOption => (
              <button
                key={modeOption.id}
                onClick={() => setMode(modeOption.id)}
                className={`flex items-center px-2 py-2 mb-1 rounded-md text-sm transition-all ${
                  mode === modeOption.id 
                    ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-medium'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                <span className={mode === modeOption.id ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}>
                  {modeOption.id === 'simple' ? Icons.simpleMode : Icons.advancedMode}
                </span>
                <span className="ml-2">
                  {modeOption.name[language]}
                </span>
                {mode === modeOption.id && (
                  <span className="ml-auto text-blue-600 dark:text-blue-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                )}
              </button>
            ))}
          </div>
        </aside>
        
        {/* Main content - centered on entire page width */}
        <main className="flex justify-center px-4 py-4">
          <div className="w-full max-w-2xl">
            {/* Password display and options */}
            {mode === 'simple' ? (
                <div className="flex-grow flex flex-col space-y-4">
                  {/* Password display area - Better responsive sizing */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
                    <div className="p-3 sm:p-4 border-b border-gray-100 dark:border-gray-700">
                      <h2 className="text-base font-medium text-gray-700 dark:text-gray-200">
                        {t.generatedPassword}
                      </h2>
                      <div className="mt-2 flex items-center min-h-[50px] bg-gray-50 dark:bg-gray-750 rounded-md p-2.5 border border-gray-200 dark:border-gray-600">
                        {password && password !== t.emptyCharsetError ? (
                          <div className="font-mono text-base sm:text-lg w-full break-all">
                            {password}
                          </div>
                        ) : (
                          <div className="text-gray-400 dark:text-gray-500 text-sm italic">
                            {password || t.noPasswordYet}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Password strength indicator */}
                    {password && password !== t.emptyCharsetError && (
                      <div className="px-3 sm:px-4 py-2 bg-gray-50 dark:bg-gray-750 border-b border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${getStrengthColor(passwordStrength)} transition-all`}
                              style={{ width: `${(passwordStrength + 1) * 20}%` }}
                            ></div>
                          </div>
                          <div className="text-xs font-medium">
                            {getStrengthText(passwordStrength)}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Action buttons - Improved for touch */}
                    <div className="p-3 sm:p-4 bg-gray-50 dark:bg-gray-750 flex flex-col sm:flex-row gap-2">
                      <button
                        onClick={generatePassword}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2.5 px-3 rounded-md transition-all duration-200"
                      >
                        {t.generateButton}
                      </button>
                      <button
                        onClick={copyToClipboard}
                        disabled={!password || password === t.emptyCharsetError}
                        className={`flex items-center justify-center py-2.5 px-4 rounded-md text-sm transition-all ${
                          password && password !== t.emptyCharsetError
                            ? copied
                              ? 'bg-emerald-500 text-white'
                              : 'bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-70'
                          }`}
                      >
                        {copied ? (
                          <>
                            <span className="mr-1">{Icons.check}</span>
                            {t.copiedToClipboard}
                          </>
                        ) : (
                          <>
                            <span className="mr-1">{Icons.copy}</span>
                            {t.copyButton}
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  
                  {/* Password options - Better mobile experience */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 sm:p-4 border border-gray-200 dark:border-gray-700">
                    {/* Length slider */}
                    <div className="mb-5">
                      <div className="flex justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          {t.passwordLength}
                        </label>
                        <span className="text-blue-600 dark:text-blue-400 font-semibold text-sm bg-blue-50 dark:bg-blue-900/30 px-1.5 rounded">
                          {passwordLength}
                        </span>
                      </div>
                      <input 
                        type="range" 
                        min="6" 
                        max="32" 
                        value={passwordLength} 
                        onChange={(e) => setPasswordLength(parseInt(e.target.value))}
                        className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <span>6</span>
                        <span>12</span>
                        <span>18</span>
                        <span>24</span>
                        <span>32</span>
                      </div>
                    </div>
                    
                    {/* Character options - Better responsive grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="p-2.5 rounded-md bg-gray-50 dark:bg-gray-750 flex items-center border border-gray-200 dark:border-gray-600">
                        <input 
                          type="checkbox" 
                          id="uppercase" 
                          checked={includeUppercase} 
                          onChange={() => setIncludeUppercase(!includeUppercase)}
                          className="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-400 dark:bg-gray-700 cursor-pointer"
                        />
                        <label htmlFor="uppercase" className="ml-2 block text-sm cursor-pointer flex-grow">
                          {t.includeUppercase}
                        </label>
                      </div>
                      
                      <div className="p-2.5 rounded-md bg-gray-50 dark:bg-gray-750 flex items-center border border-gray-200 dark:border-gray-600">
                        <input 
                          type="checkbox" 
                          id="lowercase" 
                          checked={includeLowercase} 
                          onChange={() => setIncludeLowercase(!includeLowercase)}
                          className="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-400 dark:bg-gray-700 cursor-pointer"
                        />
                        <label htmlFor="lowercase" className="ml-2 block text-sm cursor-pointer flex-grow">
                          {t.includeLowercase}
                        </label>
                      </div>
                      
                      <div className="p-2.5 rounded-md bg-gray-50 dark:bg-gray-750 flex items-center border border-gray-200 dark:border-gray-600">
                        <input 
                          type="checkbox" 
                          id="numbers" 
                          checked={includeNumbers} 
                          onChange={() => setIncludeNumbers(!includeNumbers)}
                          className="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-400 dark:bg-gray-700 cursor-pointer"
                        />
                        <label htmlFor="numbers" className="ml-2 block text-sm cursor-pointer flex-grow">
                          {t.includeNumbers}
                        </label>
                      </div>
                      
                      <div className="p-2.5 rounded-md bg-gray-50 dark:bg-gray-750 flex items-center border border-gray-200 dark:border-gray-600">
                        <input 
                          type="checkbox" 
                          id="symbols" 
                          checked={includeSymbols} 
                          onChange={() => setIncludeSymbols(!includeSymbols)}
                          className="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-400 dark:bg-gray-700 cursor-pointer"
                        />
                        <label htmlFor="symbols" className="ml-2 block text-sm cursor-pointer flex-grow">
                          {t.includeSymbols}
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-grow flex flex-col items-center justify-center bg-white dark:bg-gray-800 rounded-lg shadow-md p-5 border border-gray-200 dark:border-gray-700">
                  <div className="text-center max-w-lg">
                    <h2 className="text-xl font-semibold text-indigo-600 dark:text-indigo-400 mb-3">
                      {t.creativeMode}
                    </h2>
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md p-4 my-4">
                      <p className="text-amber-700 dark:text-amber-400 text-sm">
                        {t.underConstruction}
                      </p>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mt-3">
                      {t.comingSoon}
                    </p>
                    <p className="text-gray-500 dark:text-gray-500 mt-4 text-xs italic">
                      {t.creativeDescription}
                    </p>
                  </div>
                </div>
              )}
          </div>
        </main>
      </div>
      
      {/* Theme Toggler Button */}
      <button
        onClick={toggleTheme}
        className={`fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center ${
          theme === 'dark' 
            ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700'
            : 'bg-white text-indigo-600 hover:bg-gray-50'
        } border border-gray-200 dark:border-gray-700 hover:scale-110`}
        aria-label="Toggle dark mode"
      >
        <div className="relative w-5 h-5">
          {/* Sun Icon */}
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="currentColor"
            className={`absolute inset-0 transition-all duration-300 ${
              theme === 'dark' ? 'opacity-100 transform rotate-0' : 'opacity-0 transform rotate-90'
            }`}
          >
            <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
          </svg>
          
          {/* Moon Icon */}
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="currentColor"
            className={`absolute inset-0 transition-all duration-300 ${
              theme === 'dark' ? 'opacity-0 transform -rotate-90' : 'opacity-100 transform rotate-0'
            }`}
          >
            <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z" clipRule="evenodd" />
          </svg>
        </div>
      </button>
      
      {/* Footer with attribution */}
      <footer className="py-2 px-3 border-t border-gray-200 dark:border-gray-700 text-center text-xs text-gray-500 dark:text-gray-400">
        <p>
          © {new Date().getFullYear()} EasyKey - Made by <a href="https://alwood.ovh" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">alwood</a>
        </p>
      </footer>
    </div>
  );
}

export default App;
