/**
 * Logo.jsx — Reusable AuraBit brand component
 * Symbol on top, "Aurabit" text below.
 * Scalable via `size` prop: 'sm' | 'md' | 'lg'
 * Orientation via `layout` prop: 'vertical' (default) | 'horizontal'
 */

const AurabitSymbol = ({ size = 40 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    aria-hidden="true"
    className="logo-symbol"
  >
    {/* Outer glow ring */}
    <circle cx="32" cy="32" r="30" stroke="#20E070" strokeWidth="1.5" strokeOpacity="0.25" />

    {/* Sound-wave arc — outer */}
    <path
      d="M14 32 Q14 14 32 14 Q50 14 50 32 Q50 50 32 50 Q14 50 14 32"
      stroke="#20E070"
      strokeWidth="1.8"
      strokeOpacity="0.4"
      fill="none"
    />

    {/* Dynamic equaliser bars — centred */}
    {/* Bar 1 (leftmost, short) */}
    <rect x="17" y="28" width="4" height="8" rx="2" fill="#20E070" opacity="0.6" />
    {/* Bar 2 */}
    <rect x="24" y="22" width="4" height="20" rx="2" fill="#20E070" opacity="0.8" />
    {/* Bar 3 (tallest, centre) */}
    <rect x="30" y="18" width="4" height="28" rx="2" fill="#20E070" />
    {/* Bar 4 */}
    <rect x="36" y="22" width="4" height="20" rx="2" fill="#20E070" opacity="0.8" />
    {/* Bar 5 (rightmost, short) */}
    <rect x="43" y="28" width="4" height="8" rx="2" fill="#20E070" opacity="0.6" />
  </svg>
);

const Logo = ({ layout = 'vertical', size = 'md' }) => {
  const symbolSizes = { sm: 28, md: 40, lg: 56 };
  const symbolPx = symbolSizes[size] ?? 40;

  return (
    <div className={`logo logo--${layout} logo--${size}`}>
      <AurabitSymbol size={symbolPx} />
      <span className="logo-wordmark">Aurabit</span>
    </div>
  );
};

export default Logo;
