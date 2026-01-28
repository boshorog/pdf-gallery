/**
 * ============================================================================
 * UPDATE NOTICE SHOWCASE
 * ============================================================================
 * 
 * Displays various design variants for the update notification alert.
 * 
 * @module UpdateNoticeShowcase
 * ============================================================================
 */

import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface VariantProps {
  title: string;
  children: React.ReactNode;
}

const ShowcaseVariant = ({ title, children }: VariantProps) => (
  <div className="space-y-2">
    <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
    {children}
  </div>
);

export const UpdateNoticeShowcase = () => {
  const latestVersion = '2.5.0';

  return (
    <div className="space-y-8 p-6">
      <div>
        <h2 className="text-xl font-bold mb-2">Update Notice Redesign Showcase</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Diferite variante de design pentru notificarea de update. Toate folosesc emoji 🎉 în loc de iconița refresh.
        </p>
      </div>

      {/* Variant 1: Brand Blue (Primary) */}
      <ShowcaseVariant title="Variant 1: Brand Blue (Primary Color)">
        <div className="flex items-center justify-between gap-4 rounded-lg border border-primary/20 bg-primary/5 px-4 py-2.5 text-sm">
          <div className="flex items-center gap-2 text-primary">
            <span className="text-base">🎉</span>
            <span>
              <strong>New version ({latestVersion})</strong> is available. Update now for new features and bug fixes.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="default"
              className="h-7"
            >
              Update
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0 text-primary/70 hover:bg-primary/10"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </ShowcaseVariant>

      {/* Variant 2: Amber/Orange (Pro-like) */}
      <ShowcaseVariant title="Variant 2: Amber/Orange (Pro Branding)">
        <div className="flex items-center justify-between gap-4 rounded-lg border border-amber-300/50 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 dark:border-amber-700/50 px-4 py-2.5 text-sm">
          <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
            <span className="text-base">🎉</span>
            <span>
              <strong>New version ({latestVersion})</strong> is available. Update now for new features and bug fixes.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              className="h-7 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0"
            >
              Update
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0 text-amber-700 hover:bg-amber-100 dark:text-amber-300 dark:hover:bg-amber-900/50"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </ShowcaseVariant>

      {/* Variant 3: Teal/Cyan */}
      <ShowcaseVariant title="Variant 3: Teal/Cyan (Fresh)">
        <div className="flex items-center justify-between gap-4 rounded-lg border border-teal-200 bg-teal-50 dark:border-teal-800 dark:bg-teal-950/50 px-4 py-2.5 text-sm">
          <div className="flex items-center gap-2 text-teal-800 dark:text-teal-200">
            <span className="text-base">🎉</span>
            <span>
              <strong>New version ({latestVersion})</strong> is available. Update now for new features and bug fixes.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              className="h-7 bg-teal-600 hover:bg-teal-700 text-white"
            >
              Update
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0 text-teal-700 hover:bg-teal-100 dark:text-teal-300 dark:hover:bg-teal-900"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </ShowcaseVariant>

      {/* Variant 4: Purple/Violet */}
      <ShowcaseVariant title="Variant 4: Purple/Violet (Modern)">
        <div className="flex items-center justify-between gap-4 rounded-lg border border-violet-200 bg-violet-50 dark:border-violet-800 dark:bg-violet-950/50 px-4 py-2.5 text-sm">
          <div className="flex items-center gap-2 text-violet-800 dark:text-violet-200">
            <span className="text-base">🎉</span>
            <span>
              <strong>New version ({latestVersion})</strong> is available. Update now for new features and bug fixes.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              className="h-7 bg-violet-600 hover:bg-violet-700 text-white"
            >
              Update
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0 text-violet-700 hover:bg-violet-100 dark:text-violet-300 dark:hover:bg-violet-900"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </ShowcaseVariant>

      {/* Variant 5: Neutral/Slate (Subtle) */}
      <ShowcaseVariant title="Variant 5: Neutral/Slate (Subtle & Professional)">
        <div className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50 px-4 py-2.5 text-sm">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
            <span className="text-base">🎉</span>
            <span>
              <strong>New version ({latestVersion})</strong> is available. Update now for new features and bug fixes.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              className="h-7 bg-slate-700 hover:bg-slate-800 text-white dark:bg-slate-600 dark:hover:bg-slate-500"
            >
              Update
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </ShowcaseVariant>

      {/* Variant 6: Sky Blue (WordPress-like) */}
      <ShowcaseVariant title="Variant 6: Sky Blue (WordPress-esque)">
        <div className="flex items-center justify-between gap-4 rounded-lg border border-sky-200 bg-sky-50 dark:border-sky-800 dark:bg-sky-950/50 px-4 py-2.5 text-sm">
          <div className="flex items-center gap-2 text-sky-800 dark:text-sky-200">
            <span className="text-base">🎉</span>
            <span>
              <strong>New version ({latestVersion})</strong> is available. Update now for new features and bug fixes.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              className="h-7 bg-sky-600 hover:bg-sky-700 text-white"
            >
              Update
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0 text-sky-700 hover:bg-sky-100 dark:text-sky-300 dark:hover:bg-sky-900"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </ShowcaseVariant>

      {/* Variant 7: Minimal with outline button */}
      <ShowcaseVariant title="Variant 7: Minimal (Outline Button)">
        <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-muted/30 px-4 py-2.5 text-sm">
          <div className="flex items-center gap-2 text-foreground">
            <span className="text-base">🎉</span>
            <span>
              <strong>New version ({latestVersion})</strong> is available. Update now for new features and bug fixes.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="h-7"
            >
              Update
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0 text-muted-foreground hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </ShowcaseVariant>

    </div>
  );
};

export default UpdateNoticeShowcase;
