import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Copy, FileImage, Layers, Settings, BookOpen, Crown, ExternalLink, Eye, LayoutGrid } from 'lucide-react';
import PDFAdmin from '@/components/PDFAdmin';
import PDFGallery from '@/components/PDFGallery';
import PDFSettings from '@/components/PDFSettings';
import SettingsProposal2 from '@/components/SettingsProposal2';
import PluginDocumentation from '@/components/PluginDocumentation';
import { useLicense } from '@/hooks/useLicense';

import { Gallery, GalleryItem, GalleryState } from '@/types/gallery';
import pdfGalleryLogo from '@/assets/pdf-gallery-logo.svg';

const PLUGIN_VERSION = '1.8.1';

// Kind Pixels Logo SVG Component
const KindPixelsLogo = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 9000 1000" 
    className={className}
    style={{ shapeRendering: 'geometricPrecision', ...style }}
  >
    <g fill="currentColor">
      <path d="M2233.79 555.7l-96.37 2.35 0.57 -175.04 -154.7 2.06 -1.6 -173.14 -146.85 1.12 -1.7 -195.94c-45.96,-0.29 -167.39,-6.91 -203.53,4.62 -9.91,32.31 -5.94,860.17 -4.64,962.85l209.94 -1.1 -3.27 -571.32 90.2 1.07 1.69 176.67 153.21 -3.04 -2.48 178.11 158.77 -2.95 1.29 222.53 205.19 -1.84 0.06 -725.81c0.21,-51.66 6.58,-198.67 -2.68,-239.63l-199.38 0.41 -3.71 538.02z"/>
      <path d="M2782.42 218.02l361.8 -1.5 -3.39 565 -357.76 1.61 -0.65 -565.11zm-204.16 766.15l621.63 0.37 -3.28 -179.36 156.21 1.76 -0 -620.01 -153.1 -2.28 -7.42 -169.54 -612.09 2.48c-13.52,53.35 -2.85,843.35 -1.95,966.58z"/>
      <path d="M619.3 189.85l-150.81 -4.09 1.22 131.72 -144.92 -0.23 0.28 59.14 -73.73 0.44 -0.11 -356.13 -204.28 -1.54 0.75 963.3 205.56 0.66 -0.56 -409.22 76.41 -1.06 -1.66 77.51 137.26 0.91 2.84 155.23c22.52,-0.04 150.39,-8.21 151.61,6.93 0.16,2 1.31,2.78 1.5,3.74l2.05 165.74 203.24 -0.39 -0.63 -199.41 -146.02 -1.19 -3.59 -178.85 -156.08 -0.62 2.37 -214.72 157.29 0.48 -1.54 -171.63 147.46 -2.21c-0.21,-14.75 4.64,-181.63 -4.09,-190.68 -7.06,-7.31 5.94,-7.1 -42.13,-6.45 -17.91,0.24 -35.87,0.04 -53.78,0.01 -31.45,-0.07 -74.27,-2.18 -104.27,1.23l-1.65 171.39z"/>
      <polygon points="959.98,213.66 1122.11,214.09 1122.78,786.4 959.55,787.18 959.87,985.04 1492.95,982.91 1493.59,785.24 1332.07,785.79 1330.01,213.45 1491.87,212.75 1493.84,18.12 960.3,18.77"/>
      <path d="M6780.81 214.09l570.8 -1.32 -0.56 -203.05 -775.41 3.46c-9.35,47.31 -2.57,187.02 -2.4,243.82 0.25,82.41 0.67,164.78 0.49,247.2 -0.35,161.84 3.15,324.5 1.13,487.85l773.44 -2.51 1.34 -193.26c-46.72,-9.99 -475.93,-1.02 -568.22,-2.57l1.3 -191.18c89.48,2.74 383.56,-7.63 437.09,1.26l0.44 -203.78 -437.96 -0.28 -1.47 -185.63z"/>
      <path d="M8384.28 211.22l358.14 -1.12c9.77,35.06 3.65,78.94 4.45,116.75l205.78 0.18 0.4 -201.25c-207.07,4.89 -154.56,22.98 -162.54,-121.09l-461.17 -0.36 -1.4 138.64 -153.78 0.33 -0.59 317.83c41.35,0.22 124.44,-9.5 158.65,6.85l-1.31 129.08 409.7 -1.8 -3.54 192.86 -364.06 0.03 -0.35 -135.48 -199.3 0.31 -0.91 205.73 156.36 1.69 3.32 129.53 462.12 1.61 1.27 -135.03 155.6 -0.51 1.39 -335.31c-40.3,-4.55 -133.24,-0.19 -149.88,-2.7 -34.04,-5.13 -4.96,-80.74 -19.83,-123.98l-398.45 -2.94 -0.06 -179.87z"/>
      <path d="M4612.05 482.24c-106.36,2.77 -216.67,-1.76 -323.87,-0.54 -39.48,0.45 -51.22,10.31 -53.29,-25.18 -1.49,-25.56 -0.39,-55.3 -0.37,-81.31 0.03,-53.26 1.26,-108.16 -0.31,-161.14l377.61 -0.33 0.24 268.48zm53.83 200.72c2.61,-40.3 -7.16,-92.63 4.95,-128.75 38.97,-11.43 108.01,-3.39 153.53,-4.49l0.39 -401.2 -159.45 -1.79 -1.78 -136.28 -630.07 2.47c-13.82,39.11 -4.29,866.98 -2.98,980.31l204.31 -0.19 -1.36 -305.71 432.44 -4.38z"/>
      <path d="M6234.77 182.01l-144.91 -0.06 0.33 146.67 -125.78 0.92 -1.84 -145.49c-50.58,-4.74 -95.18,-1.8 -147.83,-1.27l0.49 -169.49 -206.99 -0.92 1.1 203.79c38.24,-8.05 104.66,-3.16 145.78,-1.67l0.35 171.21 155.85 0.4 1.12 232.19 -154.47 1.04 -2.57 176.77c-33.59,-9.77 -113.46,-5.15 -149.7,-1.08l0.77 196.78 208.87 1.75 -0.61 -167.46 148.08 -0.11 1.5 -153.99 126.93 0.15 3.17 153.41 139.26 0.63 0.02 167.76 204.48 -0.79 1.11 -200.61 -140.16 1.43c-3.31,-50.58 -2.96,-116.48 -4.31,-174.11l-149.62 1c-12.45,-28.24 -8.8,-197.48 -6.02,-237.63l156.52 1.26 -0.68 -168.83 148.19 -1.51 -2.19 -200.93 -201.48 -1.83 -4.76 170.64z"/>
      <path d="M5312.77 212.13l164.58 -1.18 -1.85 -200.15 -535.15 2.22 -0.9 200.38 164.32 2.61 -1.49 577.85 -159.61 0.98c-1.98,35.46 -4.19,173.94 3.38,200.83l528.31 -0.86 0.52 -199.92 -164.27 -3.35 2.16 -579.42z"/>
      <polygon points="7486.76,990.74 8082.39,991.11 8084.34,792.19 7690.05,793.57 7689.89,9.8 7483.81,9.93"/>
    </g>
  </svg>
);

