const translations = {
  en: {
    appTitle: "EasyKey",
    tagline: "Password Generator",
    simpleMode: "Simple Mode",
    creativeMode: "Creative Mode",
    description: "Generate secure and memorable passwords easily",
    underConstruction: "This section is currently under construction",
    generateButton: "Generate Password",
    copyButton: "Copy",
    copiedToClipboard: "Copied to clipboard!",
    passwordLength: "Password Length",
    includeUppercase: "Uppercase Letters (A-Z)",
    includeLowercase: "Lowercase Letters (a-z)",
    includeNumbers: "Numbers (0-9)",
    includeSymbols: "Special Characters (!@#$)",
    generatedPassword: "Your Password",
    passwordStrength: {
      veryWeak: "Very Weak",
      weak: "Weak",
      medium: "Medium",
      strong: "Strong",
      veryStrong: "Very Strong"
    },
    creativeDescription: "AI-powered password generator that creates memorable passwords based on context",
    comingSoon: "Coming Soon!",
    settings: "Settings",
    theme: {
      auto: "Auto Theme",
      light: "Light Theme",
      dark: "Dark Theme"
    },
    language: "Language",
    noPasswordYet: "Generate a password to see it here",
    emptyCharsetError: "Please select at least one character type"
  },
  pl: {
    appTitle: "EasyKey",
    tagline: "Generator Haseł",
    simpleMode: "Tryb Prosty",
    creativeMode: "Tryb Kreatywny",
    description: "Generuj bezpieczne i łatwe do zapamiętania hasła",
    underConstruction: "Ta sekcja jest obecnie w budowie",
    generateButton: "Wygeneruj Hasło",
    copyButton: "Kopiuj",
    copiedToClipboard: "Skopiowano do schowka!",
    passwordLength: "Długość Hasła",
    includeUppercase: "Wielkie Litery (A-Z)",
    includeLowercase: "Małe Litery (a-z)",
    includeNumbers: "Cyfry (0-9)",
    includeSymbols: "Znaki Specjalne (!@#$)",
    generatedPassword: "Twoje Hasło",
    passwordStrength: {
      veryWeak: "Bardzo Słabe",
      weak: "Słabe",
      medium: "Średnie", 
      strong: "Silne",
      veryStrong: "Bardzo Silne"
    },
    creativeDescription: "Generator haseł wspomagany przez AI, tworzący łatwe do zapamiętania hasła bazujące na kontekście",
    comingSoon: "Wkrótce Dostępne!",
    settings: "Ustawienia",
    theme: {
      auto: "Motyw Automatyczny",
      light: "Jasny Motyw",
      dark: "Ciemny Motyw"
    },
    language: "Język",
    noPasswordYet: "Wygeneruj hasło, aby zobaczyć je tutaj",
    emptyCharsetError: "Wybierz przynajmniej jeden typ znaków"
  }
};

// Helper function to get the active language code
export const getActiveLanguage = () => {
  const savedLanguage = localStorage.getItem('easykey-language');
  return savedLanguage || (navigator.language.substring(0, 2) === 'pl' ? 'pl' : 'en');
};

// Helper function to get translations
export const getTranslations = (lang) => {
  return translations[lang] || translations.en;
};

export default translations;
