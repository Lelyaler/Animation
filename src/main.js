import './style.css';
import { OrbitalLoop } from './animations/orbitalLoop.js';
import { NFCTerminal } from './components/nfcTerminal.js';
import { ExchangeCalculator } from './components/exchange.js';
import { CardCustomizer } from './components/cardCustomizer.js';
import { TransactionFeed } from './components/transactions.js';
import { DynamicIsland } from './components/dynamicIsland.js';
import { setupMagneticButtons } from './animations/magneticButton.js';

document.addEventListener('DOMContentLoaded', () => {
  const islandWrap = document.getElementById('dynamic-island-wrap');
  if (islandWrap) {
    window.novaDynamicIsland = new DynamicIsland(islandWrap);
  }

  const txContainer = document.getElementById('tx-feed-container');
  if (txContainer) {
    window.novaTransactionFeed = new TransactionFeed(txContainer);
  }

  const orbitalStage = document.getElementById('orbital-stage');
  if (orbitalStage) {
    new OrbitalLoop(orbitalStage);
  }

  const nfcContainer = document.getElementById('nfc-station-container');
  if (nfcContainer) {
    new NFCTerminal(nfcContainer);
  }

  const exchangeContainer = document.getElementById('exchange-calc-container');
  if (exchangeContainer) {
    new ExchangeCalculator(exchangeContainer);
  }

  const customizerContainer = document.getElementById('card-customizer-container');
  if (customizerContainer) {
    new CardCustomizer(customizerContainer);
  }

  const spotlight = document.getElementById('ambient-cursor-spotlight');
  if (spotlight && window.matchMedia('(pointer: fine)').matches) {
    let currentX = window.innerWidth / 2;
    let currentY = window.innerHeight / 2;
    let targetX = currentX;
    let targetY = currentY;
    let isMoving = false;

    window.addEventListener('pointermove', (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
      if (!isMoving) {
        spotlight.classList.add('is-active');
        isMoving = true;
      }
    }, { passive: true });

    const updateSpotlight = () => {
      currentX += (targetX - currentX) * 0.07;
      currentY += (targetY - currentY) * 0.07;
      spotlight.style.transform = `translate3d(${currentX - 290}px, ${currentY - 290}px, 0)`;
      requestAnimationFrame(updateSpotlight);
    };
    requestAnimationFrame(updateSpotlight);
  }

  // Mobile navigation drawer
  const mobileToggle = document.getElementById('mobile-nav-toggle');
  const navMenu = document.getElementById('nav-menu');
  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = navMenu.classList.toggle('is-open');
      mobileToggle.classList.toggle('is-active', isOpen);
    });

    document.addEventListener('click', (e) => {
      if (!navMenu.contains(e.target) && !mobileToggle.contains(e.target)) {
        navMenu.classList.remove('is-open');
        mobileToggle.classList.remove('is-active');
      }
    });

    navMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('is-open');
        mobileToggle.classList.remove('is-active');
      });
    });
  }

  // Smooth scroll
  document.querySelectorAll('.nav-menu a').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = anchor.getAttribute('href');
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
});
