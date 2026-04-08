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
  Clock,
  Zap
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
import { useStudyApp } from '@/contexts/StudyAppContext';
import type { Quiz, QuizQuestion, Subject } from '@/types/study';

interface QuizGeneratorProps {
  subject: Subject;
  onComplete?: () => void;
}

export function QuizGenerator({ subject, onComplete }: QuizGeneratorProps) {
  const { addQuiz, addSpacedCard } = useStudyApp();
  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState<Omit<QuizQuestion, 'id'>[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState(0);
  const [explanation, setExplanation] = useState('');
  const [mode, setMode] = useState<'create' | 'generate'>('create');

  // Generate questions from slides using AI-like logic
  const generateFromSlides = () => {
    const newQuestions: Omit<QuizQuestion, 'id'>[] = [];
    
    subject.slides.forEach((slide, slideIdx) => {
      // Generate a question from each slide
      const keyPoints = slide.content.split('\n').filter(l => l.trim().length > 10);
      
      if (keyPoints.length > 0) {
        const correctOption = keyPoints[0].substring(0, 80);
        const wrongOptions = keyPoints.slice(1, 4).map(k => k.substring(0, 80));
        
        while (wrongOptions.length < 3) {
          wrongOptions.push(`Diğer seçenek ${wrongOptions.length + 1}`);
        }
        
        // Shuffle options
        const allOptions = [correctOption, ...wrongOptions].sort(() => Math.random() - 0.5);
        const correctIdx = allOptions.indexOf(correctOption);
        
        newQuestions.push({
          question: `"${slide.title}" konusu ile ilgili hangisi doğrudur?`,
          options: allOptions,
          correctAnswer: correctIdx >= 0 ? correctIdx : 0,
          explanation: `Doğru cevap: ${correctOption}`,
        });
      }
      
      // Add a true/false question
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
      // Create a generic question if no slides
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
    
    // Also create spaced repetition cards
    questions.forEach(q => {
      addSpacedCard(subject.id, q.question, q.explanation || q.options[q.correctAnswer]);
    });
    
    onComplete?.();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Quiz Oluştur
          </CardTitle>
          <CardDescription>
            {subject.name} konusu için soru hazırlayın veya otomatik oluşturun
          </CardDescription>
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

            <div className="flex gap-2">
              <Button 
                variant={mode === 'create' ? 'default' : 'outline'} 
                onClick={() => setMode('create')}
              >
                <Plus className="h-4 w-4 mr-2" />
                Manuel Ekle
              </Button>
              <Button 
                variant={mode === 'generate' ? 'default' : 'outline'} 
                onClick={() => {
                  setMode('generate');
                  generateFromSlides();
                }}
              >
                <Zap className="h-4 w-4 mr-2" />
                Slaytlardan Oluştur
              </Button>
            </div>

            {mode === 'create' && (
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
            )}

            {questions.length > 0 && (
              <div className="space-y-2">
                <Label>Oluşturulan Sorular ({questions.length})</Label>
                <ScrollArea className="h-[200px]">
                  <div className="space-y-2">
                    {questions.map((q, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{idx + 1}. {q.question}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Doğru: {q.options[q.correctAnswer]}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeQuestion(idx)}
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
              Quiz Kaydet ve Spaced Card Oluştur
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
        
        // Update stats
        setState(prev => ({
          ...prev,
          stats: {
            ...prev.stats,
            quizzesCompleted: prev.stats.quizzesCompleted + 1,
            averageQuizScore: prev.stats.averageQuizScore 
              ? (prev.stats.averageQuizScore + (score / quiz.questions.length * 100)) / 2
              : (score / quiz.questions.length * 100),
          }
        }));
        
        onComplete?.(score, quiz.questions.length);
      }
    }, 1500);
  };

  const isCorrect = selectedAnswer === currentQ?.correctAnswer;

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