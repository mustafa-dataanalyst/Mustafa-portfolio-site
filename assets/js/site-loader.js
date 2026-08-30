/* =========================================================================
   MZ Site Loader
   Runs on every public page. Reads the content store and:
   - applies the active color theme
   - fills in any element tagged data-ck="..." with saved text
   - swaps images tagged data-img="..."
   - re-renders dynamic sections (services / awards / portfolio / home work)
   - keeps everything live-synced if content changes in another tab
   ========================================================================= */

(function () {
  const page = document.body.getAttribute('data-page');
  const ICONS = {
    chart: '<path d="M3 3v18h18"/><path d="M7 15l4-6 4 3 5-8"/>',
    dashboard: '<rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/>',
    excel: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M9 4v16"/>',
    crm: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    bi: '<path d="M12 2v20M2 12h20"/><circle cx="12" cy="12" r="9"/>',
    medal: '<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>'
  };

  function iconSvg(key, cls) {
    return `<svg class="${cls || ''}" viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round">${ICONS[key] || ICONS.chart}</svg>`;
  }

  function applyText(content) {
    document.querySelectorAll('[data-ck]').forEach(el => {
      const key = el.getAttribute('data-ck'); // e.g. "home.heroTagline"
      const [section, field] = key.split('.');
      const bucket = content.text[section];
      if (bucket && bucket[field] !== undefined) {
        el.textContent = bucket[field];
      }
    });
  }

  function applyImages(content) {
    document.querySelectorAll('[data-img]').forEach(el => {
      const key = el.getAttribute('data-img');
      if (key === 'headshot' && content.images.headshot) {
        el.setAttribute('src', content.images.headshot);
      }
    });
  }

  function applySocial(content) {
    document.querySelectorAll('[data-social="email"]').forEach(el => {
      el.textContent = content.social.email;
      el.setAttribute('href', 'mailto:' + content.social.email);
    });
    document.querySelectorAll('[data-social="email-href"]').forEach(el => {
      el.setAttribute('href', 'mailto:' + content.social.email);
    });
    document.querySelectorAll('[data-social="linkedin"]').forEach(el => {
      el.setAttribute('href', content.social.linkedin || '#');
    });
    document.querySelectorAll('[data-social="github"]').forEach(el => {
      el.setAttribute('href', content.social.github || '#');
    });
  }

  // ---------------- Services (Services page) ----------------
  function renderServices(content) {
    const wrap = document.querySelector('[data-render="services"]');
    if (!wrap) return;
    wrap.innerHTML = content.services.map((s, i) => `
      <div class="sv-card reveal${i % 2 ? ' reveal-delay-1' : ''}">
        <div class="sv-card-top">
          <div class="sv-icon">${iconSvg(s.icon)}</div>
          <div class="sv-price">
            <span class="from">Starting At</span>
            <span class="amount">$${s.price}</span>
            <span class="per">${s.per}</span>
          </div>
        </div>
        <h3>${s.title}</h3>
        <p>${s.desc}</p>
        <div class="sv-card-tags">${(s.tags || []).map(t => `<span class="pf-tool-chip">${t}</span>`).join('')}</div>
      </div>
    `).join('');
    observeReveals();
  }

  // ---------------- Awards (Awards page) ----------------
  function renderAwards(content) {
    const wrap = document.querySelector('[data-render="awards"]');
    if (!wrap) return;
    wrap.innerHTML = content.awards.map((a, i) => `
      <div class="aw-card reveal${i ? ' reveal-delay-' + Math.min(i, 3) : ''}">
        <div class="aw-side">
          <div class="aw-icon">${iconSvg(a.icon)}</div>
          <span class="aw-year">${a.year}</span>
        </div>
        <div class="aw-main">
          <span class="aw-context">${a.context}</span>
          <h3>${a.title}</h3>
          <p>${a.desc}</p>
          <div class="aw-why">
            <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
            <span><b>Why it matters:</b> ${a.why}</span>
          </div>
        </div>
      </div>
    `).join('');
    observeReveals();
  }

  // ---------------- Portfolio grid (Portfolio page) ----------------
  function renderPortfolio(content) {
    const wrap = document.querySelector('[data-render="portfolio"]');
    if (!wrap) return;
    wrap.innerHTML = content.portfolio.map((p, i) => `
      <article class="pf-card reveal${i % 2 ? ' reveal-delay-1' : ''}"
        data-category="${p.category}"
        data-category-label="${p.categoryLabel}"
        data-title="${escAttr(p.title)}"
        data-full="${escAttr(p.fullDesc)}"
        data-tools="${(p.tools || []).join(', ')}">
        <div class="pf-card-thumb">
          <img src="${p.image}" alt="${escAttr(p.title)} thumbnail">
          <div class="pf-card-expand">
            <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round"><path d="M9 3H3v6M15 3h6v6M9 21H3v-6M15 21h6v-6"/></svg>
          </div>
        </div>
        <div class="pf-card-body">
          <span class="pf-card-cat">${p.categoryLabel}</span>
          <h3>${p.title}</h3>
          <p>${p.shortDesc}</p>
          <div class="pf-card-tools">${(p.tools || []).map(t => `<span class="pf-tool-chip">${t}</span>`).join('')}</div>
        </div>
      </article>
    `).join('');

    // update filter counts
    const counts = { all: content.portfolio.length };
    content.portfolio.forEach(p => { counts[p.category] = (counts[p.category] || 0) + 1; });
    document.querySelectorAll('.pf-tab').forEach(tab => {
      const f = tab.dataset.filter;
      const countEl = tab.querySelector('.count');
      if (countEl) countEl.textContent = `(${counts[f] || 0})`;
    });

    observeReveals();
    if (window.MZPortfolioInit) window.MZPortfolioInit();
  }

  // ---------------- Home featured work (Home page) ----------------
  function renderHomeWork(content) {
    const wrap = document.querySelector('[data-render="home-work"]');
    if (!wrap) return;
    const featured = content.portfolio.filter(p => p.featured).slice(0, 4);
    wrap.innerHTML = featured.map((p, i) => `
      <a href="portfolio.html" class="work-card reveal${i % 2 ? ' reveal-delay-1' : ''}">
        <div class="work-thumb"><img src="${p.image}" alt="${escAttr(p.title)} thumbnail"></div>
        <div class="work-info">
          <div>
            <h3>${p.title}</h3>
            <span class="work-tag">${(p.tools || []).slice(0, 2).join(' · ')}</span>
          </div>
          <div class="work-arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17L17 7M7 7h10v10"/></svg></div>
        </div>
      </a>
    `).join('');
    observeReveals();
  }

  // ---------------- Home stat counters ----------------
  function applyHomeStats(content) {
    if (page !== 'home') return;
    const map = {
      statProjects: content.text.home.statProjects,
      statProblems: content.text.home.statProblems,
      statTools: content.text.home.statTools
    };
    document.querySelectorAll('[data-stat]').forEach(el => {
      const key = el.getAttribute('data-stat');
      const val = map[key];
      if (val !== undefined && val !== null && String(val).trim() !== '' && !isNaN(parseFloat(val))) {
        el.setAttribute('data-target', val);
      }
    });
  }

  function escAttr(str) {
    return String(str || '').replace(/"/g, '&quot;');
  }

  function observeReveals() {
    const revealEls = document.querySelectorAll('.reveal:not(.is-visible)');
    if (!('IntersectionObserver' in window)) {
      revealEls.forEach(el => el.classList.add('is-visible'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
    revealEls.forEach(el => io.observe(el));
  }

  function applyAll() {
    const content = window.MZStore.getContent();
    if (window.MZTheme) window.MZTheme.applyTheme(content.theme);
    applyText(content);
    applyImages(content);
    applySocial(content);
    applyHomeStats(content);
    renderServices(content);
    renderAwards(content);
    renderPortfolio(content);
    renderHomeWork(content);
    // re-run counters if the home counter script already fired
    if (window.MZReRunCounters) window.MZReRunCounters();
  }

  document.addEventListener('DOMContentLoaded', applyAll);
  if (window.MZStore) {
    window.MZStore.onContentChange(applyAll);
  }
})();
