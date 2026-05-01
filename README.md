
<div align="center">
   <img src="Images/Icons/icon.webp" alt="Logo" width="120">
   <h1>Ali Haydar Sucu</h1>
   <p>Computer Engineering Student | Embedded & AI Enthusiast</p>
</div>

- [Project Overview](#project-overview)
- [Features](#features)
- [Blog System](#blog-system)
- [Photos Gallery](#photos-gallery)
- [CV Generation](#cv-generation)
- [Tech & Structure](#tech--structure)
- [Responsive Design](#responsive-design)
- [Getting Started](#getting-started)
- [Contact](#contact)


## Project Overview

This repository contains my personal portfolio and blog website, featuring a fully automated CV generation system and a bilingual, category-based blog. The site is designed for both professional presentation and technical content sharing, with a modern, responsive UI and seamless English/Turkish support.


## Features

- **Bilingual Website**: All content and navigation available in English and Turkish, with instant language switching and clean URLs for both languages.
- **Responsive Design**: Mobile-first, grid-based layouts, hamburger navigation, and adaptive breakpoints (1200px, 1035px, 768px, 470px, 370px).
- **Dark/Light Mode**: Automatic system detection and manual toggle, with persistent user preference.
- **Modern UI/UX**: Accessible, semantic HTML, ARIA labels, and visually appealing design.
- **Automated CV Generation**: LaTeX-based, ATS-optimized, Oxford-style CV, auto-built and versioned via GitHub Actions.
- **Dynamic Blog System**: Blog posts are written and managed locally from the admin panel, then published with category, subcategory, and language metadata.
- **Photos Gallery**: Interactive photo gallery with search, category filtering, pagination (10 items/page), lightbox viewer with keyboard navigation, and bilingual support.
- **Clean URL Routing**: Blog posts accessible via `/posts/slug` (EN) and `/yazilar/slug` (TR); Photos accessible via `/photos` (EN) and `/fotograflar` (TR), with .htaccess rewrite support.
- **Social & SEO**: Open Graph, Twitter Card, and SEO meta tags; social links including Chess.com, LinkedIn, GitHub.

---

## Blog System

- **Content Source**: Blog posts are written in the local admin editor and saved in project files.
- **Storage Model**: Post index is stored in `data/blog-posts.json`; full article content is stored in `data/blog-content/<slug>.html`.
- **Local Uploads**: Article images are uploaded and optimized locally into `Images/Uploads/Blog`.
- **Category System**:
  - Main: Technical, History, Fiction (TR); only Technical (EN)
  - Subcategories (Technical): Systems, Embedded, AI
- **Tab Navigation**: Blog pages feature a two-level tab system for category and subcategory filtering, with language-specific tab logic.
- **Multilingual UI**: All blog UI elements, empty states, and buttons are translated.
- **Share & Copy**: Blog posts have a share button that copies the clean site URL to clipboard.
- **JSON Structure**: `data/blog-posts.json` contains post metadata used for filtering and display.

---

## Photos Gallery

- **Photo Storage**: Photos stored in `/Images/Projects/` and referenced via `/data/photos.json`.
- **Data Structure**: JSON file contains bilingual metadata (titles, descriptions) with category tags and filenames.
- **Features**:
  - **Search**: Real-time search by title, description, or category tag
  - **Category Filtering**: Filter photos by tags (Flag, Landscape, Cat, Building, etc.) with bilingual labels
  - **Pagination**: 10 photos per page with next/previous navigation and page number buttons
  - **Lightbox Viewer**: Fixed-position modal with 80% zoom level, smooth animations, and keyboard navigation (Arrow keys, Escape)
  - **Scroll Lock**: Page scrolling is disabled when lightbox is open for better UX
  - **Responsive Grid**: Adaptive layout with 280px tile height on desktop, 200px on mobile
- **Multilingual UI**: All gallery labels (search, filters, pagination) are translated to English and Turkish
- **Clean URLs**: Gallery accessible via `/photos` (EN) and `/fotograflar` (TR), with language-specific navigation

---

## CV Generation

- **LaTeX Engine**: CV is written in LaTeX (`cv/cv.tex`) and built with LuaLaTeX.
- **Automation**: GitHub Actions workflow auto-builds and versions the CV on every commit to `cv/`.
- **ATS-Optimized**: Layout and content are designed for applicant tracking systems.
- **Downloadable**: Latest CV is always available for download on the site.

---


## Tech & Structure

<details>
<summary>🛠️ Technology Stack & 📁 Project Structure (click to expand)</summary>
<br>
<div align="center">
   <img src="https://skillicons.dev/icons?i=html,css,js,latex,githubactions" alt="Skill Icons" height="40">
</div>

<br>

**Frontend:** HTML5, CSS3 (Flexbox/Grid), JavaScript (ES6+), Font Awesome 6<br>
**Automation:** GitHub Actions (blog & CV workflows)<br>
**Other:** LaTeX (LuaLaTeX), .htaccess for clean URLs<br>
**No backend:** All dynamic content is client-side or via GitHub Actions

```text
.
├── .github/workflows/         # Blog & CV automation
│   ├── update-blog.yml        # Blog data sync
│   └── generate-cv.yml        # CV generation
├── Assets/                    # Generated CV PDFs
├── cv/                        # CV source files (LaTeX)
├── data/                      # Gallery and blog data
│   ├── blog-content/          # Article HTML files (slug-based)
│   ├── blog-posts.json        # Blog index metadata
│   └── photos.json            # Photo metadata (bilingual)
├── Images/                    # Icons, screenshots, projects, etc.
├── pages/                     # Language-specific pages
│   ├── en/                    # English pages
│   └── tr/                    # Turkish pages
├── *.html                     # Root pages (index, 404, etc.)
├── style.css                  # Main stylesheet
├── script.js                  # Main JavaScript (UI, navigation, language, etc.)
├── photos.js                  # Photos gallery JavaScript (search, filter, pagination, lightbox)
├── .htaccess                  # URL rewriting for clean routes
└── admin-server.js            # Local admin API server
```
</details>

<details>
<summary>🖼️ Visual Showcase (click to expand)</summary>

<div align="center">
   <h3>Desktop View (Dark Mode)</h3>
   <img src="Screenshots/desktop-home.png" alt="Desktop Homepage" width="90%">
   <p>Homepage on Desktop</p>
   <h3>Mobile Views</h3>
   <table>
      <tr>
         <td align="center">
            <img src="Screenshots/mobile-experience-dark.png" alt="Mobile Experience (Dark Mode) Page" width="200">
            <p>Experience (Dark Mode)</p>
         </td>
         <td align="center">
            <img src="Screenshots/mobile-projects-light.png" alt="Mobile Projects (Light Mode) Page" width="200">
            <p>Projects (Light Mode)</p>
         </td>
         <td align="center">
            <img src="Screenshots/mobile-skills-dark.png" alt="Mobile Skills (Dark Mode) Page" width="200">
            <p>Skills (Dark Mode)</p>
         </td>
      </tr>
   </table>
</div>
</details>

## Responsive Design

- **Grid Layouts**: Home and blog pages use adaptive grid layouts (3-col, 2-col, 1-col) based on breakpoints.
- **Hamburger Menu**: Navigation switches to mobile menu below 1035px, with logo left and hamburger right.
- **Tab System**: Blog uses two-level tabs for category/subcategory filtering, with language-specific logic.
- **Mobile Optimizations**: Touch targets, font scaling, and single-column layouts for small screens.

---

## Getting Started

### Prerequisites

- Modern web browser
- GitHub account (for development)
- Node.js (for local admin server)
- LaTeX distribution (for local CV generation)

### Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/alihaydarsucu/alihaydarsucu.github.io.git
   ```
2. Open `index.html` in your browser

### Local Blog Authoring (Optional)

To manage blog posts locally from the admin panel:

```bash
npm install
npm run admin
```

Then open `/admin` (EN) or `/yonetim` (TR), write the post, and publish.

### Building the CV Locally

1. Install a full LaTeX distribution (e.g., TeX Live)
2. Navigate to the `cv` directory
3. Run:
   ```bash
   lualatex cv.tex
   ```
4. The compiled PDF will be available as `cv.pdf` in the `cv` directory

---

## Contact

- GitHub: [@alihaydarsucu](https://github.com/alihaydarsucu)
- Email: [alihaydarsucu@gmail.com](mailto:alihaydarsucu@gmail.com)
- LinkedIn: [ali-haydar-sucu](https://linkedin.com/in/ali-haydar-sucu)
- Website: [alihaydarsucu.github.io](https://alihaydarsucu.github.io)

---

<div align="center">
  Made with ❤️ by Ali Haydar Sucu
</div>


