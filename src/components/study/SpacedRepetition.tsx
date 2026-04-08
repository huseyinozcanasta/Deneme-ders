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
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useStudyApp } from '@/contexts/StudyAppContext';
import type { SpacedRepetitionCard, Subject } from '@/types/study';

interface SpacedRepetitionProps {
  subject?: Subject;
}

export function SpacedRepetition({ subject }: SpacedRepetitionProps) {
  const { state, reviewSpacedCard, addSpacedCard } = useStudyApp();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [filter, setFilter] = useState<'all' | 'due' | 'new'>('all');

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

  if (filteredCards.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Aralıklı Tekrar
          </CardTitle>
          <CardDescription>
            {subject ? subject.name : 'Tüm Konular'} için tekrar kartları
          </CardDescription>
        </CardHeader>
        <CardContent className="py-12 text-center">
          <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
          <p className="text-muted-foreground">Henüz tekrar kartı bulunmuyor</p>
          <p className="text-sm text-muted-foreground mt-2">
            Quiz oluşturduğunuzda otomatik olarak kartlar eklenir
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!sessionStarted) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Aralıklı Tekrar
            </CardTitle>
            <CardDescription>
              {subject ? subject.name : 'Tüm Konular'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Kartlar</p>
                <p className="text-2xl font-bold">{filteredCards.length}</p>
              </div>
              <div className="space-y-1 text-right">
                <p className="text-sm text-muted-foreground">Tekrar Edilecek</p>
                <p className="text-2xl font-bold text-orange-500">{cardsToReview}</p>
              </div>
            </div>

            <div className="flex gap-2 mb-4">
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
            </div>

            <div className="space-y-2">
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
                        <span className="text-xs text-muted-foreground">
                          {card.reviewCount} tekrar
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            <Button onClick={startSession} className="w-full mt-4" disabled={cardsToReview === 0}>
              <Zap className="h-4 w-4 mr-2" />
              Tekrar Seansı Başlat ({cardsToReview} kart)
            </Button>
          </CardContent>
        </Card>
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
        <div className="grid grid-cols-5 gap-2">
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
      <div className="flex items-center justify-between">
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