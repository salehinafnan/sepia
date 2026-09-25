import { useSyncExternalStore } from "react";

import { dismissToast, getToasts, subscribeToToasts } from "../../lib/toast";

const Toaster = () => {
  const toasts = useSyncExternalStore(subscribeToToasts, getToasts);

  return (
    <div
      role="status"
      className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex flex-col items-center gap-2 px-4"
    >
      {toasts.map(({ id, message }) => (
        <button
          key={id}
          type="button"
          onClick={() => dismissToast(id)}
          className="pointer-events-auto rounded-full bg-stone-900 px-4 py-2.5 text-sm font-medium text-white shadow-lg transition duration-300 starting:translate-y-2 starting:opacity-0 dark:bg-stone-100 dark:text-stone-900"
        >
          {message}
        </button>
      ))}
    </div>
  );
};

export default Toaster;
