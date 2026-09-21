export class HolographicFoil {
  constructor(cardEl, options = {}) {
    this.card = cardEl;
    this.options = {
      enableMouse: true,
      intensity: 0.85,
      ...options
    };

    this.initLayers();
    if (this.options.enableMouse) {
      this.initEvents();
    }
  }

  initLayers() {
    let foil = this.card.querySelector('.card-holo-foil');
    if (!foil) {
      foil = document.createElement('div');
      foil.className = 'card-holo-foil';
      const inner = this.card.querySelector('.card-inner') || this.card;
      const front = inner.querySelector('.card-front') || inner;
      front.appendChild(foil);
    }
    this.foilEl = foil;

    let glare = this.card.querySelector('.card-hologram-glare') || this.card.querySelector('.custom-card-glare');
    this.glareEl = glare;
  }

  initEvents() {
    this.card.addEventListener('mousemove', (e) => {
      const rect = this.card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      this.update(x, y, rect.width, rect.height);
    });

    this.card.addEventListener('mouseleave', () => {
      this.reset();
    });
  }

  getCardTheme() {
    if (this.card.classList.contains('card-platinum') || this.card.dataset.card === 'titanium') return 'silver';
    if (this.card.classList.contains('card-obsidian') || this.card.dataset.card === 'obsidian') return 'black';
    if (this.card.classList.contains('card-emerald') || this.card.dataset.card === 'emerald') return 'emerald';
    return 'hologram';
  }

  update(x, y, width, height) {
    const xPct = Math.max(0, Math.min(100, (x / width) * 100));
    const yPct = Math.max(0, Math.min(100, (y / height) * 100));

    const dx = xPct - 50;
    const dy = yPct - 50;
    const angle = Math.round(Math.atan2(dy, dx) * (180 / Math.PI) + 90);

    this.updateParametric(angle, xPct, yPct, 1.0);
  }

  updateParametric(angleDeg, xPct, yPct, opacity = 1) {
    if (this.foilEl) {
      this.foilEl.style.display = 'none';
      this.foilEl.style.opacity = '0';
      this.foilEl.style.background = 'none';
    }

    if (this.glareEl) {
      this.glareEl.style.opacity = `${opacity * 0.72}`;
      this.glareEl.style.background = `
        radial-gradient(circle at ${xPct.toFixed(1)}% ${yPct.toFixed(1)}%, 
          rgba(255, 255, 255, 0.75) 0%, 
          rgba(255, 255, 255, 0.22) 26%, 
          rgba(255, 255, 255, 0.04) 52%, 
          transparent 75%
        )
      `;
    }
  }

  reset() {
    if (this.foilEl) {
      this.foilEl.style.display = 'none';
      this.foilEl.style.opacity = '0';
      this.foilEl.style.background = 'none';
    }
    if (this.glareEl) {
      this.glareEl.style.opacity = '0.22';
      this.glareEl.style.background = `
        radial-gradient(circle at 50% 40%, 
          rgba(255, 255, 255, 0.35) 0%, 
          rgba(255, 255, 255, 0.08) 35%, 
          transparent 70%
        )
      `;
    }
  }
}
