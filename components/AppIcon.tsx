import React from 'react';

export type IconVariant = 'minimal' | 'horizon' | 'glow';

interface AppIconProps {
  variant?: IconVariant;
  size?: number;
  className?: string;
  id?: string;
}

const AppIcon: React.FC<AppIconProps> = ({ 
  variant = 'glow', 
  size = 128, 
  className = "",
  id
}) => {
  // Cinematic Color Palette
  const bgColor = "#0A0F1E"; // Even deeper, cinematic navy
  const glowColorInner = "#FFF7ED"; // Warm white core
  const glowColorMid = "#FDE68A"; // Golden amber
  const glowColorOuter = "#B45309"; // Deep burnt amber for bloom

  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 128 128" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      id={id}
    >
      <defs>
        {/* Main Sun/Flare Radial Gradient */}
        <radialGradient id="sunFlare" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
          <stop offset="0%" stopColor={glowColorInner} />
          <stop offset="20%" stopColor={glowColorMid} stopOpacity="0.8" />
          <stop offset="60%" stopColor={glowColorOuter} stopOpacity="0.3" />
          <stop offset="100%" stopColor={glowColorOuter} stopOpacity="0" />
        </radialGradient>

        {/* Horizontal Light Streak Gradient */}
        <linearGradient id="streakGradient" x1="0%" y1="50%" x2="100%" y2="50%">
          <stop offset="0%" stopColor={glowColorMid} stopOpacity="0" />
          <stop offset="50%" stopColor={glowColorMid} stopOpacity="0.8" />
          <stop offset="100%" stopColor={glowColorMid} stopOpacity="0" />
        </linearGradient>

        {/* Atmospheric Bloom Filter */}
        <filter id="bloomEffect" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        {/* Subtle Texture/Grain Overlay */}
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.80" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.05 0" />
        </filter>
      </defs>

      {/* Icon Body (Rounded Square) */}
      <rect width="128" height="128" rx="34" fill={bgColor} />
      
      {/* Subtle Grain Texture to match image */}
      <rect width="128" height="128" rx="34" fill="white" filter="url(#grain)" style={{ mixBlendMode: 'overlay' }} />

      {/* The Horizon Streak */}
      <rect 
        x="24" 
        y="63.5" 
        width="80" 
        height="1" 
        fill="url(#streakGradient)" 
        style={{ opacity: 0.6 }}
      />
      
      {/* Central Light Flare (Vertically squashed for cinematic effect) */}
      <ellipse 
        cx="64" 
        cy="64" 
        rx="22" 
        ry="10" 
        fill="url(#sunFlare)" 
        filter="url(#bloomEffect)"
        style={{ mixBlendMode: 'screen', opacity: 0.9 }}
      />

      {/* The core white hot spot */}
      <circle 
        cx="64" 
        cy="64" 
        r="1.5" 
        fill="white" 
        style={{ opacity: 0.9 }} 
      />

      {/* Optional decorative 'glow' variant enhancements */}
      {variant === 'glow' && (
        <ellipse 
          cx="64" 
          cy="64" 
          rx="40" 
          ry="15" 
          fill={glowColorOuter} 
          style={{ opacity: 0.1, mixBlendMode: 'plus-lighter' }} 
          filter="url(#bloomEffect)"
        />
      )}
    </svg>
  );
};

export default AppIcon;