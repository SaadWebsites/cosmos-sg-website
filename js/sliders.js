/**
 * COSMOS SG - Custom Slider Animations & Interactive Components
 * Provides silky smooth touch-enabled 3D carousels, grade-filtering showcase,
 * supply-chain progress sliders, and testimonial carousels.
 */

(function () {
  'use strict';

  // ==========================================
  // 1. PRODUCT & CASHEW GRADE SHOWCASE SLIDER
  // ==========================================
  class ProductGradeSlider {
    constructor(containerId) {
      this.container = document.getElementById(containerId);
      if (!this.container) return;

      this.track = this.container.querySelector('.slider-track');
      this.slides = Array.from(this.container.querySelectorAll('.product-slide'));
      this.prevBtn = this.container.querySelector('.slider-prev');
      this.nextBtn = this.container.querySelector('.slider-next');
      this.dotsContainer = this.container.querySelector('.slider-dots');
      this.progressBar = this.container.querySelector('.slider-progress-bar');
      this.tabs = document.querySelectorAll('.grade-filter-tab');

      this.currentIndex = 0;
      this.filteredSlides = [...this.slides];
      this.isAutoplay = true;
      this.autoplayDuration = 6000;
      this.timer = null;
      this.progressInterval = null;
      this.progress = 0;

      // Touch / Drag properties
      this.startX = 0;
      this.currentX = 0;
      this.isDragging = false;

      this.init();
    }

    init() {
      this.renderDots();
      this.updateSlider();
      this.bindEvents();
      this.startAutoplay();
    }

    renderDots() {
      if (!this.dotsContainer) return;
      this.dotsContainer.innerHTML = '';
      this.filteredSlides.forEach((slide, idx) => {
        const dot = document.createElement('button');
        dot.className = `slider-dot ${idx === this.currentIndex ? 'active' : ''}`;
        dot.setAttribute('aria-label', `Go to slide ${idx + 1}`);
        dot.addEventListener('click', () => {
          this.goToSlide(idx);
          this.resetAutoplay();
        });
        this.dotsContainer.appendChild(dot);
      });
    }

    updateSlider() {
      if (this.filteredSlides.length === 0) return;

      // Ensure index is within bounds
      if (this.currentIndex >= this.filteredSlides.length) this.currentIndex = 0;
      if (this.currentIndex < 0) this.currentIndex = this.filteredSlides.length - 1;

      // Hide all slides first
      this.slides.forEach(slide => {
        slide.style.display = 'none';
        slide.classList.remove('active', 'prev', 'next');
      });

      // Show and position active slide
      this.filteredSlides.forEach((slide, idx) => {
        slide.style.display = 'block';
        if (idx === this.currentIndex) {
          slide.classList.add('active');
        } else if (idx === (this.currentIndex - 1 + this.filteredSlides.length) % this.filteredSlides.length) {
          slide.classList.add('prev');
        } else if (idx === (this.currentIndex + 1) % this.filteredSlides.length) {
          slide.classList.add('next');
        }
      });

      // Update dots
      if (this.dotsContainer) {
        const dots = this.dotsContainer.querySelectorAll('.slider-dot');
        dots.forEach((dot, idx) => {
          dot.classList.toggle('active', idx === this.currentIndex);
        });
      }

      // Reset progress bar
      if (this.progressBar) {
        this.progress = 0;
        this.progressBar.style.width = '0%';
      }
    }

    goToSlide(index) {
      this.currentIndex = index;
      this.updateSlider();
    }

    nextSlide() {
      this.currentIndex = (this.currentIndex + 1) % this.filteredSlides.length;
      this.updateSlider();
    }

    prevSlide() {
      this.currentIndex = (this.currentIndex - 1 + this.filteredSlides.length) % this.filteredSlides.length;
      this.updateSlider();
    }

    startAutoplay() {
      clearInterval(this.progressInterval);
      const stepTime = 50;
      const stepIncrement = (100 / (this.autoplayDuration / stepTime));

      this.progressInterval = setInterval(() => {
        if (!this.isAutoplay) return;
        this.progress += stepIncrement;
        if (this.progressBar) {
          this.progressBar.style.width = Math.min(this.progress, 100) + '%';
        }
        if (this.progress >= 100) {
          this.progress = 0;
          this.nextSlide();
        }
      }, stepTime);
    }

    resetAutoplay() {
      this.progress = 0;
      if (this.progressBar) this.progressBar.style.width = '0%';
    }

    filterBy(category) {
      if (category === 'all') {
        this.filteredSlides = [...this.slides];
      } else {
        this.filteredSlides = this.slides.filter(slide => {
          return slide.dataset.category === category || slide.dataset.tags?.includes(category);
        });
      }
      this.currentIndex = 0;
      this.renderDots();
      this.updateSlider();
      this.resetAutoplay();
    }

    bindEvents() {
      if (this.prevBtn) {
        this.prevBtn.addEventListener('click', () => {
          this.prevSlide();
          this.resetAutoplay();
        });
      }

      if (this.nextBtn) {
        this.nextBtn.addEventListener('click', () => {
          this.nextSlide();
          this.resetAutoplay();
        });
      }

      // Filter tabs click
      this.tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
          this.tabs.forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
          const filter = tab.dataset.filter;
          this.filterBy(filter);
        });
      });

      // Pause on hover
      this.container.addEventListener('mouseenter', () => {
        this.isAutoplay = false;
      });
      this.container.addEventListener('mouseleave', () => {
        this.isAutoplay = true;
      });

      // Touch / Swipe
      this.container.addEventListener('touchstart', (e) => {
        this.startX = e.touches[0].clientX;
        this.isDragging = true;
      }, { passive: true });

      this.container.addEventListener('touchmove', (e) => {
        if (!this.isDragging) return;
        this.currentX = e.touches[0].clientX;
      }, { passive: true });

      this.container.addEventListener('touchend', () => {
        if (!this.isDragging) return;
        this.isDragging = false;
        const diff = this.startX - this.currentX;
        if (Math.abs(diff) > 50) {
          if (diff > 0) this.nextSlide();
          else this.prevSlide();
          this.resetAutoplay();
        }
      });

      // Quick quote button link to hero form
      this.container.querySelectorAll('.btn-quote-product').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const commodity = btn.dataset.commodity;
          const grade = btn.dataset.grade;
          if (window.populateHeroForm) {
            window.populateHeroForm(commodity, grade);
          }
        });
      });
    }
  }

  // ==========================================
  // 2. SUPPLY CHAIN WORKFLOW TIMELINE SLIDER
  // ==========================================
  class SupplyChainSlider {
    constructor(containerId) {
      this.container = document.getElementById(containerId);
      if (!this.container) return;

      this.steps = Array.from(this.container.querySelectorAll('.supply-step'));
      this.progressLine = this.container.querySelector('.supply-progress-fill');
      this.stepCards = Array.from(this.container.querySelectorAll('.supply-card'));
      this.currentStep = 0;

      this.init();
    }

    init() {
      this.steps.forEach((step, idx) => {
        step.addEventListener('click', () => this.goToStep(idx));
      });

      // Next / Prev step controls if present
      const nextBtn = this.container.querySelector('.supply-next-btn');
      const prevBtn = this.container.querySelector('.supply-prev-btn');

      if (nextBtn) {
        nextBtn.addEventListener('click', () => {
          this.currentStep = (this.currentStep + 1) % this.steps.length;
          this.goToStep(this.currentStep);
        });
      }

      if (prevBtn) {
        prevBtn.addEventListener('click', () => {
          this.currentStep = (this.currentStep - 1 + this.steps.length) % this.steps.length;
          this.goToStep(this.currentStep);
        });
      }

      this.goToStep(0);
    }

    goToStep(index) {
      this.currentStep = index;

      this.steps.forEach((step, idx) => {
        step.classList.toggle('active', idx === index);
        step.classList.toggle('completed', idx < index);
      });

      this.stepCards.forEach((card, idx) => {
        card.classList.toggle('active', idx === index);
      });

      if (this.progressLine) {
        const percent = (index / (this.steps.length - 1)) * 100;
        this.progressLine.style.width = percent + '%';
      }
    }
  }

  // ==========================================
  // 3. PACKAGING 3D INTERACTIVE CAROUSEL
  // ==========================================
  class PackagingCarousel {
    constructor(containerId) {
      this.container = document.getElementById(containerId);
      if (!this.container) return;

      this.cards = Array.from(this.container.querySelectorAll('.pkg-card'));
      this.prevBtn = this.container.querySelector('.pkg-prev');
      this.nextBtn = this.container.querySelector('.pkg-next');
      this.currentIndex = 0;

      this.init();
    }

    init() {
      if (this.prevBtn) this.prevBtn.addEventListener('click', () => this.prev());
      if (this.nextBtn) this.nextBtn.addEventListener('click', () => this.next());

      this.cards.forEach((card, idx) => {
        card.addEventListener('click', () => {
          this.currentIndex = idx;
          this.update();
        });
      });

      this.update();
    }

    update() {
      const total = this.cards.length;
      this.cards.forEach((card, idx) => {
        card.classList.remove('pkg-active', 'pkg-prev', 'pkg-next', 'pkg-hidden');
        const diff = (idx - this.currentIndex + total) % total;

        if (diff === 0) {
          card.classList.add('pkg-active');
        } else if (diff === 1 || diff === total - 1) {
          if (diff === 1) card.classList.add('pkg-next');
          else card.classList.add('pkg-prev');
        } else {
          card.classList.add('pkg-hidden');
        }
      });
    }

    next() {
      this.currentIndex = (this.currentIndex + 1) % this.cards.length;
      this.update();
    }

    prev() {
      this.currentIndex = (this.currentIndex - 1 + this.cards.length) % this.cards.length;
      this.update();
    }
  }

  // ==========================================
  // 4. TESTIMONIAL & TRADE REVIEWS SLIDER
  // ==========================================
  class TestimonialSlider {
    constructor(containerId) {
      this.container = document.getElementById(containerId);
      if (!this.container) return;

      this.cards = Array.from(this.container.querySelectorAll('.testimonial-card'));
      this.dots = Array.from(this.container.querySelectorAll('.testi-dot'));
      this.currentIndex = 0;
      this.interval = null;

      this.init();
    }

    init() {
      this.dots.forEach((dot, idx) => {
        dot.addEventListener('click', () => {
          this.goTo(idx);
          this.resetTimer();
        });
      });

      this.goTo(0);
      this.startTimer();
    }

    goTo(index) {
      this.currentIndex = index;
      this.cards.forEach((c, idx) => {
        c.classList.toggle('active', idx === index);
      });
      this.dots.forEach((d, idx) => {
        d.classList.toggle('active', idx === index);
      });
    }

    next() {
      this.currentIndex = (this.currentIndex + 1) % this.cards.length;
      this.goTo(this.currentIndex);
    }

    startTimer() {
      this.interval = setInterval(() => this.next(), 7000);
    }

    resetTimer() {
      clearInterval(this.interval);
      this.startTimer();
    }
  }

  // Initialize all sliders on DOM ready
  document.addEventListener('DOMContentLoaded', () => {
    window.productSlider = new ProductGradeSlider('product-slider');
    window.supplySlider = new SupplyChainSlider('supply-chain-slider');
    window.pkgCarousel = new PackagingCarousel('packaging-carousel');
    window.testiSlider = new TestimonialSlider('testimonial-slider');
  });
})();
