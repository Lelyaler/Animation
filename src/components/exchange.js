import gsap from 'gsap';

export const RATES = {
  USD: 1.0,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 154.5
};

export const SYMBOLS = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥'
};

export class ExchangeCalculator {
  constructor(containerEl) {
    this.container = containerEl;
    this.fromCurrency = 'USD';
    this.toCurrency = 'EUR';
    this.fromAmount = 1000;

    this.initElements();
    this.initEvents();
    this.calculate();
    this.drawChart();
  }

  initElements() {
    this.fromInput = this.container.querySelector('#exchange-from-input');
    this.toInput = this.container.querySelector('#exchange-to-input');
    this.fromSelect = this.container.querySelector('#from-currency-select');
    this.toSelect = this.container.querySelector('#to-currency-select');
    this.rateInfoEl = this.container.querySelector('#exchange-rate-text');
    this.chartContainer = this.container.querySelector('#exchange-chart-svg-wrap');
    this.periodButtons = this.container.querySelectorAll('.chart-period-btn');
    this.swapBtn = this.container.querySelector('#calc-swap-btn');
  }

  initEvents() {
    if (this.swapBtn) {
      this.swapBtn.addEventListener('click', () => {
        gsap.to(this.swapBtn, {
          rotation: '+=180',
          duration: 0.45,
          ease: 'back.out(2)'
        });

        const tempCurr = this.fromCurrency;
        this.fromCurrency = this.toCurrency;
        this.toCurrency = tempCurr;

        if (this.fromSelect) this.fromSelect.value = this.fromCurrency;
        if (this.toSelect) this.toSelect.value = this.toCurrency;

        this.calculate();
        this.drawChart();
      });
    }

    if (this.fromInput) {
      this.fromInput.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value) || 0;
        this.fromAmount = val;
        this.calculate();
      });
    }

    if (this.fromSelect) {
      this.fromSelect.addEventListener('change', (e) => {
        this.fromCurrency = e.target.value;
        this.calculate();
        this.drawChart();
      });
    }

    if (this.toSelect) {
      this.toSelect.addEventListener('change', (e) => {
        this.toCurrency = e.target.value;
        this.calculate();
        this.drawChart();
      });
    }

    this.periodButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        this.periodButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.drawChart();
      });
    });
  }

  calculate() {
    const rateFrom = RATES[this.fromCurrency];
    const rateTo = RATES[this.toCurrency];
    const unitRate = rateTo / rateFrom;
    const targetVal = this.fromAmount * unitRate;

    const currentVal = parseFloat(this.toInput.value.replace(/[^0-9.-]/g, '')) || 0;
    const obj = { val: currentVal };

    gsap.to(obj, {
      val: targetVal,
      duration: 0.5,
      ease: 'power2.out',
      onUpdate: () => {
        const decimals = this.toCurrency === 'JPY' ? 0 : 2;
        this.toInput.value = `${SYMBOLS[this.toCurrency]} ${obj.val.toLocaleString('ru-RU', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
      }
    });

    if (this.rateInfoEl) {
      this.rateInfoEl.textContent = `1 ${this.fromCurrency} = ${unitRate.toFixed(4)} ${this.toCurrency}`;
    }
  }

  drawChart() {
    if (!this.chartContainer) return;

    const pointsCount = 16;
    const baseRate = RATES[this.toCurrency] / RATES[this.fromCurrency];
    const history = [];

    for (let i = 0; i < pointsCount; i++) {
      const variation = (Math.sin(i * 0.7) * 0.015) + ((i / pointsCount) * 0.02) - 0.01;
      history.push(baseRate * (1 + variation));
    }

    const min = Math.min(...history);
    const max = Math.max(...history);
    const range = (max - min) || 0.001;

    const width = 340;
    const height = 110;
    const padding = 16;

    const pts = history.map((val, i) => {
      const x = padding + (i / (pointsCount - 1)) * (width - padding * 2);
      const y = height - padding - ((val - min) / range) * (height - padding * 2);
      return { x, y, val };
    });

    let pathD = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i];
      const p1 = pts[i + 1];
      const cpX = (p0.x + p1.x) / 2;
      pathD += ` C ${cpX} ${p0.y}, ${cpX} ${p1.y}, ${p1.x} ${p1.y}`;
    }

    const areaD = `${pathD} L ${pts[pts.length - 1].x} ${height} L ${pts[0].x} ${height} Z`;

    const svg = `
      <svg class="exchange-svg" viewBox="0 0 ${width} ${height}">
        <defs>
          <linearGradient id="exGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#2563eb" stop-opacity="0.14" />
            <stop offset="100%" stop-color="#2563eb" stop-opacity="0.0" />
          </linearGradient>
        </defs>
        <path class="ex-area" d="${areaD}" fill="url(#exGradient)" />
        <path class="ex-curve" d="${pathD}" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round" />
        <circle cx="${pts[pts.length - 1].x}" cy="${pts[pts.length - 1].y}" r="4" fill="#2563eb" stroke="#ffffff" stroke-width="2">
          <animate attributeName="r" values="4;5.5;4" dur="2s" repeatCount="indefinite" />
        </circle>
      </svg>
    `;

    this.chartContainer.innerHTML = svg;

    const curve = this.chartContainer.querySelector('.ex-curve');
    if (curve) {
      const len = curve.getTotalLength();
      gsap.fromTo(curve,
        { strokeDasharray: len, strokeDashoffset: len },
        { strokeDashoffset: 0, duration: 0.9, ease: 'power2.out' }
      );
    }
  }
}
