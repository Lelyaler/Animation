import confetti from 'canvas-confetti';
import gsap from 'gsap';
import { HolographicFoil } from '../animations/holographicFoil.js';

export class CardCustomizer {
  constructor(containerEl) {
    this.container = containerEl;
    this.currentMaterial = 'obsidian';
    this.isFrozen = false;

    this.initElements();
    this.initHolo();
    this.initEvents();
  }

  initElements() {
    this.cardEl = this.container.querySelector('#custom-card-preview');
    this.nameInput = this.container.querySelector('#cardholder-name-input');
    this.cardholderLabel = this.container.querySelector('#card-name-display');
    this.materialButtons = this.container.querySelectorAll('.mat-btn');
    this.freezeBtn = this.container.querySelector('#freeze-card-btn');
    this.orderBtn = this.container.querySelector('#order-card-btn');
    this.frostOverlay = this.container.querySelector('#card-frost-overlay');
    this.laserScanner = this.container.querySelector('#laser-scanner');
  }

  initHolo() {
    if (this.cardEl) {
      this.holoFoil = new HolographicFoil(this.cardEl, { enableMouse: true });
    }
  }

  initEvents() {
    if (this.cardEl) {
      const glare = this.cardEl.querySelector('.custom-card-glare');

      this.cardEl.addEventListener('mousemove', (e) => {
        const rect = this.cardEl.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotX = ((y - centerY) / centerY) * -12;
        const rotY = ((x - centerX) / centerX) * 12;

        this.cardEl.style.transform = `perspective(1000px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`;

        if (glare) {
          glare.style.opacity = '1';
          glare.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 65%)`;
        }
      });

      this.cardEl.addEventListener('mouseleave', () => {
        this.cardEl.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
        if (glare) glare.style.opacity = '0';
      });
    }

    if (this.nameInput && this.cardholderLabel) {
      this.nameInput.addEventListener('input', (e) => {
        const val = e.target.value.toUpperCase().slice(0, 20);
        e.target.value = val;
        this.cardholderLabel.textContent = val.trim().length > 0 ? val : 'YOUR NAME';
      });
    }

    this.materialButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const mat = btn.dataset.mat;
        if (mat) {
          this.materialButtons.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.setMaterial(mat);
        }
      });
    });

    if (this.freezeBtn && this.frostOverlay) {
      this.freezeBtn.addEventListener('click', () => {
        this.isFrozen = !this.isFrozen;

        if (this.isFrozen && this.laserScanner) {
          gsap.fromTo(this.laserScanner,
            { top: '0%', opacity: 1, scaleX: 1 },
            { top: '100%', opacity: 0, duration: 0.65, ease: 'power2.inOut' }
          );
        }

        this.frostOverlay.classList.toggle('is-frozen', this.isFrozen);
        this.freezeBtn.classList.toggle('active', this.isFrozen);
        this.freezeBtn.querySelector('.btn-text').textContent = this.isFrozen ? 'Разморозить карту' : 'Заморозить карту';
      });
    }

    if (this.orderBtn) {
      this.orderBtn.addEventListener('click', () => {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.7 }
        });

        const btn = this.orderBtn;
        btn.innerHTML = `<span>✓ Карта успешно выпущена!</span>`;
        btn.classList.add('btn-success');

        setTimeout(() => {
          btn.innerHTML = `<span>Выпустить карту</span>`;
          btn.classList.remove('btn-success');
        }, 3000);
      });
    }
  }

  setMaterial(matKey) {
    this.currentMaterial = matKey;
    this.cardEl.className = `custom-card-body card-mat-${matKey}`;

    gsap.fromTo(this.cardEl, 
      { scale: 0.96 }, 
      { scale: 1.0, duration: 0.35, ease: 'back.out(2)' }
    );
  }
}
