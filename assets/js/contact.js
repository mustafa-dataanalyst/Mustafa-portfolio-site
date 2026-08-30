document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('ctForm');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('ctName').value.trim();
    const email = document.getElementById('ctEmail').value.trim();
    const message = document.getElementById('ctMessage').value.trim();
    const content = window.MZStore ? window.MZStore.getContent() : null;
    const toEmail = content ? content.social.email : 'hello@mustafazafar.com';

    const subject = encodeURIComponent(`Portfolio inquiry from ${name || 'website visitor'}`);
    const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);
    window.location.href = `mailto:${toEmail}?subject=${subject}&body=${body}`;
  });
});
