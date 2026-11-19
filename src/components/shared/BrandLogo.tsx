import React from 'react';

export type BrandVariant = 'auto' | 'teal' | 'mint' | 'white' | 'inverted' | 'on-teal';
export type BrandSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface BrandMarkProps {
  variant?: BrandVariant;
  size?: BrandSize | number;
  className?: string;
}

interface BrandLogoProps {
  variant?: BrandVariant;
  size?: BrandSize;
  layout?: 'horizontal' | 'stacked';
  showWordmark?: boolean;
  wordmarkAs?: 'span' | 'h1';
  className?: string;
}

const SIZE_PX: Record<BrandSize, number> = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 52,
  xl: 68,
};

const WORDMARK_CLASSES: Record<BrandSize, string> = {
  xs: 'text-base leading-none',
  sm: 'text-xl leading-none',
  md: 'text-2xl sm:text-[28px] leading-none',
  lg: 'text-3xl sm:text-4xl leading-none',
  xl: 'text-4xl sm:text-5xl leading-none',
};

const GAP_CLASSES: Record<BrandSize, string> = {
  xs: 'gap-1.5',
  sm: 'gap-2',
  md: 'gap-2.5',
  lg: 'gap-3',
  xl: 'gap-3.5',
};

function getMarkStyles(variant: BrandVariant): {
  rectClass: string;
  glyphClass: string;
  strokeProps?: React.SVGProps<SVGRectElement>;
} {
  switch (variant) {
    case 'teal':
      return {
        rectClass: 'fill-[#008B8B]',
        glyphClass: 'fill-white',
      };
    case 'mint':
      return {
        rectClass: 'fill-[#14B8A6]',
        glyphClass: 'fill-[#121316]',
      };
    case 'white':
      return {
        rectClass: 'fill-white',
        glyphClass: 'fill-[#008B8B]',
      };
    case 'inverted':
      return {
        rectClass: 'fill-[#121316]',
        glyphClass: 'fill-[#14B8A6]',
      };
    case 'on-teal':
      return {
        rectClass: 'fill-white/10',
        glyphClass: 'fill-white',
        strokeProps: {
          stroke: 'rgba(255, 255, 255, 0.38)',
          strokeWidth: 3.5,
        },
      };
    case 'auto':
    default:
      return {
        rectClass: 'fill-[#008B8B] dark:fill-[#14B8A6]',
        glyphClass: 'fill-white dark:fill-[#121316]',
      };
  }
}

function getWordmarkColorClass(variant: BrandVariant): string {
  switch (variant) {
    case 'teal':
    case 'white':
      return 'text-[#008B8B]';
    case 'mint':
    case 'inverted':
      return 'text-[#14B8A6]';
    case 'on-teal':
      return 'text-white';
    case 'auto':
    default:
      return 'text-[#008B8B] dark:text-[#14B8A6]';
  }
}

/**
 * Official "¿Qué Sale?" squircle isotipo (`¿?`) from the brandbook.
 * Adapts automatically between Light Mode (Teal + White) and Dark Mode (Mint Teal + Obsidian).
 */
export function BrandMark({
  variant = 'auto',
  size = 'md',
  className = '',
}: BrandMarkProps) {
  const activeVariant: BrandVariant = variant;
  const pixelSize = typeof size === 'number' ? size : SIZE_PX[size];
  const { rectClass, glyphClass, strokeProps } = getMarkStyles(activeVariant);

  return (
    <svg
      width={pixelSize}
      height={pixelSize}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={`shrink-0 transition-transform duration-200 ${className}`}
    >
      <rect
        x={strokeProps ? 2 : 0}
        y={strokeProps ? 2 : 0}
        width={strokeProps ? 96 : 100}
        height={strokeProps ? 96 : 100}
        rx={24}
        className={`transition-colors duration-200 ${rectClass}`}
        {...strokeProps}
      />
      <g className={`transition-colors duration-200 ${glyphClass}`}>
        <path d="M53.4 38.6 L61.5 38.6 C62.2 35.8 64.0 34.8 66.3 34.8 C68.7 34.8 69.8 36.2 69.5 38.4 C69.1 41.5 65.6 43.4 62.8 46.0 C60.6 48.2 59.5 50.4 59.0 53.5 L65.8 53.5 C66.4 50.5 67.8 48.4 70.4 46.0 C74.5 42.3 77.8 39.2 78.0 34.8 C78.2 29.8 73.5 27.8 67.4 27.8 C59.3 27.8 54.3 32.0 53.4 38.6 Z" />
        <circle cx="61.3" cy="61.2" r="4.15" />
        <g transform="rotate(180 50 50.5)">
          <path d="M53.4 38.6 L61.5 38.6 C62.2 35.8 64.0 34.8 66.3 34.8 C68.7 34.8 69.8 36.2 69.5 38.4 C69.1 41.5 65.6 43.4 62.8 46.0 C60.6 48.2 59.5 50.4 59.0 53.5 L65.8 53.5 C66.4 50.5 67.8 48.4 70.4 46.0 C74.5 42.3 77.8 39.2 78.0 34.8 C78.2 29.8 73.5 27.8 67.4 27.8 C59.3 27.8 54.3 32.0 53.4 38.6 Z" />
          <circle cx="61.3" cy="61.2" r="4.15" />
        </g>
      </g>
    </svg>
  );
};

/**
 * Official "¿Qué Sale?" horizontal or stacked brand lockup combining the squircle isotipo and wordmark.
 */
export function BrandLogo({
  variant = 'auto',
  size = 'md',
  layout = 'horizontal',
  showWordmark = true,
  wordmarkAs = 'span',
  className = '',
}: BrandLogoProps) {
  const activeVariant: BrandVariant = variant;
  const WordmarkTag = wordmarkAs;
  const wordmarkColor = getWordmarkColorClass(activeVariant);
  const layoutClasses =
    layout === 'stacked'
      ? 'flex-col items-center text-center'
      : 'flex-row items-center';

  return (
    <div
      className={`inline-flex ${layoutClasses} ${GAP_CLASSES[size]} select-none ${className}`}
      aria-label="¿Qué Sale?"
    >
      <BrandMark
        variant={activeVariant}
        size={size}
        className="shadow-xs"
      />
      {showWordmark && (
        <WordmarkTag
          className={`font-brand font-extrabold tracking-tight transition-colors duration-200 ${WORDMARK_CLASSES[size]} ${wordmarkColor}`}
        >
          ¿Qué Sale?
        </WordmarkTag>
      )}
    </div>
  );
};
