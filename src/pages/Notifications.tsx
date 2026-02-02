import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ResponsiveLayout } from '@/components/ResponsiveLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useNotifications, Notification } from '@/hooks/useNotifications';
import { toast } from 'sonner';
import { 
  Bell, 
  Check, 
  CheckCheck, 
  Trash2, 
  FileText, 
  MapPin, 
  UserPlus, 
  CheckCircle, 
  XCircle,
  Loader2,
  ExternalLink,
  Filter
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

const typeIcons: Record<string, React.ReactNode> = {
  msp_created: <FileText className="w-5 h-5 text-primary" />,
  msp_validated: <CheckCircle className="w-5 h-5 text-success" />,
  msp_rejected: <XCircle className="w-5 h-5 text-destructive" />,
  site_created: <MapPin className="w-5 h-5 text-info" />,
  user_signup: <UserPlus className="w-5 h-5 text-warning" />,
};

const typeLabels: Record<string, string> = {
  msp_created: 'Nouvelle MSP',
  msp_validated: 'MSP validée',
  msp_rejected: 'MSP refusée',
  site_created: 'Nouveau site',
  user_signup: 'Inscription',
};

function NotificationItem({ 
  notification, 
  onMarkAsRead, 
  onDelete,
  onNavigate
}: { 
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  onNavigate: (link: string) => void;
}) {
  return (
    <Card className={`transition-colors ${!notification.read ? 'bg-primary/5 border-primary/20' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="shrink-0 w-10 h-10 rounded-full bg-muted flex items-center justify-center">
            {typeIcons[notification.type] || <Bell className="w-5 h-5" />}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-medium text-foreground">{notification.title}</h3>
                  {!notification.read && (
                    <Badge variant="default" className="text-xs">Nouveau</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                <p className="text-xs text-muted-foreground/70 mt-2">
                  {formatDistanceToNow(new Date(notification.created_at), { 
                    addSuffix: true, 
                    locale: fr 
                  })}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 mt-3">
              {notification.link && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1"
                  onClick={() => onNavigate(notification.link!)}
                >
                  <ExternalLink className="w-3 h-3" />
                  Voir
                </Button>
              )}
              
              {!notification.read && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1"
                  onClick={() => onMarkAsRead(notification.id)}
                >
                  <Check className="w-3 h-3" />
                  Marquer lu
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                className="gap-1 text-destructive hover:text-destructive"
                onClick={() => onDelete(notification.id)}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Notifications() {
  const navigate = useNavigate();
  const { 
    notifications, 
    unreadCount, 
    isLoading, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification,
    deleteOldNotifications 
  } = useNotifications();
  
  const [filter, setFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
  const [isCleaning, setIsCleaning] = useState(false);

  const handleCleanup = async (daysOld: number) => {
    // Give immediate user feedback when nothing matches the cutoff.
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - daysOld);

    const matchingCount = notifications.filter((n) => {
      const created = new Date(n.created_at);
      return created.getTime() < cutoff.getTime();
    }).length;

    if (matchingCount === 0) {
      toast('Aucune notification de plus de 30 jours à supprimer.');
      return;
    }

    setIsCleaning(true);
    try {
      await deleteOldNotifications(daysOld);
      toast.success(`${matchingCount} notification${matchingCount > 1 ? 's' : ''} supprimée${matchingCount > 1 ? 's' : ''}.`);
    } catch (e) {
      toast.error('Erreur lors du nettoyage des notifications.');
    } finally {
      setIsCleaning(false);
    }
  };

  const handleNavigate = (link: string) => {
    navigate(link);
  };

  const filteredNotifications = notifications.filter((n) => {
    // Filter by read status
    if (activeTab === 'unread' && n.read) return false;
    
    // Filter by type
    if (filter !== 'all' && n.type !== filter) return false;
    
    return true;
  });

  if (isLoading) {
    return (
      <ResponsiveLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </ResponsiveLayout>
    );
  }

  return (
    <ResponsiveLayout>
      <div className="p-4 lg:p-8 space-y-6 pb-24">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground flex items-center gap-3">
              <Bell className="w-7 h-7" />
              Notifications
              {unreadCount > 0 && (
                <Badge variant="default">{unreadCount}</Badge>
              )}
            </h1>
            <p className="text-muted-foreground mt-1">
              Gérez vos notifications et alertes
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={markAllAsRead} className="gap-2">
                <CheckCheck className="w-4 h-4" />
                Tout marquer comme lu
              </Button>
            )}
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Trash2 className="w-4 h-4" />
                  Nettoyer
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Supprimer les anciennes notifications</AlertDialogTitle>
                  <AlertDialogDescription>
                    Voulez-vous supprimer toutes les notifications de plus de 30 jours ? (Les notifications récentes seront conservées.)
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => void handleCleanup(30)}
                    disabled={isCleaning}
                  >
                    {isCleaning ? (
                      <span className="inline-flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Suppression…
                      </span>
                    ) : (
                      'Supprimer'
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'all' | 'unread')} className="w-full sm:w-auto">
            <TabsList>
              <TabsTrigger value="all">Toutes ({notifications.length})</TabsTrigger>
              <TabsTrigger value="unread">
                Non lues
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="ml-2">{unreadCount}</Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrer par type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="msp_created">Nouvelles MSP</SelectItem>
                <SelectItem value="msp_validated">MSP validées</SelectItem>
                <SelectItem value="msp_rejected">MSP refusées</SelectItem>
                <SelectItem value="site_created">Nouveaux sites</SelectItem>
                <SelectItem value="user_signup">Inscriptions</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Bell className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground">
                {activeTab === 'unread' ? 'Aucune notification non lue' : 'Aucune notification'}
              </h3>
              <p className="text-sm text-muted-foreground/70 mt-1">
                {activeTab === 'unread' 
                  ? 'Toutes vos notifications ont été lues'
                  : 'Vous n\'avez pas encore de notifications'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={markAsRead}
                onDelete={deleteNotification}
                onNavigate={handleNavigate}
              />
            ))}
          </div>
        )}
      </div>
    </ResponsiveLayout>
  );
}
