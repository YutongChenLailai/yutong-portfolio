const progress = document.querySelector('.progress span');
const glow = document.querySelector('.cursor-glow');
const menu = document.querySelector('#site-nav');
const menuToggle = document.querySelector('.menu-toggle');

const updateScroll = () => {
  const max = document.documentElement.scrollHeight - innerHeight;
  progress.style.width = `${Math.min(100, (scrollY / Math.max(1, max)) * 100)}%`;
  document.querySelectorAll('[data-parallax]').forEach((el) => {
    const speed = Number(el.dataset.parallax);
    const rect = el.getBoundingClientRect();
    if (rect.bottom > -200 && rect.top < innerHeight + 200) {
      el.style.transform = `translate3d(0, ${-rect.top * speed}px, 0)`;
    }
  });
};

addEventListener('scroll', updateScroll, { passive: true });
addEventListener('pointermove', (event) => {
  glow.style.left = `${event.clientX}px`;
  glow.style.top = `${event.clientY}px`;
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add('visible'));
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

menuToggle.addEventListener('click', () => {
  const open = menu.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(open));
});
menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  menu.classList.remove('open');
  menuToggle.setAttribute('aria-expanded', 'false');
}));

document.querySelectorAll('.expand').forEach((button) => button.addEventListener('click', () => {
  const card = button.closest('.case-card');
  const open = card.classList.toggle('open');
  button.setAttribute('aria-expanded', String(open));
}));

document.querySelectorAll('.tilt-card').forEach((card) => {
  card.addEventListener('pointermove', (event) => {
    if (innerWidth < 900) return;
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - .5;
    const y = (event.clientY - rect.top) / rect.height - .5;
    card.style.transform = `perspective(900px) rotateX(${-y * 5}deg) rotateY(${x * 7}deg)`;
  });
  card.addEventListener('pointerleave', () => card.style.transform = '');
});

const dialog = document.querySelector('.board-dialog');
document.querySelector('[data-board-open]').addEventListener('click', () => dialog.showModal());
document.querySelector('[data-board-close]').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });

updateScroll();
