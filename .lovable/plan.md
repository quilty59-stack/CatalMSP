
# Plan : Hook usePushNotifications pour PWA

## Objectif
Créer un hook React personnalisé pour gérer les push notifications natives dans la PWA CatalMSP, permettant de demander les permissions, s'abonner aux notifications et envoyer des tests.

---

## Fichier à créer

### `src/hooks/usePushNotifications.ts`

Le hook exportera :
- **Interface `PushNotificationState`** : état interne (permission, subscription, loading, error, isSupported)
- **Interface `UsePushNotificationsReturn`** : retour du hook avec états et fonctions
- **Fonction `usePushNotifications`** : le hook principal

### Fonctionnalités implémentées

1. **Détection du support**
   - Vérifie `'serviceWorker' in navigator` et `'PushManager' in window`
   - Gère gracieusement les navigateurs non supportés

2. **Gestion des permissions**
   - Lit l'état actuel via `Notification.permission`
   - Fonction `requestPermission()` pour demander l'autorisation

3. **Abonnement Push**
   - `subscribe()` : s'abonne via le PushManager avec clé VAPID
   - `unsubscribe()` : se désabonne des notifications
   - Stockage de la subscription pour envoi au backend

4. **Notification de test**
   - `sendTestNotification()` : affiche une notification locale de test

5. **Utilitaire VAPID**
   - Fonction `urlBase64ToUint8Array()` pour convertir les clés VAPID en Uint8Array

---

## Structure du code

```text
+------------------------------------------+
|         usePushNotifications             |
+------------------------------------------+
| State:                                   |
|  - permission: NotificationPermission    |
|  - subscription: PushSubscription | null |
|  - isSupported: boolean                  |
|  - isLoading: boolean                    |
|  - error: string | null                  |
+------------------------------------------+
| Functions:                               |
|  - requestPermission()                   |
|  - subscribe(vapidPublicKey)             |
|  - unsubscribe()                         |
|  - sendTestNotification()                |
+------------------------------------------+
| Helpers:                                 |
|  - urlBase64ToUint8Array(base64String)   |
+------------------------------------------+
```

---

## Prérequis pour le fonctionnement complet

Pour que les push notifications fonctionnent en production, il faudra :

1. **Générer des clés VAPID** (paire publique/privée)
2. **Ajouter la clé publique** comme variable d'environnement `VITE_VAPID_PUBLIC_KEY`
3. **Créer une edge function** pour stocker les subscriptions et envoyer les notifications depuis le serveur

Le hook sera prêt pour cette intégration future, avec une clé VAPID placeholder pour les tests.

---

## Détails techniques

### Interfaces exportées

```typescript
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
```

### Fonction utilitaire urlBase64ToUint8Array

Convertit une clé VAPID encodée en base64 URL-safe en Uint8Array pour le PushManager :

```typescript
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
```

---

## Intégration future

Ce hook pourra être utilisé dans :
- La page **Settings.tsx** pour activer/désactiver les push
- Le composant **NotificationBell.tsx** pour afficher le statut
- L'inscription utilisateur pour proposer les notifications

