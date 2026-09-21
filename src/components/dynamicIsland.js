import gsap from 'gsap';

export class DynamicIsland {
  constructor(containerEl) {
    this.container = containerEl;
    this.isExpanded = false;
    this.notifications = [
      { icon: '⚡', title: 'Кешбэк +$41.96 начислен', desc: 'Apple Store • Карта Titanium', badge: '+3.5%' },
      { icon: '🛡️', title: 'Безопасность активна', desc: 'Все счета защищены биометрией', badge: '100%' },
      { icon: '📈', title: 'Курс EUR/USD обновлен', desc: '1 USD = 0.9200 EUR (+0.14%)', badge: 'Биржа' },
      { icon: '✦', title: 'NOVA Metal доставлена', desc: 'Бесплатный выпуск активирован', badge: 'VIP' }
    ];
    this.currentIndex = 0;
    this.init();
  }

  init() {
    this.container.innerHTML = `
      <div class="island-pill" id="island-pill">
        <div class="island-collapsed-content">
          <span class="island-pulse-dot"></span>
          <span class="island-brand-label">NOVA Live Activity</span>
        </div>
        <div class="island-expanded-content">
          <div class="island-icon-box" id="island-icon">⚡</div>
          <div class="island-text-group">
            <span class="island-title" id="island-title">Кешбэк +$41.96 начислен</span>
            <span class="island-desc" id="island-desc">Apple Store • Карта Titanium</span>
          </div>
          <span class="island-badge" id="island-badge">+3.5%</span>
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
    this.iconEl.textContent = item.icon;
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
