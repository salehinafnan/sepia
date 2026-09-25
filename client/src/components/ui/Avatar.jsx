import { useState } from "react";

const Avatar = ({ name = "", src, className = "size-9" }) => {
  const [failed, setFailed] = useState(false);
  const base = `inline-grid shrink-0 place-items-center overflow-hidden rounded-full text-sm font-semibold select-none ${className}`;

  if (src && !failed)
    return (
      <img
        src={src}
        alt=""
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        className={`${base} object-cover`}
      />
    );

  return (
    <span
      aria-hidden="true"
      className={`${base} bg-sepia-100 text-sepia-800 dark:bg-sepia-900 dark:text-sepia-200`}
    >
      {name.trim().charAt(0).toUpperCase() || "?"}
    </span>
  );
};

export default Avatar;
