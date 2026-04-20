


import { useState } from 'react';
import LoginDialog from './LoginDialog';
import SignupDialog from './SignupDialog';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { AccountSwitcher } from './AccountSwitcher';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface LoginAreaProps {
  className?: string;
}

export function LoginArea({ className }: LoginAreaProps) {
  const { user } = useCurrentUser();
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [signupDialogOpen, setSignupDialogOpen] = useState(false);

  const handleLogin = () => {
    setLoginDialogOpen(false);
    setSignupDialogOpen(false);
  };

  return (
    <div className={cn("inline-flex items-center justify-center", className)}>
      {user ? (
        <AccountSwitcher onAddAccountClick={() => setLoginDialogOpen(true)} />
      ) : (
        <div className="flex gap-3 justify-center">
          <Button
            onClick={() => setLoginDialogOpen(true)}
            className='flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground w-full font-medium transition-all hover:bg-primary/90 animate-scale-in'
          >
            <span className='truncate'>Log in</span>
          </Button><Button
            onClick={() => setSignupDialogOpen(true)}
            variant="outline"
            className="flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all"
          >
            <span>Sign up</span>
          </Button>
        </div>
      )}

      <LoginDialog
        isOpen={loginDialogOpen}
        onClose={() => setLoginDialogOpen(false)}
        onLogin={handleLogin}
      />

      <SignupDialog
        isOpen={signupDialogOpen}
        onClose={() => setSignupDialogOpen(false)}
      />
    </div>
  );
}