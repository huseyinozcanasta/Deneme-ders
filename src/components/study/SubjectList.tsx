import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, BookOpen, Brain, Target, Clock, MoreVertical, Edit, Copy, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useStudyApp } from '@/contexts/StudyAppContext';
import type { Subject } from '@/types/study';

const COLORS = [
  '#6366f1', // Indigo
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#ef4444', // Red
  '#f97316', // Orange
  '#eab308', // Yellow
  '#22c55e', // Green
  '#14b8a6', // Teal
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
];

interface SubjectCardProps {
  subject: Subject;
}

export function SubjectCard({ subject }: SubjectCardProps) {
  const navigate = useNavigate();
  const { deleteSubject, state } = useStudyApp();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(subject.name);
  const [isHovered, setIsHovered] = useState(false);

  const stats = {
    slides: subject.slides.length,
    quizzes: state.quizzes.filter(q => q.subjectId === subject.id).length,
    cards: state.spacedCards.filter(c => c.subjectId === subject.id).length,
  };

  const handleDelete = () => {
    if (confirm(`${subject.name} konusunu silmek istediğinizden emin misiniz?`)) {
      deleteSubject(subject.id);
    }
  };

  return (
    <Card 
      className="group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Gradient Background Overlay */}
      <div 
        className="absolute inset-0 opacity-5 transition-opacity duration-300"
        style={{ backgroundColor: subject.color }}
      />
      
      {/* Color Strip */}
      <div 
        className="absolute top-0 left-0 right-0 h-1 transition-all duration-300 group-hover:h-2"
        style={{ backgroundColor: subject.color }}
      />

      {/* Hover Effect Gradient */}
      <div 
        className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-10"
        style={{ 
          background: `linear-gradient(135deg, ${subject.color}20 0%, transparent 50%)` 
        }}
      />

      <CardHeader className="pb-3 relative">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div 
                className="h-3 w-3 rounded-full transition-transform duration-300 group-hover:scale-125"
                style={{ backgroundColor: subject.color }}
              />
              <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {subject.name}
              </CardTitle>
            </div>
            {subject.description && (
              <CardDescription className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {subject.description}
              </CardDescription>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="border-gray-200 dark:border-gray-700">
              <DropdownMenuItem 
                onClick={() => navigate(`/subject/${subject.id}`)}
                className="hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Edit className="h-4 w-4 mr-2" />
                Düzenle
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={handleDelete} 
                className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Sil
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="relative">
        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 transition-all duration-300 group-hover:bg-gray-100 dark:group-hover:bg-gray-700/50">
            <div className="flex items-center justify-center gap-1 text-indigo-600 dark:text-indigo-400 mb-1">
              <BookOpen className="h-3 w-3" />
              <span className="text-xs font-medium">Slayt</span>
            </div>
            <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{stats.slides}</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 transition-all duration-300 group-hover:bg-gray-100 dark:group-hover:bg-gray-700/50">
            <div className="flex items-center justify-center gap-1 text-purple-600 dark:text-purple-400 mb-1">
              <Brain className="h-3 w-3" />
              <span className="text-xs font-medium">Quiz</span>
            </div>
            <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{stats.quizzes}</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 transition-all duration-300 group-hover:bg-gray-100 dark:group-hover:bg-gray-700/50">
            <div className="flex items-center justify-center gap-1 text-green-600 dark:text-green-400 mb-1">
              <Target className="h-3 w-3" />
              <span className="text-xs font-medium">Kart</span>
            </div>
            <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{stats.cards}</p>
          </div>
        </div>

        {/* Action Button */}
        <Button 
          className="w-full transition-all duration-300 hover:scale-[1.02] shadow-sm hover:shadow-md"
          onClick={() => navigate(`/subject/${subject.id}`)}
          style={{ 
            backgroundColor: isHovered ? subject.color : '',
            borderColor: subject.color
          }}
          variant={isHovered ? "default" : "outline"}
        >
          <BookOpen className="h-4 w-4 mr-2" />
          Konuyu Aç
        </Button>
      </CardContent>
    </Card>
  );
}

export function SubjectList() {
  const { state, addSubject } = useStudyApp();
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);

  const handleCreate = () => {
    if (!name.trim()) return;
    addSubject(name, description, selectedColor);
    setName('');
    setDescription('');
    setSelectedColor(COLORS[0]);
    setIsOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Konularım
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                {state.subjects.length} konu • Çalışma planınızı yönetin
              </p>
            </div>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button 
                  size="lg" 
                  className="shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Yeni Konu
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] border-gray-200 dark:border-gray-700">
                <DialogHeader>
                  <DialogTitle className="text-xl font-semibold">Yeni Konu Ekle</DialogTitle>
                  <DialogDescription className="text-gray-600 dark:text-gray-400">
                    Çalışmak istediğiniz konuyu oluşturun
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Konu Adı
                    </Label>
                    <Input
                      placeholder="Örn: Matematik, Tarih, Fizik"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Açıklama (İsteğe bağlı)
                    </Label>
                    <Input
                      placeholder="Konu hakkında kısa bir açıklama"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Renk
                    </Label>
                    <div className="flex flex-wrap gap-3">
                      {COLORS.map(color => (
                        <button
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          className={`h-10 w-10 rounded-full transition-all duration-200 ${
                            selectedColor === color 
                              ? 'scale-110 ring-2 ring-offset-2 ring-gray-400 dark:ring-gray-600 shadow-lg' 
                              : 'hover:scale-105 shadow-sm'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <DialogFooter className="gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsOpen(false)}
                    className="border-gray-300 dark:border-gray-600"
                  >
                    İptal
                  </Button>
                  <Button 
                    onClick={handleCreate} 
                    disabled={!name.trim()}
                    className="shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    Oluştur
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 mb-1">
                <BookOpen className="h-4 w-4" />
                <span className="text-sm font-medium">Toplam Konu</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {state.subjects.length}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 mb-1">
                <Target className="h-4 w-4" />
                <span className="text-sm font-medium">Toplam Slayt</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {state.subjects.reduce((acc, s) => acc + s.slides.length, 0)}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-1">
                <Brain className="h-4 w-4" />
                <span className="text-sm font-medium">Toplam Quiz</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {state.quizzes.length}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 mb-1">
                <Target className="h-4 w-4" />
                <span className="text-sm font-medium">Tekrar Kartı</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {state.spacedCards.length}
              </p>
            </div>
          </div>
        </div>

        {/* Content Area */}
        {state.subjects.length === 0 ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <Card className="border-dashed border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50 max-w-md w-full">
              <CardContent className="py-12 text-center">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Henüz konu yok
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-sm mx-auto">
                  Çalışmaya başlamak için yeni bir konu oluşturun
                </p>
                <Button 
                  size="lg" 
                  onClick={() => setIsOpen(true)}
                  className="shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  İlk Konunu Oluştur
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {state.subjects.map(subject => (
              <SubjectCard key={subject.id} subject={subject} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}