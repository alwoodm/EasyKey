import React, { useState } from 'react';
import { generateCreativePassword, generateMultiplePasswords } from '../services/geminiService';
import { Icons } from './Icons';

const CreativeMode = ({ t, calculatePasswordStrength, getStrengthText, getStrengthColor }) => {
  const [password, setPassword] = useState('');
  const [passwordLength, setPasswordLength] = useState(14);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [context, setContext] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  
  // Nowe stany dla etapu wprowadzającego i listy haseł
  const [step, setStep] = useState('intro'); // 'intro', 'list', 'customize'
  const [passwordList, setPasswordList] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [selectedPasswordIndex, setSelectedPasswordIndex] = useState(-1); // Tracks which password was selected from the list

  const generatePassword = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      // Sprawdzenie, czy wybrano jakąkolwiek opcję znaków
      if (!includeUppercase && !includeLowercase && !includeNumbers && !includeSymbols) {
        setError(t.emptyCharsetError);
        setIsLoading(false);
        return;
      }
      
      const generatedPassword = await generateCreativePassword({
        length: passwordLength,
        uppercase: includeUppercase,
        lowercase: includeLowercase,
        numbers: includeNumbers,
        symbols: includeSymbols,
        context: context.trim(),
        type: "poem" // Dodajemy typ "poem" aby generować wierszyki
      });
      
      setPassword(generatedPassword);
    } catch (err) {
      setError(`Error: ${err.message}`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const generateMultiple = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      // Generowanie 10 wierszy w odpowiednim języku
      const poems = await generateMultiplePasswords({
        count: 5, // Zmniejszamy ilość do 5, bo wiersze będą dłuższe
        length: passwordLength,
        uppercase: true,
        lowercase: true,
        numbers: true,
        symbols: true,
        language: getCurrentLanguage(),
        type: "poem" // Dodajemy typ "poem" aby generować wierszyki
      });
      
      setPasswordList(poems.map(poem => ({ text: poem, copied: false })));
      setStep('list');
    } catch (err) {
      setError(`Error: ${err.message}`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Helper do wykrywania aktualnego języka
  const getCurrentLanguage = () => {
    // Próba wykrycia języka z tekstów
    if (t.generateButton === "Wygeneruj Hasło") return "pl";
    if (t.generateButton === "Passwort generieren") return "de";
    if (t.generateButton === "Générer un mot de passe") return "fr";
    if (t.generateButton === "Generar contraseña") return "es";
    return "en"; // Domyślnie angielski
  };

  const copyToClipboard = () => {
    if (password && !error) {
      navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  
  const copyFromList = (password, index) => {
    navigator.clipboard.writeText(password);
    // Aktualizacja stanu kopiowania dla konkretnego hasła
    const newPasswordList = [...passwordList];
    newPasswordList[index] = { ...newPasswordList[index], copied: true };
    setPasswordList(newPasswordList);
    
    // Reset stanu kopiowania po 2 sekundach
    setTimeout(() => {
      const resetList = [...passwordList];
      resetList[index] = { ...resetList[index], copied: false };
      setPasswordList(resetList);
    }, 2000);
  };
  
  const handleSelectPassword = (passwordText, index) => {
    setPassword(passwordText);
    setSelectedPasswordIndex(index);
    setStep('customize');
  };
  
  const goBack = () => {
    if (step === 'list') {
      setStep('intro');
      setPasswordList([]);
    } else if (step === 'customize') {
      setStep('list');
      setPassword('');
    }
  };

  const passwordStrength = calculatePasswordStrength(password);

  // Etap wprowadzający
  if (step === 'intro') {
    return (
      <div className="flex-grow flex flex-col space-y-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700 text-center">
          <h2 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-4">
            {t.creativeMode}
          </h2>
          
          <div className="w-24 h-24 mx-auto mb-6 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          
          <p className="text-gray-700 dark:text-gray-300 mb-6 max-w-lg mx-auto">
            Generator wierszy w różnych językach (wersja testowa)
          </p>
          
          <ul className="text-left text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto space-y-2">
            <li className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Kreatywne wierszyki w Twoim języku
            </li>
            <li className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Wygenerowane przez AI
            </li>
            <li className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Testowa wersja demo
            </li>
          </ul>
          
          <button
            onClick={generateMultiple}
            disabled={isLoading}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></span>
                Ładowanie...
              </span>
            ) : (
              <span className="flex items-center">
                Rozpocznij
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </span>
            )}
          </button>
        </div>
      </div>
    );
  }
  
  // Lista wygenerowanych wierszy
  if (step === 'list') {
    return (
      <div className="flex-grow flex flex-col space-y-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-700 dark:text-gray-200">
              Wygenerowane wierszyki
            </h2>
            <button
              onClick={goBack}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          
          <div className="p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Wybierz jeden z wygenerowanych wierszyków lub skopiuj go bezpośrednio:
            </p>
            
            <div className="space-y-2">
              {passwordList.map((pwd, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-750 rounded-md border border-gray-200 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer transition-colors"
                >
                  <div 
                    className="font-mono text-sm flex-grow mr-2"
                    onClick={() => handleSelectPassword(pwd.text, index)}
                  >
                    {pwd.text}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => copyFromList(pwd.text, index)}
                      className="p-1.5 rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
                    >
                      {pwd.copied ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                          <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                        </svg>
                      )}
                    </button>
                    <button
                      onClick={() => handleSelectPassword(pwd.text, index)}
                      className="p-1.5 rounded-md bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-800/30 text-blue-700 dark:text-blue-400"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <button
              onClick={generateMultiple}
              className="w-full mt-4 p-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-all"
            >
              Wygeneruj nowe wierszyki
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // Normalna zawartość komponentu dla trybu customize
  return (
    <div className="flex-grow flex flex-col space-y-4">
      {/* Główny kontener wyświetlania hasła */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="p-3 sm:p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-base font-medium text-gray-700 dark:text-gray-200">
            {t.generatedPassword}
          </h2>
          <button
            onClick={goBack}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        <div className="mt-2 flex items-center min-h-[50px] bg-gray-50 dark:bg-gray-750 rounded-md p-2.5 m-4 border border-gray-200 dark:border-gray-600">
          <div className="font-mono text-base sm:text-lg w-full break-all">
            {password}
          </div>
        </div>
        
        {/* Wskaźnik siły hasła */}
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
        
        {/* Przyciski akcji - poprawione, aby używać stanu copied */}
        <div className="p-3 sm:p-4 bg-gray-50 dark:bg-gray-750 flex flex-col sm:flex-row gap-2">
          <button
            onClick={generatePassword}
            disabled={isLoading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2.5 px-3 rounded-md transition-all duration-200"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                Generating...
              </span>
            ) : (
              t.generateButton
            )}
          </button>
          <button
            onClick={copyToClipboard}
            className={`flex items-center justify-center py-2.5 px-4 rounded-md text-sm transition-all ${
              copied
                ? 'bg-emerald-500 text-white'
                : 'bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600'
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
      
      {/* Panel opcji */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 sm:p-4 border border-gray-200 dark:border-gray-700">
        {/* Długość hasła */}
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
            min="8" 
            max="32" 
            value={passwordLength} 
            onChange={(e) => setPasswordLength(parseInt(e.target.value))}
            className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>8</span>
            <span>16</span>
            <span>24</span>
            <span>32</span>
          </div>
        </div>

        {/* Pole kontekstu - nowe w trybie kreatywnym */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Context (optional)
          </label>
          <input
            type="text"
            placeholder="e.g. Banking, Social Media, Shopping Site..."
            value={context}
            onChange={(e) => setContext(e.target.value)}
            className="w-full p-2.5 rounded-md bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Add a context to make your password more memorable and related to its use
          </p>
        </div>
        
        {/* Opcje znaków */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Character Types
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="p-2.5 rounded-md bg-gray-50 dark:bg-gray-750 flex items-center border border-gray-200 dark:border-gray-600">
              <input 
                type="checkbox" 
                id="creative-uppercase" 
                checked={includeUppercase} 
                onChange={() => setIncludeUppercase(!includeUppercase)}
                className="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-400 dark:bg-gray-700 cursor-pointer"
              />
              <label htmlFor="creative-uppercase" className="ml-2 block text-sm cursor-pointer flex-grow">
                {t.includeUppercase}
              </label>
            </div>
            
            <div className="p-2.5 rounded-md bg-gray-50 dark:bg-gray-750 flex items-center border border-gray-200 dark:border-gray-600">
              <input 
                type="checkbox" 
                id="creative-lowercase" 
                checked={includeLowercase} 
                onChange={() => setIncludeLowercase(!includeLowercase)}
                className="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-400 dark:bg-gray-700 cursor-pointer"
              />
              <label htmlFor="creative-lowercase" className="ml-2 block text-sm cursor-pointer flex-grow">
                {t.includeLowercase}
              </label>
            </div>
            
            <div className="p-2.5 rounded-md bg-gray-50 dark:bg-gray-750 flex items-center border border-gray-200 dark:border-gray-600">
              <input 
                type="checkbox" 
                id="creative-numbers" 
                checked={includeNumbers} 
                onChange={() => setIncludeNumbers(!includeNumbers)}
                className="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-400 dark:bg-gray-700 cursor-pointer"
              />
              <label htmlFor="creative-numbers" className="ml-2 block text-sm cursor-pointer flex-grow">
                {t.includeNumbers}
              </label>
            </div>
            
            <div className="p-2.5 rounded-md bg-gray-50 dark:bg-gray-750 flex items-center border border-gray-200 dark:border-gray-600">
              <input 
                type="checkbox" 
                id="creative-symbols" 
                checked={includeSymbols} 
                onChange={() => setIncludeSymbols(!includeSymbols)}
                className="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-400 dark:bg-gray-700 cursor-pointer"
              />
              <label htmlFor="creative-symbols" className="ml-2 block text-sm cursor-pointer flex-grow">
                {t.includeSymbols}
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreativeMode;
