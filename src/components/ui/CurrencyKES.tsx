import * as React from "react";

// Simple KES currency icon (K with =)
export const CurrencyKES = React.forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>((props, ref) => (
  <svg
    ref={ref}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <text x="4" y="18" fontSize="16" fontWeight="bold">K</text>
    <line x1="13" y1="10" x2="20" y2="10" />
    <line x1="13" y1="14" x2="20" y2="14" />
  </svg>
));

CurrencyKES.displayName = "CurrencyKES";
