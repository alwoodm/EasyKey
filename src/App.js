import { useState, useEffect } from 'react';
import './App.css';
import translations, { getActiveLanguage, getTranslations } from './translations';

// Icons for better UI
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
  check: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
  ),
  chevronDown: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
  ),
  simpleMode: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
      <rect x="9" y="9" width="6" height="6"></rect>
      <line x1="9" y1="2" x2="9" y2="4"></line>
      <line x1="15" y1="2" x2="15" y2="4"></line>
      <line x1="9" y1="20" x2="9" y2="22"></line>
      <line x1="15" y1="20" x2="15" y2="22"></line>
      <line x1="20" y1="9" x2="22" y2="9"></line>
      <line x1="20" y1="15" x2="22" y2="15"></line>
      <line x1="2" y1="9" x2="4" y2="9"></line>
      <line x1="2" y1="15" x2="4" y2="15"></line>
    </svg>
  ),
  advancedMode: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
      <path d="M2 17l10 5 10-5M2 12l10 5 10-5"></path>
    </svg>
  ),
  menu: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="12" x2="21" y2="12"></line>
      <line x1="3" y1="6" x2="21" y2="6"></line>
      <line x1="3" y1="18" x2="21" y2="18"></line>
    </svg>
  )
};

// Country flags as SVGs
const FlagSVGs = {
  en: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 30" className="h-5 w-7">
      <clipPath id="a"><path d="M0 0v30h60V0z"/></clipPath>
      <clipPath id="b"><path d="M30 15h30v15zv15H0zH0V0zV0h30z"/></clipPath>
      <g clipPath="url(#a)">
        <path d="M0 0v30h60V0z" fill="#012169"/>
        <path d="M0 0l60 30m0-30L0 30" stroke="#fff" strokeWidth="6"/>
        <path d="M0 0l60 30m0-30L0 30" clipPath="url(#b)" stroke="#C8102E" strokeWidth="4"/>
        <path d="M30 0v30M0 15h60" stroke="#fff" strokeWidth="10"/>
        <path d="M30 0v30M0 15h60" stroke="#C8102E" strokeWidth="6"/>
      </g>
    </svg>
  ),
  pl: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 10" className="h-5 w-7">
      <rect width="16" height="10" fill="#fff"/>
      <rect width="16" height="5" y="5" fill="#dc143c"/>
    </svg>
  )
};

