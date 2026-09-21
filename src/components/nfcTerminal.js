import gsap from 'gsap';
import { HolographicFoil } from '../animations/holographicFoil.js';

export const STORES = [
  {
    id: 'coffee',
    name: 'Blue Bottle Coffee',
    category: 'Кафе и рестораны',
    icon: '☕',
    amount: 6.50,
    currency: '$',
    cashback: 0.23,
    authCode: 'NV-884102',
    terminalId: 'POS-BER-401'
  },
  {
    id: 'apple',
    name: 'Apple Flagship Store',
    category: 'Электроника',
    icon: '📱',
    amount: 1199.00,
    currency: '$',
    cashback: 41.96,
    authCode: 'NV-941829',
    terminalId: 'POS-NYC-882'
  },
  {
    id: 'airline',
    name: 'Emirates First Class',
    category: 'Путешествия',
    icon: '✈️',
    amount: 3450.00,
    currency: '$',
    cashback: 120.75,
    authCode: 'NV-772901',
    terminalId: 'POS-DXB-104'
  },
  {
    id: 'restaurant',
    name: 'Nobu Michelin Dining',
    category: 'Рестораны',
    icon: '🍣',
    amount: 320.00,
    currency: '$',
    cashback: 11.20,
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

    this.initElements();
    this.initEvents();
    this.initHolo();
  }

  initElements() {
    this.render();

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

  render() {
    const store = STORES[this.currentStoreIndex];

    this.container.innerHTML = `
      <div class="nfc-station-grid">
        <div class="nfc-terminal-wrap">
          <div class="pos-printer-slot">
            <div class="pos-receipt-paper" id="pos-receipt-paper">
              <div class="receipt-header">
                <span class="receipt-logo">NOVA PAY TERMINAL</span>
                <span class="receipt-sub">EMV CONTACTLESS TRANSACTION</span>
              </div>
              <div class="receipt-divider"></div>
              <div class="receipt-rows">
                <div class="rc-row"><span class="rc-l">МАГАЗИН:</span><span class="rc-r" id="rc-merchant">${store.name}</span></div>
                <div class="rc-row"><span class="rc-l">ТЕРМИНАЛ:</span><span class="rc-r" id="rc-terminal">${store.terminalId}</span></div>
                <div class="rc-row"><span class="rc-l">ВРЕМЯ:</span><span class="rc-r" id="rc-time">Только что</span></div>
                <div class="rc-row"><span class="rc-l">КАРТА:</span><span class="rc-r" id="rc-card">NOVA TITANIUM (•••• 8814)</span></div>
                <div class="rc-row"><span class="rc-l">КОД АВТ:</span><span class="rc-r" id="rc-auth">${store.authCode}</span></div>
              </div>
              <div class="receipt-divider"></div>
              <div class="receipt-total-row">
                <span class="rc-total-lbl">ИТОГО К ОПЛАТЕ:</span>
                <span class="rc-total-val" id="rc-total">${store.currency}${store.amount.toFixed(2)}</span>
              </div>
              <div class="receipt-cashback-badge" id="rc-cashback">
                Кешбэк +${store.currency}${store.cashback.toFixed(2)} (3.5%) начислен
              </div>
              <div class="receipt-barcode">
                <span>||| | ||||| || |||| ||| |||| | |||</span>
              </div>
            </div>
          </div>

          <div class="pos-device" id="nfc-pos-device">
            <div class="pos-bezel-reflection"></div>

            <div class="pos-screen">
              <div class="pos-screen-statusbar">
                <span class="pos-wifi">●●● 5G Encrypted</span>
                <span class="pos-status-clock">12:45 PM</span>
                <span class="pos-battery">98% 🔋</span>
              </div>

              <div class="pos-screen-content" id="pos-screen-content">
                <div class="pos-store-meta">
                  <span class="pos-store-icon" id="pos-store-icon">${store.icon}</span>
                  <div class="pos-store-info">
                    <h4 id="pos-store-name">${store.name}</h4>
                    <span id="pos-store-cat">${store.category}</span>
                  </div>
                </div>

                <div class="pos-sum-display">
                  <span class="pos-currency">${store.currency}</span>
                  <span class="pos-amount" id="pos-amount-val">${store.amount.toFixed(2)}</span>
                </div>

                <div class="pos-state-banner" id="pos-state-banner">
                  <div class="pos-pulse-ring"></div>
                  <span class="pos-state-text">Приложите карту для оплаты</span>
                </div>
              </div>
            </div>

            <div class="pos-nfc-target" id="pos-nfc-target">
              <div class="nfc-wave-box" id="nfc-wave-box">
                <div class="nfc-ring ring-1"></div>
                <div class="nfc-ring ring-2"></div>
                <div class="nfc-ring ring-3"></div>
              </div>
              <div class="nfc-symbol-emblem">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M5 12.55a11 11 0 0 1 14.08 0"></path>
                  <path d="M8.5 15.5a6 6 0 0 1 7 0"></path>
                  <circle cx="12" cy="18.5" r="1.2" fill="currentColor"></circle>
                </svg>
              </div>
              <span class="nfc-target-lbl">NOVA TAP ZONE</span>
            </div>

            <div class="pos-device-stand"></div>
          </div>

        </div>

        <div class="nfc-controls-wrap">
          <div class="nfc-panel-header">
            <span class="nfc-badge">NFC 3D Touch Physics</span>
            <h3>Симуляция бесконтактной оплаты</h3>
            <p>Выберите магазин и карту, затем нажмите кнопку или кликните по карте для моментальной транзакции с тактильным звуком.</p>
          </div>

          <div class="nfc-select-group">
            <label>Сумма и магазин:</label>
            <div class="pos-pills-row">
              ${STORES.map((s, idx) => `
                <button class="pos-store-pill ${idx === this.currentStoreIndex ? 'active' : ''}" data-idx="${idx}" type="button">
                  <span>${s.icon}</span>
                  <span>${s.name.split(' ')[0]} • ${s.currency}${s.amount}</span>
                </button>
              `).join('')}
            </div>
          </div>

          <div class="nfc-select-group">
            <label>Карта для оплаты:</label>
            <div class="pos-pills-row">
              <button class="pos-card-pill active" data-card="titanium" type="button">
                <span class="color-dot dot-platinum"></span>
                <span>Titanium</span>
              </button>
              <button class="pos-card-pill" data-card="obsidian" type="button">
                <span class="color-dot dot-obsidian"></span>
                <span>Black</span>
              </button>
              <button class="pos-card-pill" data-card="emerald" type="button">
                <span class="color-dot dot-emerald"></span>
                <span>Emerald</span>
              </button>
              <button class="pos-card-pill" data-card="hologram" type="button">
                <span class="color-dot dot-hologram"></span>
                <span>Prism Holo</span>
              </button>
            </div>
          </div>

          <div class="nfc-card-dock" id="nfc-card-dock">
            <div class="nfc-floating-card card-platinum" id="nfc-floating-card" title="Кликните, чтобы оплатить!">
              <div class="card-inner">
                <div class="card-face card-front">
                  <div class="card-holo-foil"></div>
                  <div class="card-hologram-glare"></div>
                  <div class="card-top">
                    <span class="card-chip-emv"></span>
                    <span class="card-logo" id="nfc-card-logo">NOVA <b>TITANIUM</b></span>
                  </div>
                  <div class="card-balance">
                    <span class="c-lbl">Лимит транзакции</span>
                    <span class="c-val" id="nfc-card-balance">€50,000</span>
                  </div>
                  <div class="card-bottom">
                    <span class="card-number" id="nfc-card-number">•••• 8814</span>
                    <span class="card-nfc">)))</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="nfc-actions-row">
            <button class="primary-btn nfc-tap-action-btn" id="trigger-nfc-tap-btn" type="button">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <path d="M5 12.55a11 11 0 0 1 14.08 0"></path>
                <path d="M8.5 15.5a6 6 0 0 1 7 0"></path>
                <circle cx="12" cy="18.5" r="1.2" fill="currentColor"></circle>
              </svg>
              <span>Приложить карту к терминалу</span>
            </button>
            <button class="secondary-btn" id="repeat-nfc-btn" type="button" style="display: none;">
              <span>Повторить оплату ↺</span>
            </button>
          </div>

        </div>

      </div>
    `;
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

    if (storeIcon) storeIcon.textContent = store.icon;
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
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;

      if (!this.audioCtx) {
        this.audioCtx = new AudioCtx();
      }

      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const ctx = this.audioCtx;
      const now = ctx.currentTime;

      const clickOsc = ctx.createOscillator();
      const clickGain = ctx.createGain();
      clickOsc.type = 'triangle';
      clickOsc.frequency.setValueAtTime(140, now);
      clickOsc.frequency.exponentialRampToValueAtTime(30, now + 0.05);

      clickGain.gain.setValueAtTime(0.3, now);
      clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      clickOsc.connect(clickGain);
      clickGain.connect(ctx.destination);
      clickOsc.start(now);
      clickOsc.stop(now + 0.06);

      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(1046.5, now + 0.03);

      gain1.gain.setValueAtTime(0, now);
      gain1.gain.linearRampToValueAtTime(0.28, now + 0.04);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now + 0.03);
      osc1.stop(now + 0.4);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1567.98, now + 0.09);

      gain2.gain.setValueAtTime(0, now);
      gain2.gain.linearRampToValueAtTime(0.32, now + 0.10);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.09);
      osc2.stop(now + 0.6);

    } catch (e) {
      console.warn('Web Audio playback error:', e);
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
    this.tapBtn.innerHTML = `<span>Считывание карты...</span>`;

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
          banner.innerHTML = `
            <span class="pos-state-icon">📡</span>
            <span class="pos-state-text text-cyan">Считывание чипа EMV...</span>
          `;
          banner.className = 'pos-state-banner state-reading';
        }
      }
    });

    tl.to(card, {
      y: deltaY + 6,
      duration: 0.35,
      onComplete: () => {
        if (banner) {
          banner.innerHTML = `
            <span class="pos-state-icon">🔒</span>
            <span class="pos-state-text text-amber">Авторизация банка...</span>
          `;
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
          banner.innerHTML = `
            <div class="pos-apple-check">
              <svg class="apple-check-svg" viewBox="0 0 32 32">
                <circle class="apple-check-circle" cx="16" cy="16" r="14" fill="none" />
                <path class="apple-check-tick" fill="none" stroke-linecap="round" stroke-linejoin="round" d="M9.5 16.5 L14 21 L22.5 12" />
              </svg>
            </div>
            <div class="pos-approved-text-col">
              <span class="pos-approved-main">ОДОБРЕНО</span>
              <span class="pos-approved-crypto">EMV ЧИП АВТОРИЗОВАН</span>
            </div>
          `;
          banner.className = 'pos-state-banner state-approved';
        }

        this.ejectReceipt();

        if (window.novaDynamicIsland) {
          window.novaDynamicIsland.showNotification({
            icon: '✓',
            title: `Оплата ${store.currency}${store.amount.toFixed(2)} успешна`,
            desc: `${store.name} • Кешбэк +${store.currency}${store.cashback.toFixed(2)}`,
            badge: '+3.5%'
          });
        }

        if (window.novaTransactionFeed) {
          window.novaTransactionFeed.addTransaction({
            merchant: store.name,
            cat: store.category,
            amount: `-${store.currency}${store.amount.toFixed(2)}`,
            isIncome: false,
            status: 'Оплачено NFC'
          });
        }
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
        this.tapBtn.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <path d="M5 12.55a11 11 0 0 1 14.08 0"></path>
            <path d="M8.5 15.5a6 6 0 0 1 7 0"></path>
            <circle cx="12" cy="18.5" r="1.2" fill="currentColor"></circle>
          </svg>
          <span>Приложить карту к терминалу</span>
        `;
      }
    });
  }

  playApprovalSound() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const now = ctx.currentTime;

      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(1318.5, now);
      gain1.gain.setValueAtTime(0, now);
      gain1.gain.linearRampToValueAtTime(0.25, now + 0.02);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.42);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1760, now + 0.08);
      gain2.gain.setValueAtTime(0, now + 0.08);
      gain2.gain.linearRampToValueAtTime(0.28, now + 0.10);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.08);
      osc2.stop(now + 0.65);
    } catch (e) {
      console.warn('Approval audio error:', e);
    }
  }

  triggerApprovalPulse() {
    const waves = this.container.querySelectorAll('.nfc-ring');
    waves.forEach((ring, i) => {
      gsap.killTweensOf(ring);
      gsap.fromTo(ring,
        { scale: 0.5, opacity: 0.95, borderColor: i === 1 ? '#38bdf8' : '#10b981', borderWidth: '2.5px' },
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
      { y: '0%', opacity: 1, duration: 0.85, ease: 'power3.out' }
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
      banner.innerHTML = `
        <div class="pos-pulse-ring"></div>
        <span class="pos-state-text">Приложите карту для оплаты</span>
      `;
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
