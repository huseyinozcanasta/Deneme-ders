import { useSeoMeta } from '@unhead/react';
import { BookOpen, Flame, Target, Brain, Calendar, BarChart3, Zap, ChevronRight, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeToggle } from '@/components/ThemeToggle';
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
    <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-slate-100">
      <div className="relative overflow-hidden bg-white dark:bg-slate-900">
        <div className="absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.18),_transparent_42%)]" />
        <div className="absolute inset-y-0 right-0 w-96 bg-[radial-gradient(circle_at_center,_rgba(14,165,233,0.12),_transparent_32%)]" />
        <div className="absolute inset-x-0 bottom-0 h-72 bg-[radial-gradient(circle_at_bottom_right,_rgba(168,85,247,0.14),_transparent_36%)]" />

        <div className="relative max-w-6xl mx-auto px-6 py-16 md:py-24">
          <div className="flex flex-col-reverse lg:flex-row items-center gap-12">
            <div className="max-w-2xl">
              <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
                Yeni güncelleme · Daha hızlı çalışma akışı
              </span>
              <h1 className="mt-8 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl md:text-6xl dark:text-white">
                Çalışmayı sadeleştir, öğrenmeyi hızlandır.
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600 dark:text-slate-300">
                StudyFlow, slaytlarınızı akıllı şekilde organize eder, quiz ve tekrar kartlarını otomatik üretir. Şimdi daha hafif, daha sakin ve daha etkili bir çalışma deneyimi sunuyor.
              </p>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
                <Button
                  size="lg"
                  className="bg-slate-950 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100"
                  onClick={() => navigate('/subjects')}
                >
                  Çalışmaya Başla
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate('/planner')}
                  className="border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-800"
                >
                  Hemen Planına Bak
                </Button>
              </div>
            </div>

            <div className="w-full max-w-xl">
              <div className="rounded-[2rem] border border-slate-200/80 bg-white/95 p-6 shadow-[0_40px_120px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/80">
                <div className="flex items-center justify-between gap-4 pb-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">StudyFlow</p>
                    <p className="mt-2 text-3xl font-semibold text-slate-950 dark:text-white">Akıllı çalışma panosu</p>
                  </div>
                  <div className="h-12 w-12 rounded-3xl bg-slate-100 text-slate-700 grid place-items-center shadow-inner dark:bg-slate-800 dark:text-slate-200">
                    <Zap className="h-6 w-6" />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-3xl border border-slate-200/80 bg-slate-50 p-4 dark:border-slate-800/70 dark:bg-slate-900/70">
                    <p className="text-sm text-slate-500 dark:text-slate-400">Bugün plan</p>
                    <p className="mt-3 text-2xl font-semibold text-slate-950 dark:text-white">{todayPlans.length}</p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Görev</p>
                  </div>
                  <div className="rounded-3xl border border-slate-200/80 bg-slate-50 p-4 dark:border-slate-800/70 dark:bg-slate-900/70">
                    <p className="text-sm text-slate-500 dark:text-slate-400">Tekrar kartı</p>
                    <p className="mt-3 text-2xl font-semibold text-slate-950 dark:text-white">{cardsToReview}</p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Hazır</p>
                  </div>
                </div>

                <div className="mt-6 grid gap-4">
                  <div className="rounded-3xl border border-slate-200/80 bg-slate-50 p-4 dark:border-slate-800/70 dark:bg-slate-900/70">
                    <p className="text-sm text-slate-500 dark:text-slate-400">Konu sayısı</p>
                    <p className="mt-3 text-2xl font-semibold text-slate-950 dark:text-white">{state.subjects.length}</p>
                  </div>
                  <div className="rounded-3xl border border-slate-200/80 bg-slate-50 p-4 dark:border-slate-800/70 dark:bg-slate-900/70">
                    <p className="text-sm text-slate-500 dark:text-slate-400">Quiz oluşturuldu</p>
                    <p className="mt-3 text-2xl font-semibold text-slate-950 dark:text-white">{state.quizzes.length}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Hızlı erişim</p>
            <h2 className="mt-4 text-3xl font-semibold text-slate-950 dark:text-white">Ana işleri tek yerde topla.</h2>
            <p className="mt-3 max-w-xl text-slate-600 dark:text-slate-300">
              Konularınızı, quizlerinizi ve tekrar kartlarınızı zarif bir panelde yönetin. Her şey kontrollü, anlaşılır ve keyifli.
            </p>
          </div>
          <ThemeToggle />
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {quickActions.map((action, idx) => (
            <Card
              key={idx}
              className="group rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-slate-300 hover:shadow-md dark:border-slate-800/80 dark:bg-slate-950/80"
              onClick={action.action}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-slate-100 text-slate-900 shadow-sm dark:bg-slate-900/70 dark:text-slate-100">
                <action.icon className="h-5 w-5" />
              </div>
              <CardTitle className="mt-6 text-xl font-semibold text-slate-950 dark:text-white">{action.title}</CardTitle>
              <CardDescription className="mt-2 text-slate-600 dark:text-slate-400">{action.description}</CardDescription>
              <div className="mt-6 flex items-center justify-between text-slate-950 dark:text-white">
                <span className="text-3xl font-semibold">{action.count !== null ? action.count : '-'}</span>
                <ChevronRight className="h-5 w-5 text-slate-400 transition group-hover:text-slate-900 dark:text-slate-500 dark:group-hover:text-white" />
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-3xl font-semibold text-slate-950 dark:text-white text-center">Apple esintili çalışma deneyimi</h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-slate-600 dark:text-slate-300">
          Her adımda sadeleşmiş tasarım, hassas gölgeler ve aydınlık bir düzen. StudyFlow, Apple güncellemesi hissiyatıyla çalışma sürecinizi daha zengin hale getirir.
        </p>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          <div className="rounded-[2rem] border border-slate-200/80 bg-slate-50 p-8 shadow-[0_40px_80px_-40px_rgba(15,23,42,0.15)] dark:border-slate-800/80 dark:bg-slate-900/80">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100">
              <Upload className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold text-slate-950 dark:text-white">Hafif ve modern</h3>
            <p className="mt-3 text-slate-600 dark:text-slate-400">Düzgün satırlar, geniş beyaz alan ve zarif ikonografi ile dikkat çekici bir deneyim.</p>
          </div>
          <div className="rounded-[2rem] border border-slate-200/80 bg-slate-50 p-8 shadow-[0_40px_80px_-40px_rgba(15,23,42,0.15)] dark:border-slate-800/80 dark:bg-slate-900/80">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100">
              <Brain className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold text-slate-950 dark:text-white">Akıllı içerik odaklı</h3>
            <p className="mt-3 text-slate-600 dark:text-slate-400">Sade ama güçlü içerik blokları, kullanıcıyı rehberlik ederek yönlendirir.</p>
          </div>
          <div className="rounded-[2rem] border border-slate-200/80 bg-slate-50 p-8 shadow-[0_40px_80px_-40px_rgba(15,23,42,0.15)] dark:border-slate-800/80 dark:bg-slate-900/80">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100">
              <Zap className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold text-slate-950 dark:text-white">Net hareket</h3>
            <p className="mt-3 text-slate-600 dark:text-slate-400">Temiz tipografi ve sezgisel düzenleme sayfayı hızlıca kullanılır kılar.</p>
          </div>
        </div>
      </div>

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
