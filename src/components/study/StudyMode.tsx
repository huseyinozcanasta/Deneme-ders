import { useState, useEffect, useMemo, useRef } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle, 
  BookOpen, 
  RotateCcw,
  Lightbulb,
  Target,
  Sparkles,
  Loader2,
  AlertCircle,
  MessageSquare,
  Save,
  X as XIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useStudyApp } from '@/contexts/StudyAppContext';
import { useGemini } from '@/hooks/useGemini';
import { GeminiSettings } from './GeminiSettings';
import type { Slide, Subject } from '@/types/study';

interface StudyModeProps {
  subject: Subject;
  onComplete?: () => void;
}

interface AISummary {
  summary: string;
  keyPoints: string[];
  explanation: string;
}

export function StudyMode({ subject, onComplete }: StudyModeProps) {
  const { addStudySession, completeSession, updateSlide } = useStudyApp();
  const { summarizeContent, isLoading, error, hasApiKey } = useGemini();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [studyMode, setStudyMode] = useState<'learn' | 'review'>('learn');
  const [showAnswer, setShowAnswer] = useState(false);
  const [studiedSlides, setStudiedSlides] = useState<Set<number>>(new Set());
  const [aiSummary, setAiSummary] = useState<AISummary | null>(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [editingNote, setEditingNote] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [isSavingNote, setIsSavingNote] = useState(false);
  const sessionIdRef = useRef<string | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    const session = addStudySession(subject.id, 'slide');
    sessionIdRef.current = session.id;
    startTimeRef.current = Date.now();
    return () => {
      if (sessionIdRef.current) {
        const duration = Math.round((Date.now() - startTimeRef.current) / 60000);
        completeSession(sessionIdRef.current, duration);
      }
    };
  }, [addStudySession, completeSession, subject.id]);

  // Generate AI summary when slide changes
  useEffect(() => {
    if (hasApiKey && currentSlide?.content) {
      generateSummary();
    }
  }, [currentIndex, hasApiKey]);

  // Update note content when slide changes
  useEffect(() => {
    setNoteContent(currentSlide?.notes || '');
    setEditingNote(false);
  }, [currentIndex]);

  const currentSlide = subject.slides[currentIndex];
  const progress = (studiedSlides.size / subject.slides.length) * 100;

  const generateSummary = async () => {
    if (!currentSlide?.content || isGeneratingSummary) return;
    
    setIsGeneratingSummary(true);
    setAiSummary(null);
    
    try {
      const slideContent = currentSlide.content;
      const slideTitle = currentSlide.title;
      
      // Use the summarizeContent function from useGemini
      const summary = await summarizeContent(slideContent, slideTitle);
      
      // Parse the summary into structured format
      const lines = summary.split('\n').filter(l => l.trim());
      const keyPoints: string[] = [];
      let mainSummary = '';
      
      for (const line of lines) {
        if (line.includes('•') || line.includes('-') || line.match(/^\d+\./)) {
          keyPoints.push(line.replace(/^[•\-\d]+\.\s*/, '').trim());
        } else if (line.length > 50 && !mainSummary) {
          mainSummary = line;
        }
      }
      
      setAiSummary({
        summary: mainSummary || summary.substring(0, 300),
        keyPoints: keyPoints.slice(0, 5),
        explanation: `Bu slayt "${slideTitle}" konusunda önemli bilgiler içermektedir.`
      });
    } catch (err) {
      console.error('Failed to generate summary:', err);
      // Fallback to basic summary
      setAiSummary({
        summary: currentSlide.content.substring(0, 200) + '...',
        keyPoints: currentSlide.content.split('\n').filter(l => l.trim().length > 10).slice(0, 3),
        explanation: 'Bu slayt hakkında detaylı bilgi için içeriği inceleyin.'
      });
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const markAsStudied = () => {
    setStudiedSlides(prev => new Set(prev).add(currentIndex));
  };

  const saveNote = async () => {
    if (!currentSlide) return;
    
    setIsSavingNote(true);
    try {
      await updateSlide(subject.id, currentSlide.id, {
        notes: noteContent || undefined
      });
      setEditingNote(false);
    } catch (err) {
      console.error('Failed to save note:', err);
    } finally {
      setIsSavingNote(false);
    }
  };

  const nextSlide = () => {
    if (!showAnswer) {
      setShowAnswer(true);
      markAsStudied();
    } else if (currentIndex < subject.slides.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setShowAnswer(false);
    } else {
      if (sessionIdRef.current) {
        const duration = Math.round((Date.now() - startTimeRef.current) / 60000);
        completeSession(sessionIdRef.current, duration);
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
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-bold flex-1">{subject.name}</h2>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={shuffleSlides}
          className="hidden sm:inline-flex"
        >
          <RotateCcw className="h-4 w-4 mr-1" />
          Karıştır
        </Button>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={shuffleSlides}
          className="sm:hidden"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      {/* Main Study Card */}
      <Card className="min-h-[380px] md:min-h-[500px]">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <Badge variant="outline" className="text-xs">
                {currentIndex + 1} / {subject.slides.length}
              </Badge>
              <CardTitle className="text-base leading-tight mt-2 line-clamp-2">{currentSlide.title}</CardTitle>
            </div>
            {studiedSlides.has(currentIndex) && (
              <Badge className="bg-green-500 flex-shrink-0">
                <CheckCircle className="h-3 w-3" />
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="pb-3">
          <Tabs defaultValue="content" className="w-full">
            <TabsList className="flex w-full gap-1 rounded-lg bg-slate-100 dark:bg-slate-800 p-1">
              <TabsTrigger value="content" className="flex-1 gap-1 px-2 py-1 text-xs sm:text-sm">
                <BookOpen className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">İçerik</span>
              </TabsTrigger>
              <TabsTrigger value="ai" className="flex-1 gap-1 px-2 py-1 text-xs sm:text-sm">
                <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">AI Özet</span>
                {isGeneratingSummary && <Loader2 className="h-2 w-2 sm:h-3 sm:w-3 animate-spin" />}
              </TabsTrigger>
              <TabsTrigger value="notes" className="flex-1 gap-1 px-2 py-1 text-xs sm:text-sm">
                <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Notlar</span>
              </TabsTrigger>
            </TabsList>

            {/* Content Tab */}
            <TabsContent value="content" className="mt-2">
              <ScrollArea className="h-[180px] sm:h-[300px] pr-4">
                <div className="space-y-4">
                  {currentSlide.imageUrl && (
                    <img 
                      src={currentSlide.imageUrl} 
                      alt={currentSlide.title}
                      className="max-h-48 rounded-lg object-contain mx-auto"
                    />
                  )}
                  <p className="text-lg whitespace-pre-wrap leading-relaxed">
                    {currentSlide.content || 'Bu slaytta metin içeriği bulunmuyor.'}
                  </p>
                </div>
              </ScrollArea>
            </TabsContent>

            {/* AI Summary Tab */}
            <TabsContent value="ai" className="mt-2">
              <ScrollArea className="h-[180px] sm:h-[300px] pr-4">
                {!hasApiKey ? (
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                      <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-amber-800 dark:text-amber-200">
                          AI Özeti İçin API Anahtarı Gerekli
                        </p>
                        <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                          AI destekli özet ve önemli noktalar için Gemini API anahtarınızı girin.
                        </p>
                      </div>
                    </div>
                    <GeminiSettings />
                  </div>
                ) : isGeneratingSummary ? (
                  <div className="flex flex-col items-center justify-center py-12 space-y-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-muted-foreground">AI içerik analiz ediyor...</p>
                  </div>
                ) : aiSummary ? (
                  <div className="space-y-6">
                    {/* Summary */}
                    <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="h-4 w-4 text-indigo-600" />
                        <p className="font-medium text-indigo-800 dark:text-indigo-200">Özet</p>
                      </div>
                      <p className="text-sm leading-relaxed text-indigo-900 dark:text-indigo-100">
                        {aiSummary.summary}
                      </p>
                    </div>

                    {/* Key Points */}
                    {aiSummary.keyPoints.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-primary" />
                          <p className="font-medium">Önemli Noktalar</p>
                        </div>
                        <div className="space-y-2">
                          {aiSummary.keyPoints.map((point, idx) => (
                            <div 
                              key={idx}
                              className="flex items-start gap-2 p-3 bg-muted rounded-lg"
                            >
                              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                                {idx + 1}
                              </span>
                              <p className="text-sm leading-relaxed">{point}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Explanation */}
                    <div className="flex items-start gap-2 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                      <Lightbulb className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-green-800 dark:text-green-200">Açıklama</p>
                        <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                          {aiSummary.explanation}
                        </p>
                      </div>
                    </div>

                    {/* Regenerate Button */}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={generateSummary}
                      className="w-full"
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Yeniden Analiz Et
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Button onClick={generateSummary}>
                      <Sparkles className="h-4 w-4 mr-2" />
                      AI ile Özet Oluştur
                    </Button>
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            {/* Notes Tab */}
            <TabsContent value="notes" className="mt-2">
              <ScrollArea className="h-[180px] sm:h-[300px] pr-4">
                <div className="space-y-4">
                  {editingNote ? (
                    <div className="space-y-3">
                      <Textarea
                        value={noteContent}
                        onChange={(e) => setNoteContent(e.target.value)}
                        placeholder="Bu slayt için notlarınızı yazın..."
                        className="min-h-[120px] resize-none text-sm"
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={saveNote}
                          disabled={isSavingNote}
                          className="flex-1"
                        >
                          <Save className="h-4 w-4 mr-2" />
                          {isSavingNote ? 'Kaydediliyor...' : 'Kaydet'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingNote(false);
                            setNoteContent(currentSlide?.notes || '');
                          }}
                          disabled={isSavingNote}
                        >
                          <XIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {currentSlide?.notes ? (
                        <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <MessageSquare className="h-4 w-4 text-blue-600" />
                              <p className="font-medium text-blue-800 dark:text-blue-200">Notlar</p>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setEditingNote(true)}
                            >
                              Düzenle
                            </Button>
                          </div>
                          <p className="text-sm whitespace-pre-wrap leading-relaxed text-blue-900 dark:text-blue-100">
                            {currentSlide.notes}
                          </p>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p className="mb-4">Bu slayt için not eklenmemiş.</p>
                          <Button
                            size="sm"
                            onClick={() => setEditingNote(true)}
                          >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Not Ekle
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
              İlerle
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
