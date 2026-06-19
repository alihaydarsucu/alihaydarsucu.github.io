/* photos.js - Photos gallery with search, tags, pagination, and lightbox */
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('photos-app');
  if (!container) return;

  const isTurkish = document.documentElement.lang.startsWith('tr');
  const pageSize = 10;
  const categoryLabels = isTurkish
    ? {
        flag: 'Bayrak',
        landscape: 'Manzara',
        cat: 'Kedi',
        building: 'Yapı',
        other: 'Diğer'
      }
    : {
        flag: 'Flag',
        landscape: 'Landscape',
        cat: 'Cat',
        building: 'Building',
        other: 'Other'
      };
  const ui = isTurkish
    ? {
        all: 'Hepsi',
        searchLabel: 'Fotoğraflarda ara',
        searchPlaceholder: 'Başlık, açıklama veya etiket ara',
        categoriesLabel: 'Fotoğraf etiketleri',
        resultsOne: 'fotoğraf bulundu',
        resultsMany: 'fotoğraf bulundu',
        emptyState: 'Bu aramaya uygun fotoğraf bulunamadı.',
        noPhotosYet: 'Henüz fotoğraf eklenmedi.',
        noPhotosHint: 'Yeni görselleri yönetim panelinden yükleyebilirsin.',
        close: 'Kapat',
        previous: 'Önceki',
        next: 'Sonraki',
        previousPage: 'Önceki sayfa',
        nextPage: 'Sonraki sayfa',
        pageLabel: 'Sayfa',
        loadError: 'Fotoğraflar yüklenemedi.'
      }
    : {
        all: 'All',
        searchLabel: 'Search photos',
        searchPlaceholder: 'Search title, description, or tag',
        categoriesLabel: 'Photo tags',
        resultsOne: 'photo found',
        resultsMany: 'photos found',
        emptyState: 'No photos matched this search.',
        noPhotosYet: 'No photos have been uploaded yet.',
        noPhotosHint: 'You can add new photos from the admin panel.',
        close: 'Close',
        previous: 'Previous',
        next: 'Next',
        previousPage: 'Previous page',
        nextPage: 'Next page',
        pageLabel: 'Page',
        loadError: 'Failed to load photos.'
      };
  const categories = [
    { value: '', label: ui.all },
    { value: 'flag', label: categoryLabels.flag },
    { value: 'landscape', label: categoryLabels.landscape },
    { value: 'cat', label: categoryLabels.cat },
    { value: 'building', label: categoryLabels.building }
  ];

  container.innerHTML = `
    <div class="photo-toolbar">
      <div class="photo-search">
        <div class="search-container">
          <i class="fas fa-search" aria-hidden="true"></i>
          <input id="photo-search-input" type="search" aria-label="${ui.searchLabel}" placeholder="${ui.searchPlaceholder}" autocomplete="off">
        </div>
      </div>
      <div class="photo-filters" role="tablist" aria-label="${ui.categoriesLabel}"></div>
    </div>
    <div class="photo-results" id="photo-results" aria-live="polite"></div>
    <div class="photo-grid" id="photo-grid" aria-live="polite"></div>
    <nav class="photo-pagination" id="photo-pagination" aria-label="${ui.pageLabel}"></nav>
    <div id="lightbox" class="lightbox" aria-hidden="true">
      <button class="lb-close" type="button" aria-label="${ui.close}">✕</button>
      <button class="lb-prev" type="button" aria-label="${ui.previous}">◀</button>
      <div class="lb-content">
        <img class="lb-image" alt="" />
        <div class="lb-caption"></div>
      </div>
      <button class="lb-next" type="button" aria-label="${ui.next}">▶</button>
    </div>
  `;

  const searchInput = container.querySelector('#photo-search-input');
  const filtersEl = container.querySelector('.photo-filters');
  const resultsEl = container.querySelector('#photo-results');
  const grid = container.querySelector('#photo-grid');
  const pagination = container.querySelector('#photo-pagination');
  const lightbox = container.querySelector('#lightbox');
  const lbImage = lightbox.querySelector('.lb-image');
  const lbCaption = lightbox.querySelector('.lb-caption');
  const lbClose = lightbox.querySelector('.lb-close');
  const lbPrev = lightbox.querySelector('.lb-prev');
  const lbNext = lightbox.querySelector('.lb-next');

  let photos = [];
  let filteredPhotos = [];
  let activeCategory = '';
  let searchTerm = '';
  let currentPage = 1;
  let currentLightboxIndex = -1;
  let closeTimer = null;

  categories.forEach(category => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'filter-btn';
    button.textContent = category.label;
    button.dataset.cat = category.value;
    button.setAttribute('role', 'tab');
    button.addEventListener('click', () => {
      activeCategory = category.value;
      currentPage = 1;
      closeLightbox();
      render();
    });
    filtersEl.appendChild(button);
  });

  searchInput.addEventListener('input', event => {
    searchTerm = event.target.value.trim().toLowerCase();
    currentPage = 1;
    closeLightbox();
    render();
  });

  fetch('/data/photos.json')
    .then(response => response.json())
    .then(data => {
      photos = Array.isArray(data) ? [...data].reverse() : [];
      render();
    })
    .catch(error => {
      grid.innerHTML = `<p>${ui.loadError}</p>`;
      pagination.innerHTML = '';
      resultsEl.textContent = '';
      console.error(error);
    });

  function render() {
    const balancedPhotos = balanceByCategory(photos);
    filteredPhotos = balancedPhotos.filter(photo => {
      const categoryKey = getCategoryKey(photo);
      const text = [
        getTitle(photo),
        getDescription(photo),
        getCategoryLabel(categoryKey)
      ].join(' ').toLowerCase();
      const categoryMatch = !activeCategory || categoryKey === activeCategory;
      const searchMatch = !searchTerm || text.includes(searchTerm);
      return categoryMatch && searchMatch;
    });

    const totalPages = Math.max(1, Math.ceil(filteredPhotos.length / pageSize));
    currentPage = Math.min(currentPage, totalPages);
    const startIndex = (currentPage - 1) * pageSize;
    const pageItems = filteredPhotos.slice(startIndex, startIndex + pageSize);

    renderResults(filteredPhotos.length);
    renderFilters();
    renderGrid(pageItems, startIndex);
    renderPagination(totalPages);
  }

  function balanceByCategory(list) {
    const buckets = new Map();
    const categoryOrder = ['flag', 'landscape', 'cat', 'building', 'other'];

    list.forEach(photo => {
      const categoryKey = getCategoryKey(photo) || 'other';
      if (!buckets.has(categoryKey)) {
        buckets.set(categoryKey, []);
      }
      buckets.get(categoryKey).push(photo);
    });

    const orderedCategories = [
      ...categoryOrder.filter(categoryKey => buckets.has(categoryKey)),
      ...Array.from(buckets.keys()).filter(categoryKey => !categoryOrder.includes(categoryKey))
    ];

    const schedule = orderedCategories.map(categoryKey => ({
      categoryKey,
      bucket: buckets.get(categoryKey) || [],
      weight: (buckets.get(categoryKey) || []).length,
      currentWeight: 0
    })).filter(entry => entry.weight > 0);

    const totalWeight = schedule.reduce((sum, entry) => sum + entry.weight, 0);
    const balanced = [];

    while (balanced.length < list.length) {
      let chosen = null;

      for (const entry of schedule) {
        if (!entry.bucket.length) {
          continue;
        }

        entry.currentWeight += entry.weight;

        if (
          !chosen ||
          entry.currentWeight > chosen.currentWeight ||
          (entry.currentWeight === chosen.currentWeight &&
            orderedCategories.indexOf(entry.categoryKey) < orderedCategories.indexOf(chosen.categoryKey))
        ) {
          chosen = entry;
        }
      }

      if (!chosen) {
        break;
      }

      chosen.currentWeight -= totalWeight;
      balanced.push(chosen.bucket.shift());
    }

    return balanced;
  }

  function renderResults(total) {
    if (photos.length === 0) {
      resultsEl.textContent = ui.noPhotosYet;
      return;
    }

    if (!total) {
      resultsEl.textContent = ui.emptyState;
      return;
    }

    resultsEl.textContent = `${total} ${total === 1 ? ui.resultsOne : ui.resultsMany}`;
  }

  function renderFilters() {
    filtersEl.querySelectorAll('.filter-btn').forEach(button => {
      const isActive = button.dataset.cat === activeCategory;
      button.classList.toggle('active', isActive);
      button.setAttribute('aria-selected', String(isActive));
    });
  }

  function renderGrid(list, startIndex) {
    grid.innerHTML = '';

    if (!list.length) {
      if (photos.length === 0) {
        grid.innerHTML = `
          <div class="photo-empty-state" role="status">
            <i class="fas fa-camera-retro" aria-hidden="true"></i>
            <p>${escapeHtml(ui.noPhotosYet)}</p>
            <small>${escapeHtml(ui.noPhotosHint)}</small>
          </div>
        `;
      }
      return;
    }

    list.forEach((photo, index) => {
      const globalIndex = startIndex + index;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'photo-item';
      button.innerHTML = `
        <img src="${escapeHtml(photo.filename)}" alt="${escapeHtml(getTitle(photo))}" loading="lazy">
      `;
      button.addEventListener('click', () => openLightbox(globalIndex));
      grid.appendChild(button);
    });
  }

  function renderPagination(totalPages) {
    pagination.innerHTML = '';

    if (totalPages <= 1) {
      return;
    }

    // Main pagination controls (previous, page info, next)
    const mainControls = document.createElement('div');
    mainControls.className = 'photo-pagination-main';

    const prevButton = document.createElement('button');
    prevButton.type = 'button';
    prevButton.className = 'photo-page-btn';
    prevButton.innerHTML = '<i class="fas fa-chevron-left" aria-hidden="true"></i>';
    prevButton.setAttribute('aria-label', ui.previousPage);
    prevButton.disabled = currentPage === 1;
    prevButton.addEventListener('click', () => {
      if (currentPage === 1) return;
      currentPage -= 1;
      closeLightbox();
      render();
      scrollToGallery();
    });

    const info = document.createElement('span');
    info.className = 'photo-page-number';
    info.textContent = `${ui.pageLabel} ${currentPage} / ${totalPages}`;

    const nextButton = document.createElement('button');
    nextButton.type = 'button';
    nextButton.className = 'photo-page-btn';
    nextButton.innerHTML = '<i class="fas fa-chevron-right" aria-hidden="true"></i>';
    nextButton.setAttribute('aria-label', ui.nextPage);
    nextButton.disabled = currentPage === totalPages;
    nextButton.addEventListener('click', () => {
      if (currentPage === totalPages) return;
      currentPage += 1;
      closeLightbox();
      render();
      scrollToGallery();
    });

    mainControls.append(prevButton, info, nextButton);
    pagination.appendChild(mainControls);

    // Individual page selectors
    if (totalPages > 1) {
      const pageSelectors = document.createElement('div');
      pageSelectors.className = 'photo-pagination-selectors';

      for (let page = 1; page <= totalPages; page += 1) {
        const pageButton = document.createElement('button');
        pageButton.type = 'button';
        pageButton.className = 'photo-page-number';
        pageButton.textContent = String(page);
        pageButton.setAttribute('aria-label', `${ui.pageLabel} ${page}`);
        if (page === currentPage) {
          pageButton.classList.add('active');
          pageButton.disabled = true;
        }
        pageButton.addEventListener('click', () => {
          currentPage = page;
          closeLightbox();
          render();
          scrollToGallery();
        });
        pageSelectors.appendChild(pageButton);
      }
      
      pagination.appendChild(pageSelectors);
    }
  }

  function openLightbox(index) {
    if (!filteredPhotos[index]) return;
    currentLightboxIndex = index;
    syncLightbox(filteredPhotos[currentLightboxIndex]);
    lightbox.style.display = 'flex';
    document.body.classList.add('lightbox-open');
    requestAnimationFrame(() => lightbox.classList.add('open'));
  }

  function syncLightbox(photo) {
    if (!photo) return;
    const title = getTitle(photo);
    const description = getDescription(photo);
    lbImage.src = photo.original || photo.filename;
    lbImage.alt = title;
    lbCaption.innerHTML = description
      ? `<div class="lb-title">${escapeHtml(title)}</div><div class="lb-description">${escapeHtml(description)}</div>`
      : `<div class="lb-title">${escapeHtml(title)}</div>`;
    lightbox.setAttribute('aria-hidden', 'false');
    // Show/hide navigation buttons based on position
    lbPrev.hidden = currentLightboxIndex === 0;
    lbNext.hidden = currentLightboxIndex === filteredPhotos.length - 1;
  }

  function closeLightbox() {
    if (closeTimer) {
      clearTimeout(closeTimer);
      closeTimer = null;
    }
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('lightbox-open');
    closeTimer = setTimeout(() => {
      lightbox.style.display = 'none';
      lbImage.src = '';
      currentLightboxIndex = -1;
    }, 220);
  }

  function moveLightbox(direction) {
    if (!filteredPhotos.length) return;
    if (currentLightboxIndex < 0) return;
    const nextIndex = currentLightboxIndex + direction;
    if (nextIndex < 0 || nextIndex >= filteredPhotos.length) return;
    currentLightboxIndex = nextIndex;
    syncLightbox(filteredPhotos[currentLightboxIndex]);
  }

  function scrollToGallery() {
    container.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  lbClose.addEventListener('click', closeLightbox);
  lbPrev.addEventListener('click', () => moveLightbox(-1));
  lbNext.addEventListener('click', () => moveLightbox(1));
  lightbox.addEventListener('click', event => {
    if (event.target === lightbox) {
      closeLightbox();
    }
  });
  document.addEventListener('keydown', event => {
    if (lightbox.getAttribute('aria-hidden') !== 'false') return;
    if (event.key === 'Escape') closeLightbox();
    if (event.key === 'ArrowLeft') moveLightbox(-1);
    if (event.key === 'ArrowRight') moveLightbox(1);
  });

  function getCategoryKey(photo) {
    return photo.categoryKey || photo.category || '';
  }

  function getCategoryLabel(key) {
    if (!key) return '';
    return categoryLabels[key] || key;
  }

  function getTitle(photo) {
    if (isTurkish) {
      return photo.titleTr || photo.title || photo.titleEn || '';
    }
    return photo.titleEn || photo.title || photo.titleTr || '';
  }

  function getDescription(photo) {
    if (isTurkish) {
      return photo.descriptionTr || photo.description || photo.descriptionEn || '';
    }
    return photo.descriptionEn || photo.description || photo.descriptionTr || '';
  }

  function escapeHtml(value) {
    return String(value).replace(/[&"'<>]/g, character => ({
      '&': '&amp;',
      '"': '&quot;',
      "'": '&#39;',
      '<': '&lt;',
      '>': '&gt;'
    }[character]));
  }

  // Swipe gesture functionality for lightbox
  let touchStartX = 0;
  let touchEndX = 0;
  let touchStartY = 0;
  let touchEndY = 0;

  function handleTouchStart(event) {
    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
  }

  function handleTouchMove(event) {
    // Prevent scrolling when swiping in lightbox
    if (lightbox.getAttribute('aria-hidden') !== 'false') return;
    event.preventDefault();
    touchEndX = event.touches[0].clientX;
    touchEndY = event.touches[0].clientY;
  }

  function handleTouchEnd() {
    if (lightbox.getAttribute('aria-hidden') !== 'false') return;
    
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;
    const minSwipeDistance = 50;
    const maxVerticalDistance = 100;

    // Check if it's a horizontal swipe and not too much vertical movement
    if (Math.abs(deltaX) > minSwipeDistance && Math.abs(deltaY) < maxVerticalDistance) {
      if (deltaX > 0) {
        // Swipe right - previous image
        moveLightbox(-1);
      } else {
        // Swipe left - next image
        moveLightbox(1);
      }
    }
  }

  // Add touch event listeners to lightbox
  lightbox.addEventListener('touchstart', handleTouchStart, { passive: true });
  lightbox.addEventListener('touchmove', handleTouchMove, { passive: false });
  lightbox.addEventListener('touchend', handleTouchEnd, { passive: true });
});
