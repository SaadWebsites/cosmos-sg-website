/**
 * COSMOS SG - Interactive Cashew Physics & Floating Engine
 * High-performance HTML5 Canvas animation featuring 3D-shaded cashew nuts,
 * cursor-repulsion physics, ambient drifting, and particle glow.
 */

(function () {
  'use strict';

  class CashewParticleSystem {
    constructor(canvasId) {
      this.canvas = document.getElementById(canvasId);
      if (!this.canvas) return;

      this.ctx = this.canvas.getContext('2d');
      this.cashews = [];
      this.dustParticles = [];
      this.mouse = { x: -1000, y: -1000, vx: 0, vy: 0, lastX: 0, lastY: 0, isHovering: false };
      this.isActive = true;
      this.mode = 'float'; // 'float' or 'rain'
      this.selectedCashew = null;

      this.init();
    }

    init() {
      this.resize();
      window.addEventListener('resize', () => this.resize(), { passive: true });

      // Mouse & touch interaction
      const heroArea = document.querySelector('.hero-section') || this.canvas;
      heroArea.addEventListener('mousemove', (e) => this.onMouseMove(e), { passive: true });
      heroArea.addEventListener('mouseleave', () => this.onMouseLeave(), { passive: true });
      heroArea.addEventListener('click', (e) => this.onClick(e));

      heroArea.addEventListener('touchmove', (e) => {
        if (e.touches.length > 0) {
          const rect = this.canvas.getBoundingClientRect();
          this.mouse.x = e.touches[0].clientX - rect.left;
          this.mouse.y = e.touches[0].clientY - rect.top;
          this.mouse.isHovering = true;
        }
      }, { passive: true });

      heroArea.addEventListener('touchend', () => this.onMouseLeave(), { passive: true });

      // Performance: Intersection Observer to pause when offscreen
      if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            this.isActive = entry.isIntersecting;
            if (this.isActive) this.loop();
          });
        }, { threshold: 0.1 });
        observer.observe(this.canvas);
      }

      this.spawnCashews();
      this.spawnDust();
      this.loop();
    }

    resize() {
      const parent = this.canvas.parentElement;
      const width = parent.clientWidth || window.innerWidth;
      const height = parent.clientHeight || 750;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      this.canvas.width = width * dpr;
      this.canvas.height = height * dpr;
      this.canvas.style.width = width + 'px';
      this.canvas.style.height = height + 'px';
      this.ctx.scale(dpr, dpr);

      this.width = width;
      this.height = height;

      if (this.cashews.length === 0) {
        this.spawnCashews();
      }
    }

    onMouseMove(e) {
      const rect = this.canvas.getBoundingClientRect();
      const currentX = e.clientX - rect.left;
      const currentY = e.clientY - rect.top;

      this.mouse.vx = currentX - this.mouse.lastX;
      this.mouse.vy = currentY - this.mouse.lastY;
      this.mouse.lastX = currentX;
      this.mouse.lastY = currentY;
      this.mouse.x = currentX;
      this.mouse.y = currentY;
      this.mouse.isHovering = true;
    }

    onMouseLeave() {
      this.mouse.x = -1000;
      this.mouse.y = -1000;
      this.mouse.isHovering = false;
    }

    onClick(e) {
      const rect = this.canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      for (let i = this.cashews.length - 1; i >= 0; i--) {
        const c = this.cashews[i];
        const dist = Math.hypot(clickX - c.x, clickY - c.y);
        if (dist < c.size * 1.5) {
          // Burst animation
          this.triggerSparks(c.x, c.y);
          c.vy = -5;
          c.rotSpeed = (Math.random() - 0.5) * 0.15;
          this.showCashewBadge(c, e.clientX, e.clientY);
          break;
        }
      }
    }

    triggerSparks(x, y) {
      for (let i = 0; i < 16; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 4;
        this.dustParticles.push({
          x: x,
          y: y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 2 + Math.random() * 3,
          alpha: 1,
          color: '#FCE082',
          decay: 0.03 + Math.random() * 0.02
        });
      }
    }

    showCashewBadge(cashew, clientX, clientY) {
      let badge = document.getElementById('cashew-click-toast');
      if (!badge) {
        badge = document.createElement('div');
        badge.id = 'cashew-click-toast';
        badge.className = 'cashew-interactive-toast';
        document.body.appendChild(badge);
      }

      badge.innerHTML = `
        <div class="toast-header">
          <span class="gold-dot"></span>
          <strong>Grade ${cashew.grade}</strong>
          <span class="toast-tag">${cashew.type}</span>
        </div>
        <div class="toast-body">
          <p><strong>AFI Count:</strong> ${cashew.count}</p>
          <p><strong>Moisture:</strong> 3.8% (Target &lt; 5%)</p>
          <p><strong>Broken Tolerance:</strong> &lt; 3%</p>
        </div>
        <small class="toast-note">Click "Wholesale Quote" to order this grade</small>
      `;

      badge.style.left = Math.min(clientX + 10, window.innerWidth - 240) + 'px';
      badge.style.top = Math.min(clientY - 30, window.innerHeight - 150) + 'px';
      badge.classList.add('visible');

      clearTimeout(this.toastTimer);
      this.toastTimer = setTimeout(() => {
        badge.classList.remove('visible');
      }, 3500);
    }

    spawnCashews() {
      const count = window.innerWidth < 768 ? 9 : 18;
      this.cashews = [];

      const grades = [
        { grade: 'W180 Jumbo', count: '140–180 / lb', type: 'Super Premium Whole', color: '#FCE6B0', scale: 1.35 },
        { grade: 'W210 Large', count: '180–210 / lb', type: 'Premium Whole', color: '#F6DC9F', scale: 1.15 },
        { grade: 'W240 Med-Lg', count: '220–240 / lb', type: 'Export Grade Whole', color: '#EFCF8B', scale: 1.05 },
        { grade: 'W320 Standard', count: '300–320 / lb', type: 'World Standard Whole', color: '#E8C377', scale: 0.95 },
        { grade: 'WS Splits', count: 'Natural Halves', type: 'Split Cotyledon', color: '#DFC07F', scale: 0.8 },
        { grade: 'RCN Guinea', count: 'Raw In-Shell', type: 'KOR 50-52 lbs Origin', color: '#665345', scale: 1.25 }
      ];

      for (let i = 0; i < count; i++) {
        const gradeInfo = grades[i % grades.length];
        this.cashews.push({
          x: Math.random() * (this.width || 800),
          y: Math.random() * (this.height || 600),
          baseSize: (26 + Math.random() * 22) * gradeInfo.scale,
          size: 30,
          depth: 0.5 + Math.random() * 0.7, // Depth of field
          vx: (Math.random() - 0.5) * 0.8,
          vy: (Math.random() - 0.5) * 0.6,
          angle: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.015,
          floatOffset: Math.random() * 100,
          floatSpeed: 0.015 + Math.random() * 0.02,
          grade: gradeInfo.grade,
          count: gradeInfo.count,
          type: gradeInfo.type,
          baseColor: gradeInfo.color,
          isRaw: gradeInfo.grade.includes('RCN')
        });
      }
    }

    spawnDust() {
      const dustCount = window.innerWidth < 768 ? 20 : 45;
      this.dustParticles = [];
      for (let i = 0; i < dustCount; i++) {
        this.dustParticles.push({
          x: Math.random() * (this.width || 800),
          y: Math.random() * (this.height || 600),
          size: 1 + Math.random() * 2.5,
          vx: (Math.random() - 0.5) * 0.4,
          vy: -0.2 - Math.random() * 0.5,
          alpha: 0.15 + Math.random() * 0.45,
          color: Math.random() > 0.4 ? '#D4A359' : '#FFFFFF',
          oscillation: Math.random() * Math.PI * 2
        });
      }
    }

    update() {
      const time = Date.now() * 0.002;

      // Update Cashews
      for (let i = 0; i < this.cashews.length; i++) {
        const c = this.cashews[i];

        // Float wave harmonic motion
        c.y += Math.sin(time * c.floatSpeed * 50 + c.floatOffset) * 0.45 + c.vy;
        c.x += Math.cos(time * c.floatSpeed * 40 + c.floatOffset) * 0.35 + c.vx;
        c.angle += c.rotSpeed;

        // Mouse repulsion physics
        if (this.mouse.isHovering) {
          const dx = c.x - this.mouse.x;
          const dy = c.y - this.mouse.y;
          const dist = Math.hypot(dx, dy);
          const maxDist = 180;

          if (dist < maxDist && dist > 0) {
            const force = (1 - dist / maxDist) * 3.5;
            const angle = Math.atan2(dy, dx);
            c.vx += Math.cos(angle) * force * 0.25;
            c.vy += Math.sin(angle) * force * 0.25;
            c.rotSpeed += (Math.random() - 0.5) * 0.01;
          }
        }

        // Friction / drag
        c.vx *= 0.96;
        c.vy *= 0.96;

        // Wrap around bounds with smooth padding
        const pad = c.baseSize * 2;
        if (c.x < -pad) c.x = this.width + pad;
        if (c.x > this.width + pad) c.x = -pad;
        if (c.y < -pad) c.y = this.height + pad;
        if (c.y > this.height + pad) c.y = -pad;
      }

      // Update Dust
      for (let i = 0; i < this.dustParticles.length; i++) {
        const p = this.dustParticles[i];
        p.y += p.vy;
        p.x += p.vx + Math.sin(time + p.oscillation) * 0.2;

        if (p.decay) {
          p.alpha -= p.decay;
          if (p.alpha <= 0) {
            this.dustParticles.splice(i, 1);
            i--;
            continue;
          }
        } else {
          if (p.y < 0) p.y = this.height;
          if (p.x < 0) p.x = this.width;
          if (p.x > this.width) p.x = 0;
        }
      }
    }

    drawCashew(c) {
      const ctx = this.ctx;
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.rotate(c.angle);

      const s = c.baseSize * c.depth;
      const alpha = Math.min(0.95, c.depth * 1.1);
      ctx.globalAlpha = alpha;

      // Drop shadow for 3D depth
      ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
      ctx.shadowBlur = 12 * c.depth;
      ctx.shadowOffsetX = 3 * c.depth;
      ctx.shadowOffsetY = 6 * c.depth;

      // Realistic Cashew Kidney Geometry
      ctx.beginPath();
      // Start top lobe
      ctx.moveTo(-s * 0.1, -s * 0.7);
      // Outer convex curve
      ctx.bezierCurveTo(s * 0.7, -s * 0.8, s * 1.1, -s * 0.1, s * 0.9, s * 0.6);
      // Bottom rounded tail
      ctx.bezierCurveTo(s * 0.7, s * 1.1, s * 0.1, s * 1.0, -s * 0.3, s * 0.7);
      // Inner concave cusp (the distinctive cashew indentation)
      ctx.bezierCurveTo(-s * 0.6, s * 0.3, -s * 0.4, -s * 0.1, -s * 0.1, s * 0.05);
      ctx.bezierCurveTo(s * 0.2, s * 0.2, s * 0.25, -s * 0.3, -s * 0.1, -s * 0.7);
      ctx.closePath();

      // Realistic 3D Gradient Fill
      if (c.isRaw) {
        // Raw in-shell cashew gradient
        const grad = ctx.createRadialGradient(-s * 0.2, -s * 0.3, s * 0.1, 0, 0, s * 1.1);
        grad.addColorStop(0, '#8A7768');
        grad.addColorStop(0.5, '#544335');
        grad.addColorStop(1, '#241910');
        ctx.fillStyle = grad;
      } else {
        // Roasted / peeled ivory kernel gradient
        const grad = ctx.createRadialGradient(-s * 0.2, -s * 0.3, s * 0.1, 0, 0, s * 1.1);
        grad.addColorStop(0, '#FFFDF8');
        grad.addColorStop(0.3, c.baseColor);
        grad.addColorStop(0.75, '#D4A359');
        grad.addColorStop(1, '#8C5E1E');
        ctx.fillStyle = grad;
      }

      ctx.fill();

      // Reset shadow for details
      ctx.shadowColor = 'transparent';

      // Inner cotyledon split seam
      ctx.beginPath();
      ctx.moveTo(-s * 0.1, -s * 0.3);
      ctx.bezierCurveTo(s * 0.2, -s * 0.2, s * 0.35, s * 0.1, s * 0.1, s * 0.4);
      ctx.strokeStyle = c.isRaw ? 'rgba(30, 20, 10, 0.6)' : 'rgba(140, 94, 30, 0.55)';
      ctx.lineWidth = Math.max(1.2, s * 0.05);
      ctx.lineCap = 'round';
      ctx.stroke();

      // Specular highlight on curve
      ctx.beginPath();
      ctx.moveTo(s * 0.2, -s * 0.55);
      ctx.bezierCurveTo(s * 0.6, -s * 0.5, s * 0.85, 0, s * 0.7, s * 0.35);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
      ctx.lineWidth = Math.max(1.5, s * 0.07);
      ctx.lineCap = 'round';
      ctx.stroke();

      // Secondary soft highlight
      ctx.beginPath();
      ctx.arc(s * 0.2, -s * 0.3, s * 0.12, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.fill();

      // Subtle Grade Stamp Badge
      if (c.depth > 0.85) {
        ctx.font = `600 ${Math.max(9, s * 0.22)}px 'Inter', sans-serif`;
        ctx.fillStyle = 'rgba(11, 37, 30, 0.7)';
        ctx.textAlign = 'center';
        ctx.fillText(c.grade.split(' ')[0], 0, s * 0.15);
      }

      ctx.restore();
    }

    render() {
      const ctx = this.ctx;
      ctx.clearRect(0, 0, this.width, this.height);

      // Draw Golden Dust / Light Orbs
      for (let i = 0; i < this.dustParticles.length; i++) {
        const p = this.dustParticles[i];
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Sort cashews by depth (render back-to-front for proper 3D layering)
      this.cashews.sort((a, b) => a.depth - b.depth);

      // Draw each cashew
      for (let i = 0; i < this.cashews.length; i++) {
        this.drawCashew(this.cashews[i]);
      }
    }

    loop() {
      if (!this.isActive) return;
      this.update();
      this.render();
      requestAnimationFrame(() => this.loop());
    }
  }

  // Initialize once DOM is ready
  document.addEventListener('DOMContentLoaded', () => {
    window.cashewSystem = new CashewParticleSystem('cashew-canvas');
  });
})();
