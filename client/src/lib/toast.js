let toasts = [];
let nextId = 0;
const listeners = new Set();

const update = (next) => {
  toasts = next;
  listeners.forEach((listener) => listener());
};

export const dismissToast = (id) =>
  update(toasts.filter((toast) => toast.id !== id));

export const toast = (message) => {
  const id = nextId++;
  update([...toasts, { id, message }]);
  setTimeout(() => dismissToast(id), 4000);
};

export const subscribeToToasts = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const getToasts = () => toasts;
