"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  BoldIcon, ItalicIcon, UnderlineIcon, StrikethroughIcon,
  Loader2Icon, CameraIcon, PlusIcon, TrashIcon, XIcon, CheckIcon, ShieldIcon,
} from "lucide-react";
import {
  type Note, type NoteTab,
  getAllNotes, saveNote, deleteNote,
  makeId, makeNewNote, slugify,
} from "@/lib/notes-db";

const COLORS = [
  { label: "Ink",     value: "#1a1a2e" },
  { label: "Navy",    value: "#1e40af" },
  { label: "Forest",  value: "#166534" },
  { label: "Crimson", value: "#991b1b" },
  { label: "Plum",    value: "#6b21a8" },
  { label: "Amber",   value: "#92400e" },
];

const TORN_BOTTOM = "polygon(0 0,100% 0,100% calc(100% - 8px),98% calc(100% - 5px),95% calc(100% - 9px),92% calc(100% - 4px),89% calc(100% - 10px),86% calc(100% - 5px),83% calc(100% - 8px),80% calc(100% - 3px),77% calc(100% - 9px),74% calc(100% - 5px),71% calc(100% - 10px),68% calc(100% - 4px),65% calc(100% - 8px),62% calc(100% - 5px),59% calc(100% - 10px),56% calc(100% - 3px),53% calc(100% - 8px),50% calc(100% - 6px),47% calc(100% - 10px),44% calc(100% - 4px),41% calc(100% - 9px),38% calc(100% - 5px),35% calc(100% - 10px),32% calc(100% - 3px),29% calc(100% - 8px),26% calc(100% - 5px),23% calc(100% - 10px),20% calc(100% - 4px),17% calc(100% - 9px),14% calc(100% - 5px),11% calc(100% - 10px),8% calc(100% - 3px),5% calc(100% - 8px),2% calc(100% - 5px),0 calc(100% - 9px))";

const HEADER_H = 68;
const DISCLAIMER_KEY = "scribble-disclaimer-dismissed";

function buildFont(bold: boolean, italic: boolean, size: number, family: string) {
  return `${italic ? "italic" : "normal"} ${bold ? "700" : "400"} ${size}px ${family}`;
}

async function ensureFontLoaded(family: string, size: number) {
  const variants = [`400 normal ${size}px ${family}`, `700 normal ${size}px ${family}`, `400 italic ${size}px ${family}`, `700 italic ${size}px ${family}`];
  await Promise.all(variants.map(v => document.fonts.load(v).catch(() => null)));
}

type StyleState = { color: string; bold: boolean; italic: boolean; underline: boolean; strike: boolean };
type TextSegment = StyleState & { text: string };
type Line = TextSegment[];

