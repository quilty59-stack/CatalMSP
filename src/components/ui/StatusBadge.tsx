import { Status, STATUSES } from '@/types/msp';
import { cn } from '@/lib/utils';
import { CheckCircle, Clock, AlertTriangle } from 'lucide-react';

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

const statusConfig = {
  validee: {
    class: 'status-validated',
    icon: CheckCircle,
  },
  brouillon: {
    class: 'status-draft',
    icon: Clock,
  },
  a_ajuster: {
    class: 'status-adjust',
    icon: AlertTriangle,
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span className={cn('status-badge', config.class, className)}>
      <Icon className="w-3 h-3 mr-1" />
      {STATUSES[status]}
    </span>
  );
}
