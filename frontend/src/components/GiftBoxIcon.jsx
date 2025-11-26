// Gift Box SVG Component
export default function GiftBoxIcon({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Box body */}
      <path
        d="M40 80 L160 80 L160 180 L40 180 Z"
        fill="url(#boxGradient)"
        stroke="currentColor"
        strokeWidth="3"
      />

      {/* Box lid */}
      <path
        d="M30 60 L170 60 L160 80 L40 80 Z"
        fill="url(#lidGradient)"
        stroke="currentColor"
        strokeWidth="3"
      />

      {/* Vertical ribbon */}
      <rect
        x="90"
        y="60"
        width="20"
        height="120"
        fill="url(#ribbonGradient)"
        stroke="currentColor"
        strokeWidth="2"
      />

      {/* Horizontal ribbon on lid */}
      <rect
        x="30"
        y="65"
        width="140"
        height="15"
        fill="url(#ribbonGradient)"
        stroke="currentColor"
        strokeWidth="2"
      />

      {/* Bow - left loop */}
      <ellipse
        cx="70"
        cy="45"
        rx="25"
        ry="20"
        fill="url(#bowGradient)"
        stroke="currentColor"
        strokeWidth="2"
      />

      {/* Bow - right loop */}
      <ellipse
        cx="130"
        cy="45"
        rx="25"
        ry="20"
        fill="url(#bowGradient)"
        stroke="currentColor"
        strokeWidth="2"
      />

      {/* Bow - center knot */}
      <circle
        cx="100"
        cy="45"
        r="12"
        fill="url(#bowGradient)"
        stroke="currentColor"
        strokeWidth="2"
      />

      {/* Sparkles */}
      <circle cx="50" cy="100" r="3" fill="white" opacity="0.8">
        <animate
          attributeName="opacity"
          values="0.3;1;0.3"
          dur="2s"
          repeatCount="indefinite"
        />
      </circle>
      <circle cx="150" cy="120" r="3" fill="white" opacity="0.8">
        <animate
          attributeName="opacity"
          values="1;0.3;1"
          dur="2s"
          repeatCount="indefinite"
        />
      </circle>
      <circle cx="70" cy="150" r="3" fill="white" opacity="0.8">
        <animate
          attributeName="opacity"
          values="0.5;1;0.5"
          dur="2s"
          repeatCount="indefinite"
        />
      </circle>

      {/* Gradients */}
      <defs>
        <linearGradient id="boxGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#f093fb" />
          <stop offset="100%" stopColor="#f5576c" />
        </linearGradient>

        <linearGradient id="lidGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#f5576c" />
          <stop offset="100%" stopColor="#d63a4f" />
        </linearGradient>

        <linearGradient id="ribbonGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ffd700" />
          <stop offset="50%" stopColor="#ffed4e" />
          <stop offset="100%" stopColor="#ffd700" />
        </linearGradient>

        <linearGradient id="bowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffd700" />
          <stop offset="100%" stopColor="#ffb700" />
        </linearGradient>
      </defs>
    </svg>
  );
}
