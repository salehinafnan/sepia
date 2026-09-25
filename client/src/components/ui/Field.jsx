export const inputClass =
  "block w-full rounded-xl border-0 bg-white px-3.5 py-2.5 text-sm text-stone-900 shadow-xs ring-1 ring-stone-300 transition placeholder:text-stone-400 focus:ring-2 focus:ring-sepia-500 focus:outline-none dark:bg-stone-950 dark:text-stone-100 dark:ring-stone-700 dark:placeholder:text-stone-500";

const Field = ({ label, hint, className = "", children }) => (
  <label className={`block ${className}`}>
    <span className="mb-1.5 block text-sm font-medium text-stone-700 dark:text-stone-300">
      {label}
    </span>
    {children}
    {hint && (
      <span className="mt-1.5 block text-xs text-stone-500 dark:text-stone-400">
        {hint}
      </span>
    )}
  </label>
);

export default Field;
