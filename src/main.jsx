import { createRoot } from 'react-dom/client';
import '@fontsource/moul';
import '@fontsource/moulpali';
import '@fontsource/kantumruy-pro/400.css';
import '@fontsource/kantumruy-pro/500.css';
import '@fontsource/cormorant-garamond/400.css';
import '@fontsource/cormorant-garamond/500.css';
import '@fontsource/cormorant-garamond/400-italic.css';
import '@fontsource/pinyon-script';
import { palette } from './data/wedding';
import './styles/base.css';
import './styles/intro.css';
import './styles/cover.css';
import './styles/sections.css';
import './styles/features.css';
import './styles/print.css';
import { lazy, Suspense } from 'react';
import App from './App';
// tools and print pages load only when opened, so guests download less
const OgCard = lazy(() => import('./components/OgCard'));
const GuestLinks = lazy(() => import('./components/GuestLinks'));
const WallpaperCard = lazy(() => import('./components/WallpaperCard'));
const Admin = lazy(() => import('./components/Admin'));
const Print = lazy(() => import('./components/Print'));
import { GoldDefs } from './components/Decor';

// always start at the top: a reload would otherwise restore the old position under the envelope
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
scrollTo(0, 0);

// palette → CSS custom properties (one source of truth: src/data/wedding.js)
const r = document.documentElement.style;
for (const k of ['paper', 'paperDeep', 'cream', 'creamDeep', 'ink', 'inkSoft']) r.setProperty(`--${k}`, palette[k]);
palette.foil.forEach((c, i) => r.setProperty(`--foil-${i}`, c));

// extra routes on the same static page: ?og (link preview), ?card (wallpaper), ?print=poster|tables|a5,
// ?guests (guest-link tool), ?admin (couple's dashboard)
const q = new URLSearchParams(location.search);
const tool = q.has('og') ? <><GoldDefs /><OgCard /></>
  : q.has('card') ? <><GoldDefs /><WallpaperCard /></>
  : q.has('print') ? <><GoldDefs /><Print /></>
  : q.has('guests') ? <GuestLinks />
  : q.has('admin') ? <Admin />
  : null;
createRoot(document.getElementById('root')).render(tool ? <Suspense fallback={null}>{tool}</Suspense> : <App />);

// installable + offline (production only, so development always sees fresh files)
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}));
}
