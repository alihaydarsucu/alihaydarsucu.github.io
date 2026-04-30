Plan: Fotoğraflar Sayfaları → Lokal Admin Panel (Öncelik: Fotoğraflar)

Amaç
- `alihaydarsucu.github.io` sitesine iki aşamalı olarak: (1) Fotoğraflar sayfası eklemek, (2) Lokal bir admin paneli ile içerik yönetimini sağlamak.
- Site frontend olarak tamamen statik kalacak; admin panel yerelde çalışacak ve içerik değişikliklerini yerel dosyalara kaydedecek (opsiyonel: otomatik yerel git commit). Remote push yalnızca manuel yapılacak.

Aşamalar ve kabul kriterleri

1) Veri şeması ve örnek veri
- Oluştur: `data/photos.json` (veya `_data/photos.json`) — her resim için örnek alanlar:
  - id, filename, title, description, category ("Türk bayrağı"|"Manzara"|"Kedi"|"Yapı"), thumb (opsiyonel), year
- Kabul: JSON ile galerinin tüm içeriği yönetilebilmeli.

2) Fotoğraflar sayfası (İng/Tr)
- Yeri: `pages/en/photos.html` ve `pages/tr/photos.html` (ya da `pages/en/photos/index.html` tercih edilebilir)
- İşlevler: kategori filtreleri, grid görünüm, lightbox açılışı, sayfalama (opsiyonel)
- Yol bağımsızlığı: asset yolları absolute olacak (`/Images/...` ve `/style.css`, `/script.js`).
- Kabul: Galeri JSON'dan render olmalı, filtre ve lightbox çalışmalı.

3) Frontend uygulama (gallery JS)
- Modüller: JSON yükleyici, render fonksiyonu, filtre handler, lightbox, responsive grid
- Test: Desktop ve mobilde düzgün görünmeli, erişilebilirlik (alt attribute, keyboard ile lightbox kapatma).

4) Fotoğraf optimizasyon & dosya organizasyonu
- Yüklenen RAW fotoğraflar için `Images/Photos/originals/`, web-optimize edilmiş için `Images/Photos/thumbs/`.
- Mini görev: örnek 8-12 fotoğraf ekle,

5) Lokal admin seçenek değerlendirmesi
- Seçenek A — Decap CMS / NetlifyCMS (local decap-server): hazır, git tabanlı, media upload ve dosya oluşturma yapar; kolay kurulum.
- Seçenek B — Minimal lokal admin: küçük Node/Express veya Electron app; JSON edit + image upload + lokal git commit (push yok).
- Karar kriterleri: basitlik, offline kullanım, medya yükleme, güvenlik.

6) Admin uygulaması (seçilen yöntem)
- Decap: oluştur `admin/index.html` + `admin/config.yml`, media_folder= `Images/Photos/uploads`, collections: `photos` (folder: `data/photos.json` veya `_data/photos`)
- Minimal: `admin/` içinde küçük UI -> write JSON & save images to `Images/Photos/`; opsiyonel `git commit -m "Add photos"` (local)
- Kabul: Admin ile yeni fotoğraf eklediğimde repo içindeki JSON ve/veya image dosyaları güncellenmeli.

7) Entegrasyon ve otomasyon
- Opsiyonel otomatik local git commit: admin işleminden sonra `git add -A && git commit -m "content: add photo"` çalıştırılacak; push yapılmayacak.

8) Dokümantasyon
- `README.md` içinde: nasıl admin başlatılır, nasıl fotoğraf eklenir, image optimize komutları (ör: `mogrify` veya `squoosh` önerisi), nasıl lokal commit yapılır.

Teknik notlar / Örnek JSON şeması

[ örnek `data/photos.json`]
[
  {
    "id": "tbayrak-001",
    "filename": "/Images/Photos/thumbs/tbayrak-001.webp",
    "original": "/Images/Photos/originals/tbayrak-001.jpg",
    "title": "Ayasofya ve Bayrak",
    "description": "İstanbul'da çekildi, gün batımıyla birlikte...",
    "category": "Türk bayrağı",
    "year": 2024
  }
]

Yerel deneme / çalıştırma (örnek)
- Decap (local) çalıştırma önerisi:
```bash
# proje kökünde
npx decap-server --config admin/config.yml
# sonra http://localhost:8081/admin ziyaret edilir
```
- Minimal admin için (örnek):
```bash
# proje kökünde
cd admin
npm install
node server.js   # admin arayüzünü başlatır
```

Sonraki adım önerisi (ben yapabilirim)
- İlk adım olarak ben: 1) `data/photos.json` için örnek dosya oluşturur, 2) `pages/en/photos.html` + `pages/tr/photos.html` iskeletini hazırlar, 3) basit gallery JS iskeleti eklerim. Ardından admin yaklaşımını sizinle kararlaştırdıktan sonra admin implementasyonuna geçerim.

İsterseniz şimdi ilk üç adımı (örnek JSON + iki fotoğraflar sayfası + gallery JS iskeleti) uygulayayım.