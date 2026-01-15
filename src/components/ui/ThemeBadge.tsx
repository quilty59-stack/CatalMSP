import { Theme, THEMES } from '@/types/msp';
import { cn } from '@/lib/utils';
import { Flame, Wind, Beaker, Heart, HelpCircle } from 'lucide-react';

interface ThemeBadgeProps {
  theme: Theme;
  className?: string;
}

const themeConfig: Record<Theme, { icon: typeof Flame; class: string }> = {
  incendie: { icon: Flame, class: 'bg-destructive/10 text-destructive' },
  gaz: { icon: Wind, class: 'bg-warning/10 text-warning' },
  chimique: { icon: Beaker, class: 'bg-accent/10 text-accent-foreground' },
  secours: { icon: Heart, class: 'bg-success/10 text-success' },
  autre: { icon: HelpCircle, class: 'bg-muted text-muted-foreground' },
};

export function ThemeBadge({ theme, className }: ThemeBadgeProps) {
  const config = themeConfig[theme];
  const Icon = config.icon;

  return (
    <span className={cn('status-badge', config.class, className)}>
      <Icon className="w-3 h-3 mr-1" />
      {THEMES[theme]}
    </span>
  );
}
