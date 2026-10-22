import gsap from 'gsap';

const ICONS = {
  card: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="3" ry="3"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>`,
  shield: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`,
  chart: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>`,
  package: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>`,
  check: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`
};

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
    this.container.innerHTML = `
      <div class="island-pill" id="island-pill" role="button" tabindex="0" aria-label="Интерактивный индикатор статуса NOVA">
        <div class="island-collapsed-content">
          <span class="island-pulse-dot"></span>
          <span class="island-brand-label">SEPA Instant • Live</span>
        </div>
        <div class="island-expanded-content">
          <div class="island-icon-box" id="island-icon">${ICONS.card}</div>
          <div class="island-text-group">
            <span class="island-title" id="island-title">Платеж исполнен: $289.00</span>
            <span class="island-desc" id="island-desc">JetBrains EMEA • Карта Obsidian</span>
          </div>
          <span class="island-badge" id="island-badge">SEPA</span>
        </div>
      </div>
    `;

    this.pill = this.container.querySelector('#island-pill');
    this.iconEl = this.container.querySelector('#island-icon');
    this.titleEl = this.container.querySelector('#island-title');
    this.descEl = this.container.querySelector('#island-desc');
    this.badgeEl = this.container.querySelector('#island-badge');

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
    const iconHtml = ICONS[item.icon] || item.icon;
    this.iconEl.innerHTML = iconHtml;
    this.titleEl.textContent = item.title;
    this.descEl.textContent = item.desc;
    this.badgeEl.textContent = item.badge;

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
