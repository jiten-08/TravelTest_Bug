const SESSION_KEY = 'traveltest_user_session';
const ACCESS_TOKEN_KEY = 'traveltest_access_token';
const REFRESH_TOKEN_KEY = 'traveltest_refresh_token';

function safeJsonParse(value) {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function getStorageValue(key) {
  return localStorage.getItem(key) || sessionStorage.getItem(key);
}

function removeAuthKeys(storage) {
  storage.removeItem(SESSION_KEY);
  storage.removeItem(ACCESS_TOKEN_KEY);
  storage.removeItem(REFRESH_TOKEN_KEY);
}

export function getStoredSession() {
  return safeJsonParse(getStorageValue(SESSION_KEY));
}

export function getAccessToken() {
  return getStorageValue(ACCESS_TOKEN_KEY);
}

export function getRefreshToken() {
  return getStorageValue(REFRESH_TOKEN_KEY);
}

export function setAuthSession({ session, access, refresh, rememberMe }) {
  clearAuthSession();

  const storage = rememberMe ? localStorage : sessionStorage;
  storage.setItem(SESSION_KEY, JSON.stringify({ ...session, rememberMe }));
  storage.setItem(ACCESS_TOKEN_KEY, access);
  storage.setItem(REFRESH_TOKEN_KEY, refresh);
  window.dispatchEvent(new Event('traveltest-auth-change'));
}

export function updateStoredSession(session) {
  const storage = localStorage.getItem(SESSION_KEY) ? localStorage : sessionStorage;
  storage.setItem(SESSION_KEY, JSON.stringify(session));
  window.dispatchEvent(new Event('traveltest-auth-change'));
}

export function clearAuthSession() {
  removeAuthKeys(localStorage);
  removeAuthKeys(sessionStorage);
  window.dispatchEvent(new Event('traveltest-auth-change'));
}
