import { MSP, SITE_TYPES } from '@/types/msp';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { DifficultyBadge } from '@/components/ui/DifficultyBadge';
import { ThemeBadge } from '@/components/ui/ThemeBadge';
import { MapPin, Calendar, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface MSPCardProps {
  msp: MSP;
  index?: number;
  onDelete?: (id: string) => void;
  showDeleteButton?: boolean;
}

export function MSPCard({ msp, index = 0, onDelete, showDeleteButton = false }: MSPCardProps) {
  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Link to={`/msp/${msp.slug}`}>
        <div className="card-interactive p-4 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-display font-semibold text-foreground truncate">
                {msp.title}
              </h3>
              <p className="text-sm text-muted-foreground truncate">
                {msp.siteName}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <DifficultyBadge level={msp.difficulty} />
              {showDeleteButton && onDelete && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={handleDelete}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Supprimer cette MSP ?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Cette action est irréversible. La fiche "{msp.title}" sera définitivement supprimée.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(msp.id);
                        }}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Supprimer
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{msp.commune}</span>
            <span className="text-border">•</span>
            <span className="truncate">{SITE_TYPES[msp.siteType]}</span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border">
            <div className="flex items-center gap-2">
              <ThemeBadge theme={msp.theme} />
              <StatusBadge status={msp.status} />
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(msp.updatedAt).toLocaleDateString('fr-FR', { 
                day: 'numeric', 
                month: 'short' 
              })}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
