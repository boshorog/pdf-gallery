# KindPixels PDF Gallery

A WordPress plugin for creating beautiful PDF and document galleries with lightbox support.

## Features

- **Multiple Gallery Types**: Create unlimited galleries for different use cases
- **Lightbox Viewer**: Built-in PDF viewer with zoom, download, and navigation
- **Drag & Drop Ordering**: Easily reorder documents in your galleries
- **File Analytics (Pro)**: Track document views and clicks
- **Responsive Design**: Works on all devices
- **Custom Thumbnails**: Auto-generated or custom thumbnail images

## Development

### Prerequisites

- Node.js 18+
- npm or bun

### Setup

```sh
# Install dependencies
npm install

# Start development server
npm run dev
```

### Building

```sh
# Build Free version (for WordPress.org)
npm run build:free

# Build Pro version (for Freemius)
npm run build:pro

# Build and package both versions
node scripts/build-plugin.cjs
```

## Technology Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui

## License

GPL-2.0-or-later
