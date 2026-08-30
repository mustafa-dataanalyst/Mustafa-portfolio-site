/* =========================================================================
   MZ Admin Panel
   Every save here writes straight into the shared content store, which the
   public pages read from live. No page reload needed on any tab that's
   already open.
   ========================================================================= */

const ICON_OPTIONS = ['chart', 'dashboard', 'excel', 'crm', 'bi', 'medal'];
const ICON_LABELS = {
  chart: 'Analysis', dashboard: 'Dashboard', excel: 'Excel',
  crm: 'CRM', bi: 'Business Intelligence', medal: 'Award'
};
const CATEGORY_OPTIONS = [
  { value: 'python-sql', label: 'Python & SQL Analysis' },
  { value: 'powerbi-dax', label: 'Power BI & DAX Dashboards' },
  { value: 'excel-reporting', label: 'Excel & Business Reporting' }
];

let editingServiceId = null;
let editingProjectId = null;
let editingAwardId = null;

// ---------------------------------------------------------------- Toast
let toastTimer;
function showToast(msg) {
  const toast = document.getElementById('adminToast');
  document.getElementById('adminToastMsg').textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
}
function flashSaveMsg(formId) {
  const el = document.querySelector(`.admin-save-msg[data-msg="${formId}"]`);
  if (!el) return;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2200);
}

// ---------------------------------------------------------------- Auth / Login
function initLogin() {
  const form = document.getElementById('loginForm');
  const errorBox = document.getElementById('loginError');

  if (window.MZStore.isLoggedIn()) {
    showDashboard();
    return;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const user = document.getElementById('loginUser').value.trim();
    const pass = document.getElementById('loginPass').value;
    if (window.MZStore.attemptLogin(user, pass)) {
      errorBox.classList.remove('show');
      showDashboard();
    } else {
      errorBox.classList.add('show');
    }
  });

  document.getElementById('logoutBtn').addEventListener('click', () => {
    window.MZStore.logout();
    document.getElementById('adminShell').style.display = 'none';
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('loginForm').reset();
  });
}

function showDashboard() {
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('adminShell').style.display = 'grid';
  const content = window.MZStore.getContent();
  window.MZTheme.applyTheme(content.theme);
  loadAllForms(content);
  renderOverview(content);
  renderServicesList(content);
  renderPortfolioList(content);
  renderAwardsList(content);
  renderThemeGrid(content);
}

