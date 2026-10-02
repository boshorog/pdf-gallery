import { useMemo, useState } from 'react';
import {
  Plus, ChevronDown, ArrowUpDown, ArrowDown, ArrowUp, Check, Edit2, Copy, BarChart3,
  Upload, Minus, Link, FolderOpen, Rows3, Rows4, Search, SlidersHorizontal, X, FileText,
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

type Item = { id: number; title: string; date: string; divider?: boolean };
const ITEMS: Item[] = [
  { id: 1, title: '2026 Issues', date: '', divider: true },
  { id: 2, title: 'Newsletter issue #3', date: 'March 2026' },
  { id: 3, title: 'Newsletter issue #2', date: 'February 2026' },
  { id: 4, title: 'Annual Report Summary', date: 'January 2026' },
  { id: 5, title: '2025 Issues', date: '', divider: true },
  { id: 6, title: 'Newsletter issue #1', date: 'December 2025' },
];

/* Row geometry shared by toolbar and items so checkboxes align exactly.
   Outer toolbar has border(1px) + padding P; select segment has border(1px) + px-3.
   Rows have border(1px) + px-3 + extra offset. */
const ROW_PX = 'px-3';

const AddMenuItems = () => (
  <>
    <DropdownMenuLabel className="text-xs text-muted-foreground">Add to gallery</DropdownMenuLabel>
    {[
      [Upload, 'File', 'PDF, Office, image, video'],
      [Link, 'Link / YouTube', 'Add via URL'],
    ].map(([I, t, s]: any) => (
      <DropdownMenuItem key={t} className="gap-3 cursor-pointer py-2">
        <I className="h-4 w-4 text-primary" />
        <div className="flex flex-col"><span className="text-sm font-medium">{t}</span><span className="text-xs text-muted-foreground">{s}</span></div>
      </DropdownMenuItem>
    ))}
    <DropdownMenuSeparator />
    <DropdownMenuItem className="gap-3 cursor-pointer py-2">
      <Minus className="h-4 w-4 text-primary" />
      <div className="flex flex-col"><span className="text-sm font-medium">Divider</span><span className="text-xs text-muted-foreground">Section title between files</span></div>
    </DropdownMenuItem>
  </>
);

const AddButton = ({ h }: { h: string }) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button className={cn(h, 'gap-1.5')}><Plus className="h-4 w-4" />Add<ChevronDown className="h-3.5 w-3.5 opacity-80" /></Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="w-64"><AddMenuItems /></DropdownMenuContent>
  </DropdownMenu>
);

const SortMenu = ({ sort, setSort, trigger }: { sort: Sort; setSort: (s: Sort) => void; trigger: React.ReactNode }) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      {([['newest', 'Newest first', ArrowDown], ['oldest', 'Oldest first', ArrowUp], ['alphabetical', 'Alphabetical (A-Z)', ArrowUpDown]] as const).map(([v, l, I]) => (
        <DropdownMenuItem key={v} onClick={() => setSort(v)} className="flex justify-between gap-4 cursor-pointer">
          <span className="flex items-center gap-2"><I className="h-4 w-4" />{l}</span>
          {sort === v && <Check className="h-4 w-4 text-primary" />}
        </DropdownMenuItem>
      ))}
    </DropdownMenuContent>
  </DropdownMenu>
);

const SortIcon = ({ sort, setSort, cls }: { sort: Sort; setSort: (s: Sort) => void; cls: string }) => (
  <SortMenu sort={sort} setSort={setSort} trigger={
    <button title={`Sort: ${sortLabel(sort)}`} className={cn(cls, 'flex items-center justify-center rounded-lg bg-background border text-muted-foreground hover:text-foreground')}>
      <ArrowUpDown className="h-4 w-4" />
    </button>} />
);

const GalleryCard = ({ h }: { h: string }) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <button className={cn(h, 'flex items-center gap-2 px-3 rounded-lg bg-background border text-sm min-w-[190px] justify-between')}>
        <span className="flex items-center gap-2"><FolderOpen className="h-4 w-4 text-primary" /><span className="font-medium">Newsletters 2026</span></span>
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
      </button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="start">
      {['Newsletters 2026', 'Annual Reports', 'Brochures'].map((g, i) => (
        <DropdownMenuItem key={g} className="flex justify-between gap-6 cursor-pointer">{g}{i === 0 && <Check className="h-4 w-4 text-primary" />}</DropdownMenuItem>
      ))}
    </DropdownMenuContent>
  </DropdownMenu>
);

