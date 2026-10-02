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
type Kind = 'all' | 'files' | 'dividers';
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

const hh = (d: Density) => (d === 'compact' ? 'h-8' : 'h-10');
const pad = (d: Density) => (d === 'compact' ? 'p-1' : 'p-1.5');

const AddButton = ({ h }: { h: string }) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button className={cn(h, 'gap-1.5')}><Plus className="h-4 w-4" />Add<ChevronDown className="h-3.5 w-3.5 opacity-80" /></Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="w-64">
      <DropdownMenuLabel className="text-xs text-muted-foreground">Add to gallery</DropdownMenuLabel>
      {([[Upload, 'File', 'PDF, Office, image, video'], [Link, 'Link / YouTube', 'Add via URL']] as const).map(([I, t, s]) => (
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
    </DropdownMenuContent>
  </DropdownMenu>
);

const GalleryCard = ({ h, badge }: { h: string; badge?: React.ReactNode }) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <button className={cn(h, 'flex items-center gap-2 px-3 rounded-lg bg-background border text-sm min-w-[190px] justify-between')}>
        <span className="flex items-center gap-2"><FolderOpen className="h-4 w-4 text-primary" /><span className="font-medium">Newsletters 2026</span>{badge}</span>
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
      </button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="center">
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

const SelectSeg = ({ h, sel, setSel, extra }: { h: string; sel: boolean; setSel: (b: boolean) => void; extra?: React.ReactNode }) => (
  <label className={cn(h, 'flex items-center gap-2 px-3 rounded-lg bg-background border text-sm cursor-pointer shrink-0')}>
    <Checkbox checked={sel} onCheckedChange={(c) => setSel(!!c)} />
    <span className="text-muted-foreground">{sel ? '4 selected' : 'All'}</span>
    {extra}
  </label>
);

const SettingsToggle = ({ open, setOpen, h, dot }: { open: boolean; setOpen: (b: boolean) => void; h: string; dot?: boolean }) => (
  <button onClick={() => setOpen(!open)} title="More options" aria-expanded={open}
    className={cn(h, 'relative flex items-center justify-center gap-1.5 rounded-lg border px-2.5 text-sm transition-colors',
      open ? 'bg-primary/10 border-primary/40 text-primary' : 'bg-background text-muted-foreground hover:text-foreground')}>
    <SlidersHorizontal className="h-4 w-4" />
    <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', open && 'rotate-180')} />
    {dot && !open && <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-muted" />}
  </button>
);

const SearchBox = ({ q, setQ, h }: { q: string; setQ: (s: string) => void; h: string }) => (
  <div className={cn(h, 'flex items-center gap-2 px-3 rounded-lg bg-background border flex-1 min-w-[180px] focus-within:ring-2 focus-within:ring-ring/40')}>
    <Search className="h-4 w-4 text-muted-foreground" />
    <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search files…" className="bg-transparent outline-none text-sm flex-1" />
    {q && <button onClick={() => setQ('')}><X className="h-3.5 w-3.5 text-muted-foreground" /></button>}
  </div>
);

const SortBtn = ({ sort, setSort, h }: { sort: Sort; setSort: (s: Sort) => void; h: string }) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <button title="Sort" className={cn(h, 'flex items-center gap-2 px-3 rounded-lg bg-background border text-sm shrink-0')}>
        <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />{sortLabel(sort)}<ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
      </button>
    </DropdownMenuTrigger>
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

const DensitySeg = ({ d, setD, h }: { d: Density; setD: (d: Density) => void; h: string }) => (
  <div className={cn(h, 'inline-flex items-center rounded-lg border bg-background p-0.5 shrink-0')}>
    {([['normal', 'Normal', Rows3], ['compact', 'Compact', Rows4]] as const).map(([v, l, I]) => (
      <button key={v} onClick={() => setD(v)} title={l}
        className={cn('h-full flex items-center gap-1.5 px-2.5 rounded-md text-xs transition-colors',
          d === v ? 'bg-muted text-foreground font-medium' : 'text-muted-foreground hover:text-foreground')}>
        <I className="h-3.5 w-3.5" />{l}
      </button>
    ))}
  </div>
);

interface VProps {
  d: Density; setD: (d: Density) => void; sort: Sort; setSort: (s: Sort) => void;
  sel: boolean; setSel: (b: boolean) => void; q: string; setQ: (s: string) => void;
  files: number; dividers: number; kind: Kind; setKind: (k: Kind) => void;
}

/* Shared shell: 3 groups, evenly spaced (justify-between), sliding tray below */
const Shell = ({ p, left, centerBadge, rightDot, trayCounts, trayLead }: {
  p: VProps; left?: React.ReactNode; centerBadge?: React.ReactNode; rightDot?: boolean;
  trayCounts: React.ReactNode; trayLead?: React.ReactNode;
}) => {
  const [open, setOpen] = useState(false);
  const h = hh(p.d);
  return (
    <div className={cn('rounded-xl border bg-muted', pad(p.d))}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1 flex justify-start">{left ?? <SelectSeg h={h} sel={p.sel} setSel={p.setSel} />}</div>
        <div className="flex items-center gap-1 shrink-0"><GalleryCard h={h} badge={centerBadge} /><GalleryActions h={h} /></div>
        <div className="flex-1 flex justify-end items-center gap-2">
          <SettingsToggle open={open} setOpen={setOpen} h={h} dot={rightDot} />
          <AddButton h={h} />
        </div>
      </div>
      <div className={cn('grid transition-all duration-200', open ? 'grid-rows-[1fr] opacity-100 mt-1.5' : 'grid-rows-[0fr] opacity-0')}>
        <div className="overflow-hidden">
          {trayLead}
          <div className="flex flex-wrap items-center gap-2 border-t border-border/70 pt-1.5">
            <SearchBox q={p.q} setQ={p.setQ} h={h} />
            {trayCounts}
            <SortBtn sort={p.sort} setSort={p.setSort} h={h} />
            <DensitySeg d={p.d} setD={p.setD} h={h} />
          </div>
        </div>
      </div>
    </div>
  );
};

/* 1. Twin pills */
const V1 = (p: VProps) => (
  <Shell p={p} trayCounts={
    <div className="flex items-center gap-1.5 text-xs shrink-0">
      <span className="rounded-full bg-background border px-2.5 py-1"><b>{p.files}</b> files</span>
      <span className="rounded-full bg-background border px-2.5 py-1"><b>{p.dividers}</b> dividers</span>
    </div>} />
);

/* 2. Quiet inline text */
const V2 = (p: VProps) => (
  <Shell p={p} trayCounts={
    <span className="text-xs text-muted-foreground px-1 shrink-0">{p.files} files · {p.dividers} dividers</span>} />
);

/* 3. Count badge on the gallery card (always visible) */
const V3 = (p: VProps) => (
  <Shell p={p}
    centerBadge={<span title={`${p.files} files, ${p.dividers} dividers`} className="rounded-full bg-primary/10 text-primary text-[11px] font-semibold px-1.5 min-w-[20px] text-center">{p.files}</span>}
    trayCounts={<span className="text-xs text-muted-foreground shrink-0">{p.dividers} dividers</span>} />
);

/* 4. Icon stat chip, split segments */
const V4 = (p: VProps) => {
  const h = hh(p.d);
  return (
    <Shell p={p} trayCounts={
      <div className={cn(h, 'flex items-center rounded-lg border bg-background text-xs divide-x shrink-0')}>
        <span className="flex items-center gap-1.5 px-3" title="Files"><FileText className="h-3.5 w-3.5 text-primary" /><b>{p.files}</b></span>
        <span className="flex items-center gap-1.5 px-3" title="Dividers"><Minus className="h-3.5 w-3.5 text-primary" /><b>{p.dividers}</b></span>
      </div>} />
  );
};

/* 5. Count tabs that also filter the list */
const V5 = (p: VProps) => {
  const h = hh(p.d);
  const tabs: [Kind, string, number][] = [['all', 'All', p.files + p.dividers], ['files', 'Files', p.files], ['dividers', 'Dividers', p.dividers]];
  return (
    <Shell p={p} rightDot={p.kind !== 'all'} trayCounts={
      <div className={cn(h, 'inline-flex items-center rounded-lg border bg-background p-0.5 shrink-0')}>
        {tabs.map(([k, l, n]) => (
          <button key={k} onClick={() => p.setKind(k)}
            className={cn('h-full flex items-center gap-1.5 px-2.5 rounded-md text-xs transition-colors',
              p.kind === k ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground')}>
            {l}<span className={cn('rounded-full px-1.5 text-[10px] font-semibold', p.kind === k ? 'bg-primary-foreground/20' : 'bg-muted')}>{n}</span>
          </button>
        ))}
      </div>} />
  );
};

const Rows = ({ d, items, sel }: { d: Density; items: Item[]; sel: boolean }) => (
  <div className={cn('mt-3 space-y-2', d === 'compact' ? 'mx-[5px]' : 'mx-[7px]')}>
    {items.length === 0 && <div className="text-sm text-muted-foreground py-4 text-center">Nothing matches.</div>}
    {items.map((it) =>
      it.divider ? (
        <div key={it.id} className="flex items-center gap-3 py-1">
          <div className="h-px flex-1 bg-border" /><span className="text-xs uppercase tracking-wider text-muted-foreground">{it.title}</span><div className="h-px flex-1 bg-border" />
        </div>
      ) : (
        <div key={it.id} className={cn('flex items-center gap-3 rounded-lg border bg-background px-3', d === 'compact' ? 'py-1.5' : 'py-3')}>
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
  { name: '1. Twin Pills', desc: 'Two small white pills in the options tray: "4 files" and "2 dividers".', C: V1 },
  { name: '2. Quiet Text', desc: 'Plain grey text "4 files · 2 dividers" in the tray. Lightest look.', C: V2 },
  { name: '3. Badge on Gallery Name', desc: 'File count is always visible as a small badge on the gallery card. Divider count shows in the tray.', C: V3 },
  { name: '4. Icon Stat Box', desc: 'A boxed segment with a file icon and a divider icon, each with its number. Matches the other boxed tools.', C: V4 },
  { name: '5. Counting Filter Tabs', desc: 'All / Files / Dividers tabs with counts. Clicking one also filters the list. A dot on the options button shows a filter is on.', C: V5 },
];

const Section = ({ name, desc, C }: (typeof VARIANTS)[number]) => {
  const [d, setD] = useState<Density>('normal');
  const [sort, setSort] = useState<Sort>('newest');
  const [sel, setSel] = useState(false);
  const [q, setQ] = useState('');
  const [kind, setKind] = useState<Kind>('all');
  const items = useMemo(() => {
    const ql = q.trim().toLowerCase();
    let list = ITEMS.filter((i) => !ql || (!i.divider && i.title.toLowerCase().includes(ql)));
    if (kind === 'files') list = list.filter((i) => !i.divider);
    if (kind === 'dividers') list = list.filter((i) => i.divider);
    if (!ql && sort === 'alphabetical') list = list.filter((i) => !i.divider).sort((a, b) => a.title.localeCompare(b.title));
    if (!ql && sort === 'oldest') list = [...list].reverse();
    return list;
  }, [q, sort, kind]);
  const files = ITEMS.filter((i) => !i.divider).length;
  return (
    <section className="space-y-3">
      <div><h2 className="font-semibold">{name}</h2><p className="text-sm text-muted-foreground">{desc}</p></div>
      <div className="rounded-xl border p-5 bg-card">
        <C d={d} setD={setD} sort={sort} setSort={setSort} sel={sel} setSel={setSel} q={q} setQ={setQ}
          files={files} dividers={ITEMS.length - files} kind={kind} setKind={setKind} />
        <Rows d={d} items={items} sel={sel} />
      </div>
    </section>
  );
};

export default function ToolbarShowcase3() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-5xl mx-auto space-y-10">
        <div>
          <h1 className="text-2xl font-semibold">Galleries Toolbar — Sliding Tray, Round 3</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Three evenly spaced groups: Select all (left), gallery + its buttons (center), options + Add (right).
            Open the options button to find search, counts, sorting and the Normal / Compact switch. Each option shows the counts differently.
          </p>
        </div>
        {VARIANTS.map((v) => <Section key={v.name} {...v} />)}
      </div>
    </div>
  );
}
