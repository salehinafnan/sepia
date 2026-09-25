import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

import Field, { inputClass } from "../ui/Field";

const Input = ({ label, type = "text", className, ...props }) => {
  const [visible, setVisible] = useState(false);
  const isPassword = type === "password";

  return (
    <Field label={label} className={className}>
      <span className="relative block">
        <input
          type={isPassword && visible ? "text" : type}
          required
          className={`${inputClass} ${isPassword ? "pr-11" : ""}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setVisible(!visible)}
            aria-label={visible ? "Hide password" : "Show password"}
            className="absolute inset-y-0 right-0 grid w-11 place-items-center rounded-r-xl text-stone-400 outline-sepia-500 hover:text-stone-700 focus-visible:outline-2 dark:hover:text-stone-200"
          >
            {visible ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </span>
    </Field>
  );
};

export default Input;
