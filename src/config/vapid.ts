/**
 * VAPID Configuration for Push Notifications
 * 
 * The VAPID public key is safe to include in frontend code as it's meant to be public.
 * This key is used to identify your server when subscribing to push notifications.
 */

// VAPID Public Key for CatalMSP push notifications
export const VAPID_PUBLIC_KEY = 'BGZNbw2ObkDbeJJK2V22zkvPVr1HMTAKNkkx6339zWHePKwm-YuYOO3xC-fUQC_q-uxuqestVWnA7BEIJ4HjlW4';

// Helper to check if VAPID is configured
export const isVapidConfigured = (): boolean => {
  return VAPID_PUBLIC_KEY.length > 0;
};
