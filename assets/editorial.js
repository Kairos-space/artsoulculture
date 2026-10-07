const isEnglish = document.documentElement.lang === 'en';
const filters = document.querySelectorAll('[data-filter]');
const projects = document.querySelectorAll('[data-category]');
const status = document.querySelector('.filter-status');
for (const button of filters) button.addEventListener('click', () => {
  for (const other of filters) other.setAttribute('aria-pressed', String(other === button));
  let count = 0;
  for (const project of projects) {
    project.hidden = button.dataset.filter !== 'all' && project.dataset.category !== button.dataset.filter;
    if (!project.hidden) count++;
  }
  if (status) status.textContent = isEnglish ? `${count} selected projects` : `显示 ${count} 个项目`;
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') for (const menu of document.querySelectorAll('.header-controls details[open]')) { menu.open = false; menu.querySelector('summary').focus(); }
});
document.addEventListener('click', event => {
  for (const menu of document.querySelectorAll('.header-controls details[open]')) if (!menu.contains(event.target)) menu.open = false;
});

const gallery = document.querySelector('.project-gallery');
if (gallery) {
  const photos = JSON.parse(document.querySelector('#gallery-photos').textContent);
  const photo = gallery.querySelector('.gallery-stage img');
  const counter = gallery.querySelector('.gallery-count');
  let currentPhoto = 0;
  let touchStart = null;
  let previousOverflow = '';
  function showPhoto(index) {
    currentPhoto = (index + photos.length) % photos.length;
    photo.src = photos[currentPhoto].src;
    photo.alt = `${isEnglish ? 'Michelle Chen project photo' : '陈妍希项目照片'} ${currentPhoto + 1}`;
    counter.textContent = `${String(currentPhoto + 1).padStart(2, '0')} / ${photos.length}`;
    const nextImage = new Image();
    nextImage.src = photos[(currentPhoto + 1) % photos.length].src;
  }
  function openGallery() {
    if (gallery.open) return;
    showPhoto(0);
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    gallery.showModal();
  }
  for (const button of document.querySelectorAll('[data-open-gallery]')) button.addEventListener('click', openGallery);
  gallery.querySelector('[data-gallery-close]').addEventListener('click', () => gallery.close());
  gallery.querySelector('[data-gallery-prev]').addEventListener('click', () => showPhoto(currentPhoto - 1));
  gallery.querySelector('[data-gallery-next]').addEventListener('click', () => showPhoto(currentPhoto + 1));
  gallery.addEventListener('close', () => { document.body.style.overflow = previousOverflow; });
  gallery.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      showPhoto(currentPhoto + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });
  gallery.querySelector('.gallery-stage').addEventListener('touchstart', event => {
    touchStart = {x: event.changedTouches[0].clientX, y: event.changedTouches[0].clientY};
  }, {passive:true});
  gallery.querySelector('.gallery-stage').addEventListener('touchend', event => {
    if (!touchStart) return;
    const dx = event.changedTouches[0].clientX - touchStart.x;
    const dy = event.changedTouches[0].clientY - touchStart.y;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) showPhoto(currentPhoto + (dx < 0 ? 1 : -1));
    touchStart = null;
  }, {passive:true});
  if (location.hash === '#michelle-chen') openGallery();
  window.addEventListener('hashchange', () => { if (location.hash === '#michelle-chen') openGallery(); });
}

// Project-led homepage: motion stays optional and never blocks navigation.
const cinema = document.querySelector('.cinema-hero');
const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
if (cinema) {
  const film = cinema.querySelector('video');
  const photosPanel = cinema.querySelector('.hero-photo-panel');
  const pause = cinema.querySelector('.hero-pause');
  const projectLink = cinema.querySelector('[data-hero-link]');
  let selected = 'film';
  let userPaused = motionPreference.matches;
  let inView = true;
  function updatePlayback() {
    if (selected === 'film' && inView && !userPaused && !document.hidden) film.play().catch(() => { pause.textContent = isEnglish ? 'Play film' : '播放影像'; });
    else film.pause();
    pause.hidden = selected !== 'film';
    pause.textContent = userPaused ? (isEnglish ? 'Play film' : '播放影像') : (isEnglish ? 'Pause film' : '暂停影像');
    pause.setAttribute('aria-pressed', String(!userPaused));
  }
  pause.addEventListener('click', () => { userPaused = !userPaused; updatePlayback(); });
  for (const choice of cinema.querySelectorAll('[data-hero-choice]')) choice.addEventListener('click', () => {
    selected = choice.dataset.heroChoice;
    for (const other of cinema.querySelectorAll('[data-hero-choice]')) other.setAttribute('aria-pressed', String(other === choice));
    film.hidden = selected !== 'film';
    photosPanel.hidden = selected !== 'photos';
    projectLink.href = `${isEnglish ? '/en/work' : '/work'}#${selected === 'film' ? 'moving-image' : 'michelle-chen'}`;
    updatePlayback();
  });
  new IntersectionObserver(entries => { inView = entries[0].isIntersecting; updatePlayback(); },{threshold:.1}).observe(cinema);
  document.addEventListener('visibilitychange', updatePlayback);
  motionPreference.addEventListener('change', () => { userPaused = motionPreference.matches; updatePlayback(); });
}

// Homepage film previews load on approach and pause away from view.
for (const preview of document.querySelectorAll('.project-preview')) {
  const film = preview.querySelector('video');
  const toggle = preview.querySelector('.preview-pause');
  let visible = false;
  let pausedByUser = motionPreference.matches;
  function updatePreview() {
    const shouldPlay = visible && !pausedByUser && !document.hidden;
    if (shouldPlay) {
      if (!film.getAttribute('src')) film.src = film.dataset.src;
      film.play().catch(() => { pausedByUser = true; renderToggle(); });
    } else film.pause();
    renderToggle();
  }
  function renderToggle() {
    const active = !pausedByUser && visible && !document.hidden;
    toggle.textContent = isEnglish ? (active ? 'Pause preview' : 'Play preview') : (active ? '暂停预览' : '播放预览');
    toggle.setAttribute('aria-pressed', String(active));
  }
  toggle.addEventListener('click', () => { pausedByUser = !pausedByUser; updatePreview(); });
  new IntersectionObserver(entries => { visible = entries[0].isIntersecting; updatePreview(); }, {threshold:.2}).observe(preview);
  document.addEventListener('visibilitychange', updatePreview);
  motionPreference.addEventListener('change', () => { pausedByUser = motionPreference.matches; updatePreview(); });
}
