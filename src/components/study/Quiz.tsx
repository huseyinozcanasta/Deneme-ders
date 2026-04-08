import { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Play, 
  CheckCircle, 
  XCircle,
  ArrowRight,
  Target,
  Brain,
  Zap,
  Loader2,
  Sparkles,
  AlertCircle,
  Settings,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useStudyApp } from '@/contexts/StudyAppContext';
import { useGemini } from '@/hooks/useGemini';
import { GeminiSettings } from './GeminiSettings';
import type { Quiz, QuizQuestion, Subject } from '@/types/study';

interface QuizGeneratorProps {
  subject: Subject;
  onComplete?: () => void;
}

export function QuizGenerator({ subject, onComplete }: QuizGeneratorProps) {
  const { addQuiz, addSpacedCard } = useStudyApp();
  const { generateQuizQuestions, generateFlashcards, isLoading, error, hasApiKey } = useGemini();
  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState<Omit<QuizQuestion, 'id'>[]>([]);
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState(0);
  const [explanation, setExplanation] = useState('');
  const [mode, setMode] = useState<'manual' | 'gemini' | 'basic'>('gemini');
  const [questionCount, setQuestionCount] = useState(5);
  const [generationStatus, setGenerationStatus] = useState('');

  const slideContent = subject.slides
    .map((s, i) => `--- Slayt ${i + 1}: ${s.title} ---\n${s.content}${s.imageUrl ? '\n[Görsel içerik]' : ''}`)
    .join('\n\n');

  const handleGeminiGenerate = async () => {
    if (!hasApiKey) {
      return;
    }

    if (subject.slides.length === 0) {
      setGenerationStatus('Lütfen önce slayt ekleyin!');
      return;
    }

    setGenerationStatus('Quiz oluşturuluyor...');

    try {
      const generated = await generateQuizQuestions(
        slideContent,
        subject.name,
        questionCount
      );

      const newQuestions: Omit<QuizQuestion, 'id'>[] = generated.map(q => ({
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
      }));

      setQuestions(newQuestions);
      setTitle(`${subject.name} - AI Quiz`);
      setGenerationStatus(`${newQuestions.length} soru oluşturuldu!`);
    } catch (err) {
      console.error('Quiz generation failed:', err);
      setGenerationStatus('Quiz oluşturulamadı. Tekrar deneyin.');
    }
  };

  const handleGeminiFlashcards = async () => {
    if (!hasApiKey) {
      return;
    }

    if (subject.slides.length === 0) {
      setGenerationStatus('Lütfen önce slayt ekleyin!');
      return;
    }

    setGenerationStatus('Kartlar oluşturuluyor...');

    try {
      const cards = await generateFlashcards(slideContent, subject.name, questionCount * 2);

      cards.forEach(card => {
        addSpacedCard(subject.id, card.question, card.answer);
      });

      setGenerationStatus(`${cards.length} tekrar kartı oluşturuldu!`);
    } catch (err) {
      console.error('Flashcard generation failed:', err);
      setGenerationStatus('Kartlar oluşturulamadı. Tekrar deneyin.');
    }
  };

  // Basic generation from slides (without AI)
  const generateFromSlides = () => {
    const newQuestions: Omit<QuizQuestion, 'id'>[] = [];
    
    subject.slides.forEach((slide, slideIdx) => {
      const keyPoints = slide.content.split('\n').filter(l => l.trim().length > 10);
      
      if (keyPoints.length > 0) {
        const correctOption = keyPoints[0].substring(0, 80);
        const wrongOptions = keyPoints.slice(1, 4).map(k => k.substring(0, 80));
        
        while (wrongOptions.length < 3) {
          wrongOptions.push(`Diğer seçenek ${wrongOptions.length + 1}`);
        }
        
        const allOptions = [correctOption, ...wrongOptions].sort(() => Math.random() - 0.5);
        const correctIdx = allOptions.indexOf(correctOption);
        
        newQuestions.push({
          question: `"${slide.title}" konusu ile ilgili hangisi doğrudur?`,
          options: allOptions,
          correctAnswer: correctIdx >= 0 ? correctIdx : 0,
          explanation: `Doğru cevap: ${correctOption}`,
        });
      }
      
      if (slide.content) {
        const isTrue = Math.random() > 0.5;
        newQuestions.push({
          question: `"${slide.title}" konusu ile ilgili aşağıdaki ifade doğru mu?`,
          options: ['Doğru', 'Yanlış'],
          correctAnswer: isTrue ? 0 : 1,
          explanation: isTrue ? 'Bu ifade slayt içeriğine uygundur.' : 'Bu ifade slayt içeriği ile çelişmektedir.',
        });
      }
    });

    if (newQuestions.length === 0) {
      newQuestions.push({
        question: `${subject.name} konusu ile ilgili ne biliyorsunuz?`,
        options: ['Temel bilgileri biliyorum', 'İleri seviye biliyorum', 'Hiçbir şey bilmiyorum', 'Biraz biliyorum'],
        correctAnswer: 0,
        explanation: 'Kendinizi değerlendirin.',
      });
    }

    setQuestions(newQuestions);
    setTitle(`${subject.name} - Otomatik Test`);
  };

  const addQuestion = () => {
    if (!question.trim() || options.filter(o => o.trim()).length < 2) return;

    setQuestions(prev => [...prev, {
      question,
      options: options.map(o => o || 'Seçenek'),
      correctAnswer,
      explanation,
    }]);

    setQuestion('');
    setOptions(['', '', '', '']);
    setCorrectAnswer(0);
    setExplanation('');
  };

  const removeQuestion = (idx: number) => {
    setQuestions(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSave = () => {
    if (!title.trim() || questions.length === 0) return;
    
    addQuiz(subject.id, title, questions);
    
    questions.forEach(q => {
      addSpacedCard(subject.id, q.question, q.explanation || q.options[q.correctAnswer]);
    });
    
    onComplete?.();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Quiz Oluştur
              </CardTitle>
              <CardDescription>
                {subject.name} konusu için soru hazırlayın
              </CardDescription>
            </div>
            <GeminiSettings />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Quiz Başlığı</Label>
              <Input
                placeholder="Örn: Matematik Bölüm 1 Testi"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* Mode Selection */}
            <Tabs value={mode} onValueChange={(v) => setMode(v as any)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="gemini" className="gap-1">
                  <Sparkles className="h-4 w-4" />
                  AI ile Oluştur
                </TabsTrigger>
                <TabsTrigger value="basic" className="gap-1">
                  <Zap className="h-4 w-4" />
                  Otomatik
                </TabsTrigger>
                <TabsTrigger value="manual" className="gap-1">
                  <Plus className="h-4 w-4" />
                  Manuel
                </TabsTrigger>
              </TabsList>

              {/* AI Generation Tab */}
              <TabsContent value="gemini" className="space-y-4 mt-4">
                {!hasApiKey ? (
                  <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-amber-800 dark:text-amber-200">
                            Gemini API Anahtarı Gerekli
                          </p>
                          <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                            AI ile quiz oluşturmak için Gemini API anahtarınızı girmeniz gerekiyor.
                          </p>
                          <GeminiSettings />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Soru Sayısı</Label>
                        <Select value={questionCount.toString()} onValueChange={(v) => setQuestionCount(parseInt(v))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="3">3 Soru</SelectItem>
                            <SelectItem value="5">5 Soru</SelectItem>
                            <SelectItem value="10">10 Soru</SelectItem>
                            <SelectItem value="15">15 Soru</SelectItem>
                            <SelectItem value="20">20 Soru</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Slayt Durumu</Label>
                        <div className="flex items-center gap-2 h-10 px-3 border rounded-md">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{subject.slides.length} slayt hazır</span>
                        </div>
                      </div>
                    </div>

                    {error && (
                      <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                      </div>
                    )}

                    {generationStatus && (
                      <div className={`p-3 border rounded-lg ${
                        generationStatus.includes('başarılı') || generationStatus.includes('oluşturuldu')
                          ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800'
                          : 'bg-muted'
                      }`}>
                        <p className="text-sm">{generationStatus}</p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <Button 
                        onClick={handleGeminiGenerate}
                        disabled={isLoading || subject.slides.length === 0}
                        className="gap-2"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Oluşturuluyor...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4" />
                            Quiz Oluştur
                          </>
                        )}
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={handleGeminiFlashcards}
                        disabled={isLoading || subject.slides.length === 0}
                        className="gap-2"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Oluşturuluyor...
                          </>
                        ) : (
                          <>
                            <Brain className="h-4 w-4" />
                            Sadece Kartlar Oluştur
                          </>
                        )}
                      </Button>
                    </div>

                    <p className="text-xs text-muted-foreground text-center">
                      AI, yüklediğiniz slaytlardan konu ile ilgili anlamlı sorular oluşturur
                    </p>
                  </div>
                )}
              </TabsContent>

              {/* Basic Generation Tab */}
              <TabsContent value="basic" className="space-y-4 mt-4">
                <div className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm">
                      <strong>Otomatik Oluşturma:</strong> Slaytlarınızdan basit sorular oluşturur.
                      Her slayt için bir doğru/yanlış ve bir çoktan seçmeli soru eklenir.
                    </p>
                  </div>

                  <Button 
                    onClick={generateFromSlides}
                    disabled={subject.slides.length === 0}
                    className="w-full gap-2"
                  >
                    <Zap className="h-4 w-4" />
                    Slaytlardan Oluştur ({subject.slides.length} slayt)
                  </Button>

                  {subject.slides.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center">
                      Önce slayt ekleyin
                    </p>
                  )}
                </div>
              </TabsContent>

              {/* Manual Tab */}
              <TabsContent value="manual" className="space-y-4 mt-4">
                <div className="space-y-4 p-4 border rounded-lg">
                  <div className="space-y-2">
                    <Label>Soru</Label>
                    <Textarea
                      placeholder="Soruyu buraya yazın..."
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Seçenekler</Label>
                    {options.map((opt, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="correct"
                          checked={correctAnswer === idx}
                          onChange={() => setCorrectAnswer(idx)}
                          className="h-4 w-4"
                        />
                        <Input
                          placeholder={`Seçenek ${idx + 1}`}
                          value={opt}
                          onChange={(e) => {
                            const newOpts = [...options];
                            newOpts[idx] = e.target.value;
                            setOptions(newOpts);
                          }}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <Label>Açıklama (İsteğe bağlı)</Label>
                    <Textarea
                      placeholder="Doğru cevabın açıklaması..."
                      value={explanation}
                      onChange={(e) => setExplanation(e.target.value)}
                    />
                  </div>

                  <Button onClick={addQuestion} disabled={!question.trim()}>
                    <Plus className="h-4 w-4 mr-2" />
                    Soru Ekle
                  </Button>
                </div>
              </TabsContent>
            </Tabs>

            {/* Questions List */}
            {questions.length > 0 && (
              <div className="space-y-2">
                <Label>Oluşturulan Sorular ({questions.length})</Label>
                <ScrollArea className="h-[250px]">
                  <div className="space-y-2">
                    {questions.map((q, idx) => (
                      <div key={idx} className="flex items-start justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{idx + 1}. {q.question}</p>
                          <div className="mt-1 space-y-0.5">
                            {q.options.map((opt, optIdx) => (
                              <p 
                                key={optIdx} 
                                className={`text-xs ${optIdx === q.correctAnswer ? 'text-green-600 font-medium' : 'text-muted-foreground'}`}
                              >
                                {String.fromCharCode(65 + optIdx)}) {opt}
                              </p>
                            ))}
                          </div>
                          {q.explanation && (
                            <p className="text-xs text-muted-foreground mt-2">
                              💡 {q.explanation}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeQuestion(idx)}
                          className="shrink-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}

            <Button 
              onClick={handleSave} 
              disabled={!title.trim() || questions.length === 0}
              className="w-full"
            >
              <ArrowRight className="h-4 w-4 mr-2" />
              Quiz Kaydet ve Tekrar Kartları Oluştur
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface QuizPlayerProps {
  quiz: Quiz;
  onComplete?: (score: number, total: number) => void;
}

export function QuizPlayer({ quiz, onComplete }: QuizPlayerProps) {
  const { addStudySession, completeSession, state } = useStudyApp();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [answers, setAnswers] = useState<number[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [quizComplete, setQuizComplete] = useState(false);
  const [finalScore, setFinalScore] = useState({ correct: 0, total: 0 });

  useEffect(() => {
    const session = addStudySession(quiz.subjectId, 'quiz');
    setSessionId(session.id);
    setStartTime(Date.now());
  }, []);

  const currentQ = quiz.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

  const handleAnswer = (idx: number) => {
    if (showResult) return;
    setSelectedAnswer(idx);
  };

  const nextQuestion = () => {
    if (selectedAnswer === null) return;
    
    const newAnswers = [...answers, selectedAnswer];
    setAnswers(newAnswers);
    setShowResult(true);

    setTimeout(() => {
      if (currentQuestion < quiz.questions.length - 1) {
        setCurrentQuestion(prev => prev + 1);
        setSelectedAnswer(null);
        setShowResult(false);
      } else {
        // Quiz complete
        const score = newAnswers.filter((a, i) => a === quiz.questions[i].correctAnswer).length;
        if (sessionId) {
          const duration = Math.round((Date.now() - startTime) / 60000);
          completeSession(sessionId, duration);
        }
        
        setFinalScore({ correct: score, total: quiz.questions.length });
        setQuizComplete(true);
        onComplete?.(score, quiz.questions.length);
      }
    }, 1500);
  };

  // Quiz Complete Screen
  if (quizComplete) {
    const percentage = Math.round((finalScore.correct / finalScore.total) * 100);
    const emoji = percentage >= 80 ? '🎉' : percentage >= 60 ? '👍' : percentage >= 40 ? '💪' : '📚';
    const message = percentage >= 80 
      ? 'Mükemmel! Çok iyi performans!' 
      : percentage >= 60 
        ? 'İyi iş! Biraz daha pratik yap.' 
        : percentage >= 40 
          ? 'Fena değil! Tekrar çalışmaya devam et.' 
          : 'Daha fazla çalışmaya ihtiyacın var.';

    return (
      <div className="space-y-6">
        <Card className="text-center py-12">
          <CardContent>
            <div className="text-6xl mb-4">{emoji}</div>
            <h2 className="text-2xl font-bold mb-2">Quiz Tamamlandı!</h2>
            <p className="text-muted-foreground mb-6">{message}</p>
            
            <div className="flex justify-center gap-8 mb-6">
              <div>
                <p className="text-4xl font-bold text-green-500">{finalScore.correct}</p>
                <p className="text-sm text-muted-foreground">Doğru</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-red-500">{finalScore.total - finalScore.correct}</p>
                <p className="text-sm text-muted-foreground">Yanlış</p>
              </div>
              <div>
                <p className="text-4xl font-bold">{percentage}%</p>
                <p className="text-sm text-muted-foreground">Başarı</p>
              </div>
            </div>

            <Button onClick={onComplete} className="w-full">
              <ArrowRight className="h-4 w-4 mr-2" />
              Geri Dön
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">{quiz.title}</h2>
          <p className="text-sm text-muted-foreground">
            Soru {currentQuestion + 1} / {quiz.questions.length}
          </p>
        </div>
        <Badge variant="outline">
          <Target className="h-3 w-3 mr-1" />
          {answers.filter((a, i) => a === quiz.questions[i]?.correctAnswer).length} doğru
        </Badge>
      </div>

      {/* Progress */}
      <Progress value={progress} className="h-2" />

      {/* Question Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{currentQ?.question}</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup 
            value={selectedAnswer?.toString()} 
            onValueChange={(v) => handleAnswer(parseInt(v))}
            className="space-y-3"
          >
            {currentQ?.options.map((option, idx) => (
              <div
                key={idx}
                onClick={() => handleAnswer(idx)}
                className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all ${
                  showResult 
                    ? idx === currentQ.correctAnswer 
                      ? 'border-green-500 bg-green-50 dark:bg-green-950/20' 
                      : selectedAnswer === idx 
                        ? 'border-red-500 bg-red-50 dark:bg-red-950/20'
                        : 'opacity-50'
                    : selectedAnswer === idx 
                      ? 'border-primary bg-primary/5' 
                      : 'hover:border-primary/50'
                }`}
              >
                <RadioGroupItem value={idx.toString()} disabled={showResult} />
                <Label className="flex-1 cursor-pointer">{option}</Label>
                {showResult && idx === currentQ.correctAnswer && (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                )}
                {showResult && selectedAnswer === idx && idx !== currentQ.correctAnswer && (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
              </div>
            ))}
          </RadioGroup>

          {showResult && currentQ.explanation && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium">Açıklama:</p>
              <p className="text-sm text-muted-foreground">{currentQ.explanation}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <Button 
        onClick={nextQuestion} 
        disabled={selectedAnswer === null || !showResult}
        className="w-full"
      >
        {currentQuestion < quiz.questions.length - 1 ? (
          <>
            Sonraki Soru
            <ArrowRight className="h-4 w-4 ml-2" />
          </>
        ) : (
          <>
            <CheckCircle className="h-4 w-4 mr-2" />
            Testi Tamamla
          </>
        )}
      </Button>
    </div>
  );
}
