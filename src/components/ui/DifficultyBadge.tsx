import { Difficulty } from '@/types/msp';
import { cn } from '@/lib/utils';

interface DifficultyBadgeProps {
  level: Difficulty;
  className?: string;
  showLabel?: boolean;
}

const difficultyLabels: Record<Difficulty, string> = {
  1: 'Simple',
  2: 'Attendu',
  3: 'Complexe',
};

export function DifficultyBadge({ level, className, showLabel = false }: DifficultyBadgeProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className={cn('difficulty-badge', `difficulty-${level}`)}>
        {level}
      </span>
      {showLabel && (
        <span className="text-sm text-muted-foreground">
          {difficultyLabels[level]}
        </span>
      )}
    </div>
  );
}
