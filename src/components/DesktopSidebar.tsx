import { Link, useLocation } from 'react-router-dom';
import { Home, FolderOpen, Plus, QrCode, Building2, Settings, HelpCircle, Map } from 'lucide-react';
import { cn } from '@/lib/utils';
import logo from '@/assets/logo.png';

const navItems = [
  { icon: Home, label: 'Accueil', path: '/' },
  { icon: FolderOpen, label: 'Fiches MSP', path: '/catalogue' },
  { icon: Building2, label: 'Sites conventionnés', path: '/sites' },
  { icon: Map, label: 'Carte', path: '/carte' },
  { icon: QrCode, label: 'Scanner QR', path: '/scanner' },
];

const secondaryItems = [
  { icon: Settings, label: 'Paramètres', path: '/settings' },
  { icon: HelpCircle, label: 'Aide', path: '/aide' },
];

export function DesktopSidebar() {
  const location = useLocation();

  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen bg-sidebar-background border-r border-sidebar-border fixed left-0 top-0 z-40">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <Link to="/" className="flex items-center gap-3">
          <img src={logo} alt="CatalMSP" className="w-10 h-10" />
          <div>
            <h1 className="font-display font-bold text-lg text-sidebar-foreground">
              CatalMSP
            </h1>
            <p className="text-xs text-sidebar-foreground/60">
              Catalogue MSP
            </p>
          </div>
        </Link>
      </div>

      {/* Create Button */}
      <div className="p-4">
        <Link to="/creer">
          <button className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors">
            <Plus className="w-5 h-5" />
            Nouvelle fiche MSP
          </button>
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-1">
        <div className="text-xs font-medium text-sidebar-foreground/50 uppercase tracking-wider px-3 py-2">
          Navigation
        </div>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path !== '/' && location.pathname.startsWith(item.path));
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                isActive 
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground' 
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              )}
            >
              <Icon className={cn('w-5 h-5', isActive && 'stroke-[2.5px]')} />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Secondary Navigation */}
      <div className="px-3 py-4 border-t border-sidebar-border">
        <div className="text-xs font-medium text-sidebar-foreground/50 uppercase tracking-wider px-3 py-2">
          Plus
        </div>
        {secondaryItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                isActive 
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground' 
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Stats Footer */}
      <div className="p-4 mx-3 mb-3 rounded-xl bg-sidebar-accent">
        <div className="text-xs text-sidebar-foreground/60 mb-2">Statistiques</div>
        <div className="flex gap-4">
          <div>
            <div className="text-xl font-bold text-sidebar-foreground">--</div>
            <div className="text-[10px] text-sidebar-foreground/60">Fiches</div>
          </div>
          <div>
            <div className="text-xl font-bold text-success">--</div>
            <div className="text-[10px] text-sidebar-foreground/60">Validées</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
