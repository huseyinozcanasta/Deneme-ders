import { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle, 
  BookOpen, 
  RotateCcw,
  Lightbulb,
  Target,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useStudyApp } from '@/contexts/StudyAppContext';
import type { Slide, Subject } from '@/types/study';

interface StudyModeProps {
  subject: Subject;
  onComplete?: () => void;
}

export function StudyMode({ subject, onComplete }: StudyModeProps) {
  const { addStudySession, completeSession } = useStudyApp();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [studyMode, setStudyMode] = useState<'learn' | 'review'>('learn');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [studiedSlides, setStudiedSlides] = useState<Set<number>>(new Set());
  const [startTime, setStartTime] = useState<number>(Date.now());

  useEffect(() => {
    const session = addStudySession(subject.id, 'slide');
    setSessionId(session.id);
    setStartTime(Date.now());
    return () => {
      if (sessionId) {
        const duration = Math.round((Date.now() - startTime) / 60000);
        completeSession(sessionId, duration);
      }
    };
  }, []);

  const currentSlide = subject.slides[currentIndex];
  const progress = (studiedSlides.size / subject.slides.length) * 100;

  const markAsStudied = () => {
    setStudiedSlides(prev => new Set(prev).add(currentIndex));
  };

  const nextSlide = () => {
    if (!showAnswer) {
      setShowAnswer(true);
      markAsStudied();
    } else if (currentIndex < subject.slides.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setShowAnswer(false);
    } else {
      // Study session complete
      if (sessionId) {
        const duration = Math.round((Date.now() - startTime) / 60000);
        completeSession(sessionId, duration);
      }
      onComplete?.();
    }
  };

  const prevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setShowAnswer(false);
    }
  };

  const shuffleSlides = () => {
    const shuffled = [...subject.slides].sort(() => Math.random() - 0.5);
    setCurrentIndex(0);
    setShowAnswer(false);
    setStudiedSlides(new Set());
  };

  if (!currentSlide) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Bu konu için slayt bulunmuyor.</p>
          <p className="text-sm text-muted-foreground mt-2">Önce slayt ekleyin.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{subject.name}</h2>
          <p className="text-sm text-muted-foreground">
            {studyMode === 'learn' ? 'Öğrenme Modu' : 'Tekrar Modu'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={shuffleSlides}>
            <RotateCcw className="h-4 w-4 mr-1" />
            Karıştır
          </Button>
          <Button 
            variant={studyMode === 'learn' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setStudyMode('learn')}
          >
            <BookOpen className="h-4 w-4 mr-1" />
            Öğren
          </Button>
          <Button 
            variant={studyMode === 'review' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setStudyMode('review')}
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            Tekrar
          </Button>
        </div>
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">İlerleme</span>
            <span className="text-sm text-muted-foreground">
              {studiedSlides.size} / {subject.slides.length} slayt
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </CardContent>
      </Card>

      {/* Main Study Card */}
      <Card className="min-h-[400px]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <Badge variant="outline">
              Slayt {currentIndex + 1} / {subject.slides.length}
            </Badge>
            {studiedSlides.has(currentIndex) && (
              <Badge className="bg-green-500">
                <CheckCircle className="h-3 w-3 mr-1" />
                İncelendi
              </Badge>
            )}
          </div>
          <CardTitle className="text-2xl">{currentSlide.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[250px] pr-4">
            {currentSlide.imageUrl ? (
              <div className="space-y-4">
                <img 
                  src={currentSlide.imageUrl} 
                  alt={currentSlide.title}
                  className="max-h-48 rounded-lg object-contain"
                />
                {currentSlide.content && (
                  <p className="whitespace-pre-wrap">{currentSlide.content}</p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {studyMode === 'learn' && !showAnswer ? (
                  <div className="space-y-4">
                    <p className="text-lg whitespace-pre-wrap">{currentSlide.content}</p>
                    <div className="flex items-start gap-2 p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
                      <Lightbulb className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-amber-800 dark:text-amber-200">Öğrenme İpucu</p>
                        <p className="text-amber-700 dark:text-amber-300">
                          Bu slaytı dikkatlice inceleyin. İçeriği anladığınızda "Cevabı Göster" butonuna tıklayın.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-lg whitespace-pre-wrap">{currentSlide.content}</p>
                    {currentSlide.notes && (
                      <div className="flex items-start gap-2 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <Target className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                        <div className="text-sm">
                          <p className="font-medium text-blue-800 dark:text-blue-200">Notlar</p>
                          <p className="text-blue-700 dark:text-blue-300">{currentSlide.notes}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-4">
        <Button 
          variant="outline" 
          onClick={prevSlide}
          disabled={currentIndex === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Önceki
        </Button>

        <div className="flex gap-2">
          {subject.slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setCurrentIndex(idx);
                setShowAnswer(false);
              }}
              className={`w-3 h-3 rounded-full transition-colors ${
                idx === currentIndex 
                  ? 'bg-primary' 
                  : studiedSlides.has(idx) 
                    ? 'bg-green-500' 
                    : 'bg-muted'
              }`}
            />
          ))}
        </div>

        <Button onClick={nextSlide}>
          {currentIndex === subject.slides.length - 1 ? (
            <>
              <CheckCircle className="h-4 w-4 mr-1" />
              Tamamla
            </>
          ) : showAnswer ? (
            <>
              Sonraki
              <ChevronRight className="h-4 w-4 ml-1" />
            </>
          ) : (
            <>
              <Lightbulb className="h-4 w-4 mr-1" />
              Cevabı Göster
            </>
          )}
        </Button>
      </div>
    </div>
  );
}