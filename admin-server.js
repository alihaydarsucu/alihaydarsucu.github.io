const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs/promises');
const path = require('path');
const { spawn } = require('child_process');

const app = express();
const port = Number(process.env.ADMIN_PORT || 8787);
const rootDir = __dirname;

const photosJsonPath = path.join(rootDir, 'data', 'photos.json');
const blogJsonPath = path.join(rootDir, 'data', 'blog-posts.json');
const blogContentDir = path.join(rootDir, 'data', 'blog-content');
const uploadDir = path.join(rootDir, 'Images', 'Uploads', 'Photos');
const blogUploadDir = path.join(rootDir, 'Images', 'Uploads', 'Blog');
const maxOutputBytes = 2 * 1024 * 1024;
const maxInputBytes = 25 * 1024 * 1024;
const allowedCategories = new Set(['flag', 'landscape', 'cat', 'building', 'other']);
const allowedBlogCategories = new Set(['technical', 'history', 'fiction']);
const allowedBlogSubcategories = new Set(['systems', 'embedded', 'ai']);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: maxInputBytes }
});

app.use(express.static(rootDir));
app.use(express.json());

app.get('/admin', (_req, res) => {
  res.sendFile(path.join(rootDir, 'pages', 'en', 'admin.html'));
});

app.get('/yonetim', (_req, res) => {
  res.sendFile(path.join(rootDir, 'pages', 'tr', 'yonetim.html'));
});

app.get('/posts', (_req, res) => {
  res.sendFile(path.join(rootDir, 'pages', 'en', 'blog.html'));
});

app.get('/yazilar', (_req, res) => {
  res.sendFile(path.join(rootDir, 'pages', 'tr', 'blog.html'));
});

app.get('/posts/:slug', (_req, res) => {
  res.sendFile(path.join(rootDir, 'pages', 'en', 'article.html'));
});

app.get('/yazilar/:slug', (_req, res) => {
  res.sendFile(path.join(rootDir, 'pages', 'tr', 'article.html'));
});

