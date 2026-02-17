import { forwardRef } from 'react';
import { Theme, THEMES } from '@/types/msp';
import { cn } from '@/lib/utils';
import { Flame, Wind, Beaker, Heart, HelpCircle } from 'lucide-react';

interface ThemeBadgeProps {
  theme: Theme | string;
  className?: string;
}

const themeConfig: Record<Theme, { icon: typeof Flame; class: string }> = {
  incendie: { icon: Flame, class: 'bg-destructive/10 text-destructive' },
  gaz: { icon: Wind, class: 'bg-warning/10 text-warning' },
  chimique: { icon: Beaker, class: 'bg-accent/10 text-accent-foreground' },
  secours: { icon: Heart, class: 'bg-success/10 text-success' },
  autre: { icon: HelpCircle, class: 'bg-muted text-muted-foreground' },
};

export const ThemeBadge = forwardRef<HTMLSpanElement, ThemeBadgeProps>(
  ({ theme, className }, ref) => {
    // Handle multi-theme values like "incendie, gaz"
    const themes = theme ? theme.split(',').map(t => t.trim()) : ['autre'];

    return (
      <span ref={ref} className={cn('flex items-center gap-1', className)}>
        {themes.map((t) => {
          const key = t as Theme;
          const config = themeConfig[key] || themeConfig.autre;
          const Icon = config.icon;
          const label = THEMES[key] || t;

          return (
            <span key={t} className={cn('status-badge', config.class)}>
              <Icon className="w-3 h-3 mr-1" />
              {label}
            </span>
          );
        })}
      </span>
    );
  }
);

ThemeBadge.displayName = 'ThemeBadge';
