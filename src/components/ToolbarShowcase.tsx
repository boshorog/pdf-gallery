import { useState } from 'react';
import {
  Plus, ChevronDown, ArrowUpDown, ArrowDown, ArrowUp, Check, Edit2, Copy, BarChart3,
  Upload, Minus, Link, FolderOpen, Rows3, Rows4, Trash2, Search,
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

type Density = 'normal' | 'compact';
type Sort = 'newest' | 'oldest' | 'alphabetical';

const sortLabel = (s: Sort) => (s === 'newest' ? 'Newest first' : s === 'oldest' ? 'Oldest first' : 'A-Z');

/* ---------- shared pieces ---------- */

const AddMenuItems = () => (
  <>
    <DropdownMenuLabel className="text-xs text-muted-foreground">Add to gallery</DropdownMenuLabel>
    <DropdownMenuItem className="gap-3 cursor-pointer py-2">
      <Upload className="h-4 w-4 text-primary" />
      <div className="flex flex-col">
        <span className="text-sm font-medium">File</span>
        <span className="text-xs text-muted-foreground">PDF, Office, image, video</span>
      </div>
    </DropdownMenuItem>
    <DropdownMenuItem className="gap-3 cursor-pointer py-2">
      <Link className="h-4 w-4 text-primary" />
      <div className="flex flex-col">
        <span className="text-sm font-medium">Link / YouTube</span>
        <span className="text-xs text-muted-foreground">Add via URL</span>
      </div>
    </DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem className="gap-3 cursor-pointer py-2">
      <Minus className="h-4 w-4 text-primary" />
      <div className="flex flex-col">
        <span className="text-sm font-medium">Divider</span>
        <span className="text-xs text-muted-foreground">Section title between files</span>
      </div>
    </DropdownMenuItem>
  </>
);

const SortMenu = ({ sort, setSort, trigger }: { sort: Sort; setSort: (s: Sort) => void; trigger: React.ReactNode }) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      {([
        ['newest', 'Newest first', ArrowDown],
        ['oldest', 'Oldest first', ArrowUp],
        ['alphabetical', 'Alphabetical (A-Z)', ArrowUpDown],
      ] as const).map(([v, l, I]) => (
        <DropdownMenuItem key={v} onClick={() => setSort(v)} className="flex justify-between gap-4 cursor-pointer">
          <span className="flex items-center gap-2"><I className="h-4 w-4" />{l}</span>
          {sort === v && <Check className="h-4 w-4 text-primary" />}
        </DropdownMenuItem>
      ))}
    </DropdownMenuContent>
  </DropdownMenu>
);

const GalleryMenu = ({ trigger }: { trigger: React.ReactNode }) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
    <DropdownMenuContent align="start">
      {['Newsletters 2026', 'Annual Reports', 'Brochures'].map((g, i) => (
        <DropdownMenuItem key={g} className="flex justify-between gap-6 cursor-pointer">
          {g}{i === 0 && <Check className="h-4 w-4 text-primary" />}
        </DropdownMenuItem>
      ))}
    </DropdownMenuContent>
  </DropdownMenu>
);

const GalleryActions = ({ h }: { h: string }) => (
  <div className="flex items-center gap-0.5">
    {[Edit2, Copy, BarChart3].map((I, i) => (
      <Button key={i} variant="ghost" size="sm" className={cn(h, 'w-7 p-0 text-muted-foreground')}>
        <I className="h-3.5 w-3.5" />
      </Button>
    ))}
  </div>
);

interface VProps { d: Density; sort: Sort; setSort: (s: Sort) => void; sel: boolean; setSel: (b: boolean) => void }

