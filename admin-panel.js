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
        promptCategory: 'Kategori (flag, landscape, cat, building)',
        promptYear: 'Yıl',
        invalidCategory: 'Geçersiz kategori. Sadece flag, landscape, cat, building olabilir.',
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
        promptCategory: 'Category (flag, landscape, cat, building)',
        promptYear: 'Year',
        invalidCategory: 'Invalid category. Use one of: flag, landscape, cat, building.',
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
  const allowedCategories = new Set(['flag', 'landscape', 'cat', 'building']);

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
});
