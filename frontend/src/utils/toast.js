const listeners = new Set();

export function subscribeToasts(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function showToast(message, type = 'error') {
  const toast = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    message,
    type,
  };
  listeners.forEach((listener) => listener(toast));
}
