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
  // Context fields for AI
  const [customContext, setCustomContext] = useState('');
  const [associations, setAssociations] = useState(['']);
  
  // Memory preference options - translated and language-agnostic
  const getMemoryOptions = () => [
    { id: 'low', 
      label: t.memoryOptions?.easy || 'Easy to remember', 
      description: t.memoryOptions?.easyDesc || 'Simple, but less secure' 
    },
    { id: 'medium', 
      label: t.memoryOptions?.balanced || 'Balanced', 
      description: t.memoryOptions?.balancedDesc || 'Good compromise between memorability and security' 
    },
    { id: 'high', 
      label: t.memoryOptions?.complex || 'Complex', 
      description: t.memoryOptions?.complexDesc || 'Harder to remember, but very secure' 
    }
  ];
  
  // Application type options with universal icons
  const getApplicationOptions = () => [
    { id: 'banking', label: t.appTypes?.banking || 'Banking', icon: '🏦', 
      description: t.appTypes?.bankingDesc || 'Bank accounts, finances, payments' },
    { id: 'email', label: t.appTypes?.email || 'Email', icon: '✉️', 
      description: t.appTypes?.emailDesc || 'Email accounts, communication' },
    { id: 'social', label: t.appTypes?.social || 'Social Media', icon: '👥', 
      description: t.appTypes?.socialDesc || 'Facebook, Twitter, Instagram, etc.' },
    { id: 'work', label: t.appTypes?.work || 'Work', icon: '💼', 
      description: t.appTypes?.workDesc || 'Work accounts, VPN, company systems' },
    { id: 'streaming', label: t.appTypes?.streaming || 'Streaming', icon: '📺', 
      description: t.appTypes?.streamingDesc || 'Netflix, Spotify, YouTube' },
    { id: 'shopping', label: t.appTypes?.shopping || 'Shopping', icon: '🛒', 
      description: t.appTypes?.shoppingDesc || 'Amazon, online stores' },
    { id: 'gaming', label: t.appTypes?.gaming || 'Gaming', icon: '🎮', 
      description: t.appTypes?.gamingDesc || 'Steam, Epic Games, gaming accounts' },
    { id: 'general', label: t.appTypes?.general || 'General', icon: '🔑', 
      description: t.appTypes?.generalDesc || 'For various uses' }
  ];

  // Special requirements options with translations
  const getRequirementOptions = () => [
    { id: 'pronounceable', label: t.reqOptions?.pronounceable || 'Easy to pronounce' },
    { id: 'no-similar', label: t.reqOptions?.noSimilar || 'No similar characters (1, l, I, 0, O)' },
    { id: 'no-consecutive', label: t.reqOptions?.noConsecutive || 'No sequences (123, abc)' },
    { id: 'include-date', label: t.reqOptions?.includeDate || 'Include date/year' },
    { id: 'include-initials', label: t.reqOptions?.includeInitials || 'Include initials/abbreviation' },
    { id: 'no-dictionary', label: t.reqOptions?.noDictionary || 'No complete dictionary words' },
    { id: 'memorable-pattern', label: t.reqOptions?.memorablePattern || 'With easy-to-remember pattern' },
    { id: 'include-colors', label: t.reqOptions?.includeColors || 'Include color names' },
    { id: 'include-animals', label: t.reqOptions?.includeAnimals || 'Include animal names' }
  ];

  // Contextual questions adapted to the application type and current language
  const getContextQuestions = () => {
    // Default questions for each app type with expanded question set
    const questions = {
      banking: [
        t.contextQuestions?.bankingQ1 || "What elements do you associate with finances?",
        t.contextQuestions?.bankingQ2 || "Which numbers are important to you in a financial context?",
        t.contextQuestions?.bankingQ3 || "What banks or financial institutions do you use?",
        t.contextQuestions?.bankingQ4 || "Do you have any financial goals or milestones?",
        t.contextQuestions?.bankingQ5 || "What financial terms are meaningful to you?"
      ],
      email: [
        t.contextQuestions?.emailQ1 || "What words do you use most often in communication?",
        t.contextQuestions?.emailQ2 || "What characterizes your email?",
        t.contextQuestions?.emailQ3 || "What is the purpose of this email account?",
        t.contextQuestions?.emailQ4 || "What domain provider do you use for email?",
        t.contextQuestions?.emailQ5 || "Do you have any specific email folders that are important?"
      ],
      social: [
        t.contextQuestions?.socialQ1 || "What do you associate most with the social media you use?",
        t.contextQuestions?.socialQ2 || "What are your interests on social platforms?",
        t.contextQuestions?.socialQ3 || "Which social media platforms do you use most often?",
        t.contextQuestions?.socialQ4 || "What type of content do you usually engage with?",
        t.contextQuestions?.socialQ5 || "Do you have any favorite hashtags or topics?"
      ],
      work: [
        t.contextQuestions?.workQ1 || "What is your role or position at work?",
        t.contextQuestions?.workQ2 || "What does your company/organization do?",
        t.contextQuestions?.workQ3 || "What tools or software do you use at work?",
        t.contextQuestions?.workQ4 || "What are your professional goals or achievements?",
        t.contextQuestions?.workQ5 || "What industry terms are familiar to you?"
      ],
      streaming: [
        t.contextQuestions?.streamingQ1 || "What are your favorite movies, series or music?",
        t.contextQuestions?.streamingQ2 || "What genres do you watch/listen to most often?",
        t.contextQuestions?.streamingQ3 || "Which streaming platforms do you use?",
        t.contextQuestions?.streamingQ4 || "Who are your favorite actors, directors, or musicians?",
        t.contextQuestions?.streamingQ5 || "What was the last show or album you really enjoyed?"
      ],
      shopping: [
        t.contextQuestions?.shoppingQ1 || "What do you buy online most often?",
        t.contextQuestions?.shoppingQ2 || "What are your favorite brands or stores?",
        t.contextQuestions?.shoppingQ3 || "What types of products interest you the most?",
        t.contextQuestions?.shoppingQ4 || "Do you participate in any loyalty programs?",
        t.contextQuestions?.shoppingQ5 || "What was your most recent or significant purchase?"
      ],
      gaming: [
        t.contextQuestions?.gamingQ1 || "What games do you play most often?",
        t.contextQuestions?.gamingQ2 || "What are your favorite game characters?",
        t.contextQuestions?.gamingQ3 || "What gaming platforms or services do you use?",
        t.contextQuestions?.gamingQ4 || "What game genres do you prefer?",
        t.contextQuestions?.gamingQ5 || "What gaming achievements are you proud of?"
      ],
      general: [
        t.contextQuestions?.generalQ1 || "What is the application/service about?",
        t.contextQuestions?.generalQ2 || "What do you associate with this service/site?",
        t.contextQuestions?.generalQ3 || "How often do you use this application?",
        t.contextQuestions?.generalQ4 || "What is the main purpose for using this service?",
        t.contextQuestions?.generalQ5 || "Are there any specific features you value most?"
      ]
    };
    
    return questions[applicationType] || questions.general;
  };

  const generateMultiple = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      // Generate AI prompt based on user preferences
      const summaryForAI = buildPasswordGenerationPrompt();
      
      // Call API with custom prompt
      const generatedPasswords = await generateMultiplePasswords({
        count: 10, // Always 10 proposals
        prompt: summaryForAI,
        language: getCurrentLanguage(),
        type: "password-wizard"
      });
      
      // Fix formatting issues - remove ** from beginning of password
      const cleanedPasswords = generatedPasswords.map(pwd => {
        let text = pwd;
        if (text.startsWith('**')) {
          text = text.substring(2);
        }
        // If there's ** after the | character, remove those too
        const parts = text.split('|');
        if (parts.length > 1 && parts[1].startsWith('**')) {
          parts[1] = parts[1].substring(2);
          text = parts.join('|');
        }
        
        return { text, copied: false };
      });
      
      setPasswordList(cleanedPasswords);
      setStep('list'); // Go to the password list view
    } catch (err) {
      setError(`${t.error || 'Error'}: ${err.message}`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Helper function to build the password generation prompt
  const buildPasswordGenerationPrompt = () => {
    // Determine password length based on memorability preference
    let securityLevel, length;
    switch (memoryPreference) {
      case 'low': 
        securityLevel = t.securityLevel?.standard || 'standard';
        length = '12-14'; 
        break;
      case 'medium': 
        securityLevel = t.securityLevel?.high || 'high';
        length = '16-20'; 
        break;
      case 'high': 
        securityLevel = t.securityLevel?.veryHigh || 'very high';
        length = '24-30'; 
        break;
      default: 
        securityLevel = t.securityLevel?.high || 'high';
        length = '16-20';
    }
    
    // Determine memorability factor
    let memorability;
    switch (memoryPreference) {
      case 'low': memorability = t.memorability?.easy || 'easy to remember, use patterns, words and phrases'; break;
      case 'medium': memorability = t.memorability?.moderate || 'moderately easy to remember, balance between security and ease'; break;
      case 'high': memorability = t.memorability?.complex || 'complex and very secure, security is the priority'; break;
      default: memorability = t.memorability?.balanced || 'balanced';
    }
    
    // Build special requirements string
    const requirementsList = specialRequirements.map(req => {
      switch(req) {
        case 'pronounceable': return t.reqPrompt?.pronounceable || 'easy to pronounce';
        case 'no-similar': return t.reqPrompt?.noSimilar || 'no similar characters (1, l, I, 0, O)';
        case 'no-consecutive': return t.reqPrompt?.noConsecutive || 'no sequences (123, abc)';
        case 'include-date': return t.reqPrompt?.includeDate || 'includes date or year';
        case 'include-initials': return t.reqPrompt?.includeInitials || 'includes initials or abbreviations';
        case 'no-dictionary': return t.reqPrompt?.noDictionary || 'no complete dictionary words';
        case 'memorable-pattern': return t.reqPrompt?.memorablePattern || 'with easy-to-remember pattern';
        case 'include-colors': return t.reqPrompt?.includeColors || 'includes color references';
        case 'include-animals': return t.reqPrompt?.includeAnimals || 'includes animal references';
        default: return '';
      }
    }).filter(Boolean).join(', ');
    
    // Get application context
    const appOptions = getApplicationOptions();
    const appContext = appOptions.find(app => app.id === applicationType)?.label || t.appTypes?.general || 'general use';
    
    // Add context from open questions
    const contextDetails = customContext.trim() ? 
      `\n${t.promptLabels?.additionalContext || 'Additional context'}: ${customContext}` : '';
    
    // Add associations if present
    const validAssociations = associations.filter(a => a.trim() !== '');
    const associationsText = validAssociations.length > 0 ? 
      `\n${t.promptLabels?.associations || 'Associations'}: ${validAssociations.join(', ')}` : '';
    
    // Language instruction for AI
    const currentLang = getCurrentLanguage();
    const langInstructions = {
      'en': "\nPasswords MUST be generated in English. Use English words and phrases.",
      'pl': "\nHasła MUSZĄ być wygenerowane w języku polskim. Użyj polskich słów i zwrotów, z uwzględnieniem polskich znaków.",
      'de': "\nPasswörter MÜSSEN auf Deutsch generiert werden. Verwenden Sie deutsche Wörter und Ausdrücke.",
      'fr': "\nLes mots de passe DOIVENT être générés en français. Utilisez des mots et expressions français.",
      'es': "\nLas contraseñas DEBEN generarse en español. Use palabras y frases en español."
    };
    
    const languageInstruction = langInstructions[currentLang] || langInstructions.en;
    
    // Create the final prompt
    const promptTemplate = t.passwordPrompt?.template || `Generate 10 password proposals with the following parameters:
    - Length: {length} characters
    - Security level: {securityLevel}
    - Memorability: {memorability}
    - For application: {appContext}
    {requirements}
    {context}
    {associations}
    {language}
    
    Passwords should be diverse, unique and reference the given context. For each password, add a brief description of its structure or how to remember it. Don't add any additional text at the beginning or end of the response. Answer only with passwords and hints.`;
    
    return promptTemplate
      .replace('{length}', length)
      .replace('{securityLevel}', securityLevel)
      .replace('{memorability}', memorability)
      .replace('{appContext}', appContext)
      .replace('{requirements}', requirementsList ? 
        `\n- ${t.promptLabels?.additionalRequirements || 'Additional requirements'}: ${requirementsList}` : '')
      .replace('{context}', contextDetails)
      .replace('{associations}', associationsText)
      .replace('{language}', languageInstruction);
  };
  
  // Add new association
  const addAssociation = () => {
    setAssociations([...associations, '']);
  };

  // Update association at given index
  const updateAssociation = (index, value) => {
    const newAssociations = [...associations];
    newAssociations[index] = value;
    setAssociations(newAssociations);
  };

  // Remove association at given index
  const removeAssociation = (index) => {
    if (associations.length > 1) {
      const newAssociations = [...associations];
      newAssociations.splice(index, 1);
      setAssociations(newAssociations);
    }
  };
  
  // Helper to detect the current language
  const getCurrentLanguage = () => {
    // Check for specific Polish phrases for more accurate detection
    if (t.generateButton === "Wygeneruj Hasło") return "pl";
    if (t.passwordLength === "Długość Hasła") return "pl";
    
    // Continue with existing checks for other languages
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
  
  // Handle wizard progression
  const nextStep = () => {
    if (wizardStep < 2) {
      setWizardStep(wizardStep + 1);
    } else {
      // Generate passwords after reaching the end of the wizard
      generateMultiple();
    }
  };
  
  // Toggle special requirements options
  const toggleRequirement = (reqId) => {
    if (specialRequirements.includes(reqId)) {
      setSpecialRequirements(specialRequirements.filter(id => id !== reqId));
    } else {
      setSpecialRequirements([...specialRequirements, reqId]);
    }
  };

  const passwordStrength = calculatePasswordStrength(password);
  const memoryOptions = getMemoryOptions();
  const applicationOptions = getApplicationOptions();
  const requirementOptions = getRequirementOptions();

  // Intro screen
  if (step === 'intro') {
    return (
      <div className="flex-grow flex flex-col space-y-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 sm:p-8 border border-gray-200 dark:border-gray-700 text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400 mb-3 sm:mb-4">
            {t.creativeMode}
          </h2>
          
          <div className="w-20 h-20 sm:w-28 sm:h-28 mx-auto mb-6 sm:mb-8 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 sm:h-14 sm:w-14 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          
          <p className="text-gray-700 dark:text-gray-300 mb-6 sm:mb-8 max-w-lg mx-auto text-base sm:text-lg">
            {t.creativeDescription || 'Password creator tailored to your needs. Answer a few questions to generate the perfect passwords.'}
          </p>
          
          <ul className="text-left text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto space-y-2 sm:space-y-3">
            <li className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-green-500 mr-2 sm:mr-3" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-base sm:text-lg">{t.creativeFeature1 || 'Strong and easy to remember'}</span>
            </li>
            <li className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-green-500 mr-2 sm:mr-3" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-base sm:text-lg">{t.creativeFeature2 || 'Tailored to different services'}</span>
            </li>
            <li className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-green-500 mr-2 sm:mr-3" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-base sm:text-lg">{t.creativeFeature3 || 'With memory hints included'}</span>
            </li>
          </ul>
          
          <button
            onClick={() => setStep('wizard')}
            className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-base sm:text-lg font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
          >
            <span className="flex items-center">
              {t.startWizard || 'Start wizard'}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 ml-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </span>
          </button>
        </div>
      </div>
    );
  }
  
  // Wizard interface - optimized for single screen on larger displays
  if (step === 'wizard') {
    return (
      <div className="flex-grow flex flex-col space-y-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 max-w-4xl mx-auto w-full">
          {/* Wizard header with progress indicators */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white">
            <div className="flex justify-between items-center mb-3">
              <button 
                onClick={goBack}
                className="p-1.5 rounded-full hover:bg-white/10"
                aria-label={t.back || 'Back'}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h2 className="text-lg sm:text-xl font-medium">
                {t.passwordWizard || 'Password Wizard'}
              </h2>
              <div className="w-5"></div> {/* Balance symmetry */}
            </div>
            
            {/* Progress dots - only 3 steps now */}
            <div className="flex justify-center space-x-3">
              {[0, 1, 2].map((stepNum) => (
                <div 
                  key={stepNum}
                  className={`w-2.5 h-2.5 rounded-full ${wizardStep >= stepNum ? 'bg-white' : 'bg-white/30'}`}
                ></div>
              ))}
            </div>
          </div>
          
          {/* Wizard content - height optimized for larger screens */}
          <div className="p-4 sm:p-5 md:p-6 overflow-y-auto max-h-[calc(100vh-18rem)]">
            {/* Step 1: How well you remember passwords */}
            {wizardStep === 0 && (
              <div className="space-y-4">
                <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200">
                  {t.memoryQuestion || 'How well do you remember passwords?'}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {t.memoryInstructions || 'Choose the option that best describes your password memorability preferences.'}
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
                        <div className={`w-5 h-5 rounded-full mr-3 border-2 flex items-center justify-center ${
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
                          <h4 className="text-base sm:text-lg font-medium text-gray-800 dark:text-gray-200">{option.label}</h4>
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{option.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Step 2: For which application do you need a password */}
            {wizardStep === 1 && (
              <div className="space-y-4">
                <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200">
                  {t.appQuestion || 'For which application do you need a password?'}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {t.appInstructions || 'Choose the type of service you are creating the password for.'}
                </p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {applicationOptions.map(option => (
                    <div 
                      key={option.id}
                      onClick={() => setApplicationType(option.id)}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all flex flex-col items-center justify-between min-h-[120px] ${
                        applicationType === option.id 
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                          : 'border-gray-200 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-700'
                      }`}
                    >
                      <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">{option.icon}</div>
                      <div className="text-center w-full">
                        <h4 className="font-medium text-xs sm:text-sm md:text-base text-gray-800 dark:text-gray-200 line-clamp-1">{option.label}</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2 overflow-hidden break-words">{option.description}</p>
                      </div>
                      
                      {/* Selection indicator */}
                      {applicationType === option.id && (
                        <div className="absolute top-1.5 right-1.5 bg-blue-500 text-white rounded-full p-1">
                          <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Step 3: Special requirements and contextual questions */}
            {wizardStep === 2 && (
              <div className="space-y-5">
                {/* Special requirements */}
                <div>
                  <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">
                    {t.specialReq || 'Special Requirements'} <span className="text-sm font-normal text-gray-500">({t.optional || 'optional'})</span>
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {requirementOptions.map(option => (
                      <div 
                        key={option.id}
                        className="flex items-center p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 cursor-pointer"
                        onClick={() => toggleRequirement(option.id)}
                      >
                        <input
                          type="checkbox"
                          id={`req-${option.id}`}
                          checked={specialRequirements.includes(option.id)}
                          onChange={() => {}} // Handled by onClick on the div
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label 
                          htmlFor={`req-${option.id}`}
                          className="ml-2 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
                        >
                          {option.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Contextual questions */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                  <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-3">
                    {t.additionalContext || 'Additional Context'} <span className="text-sm font-normal text-gray-500">({t.optional || 'optional'})</span>
                  </h3>
                  
                  <div className="space-y-3">
                    {/* Show multiple context questions with a dropdown or selection */}
                    <div className="p-3 bg-gray-50 dark:bg-gray-750 rounded-md border border-gray-200 dark:border-gray-600">
                      <div className="mb-2 flex justify-between items-center">
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                          {t.contextQuestionTitle || 'Answer any of these questions that might help:'}
                        </label>
                      </div>
                      
                      <div className="space-y-2 max-h-[180px] overflow-y-auto px-1 py-2">
                        {getContextQuestions().map((question, idx) => (
                          <div key={idx} className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                            • {question}
                          </div>
                        ))}
                      </div>
                      
                      {/* Context input field */}
                      <div className="mt-3">
                        <textarea
                          value={customContext}
                          onChange={(e) => setCustomContext(e.target.value)}
                          className="block w-full rounded-md border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm min-h-[70px] resize-none"
                          placeholder={t.contextPlaceholder || "Provide description or leave empty..."}
                        />
                      </div>
                    </div>
                    
                    {/* Associations section - fixed styling */}
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                          {t.associations || 'Additional associations'}: <span className="font-normal text-gray-500 text-xs">({t.optional || 'optional'})</span>
                        </label>
                        <button
                          onClick={addAssociation}
                          className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center"
                          type="button"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                          </svg>
                          {t.addAssociation || 'Add association'}
                        </button>
                      </div>
                      
                      <div className="space-y-2 max-h-[120px] overflow-y-auto px-0.5">
                        {associations.map((association, index) => (
                          <div key={index} className="flex items-center">
                            <input
                              type="text"
                              value={association}
                              onChange={(e) => updateAssociation(index, e.target.value)}
                              className="block flex-grow rounded-md border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                              placeholder={t.associationPlaceholder || "E.g., hobby, favorite thing..."}
                            />
                            {associations.length > 1 && (
                              <button
                                onClick={() => removeAssociation(index)}
                                className="ml-2 p-1 text-gray-500 hover:text-red-500"
                                type="button"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
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
          
          {/* Wizard footer with improved translation support */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4 flex justify-between">
            <button
              onClick={goBack}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
            >
              {wizardStep === 0 
                ? (t.cancel || 'Cancel') 
                : (t.back || 'Back')}
            </button>
            <button
              onClick={nextStep}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t.generating || 'Generating...'}
                </span>
              ) : wizardStep < 2 
                ? (t.next || 'Next') 
                : (t.generatePasswords || 'Generate Passwords')}
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // Password list display
  if (step === 'list') {
    return (
      <div className="flex-grow flex flex-col space-y-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 max-w-4xl mx-auto w-full">
          <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-700 dark:text-gray-200">
              {t.passwordSuggestions || 'Password Suggestions'}
            </h2>
            <button
              onClick={goBack}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 20 20" stroke="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          
          <div className="p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {t.selectPasswordPrompt || 'Choose the password that suits you best, or copy it directly:'}
            </p>
            
            <div className="space-y-3 max-h-[calc(100vh-18rem)] overflow-y-auto">
              {passwordList.length > 0 ? (
                passwordList.map((pwd, index) => {
                  // Split password and hint, handling cases without the | character
                  const parts = pwd.text.split('|');
                  const password = parts[0].trim();
                  const hint = parts.length > 1 ? parts[1].trim() : '';

                  return (
                    <div 
                      key={index} 
                      className="flex flex-col p-3 bg-gray-50 dark:bg-gray-750 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                    >
                      <div className="flex justify-between items-center mb-1.5">
                        <div className="font-mono text-base font-medium overflow-x-auto scrollbar-thin">
                          {password}
                        </div>
                        <div className="flex space-x-2 flex-shrink-0">
                          <button
                            onClick={() => copyFromList(password, index)}
                            className="p-1.5 rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
                            title={t.copyPassword || "Copy password"}
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
                            onClick={() => handleSelectPassword(password, index)}
                            className="p-1.5 rounded-md bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-800/30 text-blue-700 dark:text-blue-400"
                            title={t.passwordDetails || "Password details"}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      
                      {/* Password hint */}
                      {hint && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1.5 border-t border-gray-200 dark:border-gray-600 pt-1.5">
                          <span className="font-medium">{t.hint || 'Hint'}:</span> {hint}
                        </p>
                      )}
                    </div>
                  );
                })
              ) : error ? (
                <div className="text-center py-8 text-red-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-3 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p>{error}</p>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                  </svg>
                  <p>{t.noPasswordsFound || 'No passwords found. Try generating new ones.'}</p>
                </div>
              )}
            </div>
            
            {/* Button to generate more passwords */}
            <button
              onClick={generateMultiple}
              disabled={isLoading}
              className="w-full mt-5 p-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-all flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t.generating || 'Generating...'}
                </span>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                  </svg>
                  {t.generateNewSuggestions || 'Generate new suggestions'}
                </>
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
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 max-w-4xl mx-auto w-full">
          <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-700 dark:text-gray-200">
              {t.passwordAnalysis || 'Password Analysis'}
            </h2>
            <button
              onClick={goBack}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 20 20" stroke="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          
          {/* Password display */}
          <div className="p-4 sm:p-5">
            <div className="flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-750 rounded-lg border-2 border-gray-200 dark:border-gray-600 overflow-x-auto">
              <div className="font-mono text-xl font-medium break-all">
                {password}
              </div>
            </div>
            
            {/* Strength indicator */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm text-gray-600 dark:text-gray-400">{t.passwordStrength?.label || 'Password strength'}:</span>
                <span className="text-sm font-medium">{getStrengthText(passwordStrength)}</span>
              </div>
              <div className="h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${getStrengthColor(passwordStrength)} transition-all`}
                  style={{ width: `${(passwordStrength + 1) * 20}%` }}
                ></div>
              </div>
            </div>
            
            {/* Character analysis */}
            <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
              <div className="bg-gray-50 dark:bg-gray-750 rounded-md p-3 text-center">
                <div className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {password.length}
                </div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">{t.length || 'Length'}</div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-750 rounded-md p-3 text-center">
                <div className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {(password.match(/[A-Z]/g) || []).length}
                </div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">{t.uppercase || 'Uppercase'}</div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-750 rounded-md p-3 text-center">
                <div className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {(password.match(/[a-z]/g) || []).length}
                </div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">{t.lowercase || 'Lowercase'}</div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-750 rounded-md p-3 text-center">
                <div className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {(password.match(/[0-9]/g) || []).length}
                </div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">{t.numbers || 'Numbers'}</div>
              </div>

              {/* Additional metrics */}
              <div className="bg-gray-50 dark:bg-gray-750 rounded-md p-3 text-center">
                <div className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {(password.match(/[^A-Za-z0-9]/g) || []).length}
                </div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">{t.specialChars || 'Special chars'}</div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-750 rounded-md p-3 text-center">
                <div className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {new Set(password).size}
                </div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">{t.uniqueChars || 'Unique chars'}</div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-750 rounded-md p-3 text-center col-span-2">
                <div className="text-base sm:text-lg font-bold text-blue-600 dark:text-blue-400">
                  {passwordStrength < 2 ? t.crackTime?.veryFast || "< 1 day" : 
                   passwordStrength === 2 ? t.crackTime?.moderate || "several months" :
                   passwordStrength === 3 ? t.crackTime?.slow || "several years" : 
                   t.crackTime?.veryLong || "centuries"}
                </div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">{t.estimatedCrackTime || 'Estimated crack time'}</div>
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
