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
import { ThemeToggle } from '@/components/ThemeToggle';
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
    <Card className="group overflow-hidden rounded-[2rem] border border-slate-200/70 bg-white p-0 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg dark:border-slate-800/80 dark:bg-slate-950/80">
      <div className="h-2 bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-200 dark:to-slate-400" />
      <CardHeader className="pb-0 pt-5 px-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-2xl font-semibold text-slate-950 dark:text-white">{subject.name}</CardTitle>
            {subject.description && (
              <CardDescription className="mt-2 text-slate-600 dark:text-slate-400">{subject.description}</CardDescription>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate(`/subject/${subject.id}`)}>
                <Edit className="h-4 w-4 mr-2" />
                Düzenle
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDelete} className="text-red-500">
                <Trash2 className="h-4 w-4 mr-2" />
                Sil
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="px-6 pb-6 pt-4">
        <div className="grid gap-3 sm:grid-cols-3 mb-6">
          <div className="rounded-3xl bg-slate-100/80 p-4 text-center dark:bg-slate-900/80">
            <p className="text-sm text-slate-500 dark:text-slate-400">Slayt</p>
            <p className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">{stats.slides}</p>
          </div>
          <div className="rounded-3xl bg-slate-100/80 p-4 text-center dark:bg-slate-900/80">
            <p className="text-sm text-slate-500 dark:text-slate-400">Quiz</p>
            <p className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">{stats.quizzes}</p>
          </div>
          <div className="rounded-3xl bg-slate-100/80 p-4 text-center dark:bg-slate-900/80">
            <p className="text-sm text-slate-500 dark:text-slate-400">Kart</p>
            <p className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">{stats.cards}</p>
          </div>
        </div>

        <Button
          className="w-full"
          onClick={() => navigate(`/subject/${subject.id}`)}
        >
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
    <div className="space-y-10">
      <div className="rounded-[2rem] border border-slate-200/80 bg-white p-8 shadow-sm dark:border-slate-800/80 dark:bg-slate-950/80">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Konular</p>
            <h1 className="mt-3 text-4xl font-semibold text-slate-950 dark:text-white">Çalışma listenizi zarifçe yönetin</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300">
              Her konu için hızlıca not ekleyin, slaytlarınızı kontrol edin ve çalışma akışınızı düzenleyin. Arayüz tamamen sade ve modern şekilde tasarlandı.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <ThemeToggle />
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="bg-slate-950 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100">
                  <Plus className="h-4 w-4 mr-2" />
                  Yeni Konu
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                  <DialogTitle>Konu Ekle</DialogTitle>
                  <DialogDescription>
                    Çalışmak istediğiniz yeni konuyu hızlıca tanımlayın.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-5 py-4">
                  <div className="space-y-2">
                    <Label>Konu Adı</Label>
                    <Input
                      placeholder="Örn: Matematik, Tarih, Fizik"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Açıklama (İsteğe bağlı)</Label>
                    <Input
                      placeholder="Konu hakkında kısa bir açıklama"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Renk</Label>
                    <div className="flex flex-wrap gap-2">
                      {COLORS.map(color => (
                        <button
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          className={`h-10 w-10 rounded-full border-2 transition-transform duration-200 ${
                            selectedColor === color ? 'scale-110 border-slate-900 dark:border-white' : 'border-transparent'
                          }`}
                          style={{ backgroundColor: color }}
                          aria-label={`Renk ${color}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsOpen(false)}>
                    İptal
                  </Button>
                  <Button onClick={handleCreate} disabled={!name.trim()}>
                    Oluştur
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {state.subjects.length === 0 ? (
        <Card className="rounded-[2rem] border border-dashed border-slate-300/70 bg-slate-50 p-12 text-center dark:border-slate-700/80 dark:bg-slate-900/70">
          <CardContent>
            <BookOpen className="h-14 w-14 mx-auto mb-5 text-slate-400 dark:text-slate-500" />
            <h3 className="text-2xl font-semibold text-slate-950 dark:text-white">Henüz konu eklemediniz</h3>
            <p className="mt-3 text-slate-600 dark:text-slate-400">
              İlk konunuzu oluşturarak çalışma listenizi hemen başlatabilirsiniz.
            </p>
            <Button className="mt-8" onClick={() => setIsOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              İlk Konunu Oluştur
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {state.subjects.map(subject => (
            <SubjectCard key={subject.id} subject={subject} />
          ))}
        </div>
      )}
    </div>
  );
}