// Initial PDF data (fallback for development)
const initialPDFs: GalleryItem[] = [
  {
    id: '1',
    title: 'Newsletter January 2024',
    date: 'January 2024',
    pdfUrl: '/src/assets/newsletter-thumbnail-1.jpg',
    thumbnail: '/src/assets/newsletter-thumbnail-1.jpg',
    fileType: 'pdf'
  },
  {
    id: '2',
    title: 'Newsletter February 2024',
    date: 'February 2024',
    pdfUrl: '/src/assets/newsletter-thumbnail-2.jpg',
    thumbnail: '/src/assets/newsletter-thumbnail-2.jpg',
    fileType: 'pdf'
  },
  {
    id: '3',
    title: 'Newsletter March 2024',
    date: 'March 2024',
    pdfUrl: '/src/assets/newsletter-thumbnail-3.jpg',
    thumbnail: '/src/assets/newsletter-thumbnail-3.jpg',
    fileType: 'pdf'
  },
  {
    id: '4',
    title: 'Newsletter April 2024',
    date: 'April 2024',
    pdfUrl: '/src/assets/newsletter-thumbnail-4.jpg',
    thumbnail: '/src/assets/newsletter-thumbnail-4.jpg',
    fileType: 'pdf'
  }
];

const Index = () => {
  const [galleryState, setGalleryState] = useState<GalleryState>({
    galleries: [],
    currentGalleryId: ''
  });
  const [settings, setSettings] = useState({
    thumbnailStyle: 'default',
    accentColor: '#7FB3DC',
    thumbnailShape: 'landscape-16-9',
    pdfIconPosition: 'top-right',
    defaultPlaceholder: 'default'
  });
  const [shortcodeCopied, setShortcodeCopied] = useState(false);

  useEffect(() => {
    const wp = (typeof window !== 'undefined' && (window as any).wpPDFGallery) ? (window as any).wpPDFGallery : null;
    const urlParams = new URLSearchParams(window.location.search);
    const ajaxUrl = wp?.ajaxUrl || urlParams.get('ajax');
    const nonce = wp?.nonce || urlParams.get('nonce') || '';
    const requestedGalleryName = urlParams.get('name') || '';
    if (ajaxUrl && nonce) {
      // Fetch galleries from WordPress
      const form = new FormData();
      form.append('action', 'pdf_gallery_action');
      form.append('action_type', 'get_galleries');
      form.append('nonce', nonce);
      if (requestedGalleryName) { form.append('requested_gallery_name', requestedGalleryName); }
      fetch(ajaxUrl, {
        method: 'POST',
        credentials: 'same-origin',
        body: form,
      })
        .then((res) => res.json())
        .then((data) => {
          if (data?.success && data?.data) {
            let galleries = data.data.galleries || [];
            let currentGalleryId = data.data.current_gallery_id || '';
            
            if (galleries.length === 0) {
              // Try to restore from local backup if available
              try {
                const backupRaw = localStorage.getItem('pdf_gallery_backup');
                const backup = backupRaw ? JSON.parse(backupRaw) : null;
                if (Array.isArray(backup) && backup.length > 0) {
                  // Ensure galleries have proper structure with names
                  const restoredGalleries = backup.map((gallery: any) => ({
                    id: gallery.id || 'main',
                    name: gallery.name || 'Main Gallery',
                    items: Array.isArray(gallery.items) ? gallery.items : [],
                    createdAt: gallery.createdAt || new Date().toISOString(),
                  }));
                  
                  // Attempt server restore so it persists
                  const restoreForm = new FormData();
                  restoreForm.append('action', 'pdf_gallery_action');
                  restoreForm.append('action_type', 'save_galleries');
                  restoreForm.append('nonce', nonce);
                  restoreForm.append('galleries', JSON.stringify(restoredGalleries));
                  restoreForm.append('current_gallery_id', restoredGalleries[0]?.id || 'main');
                  fetch(ajaxUrl, { method: 'POST', credentials: 'same-origin', body: restoreForm }).catch(() => {});
                  setGalleryState({
                    galleries: restoredGalleries,
                    currentGalleryId: restoredGalleries[0]?.id || 'main',
                  });
                  return; // Done
                }
              } catch {}

              // Create test gallery with sample data
              const testGallery: Gallery = {
                id: 'test',
                name: 'Test Gallery',
                items: [
                  { id: 'div-1', type: 'divider', text: 'First Section' },
                  { id: 'pdf-1', title: 'Sample Document 1', date: 'January 2025', pdfUrl: 'https://www.antiohia.ro/wp-content/uploads/2025/09/newsletter2501_Ce-Ne-Rezerva-Viitorul.pdf', thumbnail: '', fileType: 'pdf' },
                  { id: 'pdf-2', title: 'Sample Document 2', date: 'February 2025', pdfUrl: 'https://www.antiohia.ro/wp-content/uploads/2025/09/newsletter2502_De-La-Februs-La-Hristos.pdf', thumbnail: '', fileType: 'pdf' },
                  { id: 'pdf-3', title: 'Sample Document 3', date: 'March 2025', pdfUrl: 'https://www.antiohia.ro/wp-content/uploads/2025/09/newsletter2503_De-la-Moarte-la-Viata.pdf', thumbnail: '', fileType: 'pdf' },
                  { id: 'pdf-4', title: 'Sample Document 4', date: 'April 2025', pdfUrl: 'https://www.antiohia.ro/wp-content/uploads/2025/09/newsletter2504_Cand-Isus-Ne-Cheama-Pe-Nume.pdf', thumbnail: '', fileType: 'pdf' },
                  { id: 'pdf-5', title: 'Sample Document 5', date: 'May 2025', pdfUrl: 'https://www.antiohia.ro/wp-content/uploads/2025/09/newsletter2505_Inaltarea-Mantuitorului.pdf', thumbnail: '', fileType: 'pdf' },
                  { id: 'pdf-6', title: 'Sample Document 6', date: 'June 2025', pdfUrl: 'https://www.antiohia.ro/wp-content/uploads/2025/09/newsletter2506_Putere-Pentru-O-Viata-Transformata.pdf', thumbnail: '', fileType: 'pdf' },
                  { id: 'pdf-7', title: 'Sample Document 7', date: 'July 2025', pdfUrl: 'https://www.antiohia.ro/wp-content/uploads/2025/09/newsletter2507_Va-Gasi-Rod.pdf', thumbnail: '', fileType: 'pdf' },
                  { id: 'div-2', type: 'divider', text: 'Second Section' },
                  { id: 'pdf-8', title: 'Sample Document 1', date: 'January 2024', pdfUrl: 'https://www.antiohia.ro/wp-content/uploads/2025/09/newsletter2401_Un-Gand-Pentru-Anul-Nou.pdf', thumbnail: '', fileType: 'pdf' },
                  { id: 'pdf-9', title: 'Sample Document 2', date: 'February 2024', pdfUrl: 'https://www.antiohia.ro/wp-content/uploads/2025/09/newsletter2402_Risipa-De-Iubire.pdf', thumbnail: '', fileType: 'pdf' },
                  { id: 'pdf-10', title: 'Sample Document 3', date: 'March 2024', pdfUrl: 'https://www.antiohia.ro/wp-content/uploads/2025/09/newsletter2403_Lucruri-Noi.pdf', thumbnail: '', fileType: 'pdf' },
                  { id: 'pdf-11', title: 'Sample Document 4', date: 'April 2024', pdfUrl: 'https://www.antiohia.ro/wp-content/uploads/2025/09/newsletter2404_O-Sarbatoare-Dulce-Amaruie.pdf', thumbnail: '', fileType: 'pdf' },
                ] as GalleryItem[],
                createdAt: new Date().toISOString(),
              };
              setGalleryState({
                galleries: [testGallery],
                currentGalleryId: 'test'
              });
              // Persist default test gallery on fresh install
              try { localStorage.setItem('pdf_gallery_backup', JSON.stringify([testGallery])); } catch {}
              if (ajaxUrl && nonce) {
                const saveForm = new FormData();
                saveForm.append('action', 'pdf_gallery_action');
                saveForm.append('action_type', 'save_galleries');
                saveForm.append('nonce', nonce);
                saveForm.append('galleries', JSON.stringify([testGallery]));
                saveForm.append('current_gallery_id', 'test');
                fetch(ajaxUrl, { method: 'POST', credentials: 'same-origin', body: saveForm }).catch(() => {});
              }
            } else {
              // If no current gallery is set, use the first gallery
              if (requestedGalleryName) {
                const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9-_]/g, '-');
                const match = galleries.find((g: Gallery) => slug(g.name) === slug(requestedGalleryName));
                if (match) { currentGalleryId = match.id; }
              }
              if (!currentGalleryId && galleries.length > 0) {
                currentGalleryId = galleries[0].id;
              }

              // Server data is the source of truth - save to local backup
              try {
                localStorage.setItem('pdf_gallery_backup', JSON.stringify(galleries));
              } catch {}
              
              setGalleryState({
                galleries,
                currentGalleryId: currentGalleryId
              });
            }
          } else {
            // Create test gallery for development
            const testGallery: Gallery = {
              id: 'test',
              name: 'Test Gallery',
              items: [
                { id: 'div-1', type: 'divider', text: 'First Section' },
                { id: 'pdf-1', title: 'Sample Document 1', date: 'January 2025', pdfUrl: 'https://www.antiohia.ro/wp-content/uploads/2025/09/newsletter2501_Ce-Ne-Rezerva-Viitorul.pdf', thumbnail: '', fileType: 'pdf' },
                { id: 'pdf-2', title: 'Sample Document 2', date: 'February 2025', pdfUrl: 'https://www.antiohia.ro/wp-content/uploads/2025/09/newsletter2502_De-La-Februs-La-Hristos.pdf', thumbnail: '', fileType: 'pdf' },
                { id: 'pdf-3', title: 'Sample Document 3', date: 'March 2025', pdfUrl: 'https://www.antiohia.ro/wp-content/uploads/2025/09/newsletter2503_De-la-Moarte-la-Viata.pdf', thumbnail: '', fileType: 'pdf' },
                { id: 'pdf-4', title: 'Sample Document 4', date: 'April 2025', pdfUrl: 'https://www.antiohia.ro/wp-content/uploads/2025/09/newsletter2504_Cand-Isus-Ne-Cheama-Pe-Nume.pdf', thumbnail: '', fileType: 'pdf' },
                { id: 'pdf-5', title: 'Sample Document 5', date: 'May 2025', pdfUrl: 'https://www.antiohia.ro/wp-content/uploads/2025/09/newsletter2505_Inaltarea-Mantuitorului.pdf', thumbnail: '', fileType: 'pdf' },
                { id: 'pdf-6', title: 'Sample Document 6', date: 'June 2025', pdfUrl: 'https://www.antiohia.ro/wp-content/uploads/2025/09/newsletter2506_Putere-Pentru-O-Viata-Transformata.pdf', thumbnail: '', fileType: 'pdf' },
                { id: 'pdf-7', title: 'Sample Document 7', date: 'July 2025', pdfUrl: 'https://www.antiohia.ro/wp-content/uploads/2025/09/newsletter2507_Va-Gasi-Rod.pdf', thumbnail: '', fileType: 'pdf' },
                { id: 'div-2', type: 'divider', text: 'Second Section' },
                { id: 'pdf-8', title: 'Sample Document 1', date: 'January 2024', pdfUrl: 'https://www.antiohia.ro/wp-content/uploads/2025/09/newsletter2401_Un-Gand-Pentru-Anul-Nou.pdf', thumbnail: '', fileType: 'pdf' },
                { id: 'pdf-9', title: 'Sample Document 2', date: 'February 2024', pdfUrl: 'https://www.antiohia.ro/wp-content/uploads/2025/09/newsletter2402_Risipa-De-Iubire.pdf', thumbnail: '', fileType: 'pdf' },
                { id: 'pdf-10', title: 'Sample Document 3', date: 'March 2024', pdfUrl: 'https://www.antiohia.ro/wp-content/uploads/2025/09/newsletter2403_Lucruri-Noi.pdf', thumbnail: '', fileType: 'pdf' },
                { id: 'pdf-11', title: 'Sample Document 4', date: 'April 2024', pdfUrl: 'https://www.antiohia.ro/wp-content/uploads/2025/09/newsletter2404_O-Sarbatoare-Dulce-Amaruie.pdf', thumbnail: '', fileType: 'pdf' },
              ] as GalleryItem[],
              createdAt: new Date().toISOString(),
            };
            setGalleryState({
              galleries: [testGallery],
              currentGalleryId: 'test'
            });
          }
        })
        .catch(() => {
          // Create test gallery for development
          const testGallery: Gallery = {
            id: 'test',
            name: 'Test Gallery',
            items: [
              { id: 'div-1', type: 'divider', text: 'First Section' },
              { id: 'pdf-1', title: 'Sample Document 1', date: 'January 2025', pdfUrl: 'https://www.antiohia.ro/wp-content/uploads/2025/09/newsletter2501_Ce-Ne-Rezerva-Viitorul.pdf', thumbnail: '', fileType: 'pdf' },
              { id: 'pdf-2', title: 'Sample Document 2', date: 'February 2025', pdfUrl: 'https://www.antiohia.ro/wp-content/uploads/2025/09/newsletter2502_De-La-Februs-La-Hristos.pdf', thumbnail: '', fileType: 'pdf' },
              { id: 'pdf-3', title: 'Sample Document 3', date: 'March 2025', pdfUrl: 'https://www.antiohia.ro/wp-content/uploads/2025/09/newsletter2503_De-la-Moarte-la-Viata.pdf', thumbnail: '', fileType: 'pdf' },
              { id: 'pdf-4', title: 'Sample Document 4', date: 'April 2025', pdfUrl: 'https://www.antiohia.ro/wp-content/uploads/2025/09/newsletter2504_Cand-Isus-Ne-Cheama-Pe-Nume.pdf', thumbnail: '', fileType: 'pdf' },
              { id: 'pdf-5', title: 'Sample Document 5', date: 'May 2025', pdfUrl: 'https://www.antiohia.ro/wp-content/uploads/2025/09/newsletter2505_Inaltarea-Mantuitorului.pdf', thumbnail: '', fileType: 'pdf' },
              { id: 'pdf-6', title: 'Sample Document 6', date: 'June 2025', pdfUrl: 'https://www.antiohia.ro/wp-content/uploads/2025/09/newsletter2506_Putere-Pentru-O-Viata-Transformata.pdf', thumbnail: '', fileType: 'pdf' },
              { id: 'pdf-7', title: 'Sample Document 7', date: 'July 2025', pdfUrl: 'https://www.antiohia.ro/wp-content/uploads/2025/09/newsletter2507_Va-Gasi-Rod.pdf', thumbnail: '', fileType: 'pdf' },
              { id: 'div-2', type: 'divider', text: 'Second Section' },
              { id: 'pdf-8', title: 'Sample Document 1', date: 'January 2024', pdfUrl: 'https://www.antiohia.ro/wp-content/uploads/2025/09/newsletter2401_Un-Gand-Pentru-Anul-Nou.pdf', thumbnail: '', fileType: 'pdf' },
              { id: 'pdf-9', title: 'Sample Document 2', date: 'February 2024', pdfUrl: 'https://www.antiohia.ro/wp-content/uploads/2025/09/newsletter2402_Risipa-De-Iubire.pdf', thumbnail: '', fileType: 'pdf' },
              { id: 'pdf-10', title: 'Sample Document 3', date: 'March 2024', pdfUrl: 'https://www.antiohia.ro/wp-content/uploads/2025/09/newsletter2403_Lucruri-Noi.pdf', thumbnail: '', fileType: 'pdf' },
              { id: 'pdf-11', title: 'Sample Document 4', date: 'April 2024', pdfUrl: 'https://www.antiohia.ro/wp-content/uploads/2025/09/newsletter2404_O-Sarbatoare-Dulce-Amaruie.pdf', thumbnail: '', fileType: 'pdf' },
            ] as GalleryItem[],
            createdAt: new Date().toISOString(),
          };
          setGalleryState({
            galleries: [testGallery],
            currentGalleryId: 'test'
          });
        });

      // Also fetch settings (needed for frontend visitors too)
      const settingsForm = new FormData();
      settingsForm.append('action', 'pdf_gallery_action');
      settingsForm.append('action_type', 'get_settings');
      settingsForm.append('nonce', nonce);

      fetch(ajaxUrl, {
        method: 'POST',
        credentials: 'same-origin',
        body: settingsForm,
      })
        .then((res) => res.json())
        .then((data) => {
          if (data?.success && data?.data?.settings) {
            setSettings(data.data.settings);
          }
        })
        .catch(() => {});
    } else {
      // Fallback test galleries for development or when no config is provided
      const testGallery: Gallery = {
        id: 'test',
        name: 'Test Gallery',
        items: [
          { id: 'div-1', type: 'divider', text: 'First Section' },
          { id: 'pdf-1', title: 'Sample Document 1', date: 'January 2025', pdfUrl: 'https://www.antiohia.ro/wp-content/uploads/2025/09/newsletter2501_Ce-Ne-Rezerva-Viitorul.pdf', thumbnail: '', fileType: 'pdf' },
          { id: 'pdf-2', title: 'Sample Document 2', date: 'February 2025', pdfUrl: 'https://www.antiohia.ro/wp-content/uploads/2025/09/newsletter2502_De-La-Februs-La-Hristos.pdf', thumbnail: '', fileType: 'pdf' },
          { id: 'pdf-3', title: 'Sample Document 3', date: 'March 2025', pdfUrl: 'https://www.antiohia.ro/wp-content/uploads/2025/09/newsletter2503_De-la-Moarte-la-Viata.pdf', thumbnail: '', fileType: 'pdf' },
          { id: 'pdf-4', title: 'Sample Document 4', date: 'April 2025', pdfUrl: 'https://www.antiohia.ro/wp-content/uploads/2025/09/newsletter2504_Cand-Isus-Ne-Cheama-Pe-Nume.pdf', thumbnail: '', fileType: 'pdf' },
          { id: 'pdf-5', title: 'Sample Document 5', date: 'May 2025', pdfUrl: 'https://www.antiohia.ro/wp-content/uploads/2025/09/newsletter2505_Inaltarea-Mantuitorului.pdf', thumbnail: '', fileType: 'pdf' },
          { id: 'pdf-6', title: 'Sample Document 6', date: 'June 2025', pdfUrl: 'https://www.antiohia.ro/wp-content/uploads/2025/09/newsletter2506_Putere-Pentru-O-Viata-Transformata.pdf', thumbnail: '', fileType: 'pdf' },
          { id: 'pdf-7', title: 'Sample Document 7', date: 'July 2025', pdfUrl: 'https://www.antiohia.ro/wp-content/uploads/2025/09/newsletter2507_Va-Gasi-Rod.pdf', thumbnail: '', fileType: 'pdf' },
          { id: 'div-2', type: 'divider', text: 'Second Section' },
          { id: 'pdf-8', title: 'Sample Document 1', date: 'January 2024', pdfUrl: 'https://www.antiohia.ro/wp-content/uploads/2025/09/newsletter2401_Un-Gand-Pentru-Anul-Nou.pdf', thumbnail: '', fileType: 'pdf' },
          { id: 'pdf-9', title: 'Sample Document 2', date: 'February 2024', pdfUrl: 'https://www.antiohia.ro/wp-content/uploads/2025/09/newsletter2402_Risipa-De-Iubire.pdf', thumbnail: '', fileType: 'pdf' },
          { id: 'pdf-10', title: 'Sample Document 3', date: 'March 2024', pdfUrl: 'https://www.antiohia.ro/wp-content/uploads/2025/09/newsletter2403_Lucruri-Noi.pdf', thumbnail: '', fileType: 'pdf' },
          { id: 'pdf-11', title: 'Sample Document 4', date: 'April 2024', pdfUrl: 'https://www.antiohia.ro/wp-content/uploads/2025/09/newsletter2404_O-Sarbatoare-Dulce-Amaruie.pdf', thumbnail: '', fileType: 'pdf' },
        ] as GalleryItem[],
        createdAt: new Date().toISOString(),
      };
      setGalleryState({
        galleries: [testGallery],
        currentGalleryId: 'test'
      });
    }
  }, []);

  // Ensure first gallery is selected by default whenever galleries load
  useEffect(() => {
    if (galleryState.galleries.length > 0) {
      const exists = galleryState.galleries.some(g => g.id === galleryState.currentGalleryId);
      if (!galleryState.currentGalleryId || !exists) {
        setGalleryState(prev => ({ ...prev, currentGalleryId: prev.galleries[0].id }));
      }
    }
  }, [galleryState.galleries, galleryState.currentGalleryId]);


  const copyShortcode = async () => {
    const currentGallery = galleryState.galleries.find(g => g.id === galleryState.currentGalleryId);
    const galleryName = currentGallery?.name || 'main';
    const shortcode = `[pdf_gallery name="${galleryName.toLowerCase().replace(/[^a-z0-9-_]/g, '-')}"]`;
    try {
      await navigator.clipboard.writeText(shortcode);
      setShortcodeCopied(true);
      setTimeout(() => setShortcodeCopied(false), 2000);
    } catch (e) {}
  };

  const currentGallery = galleryState.galleries.find(g => g.id === galleryState.currentGalleryId);
  const currentItems = currentGallery?.items || [];
  const galleryRatingsEnabled = (currentGallery as any)?.settings?.ratingsEnabled ?? true;


  // Check if we should show admin interface (Lovable preview or WordPress admin)
  const urlParams = new URLSearchParams(window.location.search);
  const wp = (typeof window !== 'undefined' && (window as any).wpPDFGallery) ? (window as any).wpPDFGallery : null;
  const isWordPressAdmin = !!wp?.isAdmin || urlParams.get('admin') === 'true';
  const hostname = window.location.hostname;
  const isLovablePreview = hostname.includes('lovable.app') || hostname.includes('lovableproject.com') || hostname === 'localhost';

  // Show admin interface only in WordPress admin area or Lovable preview
  const showAdmin = isLovablePreview || isWordPressAdmin;

  if (!showAdmin) {
    // Show only the frontend gallery for regular WordPress visitors
    return (
      <div className="w-full">
        <PDFGallery 
          items={currentItems} 
          settings={settings}
          showRatings={galleryRatingsEnabled}
          galleryId={currentGallery?.id || 'default'}
        />
      </div>
    );
  }

  const license = useLicense();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto">
        {/* Logo Header */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center gap-3">
            <img src={pdfGalleryLogo} alt="PDF Gallery" className="w-7 h-7" />
            <div className="flex items-baseline gap-2">
              <h1 className="text-2xl text-slate-800"><span className="font-bold">PDF Gallery</span></h1>
              <span className="text-xs text-slate-400">v{PLUGIN_VERSION}</span>
            </div>
          </div>
        </div>
        
        <Tabs defaultValue="gallery" className="w-full">
          {/* Tab Navigation with Underline Style */}
          <div className="px-6">
            <TabsList className="flex border-b border-slate-200 bg-transparent p-0 h-auto">
              <TabsTrigger 
                value="preview"
                className="flex-1 px-6 py-4 text-sm font-medium border-b-2 -mb-px flex items-center justify-center gap-2 transition-colors rounded-none data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-primary/5 data-[state=inactive]:border-transparent data-[state=inactive]:text-slate-500 hover:text-slate-700 hover:bg-slate-50 data-[state=active]:shadow-none"
              >
                <Eye className="w-4 h-4" />
                Preview
              </TabsTrigger>
              <TabsTrigger 
                value="gallery"
                className="flex-1 px-6 py-4 text-sm font-medium border-b-2 -mb-px flex items-center justify-center gap-2 transition-colors rounded-none data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-primary/5 data-[state=inactive]:border-transparent data-[state=inactive]:text-slate-500 hover:text-slate-700 hover:bg-slate-50 data-[state=active]:shadow-none"
              >
                <Layers className="w-4 h-4" />
                Gallery Management
              </TabsTrigger>
              <TabsTrigger 
                value="settings"
                className="flex-1 px-6 py-4 text-sm font-medium border-b-2 -mb-px flex items-center justify-center gap-2 transition-colors rounded-none data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-primary/5 data-[state=inactive]:border-transparent data-[state=inactive]:text-slate-500 hover:text-slate-700 hover:bg-slate-50 data-[state=active]:shadow-none"
              >
                <Settings className="w-4 h-4" />
                Settings
                <Crown className={`w-3 h-3 text-amber-500`} />
              </TabsTrigger>
              <TabsTrigger 
                value="docs"
                className="flex-1 px-6 py-4 text-sm font-medium border-b-2 -mb-px flex items-center justify-center gap-2 transition-colors rounded-none data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-primary/5 data-[state=inactive]:border-transparent data-[state=inactive]:text-slate-500 hover:text-slate-700 hover:bg-slate-50 data-[state=active]:shadow-none"
              >
                <BookOpen className="w-4 h-4" />
                Info & Documentation
              </TabsTrigger>
            </TabsList>
          </div>
          
          <div className="p-6">
            <TabsContent value="preview" className="space-y-6 mt-0">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Gallery Shortcode</h3>
                <p className="text-muted-foreground mb-4">
                  Copy this shortcode to display the current gallery on any page or post:
                </p>
                <div className="flex items-center justify-center gap-2">
                  <code className="bg-muted px-3 py-2 rounded text-sm font-mono">
                    {(() => {
                      const galleryName = currentGallery?.name || 'main';
                      return `[pdf_gallery name="${galleryName.toLowerCase().replace(/[^a-z0-9-_]/g, '-')}"]`;
                    })()}
                  </code>
                  <Button 
                    onClick={copyShortcode}
                    variant="outline" 
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    {shortcodeCopied ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              </div>
              <PDFGallery 
                items={currentItems} 
                settings={settings}
                showRatings={galleryRatingsEnabled}
                galleryId={currentGallery?.id || 'default'}
              />
            </TabsContent>
            
            <TabsContent value="gallery" className="mt-0">
              <PDFAdmin 
                galleries={galleryState.galleries}
                currentGalleryId={galleryState.currentGalleryId}
                onGalleriesChange={(galleries) => setGalleryState(prev => ({ ...prev, galleries }))}
                onCurrentGalleryChange={(galleryId) => setGalleryState(prev => ({ ...prev, currentGalleryId: galleryId }))}
              />
            </TabsContent>
            
            <TabsContent value="settings" className="mt-0">
              <SettingsProposal2 settings={settings} onSettingsChange={setSettings} />
            </TabsContent>
            
            <TabsContent value="docs" className="mt-0">
              <PluginDocumentation />
            </TabsContent>
          </div>
        </Tabs>

        {/* Footer */}
        <div className="px-6 mt-8">
          <div className="border-t border-slate-200 pt-4 pb-6">
            <div className="flex items-center justify-between">
              {/* Left: Support Links */}
              <div className="flex items-center gap-6">
                <a 
                  href="https://kindpixels.com/support" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-slate-500 hover:text-primary transition-colors flex items-center gap-1"
                >
                  Support
                  <ExternalLink className="w-3 h-3" />
                </a>
                <a 
                  href="https://kindpixels.com/feature-request" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-slate-500 hover:text-primary transition-colors flex items-center gap-1"
                >
                  Request a Feature
                  <ExternalLink className="w-3 h-3" />
                </a>
                <a 
                  href="https://wordpress.org/plugins/pdf-gallery/#reviews" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-slate-500 hover:text-primary transition-colors flex items-center gap-1"
                >
                  Rate Us ★★★★★
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              
              {/* Right: Kind Pixels Logo */}
              <a 
                href="https://kindpixels.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="kp-footer-logo text-slate-600"
              >
                <KindPixelsLogo className="h-5 w-auto" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;