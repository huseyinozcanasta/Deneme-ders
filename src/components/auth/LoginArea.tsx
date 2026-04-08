// NOTE: This file is stable and usually should not be modified.
// It is important that all functionality in this file is preserved, and should only be modified if explicitly requested.

import { useState } from 'react';
import { Button } from '@/components/ui/button.tsx';
import LoginDialog from './LoginDialog';
import SignupDialog from './SignupDialog';
import { useLoggedInAccounts } from '@/hooks/useLoggedInAccounts';
import { AccountSwitcher } from './AccountSwitcher';
import { cn } from '@/lib/utils';

export interface LoginAreaProps {
  className?: string;
  fullScreen?: boolean;
}

export function LoginArea({ className, fullScreen = false }: LoginAreaProps) {
  const { currentUser } = useLoggedInAccounts();
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [signupDialogOpen, setSignupDialogOpen] = useState(false);

  const handleLogin = () => {
    setLoginDialogOpen(false);
    setSignupDialogOpen(false);
  };

  const baseClass = cn(
    "inline-flex items-center justify-center",
    className,
    fullScreen && "w-full max-w-2xl p-8 bg-card rounded-3xl shadow-2xl border"
  );

  const buttonClass = cn(
    'flex items-center gap-2 px-6 py-4 rounded-2xl font-semibold text-lg transition-all hover:scale-105',
    fullScreen 
      ? 'w-full justify-center bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-xl hover:shadow-2xl' 
      : 'px-4 py-2 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 animate-scale-in'
  );

  return (
    <div className={baseClass}>
      {currentUser ? (
        <AccountSwitcher onAddAccountClick={() => setLoginDialogOpen(true)} />
      ) : (
        <div className={cn("flex flex-col sm:flex-row gap-4 w-full justify-center", fullScreen && "sm:gap-6")}>
          <Button
            onClick={() => setLoginDialogOpen(true)}
            className={buttonClass}
            size={fullScreen ? "lg" : undefined}
          >
            <span className='truncate'>{fullScreen ? 'Giriş Yap' : 'Log in'}</span>
          </Button>
          <Button
            onClick={() => setSignupDialogOpen(true)}
            variant="outline"
            size={fullScreen ? "lg" : undefined}
            className={cn(
              "flex items-center gap-2 px-6 py-4 rounded-2xl font-semibold text-lg transition-all hover:scale-105",
              fullScreen && "w-full justify-center border-2"
            )}
          >
            <span>{fullScreen ? 'Kaydol' : 'Sign up'}</span>
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

