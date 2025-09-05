import Link from "next/link";

interface LogoProps {
  variant?: "light" | "dark";
}

export function Logo({ variant = "light" }: LogoProps) {
  return (
    <Link href="/" className="flex items-center space-x-2">
      <div className="relative">
        <svg
          width="32"
          height="32"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="transform rotate-45"
        >
          <path
            d="M16 2L2 16L16 30L30 16L16 2Z"
            className={variant === "light" ? "fill-white" : "fill-gray-900"}
            fillOpacity="0.2"
          />
          <path
            d="M16 6L6 16L16 26L26 16L16 6Z"
            className={variant === "light" ? "fill-white" : "fill-gray-900"}
            fillOpacity="0.4"
          />
          <path
            d="M16 10L10 16L16 22L22 16L16 10Z"
            className={variant === "light" ? "fill-white" : "fill-gray-900"}
            fillOpacity="0.8"
          />
        </svg>
      </div>
      <span
        className={`font-bold text-xl ${
          variant === "light" ? "text-white" : "text-gray-900"
        }`}
      >
        GREIA
      </span>
    </Link>
  );
}