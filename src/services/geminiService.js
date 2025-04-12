const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

/**
 * Generuje bezpieczne i łatwe do zapamiętania hasło przy użyciu Gemini API
 * 
 * @param {Object} options Opcje hasła
 * @param {number} options.length Długość hasła
 * @param {boolean} options.uppercase Czy zawierać wielkie litery
 * @param {boolean} options.lowercase Czy zawierać małe litery 
 * @param {boolean} options.numbers Czy zawierać cyfry
 * @param {boolean} options.symbols Czy zawierać znaki specjalne
 * @param {string} options.context Opcjonalny kontekst do tworzenia hasła (np. "Portal bankowy")
 * @returns {Promise<string>} Wygenerowane hasło
 */
export const generateCreativePassword = async (options) => {
  try {
    // Przygotuj zapytanie do API Gemini
    const characterTypes = [];
    if (options.uppercase) characterTypes.push("wielkie litery (A-Z)");
    if (options.lowercase) characterTypes.push("małe litery (a-z)");
    if (options.numbers) characterTypes.push("cyfry (0-9)");
    if (options.symbols) characterTypes.push("znaki specjalne (!@#$%^&*()_+-=[]{};:,.<>?)");
    
    const contextPrompt = options.context 
      ? `związane z kontekstem: "${options.context}"` 
      : "łatwe do zapamiętania";

    // Tworzenie wiadomości do modelu AI
    const prompt = `Wygeneruj bezpieczne hasło o długości dokładnie ${options.length} znaków, 
      które zawiera: ${characterTypes.join(", ")}. 
      Hasło powinno być ${contextPrompt}.
      Zwróć TYLKO hasło, bez żadnych komentarzy czy wyjaśnień.`;
    
    // Wysłanie zapytania do Gemini API
    const response = await fetch(`${GEMINI_API_URL}/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ]
      })
    });

    // Obsługa odpowiedzi
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    // Wyciągnij samo hasło z odpowiedzi
    const password = data.candidates[0].content.parts[0].text.trim();
    
    return password;
  } catch (error) {
    console.error("Error generating password with Gemini:", error);
    throw error;
  }
};

/**
 * Generuje wiele bezpiecznych haseł przy użyciu Gemini API
 * 
 * @param {Object} options Opcje generowania
 * @param {number} options.count Liczba haseł do wygenerowania (max 10)
 * @param {number} options.length Długość każdego hasła
 * @param {boolean} options.uppercase Czy zawierać wielkie litery
 * @param {boolean} options.lowercase Czy zawierać małe litery
 * @param {boolean} options.numbers Czy zawierać cyfry
 * @param {boolean} options.symbols Czy zawierać znaki specjalne
 * @param {string} options.language Język haseł (en, pl, de, fr, es)
 * @returns {Promise<string[]>} Lista wygenerowanych haseł
 */
export const generateMultiplePasswords = async (options) => {
  try {
    const count = Math.min(options.count || 5, 10); // Maksymalnie 10 haseł
    
    // Przygotuj instrukcje w zależności od języka
    let instructions = "";
    let characterTypes = [];
    
    if (options.uppercase) characterTypes.push(options.language === "pl" ? "wielkie litery (A-Z)" : "uppercase letters (A-Z)");
    if (options.lowercase) characterTypes.push(options.language === "pl" ? "małe litery (a-z)" : "lowercase letters (a-z)");
    if (options.numbers) characterTypes.push(options.language === "pl" ? "cyfry (0-9)" : "numbers (0-9)");
    if (options.symbols) characterTypes.push(options.language === "pl" ? "znaki specjalne (!@#$)" : "special characters (!@#$)");
    
    switch(options.language) {
      case 'pl':
        instructions = `Wygeneruj ${count} różnych, bezpiecznych haseł o długości około ${options.length} znaków każde. 
          Każde hasło powinno zawierać kombinację: ${characterTypes.join(", ")}. 
          Hasła powinny być łatwe do zapamiętania, ale trudne do odgadnięcia.
          Zwróć TYLKO hasła, po jednym w każdej linii, bez numeracji ani dodatkowego tekstu.`;
        break;
      case 'de':
        instructions = `Generiere ${count} verschiedene, sichere Passwörter mit jeweils etwa ${options.length} Zeichen. 
          Jedes Passwort sollte eine Kombination aus: ${characterTypes.join(", ")} enthalten. 
          Die Passwörter sollten einfach zu merken, aber schwer zu erraten sein.
          Gib NUR die Passwörter zurück, eines pro Zeile, ohne Nummerierung oder zusätzlichen Text.`;
        break;
      case 'fr':
        instructions = `Générer ${count} mots de passe différents et sécurisés d'environ ${options.length} caractères chacun. 
          Chaque mot de passe doit contenir une combinaison de : ${characterTypes.join(", ")}. 
          Les mots de passe doivent être faciles à mémoriser mais difficiles à deviner.
          Retournez UNIQUEMENT les mots de passe, un par ligne, sans numérotation ni texte supplémentaire.`;
        break;
      case 'es':
        instructions = `Genera ${count} contraseñas diferentes y seguras de aproximadamente ${options.length} caracteres cada una. 
          Cada contraseña debe contener una combinación de: ${characterTypes.join(", ")}. 
          Las contraseñas deben ser fáciles de recordar pero difíciles de adivinar.
          Devuelve SOLO las contraseñas, una por línea, sin numeración ni texto adicional.`;
        break;
      default: // English
        instructions = `Generate ${count} different, secure passwords with approximately ${options.length} characters each. 
          Each password should contain a combination of: ${characterTypes.join(", ")}. 
          Passwords should be easy to remember but hard to guess.
          Return ONLY the passwords, one per line, without any numbering or additional text.`;
    }
    
    // Wysłanie zapytania do Gemini API
    const response = await fetch(`${GEMINI_API_URL}/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: instructions }]
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Przetwarzanie odpowiedzi - podział na listę haseł
    const text = data.candidates[0].content.parts[0].text.trim();
    const passwords = text.split('\n')
      .map(pwd => pwd.trim())
      .filter(pwd => pwd !== ''); // Filtrowanie pustych linii
    
    return passwords.slice(0, count); // Upewnij się, że mamy dokładnie 'count' haseł
  } catch (error) {
    console.error("Error generating passwords with Gemini:", error);
    throw error;
  }
};

// Możliwość testowania połączenia z API
export const testGeminiConnection = async () => {
  try {
    const response = await fetch(`${GEMINI_API_URL}/gemini-1.5-flash/models?key=${GEMINI_API_KEY}`);
    return response.ok;
  } catch (error) {
    console.error("Cannot connect to Gemini API:", error);
    return false;
  }
};
