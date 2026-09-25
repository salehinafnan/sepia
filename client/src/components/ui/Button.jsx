import { Link } from "react-router";

import Spinner from "./Spinner";

const focusRing =
  "outline-offset-2 focus-visible:outline-2 focus-visible:outline-sepia-500";

const variants = {
  primary:
    "bg-stone-900 text-white hover:bg-stone-700 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white",
  secondary:
    "bg-white text-stone-900 ring-1 ring-stone-300 hover:bg-stone-100 dark:bg-stone-900 dark:text-stone-100 dark:ring-stone-700 dark:hover:bg-stone-800",
  ghost:
    "text-stone-600 hover:bg-stone-100 hover:text-stone-900 dark:text-stone-300 dark:hover:bg-stone-800 dark:hover:text-white",
  danger: "bg-red-600 text-white hover:bg-red-500",
};

const buttonClass = (variant = "primary", className = "") =>
  `inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-full px-4 text-sm font-medium whitespace-nowrap transition-colors disabled:pointer-events-none disabled:opacity-50 ${focusRing} ${variants[variant]} ${className}`;

const Button = ({
  variant,
  className,
  loading = false,
  disabled,
  type = "button",
  children,
  ...props
}) => (
  <button
    type={type}
    className={buttonClass(variant, className)}
    disabled={disabled || loading}
    aria-busy={loading || undefined}
    {...props}
  >
    {loading && <Spinner className="size-4" />}
    {children}
  </button>
);

export const ButtonLink = ({ variant, className, ...props }) => (
  <Link className={buttonClass(variant, className)} {...props} />
);

export const IconButton = ({ label, className = "", ...props }) => (
  <button
    type="button"
    aria-label={label}
    title={label}
    className={`inline-grid size-9 shrink-0 place-items-center rounded-full text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-100 ${focusRing} ${className}`}
    {...props}
  />
);

export default Button;
