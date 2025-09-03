import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Look for WordPress root element first, then fallback to default
const rootElement = document.getElementById("newsletter-gallery-root") || document.getElementById("root");

if (rootElement) {
  createRoot(rootElement).render(<App />);
}