// ---------------------------------------------------------------- Nav
function initNav() {
  document.querySelectorAll('.admin-nav button[data-section]').forEach(btn => {
    btn.addEventListener('click', () => goToSection(btn.dataset.section));
  });
  document.querySelectorAll('[data-goto]').forEach(btn => {
    btn.addEventListener('click', () => goToSection(btn.dataset.goto));
  });
}
function goToSection(key) {
  document.querySelectorAll('.admin-nav button[data-section]').forEach(b => {
    b.classList.toggle('active', b.dataset.section === key);
  });
  document.querySelectorAll('.admin-section').forEach(s => {
    s.classList.toggle('active', s.id === 'sec-' + key);
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ---------------------------------------------------------------- Simple text-field forms
const TEXT_FORMS = {
  formHome: { section: 'home', fields: ['heroEyebrow', 'heroName', 'heroRole', 'heroTagline', 'heroCtaPrimary', 'heroCtaSecondary', 'statProjects', 'statProblems', 'statTools', 'ctaHeading', 'ctaSubtext'] },
  formAbout: { section: 'about', fields: ['heroHeading', 'story1', 'story2', 'story3', 'missionText'] },
  formServicesIntro: { section: 'services', fields: ['heroHeading', 'heroSubtext'] },
  formPortfolioIntro: { section: 'portfolio', fields: ['heroHeading', 'heroSubtext'] },
  formAwardsIntro: { section: 'awards', fields: ['heroHeading', 'heroSubtext'] },
  formContact: { section: 'contact', fields: ['heroHeading', 'heroSubtext'] }
};

function loadAllForms(content) {
  Object.entries(TEXT_FORMS).forEach(([formId, cfg]) => {
    cfg.fields.forEach(field => {
      const el = document.getElementById(`${cfg.section}-${field}`);
      if (el) el.value = content.text[cfg.section][field];
    });
  });
  document.getElementById('social-email').value = content.social.email;
  document.getElementById('social-linkedin').value = content.social.linkedin === '#' ? '' : content.social.linkedin;
  document.getElementById('social-github').value = content.social.github === '#' ? '' : content.social.github;
  document.getElementById('newUsername').value = window.MZStore.getAuth().username;

  const preview = document.querySelector('#headshotPreview img');
  if (preview) preview.src = content.images.headshot;
}

function initTextForms() {
  Object.entries(TEXT_FORMS).forEach(([formId, cfg]) => {
    const form = document.getElementById(formId);
    if (!form) return;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const content = window.MZStore.getContent();
      cfg.fields.forEach(field => {
        const el = document.getElementById(`${cfg.section}-${field}`);
        if (el) content.text[cfg.section][field] = el.value;
      });
      window.MZStore.saveContent(content);
      flashSaveMsg(formId);
      showToast('Saved — your live site just updated');
      renderOverview(content);
    });
  });

  document.getElementById('formSocial').addEventListener('submit', (e) => {
    e.preventDefault();
    const content = window.MZStore.getContent();
    content.social.email = document.getElementById('social-email').value.trim();
    content.social.linkedin = document.getElementById('social-linkedin').value.trim() || '#';
    content.social.github = document.getElementById('social-github').value.trim() || '#';
    window.MZStore.saveContent(content);
    flashSaveMsg('formSocial');
    showToast('Saved — your live site just updated');
  });
}

// ---------------------------------------------------------------- Overview
function renderOverview(content) {
  const wrap = document.getElementById('ovStats');
  wrap.innerHTML = `
    <div class="ov-card"><div class="num">${content.services.length}</div><div class="lbl">Services Listed</div></div>
    <div class="ov-card"><div class="num">${content.portfolio.length}</div><div class="lbl">Portfolio Projects</div></div>
    <div class="ov-card"><div class="num">${content.awards.length}</div><div class="lbl">Awards &amp; Achievements</div></div>
  `;
}

// ---------------------------------------------------------------- Image upload helper
function readFileAsDataURL(file, callback) {
  const reader = new FileReader();
  reader.onload = () => callback(reader.result);
  reader.readAsDataURL(file);
}

function initHeadshotUpload() {
  document.getElementById('headshotUpload').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    readFileAsDataURL(file, (dataUrl) => {
      const content = window.MZStore.getContent();
      content.images.headshot = dataUrl;
      window.MZStore.saveContent(content);
      document.querySelector('#headshotPreview img').src = dataUrl;
      showToast('Profile photo updated — live on your site now');
    });
  });
}

// ================================================================
// SERVICES CRUD
// ================================================================
function renderServicesList(content) {
  const wrap = document.getElementById('servicesList');
  if (!content.services.length) {
    wrap.innerHTML = `<p class="admin-card-sub">No services yet — add your first one below.</p>`;
    return;
  }
  wrap.innerHTML = content.services.map(s => `
    <div class="item-row">
      <div class="item-info">
        <h4>${s.title}</h4>
        <span>$${s.price} ${s.per}</span>
      </div>
      <div class="item-actions">
        <button class="icon-btn" data-edit-service="${s.id}" title="Edit">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
        </button>
        <button class="icon-btn danger" data-del-service="${s.id}" title="Delete">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6"/></svg>
        </button>
      </div>
    </div>
  `).join('');

  wrap.querySelectorAll('[data-edit-service]').forEach(btn => {
    btn.addEventListener('click', () => openServiceEditor(btn.dataset.editService));
  });
  wrap.querySelectorAll('[data-del-service]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!confirm('Remove this service? This cannot be undone.')) return;
      const c = window.MZStore.getContent();
      c.services = c.services.filter(s => s.id !== btn.dataset.delService);
      window.MZStore.saveContent(c);
      renderServicesList(c);
      renderOverview(c);
      showToast('Service removed — live on your site now');
      if (editingServiceId === btn.dataset.delService) closeServiceEditor();
    });
  });
}