const GalleryActions = ({ h }: { h: string }) => (
  <div className="flex items-center gap-0.5">
    {[Edit2, Copy, BarChart3].map((I, i) => (
      <Button key={i} variant="ghost" size="sm" className={cn(h, 'w-8 p-0 text-muted-foreground')}><I className="h-3.5 w-3.5" /></Button>
    ))}
  </div>
);

/* Select segment: border + px-3 so checkbox x = toolbar border+padding+1+12 */
const SelectSeg = ({ h, sel, setSel, label = true }: { h: string; sel: boolean; setSel: (b: boolean) => void; label?: boolean }) => (
  <label className={cn(h, 'flex items-center gap-2 px-3 rounded-lg bg-background border text-sm cursor-pointer shrink-0')}>
    <Checkbox checked={sel} onCheckedChange={(c) => setSel(!!c)} />
    {label && <span className="text-muted-foreground">{sel ? '5' : 'All'}</span>}
  </label>
);

const SettingsToggle = ({ open, setOpen, cls, count }: { open: boolean; setOpen: (b: boolean) => void; cls: string; count?: boolean }) => (
  <button onClick={() => setOpen(!open)} title="More options" aria-expanded={open}
    className={cn(cls, 'flex items-center justify-center gap-1.5 rounded-lg border px-2.5 text-sm transition-colors',
      open ? 'bg-primary/10 border-primary/40 text-primary' : 'bg-background text-muted-foreground hover:text-foreground')}>
    <SlidersHorizontal className="h-4 w-4" />
    {count && <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', open && 'rotate-180')} />}
  </button>
);

const SearchBox = ({ q, setQ, h }: { q: string; setQ: (s: string) => void; h: string }) => (
  <div className={cn(h, 'flex items-center gap-2 px-3 rounded-lg bg-background border flex-1 min-w-[180px] focus-within:ring-2 focus-within:ring-ring/40')}>
    <Search className="h-4 w-4 text-muted-foreground" />
    <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search files…" className="bg-transparent outline-none text-sm flex-1" />
    {q && <button onClick={() => setQ('')}><X className="h-3.5 w-3.5 text-muted-foreground" /></button>}
  </div>
);

const CountPills = ({ files, dividers }: { files: number; dividers: number }) => (
  <div className="flex items-center gap-1.5 text-xs shrink-0">
    <span className="rounded-full bg-background border px-2.5 py-1"><b>{files}</b> files</span>
    <span className="rounded-full bg-background border px-2.5 py-1"><b>{dividers}</b> dividers</span>
  </div>
);

interface VProps {
  d: Density; sort: Sort; setSort: (s: Sort) => void; sel: boolean; setSel: (b: boolean) => void;
  q: string; setQ: (s: string) => void; files: number; dividers: number;
}

/* All toolbars use p-1.5 (normal) / p-1 (compact). Rows offset accordingly. */
const pad = (d: Density) => (d === 'compact' ? 'p-1' : 'p-1.5');
const hh = (d: Density) => (d === 'compact' ? 'h-8' : 'h-10');
const sq = (d: Density) => (d === 'compact' ? 'h-8 w-8' : 'h-10 w-10');

/* A: Inline expanding tray (pane slides open under main row, same grey tray) */
const VA = (p: VProps) => {
  const [open, setOpen] = useState(false);
  const h = hh(p.d);
  return (
    <div className={cn('rounded-xl border bg-muted', pad(p.d))}>
      <div className="flex items-center gap-2">
        <SelectSeg h={h} sel={p.sel} setSel={p.setSel} />
        <GalleryCard h={h} />
        <GalleryActions h={h} />
        <div className="flex-1" />
        <SettingsToggle open={open} setOpen={setOpen} cls={h} count />
        <AddButton h={h} />
      </div>
      <div className={cn('grid transition-all duration-200', open ? 'grid-rows-[1fr] opacity-100 mt-1.5' : 'grid-rows-[0fr] opacity-0')}>
        <div className="overflow-hidden">
          <div className="flex items-center gap-2 border-t border-border/70 pt-1.5">
            <SearchBox q={p.q} setQ={p.setQ} h={h} />
            <CountPills files={p.files} dividers={p.dividers} />
            <SortMenu sort={p.sort} setSort={p.setSort} trigger={
              <button className={cn(h, 'flex items-center gap-2 px-3 rounded-lg bg-background border text-sm')}>
                <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />{sortLabel(p.sort)}<ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </button>} />
          </div>
        </div>
      </div>
    </div>
  );
};

/* B: Sort icon stays in main bar; pane is a separate white sub-card */
const VB = (p: VProps) => {
  const [open, setOpen] = useState(false);
  const h = hh(p.d);
  return (
    <div className={cn('rounded-xl border bg-muted', pad(p.d))}>
      <div className="flex items-center gap-2">
        <SelectSeg h={h} sel={p.sel} setSel={p.setSel} />
        <GalleryCard h={h} />
        <GalleryActions h={h} />
        <div className="flex-1" />
        {!open && <SortIcon sort={p.sort} setSort={p.setSort} cls={sq(p.d)} />}
        <SettingsToggle open={open} setOpen={setOpen} cls={sq(p.d)} />
        <AddButton h={h} />
      </div>
      {open && (
        <div className="mt-1.5 rounded-lg border bg-background p-2 flex flex-wrap items-center gap-2 animate-in fade-in slide-in-from-top-1">
          <SearchBox q={p.q} setQ={p.setQ} h={p.d === 'compact' ? 'h-8 bg-muted/50' : 'h-9 bg-muted/50'} />
          <CountPills files={p.files} dividers={p.dividers} />
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            Sort
            {(['newest', 'oldest', 'alphabetical'] as Sort[]).map((s) => (
              <button key={s} onClick={() => p.setSort(s)}
                className={cn('rounded-md px-2 py-1 border', p.sort === s ? 'bg-primary text-primary-foreground border-primary' : 'bg-background hover:bg-muted')}>
                {sortLabel(s)}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/* C: Count pill on main row as the toggle ("12 files ▾") */
const VC = (p: VProps) => {
  const [open, setOpen] = useState(false);
  const h = hh(p.d);
  return (
    <div className={cn('rounded-xl border bg-muted', pad(p.d))}>
      <div className="flex items-center gap-2">
        <SelectSeg h={h} sel={p.sel} setSel={p.setSel} />
        <GalleryCard h={h} />
        <GalleryActions h={h} />
        <div className="flex-1" />
        <button onClick={() => setOpen(!open)}
          className={cn(h, 'flex items-center gap-1.5 px-3 rounded-lg text-sm border transition-colors',
            open ? 'bg-primary/10 border-primary/40 text-primary' : 'bg-background text-muted-foreground hover:text-foreground')}>
          <Search className="h-3.5 w-3.5" />{p.q ? `"${p.q}"` : 'Search & sort'}
          <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', open && 'rotate-180')} />
        </button>
        <AddButton h={h} />
      </div>
      {open && (
        <div className="flex items-center gap-2 mt-1.5 animate-in fade-in slide-in-from-top-1">
          <SearchBox q={p.q} setQ={p.setQ} h={h} />
          <CountPills files={p.files} dividers={p.dividers} />
          <SortIcon sort={p.sort} setSort={p.setSort} cls={sq(p.d)} />
        </div>
      )}
    </div>
  );
};

/* D: Minimal — chevron tab hanging below the bar */
const VD = (p: VProps) => {
  const [open, setOpen] = useState(false);
  const h = hh(p.d);
  return (
    <div className="relative">
      <div className={cn('rounded-xl border bg-muted', pad(p.d), open && 'rounded-b-none')}>
        <div className="flex items-center gap-2">
          <SelectSeg h={h} sel={p.sel} setSel={p.setSel} />
          <GalleryCard h={h} />
          <GalleryActions h={h} />
          <div className="flex-1" />
          <AddButton h={h} />
        </div>
      </div>
      {open && (
        <div className={cn('flex items-center gap-2 rounded-b-xl border border-t-0 bg-muted/50', pad(p.d))}>
          <SearchBox q={p.q} setQ={p.setQ} h={h} />
          <CountPills files={p.files} dividers={p.dividers} />
          <SortIcon sort={p.sort} setSort={p.setSort} cls={sq(p.d)} />
        </div>
      )}
      <div className="flex justify-center">
        <button onClick={() => setOpen(!open)}
          className="-mt-px flex items-center gap-1 rounded-b-lg border border-t-0 bg-muted px-3 py-0.5 text-[11px] text-muted-foreground hover:text-foreground">
          {open ? 'Fewer options' : 'More options'}
          <ChevronDown className={cn('h-3 w-3 transition-transform', open && 'rotate-180')} />
        </button>
      </div>
    </div>
  );
};

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

/* Rows: indent = toolbar border(1) + toolbar padding + segment border(1) → checkbox lines up.
   Row itself has border(1) + px-3, so outer margin = toolbar padding + 1px. */
const Rows = ({ d, items, sel }: { d: Density; items: Item[]; sel: boolean }) => (
  <div className={cn('mt-3 space-y-2', d === 'compact' ? 'mx-[5px]' : 'mx-[7px]')}>
    {items.length === 0 && <div className="text-sm text-muted-foreground py-4 text-center">No files match your search.</div>}
    {items.map((it) =>
      it.divider ? (
        <div key={it.id} className="flex items-center gap-3 py-1">
          <div className="h-px flex-1 bg-border" /><span className="text-xs uppercase tracking-wider text-muted-foreground">{it.title}</span><div className="h-px flex-1 bg-border" />
        </div>
      ) : (
        <div key={it.id} className={cn('flex items-center gap-3 rounded-lg border bg-background', ROW_PX, d === 'compact' ? 'py-1.5' : 'py-3')}>
          <Checkbox checked={sel} />
          <div className={cn('rounded bg-muted flex items-center justify-center', d === 'compact' ? 'h-8 w-6' : 'h-12 w-9')}><FileText className="h-3.5 w-3.5 text-muted-foreground" /></div>
          <div className="flex-1">
            <div className="text-sm font-medium">{it.title}</div>
            {d === 'normal' && <div className="text-xs text-muted-foreground">{it.date}</div>}
          </div>
        </div>
      ),
    )}
  </div>
);

const VARIANTS = [
  { name: 'A. Sliding Tray', desc: 'Filter icon next to Add slides a second row open inside the same grey bar: search, counts, full sort menu.', C: VA },
  { name: 'B. Sort Icon + Options Card', desc: 'Sort icon stays in the bar while collapsed. Expanded pane is a white card with search, counts and sort chips.', C: VB },
  { name: 'C. "Search & Sort" Toggle', desc: 'A labelled toggle makes the pane easy to discover. Shows the active search term when collapsed.', C: VC },
  { name: 'D. Hanging Tab', desc: 'Cleanest bar: only Select all, gallery and Add. A small "More options" tab below opens the pane.', C: VD },
];

const Section = ({ name, desc, C }: (typeof VARIANTS)[number]) => {
  const [d, setD] = useState<Density>('normal');
  const [sort, setSort] = useState<Sort>('newest');
  const [sel, setSel] = useState(false);
  const [q, setQ] = useState('');
  const items = useMemo(() => {
    const ql = q.trim().toLowerCase();
    let list = ITEMS.filter((i) => !ql || (!i.divider && i.title.toLowerCase().includes(ql)));
    if (!ql && sort === 'alphabetical') list = list.filter((i) => !i.divider).sort((a, b) => a.title.localeCompare(b.title));
    if (!ql && sort === 'oldest') list = [...list].reverse();
    return list;
  }, [q, sort]);
  const files = ITEMS.filter((i) => !i.divider).length;
  const dividers = ITEMS.length - files;
  return (
    <section className="space-y-3">
      <div className="flex items-start justify-between gap-4">
        <div><h2 className="font-semibold">{name}</h2><p className="text-sm text-muted-foreground">{desc}</p></div>
        <DensityToggle d={d} setD={setD} />
      </div>
      <div className="rounded-xl border p-5 bg-card">
        <C d={d} sort={sort} setSort={setSort} sel={sel} setSel={setSel} q={q} setQ={setQ} files={files} dividers={dividers} />
        <Rows d={d} items={items} sel={sel} />
      </div>
    </section>
  );
};

export default function ToolbarShowcase2() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-5xl mx-auto space-y-10">
        <div>
          <h1 className="text-2xl font-semibold">Galleries Toolbar — Segmented Pill Bar Variants</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Grey tray, gallery in a white card, single Add menu, and a collapsible pane (closed by default) with live search, file/divider counts and sorting.
            The "All" checkbox lines up with the item checkboxes. Try typing in search — it filters in real time.
          </p>
        </div>
        {VARIANTS.map((v) => <Section key={v.name} {...v} />)}
      </div>
    </div>
  );
}
