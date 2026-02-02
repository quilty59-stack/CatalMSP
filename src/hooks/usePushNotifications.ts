import { useState, useEffect, useCallback } from 'react';

export interface PushNotificationState {
  permission: NotificationPermission;
  subscription: PushSubscription | null;
  isSupported: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface UsePushNotificationsReturn extends PushNotificationState {
  requestPermission: () => Promise<NotificationPermission>;
  subscribe: (vapidPublicKey?: string) => Promise<PushSubscription | null>;
  unsubscribe: () => Promise<boolean>;
  sendTestNotification: () => void;
}

/**
 * Converts a base64 URL-safe string to a Uint8Array for VAPID keys
 */
function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray.buffer;
}

export function usePushNotifications(): UsePushNotificationsReturn {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if push notifications are supported
  const isSupported = typeof window !== 'undefined' && 
    'serviceWorker' in navigator && 
    'PushManager' in window &&
    'Notification' in window;

  // Initialize permission state
  useEffect(() => {
    if (isSupported) {
      setPermission(Notification.permission);
    }
  }, [isSupported]);

  // Check for existing subscription on mount
  useEffect(() => {
    const checkExistingSubscription = async () => {
      if (!isSupported) return;

      try {
        const registration = await navigator.serviceWorker.ready;
        const existingSubscription = await registration.pushManager.getSubscription();
        if (existingSubscription) {
          setSubscription(existingSubscription);
        }
      } catch (err) {
        console.error('Error checking existing subscription:', err);
      }
    };

    checkExistingSubscription();
  }, [isSupported]);

  /**
   * Request notification permission from the user
   */
  const requestPermission = useCallback(async (): Promise<NotificationPermission> => {
    if (!isSupported) {
      setError('Les notifications push ne sont pas supportées par ce navigateur');
      return 'denied';
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === 'denied') {
        setError('Les notifications ont été refusées');
      }
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la demande de permission';
      setError(errorMessage);
      return 'denied';
    } finally {
      setIsLoading(false);
    }
  }, [isSupported]);

  /**
   * Subscribe to push notifications
   */
  const subscribe = useCallback(async (vapidPublicKey?: string): Promise<PushSubscription | null> => {
    if (!isSupported) {
      setError('Les notifications push ne sont pas supportées par ce navigateur');
      return null;
    }

    if (permission !== 'granted') {
      const newPermission = await requestPermission();
      if (newPermission !== 'granted') {
        return null;
      }
    }

    setIsLoading(true);
    setError(null);

    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Use provided VAPID key or fallback to environment variable or hardcoded key
      const publicKey = vapidPublicKey || import.meta.env.VITE_VAPID_PUBLIC_KEY;
      
      if (!publicKey) {
        throw new Error('Clé VAPID publique non configurée. Veuillez ajouter VITE_VAPID_PUBLIC_KEY dans les variables d\'environnement.');
      }

      const subscriptionOptions: PushSubscriptionOptionsInit = {
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      };

      const pushSubscription = await registration.pushManager.subscribe(subscriptionOptions);
      setSubscription(pushSubscription);
      
      console.log('Push subscription created:', JSON.stringify(pushSubscription));
      
      return pushSubscription;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'abonnement aux notifications';
      setError(errorMessage);
      console.error('Subscription error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported, permission, requestPermission]);

  /**
   * Unsubscribe from push notifications
   */
  const unsubscribe = useCallback(async (): Promise<boolean> => {
    if (!subscription) {
      setError('Aucun abonnement actif');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const success = await subscription.unsubscribe();
      
      if (success) {
        setSubscription(null);
        console.log('Successfully unsubscribed from push notifications');
      }
      
      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du désabonnement';
      setError(errorMessage);
      console.error('Unsubscribe error:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [subscription]);

  /**
   * Send a local test notification
   */
  const sendTestNotification = useCallback(() => {
    if (!isSupported) {
      setError('Les notifications ne sont pas supportées');
      return;
    }

    if (permission !== 'granted') {
      setError('Permission de notification requise');
      return;
    }

    try {
      const notification = new Notification('CatalMSP - Test', {
        body: 'Les notifications fonctionnent correctement ! 🎉',
        icon: '/logo.png',
        badge: '/logo.png',
        tag: 'test-notification',
        requireInteraction: false,
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      // Auto-close after 5 seconds
      setTimeout(() => notification.close(), 5000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'envoi de la notification test';
      setError(errorMessage);
      console.error('Test notification error:', err);
    }
  }, [isSupported, permission]);

  return {
    permission,
    subscription,
    isSupported,
    isLoading,
    error,
    requestPermission,
    subscribe,
    unsubscribe,
    sendTestNotification,
  };
}