function openServiceEditor(id) {
  const content = window.MZStore.getContent();
  const svc = id ? content.services.find(s => s.id === id) : {
    id: 'svc-' + Date.now(), icon: 'chart', title: '', desc: '', price: '', per: '/ project', tags: []
  };
  editingServiceId = svc.id;
  const panel = document.getElementById('serviceEditor');
  panel.innerHTML = `
    <h2 style="margin-top:0;">${id ? 'Edit Service' : 'New Service'}</h2>
    <div class="admin-field"><label>Title</label><input type="text" id="svcTitle" value="${escapeAttr(svc.title)}"></div>
    <div class="admin-field"><label>Description</label><textarea id="svcDesc">${svc.desc}</textarea></div>
    <div class="admin-row-3">
      <div class="admin-field"><label>Starting Price ($)</label><input type="number" id="svcPrice" value="${svc.price}"></div>
      <div class="admin-field"><label>Price Unit</label><input type="text" id="svcPer" value="${escapeAttr(svc.per)}" placeholder="/ project"></div>
      <div class="admin-field"><label>Icon</label>
        <select id="svcIcon">${ICON_OPTIONS.map(k => `<option value="${k}" ${k === svc.icon ? 'selected' : ''}>${ICON_LABELS[k]}</option>`).join('')}</select>
      </div>
    </div>
    <div class="admin-field"><label>Tags (comma-separated)</label><input type="text" id="svcTags" value="${escapeAttr((svc.tags || []).join(', '))}"></div>
    <div class="admin-btn-row">
      <button class="admin-btn admin-btn-primary" id="svcSaveBtn">Save Service</button>
      <button class="admin-btn admin-btn-ghost" id="svcCancelBtn" type="button">Cancel</button>
    </div>
  `;
  panel.classList.add('open');
  panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  document.getElementById('svcCancelBtn').addEventListener('click', closeServiceEditor);
  document.getElementById('svcSaveBtn').addEventListener('click', () => {
    const c = window.MZStore.getContent();
    const updated = {
      id: svc.id,
      icon: document.getElementById('svcIcon').value,
      title: document.getElementById('svcTitle').value.trim() || 'Untitled Service',
      desc: document.getElementById('svcDesc').value.trim(),
      price: document.getElementById('svcPrice').value.trim() || '0',
      per: document.getElementById('svcPer').value.trim() || '/ project',
      tags: document.getElementById('svcTags').value.split(',').map(t => t.trim()).filter(Boolean)
    };
    const idx = c.services.findIndex(s => s.id === svc.id);
    if (idx > -1) c.services[idx] = updated; else c.services.push(updated);
    window.MZStore.saveContent(c);
    renderServicesList(c);
    renderOverview(c);
    closeServiceEditor();
    showToast('Service saved — live on your site now');
  });
}
function closeServiceEditor() {
  editingServiceId = null;
  const panel = document.getElementById('serviceEditor');
  panel.classList.remove('open');
  panel.innerHTML = '';
}

// ================================================================
// PORTFOLIO CRUD
// ================================================================
function renderPortfolioList(content) {
  const wrap = document.getElementById('portfolioList');
  if (!content.portfolio.length) {
    wrap.innerHTML = `<p class="admin-card-sub">No projects yet — add your first one below.</p>`;
    return;
  }
  wrap.innerHTML = content.portfolio.map(p => `
    <div class="item-row">
      <div class="item-thumb"><img src="${p.image}" alt=""></div>
      <div class="item-info">
        <h4>${p.title} ${p.featured ? '<span style="color:var(--cyan);">★ Featured</span>' : ''}</h4>
        <span>${p.categoryLabel}</span>
      </div>
      <div class="item-actions">
        <button class="icon-btn" data-edit-project="${p.id}" title="Edit">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
        </button>
        <button class="icon-btn danger" data-del-project="${p.id}" title="Delete">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6"/></svg>
        </button>
      </div>
    </div>
  `).join('');

  wrap.querySelectorAll('[data-edit-project]').forEach(btn => {
    btn.addEventListener('click', () => openProjectEditor(btn.dataset.editProject));
  });
  wrap.querySelectorAll('[data-del-project]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!confirm('Remove this project? This cannot be undone.')) return;
      const c = window.MZStore.getContent();
      c.portfolio = c.portfolio.filter(p => p.id !== btn.dataset.delProject);
      window.MZStore.saveContent(c);
      renderPortfolioList(c);
      renderOverview(c);
      showToast('Project removed — live on your site now');
      if (editingProjectId === btn.dataset.delProject) closeProjectEditor();
    });
  });
}

