/* photos.js - simple gallery renderer + lightbox
   Expects JSON at /data/photos.json
*/
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('photos-app');
  if (!container) return;

  const isTurkish = document.documentElement.lang.startsWith('tr');
  const ui = isTurkish
    ? {
        categoriesLabel: 'Fotoğraf kategorileri',
        close: 'Kapat',
        previous: 'Önceki',
        next: 'Sonraki',
        loadError: 'Fotoğraflar yüklenemedi.'
      }
    : {
        categoriesLabel: 'Photo categories',
        close: 'Close',
        previous: 'Previous',
        next: 'Next',
        loadError: 'Failed to load photos.'
      };
  const categories = isTurkish
    ? [
        { value: '', label: 'Hepsi' },
        { value: 'Bayrak', label: 'Bayrak' },
        { value: 'Manzara', label: 'Manzara' },
        { value: 'Kedi', label: 'Kedi' },
        { value: 'Yapı', label: 'Yapı' }
      ]
    : [
        { value: '', label: 'All' },
        { value: 'Bayrak', label: 'Flag' },
        { value: 'Manzara', label: 'Landscape' },
        { value: 'Kedi', label: 'Cat' },
        { value: 'Yapı', label: 'Building' }
      ];

  // build UI: section header with horizontal tags aligned to the right
  container.innerHTML = `
    <div class="photos-header">
      <div class="photos-heading-group">
        <h1 class="section-title" id="photos-heading"></h1>
        <p class="photos-intro"></p>
      </div>
      <div class="photo-filters" role="tablist" aria-label="${ui.categoriesLabel}"></div>
    </div>
    <div class="photo-grid" id="photo-grid" aria-live="polite"></div>
    <div id="lightbox" class="lightbox" aria-hidden="true">
      <button class="lb-close" aria-label="${ui.close}">✕</button>
      <button class="lb-prev" aria-label="${ui.previous}">◀</button>
      <div class="lb-content">
        <img class="lb-image" alt="" />
        <div class="lb-caption"></div>
      </div>
      <button class="lb-next" aria-label="${ui.next}">▶</button>
    </div>
  `;

  const filtersEl = container.querySelector('.photo-filters');
  const headingEl = container.querySelector('#photos-heading');
  const introEl = container.querySelector('.photos-intro');
  const grid = document.getElementById('photo-grid');
  const lightbox = document.getElementById('lightbox');
  const lbImage = lightbox.querySelector('.lb-image');
  const lbCaption = lightbox.querySelector('.lb-caption');
  const lbClose = lightbox.querySelector('.lb-close');
  const lbPrev = lightbox.querySelector('.lb-prev');
  const lbNext = lightbox.querySelector('.lb-next');

  headingEl.textContent = isTurkish ? 'Fotoğraflar' : 'Photos';
  introEl.textContent = isTurkish
    ? 'Kategorilere göre fotoğrafları inceleyin. Bir fotoğrafa tıklayınca daha büyük görünüm, açıklama ve oklarla gezinme açılır.'
    : 'Browse photos by category. Open one to view it larger with descriptions and arrow-key navigation.';

  categories.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'filter-btn';
    btn.textContent = cat.label;
    btn.dataset.cat = cat.value;
    btn.addEventListener('click', () => applyFilter(cat));
    filtersEl.appendChild(btn);
  });

  let photos = [];
  let rendered = []; // currently rendered list after filter
  let currentIndex = -1; // index within rendered

  fetch('/data/photos.json')
    .then(r => r.json())
    .then(data => {
      photos = data || [];
      rendered = photos.slice();
      renderGrid(rendered);
      // set first filter active (Hepsi)
      const first = filtersEl.querySelector('.filter-btn');
      if (first) first.classList.add('active');
    })
    .catch(err => {
      grid.innerHTML = `<p>${ui.loadError}</p>`;
      console.error(err);
    });

  function renderGrid(list) {
    grid.innerHTML = '';
    list.forEach((p, idx) => {
      const item = document.createElement('button');
      item.className = 'photo-item';
      item.setAttribute('data-index', idx);
      item.dataset.src = p.filename;
      // image height fixed via CSS; width auto so aspect ratio controls width
      item.innerHTML = `<img src="${p.filename}" alt="${escapeHtml(p.title)}" loading="lazy"/><div class="photo-title">${escapeHtml(p.title)}</div>`;
      item.addEventListener('click', () => openLightbox(idx));
      grid.appendChild(item);
    });
  }

  function applyFilter(cat) {
    // toggle active
    filtersEl.querySelectorAll('.filter-btn').forEach(b => b.classList.toggle('active', b.dataset.cat === cat.value));
    if (cat.value === '') {
      rendered = photos.slice();
      renderGrid(rendered);
    } else {
      rendered = photos.filter(p => p.category === cat.value);
      renderGrid(rendered);
    }
  }

  function openLightbox(idx) {
    if (!rendered || !rendered[idx]) return;
    currentIndex = idx;
    showInLightbox(rendered[currentIndex]);
    // animate lightbox
    lightbox.classList.remove('open');
    // force reflow then add
    void lightbox.offsetWidth;
    lightbox.classList.add('open');
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
    if (!rendered || rendered.length === 0) return;
    currentIndex = (currentIndex - 1 + rendered.length) % rendered.length;
    showInLightbox(rendered[currentIndex]);
  }

  function next() {
    if (!rendered || rendered.length === 0) return;
    currentIndex = (currentIndex + 1) % rendered.length;
    showInLightbox(rendered[currentIndex]);
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
