# FactEntry Frontend Application

This folder contains the Single Page Application (SPA) client interface for the **FactEntry Platform**, built on React, Vite, and Material-UI.

---

## Technical Stack Overview

The application is built using the following core frameworks and library systems:

* **Core Engine**: [React 19](https://react.dev/) & [TypeScript](https://www.typescriptlang.org/) for highly typed components and responsive state tracking.
* **Build System**: [Vite v8](https://vite.dev/) for extremely fast Hot Module Replacement (HMR) and production bundling.
* **Component UI Library**: [Material-UI (MUI) v9](https://mui.com/) offering robust, accessible grids, tables, forms, and alerts.
* **Animations**: [Framer Motion](https://www.framer.com/motion/) for premium, fluid page transitions and hover effects.
* **API Requests**: [Axios](https://axios-http.com/) for JWT token-authenticated REST calls to the Spring Boot backend.
* **Routing**: [React Router DOM v7](https://reactrouter.com/) for role-based navigation guards and layouts.
* **Data Visualizations**: [Chart.js](https://www.chartjs.org/) & [react-chartjs-2](https://react-chartjs-2.js.org/) for interactive dashboard reports.

---

## Folder Architecture

```text
/frontend
├── dist/                  # Production builds (built using tsc && vite build)
├── public/                # Static assets (favicons, system icons)
└── src/
    ├── assets/            # Project images (corporate logos, hero banners)
    ├── components/        # Layout shells and protected route guards
    ├── context/           # Authentication state context (AuthContext)
    ├── pages/             # Route-specific view components
    ├── App.tsx            # Main application setup, MUI theme initialization, and routing map
    ├── main.tsx           # Dom renderer wrapper
    └── index.css          # Global CSS stylesheet (custom dark/light variable palettes)
```

---

## Theme & Styling System

The application implements a premium, low-contrast workstation theme using **Vanilla CSS Variables** synchronized with the **MUI Theme Provider**. 

### CSS Custom Properties (`index.css`)
Global variables are defined under `:root` (for Dark mode) and `body.light-theme` (for Light mode):

```css
/* Reduced Contrast Palette Examples */
--bg-default: #121824;      /* Softer slate gray */
--bg-paper: #1B2232;        /* Card panels */
--text-primary: #E2E8F0;    /* Slate white text */
--text-secondary: #94A3B8;  /* Muted blue-gray text */
```

### MUI Provider Config (`App.tsx`)
Material-UI is wrapped inside a dynamic `<ThemeProvider>` that reads the active light/dark state and applies responsive variables to headings (`h4`, `h5`, `h6`), body fonts, and background values.
