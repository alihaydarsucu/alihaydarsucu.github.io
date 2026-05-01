const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs/promises');
const path = require('path');

const app = express();
const port = Number(process.env.ADMIN_PORT || 8787);
const rootDir = __dirname;

const photosJsonPath = path.join(rootDir, 'data', 'photos.json');
const uploadDir = path.join(rootDir, 'Images', 'Uploads', 'Photos');
const maxOutputBytes = 1024 * 1024;
const maxInputBytes = 25 * 1024 * 1024;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: maxInputBytes }
});

app.use(express.static(rootDir));
app.use(express.json());

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

    const allowedCategories = new Set(['flag', 'landscape', 'cat', 'building']);
    if (!allowedCategories.has(categoryKey)) {
      return res.status(400).json({ ok: false, message: 'Invalid category key.' });
    }

    await fs.mkdir(uploadDir, { recursive: true });

    const optimized = await toWebpUnderLimit(req.file.buffer, maxOutputBytes);
    const baseName = slugify(path.parse(req.file.originalname).name) || 'photo';
    const fileName = `${Date.now()}-${baseName}.webp`;
    const outputPath = path.join(uploadDir, fileName);
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

app.listen(port, () => {
  console.log(`Admin server is running at http://localhost:${port}`);
  console.log('Use /admin (EN) or /yonetim (TR) for panel access.');
});

async function readPhotos() {
  try {
    const raw = await fs.readFile(photosJsonPath, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
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

function slugify(value) {
  return String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
}
