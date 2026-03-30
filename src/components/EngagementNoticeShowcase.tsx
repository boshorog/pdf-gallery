/**
 * Showcase: Engagement notification bar variants for free users
 * Encourages ratings, feedback, and feature requests.
 */

import { Button } from '@/components/ui/button';
import { X, Star, MessageSquare, Heart, ThumbsUp, Sparkles, Coffee, ExternalLink } from 'lucide-react';

const SUPPORT_URL = 'https://wordpress.org/support/plugin/kindpixels-pdf-gallery/';
const RATING_URL = 'https://wordpress.org/support/plugin/kindpixels-pdf-gallery/reviews/#new-post';

const ShowcaseVariant = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="space-y-2">
    <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
    {children}
  </div>
);

export const EngagementNoticeShowcase = () => {
  return (
    <div className="space-y-8 p-6">
      <div>
        <h2 className="text-xl font-bold mb-2">Engagement Notice Showcase</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Notification bar variants to encourage free users to rate the plugin or send feedback.
          Shown periodically to active users only.
        </p>
      </div>

      {/* Variant 1: Friendly Green (matching update notice style) */}
      <ShowcaseVariant title="Variant 1: Friendly Green (Update Notice Style)">
        <div className="flex items-center justify-between gap-4 rounded-lg border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/50 px-4 py-2.5 text-sm">
          <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
            <span className="text-base">⭐</span>
            <span>
              Enjoying <strong>PDF Gallery</strong>? Help us grow — leave a rating or share your feedback!
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button size="sm" className="h-7 bg-green-700 hover:bg-green-800 text-white border-0 gap-1.5">
              <Star className="h-3.5 w-3.5" /> Rate Us
            </Button>
            <Button size="sm" variant="outline" className="h-7 border-green-300 text-green-700 hover:bg-green-100 dark:border-green-700 dark:text-green-300 gap-1.5">
              <MessageSquare className="h-3.5 w-3.5" /> Feedback
            </Button>
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-green-600 hover:bg-green-100 dark:text-green-400 dark:hover:bg-green-900">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </ShowcaseVariant>

      {/* Variant 2: Warm Amber with emoji */}
      <ShowcaseVariant title="Variant 2: Warm Amber (Heartfelt)">
        <div className="flex items-center justify-between gap-4 rounded-lg border border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30 dark:border-amber-700/50 px-4 py-2.5 text-sm">
          <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
            <span className="text-base">💛</span>
            <span>
              You've been using <strong>PDF Gallery</strong> for a while now! A quick rating would mean the world to us.
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button size="sm" className="h-7 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white border-0 gap-1.5">
              <Heart className="h-3.5 w-3.5" /> Leave a Review
            </Button>
            <Button size="sm" variant="outline" className="h-7 border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-300 gap-1.5">
              <MessageSquare className="h-3.5 w-3.5" /> Send Feedback
            </Button>
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-amber-600 hover:bg-amber-100 dark:text-amber-400 dark:hover:bg-amber-900">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </ShowcaseVariant>

      {/* Variant 3: Subtle Slate (Professional) */}
      <ShowcaseVariant title="Variant 3: Subtle Slate (Professional & Understated)">
        <div className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50 px-4 py-2.5 text-sm">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
            <ThumbsUp className="h-4 w-4 text-slate-500" />
            <span>
              If you find <strong>PDF Gallery</strong> useful, a quick review helps others discover it too.
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button size="sm" className="h-7 bg-slate-700 hover:bg-slate-800 text-white dark:bg-slate-600 dark:hover:bg-slate-500 gap-1.5">
              <Star className="h-3.5 w-3.5" /> Rate on WordPress
            </Button>
            <Button size="sm" variant="ghost" className="h-7 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 gap-1.5">
              <ExternalLink className="h-3.5 w-3.5" /> Request a Feature
            </Button>
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </ShowcaseVariant>

      {/* Variant 4: Sky Blue (WordPress Native) */}
      <ShowcaseVariant title="Variant 4: Sky Blue (WordPress Native Feel)">
        <div className="flex items-center justify-between gap-4 rounded-lg border border-sky-200 bg-sky-50 dark:border-sky-800 dark:bg-sky-950/50 px-4 py-2.5 text-sm">
          <div className="flex items-center gap-2 text-sky-800 dark:text-sky-200">
            <Sparkles className="h-4 w-4 text-sky-500" />
            <span>
              Love what you can do with <strong>PDF Gallery</strong>? Share your experience!
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button size="sm" className="h-7 bg-sky-600 hover:bg-sky-700 text-white border-0 gap-1.5">
              <Star className="h-3.5 w-3.5" /> Write a Review
            </Button>
            <Button size="sm" variant="outline" className="h-7 border-sky-300 text-sky-700 hover:bg-sky-100 dark:border-sky-700 dark:text-sky-300 gap-1.5">
              <MessageSquare className="h-3.5 w-3.5" /> Feedback
            </Button>
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-sky-600 hover:bg-sky-100 dark:text-sky-400 dark:hover:bg-sky-900">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </ShowcaseVariant>

      {/* Variant 5: Purple Gradient (Modern & Eye-catching) */}
      <ShowcaseVariant title="Variant 5: Purple Gradient (Modern & Bold)">
        <div className="flex items-center justify-between gap-4 rounded-lg border border-violet-200 bg-gradient-to-r from-violet-50 via-purple-50 to-fuchsia-50 dark:from-violet-950/40 dark:via-purple-950/40 dark:to-fuchsia-950/40 dark:border-violet-700/50 px-4 py-2.5 text-sm">
          <div className="flex items-center gap-2 text-violet-800 dark:text-violet-200">
            <span className="text-base">✨</span>
            <span>
              Help <strong>PDF Gallery</strong> reach more people — your review matters!
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button size="sm" className="h-7 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white border-0 gap-1.5">
              <Star className="h-3.5 w-3.5" /> Rate Us ★★★★★
            </Button>
            <Button size="sm" variant="outline" className="h-7 border-violet-300 text-violet-700 hover:bg-violet-100 dark:border-violet-700 dark:text-violet-300 gap-1.5">
              <Coffee className="h-3.5 w-3.5" /> Share Ideas
            </Button>
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-violet-500 hover:bg-violet-100 dark:text-violet-400 dark:hover:bg-violet-900">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </ShowcaseVariant>

      {/* Variant 6: Minimal with stars visual */}
      <ShowcaseVariant title="Variant 6: Minimal with Star Rating Visual">
        <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-muted/30 px-4 py-2.5 text-sm">
          <div className="flex items-center gap-3 text-foreground">
            <div className="flex gap-0.5 text-amber-400">
              {[1,2,3,4,5].map(i => <Star key={i} className="h-4 w-4 fill-current" />)}
            </div>
            <span>
              Rate <strong>PDF Gallery</strong> on WordPress.org
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button size="sm" variant="default" className="h-7 gap-1.5">
              <ExternalLink className="h-3.5 w-3.5" /> Leave a Review
            </Button>
            <Button size="sm" variant="outline" className="h-7 gap-1.5">
              <MessageSquare className="h-3.5 w-3.5" /> Feedback
            </Button>
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-muted-foreground hover:bg-muted">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </ShowcaseVariant>

    </div>
  );
};

export default EngagementNoticeShowcase;
