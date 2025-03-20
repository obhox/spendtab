const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
  maxAge: 30 * 24 * 60 * 60 // 30 days
};

export function setCookie(name: string, value: string | object) {
  // If value is an object, stringify it first
  const stringValue = typeof value === 'object' ? JSON.stringify(value) : value;
  document.cookie = `${name}=${stringValue}; path=/; max-age=${COOKIE_OPTIONS.maxAge}; ${COOKIE_OPTIONS.secure ? 'secure;' : ''} samesite=lax`;
}

export function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    const cookieValue = parts.pop()?.split(';').shift() || null;
    return cookieValue;
  }
  return null;
}

export function getJSONCookie(name: string): any | null {
  const cookieValue = getCookie(name);
  if (!cookieValue) return null;
  
  // Check if this is a base64-encoded Supabase token
  if (cookieValue.startsWith('base64-')) {
    // For Supabase auth cookies, we need to return a properly formatted JSON string
    // that Supabase's parseSupabaseCookie function can handle
    if (name === 'supabase-auth-token') {
      // Remove the 'base64-' prefix before returning
      return cookieValue.substring(7);
    }
    // For other base64 cookies, return as is
    return cookieValue;
  }
  
  try {
    // First try parsing as JSON
    return JSON.parse(cookieValue);
  } catch (e) {
    // If it's not valid JSON, return the string value
    // This handles other non-JSON formats
    return cookieValue;
  }
}

export function deleteCookie(name: string) {
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}