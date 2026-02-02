/**
 * VAPID Configuration for Push Notifications
 * 
 * The VAPID public key is safe to include in frontend code as it's meant to be public.
 * This key is used to identify your server when subscribing to push notifications.
 */

// VAPID Public Key for CatalMSP push notifications
export const VAPID_PUBLIC_KEY = 'BNZncPQeyH0i2SpL7cypZX908a1-W4442-qs3n-VX3NGgIevGw-qllfbm7yBRZjXdc839WZq0Dutvsb-nTpTMNg';

// Helper to check if VAPID is configured
export const isVapidConfigured = (): boolean => {
  return VAPID_PUBLIC_KEY.length > 0;
};
