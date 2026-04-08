import { useState, useRef } from 'react';
import { Upload, FileText, Image, Plus, X, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useStudyApp } from '@/contexts/StudyAppContext';
import type { Slide, Subject } from '@/types/study';

interface SlideUploadProps {
  subjectId: string;
  onComplete?: () => void;
}

export function SlideUpload({ subjectId, onComplete }: SlideUploadProps) {
  const { addSlide } = useStudyApp();
  const [slides, setSlides] = useState<Omit<Slide, 'id'>[]>([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [manualTitle, setManualTitle] = useState('');
  const [manualContent, setManualContent] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsProcessing(true);

    for (const file of Array.from(files)) {
      const fileName = file.name.replace(/\.(pptx|ppt|pdf|md|txt)$/i, '');
      
      if (file.type === 'image/png' || file.type === 'image/jpeg' || file.type === 'image/jpg' || file.type === 'image/webp') {
        const reader = new FileReader();
        reader.onload = (event) => {
          const newSlide: Omit<Slide, 'id'> = {
            title: fileName || `Slayt ${slides.length + 1}`,
            content: '',
            imageUrl: event.target?.result as string,
          };
          setSlides(prev => [...prev, newSlide]);
        };
        reader.readAsDataURL(file);
      } else if (file.name.endsWith('.txt') || file.name.endsWith('.md')) {
        const text = await file.text();
        const lines = text.split('\n\n').filter(l => l.trim());
        const newSlides = lines.map((line, idx) => {
          const [title, ...content] = line.split('\n');
          return {
            title: title?.trim() || `Bölüm ${idx + 1}`,
            content: content.join('\n').trim(),
          };
        });
        setSlides(prev => [...prev, ...newSlides]);
      } else {
        const newSlide: Omit<Slide, 'id'> = {
          title: fileName,
          content: `Dosya yüklendi: ${file.name}`,
        };
        setSlides(prev => [...prev, newSlide]);
      }
    }

    setIsProcessing(false);
  };

  const handleAddManualSlide = () => {
    if (!manualTitle.trim()) return;
    
    const newSlide: Omit<Slide, 'id'> = {
      title: manualTitle,
      content: manualContent,
    };
    setSlides(prev => [...prev, newSlide]);
    setManualTitle('');
    setManualContent('');
  };

  const handleSaveSlides = () => {
    slides.forEach(slide => {
      addSlide(subjectId, slide);
    });
    setSlides([]);
    onComplete?.();
  };

  const removeSlide = (index: number) => {
    setSlides(prev => prev.filter((_, i) => i !== index));
    if (currentSlideIndex >= slides.length - 1) {
      setCurrentSlideIndex(Math.max(0, slides.length - 2));
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Slayt Ekle
          </CardTitle>
          <CardDescription>
            Slayt dosyalarını yükleyin veya manuel olarak içerik ekleyin
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="upload">Dosya Yükle</TabsTrigger>
              <TabsTrigger value="manual">Manuel Ekle</TabsTrigger>
              <TabsTrigger value="preview">Önizleme ({slides.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="space-y-4 mt-4">
              <div 
                className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".png,.jpg,.jpeg,.webp,.txt,.md,.pptx"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="flex flex-col items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                    {isProcessing ? (
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    ) : (
                      <Upload className="h-8 w-8 text-primary" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">Slayt dosyalarınızı sürükleyin veya tıklayın</p>
                    <p className="text-sm text-muted-foreground">PNG, JPG, TXT, MD desteklenir</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Image className="h-4 w-4" />
                  <span>Görüntü slaytları</span>
                </div>
                <div className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  <span>Metin dosyaları</span>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="manual" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Slayt Başlığı</Label>
                  <Input
                    id="title"
                    placeholder="Örn: Matematik - Bölüm 1"
                    value={manualTitle}
                    onChange={(e) => setManualTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content">İçerik</Label>
                  <Textarea
                    id="content"
                    placeholder="Slayt içeriğini buraya yazın..."
                    rows={6}
                    value={manualContent}
                    onChange={(e) => setManualContent(e.target.value)}
                  />
                </div>
                <Button onClick={handleAddManualSlide} disabled={!manualTitle.trim()} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Slayt Ekle
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="preview" className="mt-4">
              {slides.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Henüz slayt eklenmedi</p>
                  <p className="text-sm">Yukarıdaki sekmelerden slayt ekleyin</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Slayt {currentSlideIndex + 1} / {slides.length}
                    </span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setCurrentSlideIndex(prev => Math.max(0, prev - 1))}
                      disabled={currentSlideIndex === 0}
                    >
                      Önceki
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setCurrentSlideIndex(prev => Math.min(slides.length - 1, prev + 1))}
                      disabled={currentSlideIndex === slides.length - 1}
                    >
                      Sonraki
                    </Button>
                  </div>

                  <Card className="relative">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8"
                      onClick={() => removeSlide(currentSlideIndex)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <CardHeader>
                      <CardTitle className="text-lg">{slides[currentSlideIndex]?.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {slides[currentSlideIndex]?.imageUrl ? (
                        <img 
                          src={slides[currentSlideIndex].imageUrl} 
                          alt={slides[currentSlideIndex].title}
                          className="max-h-64 rounded-lg object-contain"
                        />
                      ) : (
                        <p className="whitespace-pre-wrap">{slides[currentSlideIndex]?.content}</p>
                      )}
                    </CardContent>
                  </Card>

                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {slides.map((slide, idx) => (
                      <Button
                        key={idx}
                        variant={idx === currentSlideIndex ? 'default' : 'outline'}
                        size="sm"
                        className="shrink-0"
                        onClick={() => setCurrentSlideIndex(idx)}
                      >
                        {idx + 1}
                      </Button>
                    ))}
                  </div>

                  <Button onClick={handleSaveSlides} className="w-full">
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Tüm Slaytları Kaydet ({slides.length})
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}