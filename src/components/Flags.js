// Flag SVG components

export const FlagEN = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 30" className={className}>
    <clipPath id="a"><path d="M0 0v30h60V0z"/></clipPath>
    <clipPath id="b"><path d="M30 15h30v15zv15H0zH0V0zV0h30z"/></clipPath>
    <g clipPath="url(#a)">
      <path d="M0 0v30h60V0z" fill="#012169"/>
      <path d="M0 0l60 30m0-30L0 30" stroke="#fff" strokeWidth="6"/>
      <path d="M0 0l60 30m0-30L0 30" clipPath="url(#b)" stroke="#C8102E" strokeWidth="4"/>
      <path d="M30 0v30M0 15h60" stroke="#fff" strokeWidth="10"/>
      <path d="M30 0v30M0 15h60" stroke="#C8102E" strokeWidth="6"/>
    </g>
  </svg>
);

export const FlagPL = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 10" className={className}>
    <rect width="16" height="5" y="0" fill="#fff"/>
    <rect width="16" height="5" y="5" fill="#dc143c"/>
  </svg>
);

export const FlagDE = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 10" className={className}>
    <rect width="16" height="3.33" y="0" fill="#000"/>
    <rect width="16" height="3.33" y="3.33" fill="#FF0000"/>
    <rect width="16" height="3.33" y="6.66" fill="#FFCC00"/>
  </svg>
);

export const FlagFR = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 10" className={className}>
    <rect width="5.33" height="10" x="0" fill="#002654"/>
    <rect width="5.33" height="10" x="5.33" fill="#FFFFFF"/>
    <rect width="5.33" height="10" x="10.66" fill="#ED2939"/>
  </svg>
);

export const FlagES = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 750 500" className={className}>
    <rect width="750" height="500" fill="#c60b1e"/>
    <rect width="750" height="250" y="125" fill="#ffc400"/>
  </svg>
);
