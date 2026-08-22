interface LogoProps {
  className?: string
  width?: number | string
  height?: number | string
  /** `dark` = white "Moto" for dark backgrounds; `light` = dark "Moto" for light backgrounds */
  variant?: "dark" | "light"
}

export default function MotoCartLogo({
  className = "h-9 w-auto",
  width,
  height,
  variant = "dark",
}: LogoProps) {
  const motoFill = variant === "light" ? "#18181B" : "#FFFFFF"

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 540 120"
      className={className}
      width={width}
      height={height}
      aria-label="MotoCart Logo"
    >
      <polygon points="18,34 58,34 32,54 8,54" fill="#E50914" />
      <text
        x="36"
        y="88"
        fill={motoFill}
        fontFamily="system-ui, -apple-system, 'Arial Black', sans-serif"
        fontWeight="900"
        fontStyle="italic"
        fontSize="76"
        letterSpacing="-1.5"
      >
        Moto
      </text>
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
      <polygon points="460,34 525,34 478,44 450,44" fill="#E50914" />
      <polygon points="36,98 320,98 312,106 24,106" fill="#E50914" />
      <polygon points="332,98 362,98 354,106 324,106" fill="#E50914" />
      <polygon points="372,98 402,98 394,106 364,106" fill="#E50914" />
      <polygon points="412,98 442,98 434,106 404,106" fill="#E50914" />
      <polygon points="452,98 482,98 474,106 444,106" fill="#E50914" />
    </svg>
  )
}
