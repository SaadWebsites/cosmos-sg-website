/**
 * COSMOS SG Trading PTE LTD - Main Web Application Engine
 * Manages Hero Section RFQ Form, Live Calculators, Modals, Market Ticker,
 * and Singapore HQ Trading Desk status.
 */

(function () {
  'use strict';

  // Commodity Grade Mappings
  const COMMODITY_GRADES = {
    cashew: [
      { id: 'w180', name: 'W-180 Jumbo King (140-180/lb)', desc: 'Super Jumbo, luxury grade' },
      { id: 'w210', name: 'W-210 Large (180-210/lb)', desc: 'Premium retail & snack' },
      { id: 'w240', name: 'W-240 Standard Large (220-240/lb)', desc: 'Standard large size' },
      { id: 'w320', name: 'W-320 World Standard (300-320/lb)', desc: 'Highest global volume' },
      { id: 'w450', name: 'W-450 Small Whole (400-450/lb)', desc: 'Budget whole kernel' },
      { id: 'ws', name: 'WS White Splits (Natural Halves)', desc: 'Baking & confectionery' },
      { id: 'lp', name: 'LP Large White Pieces', desc: 'Food manufacturing' },
      { id: 'rcn', name: 'Raw Cashew Nuts (RCN In-Shell)', desc: 'Origin Guinea, KOR 48-52' }
    ],
    rice: [
      { id: 'basmati', name: '1121 Steam Basmati Rice (8.35mm+)', desc: 'Extra long grain' },
      { id: 'jasmine', name: 'Fragrant Jasmine Rice (AAA Grade)', desc: 'Aromatic soft grain' },
      { id: 'longgrain', name: 'Long Grain White Rice (5% Broken)', desc: 'Global staple grade' },
      { id: 'parboiled', name: 'Parboiled Golden Sella Rice', desc: 'High nutritional retention' }
    ],
    sesame: [
      { id: 'hulled', name: 'Hulled White Sesame Seeds (99.95%)', desc: 'Bakery & tahini grade' },
      { id: 'natural_white', name: 'Natural White Sesame Seeds (99.9%)', desc: 'Oil & food processing' },
      { id: 'black_sesame', name: 'Premium Black Sesame Seeds (99.5%)', desc: 'Confectionery & health' }
    ],
    cocoa: [
      { id: 'cocoa_raw', name: 'Fermented Raw Cocoa Beans (Grade 1)', desc: 'Origin West Africa' },
      { id: 'cocoa_g2', name: 'Raw Cocoa Beans (Grade 2)', desc: 'Standard bean count <100' }
    ],
    cloves: [
      { id: 'cloves_hand', name: 'Hand-Picked Selected Cloves (Lalpari)', desc: 'Essential oil >18%' },
      { id: 'cloves_clean', name: 'FAQ Cleaned Whole Cloves', desc: 'Export standard' }
    ],
    pepper: [
      { id: 'pepper_550', name: 'Black Pepper 550 g/l FAQ', desc: 'Vietnamese origin' },
      { id: 'pepper_asta', name: 'Black Pepper 570 g/l ASTA Cleaned', desc: 'High density premium' }
    ]
  };

  // Packaging options per commodity
  const COMMODITY_PACKAGING = {
    cashew: [
      '25kg (50lb) Vacuum Carton with Nitrogen Flush',
      '10kg Dual Vacuum Pouches in 5-ply Outer Carton',
      '1kg / 500g Resealable Retail Stand-up Pouches',
      'Custom OEM Private Label Packaging'
    ],
    rcn: [
      '80kg High-Density Jute / Burlap Sacks',
      '50kg Ventilated PP Bags for In-Shell Cashews'
    ],
    rice: [
      '50kg / 25kg PP Woven Export Bags',
      '10kg / 5kg Retail Poly Bags',
      '1MT Jumbo Bags with Pallet'
    ],
    sesame: [
      '25kg Multi-Wall Paper Bags with Inner PE Liner',
      '50kg PP Woven Bags',
      '1MT Bulk Bags'
    ],
    cocoa: [
      '62.5kg Traditional Jute Bags',
      '65kg GrainPro Hermetic Protected Bags'
    ],
    cloves: [
      '50kg Burlap Bags with Inner Moisture Barrier',
      '10kg Corrugated Boxes'
    ],
    pepper: [
      '25kg / 50kg Double Layer PP Bags',
      '25kg Kraft Paper Bags'
    ]
  };

  document.addEventListener('DOMContentLoaded', () => {
    initSingaporeClock();
    initHeroRFQForm();
    initContainerCalculator();
    initModals();
    initFaqAccordion();
    initSmoothScroll();
    initMobileMenu();
  });

  // ==========================================
  // 1. SINGAPORE TRADING DESK LIVE CLOCK
  // ==========================================
  function initSingaporeClock() {
    const clockEl = document.getElementById('sg-live-clock');
    const statusEl = document.getElementById('sg-desk-status');
    if (!clockEl) return;

    function update() {
      // Singapore is UTC+8
      const now = new Date();
      const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
      const sgTime = new Date(utc + (3600000 * 8));

      const hours = sgTime.getHours().toString().padStart(2, '0');
      const mins = sgTime.getMinutes().toString().padStart(2, '0');
      const secs = sgTime.getSeconds().toString().padStart(2, '0');

      clockEl.textContent = `${hours}:${mins}:${secs} SGT (UTC+8)`;

      if (statusEl) {
        const day = sgTime.getDay();
        const hr = sgTime.getHours();
        // Mon-Fri 9:00 - 18:00, Sat 9:00 - 13:00
        const isOpen = (day >= 1 && day <= 5 && hr >= 9 && hr < 18) || (day === 6 && hr >= 9 && hr < 13);
        if (isOpen) {
          statusEl.innerHTML = '<span class="status-pulse open"></span> Trading Desk Live (Instant Response)';
        } else {
          statusEl.innerHTML = '<span class="status-pulse standby"></span> Trading Desk Standby (24/7 RFQ Monitored)';
        }
      }
    }

    update();
    setInterval(update, 1000);
  }

  // ==========================================
  // 2. HERO SECTION RFQ FORM LOGIC
  // ==========================================
  function initHeroRFQForm() {
    const form = document.getElementById('hero-rfq-form');
    if (!form) return;

    const commoditySelect = document.getElementById('rfq-commodity');
    const gradeSelect = document.getElementById('rfq-grade');
    const packagingSelect = document.getElementById('rfq-packaging');
    const quantityInput = document.getElementById('rfq-quantity');
    const unitSelect = document.getElementById('rfq-unit');
    const loadEstimateBadge = document.getElementById('rfq-load-estimate');

    function updateGradesAndPackaging() {
      const selectedCommodity = commoditySelect.value;
      const grades = COMMODITY_GRADES[selectedCommodity] || COMMODITY_GRADES.cashew;

      gradeSelect.innerHTML = '';
      grades.forEach(g => {
        const opt = document.createElement('option');
        opt.value = g.id;
        opt.textContent = `${g.name} — ${g.desc}`;
        gradeSelect.appendChild(opt);
      });

      // Update packaging
      let pkgs = COMMODITY_PACKAGING[selectedCommodity] || COMMODITY_PACKAGING.cashew;
      if (selectedCommodity === 'cashew' && gradeSelect.value === 'rcn') {
        pkgs = COMMODITY_PACKAGING.rcn;
      }
      packagingSelect.innerHTML = '';
      pkgs.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p;
        opt.textContent = p;
        packagingSelect.appendChild(opt);
      });

      updateEstimate();
    }

    function updateEstimate() {
      if (!loadEstimateBadge) return;
      const qty = parseFloat(quantityInput.value) || 0;
      const unit = unitSelect ? unitSelect.value : 'MT';
      const commodity = commoditySelect.value;

      let mt = unit === 'MT' ? qty : qty * 0.025; // if cartons
      if (mt <= 0) mt = 16; // default 1 FCL

      const fcl20 = (mt / 16).toFixed(1);
      const cartons = Math.round(mt * 40); // 40 cartons of 25kg = 1 MT

      if (commodity === 'cashew') {
        loadEstimateBadge.innerHTML = `
          <strong>Est. Volume:</strong> ~${mt.toFixed(1)} MT (${cartons.toLocaleString()} Cartons) &bull; 
          <span class="text-gold">Approx. ${fcl20} x 20ft FCL</span>
        `;
      } else {
        loadEstimateBadge.innerHTML = `
          <strong>Est. Volume:</strong> ~${mt.toFixed(1)} MT &bull; 
          <span class="text-gold">Approx. ${(mt / 24).toFixed(1)} x 20ft FCL Container</span>
        `;
      }
    }

    commoditySelect.addEventListener('change', updateGradesAndPackaging);
    gradeSelect.addEventListener('change', () => {
      if (commoditySelect.value === 'cashew') {
        if (gradeSelect.value === 'rcn') {
          packagingSelect.innerHTML = '';
          COMMODITY_PACKAGING.rcn.forEach(p => {
            const opt = document.createElement('option');
            opt.value = p;
            opt.textContent = p;
            packagingSelect.appendChild(opt);
          });
        } else {
          packagingSelect.innerHTML = '';
          COMMODITY_PACKAGING.cashew.forEach(p => {
            const opt = document.createElement('option');
            opt.value = p;
            opt.textContent = p;
            packagingSelect.appendChild(opt);
          });
        }
      }
      updateEstimate();
    });

    quantityInput.addEventListener('input', updateEstimate);
    if (unitSelect) unitSelect.addEventListener('change', updateEstimate);

    // Initial setup
    updateGradesAndPackaging();

    // Form submission
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;

      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <span class="spinner-border spinner-border-sm" role="status"></span>
        Generating Singapore CIF/FOB Quote...
      `;

      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;

        // Collect Form Data
        const formData = {
          commodity: commoditySelect.options[commoditySelect.selectedIndex].text,
          grade: gradeSelect.options[gradeSelect.selectedIndex].text,
          quantity: `${quantityInput.value} ${unitSelect.value}`,
          packaging: packagingSelect.value,
          port: document.getElementById('rfq-port').value || 'CIF Main Port (Rotterdam/Hai Phong)',
          name: document.getElementById('rfq-name').value,
          email: document.getElementById('rfq-email').value,
          phone: document.getElementById('rfq-phone').value,
          rfqId: 'CSG-SG-' + Math.floor(100000 + Math.random() * 900000)
        };

        showQuoteSuccessModal(formData);
      }, 1200);
    });

    // Helper: populate form from external buttons (e.g. products slider)
    window.populateHeroForm = function (commodity, gradeId) {
      if (commodity && commoditySelect) {
        commoditySelect.value = commodity;
        updateGradesAndPackaging();
      }
      if (gradeId && gradeSelect) {
        gradeSelect.value = gradeId;
      }
      updateEstimate();

      // Smooth scroll to hero form
      const heroFormContainer = document.querySelector('.hero-rfq-card');
      if (heroFormContainer) {
        heroFormContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
        heroFormContainer.classList.add('highlight-pulse');
        setTimeout(() => heroFormContainer.classList.remove('highlight-pulse'), 2000);
      }
    };
  }

  // ==========================================
  // 3. QUOTE SUCCESS & CONFIRMATION MODAL
  // ==========================================
  function showQuoteSuccessModal(data) {
    let modal = document.getElementById('rfq-success-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'rfq-success-modal';
      modal.className = 'cosmos-modal-backdrop';
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div class="cosmos-modal-card">
        <button class="modal-close-btn" aria-label="Close modal">&times;</button>
        <div class="modal-header-success">
          <div class="success-icon-badge">&#10003;</div>
          <h3>Official Quotation Request Received!</h3>
          <p class="text-gold font-mono">Reference No: ${data.rfqId}</p>
        </div>
        <div class="modal-body-content">
          <p class="lead-note">Thank you <strong>${data.name}</strong>. Your wholesale request has been routed to our Singapore Head Office trading desk.</p>
          <div class="quote-summary-grid">
            <div class="summary-item">
              <span class="label">Product:</span>
              <span class="val">${data.commodity}</span>
            </div>
            <div class="summary-item">
              <span class="label">Grade Spec:</span>
              <span class="val">${data.grade}</span>
            </div>
            <div class="summary-item">
              <span class="label">Quantity:</span>
              <span class="val">${data.quantity}</span>
            </div>
            <div class="summary-item">
              <span class="label">Packaging:</span>
              <span class="val">${data.packaging}</span>
            </div>
            <div class="summary-item">
              <span class="label">Destination Port:</span>
              <span class="val">${data.port}</span>
            </div>
            <div class="summary-item">
              <span class="label">Contact Email:</span>
              <span class="val">${data.email}</span>
            </div>
          </div>
          <div class="modal-action-bar">
            <a href="https://wa.me/6563380774?text=Hello%20COSMOS%20SG%20Trading,%20I%20have%20submitted%20RFQ%20${data.rfqId}%20for%20${encodeURIComponent(data.grade)}%20(${encodeURIComponent(data.quantity)})" 
               target="_blank" rel="noopener" class="btn btn-whatsapp-direct">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/></svg>
              Speed Up: Chat with Singapore Desk on WhatsApp
            </a>
            <button class="btn btn-gold-outline" onclick="window.print()">Print / Save RFQ Spec</button>
          </div>
        </div>
      </div>
    `;

    modal.classList.add('open');
    modal.querySelector('.modal-close-btn').addEventListener('click', () => modal.classList.remove('open'));
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('open');
    });
  }

  // ==========================================
  // 4. CONTAINER LOAD CALCULATOR (CBM / MT)
  // ==========================================
  function initContainerCalculator() {
    const calcBtn = document.getElementById('btn-calculate-load');
    if (!calcBtn) return;

    calcBtn.addEventListener('click', () => {
      const containerSize = document.getElementById('calc-container-type').value; // '20' or '40'
      const productType = document.getElementById('calc-product-type').value;

      let netWeightMT = 0;
      let packageCount = 0;
      let packageLabel = '';
      let palletCount = containerSize === '20' ? 10 : 20;

      if (productType === 'cashew_carton') {
        // 20ft: ~16 MT (640 cartons of 25kg or 700 cartons of 50lb)
        // 40ft: ~26 MT (1040 cartons)
        netWeightMT = containerSize === '20' ? 16.0 : 26.0;
        packageCount = containerSize === '20' ? 640 : 1040;
        packageLabel = 'Cartons (25kg Net Vacuum)';
      } else if (productType === 'rcn_bags') {
        // Raw Cashew Nuts in 80kg Jute bags
        netWeightMT = containerSize === '20' ? 17.6 : 28.0;
        packageCount = containerSize === '20' ? 220 : 350;
        packageLabel = 'Jute Sacks (80kg Gross)';
      } else if (productType === 'rice_bags') {
        // Rice 50kg bags
        netWeightMT = containerSize === '20' ? 25.0 : 27.5;
        packageCount = containerSize === '20' ? 500 : 550;
        packageLabel = 'PP Woven Bags (50kg Net)';
      } else if (productType === 'sesame_bags') {
        // Sesame 50kg bags
        netWeightMT = containerSize === '20' ? 19.0 : 26.0;
        packageCount = containerSize === '20' ? 380 : 520;
        packageLabel = 'PP / Multiwall Paper Bags (50kg)';
      }

      const resultBox = document.getElementById('calc-result-display');
      if (resultBox) {
        resultBox.innerHTML = `
          <div class="calc-metrics-grid">
            <div class="metric-card">
              <span class="m-val">${netWeightMT.toFixed(1)} MT</span>
              <span class="m-lbl">Net Cargo Weight</span>
            </div>
            <div class="metric-card">
              <span class="m-val">${packageCount.toLocaleString()}</span>
              <span class="m-lbl">${packageLabel}</span>
            </div>
            <div class="metric-card">
              <span class="m-val">${palletCount} Pallets</span>
              <span class="m-lbl">Palletized Config (Optional)</span>
            </div>
            <div class="metric-card highlight">
              <span class="m-val">${containerSize === '20' ? '33.2 CBM' : '67.7 CBM'}</span>
              <span class="m-lbl">Container Volume Utilized</span>
            </div>
          </div>
          <p class="calc-note">
            <span class="text-gold">&#9432;</span> All shipments include desiccants, fumigation certificate, Phytosanitary, and SGS/Cotecna weight & quality certificates.
          </p>
        `;
        resultBox.classList.add('result-active');
      }
    });
  }

  // ==========================================
  // 5. MODALS & SAMPLE REQUEST
  // ==========================================
  function initModals() {
    // Cashew Anatomy / Inspection Modal
    const inspectBtn = document.getElementById('btn-inspect-cashew');
    if (inspectBtn) {
      inspectBtn.addEventListener('click', () => {
        const modal = document.getElementById('cashew-spec-modal');
        if (modal) modal.classList.add('open');
      });
    }

    // Sample Request Button
    document.querySelectorAll('.btn-request-sample').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const modal = document.getElementById('sample-request-modal');
        if (modal) modal.classList.add('open');
      });
    });

    // Close buttons
    document.querySelectorAll('.modal-close-trigger').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.cosmos-modal-backdrop').forEach(m => m.classList.remove('open'));
      });
    });
  }

  // ==========================================
  // 6. FAQ ACCORDION
  // ==========================================
  function initFaqAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
      const q = item.querySelector('.faq-question');
      if (q) {
        q.addEventListener('click', () => {
          const isOpen = item.classList.contains('open');
          faqItems.forEach(i => i.classList.remove('open'));
          if (!isOpen) item.classList.add('open');
        });
      }
    });
  }

  // ==========================================
  // 7. SMOOTH SCROLL & NAVIGATION
  // ==========================================
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        const targetEl = document.querySelector(targetId);
        if (targetEl) {
          e.preventDefault();
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });

          // Close mobile menu if open
          const navMenu = document.querySelector('.main-nav');
          const toggleBtn = document.querySelector('.mobile-menu-toggle');
          if (navMenu && navMenu.classList.contains('mobile-active')) {
            navMenu.classList.remove('mobile-active');
            if (toggleBtn) toggleBtn.classList.remove('active');
          }
        }
      });
    });
  }

  // ==========================================
  // 8. MOBILE MENU TOGGLE
  // ==========================================
  function initMobileMenu() {
    const toggleBtn = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.main-nav');

    if (toggleBtn && navMenu) {
      toggleBtn.addEventListener('click', () => {
        navMenu.classList.toggle('mobile-active');
        toggleBtn.classList.toggle('active');
      });
    }
  }

})();
