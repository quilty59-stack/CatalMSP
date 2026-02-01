import { Link, useLocation } from 'react-router-dom';
import { Home, FolderOpen, Plus, Building2, Map, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

const baseNavItems = [
  { icon: Home, label: 'Accueil', path: '/' },
  { icon: FolderOpen, label: 'MSP', path: '/catalogue' },
  { icon: Plus, label: 'Créer', path: '/creer', accent: true },
  { icon: Building2, label: 'Sites', path: '/sites' },
  { icon: Map, label: 'Carte', path: '/carte' },
];

export function BottomNav() {
  const location = useLocation();
  const { isAdmin } = useAuth();

  // Add admin item if user is admin (replace Carte on mobile for admin)
  const navItems = isAdmin
    ? [
        { icon: Home, label: 'Accueil', path: '/' },
        { icon: FolderOpen, label: 'MSP', path: '/catalogue' },
        { icon: Plus, label: 'Créer', path: '/creer', accent: true },
        { icon: Building2, label: 'Sites', path: '/sites' },
        { icon: Shield, label: 'Admin', path: '/admin', adminHighlight: true },
      ]
    : baseNavItems;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border pb-[env(safe-area-inset-bottom)]">
      <div className="container flex items-center justify-around h-14 px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          const isAdminHighlight = 'adminHighlight' in item && item.adminHighlight;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl transition-all duration-200 min-w-[64px]',
                isActive && !item.accent && !isAdminHighlight && 'text-primary',
                isActive && isAdminHighlight && 'text-warning',
                !isActive && !item.accent && !isAdminHighlight && 'text-muted-foreground hover:text-foreground',
                !isActive && isAdminHighlight && 'text-warning/70 hover:text-warning',
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
