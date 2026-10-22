import gsap from 'gsap';
import { HolographicFoil } from '../animations/holographicFoil.js';
import { ICONS } from './icons.js';
import { posTemplates } from './posTemplates.js';

const tapAudio = typeof Audio !== 'undefined' ? new Audio('./sounds/nfc-tap.wav') : null;
const successAudio = typeof Audio !== 'undefined' ? new Audio('./sounds/nfc-success.wav') : null;
if (tapAudio) tapAudio.preload = 'none';
if (successAudio) successAudio.preload = 'none';

export const STORES = [
  {
    id: 'coffee',
    name: 'Starbucks Reserve',
    shortName: 'Starbucks',
    category: 'Кафе и встречи',
    icon: ICONS.coffee(15),
    amount: 8.50,
    currency: '$',
    cashback: 0.30,
    authCode: 'NV-884102',
    terminalId: 'POS-BER-401'
  },
  {
    id: 'software',
    name: 'JetBrains Tools',
    shortName: 'JetBrains',
    category: 'Лицензии и ПО',
    icon: ICONS.code(15),
    amount: 289.00,
    currency: '$',
    cashback: 10.12,
    authCode: 'NV-941829',
    terminalId: 'POS-AMS-882'
  },
  {
    id: 'airline',
    name: 'Lufthansa Flights',
    shortName: 'Lufthansa',
    category: 'Авиаперелеты',
    icon: ICONS.plane(15),
    amount: 1420.00,
    currency: '$',
    cashback: 49.70,
    authCode: 'NV-772901',
    terminalId: 'POS-FRA-104'
  },
  {
    id: 'hotel',
    name: 'Hyatt Hotels',
    shortName: 'Hyatt',
    category: 'Отели и проживание',
    icon: ICONS.hotel(15),
    amount: 680.00,
    currency: '$',
    cashback: 23.80,
    authCode: 'NV-394018',
    terminalId: 'POS-LDN-305'
  }
];

export class NFCTerminal {
  constructor(containerEl, options = {}) {
    this.container = containerEl;
    this.options = options;

    this.currentStoreIndex = 0;
    this.currentCardTheme = 'titanium';
    this.isProcessing = false;
    this.audioCtx = null;

    this.renderStorePills();
    this.initElements();
    this.initEvents();
    this.initHolo();
  }

  renderStorePills() {
    const pillsRow = this.container.querySelector('#pos-store-pills-row');
    if (pillsRow) {
      pillsRow.innerHTML = STORES.map((s, idx) =>
        posTemplates.storePill(s, idx, idx === this.currentStoreIndex)
      ).join('');
    }
  }

  initElements() {
    this.terminalEl = this.container.querySelector('#nfc-pos-device');
    this.terminalScreen = this.container.querySelector('#pos-screen-content');
    this.nfcTarget = this.container.querySelector('#pos-nfc-target');
    this.nfcWaveBox = this.container.querySelector('#nfc-wave-box');
    this.receiptEl = this.container.querySelector('#pos-receipt-paper');
    this.cardEl = this.container.querySelector('#nfc-floating-card');
    this.tapBtn = this.container.querySelector('#trigger-nfc-tap-btn');
    this.repeatBtn = this.container.querySelector('#repeat-nfc-btn');
    this.storeSelectBtns = this.container.querySelectorAll('.pos-store-pill');
    this.cardSelectBtns = this.container.querySelectorAll('.pos-card-pill');
  }

  initHolo() {
    if (this.cardEl) {
      this.holoFoil = new HolographicFoil(this.cardEl, { enableMouse: true });
    }
  }

