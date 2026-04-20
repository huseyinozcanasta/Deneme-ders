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
    <Card className="group relative overflow-hidden transition-all hover:shadow-lg">
      {/* Color Strip */}
      <div 
        className="absolute top-0 left-0 right-0 h-2"
        style={{ backgroundColor: subject.color }}
      />

      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl">{subject.name}</CardTitle>
            {subject.description && (
              <CardDescription className="mt-1">{subject.description}</CardDescription>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
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

      <CardContent>
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="outline" className="gap-1">
            <BookOpen className="h-3 w-3" />
            {stats.slides} slayt
          </Badge>
          <Badge variant="outline" className="gap-1">
            <Brain className="h-3 w-3" />
            {stats.quizzes} quiz
          </Badge>
          <Badge variant="outline" className="gap-1">
            <Target className="h-3 w-3" />
            {stats.cards} kart
          </Badge>
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Konularım</h1>
          <p className="text-muted-foreground mt-1">
            {state.subjects.length} konu
          </p>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Yeni Konu
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Yeni Konu Ekle</DialogTitle>
              <DialogDescription>
                Çalışmak istediğiniz konuyu oluşturun
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
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
                      className={`h-8 w-8 rounded-full transition-transform ${
                        selectedColor === color ? 'scale-110 ring-2 ring-offset-2 ring-black' : ''
                      }`}
                      style={{ backgroundColor: color }}
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

      {state.subjects.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-medium">Henüz konu yok</h3>
            <p className="text-muted-foreground mt-2 mb-4">
              Çalışmaya başlamak için yeni bir konu oluşturun
            </p>
            <Button onClick={() => setIsOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              İlk Konunu Oluştur
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {state.subjects.map(subject => (
            <SubjectCard key={subject.id} subject={subject} />
          ))}
        </div>
      )}
    </div>
  );
}