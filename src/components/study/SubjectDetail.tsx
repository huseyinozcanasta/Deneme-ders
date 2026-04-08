import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  BookOpen, 
  Brain, 
  Calendar, 
  BarChart3,
  Settings,
  Upload,
  Play,
  ChevronRight,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useStudyApp } from '@/contexts/StudyAppContext';
import { StudyMode } from './StudyMode';
import { QuizGenerator, QuizPlayer } from './Quiz';
import { StudyPlanner } from './StudyPlanner';
import { SpacedRepetition } from './SpacedRepetition';
import { StatsDashboard } from './StatsDashboard';
import { SlideUpload } from './SlideUpload';
import type { Quiz, Slide } from '@/types/study';

type ViewMode = 'overview' | 'study' | 'quiz' | 'planner' | 'spaced' | 'stats';

export function SubjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state } = useStudyApp();
  const [view, setView] = useState<ViewMode>('overview');
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [showSlideUpload, setShowSlideUpload] = useState(false);
  const [previewSlide, setPreviewSlide] = useState<Slide | null>(null);

  const subject = state.subjects.find(s => s.id === id);
  const quizzes = state.quizzes.filter(q => q.subjectId === id);

  useEffect(() => {
    if (!subject && id) {
      navigate('/');
    }
  }, [subject, id, navigate]);

  if (!subject) return null;

  if (activeQuiz) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => setActiveQuiz(null)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Geri Dön
          </Button>
        </div>
        <QuizPlayer 
          quiz={activeQuiz} 
          onComplete={() => setActiveQuiz(null)} 
        />
      </div>
    );
  }

  if (showSlideUpload) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => setShowSlideUpload(false)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Geri Dön
          </Button>
        </div>
        <SlideUpload 
          subjectId={subject.id} 
          onComplete={() => setShowSlideUpload(false)} 
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <div 
                className="h-4 w-4 rounded-full" 
                style={{ backgroundColor: subject.color }}
              />
              <h1 className="text-2xl font-bold">{subject.name}</h1>
            </div>
            {subject.description && (
              <p className="text-muted-foreground">{subject.description}</p>
            )}
          </div>
        </div>
        <ThemeToggle />
      </div>

      {/* Quick Actions */}
      {view === 'overview' && (
        <div className="rounded-[2rem] border border-slate-200/80 bg-slate-50 p-3 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/80">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Button
              variant="outline"
              className="flex h-full flex-col items-start justify-center gap-2 rounded-[1.75rem] border-slate-300 bg-white/90 p-4 text-left text-slate-950 transition hover:border-slate-400 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950/90 dark:text-slate-100 dark:hover:border-slate-600 dark:hover:bg-slate-900"
              onClick={() => setShowSlideUpload(true)}
            >
              <Upload className="h-5 w-5" />
              <span className="text-sm font-semibold">Slayt Ekle</span>
            </Button>

            <Button
              variant="outline"
              className="flex h-full flex-col items-start justify-center gap-2 rounded-[1.75rem] border-slate-300 bg-white/90 p-4 text-left text-slate-950 transition hover:border-slate-400 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950/90 dark:text-slate-100 dark:hover:border-slate-600 dark:hover:bg-slate-900"
              onClick={() => subject.slides.length > 0 ? setView('study') : setShowSlideUpload(true)}
            >
              <BookOpen className="h-5 w-5" />
              <span className="text-sm font-semibold">Çalış</span>
            </Button>

            <Button
              variant="outline"
              className="flex h-full flex-col items-start justify-center gap-2 rounded-[1.75rem] border-slate-300 bg-white/90 p-4 text-left text-slate-950 transition hover:border-slate-400 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950/90 dark:text-slate-100 dark:hover:border-slate-600 dark:hover:bg-slate-900"
              onClick={() => setView('planner')}
            >
              <Calendar className="h-5 w-5" />
              <span className="text-sm font-semibold">Planla</span>
            </Button>

            <Button
              variant="outline"
              className="flex h-full flex-col items-start justify-center gap-2 rounded-[1.75rem] border-slate-300 bg-white/90 p-4 text-left text-slate-950 transition hover:border-slate-400 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950/90 dark:text-slate-100 dark:hover:border-slate-600 dark:hover:bg-slate-900"
              onClick={() => setView('stats')}
            >
              <BarChart3 className="h-5 w-5" />
              <span className="text-sm font-semibold">İstatistik</span>
            </Button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <Tabs value={view} onValueChange={(v) => setView(v as ViewMode)}>
        <TabsList className="flex w-full gap-2 overflow-x-auto rounded-3xl border border-slate-200/80 bg-slate-50 p-2 dark:border-slate-800/70 dark:bg-slate-900/80">
          <TabsTrigger value="overview" className="min-w-[110px] rounded-3xl py-3 px-4 text-sm font-semibold text-slate-700 data-[state=active]:bg-slate-950 data-[state=active]:text-white dark:text-slate-400 dark:data-[state=active]:bg-white dark:data-[state=active]:text-slate-950">Genel</TabsTrigger>
          <TabsTrigger value="study" className="min-w-[110px] rounded-3xl py-3 px-4 text-sm font-semibold text-slate-700 data-[state=active]:bg-slate-950 data-[state=active]:text-white dark:text-slate-400 dark:data-[state=active]:bg-white dark:data-[state=active]:text-slate-950">Öğren</TabsTrigger>
          <TabsTrigger value="quiz" className="min-w-[110px] rounded-3xl py-3 px-4 text-sm font-semibold text-slate-700 data-[state=active]:bg-slate-950 data-[state=active]:text-white dark:text-slate-400 dark:data-[state=active]:bg-white dark:data-[state=active]:text-slate-950">Quiz</TabsTrigger>
          <TabsTrigger value="planner" className="min-w-[110px] rounded-3xl py-3 px-4 text-sm font-semibold text-slate-700 data-[state=active]:bg-slate-950 data-[state=active]:text-white dark:text-slate-400 dark:data-[state=active]:bg-white dark:data-[state=active]:text-slate-950">Plan</TabsTrigger>
          <TabsTrigger value="spaced" className="min-w-[110px] rounded-3xl py-3 px-4 text-sm font-semibold text-slate-700 data-[state=active]:bg-slate-950 data-[state=active]:text-white dark:text-slate-400 dark:data-[state=active]:bg-white dark:data-[state=active]:text-slate-950">Tekrar</TabsTrigger>
          <TabsTrigger value="stats" className="min-w-[110px] rounded-3xl py-3 px-4 text-sm font-semibold text-slate-700 data-[state=active]:bg-slate-950 data-[state=active]:text-white dark:text-slate-400 dark:data-[state=active]:bg-white dark:data-[state=active]:text-slate-950">İstatistik</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
              <Card className="rounded-[1.75rem] border border-slate-200/80 bg-slate-50 p-5 dark:border-slate-800/70 dark:bg-slate-950/80">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-950 dark:text-white">
                    <BookOpen className="h-5 w-5" />
                    Slaytlar
                  </CardTitle>
                  <CardDescription className="mt-1 text-slate-500 dark:text-slate-400">
                    {subject.slides.length} slayt
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {subject.slides.length === 0 ? (
                    <div className="text-center py-10">
                      <p className="text-slate-500 dark:text-slate-400 mb-4">Henüz slayt yok</p>
                      <Button onClick={() => setShowSlideUpload(true)}>
                        <Upload className="h-4 w-4 mr-2" />
                        Slayt Ekle
                      </Button>
                    </div>
                  ) : (
                    <ScrollArea className="h-[220px] rounded-3xl border border-slate-200/70 bg-white p-3 dark:border-slate-800/70 dark:bg-slate-950/80">
                      <div className="space-y-3">
                        {subject.slides.map((slide, idx) => (
                          <button
                            key={slide.id}
                            onClick={() => setPreviewSlide(slide)}
                            className="w-full text-left rounded-3xl border border-slate-200/80 bg-slate-50 p-4 dark:border-slate-800/70 dark:bg-slate-900/80 hover:border-slate-400 hover:bg-slate-100 dark:hover:border-slate-700 dark:hover:bg-slate-800 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">{idx + 1}</span>
                              <span className="font-medium text-slate-900 dark:text-slate-100 line-clamp-1">{slide.title}</span>
                            </div>
{slide.imageUrl ? (
  <div className="mt-2">
    <img
      src={slide.imageUrl}
      alt={slide.title}
      className="h-12 w-16 object-cover rounded"
    />
  </div>
) : (
  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">
    {slide.content?.substring(0, 60) || 'İçerik mevcut'}
  </p>
)}
                          </button>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>

              <Card className="rounded-[1.75rem] border border-slate-200/80 bg-slate-50 p-5 dark:border-slate-800/70 dark:bg-slate-950/80">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-950 dark:text-white">
                    <Brain className="h-5 w-5" />
                    Quizler
                  </CardTitle>
                  <CardDescription className="mt-1 text-slate-500 dark:text-slate-400">
                    {quizzes.length} quiz
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {quizzes.length === 0 ? (
                    <div className="text-center py-10">
                      <p className="text-slate-500 dark:text-slate-400 mb-4">Henüz quiz yok</p>
                      <Button onClick={() => setView('quiz')}>
                        <Brain className="h-4 w-4 mr-2" />
                        Quiz Oluştur
                      </Button>
                    </div>
                  ) : (
                    <ScrollArea className="h-[220px] rounded-3xl border border-slate-200/80 bg-white p-3 dark:border-slate-800/70 dark:bg-slate-950/80">
                      <div className="space-y-3">
                        {quizzes.map(quiz => (
                          <div 
                            key={quiz.id} 
                            className="flex items-center justify-between rounded-3xl border border-slate-200/80 bg-slate-50 p-4 dark:border-slate-800/70 dark:bg-slate-900/80"
                          >
                            <div>
                              <p className="font-medium text-slate-900 dark:text-slate-100">{quiz.title}</p>
                              <p className="text-sm text-slate-500 dark:text-slate-400">{quiz.questions.length} soru</p>
                            </div>
                            <Button 
                              size="sm" 
                              onClick={() => setActiveQuiz(quiz)}
                            >
                              <Play className="h-4 w-4 mr-1" />
                              Başla
                            </Button>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>

              <Card className="rounded-[1.75rem] border border-slate-200/80 bg-slate-50 p-5 dark:border-slate-800/70 dark:bg-slate-950/80">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-950 dark:text-white">
                    <Brain className="h-5 w-5" />
                    Aralıklı Tekrar
                  </CardTitle>
                  <CardDescription className="mt-1 text-slate-500 dark:text-slate-400">
                    {state.spacedCards.filter(c => c.subjectId === id).length} kart
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => setView('quiz')}
                    >
                      <Brain className="h-4 w-4 mr-2" />
                      Quiz Oluştur
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => setView('spaced')}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Tekrar Et
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="study" className="mt-6">
          <StudyMode 
            subject={subject} 
            onComplete={() => setView('overview')} 
          />
        </TabsContent>

        <TabsContent value="quiz" className="mt-6">
          <QuizGenerator 
            subject={subject} 
            onComplete={() => setView('overview')} 
          />
        </TabsContent>

        <TabsContent value="planner" className="mt-6">
          <StudyPlanner subject={subject} />
        </TabsContent>

        <TabsContent value="spaced" className="mt-6">
          <SpacedRepetition subject={subject} />
        </TabsContent>

        <TabsContent value="stats" className="mt-6">
          <StatsDashboard subject={subject} />
        </TabsContent>
      </Tabs>

      {/* Slide Preview Dialog */}
      <Dialog open={!!previewSlide} onOpenChange={(open) => !open && setPreviewSlide(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">{previewSlide?.title}</DialogTitle>
            <DialogClose className="absolute right-4 top-4" />
          </DialogHeader>
          <div className="space-y-4">
            {previewSlide?.imageUrl && (
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden">
                <img
                  src={previewSlide.imageUrl}
                  alt={previewSlide.title}
                  className="w-full h-auto object-contain max-h-96"
                />
              </div>
            )}
            {previewSlide?.content && (
              <div className="space-y-2">
                <h4 className="font-semibold text-sm text-slate-600 dark:text-slate-400">İçerik</h4>
                <p className="text-sm leading-relaxed whitespace-pre-wrap text-slate-900 dark:text-slate-100">
                  {previewSlide.content}
                </p>
              </div>
            )}
            {previewSlide?.notes && (
              <div className="space-y-2 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="font-semibold text-sm text-blue-800 dark:text-blue-200">Notlar</h4>
                <p className="text-sm leading-relaxed whitespace-pre-wrap text-blue-900 dark:text-blue-100">
                  {previewSlide.notes}
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}