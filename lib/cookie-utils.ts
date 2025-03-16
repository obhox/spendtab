'use client';

import Cookies from 'js-cookie';

// Cookie configuration
const COOKIE_CONFIG = {
  expires: 7, // 7 days
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const
};

// Cookie keys
export const COOKIE_KEYS = {
  CURRENT_ACCOUNT_ID: 'currentAccountId',
  USER_SUBSCRIPTION_TIER: 'userSubscriptionTier',
  THEME: 'theme',
};

// Get cookie value
export function getCookie(key: string): string | undefined {
  return Cookies.get(key);
}

// Set cookie with default configuration
export function setCookie(key: string, value: string): void {
  Cookies.set(key, value, COOKIE_CONFIG);
}

// Remove cookie
export function removeCookie(key: string): void {
  Cookies.remove(key);
}