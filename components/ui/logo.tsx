import React from "react"

interface LogoProps {
  className?: string
  width?: number | string
  height?: number | string
}

export default function MotoCartLogo({ className = "h-9 w-auto", width, height }: LogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 540 120"
      className={className}
      width={width}
      height={height}
      aria-label="MotoCart Logo"
    >
      <defs>
        <linearGradient id="motoWhiteGradComp" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#E2E2E2" />
        </linearGradient>
      </defs>

      {/* Top-left red accent slash before M */}
      <polygon points="18,34 58,34 32,54 8,54" fill="#E50914" />

      {/* "Moto" text (pure crisp white, bold italic) */}
      <text
        x="36"
        y="88"
        fill="#FFFFFF"
        fontFamily="system-ui, -apple-system, 'Arial Black', sans-serif"
        fontWeight="900"
        fontStyle="italic"
        fontSize="76"
        letterSpacing="-1.5"
      >
        Moto
      </text>

      {/* "cart" text (red, bold italic) */}
      <text
        x="272"
        y="88"
        fill="#E50914"
        fontFamily="system-ui, -apple-system, 'Arial Black', sans-serif"
        fontWeight="900"
        fontStyle="italic"
        fontSize="76"
        letterSpacing="-1.5"
      >
        cart
      </text>

      {/* Sharp top-right red tail on 't' */}
      <polygon points="460,34 525,34 478,44 450,44" fill="#E50914" />

      {/* Solid Red Underline Bar */}
      <polygon points="36,98 320,98 312,106 24,106" fill="#E50914" />

      {/* 4 Slanted Red Dashes under 'cart' */}
      <polygon points="332,98 362,98 354,106 324,106" fill="#E50914" />
      <polygon points="372,98 402,98 394,106 364,106" fill="#E50914" />
      <polygon points="412,98 442,98 434,106 404,106" fill="#E50914" />
      <polygon points="452,98 482,98 474,106 444,106" fill="#E50914" />
    </svg>
  )
}
