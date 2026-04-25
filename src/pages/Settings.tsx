import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  User, 
  Settings, 
  Shield, 
  Bell, 
  Palette, 
  Globe, 
  LogOut, 
  Save, 
  AlertTriangle,
  Mail,
  Camera,
  Eye,
  EyeOff,
  Server,
  RotateCcw
} from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getCurrentApiUrl, setApiUrl, resetApiUrl } from '@/hooks/useShakespeare';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState('account');
  const [isSaving, setIsSaving] = useState(false);
  
  // Password change states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // App settings states
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('tr');
  
  // API settings states
  const [apiUrl, setApiUrlState] = useState(getCurrentApiUrl());

  if (!user) {
    navigate('/');
    return null;
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        title: 'Hata',
        description: 'Yeni şifreler eşleşmiyor',
        variant: 'destructive',
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: 'Hata',
        description: 'Şifre en az 6 karakter olmalıdır',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      if (!user.email) {
        throw new Error('Kullanıcı e-postası bulunamadı');
      }

      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      
      await updatePassword(user, newPassword);
      
      toast({
        title: 'Başarılı',
        description: 'Şifreniz başarıyla güncellendi',
      });
      
      // Clear form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      console.error('Password change error:', error);
      let errorMessage = 'Şifre değiştirilemedi';
      
      if (error.code === 'auth/wrong-password') {
        errorMessage = 'Mevcut şifre hatalı';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Yeni şifre çok zayıf';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Çok fazla deneme, lütfen sonra tekrar deneyin';
      }
      
      toast({
        title: 'Hata',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
      toast({
        title: 'Başarılı',
        description: 'Çıkış yapıldı',
      });
    } catch (error) {
      toast({
        title: 'Hata',
        description: 'Çıkış yapılamadı',
        variant: 'destructive',
      });
    }
  };

  const handleAppSettingsSave = () => {
    setIsSaving(true);
    // Save app settings to localStorage or context
    localStorage.setItem('appSettings', JSON.stringify({
      notifications,
      darkMode,
      language,
    }));
    
    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: 'Başarılı',
        description: 'Ayarlar kaydedildi',
      });
    }, 1000);
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Ayarlar</h1>
        <p className="text-muted-foreground">Hesabınızı ve uygulamayı yönetin</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="account" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Hesap
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Güvenlik
          </TabsTrigger>
          <TabsTrigger value="app" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Uygulama
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex items-center gap-2">
            <Server className="h-4 w-4" />
            Gelişmiş
          </TabsTrigger>
        </TabsList>

        {/* Account Tab */}
        <TabsContent value="account" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profil Bilgileri
              </CardTitle>
              <CardDescription>
                Hesap bilgilerinizi görüntüleyin ve yönetin
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
                  {user.email?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium">{user.displayName || user.email}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <Badge variant="secondary" className="mt-1">
                    {user.emailVerified ? 'Doğrulanmış' : 'Doğrulanmamış'}
                  </Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <div>
                  <Label htmlFor="email">E-posta</Label>
                  <Input
                    id="email"
                    type="email"
                    value={user.email || ''}
                    disabled
                    className="bg-muted"
                  />
                </div>
                <div>
                  <Label htmlFor="uid">Kullanıcı ID</Label>
                  <Input
                    id="uid"
                    value={user.uid}
                    disabled
                    className="bg-muted font-mono text-sm"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="provider">Giriş Yöntemi</Label>
                <div className="flex gap-2 mt-2">
                  {user.providerData.map((provider) => (
                    <Badge key={provider.providerId} variant="outline">
                      {provider.providerId === 'password' ? 'E-posta/Şifre' : 'Google'}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Şifre Değiştir
              </CardTitle>
              <CardDescription>
                Hesap şifrenizi güncelleyin
              </CardDescription>
            </CardHeader>
            <CardContent>
              {user.providerData.some(p => p.providerId === 'password') ? (
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div>
                    <Label htmlFor="current-password">Mevcut Şifre</Label>
                    <div className="relative">
                      <Input
                        id="current-password"
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="new-password">Yeni Şifre</Label>
                    <div className="relative">
                      <Input
                        id="new-password"
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="confirm-password">Yeni Şifre (Tekrar)</Label>
                    <div className="relative">
                      <Input
                        id="confirm-password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <Button type="submit" disabled={isSaving}>
                    {isSaving && <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />}
                    <Save className="h-4 w-4 mr-2" />
                    Şifreyi Güncelle
                  </Button>
                </form>
              ) : (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Google ile giriş yaptığınız için şifre değiştirme özelliği kullanılamıyor.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <LogOut className="h-5 w-5" />
                Hesaptan Çıkış
              </CardTitle>
              <CardDescription>
                Hesabınızdan güvenli bir şekilde çıkış yapın
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="destructive" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Çıkış Yap
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* App Settings Tab */}
        <TabsContent value="app" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Uygulama Ayarları
              </CardTitle>
              <CardDescription>
                Uygulama deneyiminizi kişiselleştirin
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    Bildirimler
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Çalışma hatırlatıcıları ve bildirimleri alın
                  </p>
                </div>
                <Switch
                  checked={notifications}
                  onCheckedChange={setNotifications}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    Koyu Tema
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Uygulama görünümünü koyu moda geçirin
                  </p>
                </div>
                <Switch
                  checked={darkMode}
                  onCheckedChange={setDarkMode}
                />
              </div>
              
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Dil
                </Label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full p-2 border rounded-md bg-background"
                >
                  <option value="tr">Türkçe</option>
                  <option value="en">English</option>
                </select>
              </div>
              
              <Button onClick={handleAppSettingsSave} disabled={isSaving}>
                {isSaving && <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />}
                <Save className="h-4 w-4 mr-2" />
                Ayarları Kaydet
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advanced Settings Tab */}
        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                AI API Ayarları
              </CardTitle>
              <CardDescription>
                Shakespeare AI API adresini özelleştirin. Değişiklikler tarayıcılar arasında senkronize edilmez, her cihazda ayrı ayarlanmalıdır.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="api-url">API Adresi</Label>
                <Input
                  id="api-url"
                  type="url"
                  placeholder="https://ai.shakespeare.diy/v1"
                  value={apiUrl}
                  onChange={(e) => setApiUrlState(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Varsayılan: https://ai.shakespeare.diy/v1
                </p>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={() => {
                    setApiUrl(apiUrl);
                    toast({
                      title: 'Başarılı',
                      description: 'API adresi kaydedildi',
                    });
                  }}
                  disabled={!apiUrl.trim()}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Kaydet
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={() => {
                    resetApiUrl();
                    setApiUrlState(getCurrentApiUrl());
                    toast({
                      title: 'Başarılı',
                      description: 'API adresi varsayılana sıfırlandı',
                    });
                  }}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Sıfırla
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
