import { useGoogleAuth } from '@/hooks/useGoogleAuth';
import { LoginArea } from './LoginArea';
import { Outlet } from 'react-router-dom';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isSignedIn } = useGoogleAuth();

  // If not logged in, show full-screen login
  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center p-8">
        <div className="w-full max-w-2xl">
          <LoginArea fullScreen />
        </div>
      </div>
    );
  }

  // Logged in, render children
  return <>{children}</>;
}
