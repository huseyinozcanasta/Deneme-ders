import { useMemo } from 'react';
import { 
  Trophy, 
  Clock, 
  Target, 
  Flame, 
  BookOpen,
  TrendingUp,
  Calendar,
  Award,
  Brain,
  Zap
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useStudyApp } from '@/contexts/StudyAppContext';
import type { Subject } from '@/types/study';

interface StatsDashboardProps {
  subject?: Subject;
}

export function StatsDashboard({ subject }: StatsDashboardProps) {
  const { state } = useStudyApp();

  const stats = useMemo(() => {
    let filteredSessions = subject 
      ? state.studySessions.filter(s => s.subjectId === subject.id)
      : state.studySessions;

    const totalTime = filteredSessions
      .filter(s => s.completed)
      .reduce((acc, s) => {
        if (s.endTime) {
          return acc + (s.endTime - s.startTime);
        }
        return acc;
      }, 0);

    const sessionCount = filteredSessions.filter(s => s.completed).length;
    const quizCount = filteredSessions.filter(s => s.type === 'quiz' && s.completed).length;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTime = filteredSessions
      .filter(s => s.completed && s.startTime >= today.getTime())
      .reduce((acc, s) => {
        if (s.endTime) return acc + (s.endTime - s.startTime);
        return acc;
      }, 0);

    const weeklyTime = (() => {
      const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      return filteredSessions
        .filter(s => s.completed && s.startTime >= weekAgo)
        .reduce((acc, s) => {
          if (s.endTime) return acc + (s.endTime - s.startTime);
          return acc;
        }, 0);
    })();

    return {
      totalTime,
      sessionCount,
      quizCount,
      todayTime,
      weeklyTime,
      streak: state.stats.streakDays,
      avgScore: state.stats.averageQuizScore,
      totalSubjects: state.subjects.length,
      totalQuizzes: state.quizzes.length,
      totalCards: state.spacedCards.length,
      masteredCards: state.spacedCards.filter(c => c.interval >= 21).length,
    };
  }, [state, subject]);

  const formatTime = (ms: number) => {
    const minutes = Math.round(ms / 60000);
    if (minutes < 60) return `${minutes} dk`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}s ${mins}dk`;
  };

  const subjectStats = useMemo(() => {
    if (subject) return null;

    return state.subjects.map(s => {
      const sessions = state.studySessions.filter(ss => ss.subjectId === s.id && ss.completed);
      const totalTime = sessions.reduce((acc, ss) => {
        if (ss.endTime) return acc + (ss.endTime - ss.startTime);
        return acc;
      }, 0);
      
      return {
        id: s.id,
        name: s.name,
        color: s.color,
        slides: s.slides.length,
        time: totalTime,
        sessions: sessions.length,
      };
    }).sort((a, b) => b.time - a.time);
  }, [state.subjects, state.studySessions, subject]);

  return (
    <div className="space-y-6">
      {/* Main Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-950/30 flex items-center justify-center">
                <Flame className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Seri</p>
                <p className="text-2xl font-bold">{stats.streak}</p>
                <p className="text-xs text-muted-foreground">gün</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-950/30 flex items-center justify-center">
                <Clock className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Toplam Süre</p>
                <p className="text-2xl font-bold">{formatTime(stats.totalTime)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-950/30 flex items-center justify-center">
                <Target className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Quiz Tamamlandı</p>
                <p className="text-2xl font-bold">{stats.quizCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-950/30 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ortalama Skor</p>
                <p className="text-2xl font-bold">{stats.avgScore.toFixed(0)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Time Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5" />
              Bu Gün
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatTime(stats.todayTime)}</div>
            <p className="text-sm text-muted-foreground mt-2">
              çalışma süresi
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Zap className="h-5 w-5" />
              Bu Hafta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatTime(stats.weeklyTime)}</div>
            <p className="text-sm text-muted-foreground mt-2">
              çalışma süresi
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Spaced Repetition Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Aralıklı Tekrar İstatistikleri
          </CardTitle>
          <CardDescription>
            Tekrar kartları performansı
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-2xl font-bold">{stats.totalCards}</p>
              <p className="text-sm text-muted-foreground">Toplam Kart</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-2xl font-bold text-green-500">{stats.masteredCards}</p>
              <p className="text-sm text-muted-foreground">Mastered</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-2xl font-bold text-blue-500">{state.quizzes.length}</p>
              <p className="text-sm text-muted-foreground">Quiz</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-2xl font-bold text-purple-500">{stats.totalSubjects}</p>
              <p className="text-sm text-muted-foreground">Konu</p>
            </div>
          </div>

          {stats.totalCards > 0 && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Mastery İlerlemesi</span>
                <span className="text-sm text-muted-foreground">
                  {stats.masteredCards} / {stats.totalCards}
                </span>
              </div>
              <Progress 
                value={(stats.masteredCards / stats.totalCards) * 100} 
                className="h-2" 
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Subject Breakdown */}
      {!subject && subjectStats && subjectStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Konu Bazlı İlerleme
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {subjectStats.map(s => (
                <div key={s.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="h-3 w-3 rounded-full" 
                        style={{ backgroundColor: s.color }}
                      />
                      <span className="font-medium">{s.name}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {formatTime(s.time)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{s.slides} slayt</span>
                    <span>•</span>
                    <span>{s.sessions} seans</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}