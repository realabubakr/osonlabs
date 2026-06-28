import React from 'react';

interface LogoProps {
  size?: number;
  showText?: boolean;
  textColorTheme?: 'light' | 'dark' | 'brand';
  className?: string;
  style?: React.CSSProperties;
}

export const Logo: React.FC<LogoProps> = ({
  size = 40,
  showText = false,
  textColorTheme = 'light',
  className = '',
  style = {}
}) => {
  // Brand colors matching the OsonMed logo
  const emblemColor = '#2563eb'; // Vibrant Royal Blue
  const osonTextColor = textColorTheme === 'dark' ? '#002f87' : textColorTheme === 'light' ? '#60a5fa' : '#2563eb';
  const medTextColor = textColorTheme === 'light' ? '#ffffff' : '#3b82f6';

  // If we show text, we use a wider/taller viewBox to stack them
  const viewBox = showText ? '0 0 360 260' : '0 0 360 160';
  const height = showText ? size * 0.72 : size * 0.44;

  return (
    <svg
      width={size}
      height={height}
      viewBox={viewBox}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: 'inline-block', verticalAlign: 'middle', ...style }}
    >
      <g>
        {/* Left 'C' Shape */}
        <path
          d="M 150 0 L 80 0 A 80 80 0 0 0 80 160 L 150 160 L 150 120 L 80 120 A 40 40 0 0 1 80 40 L 150 40 Z"
          fill={emblemColor}
        />

        {/* Right 'C' Shape (reversed) */}
        <path
          d="M 210 0 L 210 40 L 280 40 A 40 40 0 0 1 280 120 L 210 120 L 210 160 L 280 160 A 80 80 0 0 0 280 0 Z"
          fill={emblemColor}
        />

        {/* Central Plus Sign (Medical Cross) */}
        <path
          d="M 165 35 L 195 35 L 195 65 L 225 65 L 225 95 L 195 95 L 195 125 L 165 125 L 165 95 L 135 95 L 135 65 L 165 65 Z"
          fill={emblemColor}
        />
      </g>

      {showText && (
        <text
          x="180"
          y="235"
          textAnchor="middle"
          style={{
            fontFamily: 'var(--font-sans, "Outfit", sans-serif)',
            fontSize: '56px',
            fontWeight: 800,
            letterSpacing: '0.02em',
          }}
        >
          <tspan fill={osonTextColor}>OSON</tspan>
          <tspan fill={medTextColor}>MED</tspan>
        </text>
      )}
    </svg>
  );
};
