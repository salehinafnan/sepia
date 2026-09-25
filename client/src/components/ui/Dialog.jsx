import { useEffect, useRef } from "react";

export const panelClass =
  "w-[calc(100%-2rem)] rounded-2xl bg-white shadow-2xl ring-1 ring-stone-200 dark:bg-stone-900 dark:ring-stone-800";

// Mount it to open it. Escape and clicks on the backdrop call onClose.
const Dialog = ({ onClose, className = "", children, ...props }) => {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current.open) ref.current.showModal();
  }, []);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(event) => event.target === event.currentTarget && onClose()}
      className={`m-auto max-h-[calc(100dvh-2rem)] overflow-y-auto bg-transparent text-stone-900 transition duration-200 backdrop:bg-stone-950/50 backdrop:backdrop-blur-sm starting:scale-95 starting:opacity-0 dark:text-stone-100 ${className}`}
      {...props}
    >
      {children}
    </dialog>
  );
};

export default Dialog;
