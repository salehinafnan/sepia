import { LoaderCircle } from "lucide-react";

const Spinner = ({ className = "size-5" }) => (
  <LoaderCircle
    aria-hidden="true"
    className={`animate-spin text-current opacity-70 ${className}`}
  />
);

export default Spinner;
