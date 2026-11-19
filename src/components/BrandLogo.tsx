import React from 'react';

interface BrandLogoProps {
  variant?: 'default' | 'light' | 'admin';
  size?: 'sm' | 'md' | 'lg';
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ variant = 'default', size = 'md' }) => {
  const iconSize = size === 'sm' ? 28 : size === 'lg' ? 38 : 32;
  const textSize = size === 'sm' ? 'text-base' : size === 'lg' ? 'text-2xl' : 'text-lg';

  const bgFill = variant === 'admin' ? '#38BDF8' : '#B6F23B';
  const strokeColor = '#15191C';
  const textClass =
    variant === 'light' || variant === 'admin'
      ? 'text-white'
      : 'text-[#15191C] dark:text-[#F3F6F2]';

  return (
    <span className="inline-flex items-center gap-2.5 whitespace-nowrap shrink-0 select-none">
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <rect width="36" height="36" rx="10" fill={bgFill} />
        <path
          d="M11 23.5L15.5 11.5H25L23.5 15.5H18.2L17.1 18.4H22.2L20.8 22.1H15.7L14.4 25.5L11 23.5Z"
          fill={strokeColor}
        />
        <path
          d="M24.5 24.5L27 19.5"
          stroke={strokeColor}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
      <span className={`font-display font-extrabold tracking-tight ${textSize} ${textClass}`}>
        FIT FUEL
      </span>
    </span>
  );
};
