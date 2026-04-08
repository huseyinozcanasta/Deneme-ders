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
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useStudyApp } from '@/contexts/StudyAppContext';
import { StudyMode } from './StudyMode';
import { QuizGenerator, QuizPlayer } from './Quiz';
import { StudyPlanner } from './StudyPlanner';
import { SpacedRepetition } from './SpacedRepetition';
import { StatsDashboard } from './StatsDashboard';
import { SlideUpload } from './SlideUpload';
import type { Quiz } from '@/types/study';

type ViewMode = 'overview' | 'study' | 'quiz' | 'planner' | 'spaced' | 'stats';

export function SubjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state } = useStudyApp();
  const [view, setView] = useState<ViewMode>('overview');
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [showSlideUpload, setShowSlideUpload] = useState(false);

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Button
          variant="outline"
          className="h-auto py-4 flex flex-col items-center gap-2"
          onClick={() => setShowSlideUpload(true)}
        >
          <Upload className="h-6 w-6" />
          <span>Slayt Ekle</span>
        </Button>

        <Button
          variant="outline"
          className="h-auto py-4 flex flex-col items-center gap-2"
          onClick={() => subject.slides.length > 0 ? setView('study') : setShowSlideUpload(true)}
        >
          <BookOpen className="h-6 w-6" />
          <span>Çalış</span>
        </Button>

        <Button
          variant="outline"
          className="h-auto py-4 flex flex-col items-center gap-2"
          onClick={() => setView('planner')}
        >
          <Calendar className="h-6 w-6" />
          <span>Planla</span>
        </Button>

        <Button
          variant="outline"
          className="h-auto py-4 flex flex-col items-center gap-2"
          onClick={() => setView('stats')}
        >
          <BarChart3 className="h-6 w-6" />
          <span>İstatistik</span>
        </Button>
      </div>

      {/* Main Content */}
      <Tabs value={view} onValueChange={(v) => setView(v as ViewMode)}>
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-1">
          <TabsTrigger value="overview" className="whitespace-nowrap justify-center">Genel</TabsTrigger>
          <TabsTrigger value="study" className="whitespace-nowrap justify-center">Öğren</TabsTrigger>
          <TabsTrigger value="quiz" className="whitespace-nowrap justify-center">Quiz</TabsTrigger>
          <TabsTrigger value="planner" className="whitespace-nowrap justify-center">Plan</TabsTrigger>
          <TabsTrigger value="spaced" className="whitespace-nowrap justify-center">Tekrar</TabsTrigger>
          <TabsTrigger value="stats" className="whitespace-nowrap justify-center">İstatistik</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Slides */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Slaytlar
                </CardTitle>
                <CardDescription>
                  {subject.slides.length} slayt
                </CardDescription>
              </CardHeader>
              <CardContent>
                {subject.slides.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">Henüz slayt yok</p>
                    <Button onClick={() => setShowSlideUpload(true)}>
                      <Upload className="h-4 w-4 mr-2" />
                      Slayt Ekle
                    </Button>
                  </div>
                ) : (
                  <ScrollArea className="h-[200px]">
                    <div className="space-y-2">
                      {subject.slides.map((slide, idx) => (
                        <div 
                          key={slide.id} 
                          className="p-3 border rounded-lg flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-muted-foreground">
                              {idx + 1}.
                            </span>
                            <span className="font-medium">{slide.title}</span>
                          </div>
                          {slide.imageUrl && (
                            <span className="text-xs text-muted-foreground">Görüntü</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>

            {/* Quizzes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Quizler
                </CardTitle>
                <CardDescription>
                  {quizzes.length} quiz
                </CardDescription>
              </CardHeader>
              <CardContent>
                {quizzes.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">Henüz quiz yok</p>
                    <Button onClick={() => setView('quiz')}>
                      <Brain className="h-4 w-4 mr-2" />
                      Quiz Oluştur
                    </Button>
                  </div>
                ) : (
                  <ScrollArea className="h-[200px]">
                    <div className="space-y-2">
                      {quizzes.map(quiz => (
                        <div 
                          key={quiz.id} 
                          className="p-3 border rounded-lg flex items-center justify-between"
                        >
                          <div>
                            <p className="font-medium">{quiz.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {quiz.questions.length} soru
                            </p>
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

            {/* Spaced Repetition */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Aralıklı Tekrar
                </CardTitle>
                <CardDescription>
                  {state.spacedCards.filter(c => c.subjectId === id).length} kart
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
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
    </div>
  );
}