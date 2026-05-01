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
      const response = await fetch('/api/admin/photos?limit=8');
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
        <div>
          <div class="admin-recent-title">${escapeHtml(item.titleEn || item.titleTr || 'Untitled')}</div>
          <div class="admin-recent-meta">${escapeHtml(item.categoryKey || '')} • ${escapeHtml(String(item.year || ''))}</div>
        </div>
      `;
      recentList.appendChild(li);
    });
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
