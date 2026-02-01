import { Link, useLocation } from 'react-router-dom';
import { ChevronLeft, Search, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface DesktopHeaderProps {
  title?: string;
  showBack?: boolean;
  backTo?: string;
  showSearch?: boolean;
}

export function DesktopHeader({ 
  title, 
  showBack = false, 
  backTo = '/',
  showSearch = true
}: DesktopHeaderProps) {
  const location = useLocation();

  // Auto-detect title based on route if not provided
  const getDefaultTitle = () => {
    if (title) return title;
    const path = location.pathname;
    if (path === '/') return 'Tableau de bord';
    if (path === '/catalogue') return 'Catalogue MSP';
    if (path === '/sites') return 'Sites conventionnés';
    if (path === '/scanner') return 'Scanner QR';
    if (path === '/creer') return 'Nouvelle fiche MSP';
    if (path.includes('/edit')) return 'Modifier';
    return 'CatalMSP';
  };

  return (
    <header className="hidden lg:flex items-center justify-between h-16 px-8 bg-background border-b border-border">
      <div className="flex items-center gap-4">
        {showBack && (
          <Link to={backTo}>
            <Button variant="ghost" size="sm" className="gap-1.5 -ml-2">
              <ChevronLeft className="w-5 h-5" />
              Retour
            </Button>
          </Link>
        )}
        <h1 className="font-display text-xl font-semibold text-foreground">
          {getDefaultTitle()}
        </h1>
      </div>

      <div className="flex items-center gap-4">
        {showSearch && (
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Rechercher..." 
              className="pl-9 bg-muted/50 border-0 focus-visible:ring-1"
            />
          </div>
        )}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
        </Button>
      </div>
    </header>
  );
}
