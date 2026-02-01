import { Link, useLocation } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserMenu } from '@/components/UserMenu';
import logo from '@/assets/logo.png';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  backTo?: string;
}

export function Header({ title, showBack = false, backTo = '/' }: HeaderProps) {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border pt-[env(safe-area-inset-top)]">
      <div className="container flex items-center justify-between h-14 px-4">
        {showBack ? (
          <Link to={backTo}>
            <Button variant="ghost" size="sm" className="gap-1.5 -ml-2">
              <ChevronLeft className="w-5 h-5" />
              Retour
            </Button>
          </Link>
        ) : (
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="CatalMSP" className="w-10 h-10" />
            <span className="font-display font-bold text-lg text-foreground">
              CatalMSP
            </span>
          </Link>
        )}

        {title && (
          <h1 className="absolute left-1/2 -translate-x-1/2 font-display font-semibold text-foreground">
            {title}
          </h1>
        )}

        <UserMenu />
      </div>
    </header>
  );
}
