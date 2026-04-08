import { useState } from 'react';
import { Key, Eye, EyeOff, Check, AlertCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useGemini } from '@/hooks/useGemini';

export function GeminiSettings() {
  const { apiKey, saveApiKey, clearApiKey, hasApiKey } = useGemini();
  const [isOpen, setIsOpen] = useState(false);
  const [inputKey, setInputKey] = useState(apiKey);
  const [showKey, setShowKey] = useState(false);

  const handleSave = () => {
    if (inputKey.trim()) {
      saveApiKey(inputKey.trim());
      setIsOpen(false);
    }
  };

  const handleClear = () => {
    clearApiKey();
    setInputKey('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Key className="h-4 w-4" />
          {hasApiKey ? (
            <>
              <Check className="h-3 w-3 text-green-500" />
              <span>API Bağlı</span>
            </>
          ) : (
            <>
              <AlertCircle className="h-3 w-3 text-orange-500" />
              <span>API Bağla</span>
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Gemini API Ayarları
          </DialogTitle>
          <DialogDescription>
            Quiz oluşturmak için Gemini API anahtarınızı girin
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="api-key">API Anahtarı</Label>
            <div className="relative">
              <Input
                id="api-key"
                type={showKey ? 'text' : 'password'}
                placeholder="AIza..."
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                className="pr-10"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                onClick={() => setShowKey(!showKey)}
              >
                {showKey ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <Card className="bg-muted/50">
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium">API Anahtarı Nasıl Alınır?</p>
                  <ol className="mt-2 space-y-1 text-muted-foreground list-decimal list-inside">
                    <li>
                      <a 
                        href="https://aistudio.google.com/app/apikey" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-primary hover:underline"
                      >
                        Google AI Studio'ya gidin
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </li>
                    <li>Google hesabınızla giriş yapın</li>
                    <li>"Create API Key" butonuna tıklayın</li>
                    <li>Oluşturulan anahtarı kopyalayın</li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>

          {hasApiKey && (
            <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
              <Check className="h-5 w-5 text-green-600" />
              <span className="text-sm text-green-700 dark:text-green-300">
                API anahtarınız kayıtlı
              </span>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          {hasApiKey && (
            <Button variant="outline" onClick={handleClear}>
              Anahtarı Kaldır
            </Button>
          )}
          <Button onClick={handleSave} disabled={!inputKey.trim()}>
            Kaydet
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
