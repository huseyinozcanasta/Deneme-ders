import { useStudyApp } from '@/contexts/StudyAppContext';
import { SubjectList } from '@/components/study/SubjectList';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function DenemeDers() {
  const { state, isStorageReady } = useStudyApp();

  if (!isStorageReady) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Deneme Ders</CardTitle>
          <CardDescription>
            Studyflow quiz ve çalışma modunu test edin. Konu seçin veya yeni oluşturun.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button variant="outline" className="flex-1">
              Hızlı Quiz Başlat
            </Button>
            <Button className="flex-1">
              Yeni Konu Oluştur
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <SubjectList />
    </div>
  );
}
