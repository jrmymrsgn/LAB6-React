import axios from 'axios';

const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
const STORAGE_KEY = 'lab6_session';

export const authStorage = {
  get() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY));
    } catch {
      return null;
    }
  },
  set(session) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  },
  clear() {
    localStorage.removeItem(STORAGE_KEY);
  },
};

let onAuthFailure = null;
export function setAuthFailureHandler(handler) {
  onAuthFailure = handler;
}

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const session = authStorage.get();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

let refreshPromise = null;

function refreshTokens() {
  if (!refreshPromise) {
    const session = authStorage.get();
    refreshPromise = axios
      .post(`${API_URL}/api/refresh`, { refresh_token: session?.refresh_token })
      .then(({ data }) => {
        const next = {
          ...authStorage.get(),
          access_token: data.tokens.access_token,
          refresh_token: data.tokens.refresh_token,
        };
        authStorage.set(next);
        return next.access_token;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

const NO_REFRESH_URLS = ['/login', '/refresh'];

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;

    const canRefresh =
      status === 401 &&
      original &&
      !original._retried &&
      !NO_REFRESH_URLS.includes(original.url) &&
      authStorage.get()?.refresh_token;

    if (!canRefresh) return Promise.reject(error);

    original._retried = true;
    try {
      const token = await refreshTokens();
      original.headers.Authorization = `Bearer ${token}`;
      return api(original);
    } catch {
      authStorage.clear();
      if (onAuthFailure) onAuthFailure();
      return Promise.reject(error);
    }
  }
);

export function getErrorMessage(error) {
  if (error.response?.data?.error) return error.response.data.error;
  if (error.request) return 'Cannot reach the server.';
  return error.message || 'Something went wrong.';
}

export default api;