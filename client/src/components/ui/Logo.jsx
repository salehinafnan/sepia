import { useId } from "react";

const Logo = ({ className = "size-8" }) => {
  const clipId = useId();

  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={className}>
      <clipPath id={clipId}>
        <rect x="8" y="6" width="16" height="15" rx="1.5" />
      </clipPath>
      <g transform="rotate(-8 16 16)">
        <rect
          x="5"
          y="3"
          width="22"
          height="26"
          rx="3.5"
          className="fill-sepia-700 dark:fill-sepia-300"
        />
        <rect
          x="8"
          y="6"
          width="16"
          height="15"
          rx="1.5"
          className="fill-sepia-100 dark:fill-sepia-950"
        />
        <g
          clipPath={`url(#${clipId})`}
          className="fill-sepia-400 dark:fill-sepia-500"
        >
          <circle cx="19.5" cy="10.5" r="2.25" />
          <path d="M7 22v-4.2l5.2-4.1 3.6 3.4 2.3-2 6.9 6.9z" opacity=".75" />
        </g>
      </g>
    </svg>
  );
};

export default Logo;
