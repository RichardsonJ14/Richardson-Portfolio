# Richardson J — Data Science & Analytics Portfolio

A personal portfolio site with a retro terminal / pixel aesthetic, built with plain HTML, CSS and JavaScript — no frameworks, no build step.

> I turn complex datasets into actionable business insights — through predictive models, clean SQL, and dashboards people actually use.

## Sections

| Section | What it shows |
| --- | --- |
| **Intro** (`WHO_I_AM`) | Bio and career focus |
| **Stats** (`SYS_STATS`) | Key metrics and core stack |
| **History** (`LOG_HISTORY`) | ML internship at NSIC, B.E. Computer Science, Diploma in Computer Engineering |
| **Projects** (`BUILD_LOG`) | End-to-end ML, BI and IoT projects |
| **Skills** (`SKILL_GRAPH`) | Technical skill map |
| **Contact** (`LET'S_TALK`) | Email, GitHub, LinkedIn |

## Features

- Animated boot-up loading sequence (skipped on repeat visits within a session)
- Animated canvas background and custom cursor
- Scroll-driven reveals, counters and glitch text effects
- Responsive layout with a skip-to-content link for accessibility

## Tech stack

- HTML5, CSS3, vanilla JavaScript
- Google Fonts: Inter, JetBrains Mono, Pixelify Sans

## Project structure

```
.
├── index.html          # Page markup
├── styles.css          # All styling
├── boot.js             # Boot / loading screen
├── bg.js               # Animated background
├── script.js           # Navigation, counters, interactions
├── fx.js               # Visual effects
├── cursor.js           # Custom cursor
└── favicon.svg         # Site icon
```

## Run locally

No install needed — open `index.html` in a browser, or serve the folder:

```bash
python -m http.server 8000
# then visit http://localhost:8000
```

## Deploy

The site is fully static, so it can be hosted on GitHub Pages: **Settings → Pages → Deploy from branch → `main` / root**.

## Contact

- GitHub: [RichardsonJ14](https://github.com/RichardsonJ14)
- LinkedIn: [richardson-j](https://linkedin.com/in/richardson-j)

---

© Richardson J. All rights reserved.
