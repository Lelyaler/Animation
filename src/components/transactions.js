import gsap from 'gsap';

export const SAMPLE_TX = [
  { merchant: 'Apple Store', cat: 'Электроника', amount: '-$1,199.00', isIncome: false, icon: 'smartphone', status: 'Оплачено' },
  { merchant: 'Stripe Payout', cat: 'Доход от клиента', amount: '+$3,450.00', isIncome: true, icon: 'arrow-down-left', status: 'Получено' },
  { merchant: 'Figma Team', cat: 'Подписка SaaS', amount: '-$45.00', isIncome: false, icon: 'layers', status: 'Оплачено' },
  { merchant: 'Uber Premier', cat: 'Транспорт', amount: '-$28.50', isIncome: false, icon: 'car', status: 'Оплачено' },
  { merchant: 'Airbnb Tokyo', cat: 'Путешествие', amount: '-$420.00', isIncome: false, icon: 'home', status: 'Оплачено' },
  { merchant: 'Spotify Family', cat: 'Музыка', amount: '-$16.99', isIncome: false, icon: 'music', status: 'Оплачено' },
  { merchant: 'Upwork Global', cat: 'Гонорар фриланс', amount: '+$1,820.00', isIncome: true, icon: 'arrow-down-left', status: 'Получено' }
];

export class TransactionFeed {
  constructor(listContainer) {
    this.container = listContainer;
    this.txPool = [...SAMPLE_TX];
    this.activeFilter = 'all';
    this.init();
  }

  init() {
    this.initFilterTabs();
    this.renderInitial();
    this.startLiveStream();
  }

  initFilterTabs() {
    const filterPills = document.querySelectorAll('.tx-pill-btn');
    filterPills.forEach(btn => {
      btn.addEventListener('click', () => {
        filterPills.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeFilter = btn.dataset.filter;
        this.renderFiltered();
      });
    });
  }

  getFilteredTx() {
    if (this.activeFilter === 'income') {
      return this.txPool.filter(t => t.isIncome);
    }
    if (this.activeFilter === 'expense') {
      return this.txPool.filter(t => !t.isIncome);
    }
    return this.txPool;
  }

  renderFiltered() {
    const list = this.getFilteredTx().slice(0, 4);
    this.container.innerHTML = list.map(tx => this.createRowHtml(tx)).join('');
    gsap.fromTo(this.container.children,
      { opacity: 0, y: -10 },
      { opacity: 1, y: 0, duration: 0.3, stagger: 0.06, ease: 'power2.out' }
    );
  }

  renderInitial() {
    this.renderFiltered();
  }

  createRowHtml(tx) {
    const isPlus = tx.isIncome;
    const amountClass = isPlus ? 'tx-amount-plus' : 'tx-amount-minus';

    return `
      <div class="tx-row">
        <div class="tx-left">
          <div class="tx-icon-box ${isPlus ? 'icon-plus' : ''}">
            <span>${isPlus ? '↓' : '↑'}</span>
          </div>
          <div class="tx-details">
            <span class="tx-merchant">${tx.merchant}</span>
            <span class="tx-cat">${tx.cat} • Только что</span>
          </div>
        </div>
        <div class="tx-right">
          <span class="tx-amount ${amountClass}">${tx.amount}</span>
          <span class="tx-status-tag">${tx.status}</span>
        </div>
      </div>
    `;
  }

  startLiveStream() {
    setInterval(() => {
      const randomTx = this.txPool[Math.floor(Math.random() * this.txPool.length)];
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = this.createRowHtml(randomTx);
      const newEl = tempDiv.firstElementChild;

      this.container.prepend(newEl);

      gsap.fromTo(newEl,
        { opacity: 0, y: -24, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'back.out(1.5)' }
      );

      if (this.container.children.length > 4) {
        const last = this.container.lastElementChild;
        gsap.to(last, {
          opacity: 0,
          height: 0,
          marginBottom: 0,
          paddingTop: 0,
          paddingBottom: 0,
          duration: 0.3,
          onComplete: () => last.remove()
        });
      }
    }, 4500);
  }

  addTransaction(tx) {
    this.txPool.unshift(tx);
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = this.createRowHtml(tx);
    const newEl = tempDiv.firstElementChild;

    this.container.prepend(newEl);

    gsap.fromTo(newEl,
      { opacity: 0, y: -30, scale: 0.9, backgroundColor: 'rgba(16, 185, 129, 0.15)' },
      { opacity: 1, y: 0, scale: 1, backgroundColor: 'transparent', duration: 0.7, ease: 'back.out(1.8)' }
    );

    if (this.container.children.length > 4) {
      const last = this.container.lastElementChild;
      if (last) {
        gsap.to(last, {
          opacity: 0,
          height: 0,
          duration: 0.3,
          onComplete: () => last.remove()
        });
      }
    }
  }
}
