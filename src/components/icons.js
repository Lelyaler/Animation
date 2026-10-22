/**
 * Reusable SVG icon components and helpers for UI modules
 */

export function createSvg(innerHtml, {
  width = 24,
  height = 24,
  viewBox = '0 0 24 24',
  fill = 'none',
  stroke = 'currentColor',
  strokeWidth = 2,
  className = '',
  style = ''
} = {}) {
  const classAttr = className ? ` class="${className}"` : '';
  const styleAttr = style ? ` style="${style}"` : '';
  return `<svg width="${width}" height="${height}" viewBox="${viewBox}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"${classAttr}${styleAttr}>${innerHtml}</svg>`;
}

export const ICONS = {
  // Navigation & hardware telemetry
  battery: (size = 12, style = 'vertical-align: -1px; display: inline-block;') => createSvg(
    `<rect x="1" y="6" width="18" height="12" rx="2"></rect><line x1="23" y1="11" x2="23" y2="13"></line><line x1="5" y1="10" x2="5" y2="14"></line><line x1="9" y1="10" x2="9" y2="14"></line><line x1="13" y1="10" x2="13" y2="14"></line>`,
    { width: size, height: size, strokeWidth: 2, style }
  ),

  nfcWave: (size = 36) => createSvg(
    `<path d="M5 12.55a11 11 0 0 1 14.08 0"></path><path d="M8.5 15.5a6 6 0 0 1 7 0"></path><circle cx="12" cy="18.5" r="1.2" fill="currentColor"></circle>`,
    { width: size, height: size, strokeWidth: 2.2 }
  ),

  nfcTap: (size = 20) => createSvg(
    `<path d="M5 12.55a11 11 0 0 1 14.08 0"></path><path d="M8.5 15.5a6 6 0 0 1 7 0"></path><circle cx="12" cy="18.5" r="1.2" fill="currentColor"></circle>`,
    { width: size, height: size, strokeWidth: 2.2 }
  ),

  lock: (size = 15) => createSvg(
    `<rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path>`,
    { width: size, height: size, strokeWidth: 2 }
  ),

  appleCheck: () => `<svg class="apple-check-svg" viewBox="0 0 32 32"><circle class="apple-check-circle" cx="16" cy="16" r="14" fill="none" /><path class="apple-check-tick" fill="none" stroke-linecap="round" stroke-linejoin="round" d="M9.5 16.5 L14 21 L22.5 12" /></svg>`,

  // Merchant category icons
  coffee: (size = 15) => createSvg(
    `<path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path><line x1="6" y1="1" x2="6" y2="4"></line><line x1="10" y1="1" x2="10" y2="4"></line><line x1="14" y1="1" x2="14" y2="4"></line>`,
    { width: size, height: size, strokeWidth: 2 }
  ),

  code: (size = 15) => createSvg(
    `<polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline>`,
    { width: size, height: size, strokeWidth: 2 }
  ),

  plane: (size = 15) => createSvg(
    `<path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"></path>`,
    { width: size, height: size, strokeWidth: 2 }
  ),

  hotel: (size = 15) => createSvg(
    `<path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"></path><path d="M6 12H4a2 2 0 0 0-2 2v8h4"></path><path d="M18 9h2a2 2 0 0 1 2 2v11h-4"></path><path d="M10 6h4"></path><path d="M10 10h4"></path><path d="M10 14h4"></path><path d="M10 18h4"></path>`,
    { width: size, height: size, strokeWidth: 2 }
  ),

  // Dynamic Island status icons
  card: (size = 13) => createSvg(
    `<rect x="1" y="4" width="22" height="16" rx="3" ry="3"></rect><line x1="1" y1="10" x2="23" y2="10"></line>`,
    { width: size, height: size, strokeWidth: 2 }
  ),

  shield: (size = 13) => createSvg(
    `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>`,
    { width: size, height: size, strokeWidth: 2 }
  ),

  chart: (size = 13) => createSvg(
    `<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline>`,
    { width: size, height: size, strokeWidth: 2 }
  ),

  package: (size = 13) => createSvg(
    `<line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line>`,
    { width: size, height: size, strokeWidth: 2 }
  ),

  check: (size = 13) => createSvg(
    `<polyline points="20 6 9 17 4 12"></polyline>`,
    { width: size, height: size, strokeWidth: 2.5 }
  ),

  // Transactions stream icons
  arrowDown: (size = 12) => createSvg(
    `<line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline>`,
    { width: size, height: size, strokeWidth: 2.5 }
  ),

  arrowUp: (size = 12) => createSvg(
    `<line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline>`,
    { width: size, height: size, strokeWidth: 2.5 }
  )
};