function openProjectEditor(id) {
  const content = window.MZStore.getContent();
  const proj = id ? content.portfolio.find(p => p.id === id) : {
    id: 'pf-' + Date.now(), featured: false, category: 'python-sql',
    categoryLabel: CATEGORY_OPTIONS[0].label, title: '', shortDesc: '', fullDesc: '',
    tools: [], image: 'assets/img/placeholder-headshot.svg'
  };
  editingProjectId = proj.id;
  const panel = document.getElementById('portfolioEditor');
  panel.innerHTML = `
    <h2 style="margin-top:0;">${id ? 'Edit Project' : 'New Project'}</h2>
    <div class="image-uploader" style="margin-bottom:20px;">
      <div class="image-preview" id="projThumbPreview"><img src="${proj.image}" alt=""></div>
      <div class="upload-btn-wrap">
        <label class="admin-btn admin-btn-ghost" for="projThumbUpload">Upload Thumbnail</label>
        <input type="file" id="projThumbUpload" accept="image/*">
        <span class="upload-hint">Used on both the Portfolio page and the Home page (if Featured).</span>
      </div>
    </div>
    <div class="admin-field"><label>Project Title</label><input type="text" id="projTitle" value="${escapeAttr(proj.title)}"></div>
    <div class="admin-row">
      <div class="admin-field"><label>Category</label>
        <select id="projCategory">${CATEGORY_OPTIONS.map(c => `<option value="${c.value}" ${c.value === proj.category ? 'selected' : ''}>${c.label}</option>`).join('')}</select>
      </div>
      <div class="admin-field"><label>Tools (comma-separated)</label><input type="text" id="projTools" value="${escapeAttr((proj.tools || []).join(', '))}"></div>
    </div>
    <div class="admin-field"><label>Short Description (used on cards)</label><textarea id="projShort">${proj.shortDesc}</textarea></div>
    <div class="admin-field"><label>Full Description (used in expanded view)</label><textarea id="projFull">${proj.fullDesc}</textarea></div>
    <div class="admin-field" style="display:flex; align-items:center; gap:10px;">
      <input type="checkbox" id="projFeatured" ${proj.featured ? 'checked' : ''} style="width:auto;">
      <label style="margin:0; text-transform:none; font-size:14px; color:var(--text);" for="projFeatured">Show in Home page's Featured Work section</label>
    </div>
    <div class="admin-btn-row">
      <button class="admin-btn admin-btn-primary" id="projSaveBtn" type="button">Save Project</button>
      <button class="admin-btn admin-btn-ghost" id="projCancelBtn" type="button">Cancel</button>
    </div>
  `;
  panel.classList.add('open');
  panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  let pendingImage = proj.image;
  document.getElementById('projThumbUpload').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    readFileAsDataURL(file, (dataUrl) => {
      pendingImage = dataUrl;
      document.querySelector('#projThumbPreview img').src = dataUrl;
    });
  });

  document.getElementById('projCancelBtn').addEventListener('click', closeProjectEditor);
  document.getElementById('projSaveBtn').addEventListener('click', () => {
    const c = window.MZStore.getContent();
    const catVal = document.getElementById('projCategory').value;
    const catLabel = CATEGORY_OPTIONS.find(x => x.value === catVal).label;
    const updated = {
      id: proj.id,
      featured: document.getElementById('projFeatured').checked,
      category: catVal,
      categoryLabel: catLabel,
      title: document.getElementById('projTitle').value.trim() || 'Untitled Project',
      shortDesc: document.getElementById('projShort').value.trim(),
      fullDesc: document.getElementById('projFull').value.trim(),
      tools: document.getElementById('projTools').value.split(',').map(t => t.trim()).filter(Boolean),
      image: pendingImage
    };
    const idx = c.portfolio.findIndex(p => p.id === proj.id);
    if (idx > -1) c.portfolio[idx] = updated; else c.portfolio.push(updated);
    window.MZStore.saveContent(c);
    renderPortfolioList(c);
    renderOverview(c);
    closeProjectEditor();
    showToast('Project saved — live on your site now');
  });
}
function closeProjectEditor() {
  editingProjectId = null;
  const panel = document.getElementById('portfolioEditor');
  panel.classList.remove('open');
  panel.innerHTML = '';
}

