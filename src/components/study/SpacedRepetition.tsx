import { useState, useMemo } from 'react';
import { 
  Brain, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle, 
  XCircle,
  Clock,
  RotateCcw,
  Zap,
  BookOpen,
  Filter,
  Sparkles,
  Loader2,
  Plus,
  AlertCircle,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useStudyApp } from '@/contexts/StudyAppContext';
import { useGemini } from '@/hooks/useGemini';
import { GeminiSettings } from './GeminiSettings';
import type { SpacedRepetitionCard, Subject } from '@/types/study';

interface SpacedRepetitionProps {
  subject?: Subject;
}

export function SpacedRepetition({ subject }: SpacedRepetitionProps) {
  const { state, reviewSpacedCard, addSpacedCard } = useStudyApp();
  const { generateFlashcards, isLoading, error, hasApiKey } = useGemini();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [filter, setFilter] = useState<'all' | 'due' | 'new'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [manualQuestion, setManualQuestion] = useState('');
  const [manualAnswer, setManualAnswer] = useState('');
  const [generationStatus, setGenerationStatus] = useState('');
  const [cardCount, setCardCount] = useState(10);

  const filteredCards = useMemo(() => {
    let cards = subject 
      ? state.spacedCards.filter(c => c.subjectId === subject.id)
      : state.spacedCards;

    const now = Date.now();

    switch (filter) {
      case 'due':
        return cards.filter(c => c.nextReviewDate <= now);
      case 'new':
        return cards.filter(c => c.reviewCount === 0);
      default:
        return cards;
    }
  }, [state.spacedCards, subject, filter]);

  const cardsToReview = useMemo(() => {
    const now = Date.now();
    return filteredCards.filter(c => c.nextReviewDate <= now).length;
  }, [filteredCards]);

  const currentCard = filteredCards[currentIndex];
  const progress = filteredCards.length > 0 
    ? ((currentIndex + 1) / filteredCards.length) * 100 
    : 0;

  const startSession = () => {
    setSessionStarted(true);
    setCurrentIndex(0);
    setShowAnswer(false);
  };

  const handleReview = (quality: number) => {
    if (!currentCard) return;
    
    reviewSpacedCard(currentCard.id, quality);

    if (currentIndex < filteredCards.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setShowAnswer(false);
    } else {
      setSessionStarted(false);
    }
  };

  const getQualityLabel = (quality: number) => {
    switch (quality) {
      case 1: return { label: 'Tekrar', color: 'bg-red-500' };
      case 2: return { label: 'Zor', color: 'bg-orange-500' };
      case 3: return { label: 'Orta', color: 'bg-yellow-500' };
      case 4: return { label: 'Kolay', color: 'bg-green-500' };
      case 5: return { label: 'Çok Kolay', color: 'bg-blue-500' };
      default: return { label: 'Bilinmiyor', color: 'bg-gray-500' };
    }
  };

  const getSubjectName = (subjectId: string) => {
    return state.subjects.find(s => s.id === subjectId)?.name || 'Bilinmiyor';
  };

  const handleAddManualCard = () => {
    if (!manualQuestion.trim() || !manualAnswer.trim()) return;
    
    if (subject) {
      addSpacedCard(subject.id, manualQuestion, manualAnswer);
    }
    
    setManualQuestion('');
    setManualAnswer('');
    setShowCreateModal(false);
  };

  const handleAICreate = async () => {
    if (!hasApiKey || !subject) return;

    const slideContent = subject.slides
      .map((s, i) => `--- Slayt ${i + 1}: ${s.title} ---\n${s.content}`)
      .join('\n\n');

    if (subject.slides.length === 0) {
      setGenerationStatus('Lütfen önce slayt ekleyin!');
      return;
    }

    setGenerationStatus('Kartlar oluşturuluyor...');
    
    try {
      const cards = await generateFlashcards(slideContent, subject.name, cardCount);
      
      cards.forEach(card => {
        addSpacedCard(subject.id, card.question, card.answer);
      });

      setGenerationStatus(`${cards.length} kart başarıyla oluşturuldu!`);
    } catch (err) {
      setGenerationStatus('Kartlar oluşturulamadı.');
    }
  };

  if (filteredCards.length === 0 && !sessionStarted) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Aralıklı Tekrar
              </CardTitle>
              <GeminiSettings />
            </div>
            <CardDescription>
              {subject ? subject.name : 'Tüm Konular'} için tekrar kartları
            </CardDescription>
          </CardHeader>
          <CardContent className="py-8">
            <div className="text-center space-y-4">
              <Brain className="h-12 w-12 mx-auto text-muted-foreground/50" />
              <div>
                <p className="text-muted-foreground">Henüz tekrar kartı bulunmuyor</p>
                <p className="text-sm text-muted-foreground mt-1">
                  AI ile veya manuel olarak kart oluşturabilirsiniz
                </p>
              </div>
              
              {subject && (
                <div className="flex flex-col gap-3 max-w-md mx-auto mt-6">
                  <Button onClick={() => setShowCreateModal(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Manuel Kart Ekle
                  </Button>
                  
                  {hasApiKey ? (
                    <Button variant="outline" onClick={handleAICreate} disabled={isLoading} className="gap-2">
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Oluşturuluyor...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4" />
                          AI ile Kart Oluştur
                        </>
                      )}
                    </Button>
                  ) : (
                    <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
                        <div className="text-left">
                          <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                            AI ile kart oluşturmak için
                          </p>
                          <GeminiSettings />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {generationStatus && (
                    <p className="text-sm text-muted-foreground">{generationStatus}</p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Create Modal */}
        {showCreateModal && (
          <Card>
            <CardHeader>
              <CardTitle>Manuel Kart Oluştur</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Soru</Label>
                <Textarea
                  placeholder="Soruyu buraya yazın..."
                  value={manualQuestion}
                  onChange={(e) => setManualQuestion(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Cevap</Label>
                <Textarea
                  placeholder="Cevabı buraya yazın..."
                  value={manualAnswer}
                  onChange={(e) => setManualAnswer(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowCreateModal(false)} className="flex-1">
                  İptal
                </Button>
                <Button onClick={handleAddManualCard} disabled={!manualQuestion.trim() || !manualAnswer.trim()} className="flex-1">
                  Ekle
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  if (!sessionStarted) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Aralıklı Tekrar
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowCreateModal(true)} className="gap-1">
                  <Plus className="h-4 w-4" />
                  Kart Ekle
                </Button>
                <GeminiSettings />
              </div>
            </div>
            <CardDescription>
              {subject ? subject.name : 'Tüm Konular'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 mb-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Toplam Kart</p>
                <p className="text-2xl font-bold">{filteredCards.length}</p>
              </div>
              <div className="space-y-1 text-right">
                <p className="text-sm text-muted-foreground">Tekrar Edilecek</p>
                <p className="text-2xl font-bold text-orange-500">{cardsToReview}</p>
              </div>
            </div>

            <div className="flex flex-col gap-2 mb-4 sm:flex-row">
              <Select value={filter} onValueChange={(v: any) => setFilter(v)}>
                <SelectTrigger>
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü ({filteredCards.length})</SelectItem>
                  <SelectItem value="due">Tekrar Edilecek ({cardsToReview})</SelectItem>
                  <SelectItem value="new">Yeni ({filteredCards.filter(c => c.reviewCount === 0).length})</SelectItem>
                </SelectContent>
              </Select>

              {subject && hasApiKey && (
                <Button variant="outline" size="sm" onClick={handleAICreate} disabled={isLoading} className="gap-1">
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  AI Oluştur
                </Button>
              )}
            </div>

            {generationStatus && (
              <div className="mb-4 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="text-sm text-green-700 dark:text-green-300">{generationStatus}</p>
              </div>
            )}

            <div className="space-y-2 mb-4">
              <Label className="text-sm">Kart Önizleme</Label>
              <ScrollArea className="h-[200px]">
                <div className="space-y-2">
                  {filteredCards.slice(0, 10).map((card, idx) => (
                    <div 
                      key={card.id} 
                      className="p-3 border rounded-lg"
                    >
                      <p className="text-sm font-medium line-clamp-2">{card.question}</p>
                      <div className="flex items-center justify-between mt-2">
                        <Badge variant="outline" className="text-xs">
                          {getSubjectName(card.subjectId)}
                        </Badge>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{card.reviewCount} tekrar</span>
                          <span>•</span>
                          <span>{card.interval} gün</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            <Button onClick={startSession} className="w-full" disabled={cardsToReview === 0}>
              <Zap className="h-4 w-4 mr-2" />
              Tekrar Seansı Başlat ({cardsToReview} kart)
            </Button>
          </CardContent>
        </Card>

        {/* Create Modal */}
        {showCreateModal && (
          <Card>
            <CardHeader>
              <CardTitle>Kart Oluştur</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4 text-sm">
                <Button 
                  variant={!hasApiKey ? 'default' : 'outline'} 
                  onClick={() => {}}
                  className="flex-1"
                  disabled
                >
                  Manuel
                </Button>
                <Button 
                  variant={hasApiKey ? 'default' : 'outline'}
                  onClick={() => {}}
                  className="flex-1"
                  disabled
                >
                  AI ile
                </Button>
              </div>
              <div className="space-y-2">
                <Label>Soru</Label>
                <Textarea
                  placeholder="Soruyu buraya yazın..."
                  value={manualQuestion}
                  onChange={(e) => setManualQuestion(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Cevap</Label>
                <Textarea
                  placeholder="Cevabı buraya yazın..."
                  value={manualAnswer}
                  onChange={(e) => setManualAnswer(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowCreateModal(false)} className="flex-1">
                  İptal
                </Button>
                <Button onClick={handleAddManualCard} disabled={!manualQuestion.trim() || !manualAnswer.trim()} className="flex-1">
                  Ekle
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Tekrar Seansı</h2>
          <p className="text-sm text-muted-foreground">
            {subject ? subject.name : 'Tüm Konular'}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setSessionStarted(false)}>
          <XCircle className="h-4 w-4 mr-1" />
          Çıkış
        </Button>
      </div>

      {/* Progress */}
      <Progress value={progress} className="h-2" />

      {/* Card */}
      <Card className="min-h-[300px]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <Badge variant="outline">
              Kart {currentIndex + 1} / {filteredCards.length}
            </Badge>
            <div className="flex gap-2">
              <Badge variant="secondary">
                <Clock className="h-3 w-3 mr-1" />
                {filteredCards[currentIndex]?.interval} gün
              </Badge>
              <Badge variant="secondary">
                <RotateCcw className="h-3 w-3 mr-1" />
                {filteredCards[currentIndex]?.reviewCount} tekrar
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[200px] pr-4">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Soru:</p>
                <p className="text-lg font-medium">{currentCard?.question}</p>
              </div>

              {showAnswer && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-2">Cevap:</p>
                  <p className="text-lg">{currentCard?.answer}</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Actions */}
      {!showAnswer ? (
        <Button onClick={() => setShowAnswer(true)} className="w-full">
          <BookOpen className="h-4 w-4 mr-2" />
          Cevabı Göster
        </Button>
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {[1, 2, 3, 4, 5].map(quality => (
            <Button
              key={quality}
              variant="outline"
              onClick={() => handleReview(quality)}
              className={`${getQualityLabel(quality).color} text-white hover:opacity-90`}
            >
              {getQualityLabel(quality).label}
            </Button>
          ))}
        </div>
      )}

      {/* Navigation */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button 
          variant="ghost" 
          onClick={() => {
            setCurrentIndex(prev => Math.max(0, prev - 1));
            setShowAnswer(false);
          }}
          disabled={currentIndex === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Önceki
        </Button>

        <div className="flex gap-1">
          {filteredCards.slice(0, 10).map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setCurrentIndex(idx);
                setShowAnswer(false);
              }}
              className={`w-2 h-2 rounded-full transition-colors ${
                idx === currentIndex 
                  ? 'bg-primary' 
                  : 'bg-muted'
              }`}
            />
          ))}
        </div>

        <Button 
          variant="ghost" 
          onClick={() => {
            setCurrentIndex(prev => Math.min(filteredCards.length - 1, prev + 1));
            setShowAnswer(false);
          }}
          disabled={currentIndex === filteredCards.length - 1}
        >
          Sonraki
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
