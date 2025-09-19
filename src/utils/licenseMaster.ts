// Utilities for temporary master key activation (frontend-only, obfuscated)
// Note: This is a temporary client-side mechanism. Real licensing should be handled server-side via Freemius.

const getMasterKey = (): string => {
  // Mild obfuscation via chunking
  const chunks = ['PG', 'P-1', '25', '-AX', '7N', '-93', 'QH', '-4M', '2C', '-PR', 'O'];
  return chunks.join('');
};

export const verifyMasterKey = (input: string): boolean => {
  return input.trim() === getMasterKey();
};

const STORAGE_KEY = 'pdf_gallery_pro_active';

export const activateMasterPro = () => {
  try {
    localStorage.setItem(STORAGE_KEY, '1');
  } catch {}
};

export const deactivateMasterPro = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
};

export const isMasterProActive = (): boolean => {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
};
