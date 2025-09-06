# CV Generation

This directory contains the LaTeX source files for automatically generating an ATS-compatible CV from the website content.

## Features

- **Oxford-style academic CV** optimized for ATS (Applicant Tracking System) compatibility
- **Automatic generation** via GitHub Actions when CV files are modified
- **Professional formatting** with clean, readable layout
- **Two-page support** without strict single-page limitations
- **Modern typography** using LaTeX best practices

## Files

- `cv.tex` - Main LaTeX source file for the CV
- `README.md` - This documentation file

## Automatic Updates

The CV is automatically regenerated **only** when:

- Changes are made to files in the `cv/` directory
- A pull request modifies files in the `cv/` directory
- The workflow is manually triggered

**Note:** The automation now only triggers when CV-related files are modified, not on every commit to the repository.

The generated PDF is automatically placed in the `Assets/` directory with timestamped filenames:

- `AliHaydarSucu_CV_YYYYMMDD.pdf`
- `AliHaydarSucu_Resume_DD.MM.YY.pdf`

## Manual Generation

To manually generate the CV locally:

1. Install LaTeX (on Ubuntu/Debian):

   ```bash
   sudo apt-get install texlive-latex-extra texlive-fonts-recommended texlive-fonts-extra texlive-luatex
   ```

2. Compile the CV:
   ```bash
   cd cv
   lualatex cv.tex
   lualatex cv.tex  # Run twice for proper cross-references
   ```

## Workflow Triggers

The GitHub Actions workflow is configured to trigger on:

- **Push to main/v2 branches** - Only when `cv/` directory files are modified
- **Pull requests** - Only when `cv/` directory files are modified
- **Manual trigger** - Can be run manually from GitHub Actions tab

## Customization

The CV template includes:

- Oxford blue color scheme for professional appearance
- ATS-friendly fonts and formatting
- Modular sections that can be easily rearranged
- Responsive layout that works well in both digital and print formats

## ATS Optimization

The CV is optimized for ATS systems with:

- Standard fonts (Latin Modern/Computer Modern)
- Clear section headers
- Consistent formatting
- Proper use of whitespace
- Keyword-rich content
- Standard date formats
