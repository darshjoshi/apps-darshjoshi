import * as React from "react"

interface LogoProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: number
}

const Logo = React.forwardRef<HTMLDivElement, LogoProps>(
  ({ className = "", size = 40, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`relative ${className}`}
        style={{ width: size, height: size }}
        {...props}
      >
        {/* Background */}
        <div className="absolute inset-0 bg-black" />

        {/* JD Letters with brutalist overlap */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative flex items-center justify-center w-full h-full">
            {/* J Letter */}
            <div className="absolute left-[15%] top-[20%] text-white font-bold" style={{ fontSize: size * 0.5, lineHeight: 1, fontFamily: 'var(--font-geist-mono)' }}>
              J
            </div>

            {/* D Letter - overlapping */}
            <div className="absolute right-[15%] top-[20%] text-white font-bold" style={{ fontSize: size * 0.5, lineHeight: 1, fontFamily: 'var(--font-geist-mono)' }}>
              D
            </div>

            {/* Brutalist accent line */}
            <div
              className="absolute bg-white"
              style={{
                width: '60%',
                height: '3px',
                bottom: '25%',
                left: '20%'
              }}
            />
          </div>
        </div>

        {/* Border accent */}
        <div className="absolute inset-0 border-2 border-white opacity-20" />
      </div>
    )
  }
)
Logo.displayName = "Logo"

export { Logo }