function parseHtmlToLines(html: string): Line[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div>${html}</div>`, "text/html");
  const root = doc.querySelector("div")!;
  const lines: Line[] = [[]];
  function walk(node: Node, style: StyleState) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent ?? "";
      if (text) lines[lines.length - 1].push({ text, ...style });
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const el = node as Element;
    const tag = el.tagName.toLowerCase();
    const next: StyleState = { ...style };
    if (tag === "b" || tag === "strong") next.bold = true;
    if (tag === "i" || tag === "em") next.italic = true;
    if (tag === "u") next.underline = true;
    if (tag === "s" || tag === "strike") next.strike = true;
    if (tag === "font") { const c = el.getAttribute("color"); if (c) next.color = c; }
    if (tag === "span") {
      const s = (el as HTMLElement).style;
      if (s.color) next.color = s.color;
      if (s.fontWeight === "bold" || Number(s.fontWeight) >= 700) next.bold = true;
      if (s.fontStyle === "italic") next.italic = true;
      if (s.textDecoration?.includes("underline")) next.underline = true;
      if (s.textDecoration?.includes("line-through")) next.strike = true;
    }
    if (tag === "br") { lines.push([]); return; }
    const isBlock = tag === "div" || tag === "p";
    if (isBlock && lines[lines.length - 1].length > 0) lines.push([]);
    for (const child of Array.from(el.childNodes)) walk(child, next);
    if (isBlock) lines.push([]);
  }
  walk(root, { color: "#1a1a2e", bold: false, italic: false, underline: false, strike: false });
  while (lines.length > 0 && lines[lines.length - 1].length === 0) lines.pop();
  return lines;
}

function applyTornClip(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const pts: [number, number][] = [
    [0,0],[w,0],[w,h-8],[w*.98,h-5],[w*.95,h-9],[w*.92,h-4],[w*.89,h-10],
    [w*.86,h-5],[w*.83,h-8],[w*.80,h-3],[w*.77,h-9],[w*.74,h-5],[w*.71,h-10],
    [w*.68,h-4],[w*.65,h-8],[w*.62,h-5],[w*.59,h-10],[w*.56,h-3],[w*.53,h-8],
    [w*.50,h-6],[w*.47,h-10],[w*.44,h-4],[w*.41,h-9],[w*.38,h-5],[w*.35,h-10],
    [w*.32,h-3],[w*.29,h-8],[w*.26,h-5],[w*.23,h-10],[w*.20,h-4],[w*.17,h-9],
    [w*.14,h-5],[w*.11,h-10],[w*.08,h-3],[w*.05,h-8],[w*.02,h-5],[0,h-9],
  ];
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.closePath(); ctx.clip();
}

function drawNoteCanvas(html: string, fontSize: number, fontFamily: string): HTMLCanvasElement {
  const SCALE = 2, NOTE_W = 680, PAD_LEFT = 76, PAD_RIGHT = 36, PAD_BOTTOM = 48;
  const LINE_H = Math.round(fontSize * 1.72);
  const TEXT_W = NOTE_W - PAD_LEFT - PAD_RIGHT;
  const parsedLines = parseHtmlToLines(html);
  const mc = document.createElement("canvas");
  const mCtx = mc.getContext("2d")!;
  type RowSeg = StyleState & { text: string; w: number };
  type DrawCall = StyleState & { text: string; x: number; y: number; w: number };
  const calls: DrawCall[] = [];
  let rowCount = 0;
  const commitRow = (row: RowSeg[]) => {
    let rx = PAD_LEFT;
    const baseline = HEADER_H + (rowCount + 1) * LINE_H - Math.round(LINE_H * 0.18);
    for (const s of row) { calls.push({ ...s, x: rx, y: baseline }); rx += s.w; }
    rowCount++;
  };
  for (const line of parsedLines) {
    if (line.length === 0) { rowCount++; continue; }
    let row: RowSeg[] = [], rowW = 0;
    const words: (StyleState & { word: string })[] = [];
    for (const seg of line) for (const w of seg.text.split(/(\s+)/)) if (w) words.push({ ...seg, word: w });
    for (const token of words) {
      mCtx.font = buildFont(token.bold, token.italic, fontSize, fontFamily);
      const tw = mCtx.measureText(token.word).width;
      if (rowW + tw > TEXT_W && rowW > 0) { commitRow(row); row = []; rowW = 0; }
      const last = row[row.length - 1];
      if (last && last.color === token.color && last.bold === token.bold && last.italic === token.italic && last.underline === token.underline && last.strike === token.strike) {
        last.text += token.word; last.w += tw;
      } else {
        row.push({ color: token.color, bold: token.bold, italic: token.italic, underline: token.underline, strike: token.strike, text: token.word, w: tw });
      }
      rowW += tw;
    }
    if (row.length > 0) commitRow(row);
  }
  const NOTE_H = HEADER_H + (rowCount + 1) * LINE_H + PAD_BOTTOM;
  const canvas = document.createElement("canvas");
  canvas.width = NOTE_W * SCALE; canvas.height = NOTE_H * SCALE;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(SCALE, SCALE);
  ctx.save();
  applyTornClip(ctx, NOTE_W, NOTE_H);
  ctx.fillStyle = "#fdf9f0"; ctx.fillRect(0, 0, NOTE_W, NOTE_H);
  const hg = ctx.createLinearGradient(0, 0, 0, HEADER_H);
  hg.addColorStop(0, "#ede0c4"); hg.addColorStop(0.6, "#f5ecd8"); hg.addColorStop(1, "#fdf9f0");
  ctx.fillStyle = hg; ctx.fillRect(0, 0, NOTE_W, HEADER_H);
  ctx.strokeStyle = "#d4c9a8"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(0, HEADER_H); ctx.lineTo(NOTE_W, HEADER_H); ctx.stroke();
  ctx.strokeStyle = "#c8d8e8"; ctx.lineWidth = 1;
  for (let i = 1; HEADER_H + i * LINE_H < NOTE_H; i++) { const y = HEADER_H + i * LINE_H; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(NOTE_W, y); ctx.stroke(); }
  ctx.strokeStyle = "#e8a0a0"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(57, 0); ctx.lineTo(57, NOTE_H); ctx.stroke();
  ctx.fillStyle = "#1a1410"; ctx.shadowColor = "rgba(0,0,0,0.55)"; ctx.shadowBlur = 6; ctx.shadowOffsetY = 2;
  let ringY = HEADER_H + LINE_H * 2;
  while (ringY < NOTE_H - LINE_H) { ctx.beginPath(); ctx.arc(24, ringY, 8, 0, Math.PI * 2); ctx.fill(); ringY += LINE_H * 4; }
  ctx.shadowColor = "transparent"; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
  for (const d of calls) {
    ctx.font = buildFont(d.bold, d.italic, fontSize, fontFamily);
    ctx.fillStyle = d.color; ctx.fillText(d.text, d.x, d.y);
    if (d.underline) { ctx.strokeStyle = d.color; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(d.x, d.y+3); ctx.lineTo(d.x+d.w, d.y+3); ctx.stroke(); }
    if (d.strike) { ctx.strokeStyle = d.color; ctx.lineWidth = 1.2; const mid = d.y - fontSize * 0.35; ctx.beginPath(); ctx.moveTo(d.x, mid); ctx.lineTo(d.x+d.w, mid); ctx.stroke(); }
  }
  ctx.restore();
  return canvas;
}

function timeAgo(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

function htmlToPreview(html: string): string {
  if (typeof document === "undefined") return "";
  const div = document.createElement("div");
  div.innerHTML = html.replace(/<br\s*\/?>/gi, " ");
  return (div.innerText || div.textContent || "").trim().slice(0, 80);
}

function Disclaimer({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="flex items-start gap-3 px-4 py-3 rounded-xl" style={{ background: "rgba(232,93,38,0.08)", border: "1px solid rgba(232,93,38,0.2)" }}>
      <ShieldIcon className="w-4 h-4 text-[#e85d26] flex-shrink-0 mt-0.5" />
      <p className="text-xs text-neutral-400 leading-relaxed flex-1">
        Your notes stay on <span className="text-neutral-200 font-medium">your device</span> — stored in your browser&apos;s IndexedDB. Nothing is ever sent to a server.
      </p>
      <button onClick={onDismiss} className="text-neutral-600 hover:text-neutral-300 transition-colors flex-shrink-0">
        <XIcon className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

type Props = { initialSlug?: string };

export default function NotesApp({ initialSlug }: Props) {
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [activeTabId, setActiveTabId] = useState<string>("");
  const [capturing, setCapturing] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");
  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [tabDraft, setTabDraft] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  const contentRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const tabInputRef = useRef<HTMLInputElement>(null);

  const activeTab = activeNote?.tabs.find(t => t.id === activeTabId) ?? null;
  const fontSize = activeNote?.fontSize ?? 20;
  const lineHeight = Math.round(fontSize * 1.72);
  const contentPadTop = HEADER_H + Math.round(lineHeight * 0.5);
  const lineGridOffset = contentPadTop % lineHeight;

  const paperLines: React.CSSProperties = {
    backgroundImage: [
      `repeating-linear-gradient(transparent, transparent ${lineHeight - 1}px, #c8d8e8 ${lineHeight - 1}px, #c8d8e8 ${lineHeight}px)`,
      `linear-gradient(to right, transparent 56px, #e8a0a0 56px, #e8a0a0 58px, transparent 58px)`,
    ].join(", "),
    backgroundPositionY: `${lineGridOffset}px`,
  };

  useEffect(() => {
    (async () => {
      try {
        const dismissed = localStorage.getItem(DISCLAIMER_KEY);
        if (!dismissed) setShowDisclaimer(true);
      } catch {}
      const all = await getAllNotes();
      setNotes(all);
      if (all.length === 0) {
        const fresh = makeNewNote("My Notes");
        await saveNote(fresh);
        setNotes([fresh]); setActiveNote(fresh); setActiveTabId(fresh.activeTabId);
        router.replace(`/notes/${fresh.slug}`);
      } else {
        const target = initialSlug ? (all.find(n => n.slug === initialSlug) ?? all[0]) : all[0];
        setActiveNote(target); setActiveTabId(target.activeTabId);
        if (!initialSlug) router.replace(`/notes/${target.slug}`);
      }
      setLoaded(true);
    })();
  }, []);

  useEffect(() => {
    if (!loaded || !activeTab || !contentRef.current) return;
    contentRef.current.innerHTML = activeTab.html;
    const range = document.createRange();
    const sel = window.getSelection();
    range.selectNodeContents(contentRef.current);
    range.collapse(false);
    sel?.removeAllRanges();
    sel?.addRange(range);
  }, [activeTabId, activeNote?.id, loaded]);

  useEffect(() => { if (editingTitle && titleInputRef.current) titleInputRef.current.focus(); }, [editingTitle]);
  useEffect(() => { if (editingTabId && tabInputRef.current) tabInputRef.current.focus(); }, [editingTabId]);

  const dismissDisclaimer = useCallback(() => {
    try { localStorage.setItem(DISCLAIMER_KEY, "1"); } catch {}
    setShowDisclaimer(false);
  }, []);

  const persistNote = useCallback(async (note: Note) => {
    const updated = { ...note, updatedAt: Date.now() };
    await saveNote(updated);
    setNotes(prev => {
      const idx = prev.findIndex(n => n.id === updated.id);
      if (idx === -1) return [updated, ...prev];
      const next = [...prev]; next[idx] = updated; return next;
    });
    return updated;
  }, []);

  const handleInput = useCallback(() => {
    if (!contentRef.current || !activeNote || !activeTab) return;
    const html = contentRef.current.innerHTML;
    const updatedTabs = activeNote.tabs.map(t => t.id === activeTabId ? { ...t, html, updatedAt: Date.now() } : t);
    const updated = { ...activeNote, tabs: updatedTabs };
    setActiveNote(updated); persistNote(updated);
  }, [activeNote, activeTab, activeTabId, persistNote]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter") { e.preventDefault(); document.execCommand("insertLineBreak"); return; }
    if (e.metaKey || e.ctrlKey) {
      if (e.key === "b") { e.preventDefault(); document.execCommand("bold"); }
      if (e.key === "i") { e.preventDefault(); document.execCommand("italic"); }
      if (e.key === "u") { e.preventDefault(); document.execCommand("underline"); }
    }
  }, []);

  const applyColor = useCallback((color: string) => {
    contentRef.current?.focus(); document.execCommand("foreColor", false, color); handleInput();
  }, [handleInput]);

  const execFormat = useCallback((cmd: string) => {
    contentRef.current?.focus(); document.execCommand(cmd); handleInput();
  }, [handleInput]);

  const handleSizeChange = useCallback((size: number) => {
    if (!activeNote) return;
    const updated = { ...activeNote, fontSize: size };
    setActiveNote(updated); persistNote(updated);
  }, [activeNote, persistNote]);

  const selectNote = useCallback(async (note: Note) => {
    if (contentRef.current && activeTab && activeNote) {
      const html = contentRef.current.innerHTML;
      const updatedTabs = activeNote.tabs.map(t => t.id === activeTabId ? { ...t, html } : t);
      await persistNote({ ...activeNote, tabs: updatedTabs });
    }
    setActiveNote(note); setActiveTabId(note.activeTabId);
    router.push(`/notes/${note.slug}`);
  }, [activeNote, activeTab, activeTabId, persistNote, router]);

  const addNote = useCallback(async () => {
    const fresh = makeNewNote("Untitled");
    await saveNote(fresh);
    setNotes(prev => [fresh, ...prev]);
    setActiveNote(fresh); setActiveTabId(fresh.activeTabId);
    router.push(`/notes/${fresh.slug}`);
    setTimeout(() => { setTitleDraft("Untitled"); setEditingTitle(true); }, 100);
  }, [router]);

  const removeNote = useCallback(async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteNote(id);
    const remaining = notes.filter(n => n.id !== id);
    setNotes(remaining);
    if (activeNote?.id === id) {
      if (remaining.length > 0) {
        setActiveNote(remaining[0]); setActiveTabId(remaining[0].activeTabId);
        router.push(`/notes/${remaining[0].slug}`);
      } else {
        const fresh = makeNewNote("My Notes");
        await saveNote(fresh);
        setNotes([fresh]); setActiveNote(fresh); setActiveTabId(fresh.activeTabId);
        router.push(`/notes/${fresh.slug}`);
      }
    }
  }, [notes, activeNote, router]);

  const addTab = useCallback(async () => {
    if (!activeNote) return;
    const newTab: NoteTab = { id: makeId(), title: `Page ${activeNote.tabs.length + 1}`, html: "", createdAt: Date.now(), updatedAt: Date.now() };
    const updated = { ...activeNote, tabs: [...activeNote.tabs, newTab], activeTabId: newTab.id };
    setActiveNote(updated); setActiveTabId(newTab.id); await persistNote(updated);
  }, [activeNote, persistNote]);

  const removeTab = useCallback(async (tabId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!activeNote || activeNote.tabs.length === 1) return;
    const remaining = activeNote.tabs.filter(t => t.id !== tabId);
    const newActive = activeTabId === tabId ? remaining[remaining.length - 1].id : activeTabId;
    const updated = { ...activeNote, tabs: remaining, activeTabId: newActive };
    setActiveNote(updated); setActiveTabId(newActive); await persistNote(updated);
  }, [activeNote, activeTabId, persistNote]);

  const commitTitle = useCallback(async () => {
    if (!activeNote || !titleDraft.trim()) { setEditingTitle(false); return; }
    const newSlug = slugify(titleDraft) + "-" + activeNote.slug.split("-").pop();
    const updated = { ...activeNote, title: titleDraft.trim(), slug: newSlug };
    setActiveNote(updated); await persistNote(updated);
    router.replace(`/notes/${newSlug}`); setEditingTitle(false);
  }, [activeNote, titleDraft, persistNote, router]);

  const commitTabTitle = useCallback(async () => {
    if (!activeNote || !editingTabId) return;
    const updatedTabs = activeNote.tabs.map(t => t.id === editingTabId ? { ...t, title: tabDraft.trim() || t.title } : t);
    const updated = { ...activeNote, tabs: updatedTabs };
    setActiveNote(updated); await persistNote(updated); setEditingTabId(null);
  }, [activeNote, editingTabId, tabDraft, persistNote]);

  const handleScreenshot = useCallback(async () => {
    if (capturing || !activeTab) return;
    setCapturing(true);
    try {
      const cssFontName = getComputedStyle(document.documentElement).getPropertyValue("--font-caveat").trim();
      const fontFamily = cssFontName || "Caveat";
      await ensureFontLoaded(fontFamily, fontSize);
      const canvas = drawNoteCanvas(activeTab.html, fontSize, fontFamily);
      canvas.toBlob((blob) => {
        if (!blob) { setCapturing(false); return; }
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = `${activeNote?.title ?? "note"}.png`; a.click();
        URL.revokeObjectURL(url); setCapturing(false);
      }, "image/png");
    } catch (err) { console.error(err); setCapturing(false); }
  }, [capturing, activeTab, fontSize, activeNote]);

  const tbBtn = "p-2 rounded text-neutral-400 hover:text-neutral-100 hover:bg-white/10 transition-all";
  const sep = <div className="w-px h-4 bg-white/10 flex-shrink-0" />;

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0c0a08" }}>
        <Loader2Icon className="w-6 h-6 text-neutral-600 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <style>{`
        .scribble-content * { font-family: var(--font-caveat), cursive !important; }
        .scribble-content strong { font-weight: 700; }
        .scribble-content em { font-style: italic; }
        .scribble-content u { text-decoration: underline; }
        .scribble-content s { text-decoration: line-through; }
        .scribble-content font { font-family: var(--font-caveat), cursive !important; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .spinning { animation: spin 0.7s linear infinite; }
      `}</style>

      <div className="min-h-screen flex flex-col items-center justify-center p-8 gap-4" style={{ background: "#0c0a08" }}>

        {showDisclaimer && (
          <div style={{ width: "min(960px, 100%)" }}>
            <Disclaimer onDismiss={dismissDisclaimer} />
          </div>
        )}

        <div className="flex gap-8 w-full items-start" style={{ maxWidth: 960 }}>

          {/* ── NOTE WIDGET ── */}
          <div className="flex flex-col flex-shrink-0" style={{ width: "min(620px, 62vw)", filter: "drop-shadow(0 32px 80px rgba(0,0,0,0.8))" }}>
            <div
              className="flex items-center gap-2 px-4 py-3 rounded-t-xl flex-wrap"
              style={{ background: "#111109", border: "1px solid rgba(255,255,255,0.08)", borderBottom: "1px solid rgba(255,255,255,0.05)", minHeight: 52 }}
            >
              <div className="flex items-center gap-2 flex-shrink-0">
                {COLORS.map((c) => (
                  <button key={c.value} onClick={() => applyColor(c.value)}
                    className="rounded-full flex-shrink-0 transition-all hover:scale-125 hover:ring-2 hover:ring-white/40 hover:ring-offset-1 hover:ring-offset-[#111109]"
                    style={{ width: 16, height: 16, background: c.value }} title={c.label} />
                ))}
              </div>
              {sep}
              <button onClick={() => execFormat("bold")} className={tbBtn}><BoldIcon className="w-4 h-4" /></button>
              <button onClick={() => execFormat("italic")} className={tbBtn}><ItalicIcon className="w-4 h-4" /></button>
              <button onClick={() => execFormat("underline")} className={tbBtn}><UnderlineIcon className="w-4 h-4" /></button>
              <button onClick={() => execFormat("strikeThrough")} className={tbBtn}><StrikethroughIcon className="w-4 h-4" /></button>
              {sep}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">Size</span>
                <input type="range" min={14} max={40} value={fontSize} onChange={(e) => handleSizeChange(Number(e.target.value))} className="w-20" style={{ accentColor: "#e85d26" }} />
                <span className="text-[10px] font-mono text-neutral-400 w-5 tabular-nums">{fontSize}</span>
              </div>
              {sep}
              <button onClick={handleScreenshot} className={tbBtn} disabled={capturing}>
                {capturing ? <Loader2Icon className="w-4 h-4 spinning" /> : <CameraIcon className="w-4 h-4" />}
              </button>
            </div>

            <div
              className="relative overflow-hidden"
              style={{ background: "#fdf9f0", minHeight: 480, maxHeight: "calc(100vh - 140px)", clipPath: TORN_BOTTOM }}
            >
              <div className="absolute top-0 left-0 right-0 pointer-events-none" style={{ height: HEADER_H, background: "linear-gradient(180deg, #ede0c4 0%, #f5ecd8 60%, #fdf9f0 100%)", borderBottom: "2px solid #d4c9a8", zIndex: 2 }} />

              {/* Tabs */}
              <div className="absolute top-0 left-14 right-0 flex items-end gap-1 px-2 pointer-events-auto" style={{ zIndex: 3, height: HEADER_H }}>
                {activeNote?.tabs.map((tab) => (
                  <div
                    key={tab.id}
                    onClick={() => {
                      if (editingTabId === tab.id) return;
                      if (contentRef.current && activeTab && activeNote) {
                        const html = contentRef.current.innerHTML;
                        const updatedTabs = activeNote.tabs.map(t => t.id === activeTabId ? { ...t, html } : t);
                        persistNote({ ...activeNote, tabs: updatedTabs, activeTabId: tab.id });
                      }
                      setActiveTabId(tab.id);
                    }}
                    className="group flex items-center gap-1 px-3 cursor-pointer transition-all select-none"
                    style={{
                      height: 36, marginTop: "auto", borderRadius: "6px 6px 0 0",
                      background: tab.id === activeTabId ? "#fdf9f0" : "rgba(0,0,0,0.06)",
                      border: "1px solid", borderColor: tab.id === activeTabId ? "#d4c9a8" : "transparent",
                      borderBottom: tab.id === activeTabId ? "2px solid #fdf9f0" : "none",
                      fontFamily: "var(--font-caveat), cursive", fontSize: 14,
                      color: tab.id === activeTabId ? "#1a1a2e" : "#7a7060",
                      minWidth: 60, maxWidth: 120,
                    }}
                  >
                    {editingTabId === tab.id ? (
                      <input ref={tabInputRef} value={tabDraft} onChange={e => setTabDraft(e.target.value)}
                        onBlur={commitTabTitle}
                        onKeyDown={e => { if (e.key === "Enter") commitTabTitle(); if (e.key === "Escape") setEditingTabId(null); }}
                        className="bg-transparent outline-none w-full"
                        style={{ fontFamily: "var(--font-caveat), cursive", fontSize: 14, color: "#1a1a2e" }}
                        onClick={e => e.stopPropagation()} />
                    ) : (
                      <span className="truncate flex-1" onDoubleClick={(e) => { e.stopPropagation(); setEditingTabId(tab.id); setTabDraft(tab.title); }}>
                        {tab.title}
                      </span>
                    )}
                    {activeNote!.tabs.length > 1 && (
                      <button onClick={(e) => removeTab(tab.id, e)} className="opacity-0 group-hover:opacity-100 transition-opacity ml-1 text-neutral-400 hover:text-red-500">
                        <XIcon className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
                <button onClick={addTab} className="flex items-center justify-center text-neutral-500 hover:text-neutral-300 transition-colors" style={{ width: 28, height: 28, marginTop: "auto", marginBottom: 4, borderRadius: 4 }}>
                  <PlusIcon className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Ring holes */}
              <div className="absolute top-0 bottom-0 left-0 w-14 flex flex-col items-center pointer-events-none z-10" style={{ paddingTop: HEADER_H + lineHeight }}>
                {Array.from({ length: 14 }).map((_, i) => (
                  <div key={i} className="rounded-full flex-shrink-0" style={{ width: 16, height: 16, background: "#1a1410", marginBottom: `${lineHeight * 4 - 16}px`, boxShadow: "inset 0 2px 5px rgba(0,0,0,0.6), 0 1px 2px rgba(255,255,255,0.1)" }} />
                ))}
              </div>

              <div
                ref={contentRef}
                contentEditable
                suppressContentEditableWarning
                onInput={handleInput}
                onKeyDown={handleKeyDown}
                spellCheck={false}
                className="scribble-content relative outline-none overflow-y-auto"
                style={{
                  fontFamily: "var(--font-caveat), cursive",
                  color: "#1a1a2e",
                  ...paperLines,
                  fontSize,
                  lineHeight: `${lineHeight}px`,
                  paddingTop: `${contentPadTop}px`,
                  paddingBottom: "60px",
                  paddingLeft: "76px",
                  paddingRight: "36px",
                  minHeight: 480,
                  maxHeight: "calc(100vh - 200px)",
                  caretColor: "#1a1a2e",
                  wordBreak: "break-word",
                  zIndex: 1,
                }}
              />
            </div>
          </div>

          {/* ── SIDEBAR ── */}
          <div className="flex flex-col gap-4 flex-1" style={{ minWidth: 240, maxWidth: 300, paddingTop: 4 }}>
            <div className="flex items-center gap-2">
              {editingTitle ? (
                <div className="flex items-center gap-2 flex-1">
                  <input ref={titleInputRef} value={titleDraft} onChange={e => setTitleDraft(e.target.value)}
                    onBlur={commitTitle}
                    onKeyDown={e => { if (e.key === "Enter") commitTitle(); if (e.key === "Escape") setEditingTitle(false); }}
                    className="flex-1 bg-transparent outline-none border-b-2 border-[#e85d26] text-neutral-100 py-0.5"
                    style={{ fontFamily: "var(--font-caveat), cursive", fontSize: 22 }} />
                  <button onClick={commitTitle} className="text-green-400 hover:text-green-300 flex-shrink-0"><CheckIcon className="w-4 h-4" /></button>
                </div>
              ) : (
                <button
                  onClick={() => { setTitleDraft(activeNote?.title ?? ""); setEditingTitle(true); }}
                  className="text-left flex-1 text-neutral-100 hover:text-white transition-colors"
                  style={{ fontFamily: "var(--font-caveat), cursive", fontSize: 22 }}
                  title="Click to rename"
                >
                  {activeNote?.title ?? "—"}
                </button>
              )}
            </div>

            <button
              onClick={addNote}
              className="flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-mono tracking-widest uppercase transition-all text-neutral-200 hover:text-white hover:border-neutral-400"
              style={{ border: "1px dashed rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.04)" }}
            >
              <PlusIcon className="w-3.5 h-3.5" />
              New Note
            </button>

            <div className="flex flex-col gap-2 overflow-y-auto" style={{ maxHeight: "calc(100vh - 260px)" }}>
              {notes.map((note) => {
                const isActive = note.id === activeNote?.id;
                const preview = htmlToPreview(note.tabs[0]?.html ?? "");
                return (
                  <button key={note.id} onClick={() => selectNote(note)}
                    className="group relative text-left px-4 py-3 rounded-xl transition-all"
                    style={{
                      background: isActive ? "rgba(253,249,240,0.08)" : "rgba(255,255,255,0.03)",
                      border: "1px solid",
                      borderColor: isActive ? "rgba(212,201,168,0.4)" : "rgba(255,255,255,0.08)",
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="flex-1 truncate" style={{ fontFamily: "var(--font-caveat), cursive", fontSize: 18, color: isActive ? "#f5ecd8" : "#c8bfb0" }}>
                        {note.title}
                      </span>
                      <button onClick={(e) => removeNote(note.id, e)} className="opacity-0 group-hover:opacity-100 transition-opacity text-neutral-600 hover:text-red-400 flex-shrink-0 mt-0.5">
                        <TrashIcon className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-neutral-500 text-[11px] mt-1 font-mono">
                      {note.tabs.length} {note.tabs.length === 1 ? "page" : "pages"} · {timeAgo(note.updatedAt)}
                    </p>
                    {preview && (
                      <p className="mt-1.5 text-neutral-500 text-xs truncate" style={{ fontFamily: "var(--font-caveat), cursive", fontSize: 13 }}>
                        {preview}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}