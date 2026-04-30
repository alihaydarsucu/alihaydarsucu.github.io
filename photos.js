/* photos.js - simple gallery renderer + lightbox
   Expects JSON at /data/photos.json
*/
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('photos-app');
  if (!container) return;

  const categories = ['Hepsi', 'Bayrak', 'Manzara', 'Kedi', 'Yapı'];

  // build UI
  container.innerHTML = `
    <div class="photos-controls">
      <div class="photo-filters" role="tablist" aria-label="Photo categories"></div>
    </div>
    <div class="photo-grid" id="photo-grid" aria-live="polite"></div>
    <div id="lightbox" class="lightbox" aria-hidden="true">
      <button class="lb-close" aria-label="Close">✕</button>
      <button class="lb-prev" aria-label="Previous">◀</button>
      <div class="lb-content">
        <img class="lb-image" alt="" />
        <div class="lb-caption"></div>
      </div>
      <button class="lb-next" aria-label="Next">▶</button>
    </div>
  `;

  const filtersEl = container.querySelector('.photo-filters');
  const grid = document.getElementById('photo-grid');
  const lightbox = document.getElementById('lightbox');
  const lbImage = lightbox.querySelector('.lb-image');
  const lbCaption = lightbox.querySelector('.lb-caption');
  const lbClose = lightbox.querySelector('.lb-close');
  const lbPrev = lightbox.querySelector('.lb-prev');
  const lbNext = lightbox.querySelector('.lb-next');

  categories.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'filter-btn';
    btn.textContent = cat;
    btn.dataset.cat = cat;
    btn.addEventListener('click', () => applyFilter(cat));
    filtersEl.appendChild(btn);
  });

  let photos = [];
  let currentIndex = -1;

  fetch('/data/photos.json')
    .then(r => r.json())
    .then(data => {
      photos = data || [];
      renderGrid(photos);
      // set first filter active (Hepsi)
      const first = filtersEl.querySelector('.filter-btn');
      if (first) first.classList.add('active');
    })
    .catch(err => {
      grid.innerHTML = '<p>Failed to load photos.</p>';
      console.error(err);
    });

  function renderGrid(list) {
    grid.innerHTML = '';
    list.forEach((p, idx) => {
      const item = document.createElement('button');
      item.className = 'photo-item';
      item.setAttribute('data-index', idx);
      item.innerHTML = `<img src="${p.filename}" alt="${escapeHtml(p.title)}" loading="lazy"/><div class="photo-title">${escapeHtml(p.title)}</div>`;
      item.addEventListener('click', () => openLightbox(idx));
      grid.appendChild(item);
    });
  }

  function applyFilter(cat) {
    // toggle active
    filtersEl.querySelectorAll('.filter-btn').forEach(b => b.classList.toggle('active', b.dataset.cat === cat));
    if (cat === 'Hepsi') {
      renderGrid(photos);
    } else {
      const filtered = photos.filter(p => p.category === cat);
      renderGrid(filtered);
    }
  }

  function openLightbox(idx) {
    const list = [...grid.querySelectorAll('.photo-item')];
    const btn = list[idx];
    // idx here refers to rendered index; map to dataset-index
    if (!btn) return;
    currentIndex = idx;
    const allItems = Array.from(grid.children);
    const p = photos.find((ph, i) => {
      // find by matching filename because renderGrid may filter
      return ph.filename === allItems[idx].querySelector('img').getAttribute('src');
    }) || photos[idx];
    showInLightbox(p);
  }

  function showInLightbox(photo) {
    if (!photo) return;
    lbImage.src = photo.original || photo.filename;
    lbImage.alt = photo.title || '';
    lbCaption.textContent = photo.description || '';
    lightbox.style.display = 'flex';
    lightbox.setAttribute('aria-hidden', 'false');
  }

  function closeLightbox() {
    lightbox.style.display = 'none';
    lightbox.setAttribute('aria-hidden', 'true');
    lbImage.src = '';
    currentIndex = -1;
  }

  function prev() {
    const imgs = Array.from(grid.querySelectorAll('.photo-item'));
    if (imgs.length === 0) return;
    currentIndex = (currentIndex - 1 + imgs.length) % imgs.length;
    const src = imgs[currentIndex].querySelector('img').getAttribute('src');
    const p = photos.find(pp => pp.filename === src) || photos[currentIndex];
    showInLightbox(p);
  }

  function next() {
    const imgs = Array.from(grid.querySelectorAll('.photo-item'));
    if (imgs.length === 0) return;
    currentIndex = (currentIndex + 1) % imgs.length;
    const src = imgs[currentIndex].querySelector('img').getAttribute('src');
    const p = photos.find(pp => pp.filename === src) || photos[currentIndex];
    showInLightbox(p);
  }

  lbClose.addEventListener('click', closeLightbox);
  lbPrev.addEventListener('click', prev);
  lbNext.addEventListener('click', next);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', (e) => {
    if (lightbox.getAttribute('aria-hidden') === 'false') {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    }
  });

  function escapeHtml(s) { return String(s).replace(/[&"'<>]/g, c => ({'&':'&amp;','"':'&quot;',"'":'&#39;','<':'&lt;','>':'&gt;'}[c])); }
});