app.get('/api/admin/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/api/admin/photos', async (req, res) => {
  try {
    const limit = Math.max(1, Math.min(Number(req.query.limit || 8), 50));
    const items = await readPhotos();
    const recent = [...items].reverse().slice(0, limit);
    res.json({ ok: true, items: recent });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
});

app.get('/api/admin/blog', async (req, res) => {
  try {
    const parsed = await readBlogIndex();
    const items = Array.isArray(parsed.items) ? [...parsed.items].reverse() : [];
    res.json({ ok: true, items });
  } catch {
    res.json({ ok: true, items: [] });
  }
});

app.post('/api/admin/blog', async (req, res) => {
  try {
    const title = cleanText(req.body.title);
    const lang = normalizeBlogLang(req.body.lang);
    const excerptInput = cleanText(req.body.excerpt || req.body.description);
    const contentHtml = cleanHtml(req.body.contentHtml);
    const category = normalizeBlogCategory(req.body.category);
    const subcategory = normalizeBlogSubcategory(req.body.subcategory, category);

    if (!title) {
      return res.status(400).json({ ok: false, message: 'Title is required.' });
    }

    if (!contentHtml) {
      return res.status(400).json({ ok: false, message: 'Article content is required.' });
    }

    const parsed = await readBlogIndex();
    const items = Array.isArray(parsed.items) ? parsed.items : [];
    const requestedSlug = cleanText(req.body.slug) || title;
    const slug = ensureUniqueBlogSlug(items, requestedSlug);
    const now = new Date().toISOString();
    const excerpt = excerptInput || extractExcerptFromHtml(contentHtml);
    const contentPath = `/data/blog-content/${slug}.html`;

    const item = {
      id: `post-${Date.now()}`,
      title,
      slug,
      category,
      subcategory,
      description: excerpt,
      excerpt,
      lang,
      permalinkEn: `/posts/${slug}`,
      permalinkTr: `/yazilar/${slug}`,
      link: lang === 'tr' ? `/yazilar/${slug}` : `/posts/${slug}`,
      contentPath,
      pubDate: now,
      updatedAt: now
    };

    items.push(item);
    await fs.mkdir(blogContentDir, { recursive: true });
    await fs.writeFile(path.join(blogContentDir, `${slug}.html`), `${contentHtml}\n`, 'utf8');
    await fs.mkdir(path.join(rootDir, 'data'), { recursive: true });
    await writeBlogIndex(items);
    res.json({ ok: true, item });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
});

app.put('/api/admin/blog/:id', async (req, res) => {
  try {
    const id = cleanText(req.params.id);
    if (!id) return res.status(400).json({ ok: false, message: 'Post id is required.' });

    const parsed = await readBlogIndex();
    const items = Array.isArray(parsed.items) ? parsed.items : [];

    const idx = items.findIndex(p => p.id === id);
    if (idx === -1) return res.status(404).json({ ok: false, message: 'Post not found.' });

    const current = items[idx];
    const updatedTitle = cleanText(req.body.title || current.title);
    const updatedLang = normalizeBlogLang(req.body.lang || current.lang);
    const updatedCategory = normalizeBlogCategory(req.body.category || current.category);
    const updatedSubcategory = normalizeBlogSubcategory(req.body.subcategory || current.subcategory, updatedCategory);
    const requestedSlug = cleanText(req.body.slug || current.slug || current.title);
    const updatedSlug = ensureUniqueBlogSlug(items, requestedSlug, current.id);
    const nextContentPath = `/data/blog-content/${updatedSlug}.html`;
    const contentHtml = typeof req.body.contentHtml === 'string' ? cleanHtml(req.body.contentHtml) : null;
    const now = new Date().toISOString();

    await fs.mkdir(blogContentDir, { recursive: true });

    const currentContentFile = current.contentPath
      ? path.join(rootDir, current.contentPath.replace(/^\//, ''))
      : path.join(blogContentDir, `${current.slug}.html`);
    const nextContentFile = path.join(blogContentDir, `${updatedSlug}.html`);

    if (contentHtml !== null) {
      if (!contentHtml) {
        return res.status(400).json({ ok: false, message: 'Article content cannot be empty.' });
      }

      await fs.writeFile(nextContentFile, `${contentHtml}\n`, 'utf8');
      if (current.slug !== updatedSlug && currentContentFile !== nextContentFile && await fileExists(currentContentFile)) {
        await fs.unlink(currentContentFile);
      }
    } else if (current.slug !== updatedSlug && await fileExists(currentContentFile)) {
      await fs.rename(currentContentFile, nextContentFile);
    }

    const finalExcerpt = cleanText(req.body.excerpt || req.body.description || current.excerpt || current.description);
    const updated = {
      ...current,
      title: updatedTitle,
      slug: updatedSlug,
      category: updatedCategory,
      subcategory: updatedSubcategory,
      description: finalExcerpt,
      excerpt: finalExcerpt,
      lang: updatedLang,
      permalinkEn: `/posts/${updatedSlug}`,
      permalinkTr: `/yazilar/${updatedSlug}`,
      link: updatedLang === 'tr' ? `/yazilar/${updatedSlug}` : `/posts/${updatedSlug}`,
      contentPath: nextContentPath,
      pubDate: req.body.pubDate || current.pubDate,
      updatedAt: now
    };

    items[idx] = updated;
    await writeBlogIndex(items);
    res.json({ ok: true, item: updated });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
});

app.delete('/api/admin/blog/:id', async (req, res) => {
  try {
    const id = cleanText(req.params.id);
    if (!id) return res.status(400).json({ ok: false, message: 'Post id is required.' });

    const parsed = await readBlogIndex();
    const items = Array.isArray(parsed.items) ? parsed.items : [];

    const idx = items.findIndex(p => p.id === id);
    if (idx === -1) return res.status(404).json({ ok: false, message: 'Post not found.' });

    const removed = items[idx];
    items.splice(idx, 1);
    if (removed.contentPath) {
      const contentFile = path.join(rootDir, removed.contentPath.replace(/^\//, ''));
      if (await fileExists(contentFile)) {
        await fs.unlink(contentFile);
      }
    }
    await writeBlogIndex(items);
    res.json({ ok: true, deletedId: id });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
});

app.post('/api/admin/blog/upload-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ ok: false, message: 'No image file provided.' });
    }

    if (!['image/png', 'image/jpeg'].includes(req.file.mimetype)) {
      return res.status(400).json({ ok: false, message: 'Only PNG/JPG/JPEG are supported.' });
    }

    await fs.mkdir(blogUploadDir, { recursive: true });
    const optimized = await toWebpUnderLimit(req.file.buffer, maxOutputBytes);
    const sourceName = path.parse(req.file.originalname || '').name;
    const fileNameBase = titleToFileNameBase(sourceName || `blog_${Date.now()}`) || `blog_${Date.now()}`;
    const uniqueName = await createUniqueUploadNameInDirectory(blogUploadDir, fileNameBase);
    const outputPath = uniqueName.outputPath;
    const webPath = `/Images/Uploads/Blog/${uniqueName.fileName}`;

    await fs.writeFile(outputPath, optimized.buffer);

    res.json({
      ok: true,
      url: webPath,
      notice: uniqueName.wasRenamed
        ? `A file with the same name existed, saved as ${uniqueName.fileName}.`
        : null,
      output: {
        bytes: optimized.buffer.length,
        width: optimized.width,
        height: optimized.height,
        quality: optimized.quality
      }
    });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
});

app.put('/api/admin/photos/:id', async (req, res) => {
  try {
    const photoId = cleanText(req.params.id);
    if (!photoId) {
      return res.status(400).json({ ok: false, message: 'Photo id is required.' });
    }

    const titleEn = cleanText(req.body.titleEn);
    const titleTr = cleanText(req.body.titleTr);
    const descriptionEn = cleanText(req.body.descriptionEn);
    const descriptionTr = cleanText(req.body.descriptionTr);
    const categoryKey = cleanText(req.body.categoryKey).toLowerCase();
    const year = Number.parseInt(req.body.year, 10) || new Date().getFullYear();

    if (!titleEn || !titleTr) {
      return res.status(400).json({ ok: false, message: 'Both Turkish and English titles are required.' });
    }

    if (!allowedCategories.has(categoryKey)) {
      return res.status(400).json({ ok: false, message: 'Invalid category key.' });
    }

    const photos = await readPhotos();
    const photoIndex = photos.findIndex(photo => photo.id === photoId);

    if (photoIndex === -1) {
      return res.status(404).json({ ok: false, message: 'Photo not found.' });
    }

    const current = photos[photoIndex];
    const updated = {
      ...current,
      titleEn,
      titleTr,
      descriptionEn,
      descriptionTr,
      categoryKey,
      year
    };

    photos[photoIndex] = updated;
    await fs.writeFile(photosJsonPath, `${JSON.stringify(photos, null, 2)}\n`, 'utf8');

    res.json({ ok: true, item: updated });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
});

app.delete('/api/admin/photos/:id', async (req, res) => {
  try {
    const photoId = cleanText(req.params.id);
    if (!photoId) {
      return res.status(400).json({ ok: false, message: 'Photo id is required.' });
    }

    const photos = await readPhotos();
    const photoIndex = photos.findIndex(photo => photo.id === photoId);

    if (photoIndex === -1) {
      return res.status(404).json({ ok: false, message: 'Photo not found.' });
    }

    const photo = photos[photoIndex];
    const filePath = resolveUploadPath(photo.filename || photo.original || '');

    if (!filePath) {
      return res.status(400).json({ ok: false, message: 'This photo cannot be deleted from the project directory.' });
    }

    if (await fileExists(filePath)) {
      await fs.unlink(filePath);
    }

    photos.splice(photoIndex, 1);
    await fs.writeFile(photosJsonPath, `${JSON.stringify(photos, null, 2)}\n`, 'utf8');

    res.json({ ok: true, deletedId: photoId, deletedFile: true });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
});

app.post('/api/admin/photos/upload', upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ ok: false, message: 'No image file provided.' });
    }

    if (!['image/png', 'image/jpeg'].includes(req.file.mimetype)) {
      return res.status(400).json({ ok: false, message: 'Only PNG/JPG/JPEG are supported.' });
    }

    const titleEn = cleanText(req.body.titleEn);
    const titleTr = cleanText(req.body.titleTr);
    const descriptionEn = cleanText(req.body.descriptionEn);
    const descriptionTr = cleanText(req.body.descriptionTr);
    const categoryKey = cleanText(req.body.categoryKey).toLowerCase();
    const year = Number.parseInt(req.body.year, 10) || new Date().getFullYear();

    if (!titleEn || !titleTr) {
      return res.status(400).json({ ok: false, message: 'Both Turkish and English titles are required.' });
    }

    if (!allowedCategories.has(categoryKey)) {
      return res.status(400).json({ ok: false, message: 'Invalid category key.' });
    }

    await fs.mkdir(uploadDir, { recursive: true });

    const optimized = await toWebpUnderLimit(req.file.buffer, maxOutputBytes);
    const fileNameBase = titleToFileNameBase(titleEn) || 'photo';
    const uniqueName = await createUniqueUploadName(fileNameBase);
    const fileName = uniqueName.fileName;
    const outputPath = uniqueName.outputPath;
    const webPath = `/Images/Uploads/Photos/${fileName}`;

    await fs.writeFile(outputPath, optimized.buffer);

    const photos = await readPhotos();
    const item = {
      id: `photo-${Date.now()}`,
      filename: webPath,
      original: webPath,
      categoryKey,
      titleEn,
      titleTr,
      descriptionEn,
      descriptionTr,
      year
    };

    photos.push(item);
    await fs.writeFile(photosJsonPath, `${JSON.stringify(photos, null, 2)}\n`, 'utf8');

    res.json({
      ok: true,
      item,
      notice: uniqueName.wasRenamed
        ? `A photo with the same name already existed, so the file was saved as ${fileName}.`
        : null,
      output: {
        bytes: optimized.buffer.length,
        width: optimized.width,
        height: optimized.height,
        quality: optimized.quality
      }
    });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
});

app.use((error, _req, res, _next) => {
  if (error?.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ ok: false, message: 'Input file is too large.' });
  }

  return res.status(500).json({ ok: false, message: error.message || 'Unexpected error.' });
});

const server = app.listen(port, () => {
  console.log(`Admin server is running at http://localhost:${port}`);
  console.log('Use /admin (EN) or /yonetim (TR) for panel access.');
  openAdminPanel(port);
});

server.on('error', error => {
  if (error?.code === 'EADDRINUSE') {
    console.log(`Port ${port} is already in use. Opening the existing admin panel...`);
    openAdminPanel(port);
    return;
  }

  console.error(error);
  process.exit(1);
});

function openAdminPanel(currentPort) {
  const url = `http://localhost:${currentPort}/admin`;

  try {
    if (process.platform === 'win32') {
      const child = spawn('cmd', ['/c', 'start', '', url], { detached: true, stdio: 'ignore', shell: false });
      child.unref();
      return;
    }

    const command = process.platform === 'darwin' ? 'open' : 'xdg-open';
    const child = spawn(command, [url], { detached: true, stdio: 'ignore' });
    child.unref();
  } catch {
    console.log(`Open ${url} in your browser.`);
  }
}

async function readPhotos() {
  try {
    const raw = await fs.readFile(photosJsonPath, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function readBlogIndex() {
  try {
    const raw = await fs.readFile(blogJsonPath, 'utf8');
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.items)) {
      return parsed;
    }
    return { status: 'ok', items: [] };
  } catch {
    return { status: 'ok', items: [] };
  }
}

async function writeBlogIndex(items) {
  await fs.mkdir(path.join(rootDir, 'data'), { recursive: true });
  await fs.writeFile(blogJsonPath, `${JSON.stringify({ status: 'ok', items }, null, 2)}\n`, 'utf8');
}

async function toWebpUnderLimit(inputBuffer, maxBytes) {
  const sourceMeta = await sharp(inputBuffer).metadata();
  const sourceWidth = sourceMeta.width || 2560;
  const sourceHeight = sourceMeta.height || 2560;

  let best = null;
  let currentScale = 1;

  for (let scaleStep = 0; scaleStep < 6; scaleStep += 1) {
    const targetWidth = Math.max(480, Math.floor(sourceWidth * currentScale));
    const targetHeight = Math.max(480, Math.floor(sourceHeight * currentScale));

    for (let quality = 86; quality >= 42; quality -= 6) {
      const transformed = await sharp(inputBuffer)
        .rotate()
        .resize({
          width: targetWidth,
          height: targetHeight,
          fit: 'inside',
          withoutEnlargement: true
        })
        .webp({ quality, effort: 6 })
        .toBuffer({ resolveWithObject: true });

      const candidate = {
        buffer: transformed.data,
        width: transformed.info.width,
        height: transformed.info.height,
        quality
      };

      if (!best || candidate.buffer.length < best.buffer.length) {
        best = candidate;
      }

      if (candidate.buffer.length <= maxBytes) {
        return candidate;
      }
    }

    currentScale *= 0.85;
  }

  if (!best) {
    throw new Error('Image conversion failed.');
  }

  return best;
}

function cleanText(value) {
  return String(value || '').trim();
}

function resolveUploadPath(webPath) {
  if (!webPath || typeof webPath !== 'string') {
    return null;
  }

  const normalized = webPath.startsWith('/') ? webPath : `/${webPath}`;
  const expectedPrefix = '/Images/Uploads/Photos/';
  if (!normalized.startsWith(expectedPrefix)) {
    return null;
  }

  const filePath = path.resolve(rootDir, `.${normalized}`);
  const allowedRoot = path.resolve(uploadDir);
  const relative = path.relative(allowedRoot, filePath);

  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    return null;
  }

  return filePath;
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function createUniqueUploadName(baseName) {
  const initialFileName = `${baseName}.webp`;
  const initialOutputPath = path.join(uploadDir, initialFileName);

  if (!(await fileExists(initialOutputPath))) {
    return {
      fileName: initialFileName,
      outputPath: initialOutputPath,
      wasRenamed: false
    };
  }

  let counter = 2;
  while (counter <= 999) {
    const fileName = `${baseName}_${counter}.webp`;
    const outputPath = path.join(uploadDir, fileName);

    if (!(await fileExists(outputPath))) {
      return {
        fileName,
        outputPath,
        wasRenamed: true
      };
    }

    counter += 1;
  }

  throw new Error('Could not generate a unique filename.');
}

async function createUniqueUploadNameInDirectory(directoryPath, baseName) {
  const initialFileName = `${baseName}.webp`;
  const initialOutputPath = path.join(directoryPath, initialFileName);

  if (!(await fileExists(initialOutputPath))) {
    return {
      fileName: initialFileName,
      outputPath: initialOutputPath,
      wasRenamed: false
    };
  }

  let counter = 2;
  while (counter <= 999) {
    const fileName = `${baseName}_${counter}.webp`;
    const outputPath = path.join(directoryPath, fileName);

    if (!(await fileExists(outputPath))) {
      return {
        fileName,
        outputPath,
        wasRenamed: true
      };
    }

    counter += 1;
  }

  throw new Error('Could not generate a unique filename.');
}

function normalizeBlogLang(value) {
  return cleanText(value).toLowerCase() === 'tr' ? 'tr' : 'en';
}

function normalizeBlogCategory(value) {
  const category = cleanText(value).toLowerCase();
  if (!category || !allowedBlogCategories.has(category)) {
    return 'technical';
  }
  return category;
}

function normalizeBlogSubcategory(value, category) {
  const subcategory = cleanText(value).toLowerCase();
  if (category !== 'technical') {
    return '';
  }
  if (!subcategory || !allowedBlogSubcategories.has(subcategory)) {
    return 'systems';
  }
  return subcategory;
}

function cleanHtml(value) {
  return String(value || '').trim();
}

function stripTags(value) {
  return String(value || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function extractExcerptFromHtml(html, maxLength = 190) {
  const plain = stripTags(html);
  if (plain.length <= maxLength) {
    return plain;
  }
  return `${plain.slice(0, maxLength).replace(/\s+\S*$/, '')}...`;
}

function ensureUniqueBlogSlug(items, value, excludeId = '') {
  const base = slugify(value) || `post-${Date.now()}`;
  const used = new Set(
    items
      .filter(item => !excludeId || item.id !== excludeId)
      .map(item => cleanText(item.slug))
      .filter(Boolean)
  );

  if (!used.has(base)) {
    return base;
  }

  let counter = 2;
  while (counter <= 999) {
    const candidate = `${base}-${counter}`;
    if (!used.has(candidate)) {
      return candidate;
    }
    counter += 1;
  }

  return `${base}-${Date.now()}`;
}

function slugify(value) {
  return String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
}

function titleToFileNameBase(value) {
  return cleanText(value)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .replace(/_+/g, '_')
    .slice(0, 80);
}
