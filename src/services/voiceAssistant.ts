// Voice Assistant Service
// This service handles the voice recognition and text-to-speech functionality

const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
const SpeechRecognition = typeof window !== 'undefined' 
  ? window.SpeechRecognition || (window as any).webkitSpeechRecognition 
  : null;

// Define supported languages and their voice recognition codes
export type SupportedLanguage = 'he-IL' | 'en-US';

export const supportedLanguages = {
  'he-IL': {
    code: 'he-IL',
    name: 'עברית',
    voiceName: 'Google עברית', // For best results in Hebrew
  },
  'en-US': {
    code: 'en-US',
    name: 'English',
    voiceName: 'Google US English', // For best results in English
  }
};

export const defaultLanguage: SupportedLanguage = 'he-IL';

// Command patterns by language
export const commandPatterns = {
  'he-IL': {
    addReminder: /הוס[ף|פ] תזכורת (ל|ב)(.*)/i,
    deleteReminder: /מחק תזכורת (ל|ב)(.*)/i,
    listReminders: /(הצג|מה) התזכורות שלי/i,
    currentTime: /(מה השעה|כמה השעה)/i,
    greeting: /(שלום|היי|בוקר טוב|ערב טוב|לילה טוב)/i,
    cognitive: /(עזור לי להתרכז|אני צריך להתרכז|תזכיר לי איפה אני)/i,
    selfCare: /(אני צריך לנוח|עזור לי להירגע|תן לי תרגיל נשימה)/i,
  },
  'en-US': {
    addReminder: /add (a |)reminder (to |for |about )(.*)/i,
    deleteReminder: /delete (a |)reminder (to |for |about )(.*)/i,
    listReminders: /(show|what are) my reminders/i,
    currentTime: /what('s| is) the time/i,
    greeting: /(hello|hi|good morning|good evening|good night)/i,
    cognitive: /(help me focus|I need to focus|remind me where I am)/i,
    selfCare: /(I need to rest|help me relax|give me a breathing exercise)/i,
  }
};

// Responses by language
export const responses = {
  'he-IL': {
    addReminderSuccess: (text: string) => `הוספתי תזכורת: ${text}`,
    deleteReminderSuccess: (text: string) => `מחקתי תזכורת: ${text}`,
    remindersList: (count: number) => `יש לך ${count} תזכורות.`,
    noReminders: 'אין לך תזכורות כרגע.',
    currentTime: (time: string) => `השעה עכשיו ${time}`,
    greetingMorning: 'בוקר טוב! איך אני יכול לעזור לך היום?',
    greetingAfternoon: 'צהריים טובים! איך אני יכול לעזור לך?',
    greetingEvening: 'ערב טוב! איך אני יכול לעזור לך?',
    greetingNight: 'לילה טוב! האם אתה צריך משהו לפני השינה?',
    notUnderstood: 'אני מצטער, לא הבנתי את הבקשה. אנא נסה שוב.',
    cognitivePrompt: 'אתה כרגע עובד על האפליקציה שלך. התמקד בנשימה שלך למספר שניות ואז המשך במשימה.',
    selfCarePrompt: 'קח הפסקה קצרה. נשום עמוק 4 פעמים, שאף למשך 4 שניות, עצור ל-2 שניות, ונשוף למשך 6 שניות.',
    listeningStarted: 'אני מקשיב...',
    listeningEnded: 'סיימתי להקשיב.',
    errorOccurred: 'קרתה שגיאה, נסה שוב.',
  },
  'en-US': {
    addReminderSuccess: (text: string) => `Added reminder: ${text}`,
    deleteReminderSuccess: (text: string) => `Deleted reminder: ${text}`,
    remindersList: (count: number) => `You have ${count} reminders.`,
    noReminders: 'You have no reminders at the moment.',
    currentTime: (time: string) => `The current time is ${time}`,
    greetingMorning: 'Good morning! How can I help you today?',
    greetingAfternoon: 'Good afternoon! How can I assist you?',
    greetingEvening: 'Good evening! How can I help you?',
    greetingNight: 'Good night! Do you need anything before sleep?',
    notUnderstood: 'I\'m sorry, I didn\'t understand that request. Please try again.',
    cognitivePrompt: 'You\'re currently working on your application. Focus on your breathing for a few seconds and then continue with your task.',
    selfCarePrompt: 'Take a short break. Breathe deeply 4 times, inhale for 4 seconds, hold for 2 seconds, and exhale for 6 seconds.',
    listeningStarted: 'I\'m listening...',
    listeningEnded: 'I stopped listening.',
    errorOccurred: 'An error occurred, please try again.',
  }
};

// Voice assistant service
export class VoiceAssistant {
  private recognition: any;
  private language: SupportedLanguage;
  private isListening: boolean;
  private onResultCallback: (text: string) => void;
  private onListeningChangeCallback: (isListening: boolean) => void;
  private onErrorCallback: (error: string) => void;

  constructor(
    language: SupportedLanguage = defaultLanguage,
    onResult: (text: string) => void = () => {},
    onListeningChange: (isListening: boolean) => void = () => {},
    onError: (error: string) => void = () => {}
  ) {
    this.language = language;
    this.isListening = false;
    this.onResultCallback = onResult;
    this.onListeningChangeCallback = onListeningChange;
    this.onErrorCallback = onError;

    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = this.language;

      this.recognition.onresult = (event: any) => {
        const result = event.results[0][0].transcript;
        this.onResultCallback(result);
      };

      this.recognition.onend = () => {
        this.isListening = false;
        this.onListeningChangeCallback(false);
      };

      this.recognition.onerror = (event: any) => {
        this.isListening = false;
        this.onListeningChangeCallback(false);
        this.onErrorCallback(event.error);
      };
    }
  }

  public speak(text: string): void {
    if (!synth) return;

    // Cancel any ongoing speech
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = this.language;

    // Try to find the best voice for the language
    const voices = synth.getVoices();
    const langVoice = voices.find(
      (voice: SpeechSynthesisVoice) => 
        voice.name === supportedLanguages[this.language].voiceName
    );
    const anyLangVoice = voices.find(
      (voice: SpeechSynthesisVoice) => 
        voice.lang.startsWith(this.language.split('-')[0])
    );
    
    utterance.voice = langVoice || anyLangVoice || null;
    
    // Adjust speech parameters for better comprehension
    utterance.rate = 1.0;  // Normal speaking rate
    utterance.pitch = 1.0; // Normal pitch
    utterance.volume = 1.0; // Full volume
    
    synth.speak(utterance);
  }

  public startListening(): void {
    if (!this.recognition || this.isListening) return;

    try {
      this.recognition.start();
      this.isListening = true;
      this.onListeningChangeCallback(true);
      this.speak(responses[this.language].listeningStarted);
    } catch (error) {
      this.onErrorCallback((error as Error).message);
    }
  }

  public stopListening(): void {
    if (!this.recognition || !this.isListening) return;

    try {
      this.recognition.stop();
      this.isListening = false;
      this.onListeningChangeCallback(false);
      this.speak(responses[this.language].listeningEnded);
    } catch (error) {
      this.onErrorCallback((error as Error).message);
    }
  }

  public setLanguage(language: SupportedLanguage): void {
    this.language = language;
    if (this.recognition) {
      this.recognition.lang = language;
    }
  }

  public getLanguage(): SupportedLanguage {
    return this.language;
  }

  public isSupported(): boolean {
    return !!SpeechRecognition && !!synth;
  }

  public getListeningState(): boolean {
    return this.isListening;
  }
}

