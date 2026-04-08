export default function Logo({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      {/* Outer circle - NCAT Blue */}
      <circle cx="50" cy="50" r="48" fill="#0039A6" stroke="#FFB81C" strokeWidth="4"/>
      
      {/* Inner decorative ring */}
      <circle cx="50" cy="50" r="38" fill="none" stroke="#FFB81C" strokeWidth="1.5" opacity="0.5"/>
      
      {/* A letter */}
      <text
        x="15"
        y="62"
        fontFamily="Georgia, serif"
        fontSize="38"
        fontWeight="bold"
        fill="#FFB81C"
        letterSpacing="-2"
      >A</text>
      
      {/* & symbol */}
      <text
        x="50"
        y="58"
        fontFamily="Georgia, serif"
        fontSize="22"
        fontWeight="bold"
        fill="#FFFFFF"
        textAnchor="middle"
      >&amp;</text>
      
      {/* T letter */}
      <text
        x="62"
        y="62"
        fontFamily="Georgia, serif"
        fontSize="38"
        fontWeight="bold"
        fill="#FFB81C"
        letterSpacing="-2"
      >T</text>

      {/* Bottom text */}
      <text
        x="50"
        y="82"
        fontFamily="Arial, sans-serif"
        fontSize="8"
        fontWeight="bold"
        fill="#FFFFFF"
        textAnchor="middle"
        letterSpacing="1"
      >AGGIES</text>
    </svg>
  )
}