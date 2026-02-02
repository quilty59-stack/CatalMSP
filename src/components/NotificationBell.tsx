import { useState } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSettings } from '@/hooks/useSettings';

interface Notification {
  id: string;
  title: string;
  message: string;
  date: Date;
  read: boolean;
}

// Mock notifications - in a real app these would come from the backend
const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'Bienvenue sur CatalMSP',
    message: 'Découvrez les fonctionnalités de l\'application',
    date: new Date(),
    read: false,
  },
];

export function NotificationBell({ variant = 'default' }: { variant?: 'default' | 'mobile' }) {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [open, setOpen] = useState(false);
  const { notificationsEnabled } = useSettings();

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  if (!notificationsEnabled) {
    return null;
  }

  const buttonClasses = variant === 'mobile' 
    ? 'relative h-9 w-9'
    : 'relative';

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className={buttonClasses}>
          <Bell className={variant === 'mobile' ? 'w-4 h-4' : 'w-5 h-5'} />
          {unreadCount > 0 && (
            <span className={`absolute ${variant === 'mobile' ? 'top-0 right-0 w-2 h-2' : 'top-1 right-1 w-2 h-2'} bg-primary rounded-full`} />
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
              {notifications.map(notification => (
                <button
                  key={notification.id}
                  onClick={() => markAsRead(notification.id)}
                  className={`w-full text-left p-4 hover:bg-muted/50 transition-colors ${
                    !notification.read ? 'bg-primary/5' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {!notification.read && (
                      <span className="w-2 h-2 mt-2 bg-primary rounded-full shrink-0" />
                    )}
                    <div className={!notification.read ? '' : 'ml-5'}>
                      <p className="font-medium text-sm text-foreground">{notification.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{notification.message}</p>
                      <p className="text-xs text-muted-foreground/70 mt-1">
                        {notification.date.toLocaleDateString('fr-FR', { 
                          day: 'numeric', 
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
