document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('photo-upload-form');
  if (!form) return;

  const isTurkish = document.documentElement.lang.startsWith('tr');
  const ui = isTurkish
    ? {
        noFile: 'Henüz dosya seçilmedi.',
        selected: 'Seçilen dosya',
        uploadInProgress: 'Yükleniyor ve optimize ediliyor...',
        uploadSuccess: 'Fotoğraf başarıyla yüklendi.',
        uploadFailed: 'Yükleme başarısız.',
        editButton: 'Düzenle',
        editSuccess: 'Fotoğraf bilgileri güncellendi.',
        editFailed: 'Düzenleme başarısız.',
        promptTitleEn: 'İngilizce başlık',
        promptTitleTr: 'Türkçe başlık',
        promptDescEn: 'İngilizce açıklama',
        promptDescTr: 'Türkçe açıklama',
        promptCategory: 'Kategori (flag, landscape, cat, building, other)',
        promptYear: 'Yıl',
        invalidCategory: 'Geçersiz kategori. Sadece flag, landscape, cat, building, other olabilir.',
        deleteConfirm: 'Bu fotoğrafı silmek istiyor musun? Dosya proje dizininden de kaldırılacak.',
        deleteSuccess: 'Fotoğraf silindi.',
        deleteFailed: 'Silme işlemi başarısız.',
        fetchFailed: 'Fotoğraf listesi alınamadı.',
        invalidType: 'Sadece PNG/JPG/JPEG dosyaları yüklenebilir.',
        warning: 'Lokal API devre dışı. Terminalde "npm run admin" çalıştır ve sayfayı yenile.'
      }
    : {
        noFile: 'No file selected.',
        selected: 'Selected file',
        uploadInProgress: 'Uploading and optimizing...',
        uploadSuccess: 'Photo uploaded successfully.',
        uploadFailed: 'Upload failed.',
        editButton: 'Edit',
        editSuccess: 'Photo metadata updated.',
        editFailed: 'Edit failed.',
        promptTitleEn: 'English title',
        promptTitleTr: 'Turkish title',
        promptDescEn: 'English description',
        promptDescTr: 'Turkish description',
        promptCategory: 'Category (flag, landscape, cat, building, other)',
        promptYear: 'Year',
        invalidCategory: 'Invalid category. Use one of: flag, landscape, cat, building, other.',
        deleteConfirm: 'Do you want to delete this photo? The file will also be removed from the project directory.',
        deleteSuccess: 'Photo deleted.',
        deleteFailed: 'Delete failed.',
        fetchFailed: 'Could not fetch recent photos.',
        invalidType: 'Only PNG/JPG/JPEG files are allowed.',
        warning: 'Local API is unavailable. Run "npm run admin" in terminal and refresh.'
      };

  const allowedTypes = new Set(['image/png', 'image/jpeg']);
  const fileInput = document.getElementById('photo-file');
  const preview = document.getElementById('photo-preview');
  const status = document.getElementById('upload-status');
  const submit = document.getElementById('upload-submit');
  const recentList = document.getElementById('recent-photos');
  const warning = document.getElementById('admin-warning');
  const allowedCategories = new Set(['flag', 'landscape', 'cat', 'building', 'other']);

  fileInput.addEventListener('change', () => {
    const file = fileInput.files?.[0];
    if (!file) {
      preview.textContent = ui.noFile;
      return;
    }

    preview.textContent = `${ui.selected}: ${file.name} (${formatBytes(file.size)})`;
  });

  form.addEventListener('reset', () => {
    setTimeout(() => {
      preview.textContent = ui.noFile;
      status.textContent = '';
      status.className = 'admin-status';
    }, 0);
  });

  form.addEventListener('submit', async event => {
    event.preventDefault();
    const file = fileInput.files?.[0];

    if (!file) {
      setStatus(ui.noFile, 'error');
      return;
    }

    if (!allowedTypes.has(file.type)) {
      setStatus(ui.invalidType, 'error');
      return;
    }

    try {
      setStatus(ui.uploadInProgress, '');
      submit.disabled = true;

      const formData = new FormData(form);
      const response = await fetch('/api/admin/photos/upload', {
        method: 'POST',
        body: formData
      });

      const payload = await response.json();
      if (!response.ok || !payload.ok) {
        throw new Error(payload.message || ui.uploadFailed);
      }

      setStatus(ui.uploadSuccess, 'success');
      if (payload.notice) {
        warning.hidden = false;
        warning.textContent = payload.notice;
      } else {
        warning.hidden = true;
      }
      form.reset();
      await loadRecentPhotos();
    } catch (error) {
      setStatus(error.message || ui.uploadFailed, 'error');
      warning.hidden = false;
      warning.textContent = ui.warning;
    } finally {
      submit.disabled = false;
    }
  });

  async function loadRecentPhotos() {
    try {
      const response = await fetch('/api/admin/photos?limit=999');
      const payload = await response.json();

      if (!response.ok || !payload.ok) {
        throw new Error(payload.message || ui.fetchFailed);
      }

      warning.hidden = true;
      renderRecent(payload.items || []);
    } catch (error) {
      renderRecent([]);
      warning.hidden = false;
      warning.textContent = ui.warning;
    }
  }

  function renderRecent(items) {
    recentList.innerHTML = '';
    if (!items.length) {
      const empty = document.createElement('li');
      empty.className = 'admin-recent-item';
      empty.innerHTML = `
        <img src="/Images/Icons/icon.webp" alt="">
        <div>
          <div class="admin-recent-title">${ui.noFile}</div>
          <div class="admin-recent-meta">/data/photos.json</div>
        </div>
      `;
      recentList.appendChild(empty);
      return;
    }

    items.forEach(item => {
      const li = document.createElement('li');
      li.className = 'admin-recent-item';
      li.innerHTML = `
        <img src="${escapeHtml(item.filename || '')}" alt="${escapeHtml(item.titleEn || item.titleTr || '')}">
        <div class="admin-recent-content">
          <div class="admin-recent-title">${escapeHtml(item.titleEn || item.titleTr || 'Untitled')}</div>
          <div class="admin-recent-meta">${escapeHtml(item.categoryKey || '')} • ${escapeHtml(String(item.year || ''))}</div>
        </div>
        <div class="admin-recent-actions">
          <button class="admin-btn ghost" type="button" data-edit-photo="${escapeHtml(item.id || '')}">
            <i class="fas fa-pen" aria-hidden="true"></i> ${ui.editButton}
          </button>
          <button class="admin-btn ghost" type="button" data-delete-photo="${escapeHtml(item.id || '')}">
            <i class="fas fa-trash" aria-hidden="true"></i> ${isTurkish ? 'Sil' : 'Delete'}
          </button>
        </div>
      `;
      li.querySelector('[data-edit-photo]')?.addEventListener('click', () => editPhoto(item));
      li.querySelector('[data-delete-photo]')?.addEventListener('click', () => deletePhoto(item));
      recentList.appendChild(li);
    });
  }

  async function editPhoto(item) {
    const titleEn = window.prompt(ui.promptTitleEn, item.titleEn || '');
    if (titleEn === null) return;

    const titleTr = window.prompt(ui.promptTitleTr, item.titleTr || '');
    if (titleTr === null) return;

    const descriptionEn = window.prompt(ui.promptDescEn, item.descriptionEn || '');
    if (descriptionEn === null) return;

    const descriptionTr = window.prompt(ui.promptDescTr, item.descriptionTr || '');
    if (descriptionTr === null) return;

    const categoryInput = window.prompt(ui.promptCategory, item.categoryKey || '');
    if (categoryInput === null) return;

    const categoryKey = String(categoryInput).trim().toLowerCase();
    if (!allowedCategories.has(categoryKey)) {
      setStatus(ui.invalidCategory, 'error');
      return;
    }

    const yearInput = window.prompt(ui.promptYear, String(item.year || ''));
    if (yearInput === null) return;

    const year = Number.parseInt(yearInput, 10) || item.year || new Date().getFullYear();

    try {
      submit.disabled = true;
      const response = await fetch(`/api/admin/photos/${encodeURIComponent(item.id)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          titleEn: String(titleEn).trim(),
          titleTr: String(titleTr).trim(),
          descriptionEn: String(descriptionEn).trim(),
          descriptionTr: String(descriptionTr).trim(),
          categoryKey,
          year
        })
      });

      const payload = await response.json();
      if (!response.ok || !payload.ok) {
        throw new Error(payload.message || ui.editFailed);
      }

      setStatus(ui.editSuccess, 'success');
      await loadRecentPhotos();
    } catch (error) {
      setStatus(error.message || ui.editFailed, 'error');
      warning.hidden = false;
      warning.textContent = ui.warning;
    } finally {
      submit.disabled = false;
    }
  }

  async function deletePhoto(item) {
    const confirmed = window.confirm(ui.deleteConfirm);
    if (!confirmed) return;

    try {
      setStatus('', '');
      submit.disabled = true;

      const response = await fetch(`/api/admin/photos/${encodeURIComponent(item.id)}`, {
        method: 'DELETE'
      });
      const payload = await response.json();

      if (!response.ok || !payload.ok) {
        throw new Error(payload.message || ui.deleteFailed);
      }

      setStatus(ui.deleteSuccess, 'success');
      await loadRecentPhotos();
    } catch (error) {
      setStatus(error.message || ui.deleteFailed, 'error');
      warning.hidden = false;
      warning.textContent = ui.warning;
    } finally {
      submit.disabled = false;
    }
  }

  function setStatus(message, type) {
    status.textContent = message;
    status.className = `admin-status${type ? ` ${type}` : ''}`;
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

  function formatBytes(bytes) {
    if (!bytes) return '0 B';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const index = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${sizes[index]}`;
  }

  preview.textContent = ui.noFile;
  loadRecentPhotos();
  setupAdminTabs();
  setupBlogAdmin();
});

