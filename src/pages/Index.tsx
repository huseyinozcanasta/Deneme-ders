import { useSeoMeta } from '@unhead/react';
import { BookOpen, Flame, Target, Brain, Calendar, BarChart3, Zap, ChevronRight, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useStudyApp } from '@/contexts/StudyAppContext';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  useSeoMeta({
    title: 'StudyFlow - Akıllı Ders Çalışma Platformu',
    description: 'Slaytlarınızı yükleyin, otomatik quizler oluşturun ve spaced repetition ile verimli çalışın.',
  });

  const { state } = useStudyApp();
  const navigate = useNavigate();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayPlans = state.studyPlans.filter(p => {
    const planDate = new Date(p.date);
    planDate.setHours(0, 0, 0, 0);
    return planDate.getTime() === today.getTime();
  });

  const cardsToReview = state.spacedCards.filter(c => c.nextReviewDate <= Date.now()).length;

  const quickActions = [
    {
      icon: BookOpen,
      title: 'Konularım',
      description: 'Çalışmak istediğiniz konuları yönetin',
      count: state.subjects.length,
      action: () => navigate('/subjects'),
      color: 'bg-indigo-500',
    },
    {
      icon: Brain,
      title: 'Tekrar Kartları',
      description: 'Aralıklı tekrar kartlarınızı çalışın',
      count: cardsToReview,
      action: () => navigate('/review'),
      color: 'bg-purple-500',
    },
    {
      icon: Calendar,
      title: 'Bugünün Planı',
      description: 'Bugün yapmanız gerekenler',
      count: todayPlans.length,
      action: () => navigate('/planner'),
      color: 'bg-orange-500',
    },
    {
      icon: BarChart3,
      title: 'İstatistikler',
      description: 'Çalışma performansınızı görün',
      count: null,
      action: () => navigate('/stats'),
      color: 'bg-green-500',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOCAxOC04LjA1OSAxOC0xOC04LjA1OS0xOC0xOC0xOHptMCAzMmMtNy43MzggMC0xNC02LjI2Mi0xNC0xNHM2LjI2Mi0xNCAxNC0xNCAxNCA2LjI2MiAxNCAxNC02LjI2MiAxNC0xNCAxNHoiIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iLjA1Ii8+PC9nPjwvc3ZnPg==')] opacity-30" />
        
        <div className="relative max-w-6xl mx-auto px-6 py-16 md:py-24">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                StudyFlow
              </h1>
              <p className="text-xl md:text-2xl opacity-90 mb-8 max-w-lg">
                Slaytlarınızı yükleyin, otomatik quizler oluşturun ve spaced repetition ile verimli çalışın.
              </p>
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                <Button 
                  size="lg" 
                  variant="secondary"
                  onClick={() => navigate('/subjects')}
                  className="bg-white text-indigo-600 hover:bg-white/90"
                >
                  Başla
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
                <Flame className="h-8 w-8 mx-auto mb-2 text-orange-300" />
                <p className="text-3xl font-bold">{state.stats.streakDays}</p>
                <p className="text-sm opacity-80">Günlük Seri</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
                <Target className="h-8 w-8 mx-auto mb-2 text-green-300" />
                <p className="text-3xl font-bold">{state.subjects.length}</p>
                <p className="text-sm opacity-80">Konu</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
                <Brain className="h-8 w-8 mx-auto mb-2 text-purple-300" />
                <p className="text-3xl font-bold">{cardsToReview}</p>
                <p className="text-sm opacity-80">Tekrar Edilecek</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
                <Zap className="h-8 w-8 mx-auto mb-2 text-yellow-300" />
                <p className="text-3xl font-bold">{state.quizzes.length}</p>
                <p className="text-sm opacity-80">Quiz</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="max-w-6xl mx-auto px-6 py-12 -mt-8 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, idx) => (
            <Card 
              key={idx}
              className="cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1"
              onClick={action.action}
            >
              <CardHeader className="pb-2">
                <div className={`h-10 w-10 rounded-lg ${action.color} flex items-center justify-center mb-2`}>
                  <action.icon className="h-5 w-5 text-white" />
                </div>
                <CardTitle className="text-lg">{action.title}</CardTitle>
                <CardDescription>{action.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">
                    {action.count !== null ? action.count : '-'}
                  </span>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold text-center mb-12">Nasıl Çalışır?</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="h-16 w-16 rounded-full bg-indigo-100 dark:bg-indigo-950/30 flex items-center justify-center mx-auto mb-4">
              <Upload className="h-8 w-8 text-indigo-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">1. Slaytlarınızı Yükleyin</h3>
            <p className="text-muted-foreground">
              PowerPoint, görseller veya metin dosyalarından slaytlarınızı import edin.
            </p>
          </div>

          <div className="text-center">
            <div className="h-16 w-16 rounded-full bg-purple-100 dark:bg-purple-950/30 flex items-center justify-center mx-auto mb-4">
              <Brain className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">2. Quiz Oluşturun</h3>
            <p className="text-muted-foreground">
              Slaytlarınızdan otomatik olarak quiz soruları oluşturun.
            </p>
          </div>

          <div className="text-center">
            <div className="h-16 w-16 rounded-full bg-pink-100 dark:bg-pink-950/30 flex items-center justify-center mx-auto mb-4">
              <Zap className="h-8 w-8 text-pink-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">3. Tekrar Edin</h3>
            <p className="text-muted-foreground">
              Spaced repetition ile bilgileri uzun süreli hafızanıza yerleştirin.
            </p>
          </div>
        </div>
      </div>

      {/* Getting Started */}
      {state.subjects.length === 0 && (
        <div className="max-w-2xl mx-auto px-6 pb-12">
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-xl font-semibold mb-2">Hemen Başlayın</h3>
              <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                İlk konunuzu oluşturarak akıllı çalışma deneyiminize başlayın.
              </p>
              <Button size="lg" onClick={() => navigate('/subjects')}>
                İlk Konuyu Oluştur
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Index;
