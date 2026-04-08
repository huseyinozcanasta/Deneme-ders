import { useState, useRef } from 'react';
import { Upload, FileText, Image, Plus, X, ArrowRight, Loader2, File, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { useStudyApp } from '@/contexts/StudyAppContext';
import { useToast } from '@/hooks/useToast';
import type { Slide } from '@/types/study';
import * as pdfjsLib from 'pdfjs-dist';

// Use unpkg CDN for worker (allowed by CSP)
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@4.9.155/build/pdf.worker.min.mjs`;

interface SlideUploadProps {
  subjectId: string;
  onComplete?: () => void;
}

export function SlideUpload({ subjectId, onComplete }: SlideUploadProps) {
  const { addSlide } = useStudyApp();
  const { toast } = useToast();
  const [slides, setSlides] = useState<Omit<Slide, 'id'>[]>([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingStatus, setProcessingStatus] = useState('');
  const [manualTitle, setManualTitle] = useState('');
  const [manualContent, setManualContent] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const renderPDFPage = async (pdfDoc: pdfjsLib.PDFDocumentProxy, pageNum: number): Promise<string> => {
    const page = await pdfDoc.getPage(pageNum);
    const scale = 2; // Higher scale for better quality
    const viewport = page.getViewport({ scale });
    
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    if (!context) throw new Error('Could not get canvas context');
    
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    
    await page.render({
      canvasContext: context,
      viewport: viewport,
    }).promise;
    
    return canvas.toDataURL('image/png', 0.9);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsProcessing(true);
    setProcessingProgress(0);
    setProcessingStatus('Dosyalar işleniyor...');

    const totalFiles = files.length;
    let processedFiles = 0;

    for (const file of Array.from(files)) {
      const fileName = file.name.replace(/\.(pptx|ppt|pdf|md|txt)$/i, '');
      
      if (file.type === 'image/png' || 
          file.type === 'image/jpeg' || 
          file.type === 'image/jpg' || 
          file.type === 'image/webp') {
        
        const reader = new FileReader();
        await new Promise<void>((resolve) => {
          reader.onload = (event) => {
            const newSlide: Omit<Slide, 'id'> = {
              title: fileName || `Slayt ${slides.length + 1}`,
              content: '',
              imageUrl: event.target?.result as string,
            };
            setSlides(prev => [...prev, newSlide]);
            resolve();
          };
          reader.readAsDataURL(file);
        });
        
      } else if (file.name.endsWith('.pdf')) {
        // Handle PDF files
        setProcessingStatus(`${file.name} işleniyor...`);
        
        try {
          const arrayBuffer = await file.arrayBuffer();
          
          // Validate file size before processing
          if (arrayBuffer.byteLength === 0) {
            throw new Error('PDF dosyası boş veya okunamıyor');
          }
          
          const loadingTask = pdfjsLib.getDocument({ 
            data: arrayBuffer,
            cMapUrl: `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/cmaps/`,
            cMapPacked: true,
          });
          
          const pdfDoc = await loadingTask.promise;
          const numPages = pdfDoc.numPages;
          
          // Check if PDF has too many pages
          if (numPages > 100) {
            toast({
              title: "Uyarı",
              description: `${file.name} dosyası çok sayıda sayfa içeriyor (${numPages}). İşlem uzun sürebilir.`,
            });
          }
          
          for (let pageNum = 1; pageNum <= numPages; pageNum++) {
            setProcessingStatus(`${file.name} - Sayfa ${pageNum}/${numPages}`);
            setProcessingProgress(((processedFiles + (pageNum / numPages)) / totalFiles) * 100);
            
            try {
              const imageData = await renderPDFPage(pdfDoc, pageNum);
              
              const newSlide: Omit<Slide, 'id'> = {
                title: numPages > 1 ? `${fileName} - Sayfa ${pageNum}` : fileName,
                content: '',
                imageUrl: imageData,
              };
              setSlides(prev => [...prev, newSlide]);
            } catch (pageError) {
              console.error(`Error rendering page ${pageNum}:`, pageError);
              // Create a text slide for failed pages
              const newSlide: Omit<Slide, 'id'> = {
                title: `${fileName} - Sayfa ${pageNum}`,
                content: 'Bu sayfa yüklenemedi.',
              };
              setSlides(prev => [...prev, newSlide]);
            }
          }
        } catch (pdfError: any) {
          console.error('Error loading PDF:', pdfError);
          
          // Provide specific error messages based on the error
          let errorMessage = 'PDF dosyası yüklenemedi';
          
          if (pdfError.name === 'PasswordException') {
            errorMessage = 'Bu PDF şifre korumalı. Lütfen şifresiz bir PDF kullanın.';
          } else if (pdfError.name === 'InvalidPDFException' || pdfError.message?.includes('Invalid PDF')) {
            errorMessage = 'Bu PDF dosyası geçersiz veya bozuk görünüyor.';
          } else if (pdfError.message?.includes('Missing PDF')) {
            errorMessage = 'PDF dosyası bulunamadı veya okunamıyor.';
          } else if (pdfError.message?.includes('empty')) {
            errorMessage = 'PDF dosyası boş.';
          } else {
            errorMessage = `PDF yüklenemedi: ${pdfError.message || 'Bilinmeyen hata'}`;
          }
          
          toast({
            title: "PDF Yükleme Hatası",
            description: errorMessage,
            variant: "destructive",
          });
          
          // Create error slide
          const newSlide: Omit<Slide, 'id'> = {
            title: fileName,
            content: `PDF yüklenemedi: ${file.name}\n\n${errorMessage}`,
          };
          setSlides(prev => [...prev, newSlide]);
        }
        
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
      
      processedFiles++;
      setProcessingProgress((processedFiles / totalFiles) * 100);
    }

    setIsProcessing(false);
    setProcessingProgress(100);
    setProcessingStatus('Tamamlandı!');
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
            PDF, resim veya metin dosyalarını yükleyin
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
              {isProcessing ? (
                <div className="space-y-4 p-8 border rounded-lg">
                  <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <div className="text-center">
                      <p className="font-medium">{processingStatus}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Lütfen bekleyin...
                      </p>
                    </div>
                    <Progress value={processingProgress} className="w-full max-w-md" />
                  </div>
                </div>
              ) : (
                <>
                  <div 
                    className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept=".png,.jpg,.jpeg,.webp,.txt,.md,.pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <div className="flex flex-col items-center gap-4">
                      <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <Upload className="h-8 w-8 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Slayt dosyalarınızı sürükleyin veya tıklayın</p>
                        <p className="text-sm text-muted-foreground">PDF, PNG, JPG, TXT, MD desteklenir</p>
                      </div>
                    </div>
                    
                    <div className="mt-4 p-3 bg-muted/50 rounded-lg text-xs">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-amber-600" />
                        <div className="space-y-1">
                          <p className="font-medium text-amber-700 dark:text-amber-400">PDF İpuçları:</p>
                          <ul className="space-y-0.5 text-muted-foreground list-disc list-inside">
                            <li>Şifresiz PDF dosyaları kullanın</li>
                            <li>Standart PDF formatında kaydedin</li>
                            <li>Çok büyük dosyalar işlem süresini uzatabilir</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2 p-3 border rounded-lg">
                      <div className="h-8 w-8 rounded bg-red-100 dark:bg-red-950/30 flex items-center justify-center">
                        <File className="h-4 w-4 text-red-600" />
                      </div>
                      <div>
                        <p className="font-medium">PDF</p>
                        <p className="text-xs">Tüm sayfalar</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-3 border rounded-lg">
                      <div className="h-8 w-8 rounded bg-blue-100 dark:bg-blue-950/30 flex items-center justify-center">
                        <Image className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">Resimler</p>
                        <p className="text-xs">PNG, JPG, WEBP</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-3 border rounded-lg">
                      <div className="h-8 w-8 rounded bg-green-100 dark:bg-green-950/30 flex items-center justify-center">
                        <FileText className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">Metin</p>
                        <p className="text-xs">TXT, MD</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-3 border rounded-lg">
                      <div className="h-8 w-8 rounded bg-purple-100 dark:bg-purple-950/30 flex items-center justify-center">
                        <Plus className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium">Manuel</p>
                        <p className="text-xs">Kendi içeriğin</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
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
                    <div className="flex gap-2">
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
                  </div>

                  <Card className="relative">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8 z-10 bg-background/80"
                      onClick={() => removeSlide(currentSlideIndex)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <CardHeader>
                      <CardTitle className="text-lg">{slides[currentSlideIndex]?.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {slides[currentSlideIndex]?.imageUrl ? (
                        <div className="flex justify-center">
                          <img 
                            src={slides[currentSlideIndex].imageUrl} 
                            alt={slides[currentSlideIndex].title}
                            className="max-h-[400px] rounded-lg object-contain"
                          />
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap">{slides[currentSlideIndex]?.content}</p>
                      )}
                    </CardContent>
                  </Card>

                  <ScrollArea className="w-full">
                    <div className="flex gap-2 pb-2">
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
                  </ScrollArea>

                  <Button onClick={handleSaveSlides} className="w-full" disabled={slides.length === 0}>
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