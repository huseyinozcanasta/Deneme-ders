import { Button } from '@/components/ui/button';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';

export function GoogleAccountSwitcher() {
  const googleAuth = useGoogleAuth();

  if (!googleAuth.user) return null;

  return (
    <div className="flex items-center gap-3 p-2 rounded-full hover:bg-accent">
      <img 
        src={googleAuth.user.picture} 
        alt="Google Profile" 
        className="w-10 h-10 rounded-full ring-2 ring-primary/20"
      />
      <div className="flex flex-col items-start">
        <span className="text-sm font-medium truncate max-w-[120px]">
          {googleAuth.user.name}
        </span>
        <span className="text-xs text-muted-foreground truncate max-w-[120px]">
          {googleAuth.user.email}
        </span>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 ml-1"
        onClick={() => googleAuth.signOut()}
        title="Çıkış yap"
      >
        Logout
      </Button>
    </div>
  );
}
