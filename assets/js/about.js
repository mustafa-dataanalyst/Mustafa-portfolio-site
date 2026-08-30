// ===== Timeline progressive line fill =====
const tlList = document.querySelector('.tl-list');
const tlFill = document.querySelector('.tl-line-fill');
const tlItems = document.querySelectorAll('.tl-item');

if (tlList && 'IntersectionObserver' in window) {
  const tlIO = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        updateFill();
      }
    });
  }, { threshold: 0.4 });
  tlItems.forEach(item => tlIO.observe(item));

  function updateFill() {
    const visibleItems = document.querySelectorAll('.tl-item.is-visible');
    if (!visibleItems.length) return;
    const last = visibleItems[visibleItems.length - 1];
    const listRect = tlList.getBoundingClientRect();
    const lastRect = last.querySelector('.tl-dot').getBoundingClientRect();
    const fillHeight = (lastRect.top - listRect.top) + (lastRect.height / 2);
    tlFill.style.height = Math.max(fillHeight, 0) + 'px';
  }
}

// ===== Skill bar fill on scroll =====
const skillItems = document.querySelectorAll('.skill-item');
if ('IntersectionObserver' in window) {
  const skillIO = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const fill = entry.target.querySelector('.skill-fill');
        const pct = entry.target.dataset.percent;
        requestAnimationFrame(() => { fill.style.width = pct + '%'; });
        skillIO.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });
  skillItems.forEach(item => skillIO.observe(item));
}
