const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

/**
 * Generuje bezpieczne i łatwe do zapamiętania hasło lub wiersz przy użyciu Gemini API
 * 
 * @param {Object} options Opcje generacji
 * @param {number} options.length Długość hasła
 * @param {boolean} options.uppercase Czy zawierać wielkie litery
 * @param {boolean} options.lowercase Czy zawierać małe litery 
 * @param {boolean} options.numbers Czy zawierać cyfry
 * @param {boolean} options.symbols Czy zawierać znaki specjalne
 * @param {string} options.context Opcjonalny kontekst
 * @param {string} options.type Typ generowanego tekstu ("password" lub "poem")
 * @returns {Promise<string>} Wygenerowany tekst
 */
export const generateCreativePassword = async (options) => {
  try {
    let prompt = "";
    
    // Wybierz odpowiedni prompt w zależności od typu
    if (options.type === "poem") {
      prompt = `Wygeneruj krótki, zabawny wiersz o temacie: "${options.context || 'dowolnym'}".
        Wiersz powinien mieć 2-4 linijki i być rymowany.
        Zwróć TYLKO wiersz, bez żadnych komentarzy czy wyjaśnień.`;
    } else {
      // Standardowy prompt dla hasła
      const characterTypes = [];
      if (options.uppercase) characterTypes.push("wielkie litery (A-Z)");
      if (options.lowercase) characterTypes.push("małe litery (a-z)");
      if (options.numbers) characterTypes.push("cyfry (0-9)");
      if (options.symbols) characterTypes.push("znaki specjalne (!@#$%^&*()_+-=[]{};:,.<>?)");
      
      const contextPrompt = options.context 
        ? `związane z kontekstem: "${options.context}"` 
        : "łatwe do zapamiętania";

      prompt = `Wygeneruj bezpieczne hasło o długości dokładnie ${options.length} znaków, 
        które zawiera: ${characterTypes.join(", ")}. 
        Hasło powinno być ${contextPrompt}.
        Zwróć TYLKO hasło, bez żadnych komentarzy czy wyjaśnień.`;
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
 * Generuje wiele bezpiecznych haseł lub wierszy przy użyciu Gemini API
 * 
 * @param {Object} options Opcje generowania
 * @param {number} options.count Liczba haseł do wygenerowania (max 15)
 * @param {number} options.length Długość każdego hasła
 * @param {boolean} options.uppercase Czy zawierać wielkie litery
 * @param {boolean} options.lowercase Czy zawierać małe litery
 * @param {boolean} options.numbers Czy zawierać cyfry
 * @param {boolean} options.symbols Czy zawierać znaki specjalne
 * @param {string} options.language Język haseł (en, pl, de, fr, es)
 * @param {string} options.type Typ generowanego tekstu ("password", "poem", "password-wizard")
 * @param {string} options.prompt Niestandardowe instrukcje dla generatora (używane dla password-wizard)
 * @returns {Promise<string[]>} Lista wygenerowanych haseł lub wierszy
 */
export const generateMultiplePasswords = async (options) => {
  try {
    const count = Math.min(options.count || 5, 15); // Maksymalnie 15 elementów
    let instructions = "";
    
    // Wybieramy instrukcje bazując na typie generowanego tekstu
    if (options.type === "password-wizard") {
      // Używamy niestandardowego promptu dostarczanego z opcji
      instructions = options.prompt + `\n\nKażda propozycja powinna mieć format: "HASŁO|WSKAZÓWKA", 
        gdzie HASŁO to wygenerowane hasło, a WSKAZÓWKA to krótki opis, jak zapamiętać to hasło.
        Wygeneruj dokładnie ${count} propozycji.`;
    }
    else if (options.type === "poem") {
      // Instrukcje dla generowania wierszy w odpowiednim języku
      switch(options.language) {
        case 'pl':
          instructions = `Wygeneruj ${count} krótkich, zabawnych wierszyków w języku polskim. 
            Każdy wiersz powinien mieć 2-4 linijki i zawierać jakiś dowcip lub zabawne skojarzenie.
            Wierszyki powinny być różnorodne tematycznie i rymowane.
            Zwróć TYLKO wierszyki, każdy oddzielony linią '---'.`;
          break;
        case 'de':
          instructions = `Generiere ${count} kurze, lustige Gedichte auf Deutsch. 
            Jedes Gedicht sollte 2-4 Zeilen haben und einen Witz oder eine amüsante Assoziation enthalten.
            Die Gedichte sollten thematisch vielfältig und gereimt sein.
            Gib NUR die Gedichte zurück, jedes durch eine Zeile '---' getrennt.`;
          break;
        case 'fr':
          instructions = `Générez ${count} courts poèmes amusants en français.
            Chaque poème devrait avoir 2-4 lignes et contenir une blague ou une association amusante.
            Les poèmes devraient être thématiquement variés et rimés.
            Retournez UNIQUEMENT les poèmes, chacun séparé par une ligne '---'.`;
          break;
        case 'es':
          instructions = `Genera ${count} poemas cortos y divertidos en español.
            Cada poema debe tener 2-4 líneas y contener alguna broma o asociación divertida.
            Los poemas deben ser temáticamente diversos y rimados.
            Devuelve SOLO los poemas, cada uno separado por una línea '---'.`;
          break;
        default: // English
          instructions = `Generate ${count} short, funny poems in English.
            Each poem should have 2-4 lines and contain some joke or amusing association.
            The poems should be thematically diverse and rhymed.
            Return ONLY the poems, each separated by a line '---'.`;
      }
    } else {
      // Standardowe instrukcje dla haseł
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
    
    // Przetwarzanie odpowiedzi
    const text = data.candidates[0].content.parts[0].text.trim();
    
    // Różne parsowanie w zależności od typu
    let items = [];
    if (options.type === "poem") {
      items = text.split('---')
        .map(poem => poem.trim())
        .filter(poem => poem !== '');
    } else if (options.type === "password-wizard") {
      items = text.split(/\r?\n/)
        .filter(line => line.trim() !== '')
        .map(line => {
          // For password-wizard, each item should be in format: PASSWORD|HINT
          if (!line.includes('|')) {
            return line + '|';
          }
          return line;
        });
    } else {
      items = text.split('\n')
        .map(pwd => pwd.trim())
        .filter(pwd => pwd !== '');
    }
    
    return items.slice(0, count);
  } catch (error) {
    console.error("Error generating with Gemini:", error);
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
