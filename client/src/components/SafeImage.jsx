import { useState } from "react";

const PLACEHOLDER =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400'>
      <defs>
        <linearGradient id='g' x1='0' x2='1' y1='0' y2='1'>
          <stop offset='0%' stop-color='%23f3f4f8'/>
          <stop offset='100%' stop-color='%23dde1ec'/>
        </linearGradient>
      </defs>
      <rect width='400' height='400' fill='url(%23g)'/>
      <g fill='none' stroke='%239ca0b4' stroke-width='6' stroke-linecap='round' stroke-linejoin='round'>
        <rect x='90' y='120' width='220' height='160' rx='14'/>
        <circle cx='140' cy='170' r='14'/>
        <path d='M105 250l60-55 50 45 35-30 65 55'/>
      </g>
      <text x='200' y='320' text-anchor='middle' font-family='system-ui,sans-serif' font-size='18' fill='%236b6f80'>No image</text>
    </svg>`
  );

export default function SafeImage({ src, alt = "", className, style, ...rest }) {
  const [errored, setErrored] = useState(false);
  const finalSrc = !src || errored ? PLACEHOLDER : src;
  return (
    <img
      src={finalSrc}
      alt={alt}
      className={className}
      style={style}
      onError={() => setErrored(true)}
      {...rest}
    />
  );
}