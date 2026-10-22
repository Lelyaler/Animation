import './style.css';
import { OrbitalLoop } from './animations/orbitalLoop.js';
import { NFCTerminal } from './components/nfcTerminal.js';
import { ExchangeCalculator } from './components/exchange.js';
import { CardCustomizer } from './components/cardCustomizer.js';
import { TransactionFeed } from './components/transactions.js';
import { DynamicIsland } from './components/dynamicIsland.js';

import confetti from 'canvas-confetti';

document.addEventListener('DOMContentLoaded', () => {
  const islandWrap = document.getElementById('dynamic-island-wrap');
  if (islandWrap) {
    new DynamicIsland(islandWrap);
  }

  const txContainer = document.getElementById('tx-feed-container');
  if (txContainer) {
    new TransactionFeed(txContainer);
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
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;
      spotlight.style.transform = `translate3d(${currentX - 340}px, ${currentY - 340}px, 0)`;
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

  // Universal smooth scroll for in-page anchors
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId && targetId !== '#') {
        const targetEl = document.querySelector(targetId);
        if (targetEl) {
          e.preventDefault();
          targetEl.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });

  // Live currency ticker fluctuations
  const tickerItems = document.querySelectorAll('.ticker-item');
  if (tickerItems.length > 0) {
    setInterval(() => {
      const randomIndex = Math.floor(Math.random() * tickerItems.length);
      const item = tickerItems[randomIndex];
      const valEl = item.querySelector('.ticker-val');
      const deltaEl = item.querySelector('.ticker-delta');
      if (!valEl || !deltaEl) return;

      const rawVal = parseFloat(valEl.textContent.replace(/[^0-9.]/g, ''));
      if (isNaN(rawVal)) return;

      const isPositive = Math.random() > 0.45;
      const shiftPercent = (Math.random() * 0.08 + 0.01) * (isPositive ? 1 : -1);
      const isCrypto = rawVal > 1000;

      let newVal;
      if (isCrypto) {
        newVal = '$' + Math.round(rawVal * (1 + shiftPercent / 100)).toLocaleString('en-US');
      } else {
        newVal = (rawVal * (1 + shiftPercent / 100)).toFixed(4);
      }

      valEl.textContent = newVal;
      deltaEl.className = `ticker-delta ${isPositive ? 'delta-up' : 'delta-down'}`;
      deltaEl.textContent = `${isPositive ? '▲ +' : '▼ -'}${Math.abs(shiftPercent).toFixed(2)}%`;

      valEl.classList.remove('ticker-flash-up', 'ticker-flash-down');
      void valEl.offsetWidth; // trigger reflow
      valEl.classList.add(isPositive ? 'ticker-flash-up' : 'ticker-flash-down');
    }, 4500);
  }

  // Card application modal management
  const orderModal = document.getElementById('order-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalDoneBtn = document.getElementById('modal-done-btn');
  const orderForm = document.getElementById('order-card-form');
  const modalInputName = document.getElementById('modal-input-name');
  const modalSelectedMaterial = document.getElementById('modal-selected-material');
  const modalFormBody = document.getElementById('modal-form-body');
  const modalSuccessBody = document.getElementById('modal-success-body');

  const openModal = (cardholder = 'ALEXANDER VORONOV', material = 'Midnight Obsidian') => {
    if (!orderModal) return;
    if (modalInputName) modalInputName.value = cardholder;
    if (modalSelectedMaterial) modalSelectedMaterial.textContent = material;
    if (modalFormBody) modalFormBody.style.display = 'block';
    if (modalSuccessBody) modalSuccessBody.style.display = 'none';

    orderModal.classList.add('is-open');
    orderModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    if (!orderModal) return;
    orderModal.classList.remove('is-open');
    orderModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  document.addEventListener('nova:open-order-modal', (e) => {
    const detail = e.detail || {};
    openModal(detail.cardholder, detail.materialName);
  });

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
  if (modalDoneBtn) modalDoneBtn.addEventListener('click', closeModal);

  if (orderModal) {
    orderModal.addEventListener('click', (e) => {
      if (e.target === orderModal) closeModal();
    });
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && orderModal && orderModal.classList.contains('is-open')) {
      closeModal();
    }
  });

  if (orderForm) {
    orderForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const submitBtn = orderForm.querySelector('.modal-submit-btn');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span>Обработка заявки...</span>`;
      }

      setTimeout(() => {
        confetti({
          particleCount: 90,
          spread: 75,
          origin: { y: 0.6 }
        });

        if (modalFormBody) modalFormBody.style.display = 'none';
        if (modalSuccessBody) modalSuccessBody.style.display = 'block';
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = `<span>Подтвердить выпуск карты</span>`;
        }

        const matName = modalSelectedMaterial ? modalSelectedMaterial.textContent : 'Obsidian';
        document.dispatchEvent(new CustomEvent('nova:notification', {
          detail: {
            icon: 'card',
            title: 'Карта отправлена в производство',
            desc: `DHL Express • ${matName}`,
            badge: 'Заявка'
          }
        }));
      }, 700);
    });
  }
});

