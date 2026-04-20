import { useState, useMemo } from 'react';
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  Circle, 
  ChevronLeft, 
  ChevronRight,
  Plus,
  BookOpen,
  RefreshCw,
  Target
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  format, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameDay, 
  isToday,
  addWeeks,
  subWeeks,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval as getDaysInMonth
} from 'date-fns';
import { tr } from 'date-fns/locale';
import { useStudyApp } from '@/contexts/StudyAppContext';
import type { Subject, StudyPlan } from '@/types/study';

interface StudyPlannerProps {
  subject?: Subject;
}

export function StudyPlanner({ subject }: StudyPlannerProps) {
  const { state, addStudyPlan, toggleStudyPlan } = useStudyApp();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'week' | 'month'>('week');

  const days = useMemo(() => {
    if (view === 'week') {
      const start = startOfWeek(currentDate, { weekStartsOn: 1 });
      const end = endOfWeek(currentDate, { weekStartsOn: 1 });
      return eachDayOfInterval({ start, end });
    } else {
      const start = startOfMonth(currentDate);
      const end = endOfMonth(currentDate);
      return getDaysInMonth({ start, end });
    }
  }, [currentDate, view]);

  const filteredPlans = useMemo(() => {
    if (subject) {
      return state.studyPlans.filter(p => p.subjectId === subject.id);
    }
    return state.studyPlans;
  }, [state.studyPlans, subject]);

  const getPlansForDay = (day: Date): StudyPlan[] => {
    return filteredPlans.filter(p => isSameDay(new Date(p.date), day));
  };

  const handleAddPlan = (day: Date) => {
    if (subject) {
      addStudyPlan(subject.id, day.getTime(), 'study');
    }
  };

  const nextPeriod = () => {
    if (view === 'week') {
      setCurrentDate(addWeeks(currentDate, 1));
    } else {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    }
  };

  const prevPeriod = () => {
    if (view === 'week') {
      setCurrentDate(subWeeks(currentDate, 1));
    } else {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    }
  };

  const getTaskIcon = (taskType: StudyPlan['taskType']) => {
    switch (taskType) {
      case 'study': return <BookOpen className="h-3 w-3" />;
      case 'review': return <RefreshCw className="h-3 w-3" />;
      case 'quiz': return <Target className="h-3 w-3" />;
    }
  };

  const getSubjectName = (subjectId: string) => {
    return state.subjects.find(s => s.id === subjectId)?.name || 'Bilinmiyor';
  };

  const getSubjectColor = (subjectId: string) => {
    return state.subjects.find(s => s.id === subjectId)?.color || '#6366f1';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Çalışma Planı
              </CardTitle>
              <CardDescription>
                {subject ? subject.name : 'Tüm Konular'}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button 
                variant={view === 'week' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setView('week')}
              >
                Hafta
              </Button>
              <Button 
                variant={view === 'month' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setView('month')}
              >
                Ay
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Calendar Navigation */}
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" size="icon" onClick={prevPeriod}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-medium">
              {view === 'week' 
                ? `${format(days[0], 'd MMM', { locale: tr })} - ${format(days[days.length - 1], 'd MMM yyyy', { locale: tr })}`
                : format(currentDate, 'MMMM yyyy', { locale: tr })
              }
            </span>
            <Button variant="ghost" size="icon" onClick={nextPeriod}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Days Grid */}
          <div className={`grid gap-2 ${view === 'week' ? 'grid-cols-7' : 'grid-cols-7'}`}>
            {days.map((day) => {
              const plans = getPlansForDay(day);
              const completedCount = plans.filter(p => p.completed).length;
              
              return (
                <div
                  key={day.toISOString()}
                  className={`min-h-[100px] border rounded-lg p-2 ${
                    isToday(day) ? 'border-primary bg-primary/5' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm font-medium ${
                      isToday(day) ? 'text-primary' : ''
                    }`}>
                      {format(day, view === 'week' ? 'EEE' : 'd')}
                    </span>
                    {plans.length > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {completedCount}/{plans.length}
                      </Badge>
                    )}
                  </div>
                  
                  <ScrollArea className="h-[60px]">
                    <div className="space-y-1">
                      {plans.map(plan => (
                        <button
                          key={plan.id}
                          onClick={() => toggleStudyPlan(plan.id)}
                          className={`w-full text-left text-xs p-1.5 rounded flex items-center gap-1 transition-colors ${
                            plan.completed 
                              ? 'bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-300 line-through'
                              : 'bg-muted hover:bg-muted/80'
                          }`}
                          style={{ borderLeft: `3px solid ${getSubjectColor(plan.subjectId)}` }}
                        >
                          {plan.completed ? (
                            <CheckCircle className="h-3 w-3 shrink-0" />
                          ) : (
                            <Circle className="h-3 w-3 shrink-0" />
                          )}
                          <span className="truncate">
                            {getTaskIcon(plan.taskType)}
                            <span className="ml-1">{getSubjectName(plan.subjectId)}</span>
                          </span>
                        </button>
                      ))}
                    </div>
                  </ScrollArea>

                  {subject && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full mt-2 h-6 text-xs"
                      onClick={() => handleAddPlan(day)}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Ekle
                    </Button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-4 flex gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <BookOpen className="h-3 w-3" />
              <span>Çalışma</span>
            </div>
            <div className="flex items-center gap-1">
              <RefreshCw className="h-3 w-3" />
              <span>Tekrar</span>
            </div>
            <div className="flex items-center gap-1">
              <Target className="h-3 w-3" />
              <span>Quiz</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}