// Helper function to get greeting based on time of day
export const getTimeBasedGreeting = (language: SupportedLanguage): string => {
  const hour = new Date().getHours();
  
  if (hour >= 5 && hour < 12) {
    return responses[language].greetingMorning;
  } else if (hour >= 12 && hour < 17) {
    return responses[language].greetingAfternoon;
  } else if (hour >= 17 && hour < 22) {
    return responses[language].greetingEvening;
  } else {
    return responses[language].greetingNight;
  }
};

// Function to parse spoken command and extract reminder text
export const parseReminderText = (text: string, language: SupportedLanguage): string | null => {
  const addPattern = commandPatterns[language].addReminder;
  const match = text.match(addPattern);
  
  if (match && match[2]) {
    return match[2].trim();
  }
  
  return null;
};

// Function to format current time appropriately for speech
export const formatTimeForSpeech = (language: SupportedLanguage): string => {
  const now = new Date();
  let hours = now.getHours();
  const minutes = now.getMinutes();
  
  if (language === 'he-IL') {
    return `${hours}:${minutes < 10 ? '0' + minutes : minutes}`;
  } else {
    const period = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // Convert 0 to 12 for 12 AM
    return `${hours}:${minutes < 10 ? '0' + minutes : minutes} ${period}`;
  }
};

export default VoiceAssistant;