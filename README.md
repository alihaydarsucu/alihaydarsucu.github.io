# Ali Haydar Sucu - Personal Portfolio & Auto-Generated CV

Bu proje, kişisel portfolyo web sitemi ve GitHub Actions kullanarak otomatik olarak oluşturulan ATS uyumlu CV sistemini içermektedir.

## 🚀 Özellikler

### Web Sitesi

- **Responsive tasarım** - Tüm cihazlarda mükemmel görünüm
- **Karanlık/Aydınlık mod** - Kullanıcı tercihi
- **Çoklu dil desteği** - Türkçe/İngilizce
- **Dinamik proje entegrasyonu** - GitHub API ile otomatik proje güncellemeleri
- **Modern UI/UX** - Temiz ve profesyonel tasarım

### Otomatik CV Oluşturma

- **Oxford stili LaTeX CV** - Akademik ve profesyonel görünüm
- **ATS uyumlu format** - İş başvuru sistemleri için optimize
- **Otomatik güncelleme** - Her commit ile yeni CV
- **İki sayfa desteği** - Uzunluk kısıtlaması yok
- **Profesyonel tipografi** - LaTeX'in güçlü yazım özellikleri

## 🛠️ Teknolojiler

### Frontend

- HTML5, CSS3, JavaScript
- Font Awesome ikonları
- Responsive Grid/Flexbox
- Modern CSS özellikleri

### Backend/Otomasyon

- GitHub Actions
- LaTeX (LuaLaTeX)
- GitHub API
- Git hooks

### CV Oluşturma

- LaTeX with Oxford template
- LuaLaTeX engine
- FontAwesome5 package
- ATS-optimized formatting

## 📁 Proje Yapısı

```
.
├── .github/workflows/
│   └── generate-cv.yml          # GitHub Actions CV oluşturma
├── Assets/
│   └── *.pdf                    # Otomatik oluşturulan CV'ler
├── cv/
│   ├── cv.tex                   # LaTeX CV template
│   └── README.md                # CV dokümantasyonu
├── Images/                      # Görseller ve ikonlar
├── *.html                       # Web sayfa dosyaları
├── style.css                    # Ana stil dosyası
└── script.js                    # JavaScript fonksiyonları
```

## 🔄 Otomatik CV Sistemi Nasıl Çalışır?

1. **Tetikleme**: Her main/v2 branch'ine push ile
2. **LaTeX Kurulumu**: GitHub Actions runner'da LaTeX kurar
3. **CV Oluşturma**: `cv.tex` dosyasından PDF üretir
4. **Deployment**: Yeni CV'yi `Assets/` klasörüne koyar
5. **Git Güncelleme**: Değişiklikleri otomatik commit eder
6. **Web Entegrasyonu**: JavaScript ile yeni CV linkini günceller

## 📱 Responsive Tasarım

Web sitesi aşağıdaki cihaz boyutları için optimize edilmiştir:

- **Desktop**: 1200px+
- **Laptop**: 992px - 1199px
- **Tablet**: 768px - 991px
- **Mobile**: 320px - 767px

## 🎨 Tema Sistemleri

### Renk Paleti

- **Primary**: #3A86FF (Mavi)
- **Secondary**: #8338EC (Mor)
- **Accent**: #FF006E (Pembe)
- **Oxford Blue**: #002147 (CV için)

### Dark Mode

Kullanıcı tercihini localStorage'da saklar ve sistem genelinde uygular.

## 📊 Performans Optimizasyonları

- **Lazy Loading**: Görseller için
- **Font Preloading**: Kritik fontlar
- **CSS Minification**: Prodüksiyon için
- **Image Optimization**: WebP formatları
- **Cache Headers**: Static assets için

## 🔒 ATS Optimizasyonu

CV template şu özelliklere sahiptir:

- **Standard fontlar**: Latin Modern
- **Temiz başlıklar**: Açık hiyerarşi
- **Anahtar kelime zengin**: İş arayanlar için
- **Standart format**: PDF/A uyumlu
- **Okunabilir düzen**: Makine ve insan için

## 🚦 Kurulum ve Çalıştırma

### Yerel Geliştirme

```bash
# Repository'yi klonla
git clone https://github.com/alihaydarsucu/alihaydarsucu.github.io.git

# Proje dizinine git
cd alihaydarsucu.github.io

# Live server başlat (VS Code Live Server extension önerilir)
# Veya Python ile basit server:
python -m http.server 8000
```

### CV'yi Manuel Oluşturma

```bash
# LaTeX kurulumu (Ubuntu/Debian)
sudo apt-get install texlive-latex-extra texlive-fonts-recommended texlive-fonts-extra texlive-luatex

# CV oluştur
cd cv
lualatex cv.tex
lualatex cv.tex  # İkinci kez çapraz referanslar için
```

## 📈 GitHub Actions Workflow

Workflow şu durumlarda çalışır:

- Push to main/v2 branch
- Pull request açılması
- Manuel tetikleme

Çıktılar:

- `AliHaydarSucu_CV_YYYYMMDD.pdf`
- `AliHaydarSucu_Resume_DD.MM.YY.pdf`

## 🔧 Konfigürasyon

### CV Güncelleme

CV içeriğini güncellemek için `cv/cv.tex` dosyasını düzenleyin.

### Web İçeriği

HTML dosyalarını düzenleyerek içerik güncelleyin. JavaScript otomatik olarak GitHub API'den projeleri çeker.

## 🎯 Gelecek Planlar

- [ ] Multiple CV templates
- [ ] Automated content extraction from LinkedIn
- [ ] Email notification for CV updates
- [ ] SEO optimization
- [ ] Analytics integration
- [ ] Multi-language CV support

## 📄 Lisans

Bu proje MIT lisansı altında yayınlanmıştır.

## 📞 İletişim

- **Email**: alihaydarsucu@gmail.com
- **LinkedIn**: [ali-haydar-sucu](https://linkedin.com/in/ali-haydar-sucu)
- **GitHub**: [alihaydarsucu](https://github.com/alihaydarsucu)
- **Website**: [alihaydarsucu.github.io](https://alihaydarsucu.github.io)

---

⭐ Bu projeyi beğendiyseniz star vermeyi unutmayın!
