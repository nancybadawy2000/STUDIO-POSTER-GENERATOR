
import React from 'react';

export const StyleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4.034 16.5a.75.75 0 00-.358.526 3 3 0 005.836 1.455 4.5 4.5 0 015.986-5.986 3 3 0 001.455 5.836.75.75 0 00.526-.358 13.5 13.5 0 000-11.482.75.75 0 00-.526-.358 3 3 0 00-5.836 1.455A4.5 4.5 0 016.1 12.1a3 3 0 00-1.455 5.836.75.75 0 00-.61.564z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19.5 12c0 4.142-3.358 7.5-7.5 7.5S4.5 16.142 4.5 12s3.358-7.5 7.5-7.5 7.5 3.358 7.5 7.5z"
    />
  </svg>
);
