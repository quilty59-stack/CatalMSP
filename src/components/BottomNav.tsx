import { Link, useLocation } from 'react-router-dom';
import { Home, FolderOpen, Plus, QrCode, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { icon: Home, label: 'Accueil', path: '/' },
  { icon: FolderOpen, label: 'MSP', path: '/catalogue' },
  { icon: Plus, label: 'Créer', path: '/creer', accent: true },
  { icon: Building2, label: 'Sites', path: '/sites' },
  { icon: QrCode, label: 'Scanner', path: '/scanner' },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border pb-[env(safe-area-inset-bottom)]">
      <div className="container flex items-center justify-around h-14 px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl transition-all duration-200 min-w-[64px]',
                isActive && !item.accent && 'text-primary',
                !isActive && !item.accent && 'text-muted-foreground hover:text-foreground',
                item.accent && 'relative'
              )}
            >
              {item.accent ? (
                <div className="absolute -top-4 w-12 h-12 gradient-hero rounded-full flex items-center justify-center shadow-lg">
                  <Icon className="w-6 h-6 text-primary-foreground" />
                </div>
              ) : (
                <Icon className={cn('w-5 h-5', isActive && 'stroke-[2.5px]')} />
              )}
              <span className={cn(
                'text-xs font-medium',
                item.accent && 'mt-5'
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
