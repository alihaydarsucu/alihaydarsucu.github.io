# Jekyll Portfolio Website

Bu proje Jekyll kullanarak temiz URL'ler ile çalışacak şekilde yapılandırılmıştır.

## Kurulum

1. Jekyll'i yükleyin:

```bash
sudo apt update
sudo apt install ruby-full build-essential zlib1g-dev
echo '# Install Ruby Gems to ~/gems' >> ~/.bashrc
echo 'export GEM_HOME="$HOME/gems"' >> ~/.bashrc
echo 'export PATH="$HOME/gems/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
gem install jekyll bundler
```

2. Projeyi çalıştırın:

```bash
cd /home/ali/Desktop/Portfolio
bundle install
bundle exec jekyll serve
```

## URL Yapısı

### İngilizce Sayfalar:

- Ana sayfa: `https://alihaydarsucu.github.io/`
- Yetenekler: `https://alihaydarsucu.github.io/skills/`
- Projeler: `https://alihaydarsucu.github.io/projects/`
- Deneyim: `https://alihaydarsucu.github.io/experience/`

### Türkçe Sayfalar:

- Ana sayfa: `https://alihaydarsucu.github.io/hakkimda/`
- Yetenekler: `https://alihaydarsucu.github.io/yetenekler/`
- Projeler: `https://alihaydarsucu.github.io/projeler/`
- Deneyim: `https://alihaydarsucu.github.io/deneyim/`

### 404 Sayfası:

- `https://alihaydarsucu.github.io/404/`

## GitHub Pages'e Yayınlama

1. GitHub repository'nizde Settings > Pages bölümüne gidin
2. Source olarak "Deploy from a branch" seçin
3. Branch olarak "main" ve folder olarak "/ (root)" seçin
4. Jekyll build işlemi otomatik olarak gerçekleşecektir

## Dosya Yapısı

```
Portfolio/
├── _config.yml          # Jekyll konfigürasyonu
├── _layouts/
│   └── default.html     # Ana layout
├── Gemfile              # Ruby gem bağımlılıkları
├── index.md             # İngilizce ana sayfa
├── hakkimda.md          # Türkçe ana sayfa
├── skills.md            # İngilizce yetenekler sayfası
├── yetenekler.md        # Türkçe yetenekler sayfası
├── projects.md          # İngilizce projeler sayfası
├── projeler.md          # Türkçe projeler sayfası
├── experience.md        # İngilizce deneyim sayfası
├── deneyim.md           # Türkçe deneyim sayfası
├── 404.md               # 404 sayfası
├── style.css            # Stil dosyası
├── script.js            # JavaScript dosyası
└── Assets/              # Varlık dosyaları
    └── Images/          # Resim dosyaları
```

## Özellikler

- ✅ Temiz URL'ler (dosya uzantısı yok)
- ✅ İki dilli destek (İngilizce/Türkçe)
- ✅ Responsive tasarım
- ✅ Dark mode
- ✅ GitHub projelerini otomatik çekme
- ✅ SEO optimizasyonu
- ✅ 404 sayfası

## Not

Eski HTML dosyalarınızı (`index.html`, `skills.html`, vb.) silebilirsiniz çünkü artık Jekyll Markdown dosyaları kullanıyor.
