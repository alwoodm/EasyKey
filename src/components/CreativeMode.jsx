import React, { useState } from 'react';
import { generateMultiplePasswords } from '../services/geminiService';
import { Icons } from './Icons';

const CreativeMode = ({ t, calculatePasswordStrength, getStrengthText, getStrengthColor }) => {
  // Base state variables
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState('intro');
  const [passwordList, setPasswordList] = useState([]);
  
  // eslint-disable-next-line no-unused-vars
  const [selectedPasswordIndex, setSelectedPasswordIndex] = useState(-1);
  
  // Wizard specific state
  const [wizardStep, setWizardStep] = useState(0);
  const [memoryPreference, setMemoryPreference] = useState('medium');
  const [applicationType, setApplicationType] = useState('general');
  const [securityLevel, setSecurityLevel] = useState('high');
  const [specialRequirements, setSpecialRequirements] = useState([]);
  const [passwordCount, setPasswordCount] = useState(10);
  
  // Memory preference options
  const memoryOptions = [
    { id: 'low', label: 'Łatwe do zapamiętania', description: 'Proste, ale mniej bezpieczne' },
    { id: 'medium', label: 'Zbalansowane', description: 'Dobry kompromis między zapamiętywalnością a bezpieczeństwem' },
    { id: 'high', label: 'Skomplikowane', description: 'Trudniejsze do zapamiętania, ale bardzo bezpieczne' }
  ];
  
  // Application type options
  const applicationOptions = [
    { id: 'banking', label: 'Bankowość', icon: '🏦', description: 'Konta bankowe, finanse, płatności' },
    { id: 'email', label: 'Email', icon: '✉️', description: 'Konta pocztowe, komunikacja' },
    { id: 'social', label: 'Media społecznościowe', icon: '👥', description: 'Facebook, Twitter, Instagram, itp.' },
    { id: 'work', label: 'Praca', icon: '💼', description: 'Konta służbowe, VPN, systemy firmowe' },
    { id: 'streaming', label: 'Streaming', icon: '📺', description: 'Netflix, Spotify, YouTube' },
    { id: 'shopping', label: 'Zakupy', icon: '🛒', description: 'Amazon, Allegro, sklepy online' },
    { id: 'gaming', label: 'Gry', icon: '🎮', description: 'Steam, Epic Games, konta do gier' },
    { id: 'general', label: 'Ogólne', icon: '🔑', description: 'Do różnych zastosowań' }
  ];
  
  // Security level options
  const securityOptions = [
    { id: 'medium', label: 'Standardowe', description: '12-14 znaków, podstawowe wymagania' },
    { id: 'high', label: 'Wysokie', description: '16-20 znaków, złożone wymagania' },
    { id: 'very-high', label: 'Bardzo wysokie', description: '24+ znaków, maksymalne bezpieczeństwo' }
  ];

  // Special requirements options
  const requirementOptions = [
    { id: 'pronounceable', label: 'Łatwe do wymówienia' },
    { id: 'no-similar', label: 'Bez podobnych znaków (1, l, I, 0, O)' },
    { id: 'no-consecutive', label: 'Bez sekwencji (123, abc)' },
    { id: 'include-date', label: 'Zawiera datę/rok' }
  ];

  const generateMultiple = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      // Generate a summary for the AI based on user preferences
      const summaryForAI = buildPasswordGenerationPrompt();
      
      // Call the API with our custom prompt
      const generatedPasswords = await generateMultiplePasswords({
        count: passwordCount,
        prompt: summaryForAI,
        language: getCurrentLanguage(),
        type: "password-wizard"
      });
      
      setPasswordList(generatedPasswords.map(pwd => ({ text: pwd, copied: false })));
      setStep('list'); // Move to the password list view
    } catch (err) {
      setError(`Error: ${err.message}`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Helper function to build the password generation prompt
  const buildPasswordGenerationPrompt = () => {
    // Set length based on security level
    let length;
    switch (securityLevel) {
      case 'medium': length = '12-14'; break;
      case 'high': length = '16-20'; break;
      case 'very-high': length = '24-30'; break;
      default: length = '16';
    }
    
    // Set memorability factor
    let memorability;
    switch (memoryPreference) {
      case 'low': memorability = 'łatwe do zapamiętania, używaj wzorów, słów i fraz'; break;
      case 'medium': memorability = 'umiarkowanie łatwe do zapamiętania, balansuj między bezpieczeństwem a łatwością'; break;
      case 'high': memorability = 'skomplikowane i bardzo bezpieczne, priorytetem jest bezpieczeństwo'; break;
      default: memorability = 'zbalansowane';
    }
    
    // Build special requirements string
    const requirementsList = specialRequirements.map(req => {
      switch(req) {
        case 'pronounceable': return 'łatwe do wymówienia';
        case 'no-similar': return 'bez podobnych znaków (1, l, I, 0, O)';
        case 'no-consecutive': return 'bez sekwencji (123, abc)';
        case 'include-date': return 'zawiera datę lub rok';
        default: return '';
      }
    }).filter(Boolean).join(', ');
    
    // Get application context
    const appContext = applicationOptions.find(app => app.id === applicationType)?.label || 'ogólnego użytku';
    
    return `Wygeneruj ${passwordCount} propozycji haseł o następujących parametrach:
    - Długość: ${length} znaków
    - Poziom bezpieczeństwa: ${securityLevel === 'medium' ? 'standardowy' : securityLevel === 'high' ? 'wysoki' : 'bardzo wysoki'}
    - Zapamiętywalność: ${memorability}
    - Do zastosowania: ${appContext}
    ${requirementsList ? `- Dodatkowe wymagania: ${requirementsList}` : ''}
    
    Hasła powinny być różnorodne i unikalne. Dla każdego hasła dodaj krótki opis jego struktury lub sposobu na zapamiętanie.`;
  };
  
  // Helper to detect the current language
  const getCurrentLanguage = () => {
    if (t.generateButton === "Wygeneruj Hasło") return "pl";
    if (t.generateButton === "Passwort generieren") return "de";
    if (t.generateButton === "Générer un mot de passe") return "fr";
    if (t.generateButton === "Generar contraseña") return "es";
    return "en";
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
    const newPasswordList = [...passwordList];
    newPasswordList[index] = { ...newPasswordList[index], copied: true };
    setPasswordList(newPasswordList);
    
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
      // Return to wizard instead of intro
      setStep('wizard');
      setWizardStep(wizardStep > 0 ? wizardStep - 1 : 0);
    } else if (step === 'customize') {
      setStep('list');
      setPassword('');
    } else if (step === 'wizard') {
      if (wizardStep > 0) {
        setWizardStep(wizardStep - 1);
      } else {
        setStep('intro');
      }
    }
  };
  
  // Handle wizard progress
  const nextStep = () => {
    if (wizardStep < 4) {
      setWizardStep(wizardStep + 1);
    } else {
      // Generate passwords when we've reached the end of the wizard
      generateMultiple();
    }
  };
  
  // Toggle special requirement option
  const toggleRequirement = (reqId) => {
    if (specialRequirements.includes(reqId)) {
      setSpecialRequirements(specialRequirements.filter(id => id !== reqId));
    } else {
      setSpecialRequirements([...specialRequirements, reqId]);
    }
  };

  const passwordStrength = calculatePasswordStrength(password);

  // Intro screen
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
            Kreator haseł dopasowanych do Twoich potrzeb. Odpowiedz na kilka pytań, aby wygenerować idealne hasła.
          </p>
          
          <ul className="text-left text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto space-y-2">
            <li className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Silne i łatwe do zapamiętania
            </li>
            <li className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Dopasowane do różnych serwisów
            </li>
            <li className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Z podpowiedziami do zapamiętania
            </li>
          </ul>
          
          <button
            onClick={() => setStep('wizard')}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
          >
            <span className="flex items-center">
              Rozpocznij kreator
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </span>
          </button>
        </div>
      </div>
    );
  }
  
  // Wizard interface
  if (step === 'wizard') {
    return (
      <div className="flex-grow flex flex-col space-y-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
          {/* Wizard header with progress indicators */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white">
            <div className="flex justify-between items-center mb-4">
              <button 
                onClick={goBack}
                className="p-1 rounded-full hover:bg-white/10"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h2 className="text-lg font-medium">Kreator hasła</h2>
              <div className="w-6"></div> {/* Spacer for symmetry */}
            </div>
            
            {/* Progress dots */}
            <div className="flex justify-center space-x-2">
              {[0, 1, 2, 3, 4].map((stepNum) => (
                <div 
                  key={stepNum}
                  className={`w-2.5 h-2.5 rounded-full ${wizardStep >= stepNum ? 'bg-white' : 'bg-white/30'}`}
                ></div>
              ))}
            </div>
          </div>
          
          {/* Wizard content */}
          <div className="p-5">
            {/* Step 1: How much can you remember */}
            {wizardStep === 0 && (
              <div className="space-y-4">
                <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200">
                  Jak dobrze zapamiętujesz hasła?
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Wybierz opcję, która najlepiej opisuje Twoje preferencje dotyczące zapamiętywalności hasła.
                </p>
                
                <div className="space-y-3">
                  {memoryOptions.map(option => (
                    <div 
                      key={option.id}
                      onClick={() => setMemoryPreference(option.id)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        memoryPreference === option.id 
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                          : 'border-gray-200 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-700'
                      }`}
                    >
                      <div className="flex items-center">
                        <div className={`w-5 h-5 rounded-full mr-3 border flex items-center justify-center ${
                          memoryPreference === option.id 
                            ? 'border-blue-500 bg-blue-500' 
                            : 'border-gray-400'
                        }`}>
                          {memoryPreference === option.id && (
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-800 dark:text-gray-200">{option.label}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{option.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Step 2: Application type */}
            {wizardStep === 1 && (
              <div className="space-y-4">
                <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200">
                  Do jakiej aplikacji potrzebujesz hasła?
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Wybierz typ serwisu, dla którego tworzysz hasło.
                </p>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {applicationOptions.map(option => (
                    <div 
                      key={option.id}
                      onClick={() => setApplicationType(option.id)}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all flex flex-col items-center justify-center text-center h-[110px] ${
                        applicationType === option.id 
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                          : 'border-gray-200 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-700'
                      }`}
                    >
                      <div className="text-2xl mb-1">{option.icon}</div>
                      <h4 className="font-medium text-sm text-gray-800 dark:text-gray-200">{option.label}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{option.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Step 3: Security level */}
            {wizardStep === 2 && (
              <div className="space-y-4">
                <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200">
                  Jaki poziom bezpieczeństwa preferujesz?
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Wybierz poziom bezpieczeństwa dla Twojego hasła.
                </p>
                
                <div className="space-y-3">
                  {securityOptions.map(option => (
                    <div 
                      key={option.id}
                      onClick={() => setSecurityLevel(option.id)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        securityLevel === option.id 
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                          : 'border-gray-200 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-700'
                      }`}
                    >
                      <div className="flex items-center">
                        <div className={`w-5 h-5 rounded-full mr-3 border flex items-center justify-center ${
                          securityLevel === option.id 
                            ? 'border-blue-500 bg-blue-500' 
                            : 'border-gray-400'
                        }`}>
                          {securityLevel === option.id && (
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-800 dark:text-gray-200">{option.label}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{option.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Step 4: Special requirements */}
            {wizardStep === 3 && (
              <div className="space-y-4">
                <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200">
                  Specjalne wymagania (opcjonalnie)
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Wybierz dodatkowe wymagania dla Twojego hasła.
                </p>
                
                <div className="space-y-2">
                  {requirementOptions.map(option => (
                    <div 
                      key={option.id}
                      className="flex items-center p-3 rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                      <input
                        type="checkbox"
                        id={`req-${option.id}`}
                        checked={specialRequirements.includes(option.id)}
                        onChange={() => toggleRequirement(option.id)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label 
                        htmlFor={`req-${option.id}`}
                        className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
                      >
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Step 5: Summary */}
            {wizardStep === 4 && (
              <div className="space-y-4">
                <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200">
                  Podsumowanie
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Sprawdź i potwierdź swoje preferencje dotyczące hasła.
                </p>
                
                <div className="bg-gray-50 dark:bg-gray-750 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Zapamiętywalność:</span>
                    <span className="text-sm font-medium">{memoryOptions.find(o => o.id === memoryPreference)?.label}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Aplikacja:</span>
                    <span className="text-sm font-medium">{applicationOptions.find(o => o.id === applicationType)?.label}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Poziom bezpieczeństwa:</span>
                    <span className="text-sm font-medium">{securityOptions.find(o => o.id === securityLevel)?.label}</span>
                  </div>
                  {specialRequirements.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Dodatkowe wymagania:</span>
                      <div className="text-right">
                        {specialRequirements.map(req => (
                          <div key={req} className="text-sm font-medium">
                            {requirementOptions.find(o => o.id === req)?.label}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Liczba propozycji do wygenerowania:
                  </label>
                  <select
                    value={passwordCount}
                    onChange={(e) => setPasswordCount(Number(e.target.value))}
                    className="block w-full rounded-md border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value={5}>5 propozycji</option>
                    <option value={10}>10 propozycji</option>
                    <option value={15}>15 propozycji</option>
                  </select>
                </div>
              </div>
            )}
          </div>
          
          {/* Wizard footer */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4 flex justify-between">
            <button
              onClick={goBack}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {wizardStep === 0 ? 'Anuluj' : 'Wstecz'}
            </button>
            <button
              onClick={nextStep}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generowanie...
                </span>
              ) : wizardStep < 4 ? 'Dalej' : 'Generuj hasła'}
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // Display generated password list
  if (step === 'list') {
    return (
      <div className="flex-grow flex flex-col space-y-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-700 dark:text-gray-200">
              Propozycje haseł
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
              Wybierz hasło, które najbardziej Ci odpowiada, lub skopiuj je bezpośrednio:
            </p>
            
            <div className="space-y-3">
              {passwordList.map((pwd, index) => (
                <div 
                  key={index} 
                  className="flex flex-col p-3 bg-gray-50 dark:bg-gray-750 rounded-md border border-gray-200 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="font-mono text-base font-medium">
                      {pwd.text.split('|')[0]}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => copyFromList(pwd.text.split('|')[0], index)}
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
                        onClick={() => handleSelectPassword(pwd.text.split('|')[0], index)}
                        className="p-1.5 rounded-md bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-800/30 text-blue-700 dark:text-blue-400"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  {/* Password hint/description if available */}
                  {pwd.text.split('|')[1] && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 border-t border-gray-200 dark:border-gray-600 pt-2">
                      <span className="font-medium">Wskazówka:</span> {pwd.text.split('|')[1]}
                    </p>
                  )}
                </div>
              ))}
            </div>
            
            {/* Generate more passwords button */}
            <button
              onClick={generateMultiple}
              disabled={isLoading}
              className="w-full mt-4 p-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-all flex items-center justify-center"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generowanie...
                </span>
              ) : (
                <>Wygeneruj więcej propozycji</>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // Password details view
  if (step === 'customize') {
    return (
      <div className="flex-grow flex flex-col space-y-4">
        {/* Password display container */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="p-3 sm:p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-base font-medium text-gray-700 dark:text-gray-200">
              Wybrane hasło
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
          
          {/* Password display */}
          <div className="p-5">
            <div className="flex items-center justify-center p-3 bg-gray-50 dark:bg-gray-750 rounded-lg border border-gray-200 dark:border-gray-600">
              <div className="font-mono text-xl font-medium break-all">
                {password}
              </div>
            </div>
            
            {/* Strength indicator */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Siła hasła:</span>
                <span className="text-sm font-medium">{getStrengthText(passwordStrength)}</span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${getStrengthColor(passwordStrength)} transition-all`}
                  style={{ width: `${(passwordStrength + 1) * 20}%` }}
                ></div>
              </div>
            </div>
            
            {/* Character analysis */}
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="bg-gray-50 dark:bg-gray-750 rounded-md p-3 text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {password.length}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Długość</div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-750 rounded-md p-3 text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {(password.match(/[A-Z]/g) || []).length
                  }
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Wielkie litery</div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-750 rounded-md p-3 text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {(password.match(/[a-z]/g) || []).length}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Małe litery</div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-750 rounded-md p-3 text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {(password.match(/[0-9]/g) || []).length}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Cyfry</div>
              </div>
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="p-4 bg-gray-50 dark:bg-gray-750 border-t border-gray-200 dark:border-gray-600">
            <button
              onClick={copyToClipboard}
              className={`w-full flex items-center justify-center py-2.5 px-4 rounded-md text-sm font-medium transition-all ${
                copied
                  ? 'bg-emerald-500 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
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
      </div>
    );
  }
};

export default CreativeMode;
