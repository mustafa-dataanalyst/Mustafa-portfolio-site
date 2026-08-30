// ===== Portfolio filter + lightbox (re-initialized every time cards render) =====
let mzActiveFilter = 'all';

function mzApplyFilter(cat) {
  const cards = document.querySelectorAll('.pf-card');
  cards.forEach((card, i) => {
    const match = cat === 'all' || card.dataset.category === cat;
    if (match) {
      card.style.display = '';
      card.style.transitionDelay = (i * 0.05) + 's';
      requestAnimationFrame(() => {
        card.style.opacity = '1';
        card.style.transform = 'translateY(0) scale(1)';
      });
    } else {
      card.style.opacity = '0';
      card.style.transform = 'translateY(10px) scale(.97)';
      card.style.transitionDelay = '0s';
      setTimeout(() => { card.style.display = 'none'; }, 350);
    }
  });
}

function mzInitFilterTabs() {
  const tabs = document.querySelectorAll('.pf-tab');
  tabs.forEach(tab => {
    if (tab.dataset.bound) return; // tabs are static, bind once
    tab.dataset.bound = '1';
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      mzActiveFilter = tab.dataset.filter;
      mzApplyFilter(mzActiveFilter);
    });
  });
}

function mzOpenLightbox(card) {
  const lightbox = document.getElementById('pfLightbox');
  if (!lightbox) return;
  const lbImg = lightbox.querySelector('.pf-lightbox-img img');
  const lbCat = lightbox.querySelector('.pf-card-cat');
  const lbTitle = lightbox.querySelector('h3');
  const lbDesc = lightbox.querySelector('.pf-lightbox-desc');
  const lbTools = lightbox.querySelector('.pf-card-tools');

  lbImg.src = card.querySelector('img').src;
  lbImg.alt = card.querySelector('img').alt;
  lbCat.textContent = card.dataset.categoryLabel;
  lbTitle.textContent = card.dataset.title;
  lbDesc.textContent = card.dataset.full;
  lbTools.innerHTML = card.dataset.tools
    .split(',')
    .map(t => `<span class="pf-tool-chip">${t.trim()}</span>`)
    .join('');
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function mzCloseLightbox() {
  const lightbox = document.getElementById('pfLightbox');
  if (!lightbox) return;
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
}

function mzInitLightboxChrome() {
  const lightbox = document.getElementById('pfLightbox');
  if (!lightbox || lightbox.dataset.bound) return;
  lightbox.dataset.bound = '1';
  lightbox.querySelector('.pf-lightbox-close').addEventListener('click', mzCloseLightbox);
  lightbox.querySelector('.pf-lightbox-backdrop').addEventListener('click', mzCloseLightbox);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') mzCloseLightbox(); });
}

// Called by site-loader.js immediately after (re)rendering the project cards
window.MZPortfolioInit = function () {
  mzInitFilterTabs();
  mzInitLightboxChrome();
  document.querySelectorAll('.pf-card').forEach(card => {
    card.addEventListener('click', () => mzOpenLightbox(card));
  });
  mzApplyFilter(mzActiveFilter);
};
