const translations = {
  en: {
    appTitle: "EasyKey",
    tagline: "Password Generator",
    simpleMode: "Simple Mode",
    creativeMode: "Creative Mode",
    mode: "Mode",
    selectMode: "Select Mode",
    description: "Generate secure and memorable passwords easily",
    generateButton: "Generate Password",
    copyButton: "Copy",
    copiedToClipboard: "Copied!",
    passwordLength: "Password Length",
    includeUppercase: "Uppercase (A-Z)",
    includeLowercase: "Lowercase (a-z)",
    includeNumbers: "Numbers (0-9)",
    includeSymbols: "Special Chars (!@#$)",
    generatedPassword: "Your Password",
    passwordStrength: {
      veryWeak: "Very Weak",
      weak: "Weak",
      medium: "Medium",
      strong: "Strong",
      veryStrong: "Very Strong"
    },
    settings: "Settings",
    theme: {
      auto: "Auto Theme",
      light: "Light Mode",
      dark: "Dark Mode"
    },
    language: "Language",
    noPasswordYet: "Generate a password to see it here",
    emptyCharsetError: "Please select at least one character type",
    modeTooltips: {
      simple: "Basic password with customizable options",
      creative: "Advanced settings with additional features"
    },
    underConstruction: "This Section is Under Construction",
    comingSoon: "Coming Soon!",
    creativeDescription: "AI-powered password generator that creates memorable passwords based on context"
  },
  pl: {
    appTitle: "EasyKey",
    tagline: "Generator Haseł",
    simpleMode: "Tryb Prosty",
    creativeMode: "Tryb Kreatywny",
    mode: "Tryb",
    selectMode: "Wybierz Tryb",
    description: "Generuj bezpieczne i łatwe do zapamiętania hasła",
    generateButton: "Wygeneruj Hasło",
    copyButton: "Kopiuj",
    copiedToClipboard: "Skopiowano!",
    passwordLength: "Długość Hasła",
    includeUppercase: "Wielkie (A-Z)",
    includeLowercase: "Małe (a-z)",
    includeNumbers: "Cyfry (0-9)",
    includeSymbols: "Znaki spec. (!@#$)",
    generatedPassword: "Twoje Hasło",
    passwordStrength: {
      veryWeak: "Bardzo Słabe",
      weak: "Słabe",
      medium: "Średnie", 
      strong: "Silne",
      veryStrong: "Bardzo Silne"
    },
    settings: "Ustawienia",
    theme: {
      auto: "Motyw Auto",
      light: "Jasny",
      dark: "Ciemny"
    },
    language: "Język",
    noPasswordYet: "Wygeneruj hasło, aby zobaczyć je tutaj",
    emptyCharsetError: "Wybierz przynajmniej jeden typ znaków",
    modeTooltips: {
      simple: "Podstawowe hasło z opcjami dostosowania",
      creative: "Zaawansowane ustawienia z dodatkowymi funkcjami"
    },
    underConstruction: "Ta Sekcja Jest W Budowie",
    comingSoon: "Wkrótce Dostępne!",
    creativeDescription: "Generator haseł wspomagany przez AI, tworzący łatwe do zapamiętania hasła bazujące na kontekście"
  }
};

// Helper function to get the active language code
export const getActiveLanguage = () => {
  const savedLanguage = localStorage.getItem('easykey-language');
  if (savedLanguage) return savedLanguage;
  
  // Get browser language and check if it's supported
  const browserLang = navigator.language.substring(0, 2).toLowerCase();
  return translations[browserLang] ? browserLang : 'en';
};

// Helper function to get translations
export const getTranslations = (lang) => {
  return translations[lang] || translations.en;
};

export default translations;
