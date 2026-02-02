/**
 * VAPID Configuration for Push Notifications
 * 
 * The VAPID public key is safe to include in frontend code as it's meant to be public.
 * This key is used to identify your server when subscribing to push notifications.
 * 
 * To generate VAPID keys, you can use: npx web-push generate-vapid-keys
 * Or use an online generator like: https://vapidkeys.com/
 */

// Replace this with your actual VAPID public key
// The key should be a base64url-encoded string (no padding)
export const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || '';

// Helper to check if VAPID is configured
export const isVapidConfigured = (): boolean => {
  return VAPID_PUBLIC_KEY.length > 0;
};
