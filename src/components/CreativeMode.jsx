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
  const [specialRequirements, setSpecialRequirements] = useState([]);
  // Stan dla pytań otwartych
  const [customContext, setCustomContext] = useState('');
  const [associations, setAssociations] = useState(['']);
  
  // Memory preference options
  const memoryOptions = [
    { id: 'low', label: 'Łatwe do zapamiętania', description: 'Proste, ale mniej bezpieczne' },
    { id: 'medium', label: 'Zbalansowane', description: 'Dobry kompromis między zapamiętywalnością a bezpieczeństwem' },
    { id: 'high', label: 'Skomplikowane', description: 'Trudniejsze do zapamiętania, ale bardzo bezpieczne' }
  ];
  
  // Application type options - poprawione, aby zapewnić lepszą widoczność tekstu
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

  // Rozszerzone opcje specjalnych wymagań
  const requirementOptions = [
    { id: 'pronounceable', label: 'Łatwe do wymówienia' },
    { id: 'no-similar', label: 'Bez podobnych znaków (1, l, I, 0, O)' },
    { id: 'no-consecutive', label: 'Bez sekwencji (123, abc)' },
    { id: 'include-date', label: 'Zawiera datę/rok' },
    { id: 'include-initials', label: 'Zawiera inicjały/skrót' },
    { id: 'no-dictionary', label: 'Bez całych słów słownikowych' },
    { id: 'memorable-pattern', label: 'Z łatwym do zapamiętania wzorem' },
    { id: 'include-colors', label: 'Zawiera nazwy kolorów' },
    { id: 'include-animals', label: 'Zawiera nazwy zwierząt' }
  ];

  // Pytania dopasowane do typu aplikacji
  const getContextQuestions = () => {
    const questions = {
      banking: [
        "Jakie elementy kojarzą Ci się z finansami?",
        "Które liczby są dla Ciebie ważne w kontekście finansowym?"
      ],
      email: [
        "Jakich słów najczęściej używasz w komunikacji?",
        "Czym charakteryzuje się Twoja poczta elektroniczna?"
      ],
      social: [
        "Co najbardziej kojarzy Ci się z mediami społecznościowymi, których używasz?",
        "Jakie są Twoje zainteresowania na platformach społecznościowych?"
      ],
      work: [
        "Jaka jest Twoja rola lub stanowisko w pracy?",
        "Czym zajmuje się Twoja firma/organizacja?"
      ],
      streaming: [
        "Jakie są Twoje ulubione filmy, seriale lub muzyka?",
        "Jakich gatunków najczęściej słuchasz/oglądasz?"
      ],
      shopping: [
        "Co najczęściej kupujesz online?",
        "Jakie są Twoje ulubione marki lub sklepy?"
      ],
      gaming: [
        "W jakie gry najczęściej grasz?",
        "Jakie są Twoje ulubione postacie z gier?"
      ],
      general: [
        "Czego dotyczy aplikacja/serwis?",
        "Z czym kojarzy Ci się ta usługa/strona?"
      ]
    };
    
    return questions[applicationType] || questions.general;
  };

  const generateMultiple = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      // Generowanie podsumowania dla AI na podstawie preferencji użytkownika
      const summaryForAI = buildPasswordGenerationPrompt();
      
      // Wywołanie API z niestandardowym promptem
      const generatedPasswords = await generateMultiplePasswords({
        count: 10, // Zawsze 10 propozycji
        prompt: summaryForAI,
        language: getCurrentLanguage(),
        type: "password-wizard"
      });
      
      // Poprawka błędu formatowania - usunięcie znaków ** z początku hasła
      const cleanedPasswords = generatedPasswords.map(pwd => {
        // Jeśli hasło zaczyna się od **, usuń te znaki
        let text = pwd;
        if (text.startsWith('**')) {
          text = text.substring(2);
        }
        // Jeśli po znaku | też są **, usuń je też
        const parts = text.split('|');
        if (parts.length > 1 && parts[1].startsWith('**')) {
          parts[1] = parts[1].substring(2);
          text = parts.join('|');
        }
        
        return { text, copied: false };
      });
      
      setPasswordList(cleanedPasswords);
      setStep('list'); // Przejście do widoku listy haseł
    } catch (err) {
      setError(`Error: ${err.message}`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Helper function to build the password generation prompt
  const buildPasswordGenerationPrompt = () => {
    // Określenie długości hasła na podstawie preferencji zapamiętywalności
    let securityLevel, length;
    switch (memoryPreference) {
      case 'low': 
        securityLevel = 'standardowy';
        length = '12-14'; 
        break;
      case 'medium': 
        securityLevel = 'wysoki';
        length = '16-20'; 
        break;
      case 'high': 
        securityLevel = 'bardzo wysoki';
        length = '24-30'; 
        break;
      default: 
        securityLevel = 'wysoki';
        length = '16-20';
    }
    
    // Określenie czynnika zapamiętywalności
    let memorability;
    switch (memoryPreference) {
      case 'low': memorability = 'łatwe do zapamiętania, używaj wzorów, słów i fraz'; break;
      case 'medium': memorability = 'umiarkowanie łatwe do zapamiętania, balansuj między bezpieczeństwem a łatwością'; break;
      case 'high': memorability = 'skomplikowane i bardzo bezpieczne, priorytetem jest bezpieczeństwo'; break;
      default: memorability = 'zbalansowane';
    }
    
    // Budowanie ciągu specjalnych wymagań
    const requirementsList = specialRequirements.map(req => {
      switch(req) {
        case 'pronounceable': return 'łatwe do wymówienia';
        case 'no-similar': return 'bez podobnych znaków (1, l, I, 0, O)';
        case 'no-consecutive': return 'bez sekwencji (123, abc)';
        case 'include-date': return 'zawiera datę lub rok';
        case 'include-initials': return 'zawiera inicjały lub skróty';
        case 'no-dictionary': return 'bez całych słów słownikowych';
        case 'memorable-pattern': return 'z łatwym do zapamiętania wzorem';
        case 'include-colors': return 'zawiera odniesienia do kolorów';
        case 'include-animals': return 'zawiera odniesienia do zwierząt';
        default: return '';
      }
    }).filter(Boolean).join(', ');
    
    // Pobranie kontekstu aplikacji
    const appContext = applicationOptions.find(app => app.id === applicationType)?.label || 'ogólnego użytku';
    
    // Dodanie kontekstu otwartych pytań
    const contextDetails = customContext.trim() ? `\nDodatkowy kontekst: ${customContext}` : '';
    
    // Dodanie skojarzeń jeśli są
    const validAssociations = associations.filter(a => a.trim() !== '');
    const associationsText = validAssociations.length > 0 
      ? `\nSkojarzenia: ${validAssociations.join(', ')}` 
      : '';
    
    // Definicja języka dla AI
    const languageInstruction = getCurrentLanguage() === "pl" 
      ? "\nHasła MUSZĄ być wygenerowane w języku polskim. Używaj polskich słów i zwrotów."
      : "";
    
    return `Wygeneruj 10 propozycji haseł o następujących parametrach:
    - Długość: ${length} znaków
    - Poziom bezpieczeństwa: ${securityLevel}
    - Zapamiętywalność: ${memorability}
    - Do zastosowania: ${appContext}
    ${requirementsList ? `- Dodatkowe wymagania: ${requirementsList}` : ''}
    ${contextDetails}
    ${associationsText}
    ${languageInstruction}
    
    Hasła powinny być różnorodne, unikalne i nawiązywać do podanego kontekstu. Dla każdego hasła dodaj krótki opis jego struktury lub sposobu na zapamiętanie. Nie dodawaj żadnych dodatkowych tekstów na początku ani na końcu odpowiedzi. Odpowiedz tylko hasłami i podpowiedziami.`;
  };
  
  // Dodawanie nowego skojarzenia
  const addAssociation = () => {
    setAssociations([...associations, '']);
  };

  // Aktualizacja skojarzenia o danym indeksie
  const updateAssociation = (index, value) => {
    const newAssociations = [...associations];
    newAssociations[index] = value;
    setAssociations(newAssociations);
  };

  // Usuwanie skojarzenia o danym indeksie
  const removeAssociation = (index) => {
    if (associations.length > 1) {
      const newAssociations = [...associations];
      newAssociations.splice(index, 1);
      setAssociations(newAssociations);
    }
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
      // Powrót do kreatora zamiast do intro
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
  
  // Obsługa postępu kreatora
  const nextStep = () => {
    // Mamy teraz tylko 3 kroki: pamięć, aplikacja, specjalne wymagania + pytania
    if (wizardStep < 2) {
      setWizardStep(wizardStep + 1);
    } else {
      // Generowanie haseł po osiągnięciu końca kreatora
      generateMultiple();
    }
  };
  
  // Przełączanie opcji specjalnych wymagań
  const toggleRequirement = (reqId) => {
    if (specialRequirements.includes(reqId)) {
      setSpecialRequirements(specialRequirements.filter(id => id !== reqId));
    } else {
      setSpecialRequirements([...specialRequirements, reqId]);
    }
  };

  const passwordStrength = calculatePasswordStrength(password);

  // Ekran intro
  if (step === 'intro') {
    return (
      <div className="flex-grow flex flex-col space-y-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 border border-gray-200 dark:border-gray-700 text-center">
          <h2 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-4">
            {t.creativeMode}
          </h2>
          
          <div className="w-28 h-28 mx-auto mb-8 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          
          <p className="text-gray-700 dark:text-gray-300 mb-8 max-w-lg mx-auto text-lg">
            Kreator haseł dopasowanych do Twoich potrzeb. Odpowiedz na kilka pytań, aby wygenerować idealne hasła.
          </p>
          
          <ul className="text-left text-gray-600 dark:text-gray-400 mb-10 max-w-md mx-auto space-y-3">
            <li className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500 mr-3" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-lg">Silne i łatwe do zapamiętania</span>
            </li>
            <li className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500 mr-3" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-lg">Dopasowane do różnych serwisów</span>
            </li>
            <li className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500 mr-3" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-lg">Z podpowiedziami do zapamiętania</span>
            </li>
          </ul>
          
          <button
            onClick={() => setStep('wizard')}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-lg font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
          >
            <span className="flex items-center">
              Rozpocznij kreator
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 ml-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </span>
          </button>
        </div>
      </div>
    );
  }
  
  // Interfejs kreatora
  if (step === 'wizard') {
    return (
      <div className="flex-grow flex flex-col space-y-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 max-w-4xl mx-auto w-full">
          {/* Nagłówek kreatora ze wskaźnikami postępu */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-5 text-white">
            <div className="flex justify-between items-center mb-4">
              <button 
                onClick={goBack}
                className="p-1.5 rounded-full hover:bg-white/10"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h2 className="text-xl font-medium">Kreator hasła</h2>
              <div className="w-6"></div> {/* Wyrównanie dla symetrii */}
            </div>
            
            {/* Kropki postępu - teraz tylko 3 kroki */}
            <div className="flex justify-center space-x-3">
              {[0, 1, 2].map((stepNum) => (
                <div 
                  key={stepNum}
                  className={`w-3 h-3 rounded-full ${wizardStep >= stepNum ? 'bg-white' : 'bg-white/30'}`}
                ></div>
              ))}
            </div>
          </div>
          
          {/* Zawartość kreatora */}
          <div className="p-6">
            {/* Krok 1: Jak dobrze zapamiętujesz hasła */}
            {wizardStep === 0 && (
              <div className="space-y-5">
                <h3 className="text-2xl font-medium text-gray-800 dark:text-gray-200">
                  Jak dobrze zapamiętujesz hasła?
                </h3>
                <p className="text-base text-gray-600 dark:text-gray-400 mb-5">
                  Wybierz opcję, która najlepiej opisuje Twoje preferencje dotyczące zapamiętywalności hasła.
                </p>
                
                <div className="space-y-4">
                  {memoryOptions.map(option => (
                    <div 
                      key={option.id}
                      onClick={() => setMemoryPreference(option.id)}
                      className={`p-5 rounded-lg border-2 cursor-pointer transition-all ${
                        memoryPreference === option.id 
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                          : 'border-gray-200 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-700'
                      }`}
                    >
                      <div className="flex items-center">
                        <div className={`w-6 h-6 rounded-full mr-3 border-2 flex items-center justify-center ${
                          memoryPreference === option.id 
                            ? 'border-blue-500 bg-blue-500' 
                            : 'border-gray-400'
                        }`}>
                          {memoryPreference === option.id && (
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200">{option.label}</h4>
                          <p className="text-base text-gray-600 dark:text-gray-400">{option.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Krok 2: Do jakiej aplikacji potrzebujesz hasła - poprawione wyświetlanie */}
            {wizardStep === 1 && (
              <div className="space-y-5">
                <h3 className="text-2xl font-medium text-gray-800 dark:text-gray-200">
                  Do jakiej aplikacji potrzebujesz hasła?
                </h3>
                <p className="text-base text-gray-600 dark:text-gray-400 mb-5">
                  Wybierz typ serwisu, dla którego tworzysz hasło.
                </p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {applicationOptions.map(option => (
                    <div 
                      key={option.id}
                      onClick={() => setApplicationType(option.id)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all flex flex-col items-center justify-between min-h-[140px] ${
                        applicationType === option.id 
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                          : 'border-gray-200 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-700'
                      }`}
                    >
                      <div className="text-3xl mb-2">{option.icon}</div>
                      <div className="text-center">
                        <h4 className="font-medium text-base text-gray-800 dark:text-gray-200">{option.label}</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{option.description}</p>
                      </div>
                      
                      {/* Wskaźnik wybrania */}
                      {applicationType === option.id && (
                        <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Krok 3: Specjalne wymagania i pytania otwarte */}
            {wizardStep === 2 && (
              <div className="space-y-6">
                {/* Specjalne wymagania */}
                <div>
                  <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-3">
                    Specjalne wymagania (opcjonalnie)
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {requirementOptions.map(option => (
                      <div 
                        key={option.id}
                        className="flex items-center p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 cursor-pointer"
                        onClick={() => toggleRequirement(option.id)}
                      >
                        <input
                          type="checkbox"
                          id={`req-${option.id}`}
                          checked={specialRequirements.includes(option.id)}
                          onChange={() => {}} // Obsługa przez onClick na całym divie
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
                
                {/* Pytania kontekstowe */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-5 mt-5">
                  <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-4">
                    Podaj dodatkowy kontekst (opcjonalnie)
                  </h3>
                  
                  <div className="space-y-4">
                    {/* Pytanie o aplikację */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {getContextQuestions()[0]}
                      </label>
                      <textarea
                        value={customContext}
                        onChange={(e) => setCustomContext(e.target.value)}
                        className="block w-full rounded-md border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 min-h-[80px] resize-none"
                        placeholder="Podaj opis lub pozostaw puste..."
                      />
                    </div>
                    
                    {/* Skojarzenia */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Dodatkowe skojarzenia:
                        </label>
                        <button
                          onClick={addAssociation}
                          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center"
                          type="button"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                          </svg>
                          Dodaj skojarzenie
                        </button>
                      </div>
                      
                      <div className="space-y-2">
                        {associations.map((association, index) => (
                          <div key={index} className="flex items-center">
                            <input
                              type="text"
                              value={association}
                              onChange={(e) => updateAssociation(index, e.target.value)}
                              className="block flex-grow rounded-md border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                              placeholder="Np. wakacje, hobby, ulubiona rzecz..."
                            />
                            {associations.length > 1 && (
                              <button
                                onClick={() => removeAssociation(index)}
                                className="ml-2 p-1 text-gray-500 hover:text-red-500"
                                type="button"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Stopka kreatora */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-5 flex justify-between">
            <button
              onClick={goBack}
              className="px-5 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {wizardStep === 0 ? 'Anuluj' : 'Wstecz'}
            </button>
            <button
              onClick={nextStep}
              disabled={isLoading}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generowanie...
                </span>
              ) : wizardStep < 2 ? 'Dalej' : 'Generuj hasła'}
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // Wyświetlanie wygenerowanej listy haseł
  if (step === 'list') {
    return (
      <div className="flex-grow flex flex-col space-y-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 max-w-4xl mx-auto w-full">
          <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-xl font-medium text-gray-700 dark:text-gray-200">
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
          
          <div className="p-5">
            <p className="text-base text-gray-600 dark:text-gray-400 mb-5">
              Wybierz hasło, które najbardziej Ci odpowiada, lub skopiuj je bezpośrednio:
            </p>
            
            <div className="space-y-4">
              {passwordList.length > 0 ? (
                passwordList.map((pwd, index) => {
                  // Rozdziel hasło i wskazówkę, obsługując przypadki bez znaku |
                  const parts = pwd.text.split('|');
                  const password = parts[0].trim();
                  const hint = parts.length > 1 ? parts[1].trim() : '';

                  return (
                    <div 
                      key={index} 
                      className="flex flex-col p-4 bg-gray-50 dark:bg-gray-750 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <div className="font-mono text-lg font-medium">
                          {password}
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => copyFromList(password, index)}
                            className="p-2 rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
                            title="Kopiuj hasło"
                          >
                            {pwd.copied ? (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                                <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                              </svg>
                            )}
                          </button>
                          <button
                            onClick={() => handleSelectPassword(password, index)}
                            className="p-2 rounded-md bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-800/30 text-blue-700 dark:text-blue-400"
                            title="Szczegóły hasła"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      
                      {/* Wskazówka do hasła */}
                      {hint && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 border-t border-gray-200 dark:border-gray-600 pt-2">
                          <span className="font-medium">Wskazówka:</span> {hint}
                        </p>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-10 text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                  </svg>
                  <p>Nie znaleziono żadnych haseł. Spróbuj wygenerować nowe.</p>
                </div>
              )}
            </div>
            
            {/* Przycisk do generowania większej liczby haseł */}
            <button
              onClick={generateMultiple}
              disabled={isLoading}
              className="w-full mt-6 p-3 bg-blue-600 hover:bg-blue-700 text-white text-base font-medium rounded-md transition-all flex items-center justify-center"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generowanie...
                </span>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                  </svg>
                  Wygeneruj nowe propozycje
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // Widok szczegółów hasła
  if (step === 'customize') {
    return (
      <div className="flex-grow flex flex-col space-y-4">
        {/* Kontener wyświetlania hasła */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 max-w-4xl mx-auto w-full">
          <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-xl font-medium text-gray-700 dark:text-gray-200">
              Analiza hasła
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
          
          {/* Wyświetlanie hasła */}
          <div className="p-6">
            <div className="flex items-center justify-center p-5 bg-gray-50 dark:bg-gray-750 rounded-lg border-2 border-gray-200 dark:border-gray-600">
              <div className="font-mono text-2xl font-medium break-all">
                {password}
              </div>
            </div>
            
            {/* Wskaźnik siły */}
            <div className="mt-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-base text-gray-600 dark:text-gray-400">Siła hasła:</span>
                <span className="text-base font-medium">{getStrengthText(passwordStrength)}</span>
              </div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${getStrengthColor(passwordStrength)} transition-all`}
                  style={{ width: `${(passwordStrength + 1) * 20}%` }}
                ></div>
              </div>
            </div>
            
            {/* Analiza znaków */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 dark:bg-gray-750 rounded-md p-4 text-center">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {password.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Długość</div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-750 rounded-md p-4 text-center">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {(password.match(/[A-Z]/g) || []).length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Wielkie litery</div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-750 rounded-md p-4 text-center">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {(password.match(/[a-z]/g) || []).length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Małe litery</div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-750 rounded-md p-4 text-center">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {(password.match(/[0-9]/g) || []).length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Cyfry</div>
              </div>

              {/* Dodatkowe mierniki */}
              <div className="bg-gray-50 dark:bg-gray-750 rounded-md p-4 text-center">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {(password.match(/[^A-Za-z0-9]/g) || []).length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Znaki specjalne</div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-750 rounded-md p-4 text-center">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {new Set(password).size}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Unikalne znaki</div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-750 rounded-md p-4 text-center col-span-2">
                <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {/* Wyświetlenie przybliżonego czasu złamania hasła */}
                  {passwordStrength < 2 ? "< 1 dzień" : 
                   passwordStrength === 2 ? "kilka miesięcy" :
                   passwordStrength === 3 ? "kilka lat" : 
                   "setki lat"}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Szacowany czas złamania</div>
              </div>
            </div>
          </div>
          
          {/* Przyciski akcji */}
          <div className="p-5 bg-gray-50 dark:bg-gray-750 border-t border-gray-200 dark:border-gray-600">
            <button
              onClick={copyToClipboard}
              className={`w-full flex items-center justify-center py-3 px-4 rounded-md text-base font-medium transition-all ${
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