// Mode options
const modes = [
  { 
    id: 'simple', 
    name: {
      en: "Simple",
      pl: "Prosty"
    }
  },
  { 
    id: 'creative', 
    name: {
      en: "Creative",
      pl: "Kreatywny"
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(window.innerWidth < 768);
  const [tooltipVisible, setTooltipVisible] = useState(null);
  
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
    const handleResize = () => {
      setSidebarCollapsed(window.innerWidth < 768);
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
  
  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-md py-3 px-4 border-b border-gray-200 dark:border-gray-700 z-20">
        <div className="container mx-auto flex items-center">
          <div className="w-20 md:w-48 flex justify-center">
            <button 
              className="md:hidden p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            >
              {Icons.menu}
            </button>
          </div>
          
          <div className="flex-grow flex justify-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent inline-flex items-center">
              {t.appTitle}
              <span className="ml-2 text-sm text-gray-600 dark:text-gray-400 hidden sm:inline">
                {t.tagline}
              </span>
            </h1>
          </div>
          
          <div className="w-20 md:w-48 flex justify-end relative">
            <div className="lang-dropdown">
              <button
                onClick={() => setShowLangDropdown(!showLangDropdown)}
                className="flex items-center gap-2 py-1.5 px-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
              >
                <span className="text-lg">
                  {FlagSVGs[language]}
                </span>
                <span className="hidden sm:inline font-medium">
                  {language === 'en' ? 'English' : 'Polski'}
                </span>
                <span className="text-gray-500">{Icons.chevronDown}</span>
              </button>
              
              {showLangDropdown && (
                <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-10 border border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => { setLanguage('en'); setShowLangDropdown(false); }}
                    className={`flex items-center w-full px-4 py-2.5 text-left ${language === 'en' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                  >
                    <span className="mr-3 flex-shrink-0">{FlagSVGs.en}</span>
                    <span>English</span>
                  </button>
                  <button
                    onClick={() => { setLanguage('pl'); setShowLangDropdown(false); }}
                    className={`flex items-center w-full px-4 py-2.5 text-left ${language === 'pl' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                  >
                    <span className="mr-3 flex-shrink-0">{FlagSVGs.pl}</span>
                    <span>Polski</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      
      <div className="flex-grow flex">
        {/* Sidebar / Mode selector - Redesigned */}
        <aside 
          className={`fixed md:static z-20 md:block transform transition-all duration-300 ease-in-out bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 shadow-lg border-r border-gray-200 dark:border-gray-700 ${
            sidebarCollapsed ? '-translate-x-full md:translate-x-0 w-0 md:w-48' : 'translate-x-0 w-64 md:w-48'
          } h-full`}
        >
          <div className="flex flex-col h-full p-4 pt-8 space-y-3">
            <h3 className="text-sm uppercase font-bold text-gray-500 dark:text-gray-400 px-3 mb-2">{t.selectMode}</h3>
            {modes.map(modeOption => (
              <button
                key={modeOption.id}
                onClick={() => {
                  setMode(modeOption.id); 
                  if (window.innerWidth < 768) setSidebarCollapsed(true);
                }}
                className={`flex w-full items-center px-4 py-3.5 rounded-xl transition-all duration-200 ${
                  mode === modeOption.id 
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold shadow-md'
                    : 'bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-750 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
                }`}
              >
                <span className={`text-base ${mode === modeOption.id ? 'font-semibold' : 'font-medium'}`}>
                  {modeOption.name[language]} {t.mode}
                </span>
                {mode === modeOption.id && (
                  <span className="ml-auto">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                )}
              </button>
            ))}
          </div>
        </aside>
        
        {/* Main content */}
        <main className="flex-grow px-4 py-4">
          <div className="container mx-auto max-w-4xl h-full">
            {/* Password display and options */}
            {mode === 'simple' ? (
              <div className="flex-grow flex flex-col">
                {/* Password display area */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg mb-6 overflow-hidden border border-gray-100 dark:border-gray-700">
                  <div className="p-5 border-b border-gray-100 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">
                      {t.generatedPassword}
                    </h2>
                    <div className="mt-1 flex items-center min-h-[60px] bg-gray-50 dark:bg-gray-750 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                      {password && password !== t.emptyCharsetError ? (
                        <div className="font-mono text-xl md:text-2xl w-full break-all">
                          {password}
                        </div>
                      ) : (
                        <div className="text-gray-400 dark:text-gray-500 font-medium italic">
                          {password || t.noPasswordYet}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Password strength indicator */}
                  {password && password !== t.emptyCharsetError && (
                    <div className="px-5 py-3 bg-gray-50 dark:bg-gray-750 border-b border-gray-100 dark:border-gray-700">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${getStrengthColor(passwordStrength)} transition-all`}
                            style={{ width: `${(passwordStrength + 1) * 20}%` }}
                          ></div>
                        </div>
                        <div className="text-sm font-bold">
                          {getStrengthText(passwordStrength)}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Action buttons */}
                  <div className="p-5 bg-gray-50 dark:bg-gray-750 flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={generatePassword}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg"
                    >
                      {t.generateButton}
                    </button>
                    <button
                      onClick={copyToClipboard}
                      disabled={!password || password === t.emptyCharsetError}
                      className={`flex-1 flex items-center justify-center py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] ${
                        password && password !== t.emptyCharsetError
                          ? copied
                            ? 'bg-emerald-500 text-white shadow-md'
                            : 'bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 shadow-md hover:shadow-lg border border-gray-200 dark:border-gray-600'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-70'
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
                
                {/* Password options */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-5 border border-gray-100 dark:border-gray-700">
                  {/* Length slider */}
                  <div className="mb-7">
                    <div className="flex justify-between mb-3">
                      <label className="block text-base font-medium text-gray-700 dark:text-gray-300">
                        {t.passwordLength}
                      </label>
                      <span className="text-blue-600 dark:text-blue-400 font-bold text-lg bg-blue-50 dark:bg-blue-900/30 px-2 rounded-md">
                        {passwordLength}
                      </span>
                    </div>
                    <input 
                      type="range" 
                      min="6" 
                      max="32" 
                      value={passwordLength} 
                      onChange={(e) => setPasswordLength(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-opacity-50"
                    />
                    <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mt-2 font-medium">
                      <span>6</span>
                      <span>12</span>
                      <span>18</span>
                      <span>24</span>
                      <span>32</span>
                    </div>
                  </div>
                  
                  {/* Character options - displayed in a 2x2 grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-750 flex items-center border border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 transition-colors">
                      <input 
                        type="checkbox" 
                        id="uppercase" 
                        checked={includeUppercase} 
                        onChange={() => setIncludeUppercase(!includeUppercase)}
                        className="w-5 h-5 rounded-md border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-400 dark:bg-gray-700 cursor-pointer"
                      />
                      <label htmlFor="uppercase" className="ml-3 block text-base font-medium cursor-pointer">
                        {t.includeUppercase}
                      </label>
                    </div>
                    
                    <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-750 flex items-center border border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 transition-colors">
                      <input 
                        type="checkbox" 
                        id="lowercase" 
                        checked={includeLowercase} 
                        onChange={() => setIncludeLowercase(!includeLowercase)}
                        className="w-5 h-5 rounded-md border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-400 dark:bg-gray-700 cursor-pointer"
                      />
                      <label htmlFor="lowercase" className="ml-3 block text-base font-medium cursor-pointer">
                        {t.includeLowercase}
                      </label>
                    </div>
                    
                    <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-750 flex items-center border border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 transition-colors">
                      <input 
                        type="checkbox" 
                        id="numbers" 
                        checked={includeNumbers} 
                        onChange={() => setIncludeNumbers(!includeNumbers)}
                        className="w-5 h-5 rounded-md border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-400 dark:bg-gray-700 cursor-pointer"
                      />
                      <label htmlFor="numbers" className="ml-3 block text-base font-medium cursor-pointer">
                        {t.includeNumbers}
                      </label>
                    </div>
                    
                    <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-750 flex items-center border border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 transition-colors">
                      <input 
                        type="checkbox" 
                        id="symbols" 
                        checked={includeSymbols} 
                        onChange={() => setIncludeSymbols(!includeSymbols)}
                        className="w-5 h-5 rounded-md border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-400 dark:bg-gray-700 cursor-pointer"
                      />
                      <label htmlFor="symbols" className="ml-3 block text-base font-medium cursor-pointer">
                        {t.includeSymbols}
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-grow flex flex-col items-center justify-center bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
                <div className="text-center max-w-lg">
                  <h2 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-4">
                    {t.creativeMode}
                  </h2>
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-6 my-6">
                    <p className="text-amber-700 dark:text-amber-400 text-lg font-medium">
                      {t.underConstruction}
                    </p>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mt-4">
                    {t.comingSoon}
                  </p>
                  <p className="text-gray-500 dark:text-gray-500 mt-6 text-sm italic">
                    {t.creativeDescription}
                  </p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
      
      {/* Overlay for sidebar on mobile */}
      {!sidebarCollapsed && window.innerWidth < 768 && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-10"
          onClick={() => setSidebarCollapsed(true)}
        ></div>
      )}
      
      {/* Theme Toggle Button - Redesigned */}
      <button 
        onClick={toggleTheme}
        className="fixed bottom-6 right-6 w-16 h-16 rounded-full shadow-xl transition-all duration-200 transform hover:scale-105 hover:rotate-12 active:scale-95 overflow-hidden bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600 p-0.5"
        aria-label={theme === 'dark' ? t.theme.light : t.theme.dark}
      >
        <div className="w-full h-full rounded-full bg-white dark:bg-gray-800 flex items-center justify-center relative">
          {/* Sun Icon (shows in dark mode) */}
          <div className={`absolute inset-0 flex items-center justify-center transition-transform duration-500 ${theme === 'dark' ? 'rotate-0 scale-100' : 'rotate-90 scale-0'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
            </svg>
          </div>
          {/* Moon Icon (shows in light mode) */}
          <div className={`absolute inset-0 flex items-center justify-center transition-transform duration-500 ${theme === 'dark' ? 'rotate-90 scale-0' : 'rotate-0 scale-100'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
          </div>
        </div>
      </button>
      
      {/* Footer */}
      <footer className="py-3 px-4 border-t border-gray-200 dark:border-gray-700 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>
          © {new Date().getFullYear()} EasyKey - Made by <a href="https://alwood.ovh" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">alwood</a>
        </p>
      </footer>
    </div>
  );
}

export default App;
