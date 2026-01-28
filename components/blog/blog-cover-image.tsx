interface BlogCoverImageProps {
  title: string;
  category?: string;
  className?: string;
}

// Generate a consistent color based on string hash
function stringToColor(str: string): { bg: string; accent: string; pattern: string } {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Generate colors in the HIPAA Guard palette with variations
  const colorSchemes = [
    { bg: '#0c0b1d', accent: '#1ad07a', pattern: '#1ad07a' },
    { bg: '#1a1b2e', accent: '#1ad07a', pattern: '#4ade80' },
    { bg: '#0c0b1d', accent: '#4ade80', pattern: '#1ad07a' },
    { bg: '#1a1b2e', accent: '#4ade80', pattern: '#22c55e' },
    { bg: '#0c0b1d', accent: '#22c55e', pattern: '#1ad07a' },
    { bg: '#1a1b2e', accent: '#22c55e', pattern: '#4ade80' },
  ];
  
  return colorSchemes[Math.abs(hash) % colorSchemes.length];
}

export function BlogCoverImage({ title, category, className = '' }: BlogCoverImageProps) {
  const colorScheme = stringToColor(title);
  
  // Get state name if it's a state page
  const stateMatch = title.match(/in\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/);
  const stateName = stateMatch ? stateMatch[1] : null;

  // Short title for display
  const displayTitle = title.length > 50 ? title.substring(0, 47) + '...' : title;

  const id = title.replace(/[^a-zA-Z0-9]/g, '').substring(0, 15);

  return (
    <div className={`relative w-full h-full ${className}`}>
      <svg
        viewBox="0 0 1200 630"
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id={`gradient-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colorScheme.bg} stopOpacity="1" />
            <stop offset="100%" stopColor="#1a1b2e" stopOpacity="1" />
          </linearGradient>
          <pattern id={`pattern-${id}`} x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
            <circle cx="40" cy="40" r="1.5" fill={colorScheme.pattern} opacity="0.1" />
          </pattern>
        </defs>
        
        {/* Background */}
        <rect width="1200" height="630" fill={`url(#gradient-${id})`} />
        <rect width="1200" height="630" fill={`url(#pattern-${id})`} />
        
        {/* Decorative Elements - Simplified for performance */}
        <circle cx="150" cy="120" r="100" fill={colorScheme.accent} opacity="0.08" />
        <circle cx="1050" cy="510" r="140" fill={colorScheme.accent} opacity="0.06" />
        
        {/* Shield Icon (HIPAA theme) - Simplified */}
        <g transform="translate(80, 200)">
          <path
            d="M 60 20 L 140 20 L 140 80 L 100 100 L 60 80 Z"
            fill="none"
            stroke={colorScheme.accent}
            strokeWidth="3"
            opacity="0.3"
          />
          <path
            d="M 70 35 L 130 35 L 130 75 L 100 90 L 70 75 Z"
            fill={colorScheme.accent}
            opacity="0.2"
          />
        </g>
        
        {/* State Badge */}
        {stateName && (
          <g transform="translate(950, 50)">
            <rect
              x="0"
              y="0"
              width="140"
              height="55"
              rx="10"
              fill={colorScheme.accent}
              opacity="0.95"
            />
            <text
              x="70"
              y="36"
              textAnchor="middle"
              fill="#0c0b1d"
              fontSize="22"
              fontWeight="700"
              fontFamily="system-ui, -apple-system, sans-serif"
              letterSpacing="2"
            >
              {stateName.substring(0, 2).toUpperCase()}
            </text>
          </g>
        )}
        
        {/* Main Title */}
        <g transform="translate(100, 380)">
          <text
            x="0"
            y="0"
            fill="#ffffff"
            fontSize="52"
            fontWeight="200"
            fontFamily="system-ui, -apple-system, sans-serif"
            letterSpacing="-0.5"
            opacity="0.95"
          >
            <tspan x="0" dy="0">HIPAA</tspan>
          </text>
          <text
            x="0"
            y="70"
            fill={colorScheme.accent}
            fontSize="40"
            fontWeight="300"
            fontFamily="system-ui, -apple-system, sans-serif"
            letterSpacing="-0.3"
          >
            <tspan x="0" dy="0">{displayTitle}</tspan>
          </text>
        </g>
        
        {/* Bottom Accent Line */}
        <line
          x1="100"
          y1="570"
          x2="600"
          y2="570"
          stroke={colorScheme.accent}
          strokeWidth="5"
          opacity="0.7"
        />
        
      </svg>
    </div>
  );
}
