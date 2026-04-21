import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface LoginAreaProps {
  className?: string;
}

export function LoginArea({ className }: LoginAreaProps) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate('/login');
  };

  return (
    <div className={cn("inline-flex items-center justify-center", className)}>
      {user ? (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {user.email}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/home')}
          >
            Dashboard
          </Button>
        </div>
      ) : (
        <div className="flex gap-3 justify-center">
          <Button
            onClick={handleLoginClick}
            className='flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground w-full font-medium transition-all hover:bg-primary/90 animate-scale-in'
          >
            <span className='truncate'>Giriş Yap</span>
          </Button>
        </div>
      )}
    </div>
  );
}