'use client'

interface SpinnerProps {
  className?: string;
}

export default function Spinner({ className = "" }: SpinnerProps) {
  return (
    <div className="flex items-center justify-center w-full h-full">
      <svg
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        viewBox="0 0 24 24"
        strokeLinecap="round"
        strokeLinejoin="round"
        xmlns="http://www.w3.org/2000/svg"
        className={`size-5 animate-spin stroke-zinc-400 ${className}`}
        style={{
          shapeRendering: "geometricPrecision",
          imageRendering: "crisp-edges",
          vectorEffect: "non-scaling-stroke",
        }}
      >
        <line x1="12" y1="3" x2="12" y2="6" />
        <line x1="18.364" y1="5.636" x2="16.243" y2="7.757" />
        <line x1="21" y1="12" x2="18" y2="12" />
        <line x1="18.364" y1="18.364" x2="16.243" y2="16.243" />
        <line x1="12" y1="21" x2="12" y2="18" />
        <line x1="5.636" y1="18.364" x2="7.757" y2="16.243" />
        <line x1="3" y1="12" x2="6" y2="12" />
        <line x1="5.636" y1="5.636" x2="7.757" y2="7.757" />
      </svg>
    </div>
  );
}
