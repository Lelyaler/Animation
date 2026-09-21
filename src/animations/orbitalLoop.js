import gsap from 'gsap';
import { HolographicFoil } from './holographicFoil.js';

export class OrbitalLoop {
  constructor(stageEl) {
    this.stage = stageEl;
    this.cards = stageEl.querySelectorAll('.orbit-card');
    this.numCards = this.cards.length;

    this.radiusX = 340;
    this.radiusZ = 190;
    this.tiltY = 32;
    this.speed = 0.46;

    this.mouseOffset = { x: 0, y: 0 };
    this.targetMouse = { x: 0, y: 0 };

    this.updateDimensions();

    this.holoFoils = Array.from(this.cards).map(card => new HolographicFoil(card, { enableMouse: false }));

    this.dragAngle = 0;
    this.dragVelocity = 0;
    this.isDragging = false;
    this.hasDragged = false;
    this.lastMouseX = 0;

    this.totalElapsed = 0;
    this.lastFrameTime = performance.now();

    this.inspectedCard = null;
    this.isFlipped = false;
    this.inspectBar = document.getElementById('orbit-inspect-bar');
    this.closeBtn = document.getElementById('inspect-close-btn');

    this.initEvents();
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  updateDimensions() {
    const w = window.innerWidth;
    if (w < 480) {
      this.radiusX = 125;
      this.radiusZ = 70;
      this.cardScale = 0.74;
      this.tiltY = 20;
    } else if (w < 768) {
      this.radiusX = 180;
      this.radiusZ = 100;
      this.cardScale = 0.84;
      this.tiltY = 24;
    } else if (w < 1024) {
      this.radiusX = 250;
      this.radiusZ = 140;
      this.cardScale = 0.92;
      this.tiltY = 28;
    } else {
      this.radiusX = 340;
      this.radiusZ = 190;
      this.cardScale = 1.0;
      this.tiltY = 32;
    }
  }

  initEvents() {
    window.addEventListener('resize', () => this.updateDimensions(), { passive: true });

    window.addEventListener('mousemove', (e) => {
      if (this.isDragging && !this.inspectedCard) {
        const deltaX = e.clientX - this.lastMouseX;
        if (Math.abs(deltaX) > 3) this.hasDragged = true;
        this.lastMouseX = e.clientX;
        const dragDelta = (deltaX / window.innerWidth) * Math.PI * 2.4;
        this.dragAngle += dragDelta;
        this.dragVelocity = dragDelta;
      } else {
        this.targetMouse.x = (e.clientX / window.innerWidth - 0.5) * 36;
        this.targetMouse.y = (e.clientY / window.innerHeight - 0.5) * 22;
      }
    });

    this.stage.addEventListener('mousedown', (e) => {
      if (this.inspectedCard) return;
      this.isDragging = true;
      this.hasDragged = false;
      this.lastMouseX = e.clientX;
      this.dragVelocity = 0;
      this.stage.classList.add('is-grabbing');
    });

    window.addEventListener('mouseup', () => {
      if (this.isDragging) {
        this.isDragging = false;
        this.stage.classList.remove('is-grabbing');
      }
    });

    this.stage.addEventListener('touchstart', (e) => {
      if (this.inspectedCard) return;
      this.isDragging = true;
      this.hasDragged = false;
      this.lastMouseX = e.touches[0].clientX;
      this.dragVelocity = 0;
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (this.inspectedCard || !this.isDragging) return;
      const deltaX = e.touches[0].clientX - this.lastMouseX;
      if (Math.abs(deltaX) > 3) this.hasDragged = true;
      this.lastMouseX = e.touches[0].clientX;
      const dragDelta = (deltaX / window.innerWidth) * Math.PI * 2.4;
      this.dragAngle += dragDelta;
      this.dragVelocity = dragDelta;
    }, { passive: true });

    window.addEventListener('touchend', () => {
      this.isDragging = false;
    });

    this.cards.forEach((card) => {
      card.addEventListener('click', (e) => {
        if (this.hasDragged) return;
        e.stopPropagation();

        if (this.inspectedCard === card) {
          this.flipCard(card);
        } else {
          this.enterInspectMode(card);
        }
      });
    });

    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.exitInspectMode();
      });
    }

    window.addEventListener('click', (e) => {
      if (this.inspectedCard && !e.target.closest('.orbit-card') && !e.target.closest('#orbit-inspect-bar')) {
        this.exitInspectMode();
      }
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.inspectedCard) {
        this.exitInspectMode();
      }
    });
  }

  enterInspectMode(card) {
    this.inspectedCard = card;
    this.isFlipped = false;
    card.classList.remove('is-flipped');
    card.classList.add('is-inspected');
    this.stage.classList.add('has-inspected');

    if (this.inspectBar) {
      this.inspectBar.classList.add('active');
    }

    card.style.opacity = '1';
    card.style.zIndex = '999';

    this.cards.forEach((otherCard) => {
      if (otherCard !== card) {
        gsap.to(otherCard, {
          opacity: 0,
          scale: 0.6,
          duration: 0.35,
          ease: 'power2.out'
        });
      }
    });

    gsap.fromTo(card,
      { scale: 1 },
      { scale: 1.15, duration: 0.45, ease: 'back.out(1.5)' }
    );
  }

  flipCard(card) {
    this.isFlipped = !this.isFlipped;
    card.classList.toggle('is-flipped', this.isFlipped);

    const inner = card.querySelector('.card-inner');
    if (inner) {
      gsap.to(inner, {
        rotateY: this.isFlipped ? 180 : 0,
        duration: 0.7,
        ease: 'back.out(1.4)'
      });
    }
  }

  exitInspectMode() {
    if (!this.inspectedCard) return;

    const card = this.inspectedCard;
    this.inspectedCard = null;
    this.isFlipped = false;

    card.classList.remove('is-inspected', 'is-flipped');
    this.stage.classList.remove('has-inspected');

    if (this.inspectBar) {
      this.inspectBar.classList.remove('active');
    }

    const inner = card.querySelector('.card-inner');
    if (inner) {
      gsap.to(inner, {
        rotateY: 0,
        duration: 0.4,
        ease: 'power2.out'
      });
    }

    this.cards.forEach((otherCard) => {
      gsap.to(otherCard, {
        opacity: 1,
        scale: 1,
        duration: 0.4,
        ease: 'power2.out'
      });
    });
  }

  animate() {
    requestAnimationFrame(this.animate);

    const now = performance.now();
    const delta = Math.min(0.1, (now - this.lastFrameTime) * 0.001);
    this.lastFrameTime = now;

    this.mouseOffset.x += (this.targetMouse.x - this.mouseOffset.x) * 0.06;
    this.mouseOffset.y += (this.targetMouse.y - this.mouseOffset.y) * 0.06;

    if (!this.inspectedCard) {
      this.totalElapsed += delta * this.speed;

      if (!this.isDragging) {
        this.dragAngle += this.dragVelocity;
        this.dragVelocity *= 0.94;
      }
    }

    const elapsed = this.totalElapsed + this.dragAngle;

    this.cards.forEach((card, index) => {
      const foil = this.holoFoils[index];

      if (this.inspectedCard === card) {
        const inspectScale = window.innerWidth < 480 ? 0.92 : (window.innerWidth < 768 ? 1.05 : 1.15);
        card.style.transform = `translate3d(0px, -35px, 140px) scale(${inspectScale}) rotateX(${this.mouseOffset.y * 0.4}deg) rotateY(${this.mouseOffset.x * 0.4}deg)`;
        card.style.zIndex = '999';
        card.style.opacity = '1';
        card.style.pointerEvents = 'auto';

        if (foil) {
          const xPct = 50 + this.mouseOffset.x * 1.5;
          const yPct = 50 + this.mouseOffset.y * 1.5;
          const deg = (this.mouseOffset.x * 4 + this.mouseOffset.y * 4 + 180) % 360;
          foil.updateParametric(deg, xPct, yPct, 0.85);
        }
        return;
      }

      if (this.inspectedCard) {
        card.style.opacity = '0';
        card.style.pointerEvents = 'none';
        return;
      }

      card.style.pointerEvents = 'auto';

      const angle = elapsed + (index * 2 * Math.PI) / this.numCards;

      const x = Math.sin(angle) * this.radiusX + this.mouseOffset.x;
      const z = Math.cos(angle) * this.radiusZ;
      const y = Math.sin(angle) * this.tiltY + Math.cos(angle) * 16 - this.mouseOffset.y - 28;

      const depth = (z + this.radiusZ) / (2 * this.radiusZ);

      const scale = (0.74 + depth * 0.26) * (this.cardScale || 1.0);
      const opacity = 0.92 + depth * 0.08;
      const zIndex = Math.round(depth * 100);

      const rotY = -Math.sin(angle) * 18 + this.mouseOffset.x * 0.35;
      const rotX = 14 - Math.cos(angle) * 8 + this.mouseOffset.y * 0.35;
      const rotZ = Math.sin(angle) * 5;

      card.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, ${z.toFixed(1)}px) scale(${scale.toFixed(3)}) rotateX(${rotX.toFixed(1)}deg) rotateY(${rotY.toFixed(1)}deg) rotateZ(${rotZ.toFixed(1)}deg)`;
      card.style.opacity = opacity.toFixed(2);
      card.style.zIndex = zIndex;

      if (foil) {
        const foilAngle = (angle * (180 / Math.PI) * 1.6 + 360) % 360;
        const glintX = 50 + Math.sin(angle) * 45;
        const glintY = 40 + Math.cos(angle) * 35;
        const foilOpacity = 0.35 + depth * 0.35;
        foil.updateParametric(foilAngle, glintX, glintY, foilOpacity);
      }
    });
  }
}
