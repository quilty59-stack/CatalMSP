import { Link, useLocation } from 'react-router-dom';
import { Flame, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  backTo?: string;
}

export function Header({ title, showBack = false, backTo = '/' }: HeaderProps) {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container flex items-center justify-between h-16 px-4">
        {showBack ? (
          <Link to={backTo}>
            <Button variant="ghost" size="sm" className="gap-1.5 -ml-2">
              <ChevronLeft className="w-5 h-5" />
              Retour
            </Button>
          </Link>
        ) : (
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 gradient-hero rounded-lg flex items-center justify-center">
              <Flame className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-lg text-foreground">
              MSP Catalog
            </span>
          </Link>
        )}

        {title && (
          <h1 className="absolute left-1/2 -translate-x-1/2 font-display font-semibold text-foreground">
            {title}
          </h1>
        )}

        {!isHome && !showBack && (
          <div className="w-20" /> // Spacer for centering
        )}
      </div>
    </header>
  );
}