function setupAdminTabs() {
  const tabs = document.querySelectorAll('.admin-tab');
  const photoArea = document.querySelector('.admin-grid');
  const blogArea = document.getElementById('blog-admin');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab || 'photos';
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      if (target === 'blog') {
        if (photoArea) photoArea.style.display = 'none';
        if (blogArea) blogArea.style.display = '';
      } else {
        if (photoArea) photoArea.style.display = '';
        if (blogArea) blogArea.style.display = 'none';
      }
    });
  });
}

function setupBlogAdmin() {
  const isTurkish = document.documentElement.lang.startsWith('tr');
  const ui = isTurkish
    ? {
        titleRequired: 'Başlık zorunlu.',
        contentRequired: 'Yazı içeriği zorunlu.',
        loadFailed: 'Yazılar yüklenemedi.',
        saveFailed: 'Kayıt başarısız.',
        saveSuccess: 'Yazı kaydedildi.',
        updateSuccess: 'Yazı güncellendi.',
        deleteSuccess: 'Yazı silindi.',
        deleteFailed: 'Yazı silinemedi.',
        confirmDelete: 'Bu yazıyı ve içerik dosyasını silmek istiyor musun?',
        imageUploadFailed: 'Görsel yüklenemedi.',
        imageUploaded: 'Görsel eklendi.',
        linkPrompt: 'Eklenecek bağlantıyı gir:',
        noPosts: 'Henüz yazı yok',
        resetText: 'Yeni yazı moduna geçildi.',
        editingText: 'Düzenleme modundasın.'
      }
    : {
        titleRequired: 'Title is required.',
        contentRequired: 'Article content is required.',
        loadFailed: 'Could not load posts.',
        saveFailed: 'Save failed.',
        saveSuccess: 'Post saved.',
        updateSuccess: 'Post updated.',
        deleteSuccess: 'Post deleted.',
        deleteFailed: 'Delete failed.',
        confirmDelete: 'Delete this post and its content file?',
        imageUploadFailed: 'Image upload failed.',
        imageUploaded: 'Image inserted.',
        linkPrompt: 'Enter link URL:',
        noPosts: 'No posts yet',
        resetText: 'Switched to new post mode.',
        editingText: 'Editing mode is active.'
      };

  const recentPostsEl = document.getElementById('recent-posts');
  const addForm = document.getElementById('blog-add-form');
  const addStatus = document.getElementById('blog-add-status');
  const editor = document.getElementById('blog-editor');
  const contentInput = document.getElementById('blog-content-html');
  const titleInput = document.getElementById('blog-title');
  const slugInput = document.getElementById('blog-slug');
  const langInput = document.getElementById('blog-lang');
  const excerptInput = document.getElementById('blog-desc');
  const categoryInput = document.getElementById('blog-category');
  const subcategoryInput = document.getElementById('blog-subcategory');
  const subcategoryRow = document.getElementById('blog-subcategory-row');
  const permalinkPreview = document.getElementById('blog-permalink-preview');
  const imageFileInput = document.getElementById('blog-image-file');
  const imageUploadButton = document.getElementById('blog-image-upload-btn');
  const cancelEditButton = document.getElementById('blog-cancel-edit');

  let editingId = '';
  let slugTouched = false;
  let savedSelectionRange = null;

  if (recentPostsEl) {
    loadRecentPosts();
  }

  if (!addForm || !editor || !contentInput) return;

  addForm.querySelectorAll('[data-editor-command]').forEach(button => {
    button.addEventListener('click', () => {
      const command = button.dataset.editorCommand;
      if (!command) return;
      editor.focus();
      document.execCommand(command, false, null);
      syncEditor();
    });
  });

  addForm.querySelector('[data-editor-action="link"]')?.addEventListener('click', () => {
    const href = window.prompt(ui.linkPrompt, 'https://');
    if (!href) return;
    editor.focus();
    document.execCommand('createLink', false, href.trim());
    syncEditor();
  });

  addForm.querySelector('[data-editor-action="clear"]')?.addEventListener('click', () => {
    editor.innerHTML = '';
    syncEditor();
  });

  titleInput?.addEventListener('input', () => {
    if (!slugTouched) {
      slugInput.value = slugify(titleInput.value);
      updatePermalinkPreview();
    }
  });

  slugInput?.addEventListener('input', () => {
    slugTouched = true;
    slugInput.value = slugify(slugInput.value);
    updatePermalinkPreview();
  });

  langInput?.addEventListener('change', updatePermalinkPreview);
  categoryInput?.addEventListener('change', updateSubcategoryVisibility);

  editor.addEventListener('input', syncEditor);
  editor.addEventListener('blur', syncEditor);
  editor.addEventListener('keyup', saveSelectionRange);
  editor.addEventListener('mouseup', saveSelectionRange);
  editor.addEventListener('focus', saveSelectionRange);
  document.addEventListener('selectionchange', () => {
    if (document.activeElement === editor || editor.contains(document.activeElement)) {
      saveSelectionRange();
    }
  });

  imageFileInput?.addEventListener('change', saveSelectionRange);
  imageUploadButton?.addEventListener('mousedown', saveSelectionRange);

  imageUploadButton?.addEventListener('click', async () => {
    const file = imageFileInput?.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('image', file);
      const response = await fetch('/api/admin/blog/upload-image', {
        method: 'POST',
        body: formData
      });
      const payload = await response.json();
      if (!response.ok || !payload.ok || !payload.url) {
        throw new Error(payload.message || ui.imageUploadFailed);
      }

      insertImageAtCursor(payload.url);
      syncEditor();
      imageFileInput.value = '';
      setStatus(payload.notice || ui.imageUploaded, 'success');
    } catch (error) {
      setStatus(error.message || ui.imageUploadFailed, 'error');
    }
  });

  cancelEditButton?.addEventListener('click', () => {
    resetForm();
    setStatus(ui.resetText, '');
  });

  addForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    syncEditor();
    const form = new FormData(addForm);
    const contentHtml = contentInput.value.trim();
    const payload = {
      title: String(form.get('title') || '').trim(),
      slug: slugify(String(form.get('slug') || '').trim()),
      lang: String(form.get('lang') || 'en').trim(),
      excerpt: String(form.get('description') || '').trim(),
      description: String(form.get('description') || '').trim(),
      category: String(form.get('category') || 'technical').trim(),
      subcategory: String(form.get('subcategory') || '').trim(),
      contentHtml
    };

    if (!payload.title) {
      setStatus(ui.titleRequired, 'error');
      return;
    }

    if (!stripHtml(payload.contentHtml)) {
      setStatus(ui.contentRequired, 'error');
      return;
    }

    try {
      const method = editingId ? 'PUT' : 'POST';
      const endpoint = editingId
        ? `/api/admin/blog/${encodeURIComponent(editingId)}`
        : '/api/admin/blog';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.message || ui.saveFailed);

      setStatus(editingId ? ui.updateSuccess : ui.saveSuccess, 'success');
      resetForm();
      await loadRecentPosts();
    } catch (err) {
      setStatus(err.message || ui.saveFailed, 'error');
    }
  });

  async function loadRecentPosts() {
    try {
      const res = await fetch('/api/admin/blog');
      const payload = await res.json();
      if (!res.ok || !payload.ok) throw new Error(payload.message || 'Could not load posts.');
      renderRecentPosts(payload.items || []);
    } catch (err) {
      renderRecentPosts([]);
      setStatus(ui.loadFailed, 'error');
    }
  }

  function renderRecentPosts(items) {
    recentPostsEl.innerHTML = '';
    if (!items.length) {
      const li = document.createElement('li');
      li.className = 'admin-recent-item';
      li.innerHTML = `
        <img src="/Images/Icons/icon.webp" alt="">
        <div>
          <div class="admin-recent-title">${ui.noPosts}</div>
          <div class="admin-recent-meta">/data/blog-posts.json</div>
        </div>
      `;
      recentPostsEl.appendChild(li);
      return;
    }

    items.forEach(item => {
      const li = document.createElement('li');
      li.className = 'admin-recent-item';
      li.innerHTML = `
        <img src="/Images/Icons/icon.webp" alt="">
        <div class="admin-recent-content">
          <div class="admin-recent-title">${escapeHtml(item.title || 'Untitled')}</div>
          <div class="admin-recent-meta">${escapeHtml(item.slug || '')} • ${escapeHtml(item.lang || '')} • ${escapeHtml(item.category || '')}</div>
        </div>
        <div class="admin-recent-actions">
          <button class="admin-btn ghost" type="button" data-open-post="${escapeHtml(item.slug || '')}"><i class="fas fa-arrow-up-right-from-square" aria-hidden="true"></i></button>
          <button class="admin-btn ghost" type="button" data-edit-post="${escapeHtml(item.id || '')}"><i class="fas fa-pen" aria-hidden="true"></i></button>
          <button class="admin-btn ghost" type="button" data-delete-post="${escapeHtml(item.id || '')}"><i class="fas fa-trash" aria-hidden="true"></i></button>
        </div>
      `;

      li.querySelector('[data-open-post]')?.addEventListener('click', () => {
        const href = item.lang === 'tr' ? `/yazilar/${item.slug}` : `/posts/${item.slug}`;
        window.open(href, '_blank', 'noopener,noreferrer');
      });
      li.querySelector('[data-edit-post]')?.addEventListener('click', () => editPost(item));
      li.querySelector('[data-delete-post]')?.addEventListener('click', () => deletePost(item));
      recentPostsEl.appendChild(li);
    });
  }

  async function editPost(item) {
    try {
      editingId = item.id || '';
      titleInput.value = item.title || '';
      slugInput.value = item.slug || '';
      langInput.value = item.lang === 'tr' ? 'tr' : 'en';
      excerptInput.value = item.excerpt || item.description || '';
      categoryInput.value = item.category || 'technical';
      subcategoryInput.value = item.subcategory || 'systems';
      slugTouched = true;
      updateSubcategoryVisibility();
      updatePermalinkPreview();

      let html = item.description || '';
      if (item.contentPath) {
        const contentRes = await fetch(item.contentPath, { cache: 'no-store' });
        if (contentRes.ok) {
          html = await contentRes.text();
        }
      }

      editor.innerHTML = html;
      syncEditor();
      setStatus(ui.editingText, '');
      cancelEditButton.hidden = false;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setStatus(err.message || ui.saveFailed, 'error');
    }
  }

  async function deletePost(item) {
    const confirmed = window.confirm(ui.confirmDelete);
    if (!confirmed) return;
    try {
      const res = await fetch(`/api/admin/blog/${encodeURIComponent(item.id)}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.message || ui.deleteFailed);
      await loadRecentPosts();
      if (editingId === item.id) {
        resetForm();
      }
      setStatus(ui.deleteSuccess, 'success');
    } catch (err) {
      setStatus(err.message || ui.deleteFailed, 'error');
    }
  }

  function syncEditor() {
    contentInput.value = editor.innerHTML.trim();
  }

  function saveSelectionRange() {
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    const container = range.commonAncestorContainer;
    if (!editor.contains(container)) return;

    savedSelectionRange = range.cloneRange();
  }

  function restoreSelectionRange() {
    const selection = window.getSelection();
    if (!selection || !savedSelectionRange) return false;

    selection.removeAllRanges();
    selection.addRange(savedSelectionRange);
    return true;
  }

  function insertImageAtCursor(url) {
    const imageUrl = String(url || '').trim();
    if (!imageUrl) return;

    const selectionRestored = restoreSelectionRange();
    const selection = window.getSelection();
    const range = selection && selection.rangeCount ? selection.getRangeAt(0) : null;

    if (!selectionRestored || !range || !editor.contains(range.commonAncestorContainer)) {
      editor.insertAdjacentHTML('beforeend', `<img src="${escapeHtml(imageUrl)}" alt="">`);
      return;
    }

    range.deleteContents();
    const image = document.createElement('img');
    image.src = imageUrl;
    image.alt = '';
    range.insertNode(image);
    range.setStartAfter(image);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
    saveSelectionRange();
  }

  function updateSubcategoryVisibility() {
    const selectedCategory = categoryInput.value;
    if (selectedCategory === 'technical') {
      subcategoryRow.hidden = false;
    } else {
      subcategoryRow.hidden = true;
      subcategoryInput.value = '';
    }
  }

  function updatePermalinkPreview() {
    const slug = slugify(slugInput.value || titleInput.value || 'post');
    const lang = langInput.value === 'tr' ? 'tr' : 'en';
    const pathValue = lang === 'tr' ? `/yazilar/${slug}` : `/posts/${slug}`;
    if (permalinkPreview) {
      permalinkPreview.textContent = `${window.location.origin}${pathValue}`;
    }
  }

  function resetForm() {
    editingId = '';
    slugTouched = false;
    addForm.reset();
    categoryInput.value = 'technical';
    subcategoryInput.value = 'systems';
    editor.innerHTML = '';
    contentInput.value = '';
    cancelEditButton.hidden = true;
    updateSubcategoryVisibility();
    updatePermalinkPreview();
  }

  function setStatus(message, type) {
    addStatus.textContent = message;
    addStatus.className = `admin-status${type ? ` ${type}` : ''}`;
  }

  function slugify(value) {
    return String(value || '')
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80);
  }

  function stripHtml(value) {
    return String(value || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&"'<>]/g, character => ({
      '&': '&amp;',
      '"': '&quot;',
      "'": '&#39;',
      '<': '&lt;',
      '>': '&gt;'
    }[character]));
  }

  updateSubcategoryVisibility();
  updatePermalinkPreview();
}
