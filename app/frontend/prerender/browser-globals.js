/** Minimal browser globals for Node prerender (vite-prerender-plugin). */
export function installBrowserGlobals() {
  if (typeof globalThis.window !== 'undefined' && typeof globalThis.window.addEventListener === 'function') {
    return;
  }

  const eventListeners = new Map();

  const storage = () => {
    const store = new Map();
    return {
      getItem: (key) => store.get(key) ?? null,
      setItem: (key, value) => {
        store.set(key, String(value));
      },
      removeItem: (key) => {
        store.delete(key);
      },
    };
  };

  const localStorage = storage();
  const sessionStorage = storage();

  const windowStub = {
    location: {
      href: 'http://localhost/',
      pathname: '/',
      origin: 'http://localhost',
      search: '',
    },
    name: '',
    opener: null,
    localStorage,
    sessionStorage,
    addEventListener(type, listener) {
      if (!eventListeners.has(type)) {
        eventListeners.set(type, new Set());
      }
      eventListeners.get(type).add(listener);
    },
    removeEventListener(type, listener) {
      eventListeners.get(type)?.delete(listener);
    },
    dispatchEvent() {
      return true;
    },
    postMessage() {},
    getComputedStyle() {
      return { getPropertyValue: () => '' };
    },
    matchMedia() {
      return {
        matches: false,
        addEventListener() {},
        removeEventListener() {},
      };
    },
    setTimeout: globalThis.setTimeout.bind(globalThis),
    clearTimeout: globalThis.clearTimeout.bind(globalThis),
    prompt: () => null,
    confirm: () => false,
    alert: () => {},
    history: { back: () => {} },
  };

  windowStub.top = windowStub;
  windowStub.self = windowStub;

  globalThis.window = windowStub;
  globalThis.localStorage = localStorage;
  globalThis.sessionStorage = sessionStorage;
}
