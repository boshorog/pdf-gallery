import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

const isEmbedded = () => {
  try {
    return window.self !== window.top;
  } catch {
    // Cross-origin access can throw; if so, we're definitely embedded.
    return true;
  }
};

// When rendered inside a WordPress iframe, ensure the document background is transparent.
if (typeof window !== 'undefined' && isEmbedded()) {
  document.documentElement.classList.add('pdfg-embedded');
}

// Look for WordPress root element first, then fallback to default
const rootElement =
  document.getElementById("pdf-gallery-root") ||
  document.getElementById("newsletter-gallery-root") ||
  document.getElementById("root");

if (rootElement) {
  createRoot(rootElement).render(<App />);
}
