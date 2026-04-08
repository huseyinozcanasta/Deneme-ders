// NOTE: This file is stable and usually should not be modified.
// It is important that all functionality in this file is preserved, and should only be modified if explicitly requested.

import React, { useEffect } from 'react';
import { Cloud, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useGoogleAuth } from '@/hooks/useGoogleAuth';

interface LoginDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const validateNsec = (nsec: string) => {
  return /^nsec1[a-zA-Z0-9]{58}$/.test(nsec);
};

const validateBunkerUri = (uri: string) => {
  return uri.startsWith('bunker://');
};

/** Check if running on actual mobile device (not just small screen) */
function isMobileDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

const LoginDialog: React.FC<LoginDialogProps> = ({ isOpen, onClose }) => {
  const googleAuth = useGoogleAuth();

  // Force GSI render after mount
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        const btn = document.getElementById('google-signin-button');
        if (btn) {
          btn.style.display = 'block';
          btn.style.height = 'auto';
          btn.style.opacity = '1';
        }
      }, 500);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-sm max-h-[90dvh] p-0 gap-6 overflow-hidden rounded-2xl overflow-y-auto">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="text-lg font-semibold leading-none tracking-tight text-center">
            Log in
          </DialogTitle>
        </DialogHeader>

        <div className="flex size-40 text-8xl bg-primary/10 rounded-full items-center justify-center justify-self-center">
          ☁️
        </div>

        <div className='px-6 pb-6 space-y-4'>
          <div className="space-y-4 text-center">
            <div id="google-signin-button" className="w-full h-14 rounded-2xl shadow-lg" />
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Google ile giriş yap</p>
              <p className="text-xs text-muted-foreground">
                📱💻 Verilerin Drive hesabında senkronize kalır - her cihazdan eriş
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoginDialog;