// ================================================================
// AWARDS CRUD
// ================================================================
function renderAwardsList(content) {
  const wrap = document.getElementById('awardsList');
  if (!content.awards.length) {
    wrap.innerHTML = `<p class="admin-card-sub">No achievements yet — add your first one below.</p>`;
    return;
  }
  wrap.innerHTML = content.awards.map(a => `
    <div class="item-row">
      <div class="item-info">
        <h4>${a.title}</h4>
        <span>${a.year} · ${a.context}</span>
      </div>
      <div class="item-actions">
        <button class="icon-btn" data-edit-award="${a.id}" title="Edit">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
        </button>
        <button class="icon-btn danger" data-del-award="${a.id}" title="Delete">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6"/></svg>
        </button>
      </div>
    </div>
  `).join('');

  wrap.querySelectorAll('[data-edit-award]').forEach(btn => {
    btn.addEventListener('click', () => openAwardEditor(btn.dataset.editAward));
  });
  wrap.querySelectorAll('[data-del-award]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!confirm('Remove this achievement? This cannot be undone.')) return;
      const c = window.MZStore.getContent();
      c.awards = c.awards.filter(a => a.id !== btn.dataset.delAward);
      window.MZStore.saveContent(c);
      renderAwardsList(c);
      renderOverview(c);
      showToast('Achievement removed — live on your site now');
      if (editingAwardId === btn.dataset.delAward) closeAwardEditor();
    });
  });
}

function openAwardEditor(id) {
  const content = window.MZStore.getContent();
  const award = id ? content.awards.find(a => a.id === id) : {
    id: 'aw-' + Date.now(), icon: 'medal', year: new Date().getFullYear().toString(),
    context: '', title: '', desc: '', why: ''
  };
  editingAwardId = award.id;
  const panel = document.getElementById('awardEditor');
  panel.innerHTML = `
    <h2 style="margin-top:0;">${id ? 'Edit Achievement' : 'New Achievement'}</h2>
    <div class="admin-row-3">
      <div class="admin-field"><label>Year</label><input type="text" id="awYear" value="${escapeAttr(award.year)}"></div>
      <div class="admin-field"><label>Issuing Body / Context</label><input type="text" id="awContext" value="${escapeAttr(award.context)}"></div>
      <div class="admin-field"><label>Icon</label>
        <select id="awIcon">${ICON_OPTIONS.map(k => `<option value="${k}" ${k === award.icon ? 'selected' : ''}>${ICON_LABELS[k]}</option>`).join('')}</select>
      </div>
    </div>
    <div class="admin-field"><label>Achievement Name</label><input type="text" id="awTitle" value="${escapeAttr(award.title)}"></div>
    <div class="admin-field"><label>Description</label><textarea id="awDesc">${award.desc}</textarea></div>
    <div class="admin-field"><label>Why It Matters</label><textarea id="awWhy">${award.why}</textarea></div>
    <div class="admin-btn-row">
      <button class="admin-btn admin-btn-primary" id="awSaveBtn" type="button">Save Achievement</button>
      <button class="admin-btn admin-btn-ghost" id="awCancelBtn" type="button">Cancel</button>
    </div>
  `;
  panel.classList.add('open');
  panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  document.getElementById('awCancelBtn').addEventListener('click', closeAwardEditor);
  document.getElementById('awSaveBtn').addEventListener('click', () => {
    const c = window.MZStore.getContent();
    const updated = {
      id: award.id,
      icon: document.getElementById('awIcon').value,
      year: document.getElementById('awYear').value.trim(),
      context: document.getElementById('awContext').value.trim(),
      title: document.getElementById('awTitle').value.trim() || 'Untitled Achievement',
      desc: document.getElementById('awDesc').value.trim(),
      why: document.getElementById('awWhy').value.trim()
    };
    const idx = c.awards.findIndex(a => a.id === award.id);
    if (idx > -1) c.awards[idx] = updated; else c.awards.push(updated);
    window.MZStore.saveContent(c);
    renderAwardsList(c);
    renderOverview(c);
    closeAwardEditor();
    showToast('Achievement saved — live on your site now');
  });
}
function closeAwardEditor() {
  editingAwardId = null;
  const panel = document.getElementById('awardEditor');
  panel.classList.remove('open');
  panel.innerHTML = '';
}

