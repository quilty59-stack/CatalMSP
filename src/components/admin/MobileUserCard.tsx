import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Loader2, Shield, Users, CheckCircle, XCircle, Clock, UserCheck, UserX, Trash2, KeyRound, ChevronDown, ChevronUp, Mail, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

type AppRole = 'admin' | 'formateur' | 'pending';

interface UserWithRole {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  is_approved: boolean;
  created_at: string;
  role: AppRole;
}

interface MobileUserCardProps {
  user: UserWithRole;
  updatingUser: string | null;
  onUpdateApproval: (userId: string, isApproved: boolean) => void;
  onUpdateRole: (userId: string, newRole: AppRole) => void;
  onResetPassword: (email: string, userName: string) => void;
  onDeleteUser: (userId: string, userName: string) => void;
}

export function MobileUserCard({
  user,
  updatingUser,
  onUpdateApproval,
  onUpdateRole,
  onResetPassword,
  onDeleteUser,
}: MobileUserCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isUpdating = updatingUser === user.user_id || updatingUser === user.email;

  const getRoleBadge = (role: AppRole) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-primary text-xs"><Shield className="w-3 h-3 mr-1" />Admin</Badge>;
      case 'formateur':
        return <Badge variant="secondary" className="text-xs"><Users className="w-3 h-3 mr-1" />Formateur</Badge>;
      case 'pending':
        return <Badge variant="outline" className="text-xs"><Clock className="w-3 h-3 mr-1" />En attente</Badge>;
    }
  };

  return (
    <Card className={cn(
      "transition-all duration-200",
      !user.is_approved && "border-warning/50 bg-warning/5"
    )}>
      <CardContent className="p-4">
        {/* Header - always visible */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-foreground truncate">
                {user.first_name} {user.last_name}
              </h3>
              {!user.is_approved && (
                <Badge variant="destructive" className="text-xs">
                  <XCircle className="w-3 h-3 mr-1" />
                  Non validé
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground truncate mt-1">
              <Mail className="w-3 h-3 inline mr-1" />
              {user.email}
            </p>
          </div>
          
          {/* Quick approve button for pending users */}
          {!user.is_approved && !isUpdating && (
            <Button
              size="sm"
              className="shrink-0"
              onClick={() => onUpdateApproval(user.user_id, true)}
            >
              <UserCheck className="w-4 h-4 mr-1" />
              Valider
            </Button>
          )}
          
          {isUpdating && (
            <Loader2 className="w-5 h-5 animate-spin text-primary shrink-0" />
          )}
        </div>

        {/* Meta info row */}
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          {getRoleBadge(user.role)}
          {user.is_approved && (
            <Badge className="bg-success/10 text-success border-success/30 text-xs">
              <CheckCircle className="w-3 h-3 mr-1" />
              Approuvé
            </Badge>
          )}
          <span className="text-xs text-muted-foreground ml-auto">
            <Calendar className="w-3 h-3 inline mr-1" />
            {new Date(user.created_at).toLocaleDateString('fr-FR')}
          </span>
        </div>

        {/* Expand button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-center gap-1 text-xs text-muted-foreground hover:text-foreground mt-3 pt-3 border-t"
        >
          {isExpanded ? (
            <>Moins d'options <ChevronUp className="w-4 h-4" /></>
          ) : (
            <>Plus d'options <ChevronDown className="w-4 h-4" /></>
          )}
        </button>

        {/* Expanded actions */}
        {isExpanded && (
          <div className="mt-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
            {/* Role selector */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Modifier le rôle</label>
              <Select
                value={user.role}
                onValueChange={(value: AppRole) => onUpdateRole(user.user_id, value)}
                disabled={isUpdating}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="formateur">Formateur</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2">
              {user.is_approved ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => onUpdateApproval(user.user_id, false)}
                  disabled={isUpdating}
                >
                  <UserX className="w-4 h-4 mr-2" />
                  Retirer accès
                </Button>
              ) : (
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => onUpdateApproval(user.user_id, true)}
                  disabled={isUpdating}
                >
                  <UserCheck className="w-4 h-4 mr-2" />
                  Approuver
                </Button>
              )}

              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => onResetPassword(user.email, `${user.first_name} ${user.last_name}`)}
                disabled={isUpdating}
              >
                <KeyRound className="w-4 h-4 mr-2" />
                Reset MDP
              </Button>
            </div>

            {/* Delete button */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  className="w-full"
                  disabled={isUpdating}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Supprimer l'utilisateur
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Supprimer l'utilisateur ?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Cette action est irréversible. {user.first_name} {user.last_name} ({user.email}) sera définitivement supprimé.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDeleteUser(user.user_id, `${user.first_name} ${user.last_name}`)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Supprimer
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
