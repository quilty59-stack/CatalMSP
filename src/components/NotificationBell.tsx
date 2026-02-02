import { useNavigate } from 'react-router-dom';
import { Bell, FileText, MapPin, UserPlus, CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSettings } from '@/hooks/useSettings';
import { useNotifications, Notification } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

const typeIcons: Record<string, React.ReactNode> = {
  msp_created: <FileText className="w-4 h-4 text-primary" />,
  msp_validated: <CheckCircle className="w-4 h-4 text-success" />,
  msp_rejected: <XCircle className="w-4 h-4 text-destructive" />,
  site_created: <MapPin className="w-4 h-4 text-info" />,
  user_signup: <UserPlus className="w-4 h-4 text-warning" />,
};

export function NotificationBell({ variant = 'default' }: { variant?: 'default' | 'mobile' }) {
  const navigate = useNavigate();
  const { notificationsEnabled } = useSettings();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  if (!notificationsEnabled) {
    return null;
  }

  const recentNotifications = notifications.slice(0, 5);

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const buttonClasses = variant === 'mobile' 
    ? 'relative h-9 w-9'
    : 'relative';

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className={buttonClasses}>
          <Bell className={variant === 'mobile' ? 'w-4 h-4' : 'w-5 h-5'} />
          {unreadCount > 0 && (
            <span className={`absolute ${variant === 'mobile' ? 'top-0 right-0' : 'top-1 right-1'} flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground`}>
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-semibold text-foreground">Notifications</h3>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs text-primary"
              onClick={markAllAsRead}
            >
              Tout marquer comme lu
            </Button>
          )}
        </div>
        <ScrollArea className="h-72">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-8 text-muted-foreground">
              <Bell className="w-8 h-8 mb-2 opacity-50" />
              <p className="text-sm">Aucune notification</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {recentNotifications.map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`w-full text-left p-4 hover:bg-muted/50 transition-colors ${
                    !notification.read ? 'bg-primary/5' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      {typeIcons[notification.type] || <Bell className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm text-foreground truncate">
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <span className="w-2 h-2 bg-primary rounded-full shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground/70 mt-1">
                        {formatDistanceToNow(new Date(notification.created_at), { 
                          addSuffix: true, 
                          locale: fr 
                        })}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
        {notifications.length > 0 && (
          <div className="p-3 border-t border-border">
            <Button 
              variant="outline" 
              className="w-full gap-2"
              onClick={() => navigate('/notifications')}
            >
              <ExternalLink className="w-4 h-4" />
              Voir toutes les notifications
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