  initEvents() {
    this.storeSelectBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        if (this.isProcessing) return;
        this.storeSelectBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentStoreIndex = parseInt(btn.dataset.idx, 10);
        this.updateStoreUI();
        this.resetReceipt();
      });
    });

    this.cardSelectBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        if (this.isProcessing) return;
        this.cardSelectBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.setCardTheme(btn.dataset.card);
      });
    });

    if (this.cardEl) {
      this.cardEl.addEventListener('click', () => {
        if (!this.isProcessing) {
          this.executePaymentTap();
        }
      });
      this.cardEl.addEventListener('keydown', (e) => {
        if ((e.key === 'Enter' || e.key === ' ') && !this.isProcessing) {
          e.preventDefault();
          this.executePaymentTap();
        }
      });
    }

    if (this.tapBtn) {
      this.tapBtn.addEventListener('click', () => {
        if (!this.isProcessing) {
          this.executePaymentTap();
        }
      });
    }

    if (this.repeatBtn) {
      this.repeatBtn.addEventListener('click', () => {
        this.resetReceipt();
        this.repeatBtn.style.display = 'none';
        this.tapBtn.style.display = 'inline-flex';
      });
    }
  }

  updateStoreUI() {
    const store = STORES[this.currentStoreIndex];
    const storeIcon = this.container.querySelector('#pos-store-icon');
    const storeName = this.container.querySelector('#pos-store-name');
    const storeCat = this.container.querySelector('#pos-store-cat');
    const amountVal = this.container.querySelector('#pos-amount-val');

    if (storeIcon) storeIcon.innerHTML = store.icon;
    if (storeName) storeName.textContent = store.name;
    if (storeCat) storeCat.textContent = store.category;
    if (amountVal) amountVal.textContent = store.amount.toFixed(2);

    const rcMerchant = this.container.querySelector('#rc-merchant');
    const rcTerminal = this.container.querySelector('#rc-terminal');
    const rcTotal = this.container.querySelector('#rc-total');
    const rcAuth = this.container.querySelector('#rc-auth');
    const rcCashback = this.container.querySelector('#rc-cashback');

    if (rcMerchant) rcMerchant.textContent = store.name;
    if (rcTerminal) rcTerminal.textContent = store.terminalId;
    if (rcTotal) rcTotal.textContent = `${store.currency}${store.amount.toFixed(2)}`;
    if (rcAuth) rcAuth.textContent = store.authCode;
    if (rcCashback) rcCashback.textContent = `Кешбэк +${store.currency}${store.cashback.toFixed(2)} (3.5%) начислен`;
  }

  setCardTheme(theme) {
    this.currentCardTheme = theme;
    const card = this.cardEl;
    if (!card) return;

    card.className = 'nfc-floating-card';
    const logo = card.querySelector('#nfc-card-logo');
    const number = card.querySelector('#nfc-card-number');
    const rcCard = this.container.querySelector('#rc-card');

    if (theme === 'titanium') {
      card.classList.add('card-platinum');
      if (logo) logo.innerHTML = 'NOVA <b>TITANIUM</b>';
      if (number) number.textContent = '•••• 8814';
      if (rcCard) rcCard.textContent = 'NOVA TITANIUM (•••• 8814)';
    } else if (theme === 'obsidian') {
      card.classList.add('card-obsidian');
      if (logo) logo.innerHTML = 'NOVA <b>BLACK</b>';
      if (number) number.textContent = '•••• 4921';
      if (rcCard) rcCard.textContent = 'NOVA BLACK (•••• 4921)';
    } else if (theme === 'emerald') {
      card.classList.add('card-emerald');
      if (logo) logo.innerHTML = 'NOVA <b>EMERALD</b>';
      if (number) number.textContent = '•••• 3210';
      if (rcCard) rcCard.textContent = 'NOVA EMERALD (•••• 3210)';
    } else if (theme === 'hologram') {
      card.classList.add('card-hologram');
      if (logo) logo.innerHTML = 'NOVA <b>PRISM</b>';
      if (number) number.textContent = '•••• 7701';
      if (rcCard) rcCard.textContent = 'NOVA PRISM HOLO (•••• 7701)';
    }

    gsap.fromTo(card,
      { scale: 0.94, rotateY: -10 },
      { scale: 1.0, rotateY: 0, duration: 0.4, ease: 'back.out(2)' }
    );
  }

  playNFCSound() {
    if (tapAudio) {
      try {
        tapAudio.currentTime = 0;
        tapAudio.volume = 0.45;
        tapAudio.play().catch(() => {});
      } catch {
        // audio playback error
      }
    }
  }

  executePaymentTap() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    const card = this.cardEl;
    const target = this.nfcTarget;
    const banner = this.container.querySelector('#pos-state-banner');
    const device = this.terminalEl;
    const store = STORES[this.currentStoreIndex];

    this.tapBtn.classList.add('is-busy');
    this.tapBtn.innerHTML = posTemplates.tapButton(true);

    card.style.zIndex = '9999';

    const cardRect = card.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();

    const deltaX = targetRect.left + (targetRect.width / 2) - (cardRect.left + cardRect.width / 2);
    const deltaY = targetRect.top + (targetRect.height / 2) - (cardRect.top + cardRect.height / 2) - 18;

    const tl = gsap.timeline();

    tl.to(card, {
      y: -60,
      scale: 1.05,
      rotateX: -18,
      rotateY: 8,
      duration: 0.26,
      ease: 'power2.out'
    });

    tl.to(card, {
      x: deltaX,
      y: deltaY - 12,
      scale: 0.88,
      rotateX: 16,
      rotateY: -6,
      rotateZ: 2,
      duration: 0.44,
      ease: 'power3.inOut'
    });

    tl.to(card, {
      y: deltaY,
      scale: 0.85,
      duration: 0.08,
      ease: 'power4.in',
      onComplete: () => {
        this.playNFCSound();

        if (navigator.vibrate) {
          navigator.vibrate([40, 60, 40]);
        }

        this.triggerNFCWaves();

        target.classList.add('is-active-tap');
        device.classList.add('pos-device-active');

        if (banner) {
          banner.innerHTML = posTemplates.readingBanner();
          banner.className = 'pos-state-banner state-reading';
        }
      }
    });

    tl.to(card, {
      y: deltaY + 6,
      duration: 0.35,
      onComplete: () => {
        if (banner) {
          banner.innerHTML = posTemplates.authorizingBanner();
          banner.className = 'pos-state-banner state-authorizing';
        }
      }
    });

    tl.to({}, {
      duration: 0.35,
      onComplete: () => {
        target.classList.remove('is-active-tap');

        this.playApprovalSound();
        this.triggerApprovalPulse();

        if (banner) {
          banner.innerHTML = posTemplates.approvedBanner();
          banner.className = 'pos-state-banner state-approved';
        }

        this.ejectReceipt();

        document.dispatchEvent(new CustomEvent('nova:notification', {
          detail: {
            icon: 'check',
            title: `Оплата ${store.currency}${store.amount.toFixed(2)} успешна`,
            desc: `${store.name} • Кешбэк +${store.currency}${store.cashback.toFixed(2)}`,
            badge: '+3.5%'
          }
        }));

        document.dispatchEvent(new CustomEvent('nova:transaction', {
          detail: {
            merchant: store.name,
            cat: store.category,
            amount: `-${store.currency}${store.amount.toFixed(2)}`,
            isIncome: false,
            status: 'Оплачено NFC'
          }
        }));
      }
    });

    tl.to(card, {
      x: 0,
      y: 0,
      scale: 1,
      rotateX: 0,
      rotateY: 0,
      rotateZ: 0,
      duration: 0.65,
      ease: 'power3.out',
      delay: 0.3,
      onComplete: () => {
        card.style.zIndex = '';
        this.isProcessing = false;
        this.tapBtn.style.display = 'none';
        this.repeatBtn.style.display = 'inline-flex';
        this.tapBtn.classList.remove('is-busy');
        this.tapBtn.innerHTML = posTemplates.tapButton(false);
      }
    });
  }

  playApprovalSound() {
    if (successAudio) {
      try {
        successAudio.currentTime = 0;
        successAudio.volume = 0.55;
        successAudio.play().catch(() => {});
      } catch {
        // audio playback error
      }
    }
  }

  triggerApprovalPulse() {
    const waves = this.container.querySelectorAll('.nfc-ring');
    waves.forEach((ring, i) => {
      gsap.killTweensOf(ring);
      gsap.fromTo(ring,
        { scale: 0.5, opacity: 0.95, borderColor: i === 1 ? '#34d399' : '#10b981', borderWidth: '2.5px' },
        { scale: 3.4 + i * 0.4, opacity: 0, borderWidth: '1px', duration: 0.95, delay: i * 0.1, ease: 'power2.out' }
      );
    });

    const device = this.terminalEl;
    if (device) {
      device.classList.add('pos-device-success');
      setTimeout(() => {
        device.classList.remove('pos-device-success');
      }, 1400);
    }

    const screen = this.container.querySelector('.pos-screen');
    if (screen) {
      screen.classList.add('screen-success-flash');
      setTimeout(() => {
        screen.classList.remove('screen-success-flash');
      }, 900);
    }
  }

  triggerNFCWaves() {
    const waves = this.container.querySelectorAll('.nfc-ring');
    waves.forEach((ring, i) => {
      gsap.fromTo(ring,
        { scale: 0.7, opacity: 1 },
        { scale: 2.8, opacity: 0, duration: 0.65, delay: i * 0.1, ease: 'power2.out' }
      );
    });
  }

  ejectReceipt() {
    const receipt = this.receiptEl;
    if (!receipt) return;

    gsap.fromTo(receipt,
      { y: '105%', opacity: 0 },
      { y: '-12px', opacity: 1, duration: 0.85, ease: 'power3.out' }
    );
  }

  resetReceipt() {
    const receipt = this.receiptEl;
    if (receipt) {
      gsap.to(receipt, {
        y: '105%',
        opacity: 0,
        duration: 0.35,
        ease: 'power2.in'
      });
    }

    const banner = this.container.querySelector('#pos-state-banner');
    if (banner) {
      banner.className = 'pos-state-banner';
      banner.innerHTML = posTemplates.idleBanner();
    }

    const device = this.terminalEl;
    if (device) {
      device.classList.remove('pos-device-active', 'pos-device-success');
    }

    const screen = this.container.querySelector('.pos-screen');
    if (screen) {
      screen.classList.remove('screen-success-flash');
    }
  }
}
