import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Mail, Lock, User } from 'lucide-react';

export default function LoginPage() {
  const { user, loading, error, signInEmail, registerEmail, signInGoogle } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect authenticated users to home
  useEffect(() => {
    if (user) {
      navigate('/home', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (isRegister) {
        await registerEmail(email, password);
      } else {
        await signInEmail(email, password);
      }
      // Success handled by auth listener + router
    } catch (err: unknown) {
      // Email zaten kayıtlıysa giriş moduna geç
      if (err instanceof Error && 'code' in err && (err as { code: string }).code === 'auth/email-already-in-use') {
        setIsRegister(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    try {
      await signInGoogle();
    } catch {
      // Google hatası AuthContext tarafından işleniyor
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-12 px-4 max-w-md flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4 max-w-md">
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">
            {isRegister ? 'Hesap Oluştur' : 'Hoş Geldin'}
          </CardTitle>
          <CardDescription>
            {isRegister ? 'E-posta ve şifre ile kaydolun veya Google kullanın.' : 'Hesabınıza giriş yapın veya kaydolun.'}
          </CardDescription>
        </CardHeader>
        {error && (
          <div className="px-6 pb-2">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          </div>
        )}
        <CardContent className="space-y-4">
          <Tabs defaultValue="email" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="email">E-posta</TabsTrigger>
              <TabsTrigger value="google">Google</TabsTrigger>
            </TabsList>
            <TabsContent value="email" className="space-y-4 mt-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-posta</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Şifre</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="********"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isRegister ? 'Kaydol' : 'Giriş Yap'}
                </Button>
              </form>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setIsRegister(!isRegister)}
              >
                {isRegister ? 'Zaten hesabın var mı? Giriş Yap' : 'Hesabın yok mu? Kaydol'}
              </Button>
            </TabsContent>
            <TabsContent value="google" className="space-y-4 mt-4">
              <Button
                onClick={handleGoogleSignIn}
                className="w-full"
                variant="outline"
                disabled={isSubmitting}
              >
                <User className="mr-2 h-4 w-4" />
                Google ile {isRegister ? 'Kaydol' : 'Giriş Yap'}
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <p className="text-xs text-muted-foreground text-center">
            Firebase Authentication ile korunuyor.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
