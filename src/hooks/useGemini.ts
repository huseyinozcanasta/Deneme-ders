import { useState, useCallback } from 'react';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

const STORAGE_KEY = 'study:gemini-api-key';

interface UseGeminiOptions {
  apiKey?: string;
}

interface GeneratedQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export function useGemini(options: UseGeminiOptions = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) || options.apiKey || '';
  });

  const saveApiKey = useCallback((key: string) => {
    setApiKey(key);
    localStorage.setItem(STORAGE_KEY, key);
  }, []);

  const clearApiKey = useCallback(() => {
    setApiKey('');
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const generateQuizQuestions = useCallback(async (
    slideContent: string,
    subjectName: string,
    count: number = 5
  ): Promise<GeneratedQuestion[]> => {
    if (!apiKey) {
      throw new Error('Gemini API anahtarı gereklidir. Lütfen ayarlardan API anahtarınızı girin.');
    }

    setIsLoading(true);
    setError(null);

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash',
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
        ],
      });

      const prompt = `
Sen bir eğitim uzmanısın. Aşağıdaki ders içeriğinden ${count} adet quiz sorusu oluştur.

Ders: ${subjectName}

İçerik:
${slideContent}

Her soru için şu formatta JSON array oluştur:
[
  {
    "question": "Soru metni",
    "options": ["A) Şık 1", "B) Şık 2", "C) Şık 3", "D) Şık 4"],
    "correctAnswer": 0,
    "explanation": "Doğru cevabın açıklaması"
  }
]

Kurallar:
- Her soru ${subjectName} konusu ile ilgili olmalı
- 4 seçenek olmalı (A, B, C, D)
- Doğru cevap her zaman A, B, C veya D seçeneklerinden biri olmalı
- correctAnswer 0=A, 1=B, 2=C, 3=D şeklinde indeks olmalı
- Açıklama kısa ve öğretici olmalı
- Sorular farklı zorluk seviyelerinde olmalı
- Sadece JSON array döndür, başka hiçbir şey ekleme
`;

      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      // Parse JSON response
      let jsonStr = text.trim();
      
      // Remove markdown code blocks if present
      if (jsonStr.startsWith('```json')) {
        jsonStr = jsonStr.slice(7);
      } else if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.slice(3);
      }
      if (jsonStr.endsWith('```')) {
        jsonStr = jsonStr.slice(0, -3);
      }
      
      jsonStr = jsonStr.trim();

      const questions = JSON.parse(jsonStr) as GeneratedQuestion[];
      
      return questions.map((q, idx) => ({
        ...q,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation || '',
      }));

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Bilinmeyen hata oluştu';
      
      if (errorMessage.includes('API_KEY')) {
        setError('Geçersiz API anahtarı. Lütfen doğru bir Gemini API anahtarı girdiğinizden emin olun.');
      } else if (errorMessage.includes('quota')) {
        setError('API kotası doldu. Lütfen daha sonra tekrar deneyin.');
      } else {
        setError(`Quiz oluşturulamadı: ${errorMessage}`);
      }
      
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [apiKey]);

  const generateFlashcards = useCallback(async (
    slideContent: string,
    subjectName: string,
    count: number = 10
  ): Promise<{ question: string; answer: string }[]> => {
    if (!apiKey) {
      throw new Error('Gemini API anahtarı gereklidir.');
    }

    setIsLoading(true);
    setError(null);

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash',
      });

      const prompt = `
Sen bir eğitim uzmanısın. Aşağıdaki ders içeriğinden ${count} adet flashcards (tekrar kartı) oluştur.

Ders: ${subjectName}

İçerik:
${slideContent}

Her kart için şu formatta JSON array oluştur:
[
  {
    "question": "Sorulacak soru veya kavram",
    "answer": "Cevap veya açıklama"
  }
]

Kurallar:
- Kartlar ${subjectName} konusu ile ilgili önemli kavramları içermeli
- Sorular kısa ve net olmalı
- Cevaplar açıklayıcı olmalı ama çok uzun olmamalı
- Kavramları, tanımları ve önemli bilgileri kapsamalı
- Sadece JSON array döndür, başka hiçbir şey ekleme
`;

      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      let jsonStr = text.trim();
      if (jsonStr.startsWith('```json')) {
        jsonStr = jsonStr.slice(7);
      } else if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.slice(3);
      }
      if (jsonStr.endsWith('```')) {
        jsonStr = jsonStr.slice(0, -3);
      }
      jsonStr = jsonStr.trim();

      const cards = JSON.parse(jsonStr) as { question: string; answer: string }[];
      return cards;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Bilinmeyen hata oluştu';
      setError(`Kartlar oluşturulamadı: ${errorMessage}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [apiKey]);

  const summarizeContent = useCallback(async (
    slideContent: string,
    subjectName: string
  ): Promise<string> => {
    if (!apiKey) {
      throw new Error('Gemini API anahtarı gereklidir.');
    }

    setIsLoading(true);
    setError(null);

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash',
      });

      const prompt = `
Aşağıdaki ders içeriğini özetle ve önemli noktalarını çıkar.

Ders: ${subjectName}

İçerik:
${slideContent}

Özet ve önemli noktalar:
`;

      const result = await model.generateContent(prompt);
      const response = result.response;
      return response.text();

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Bilinmeyen hata oluştu';
      setError(`Özet oluşturulamadı: ${errorMessage}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [apiKey]);

  return {
    apiKey,
    saveApiKey,
    clearApiKey,
    isLoading,
    error,
    generateQuizQuestions,
    generateFlashcards,
    summarizeContent,
    hasApiKey: !!apiKey,
  };
}
