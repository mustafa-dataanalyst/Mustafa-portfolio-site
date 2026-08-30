// ===== Animated counters (re-runnable, since stats can be edited live) =====
function mzAnimateCounter(el) {
  const target = parseFloat(el.dataset.target);
  const duration = 1400;
  const start = performance.now();
  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.floor(eased * target);
    const numEl = el.querySelector('.num-value');
    if (numEl) numEl.textContent = value;
    if (progress < 1) requestAnimationFrame(tick);
    else if (numEl) numEl.textContent = target;
  }
  requestAnimationFrame(tick);
}

function mzInitCounters() {
  const counters = document.querySelectorAll('.js-counter');
  if (!counters.length) return;
  if ('IntersectionObserver' in window) {
    const counterIO = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          mzAnimateCounter(entry.target);
          counterIO.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(c => counterIO.observe(c));
  } else {
    counters.forEach(mzAnimateCounter);
  }
}

// Called by site-loader.js whenever admin-saved stat numbers change
window.MZReRunCounters = function () {
  document.querySelectorAll('.js-counter').forEach(el => {
    const numEl = el.querySelector('.num-value');
    if (numEl) numEl.textContent = '0';
  });
  mzInitCounters();
};

// NOTE: initial counter run is triggered by site-loader.js (via MZReRunCounters)
// once stat numbers are read from the content store, so we don't double-init here.

// ===== Testimonial slider =====
document.addEventListener('DOMContentLoaded', () => {
  const track = document.querySelector('.testi-track');
  const dotsWrap = document.querySelector('.testi-controls');
  if (!track) return;
  const slides = track.querySelectorAll('.testi-slide');
  let index = 0;
  let timer;

  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'testi-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', 'Go to testimonial ' + (i + 1));
    dot.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(dot);
  });
  const dots = dotsWrap.querySelectorAll('.testi-dot');

  function goTo(i) {
    index = i;
    track.style.transform = `translateX(-${index * 100}%)`;
    dots.forEach((d, di) => d.classList.toggle('active', di === index));
    resetTimer();
  }
  function next() { goTo((index + 1) % slides.length); }
  function resetTimer() {
    clearInterval(timer);
    timer = setInterval(next, 5500);
  }
  resetTimer();
});
