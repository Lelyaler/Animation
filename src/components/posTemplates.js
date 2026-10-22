import { ICONS } from './icons.js';

/**
 * State banner templates for the POS Terminal screen
 */
export const posTemplates = {
  idleBanner: () => `
    <div class="pos-pulse-ring"></div>
    <span class="pos-state-text">Приложите карту для оплаты</span>
  `,

  readingBanner: () => `
    <span class="pos-state-icon">📡</span>
    <span class="pos-state-text text-cyan">Считывание чипа EMV...</span>
  `,

  authorizingBanner: () => `
    <span class="pos-state-icon">${ICONS.lock(15)}</span>
    <span class="pos-state-text text-amber">Авторизация банка...</span>
  `,

  approvedBanner: () => `
    <div class="pos-apple-check">
      ${ICONS.appleCheck()}
    </div>
    <div class="pos-approved-text-col">
      <span class="pos-approved-main">ОДОБРЕНО</span>
      <span class="pos-approved-crypto">EMV ЧИП АВТОРИЗОВАН</span>
    </div>
  `,

  tapButton: (isBusy = false) => {
    if (isBusy) {
      return `<span>Считывание карты...</span>`;
    }
    return `
      ${ICONS.nfcTap(20)}
      <span>Приложить карту к терминалу</span>
    `;
  },

  storePill: (store, index, isActive = false) => `
    <button class="pos-store-pill ${isActive ? 'active' : ''}" data-idx="${index}" type="button" aria-label="Магазин ${store.name}, ${store.category}, сумма ${store.currency}${store.amount}">
      <span>${store.icon}</span>
      <span>${store.shortName || store.name.split(' ')[0]} • ${store.currency}${store.amount}</span>
    </button>
  `
};