function initAddButtons() {
  document.getElementById('addServiceBtn').addEventListener('click', () => openServiceEditor(null));
  document.getElementById('addProjectBtn').addEventListener('click', () => openProjectEditor(null));
  document.getElementById('addAwardBtn').addEventListener('click', () => openAwardEditor(null));
}

// ================================================================
// THEME
// ================================================================
function renderThemeGrid(content) {
  const wrap = document.getElementById('themeGrid');
  wrap.innerHTML = Object.entries(window.MZTheme.THEMES).map(([key, theme]) => `
    <div class="theme-option ${content.theme === key ? 'selected' : ''}" data-theme-key="${key}">
      <div class="theme-swatch-row">
        ${theme.swatch.map(c => `<div class="theme-swatch" style="background:${c};"></div>`).join('')}
      </div>
      <h4>${theme.label}</h4>
      <span>${content.theme === key ? 'Currently active' : 'Click to apply'}</span>
    </div>
  `).join('');

  wrap.querySelectorAll('.theme-option').forEach(opt => {
    opt.addEventListener('click', () => {
      const key = opt.dataset.themeKey;
      const c = window.MZStore.getContent();
      c.theme = key;
      window.MZStore.saveContent(c);
      window.MZTheme.applyTheme(key);
      renderThemeGrid(c);
      showToast(`${window.MZTheme.THEMES[key].label} applied — live on your site now`);
    });
  });
}

// ================================================================
// SETTINGS
// ================================================================
function initSettings() {
  document.getElementById('formPassword').addEventListener('submit', (e) => {
    e.preventDefault();
    const auth = window.MZStore.getAuth();
    const current = document.getElementById('currentPassword').value;
    if (current !== auth.password) {
      showToast('Current password is incorrect');
      return;
    }
    const newUser = document.getElementById('newUsername').value.trim();
    const newPass = document.getElementById('newPassword').value;
    if (!newUser || newPass.length < 6) {
      showToast('Username required, password needs 6+ characters');
      return;
    }
    window.MZStore.saveAuth({ username: newUser, password: newPass });
    document.getElementById('currentPassword').value = '';
    document.getElementById('newPassword').value = '';
    flashSaveMsg('formPassword');
    showToast('Login credentials updated');
  });

  document.getElementById('exportBtn').addEventListener('click', () => {
    const content = window.MZStore.getContent();
    const blob = new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mustafa-zafar-site-backup.json';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Backup downloaded');
  });

  document.getElementById('importInput').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        window.MZStore.saveContent(parsed);
        showDashboard();
        showToast('Backup restored — live on your site now');
      } catch (err) {
        showToast('That file could not be read as a valid backup.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  });

  document.getElementById('resetBtn').addEventListener('click', () => {
    if (!confirm('This will erase every edit made in this Admin Panel and restore the original starting content. Continue?')) return;
    window.MZStore.resetContent();
    showDashboard();
    showToast('Site reset to defaults');
  });
}

function escapeAttr(str) {
  return String(str || '').replace(/"/g, '&quot;');
}

// ================================================================
// INIT
// ================================================================
document.addEventListener('DOMContentLoaded', () => {
  initLogin();
  initNav();
  initTextForms();
  initHeadshotUpload();
  initAddButtons();
  initSettings();
});