/* ---------- Variant 1: Single clean line ---------- */
const V1 = ({ d, sort, setSort, sel, setSel }: VProps) => {
  const h = d === 'compact' ? 'h-8' : 'h-10';
  return (
    <div className={cn('flex items-center justify-between gap-3 border-b border-dashed', d === 'compact' ? 'pb-1.5' : 'pb-3')}>
      <label className="flex items-center gap-2.5 ml-[22px] text-sm text-muted-foreground cursor-pointer">
        <Checkbox checked={sel} onCheckedChange={(c) => setSel(!!c)} />
        {sel ? '12 selected' : 'Select all'}
      </label>
      <div className="flex items-center gap-1.5 text-sm">
        <span className="text-muted-foreground">Galleries</span>
        <ChevronDown className="h-3 w-3 -rotate-90 text-muted-foreground/60" />
        <GalleryMenu trigger={<button className="font-medium flex items-center gap-1">Newsletters 2026<ChevronDown className="h-3 w-3" /></button>} />
        <GalleryActions h={d === 'compact' ? 'h-7' : 'h-8'} />
      </div>
      <div className="flex items-center gap-2">
        <SortMenu sort={sort} setSort={setSort} trigger={
          <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground px-2">
            <ArrowUpDown className="h-3.5 w-3.5" />{sortLabel(sort)}<ChevronDown className="h-3 w-3" />
          </button>} />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className={cn(h, 'gap-1.5')}><Plus className="h-4 w-4" />Add<ChevronDown className="h-3.5 w-3.5 opacity-80" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64"><AddMenuItems /></DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

/* ---------- Variant 2: Split button + segmented pill bar ---------- */
const V2 = ({ d, sort, setSort, sel, setSel }: VProps) => {
  const h = d === 'compact' ? 'h-8' : 'h-10';
  return (
    <div className={cn('flex items-center gap-2 rounded-xl border bg-muted/40', d === 'compact' ? 'p-1' : 'p-1.5')}>
      <label className={cn(h, 'flex items-center gap-2 px-3 rounded-lg bg-background border text-sm cursor-pointer')}>
        <Checkbox checked={sel} onCheckedChange={(c) => setSel(!!c)} />
        <span className="text-muted-foreground">{sel ? '12' : 'All'}</span>
      </label>
      <GalleryMenu trigger={
        <button className={cn(h, 'flex items-center gap-2 px-3 rounded-lg bg-background border text-sm min-w-[200px] justify-between')}>
          <span className="flex items-center gap-2"><FolderOpen className="h-4 w-4 text-primary" /><span className="font-medium">Newsletters 2026</span></span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </button>} />
      <GalleryActions h={h} />
      <div className="flex-1" />
      <SortMenu sort={sort} setSort={setSort} trigger={
        <button className={cn(h, 'flex items-center gap-2 px-3 rounded-lg bg-background border text-sm')}>
          <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />{sortLabel(sort)}<ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </button>} />
      <div className="flex">
        <Button className={cn(h, 'rounded-r-none gap-1.5')}><Upload className="h-4 w-4" />Add File</Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className={cn(h, 'rounded-l-none border-l border-primary-foreground/30 px-2')}><ChevronDown className="h-4 w-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64"><AddMenuItems /></DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

/* ---------- Variant 3: Breadcrumb title left, actions right ---------- */
const V3 = ({ d, sort, setSort, sel, setSel }: VProps) => {
  const h = d === 'compact' ? 'h-8' : 'h-10';
  return (
    <div className={cn('flex items-center gap-4 border-b', d === 'compact' ? 'pb-2' : 'pb-4')}>
      <Checkbox className="ml-[22px]" checked={sel} onCheckedChange={(c) => setSel(!!c)} aria-label="Select all" />
      <div className="flex flex-col leading-tight">
        {d === 'normal' && <span className="text-[11px] uppercase tracking-wider text-muted-foreground">Gallery</span>}
        <GalleryMenu trigger={
          <button className={cn('flex items-center gap-1.5 font-semibold', d === 'compact' ? 'text-base' : 'text-lg')}>
            Newsletters 2026<ChevronDown className="h-4 w-4 text-muted-foreground" />
          </button>} />
      </div>
      <span className="text-xs text-muted-foreground rounded-full bg-muted px-2 py-0.5">{sel ? '12 selected' : '12 files'}</span>
      <GalleryActions h={d === 'compact' ? 'h-7' : 'h-8'} />
      <div className="flex-1" />
      <SortMenu sort={sort} setSort={setSort} trigger={
        <Button variant="ghost" className={cn(h, 'gap-1.5 text-muted-foreground')}>
          <ArrowUpDown className="h-4 w-4" />{sortLabel(sort)}
        </Button>} />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className={cn(h, 'gap-1.5 rounded-full px-5')}><Plus className="h-4 w-4" />Add<ChevronDown className="h-3.5 w-3.5" /></Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64"><AddMenuItems /></DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

/* ---------- Variant 4: Card toolbar with icon-only tools ---------- */
const V4 = ({ d, sort, setSort, sel, setSel }: VProps) => {
  const h = d === 'compact' ? 'h-8' : 'h-10';
  const sq = d === 'compact' ? 'h-8 w-8' : 'h-10 w-10';
  return (
    <div className={cn('flex items-center gap-2 rounded-xl border bg-card shadow-sm', d === 'compact' ? 'px-2 py-1.5' : 'px-3 py-2.5')}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className={cn(h, 'gap-1.5')}><Plus className="h-4 w-4" />Add<ChevronDown className="h-3.5 w-3.5" /></Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64"><AddMenuItems /></DropdownMenuContent>
      </DropdownMenu>
      <div className="w-px self-stretch bg-border mx-1" />
      <label className={cn(sq, 'flex items-center justify-center rounded-lg hover:bg-muted cursor-pointer')} title="Select all">
        <Checkbox checked={sel} onCheckedChange={(c) => setSel(!!c)} />
      </label>
      {sel && <Button variant="ghost" className={cn(h, 'gap-1.5 text-destructive hover:text-destructive')}><Trash2 className="h-4 w-4" />Delete 12</Button>}
      <div className="flex-1 flex justify-center">
        <GalleryMenu trigger={
          <button className={cn(h, 'flex items-center gap-2 px-4 rounded-lg hover:bg-muted text-sm')}>
            <span className="text-muted-foreground">Gallery:</span><span className="font-semibold">Newsletters 2026</span><ChevronDown className="h-3.5 w-3.5" />
          </button>} />
        <GalleryActions h={h} />
      </div>
      <SortMenu sort={sort} setSort={setSort} trigger={
        <Button variant="ghost" className={cn(sq, 'p-0')} title={sortLabel(sort)}><ArrowUpDown className="h-4 w-4" /></Button>} />
    </div>
  );
};

/* ---------- Variant 5: Two-zone with search ---------- */
const V5 = ({ d, sort, setSort, sel, setSel }: VProps) => {
  const h = d === 'compact' ? 'h-8' : 'h-10';
  return (
    <div className="space-y-0">
      <div className={cn('flex items-center gap-2 rounded-t-xl border border-b-0 bg-primary/10', d === 'compact' ? 'px-2 py-1.5' : 'px-3 py-2')}>
        <GalleryMenu trigger={
          <button className={cn(h, 'flex items-center gap-2 px-3 rounded-lg bg-background text-sm font-medium')}>
            <FolderOpen className="h-4 w-4 text-primary" />Newsletters 2026<ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </button>} />
        <GalleryActions h={h} />
        <div className="flex-1" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className={cn(h, 'gap-1.5')}><Plus className="h-4 w-4" />Add<ChevronDown className="h-3.5 w-3.5" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64"><AddMenuItems /></DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className={cn('flex items-center gap-3 rounded-b-xl border', d === 'compact' ? 'px-3 py-1' : 'px-3 py-2')}>
        <label className="flex items-center gap-2 ml-[10px] text-sm text-muted-foreground cursor-pointer">
          <Checkbox checked={sel} onCheckedChange={(c) => setSel(!!c)} />{sel ? '12 selected' : 'Select all'}
        </label>
        <div className="flex-1 flex items-center gap-2 text-muted-foreground text-sm">
          <Search className="h-3.5 w-3.5 ml-4" /><span className="opacity-60">Filter files…</span>
        </div>
        <SortMenu sort={sort} setSort={setSort} trigger={
          <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowUpDown className="h-3.5 w-3.5" />{sortLabel(sort)}<ChevronDown className="h-3 w-3" />
          </button>} />
      </div>
    </div>
  );
};

/* ---------- Density toggle ---------- */
const DensityToggle = ({ d, setD }: { d: Density; setD: (d: Density) => void }) => (
  <div className="inline-flex rounded-lg border bg-muted/50 p-0.5">
    {([['normal', 'Normal', Rows3], ['compact', 'Compact', Rows4]] as const).map(([v, l, I]) => (
      <button key={v} onClick={() => setD(v)}
        className={cn('flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs transition-colors',
          d === v ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground')}>
        <I className="h-3.5 w-3.5" />{l}
      </button>
    ))}
  </div>
);

const FakeRows = ({ d }: { d: Density }) => (
  <div className="mt-3 space-y-2">
    {[1, 2].map((i) => (
      <div key={i} className={cn('flex items-center gap-3 rounded-lg border px-3', d === 'compact' ? 'py-1.5' : 'py-3')}>
        <Checkbox />
        <div className={cn('rounded bg-muted', d === 'compact' ? 'h-8 w-6' : 'h-12 w-9')} />
        <div className="flex-1">
          <div className="text-sm font-medium">Newsletter issue #{i}</div>
          {d === 'normal' && <div className="text-xs text-muted-foreground">March 2026</div>}
        </div>
      </div>
    ))}
  </div>
);

const VARIANTS = [
  { name: '1. Single Clean Line', desc: 'Current look, all on one line. Add button joins the right side next to sorting.', C: V1 },
  { name: '2. Segmented Pill Bar', desc: 'Tools sit in boxed segments inside a soft tray. Split button: main click adds a file, arrow shows more.', C: V2 },
  { name: '3. Title-First Header', desc: 'Gallery name becomes a large title with file count. Rounded Add button stands out on the right.', C: V3 },
  { name: '4. Card Toolbar, Add on Left', desc: 'Toolbar card with Add first, gallery in the center, icon-only sorting. Delete appears inline when selecting.', C: V4 },
  { name: '5. Two-Tier Toolbar', desc: 'Top band: gallery + Add. Bottom band: select all, filter, sort. Most structured.', C: V5 },
];

export default function ToolbarShowcase() {
  const [sort, setSort] = useState<Sort>('newest');
  const [sel, setSel] = useState(false);
  const [densities, setDensities] = useState<Density[]>(VARIANTS.map(() => 'normal'));

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-5xl mx-auto space-y-10">
        <div>
          <h1 className="text-2xl font-semibold">Galleries Toolbar — Design Options</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Add Files + Add Divider merged into a single "Add" menu, on the same line as Select all, gallery selector and sorting.
            Every option has its own Normal / Compact switch. All menus are clickable.
          </p>
        </div>
        {VARIANTS.map(({ name, desc, C }, i) => (
          <section key={name} className="space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-semibold">{name}</h2>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
              <DensityToggle d={densities[i]} setD={(v) => setDensities((p) => p.map((x, j) => (j === i ? v : x)))} />
            </div>
            <div className="rounded-xl border border-dashed p-5 bg-card">
              <C d={densities[i]} sort={sort} setSort={setSort} sel={sel} setSel={setSel} />
              <FakeRows d={densities[i]} />
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
