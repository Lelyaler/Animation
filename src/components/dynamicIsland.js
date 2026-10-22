import gsap from 'gsap';
import { ICONS } from './icons.js';

export class DynamicIsland {
  constructor(containerEl) {
    this.container = containerEl;
    this.isExpanded = false;
    this.notifications = [
      { icon: 'card', title: 'Платеж исполнен: $289.00', desc: 'JetBrains EMEA • Карта Obsidian', badge: 'SEPA' },
      { icon: 'shield', title: 'Двухфакторная защита активна', desc: 'Сессия подтверждена FIDO2 Token', badge: 'Безопасно' },
      { icon: 'chart', title: 'Курс EUR/USD обновлен', desc: '1 USD = 0.9200 EUR (Межбанк)', badge: 'ECB' },
      { icon: 'package', title: 'Карта в доставке DHL Express', desc: 'Трек-номер отправления: #9482-NL40', badge: 'Курьер' }
    ];
    this.currentIndex = 0;
    this.init();
  }

  init() {
    this.pill = this.container.querySelector('#island-pill');
    this.iconEl = this.container.querySelector('#island-icon');
    this.titleEl = this.container.querySelector('#island-title');
    this.descEl = this.container.querySelector('#island-desc');
    this.badgeEl = this.container.querySelector('#island-badge');

    if (!this.pill) return;

    this.pill.addEventListener('click', () => {
      this.toggleExpand();
    });

    this.pill.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.toggleExpand();
      }
    });

    document.addEventListener('nova:notification', (e) => {
      if (e.detail) {
        this.showNotification(e.detail);
      }
    });

    this.startNotificationCycle();
  }

  toggleExpand() {
    this.isExpanded = !this.isExpanded;
    this.pill.classList.toggle('is-expanded', this.isExpanded);

    gsap.fromTo(this.pill,
      { scale: 0.95 },
      { scale: 1, duration: 0.4, ease: 'back.out(2)' }
    );
  }

  showNotification(item) {
    if (!this.pill) return;

    const iconRenderer = ICONS[item.icon];
    const iconHtml = typeof iconRenderer === 'function' ? iconRenderer(13) : item.icon;

    if (this.iconEl) this.iconEl.innerHTML = iconHtml;
    if (this.titleEl) this.titleEl.textContent = item.title;
    if (this.descEl) this.descEl.textContent = item.desc;
    if (this.badgeEl) this.badgeEl.textContent = item.badge;

    this.pill.classList.add('is-expanded');

    gsap.fromTo(this.pill,
      { y: -10, scale: 0.96 },
      { y: 0, scale: 1, duration: 0.5, ease: 'back.out(1.8)' }
    );

    setTimeout(() => {
      if (!this.pill.matches(':hover')) {
        this.pill.classList.remove('is-expanded');
      }
    }, 4500);
  }

  startNotificationCycle() {
    setInterval(() => {
      this.currentIndex = (this.currentIndex + 1) % this.notifications.length;
      this.showNotification(this.notifications[this.currentIndex]);
    }, 9000);
  }
}
