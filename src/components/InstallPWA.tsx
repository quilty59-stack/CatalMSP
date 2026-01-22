import { useState } from 'react';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Download, Share, Plus, CheckCircle2, Smartphone } from 'lucide-react';

export function InstallPWA() {
  const { isInstallable, isInstalled, install, showIOSInstructions } = usePWAInstall();
  const [showIOSDialog, setShowIOSDialog] = useState(false);

  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (showIOSInstructions) {
      setShowIOSDialog(true);
    } else if (isInstallable) {
      await install();
    }
  };

  // Don't show if not installable and not iOS
  if (!isInstallable && !showIOSInstructions) {
    return null;
  }

  return (
    <>
      <Button
        onClick={handleInstallClick}
        variant="outline"
        size="sm"
        className="gap-2 border-primary/30 text-primary hover:bg-primary/10"
      >
        <Download className="w-4 h-4" />
        Installer l'app
      </Button>

      {/* iOS Instructions Dialog */}
      <Dialog open={showIOSDialog} onOpenChange={setShowIOSDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-primary" />
              Installer sur iPhone
            </DialogTitle>
            <DialogDescription>
              Suivez ces étapes pour ajouter CatalMSP à votre écran d'accueil
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 pt-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-sm font-bold text-primary">1</span>
              </div>
              <div>
                <p className="font-medium">Appuyez sur le bouton Partager</p>
                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                  <Share className="w-4 h-4" />
                  <span>en bas de Safari</span>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-sm font-bold text-primary">2</span>
              </div>
              <div>
                <p className="font-medium">Faites défiler et appuyez sur</p>
                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                  <Plus className="w-4 h-4" />
                  <span>"Sur l'écran d'accueil"</span>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-sm font-bold text-primary">3</span>
              </div>
              <div>
                <p className="font-medium">Confirmez en appuyant sur</p>
                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>"Ajouter"</span>
                </div>
              </div>
            </div>

            <Button 
              className="w-full mt-4" 
              onClick={() => setShowIOSDialog(false)}
            >
              J'ai compris
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
