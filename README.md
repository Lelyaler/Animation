# NOVA Pay — Interactive Fintech Experience

A high-performance modern web application demonstrating advanced 3D transforms, physics-driven animations, and interactive financial technology components.

## Features

- **3D Orbital Card Stage**: Interactive 3D carousel with inertia-based drag-to-spin physics, tilt-on-hover, inspection zoom, and 3D card flip.
- **NFC Tap-to-Pay POS Terminal**: Interactive payment simulation with real-time 3D flight paths, tactile haptic/audio feedback synthesized via the Web Audio API, EMV chip authorization, and printed paper receipt ejection.
- **Card Customizer**: Real-time virtual card material switcher (Midnight Obsidian, Brushed Titanium, Racing Emerald, Royal Sapphire, Prism Hologram), dynamic laser scanner effect, and instant card freeze mode.
- **Currency Exchange Calculator**: Bidirectional currency conversion with live exchange rates and an interactive SVG rate trend chart.
- **Live Transaction Stream**: Real-time transaction feed with category filtering (All, Income, Expense) and animated live updates.
- **Ambient Visual Layer**: GPU-accelerated background with floating blur orbs, dot matrix cyber grid, aurora wave, and cursor spotlight.
- **Adaptive Layout**: Fully responsive interface tailored for all viewports from 360px mobile screens to ultra-wide displays.

## Tech Stack

- **Core**: HTML5, CSS3 (Modern 3D Transforms, Glassmorphism, CSS Grid & Flexbox)
- **Runtime & Logic**: Vanilla JavaScript (ES Modules)
- **Animation Engine**: [GSAP](https://greensock.com/gsap/)
- **FX**: Canvas Confetti, Web Audio API
- **Build Tool**: [Vite](https://vitejs.dev/)

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or pnpm / yarn

### Installation

```bash
# Clone repository
git clone https://github.com/Lelyaler/Animation.git
cd Animation

# Install dependencies
npm install

# Start local development server
npm run dev
```

### Production Build

```bash
# Build optimized static bundle
npm run build

# Preview production build locally
npm run preview
```
