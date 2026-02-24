"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ShrinkIcon, PenLineIcon, BoldIcon, ItalicIcon,
  UnderlineIcon, StrikethroughIcon, Loader2Icon, CameraIcon,
  NotebookIcon, ShieldIcon, XIcon,
} from "lucide-react";

const STORAGE_KEY = "portfolio-scribble-note";
const DISCLAIMER_KEY = "scribble-disclaimer-dismissed";
const DEFAULT_HTML = "Hey, got something on your mind?<br>Jot it down — this saves automatically. 🖊️";

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

function buildFont(bold: boolean, italic: boolean, size: number, family: string) {
  return `${italic ? "italic" : "normal"} ${bold ? "700" : "400"} ${size}px ${family}`;
}

async function ensureFontLoaded(family: string, size: number) {
  const variants = [`400 normal ${size}px ${family}`, `700 normal ${size}px ${family}`, `400 italic ${size}px ${family}`, `700 italic ${size}px ${family}`];
  await Promise.all(variants.map(v => document.fonts.load(v).catch(() => null)));
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

function drawNote(html: string, fontSize: number, fontFamily: string): HTMLCanvasElement {
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

function loadStorage() {
  if (typeof window === "undefined") return null;
  try { const raw = localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) : null; } catch { return null; }
}

function saveStorage(html: string, fontSize: number) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ html, fontSize })); } catch {}
}

function htmlToPreviewLines(html: string): string[] {
  if (typeof document === "undefined") return [];
  const div = document.createElement("div");
  div.innerHTML = html.replace(/<br\s*\/?>/gi, "\n");
  const text = div.innerText || div.textContent || "";
  return text.split("\n").map(l => l.trim()).filter(Boolean).slice(0, 3);
}

function Disclaimer({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div
      className="flex items-start gap-3 px-4 py-3 rounded-xl mb-2"
      style={{ background: "rgba(232,93,38,0.08)", border: "1px solid rgba(232,93,38,0.2)" }}
    >
      <ShieldIcon className="w-4 h-4 text-[#e85d26] flex-shrink-0 mt-0.5" />
      <p className="text-xs text-neutral-400 leading-relaxed flex-1">
        Your notes stay on <span className="text-neutral-200 font-medium">your device</span> — stored in your browser&apos;s local storage. Nothing is sent to any server.
      </p>
      <button onClick={onDismiss} className="text-neutral-600 hover:text-neutral-300 transition-colors flex-shrink-0">
        <XIcon className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export default function ScribbleNote() {
  const router = useRouter();
  const [html, setHtml] = useState<string>(() => loadStorage()?.html ?? DEFAULT_HTML);
  const [fontSize, setFontSize] = useState<number>(() => loadStorage()?.fontSize ?? 20);
  const [expanded, setExpanded] = useState(false);
  const [isEmpty, setIsEmpty] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  const contentRef = useRef<HTMLDivElement>(null);
  const lineHeight = Math.round(fontSize * 1.72);

  // paddingTop for the content area (below the header band)
  const contentPadTop = HEADER_H + Math.round(lineHeight * 0.5);
  // phase-align the ruled line grid with the text baseline
  const lineGridOffset = contentPadTop % lineHeight;

  const paperLines: React.CSSProperties = {
    backgroundImage: [
      `repeating-linear-gradient(transparent, transparent ${lineHeight - 1}px, #c8d8e8 ${lineHeight - 1}px, #c8d8e8 ${lineHeight}px)`,
      `linear-gradient(to right, transparent 56px, #e8a0a0 56px, #e8a0a0 58px, transparent 58px)`,
    ].join(", "),
    backgroundPositionY: `${lineGridOffset}px`,
  };

  useEffect(() => {
    try {
      const dismissed = localStorage.getItem(DISCLAIMER_KEY);
      if (!dismissed) setShowDisclaimer(true);
    } catch {}
  }, []);

  const dismissDisclaimer = useCallback(() => {
    try { localStorage.setItem(DISCLAIMER_KEY, "1"); } catch {}
    setShowDisclaimer(false);
  }, []);

  useEffect(() => {
    if (expanded) {
      document.body.style.overflow = "hidden";
      if (contentRef.current) {
        contentRef.current.innerHTML = html;
        setIsEmpty(contentRef.current.innerText.trim() === "");
        const range = document.createRange();
        const sel = window.getSelection();
        range.selectNodeContents(contentRef.current);
        range.collapse(false);
        sel?.removeAllRanges();
        sel?.addRange(range);
        contentRef.current.focus();
      }
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [expanded]);

  const handleInput = useCallback(() => {
    if (!contentRef.current) return;
    const next = contentRef.current.innerHTML;
    setHtml(next);
    setIsEmpty(contentRef.current.innerText.trim() === "");
    saveStorage(next, fontSize);
  }, [fontSize]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter") { e.preventDefault(); document.execCommand("insertLineBreak"); return; }
    if (e.metaKey || e.ctrlKey) {
      if (e.key === "b") { e.preventDefault(); document.execCommand("bold"); }
      if (e.key === "i") { e.preventDefault(); document.execCommand("italic"); }
      if (e.key === "u") { e.preventDefault(); document.execCommand("underline"); }
    }
  }, []);

  const applyColor = useCallback((color: string) => {
    contentRef.current?.focus();
    document.execCommand("foreColor", false, color);
    if (contentRef.current) { const next = contentRef.current.innerHTML; setHtml(next); saveStorage(next, fontSize); }
  }, [fontSize]);

  const execFormat = useCallback((cmd: string) => {
    contentRef.current?.focus();
    document.execCommand(cmd);
    if (contentRef.current) { const next = contentRef.current.innerHTML; setHtml(next); saveStorage(next, fontSize); }
  }, [fontSize]);

  const handleSizeChange = useCallback((size: number) => {
    setFontSize(size); saveStorage(html, size);
  }, [html]);

  const handleScreenshot = useCallback(async () => {
    if (capturing) return;
    setCapturing(true);
    try {
      const cssFontName = getComputedStyle(document.documentElement).getPropertyValue("--font-caveat").trim();
      const fontFamily = cssFontName || "Caveat";
      await ensureFontLoaded(fontFamily, fontSize);
      const canvas = drawNote(html, fontSize, fontFamily);
      canvas.toBlob((blob) => {
        if (!blob) { setCapturing(false); return; }
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = "my-note.png"; a.click();
        URL.revokeObjectURL(url); setCapturing(false);
      }, "image/png");
    } catch (err) { console.error(err); setCapturing(false); }
  }, [capturing, html, fontSize]);

  const previewLines = htmlToPreviewLines(html);

  const tbBtn = "p-2 rounded text-neutral-500 hover:text-neutral-200 hover:bg-white/10 transition-all";
  const sep = <div className="w-px h-4 bg-white/10 flex-shrink-0" />;

  return (
    <>
      <style>{`
        .scribble-content * { font-family: var(--font-caveat), cursive !important; }
        .scribble-content strong { font-weight: 700; }
        .scribble-content em { font-style: italic; }
        .scribble-content u { text-decoration: underline; }
        .scribble-content s { text-decoration: line-through; }
        .scribble-content font { font-family: var(--font-caveat), cursive !important; }
        .note-preview-line {
          font-family: var(--font-caveat), cursive;
          font-size: 15px; line-height: 26px; height: 26px;
          color: #2a2440; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        @keyframes noteIn { from { opacity:0; transform: scale(0.93) rotate(-0.4deg); } to { opacity:1; transform: scale(1) rotate(-0.4deg); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .spinning { animation: spin 0.7s linear infinite; }
      `}</style>

      <div className="hidden lg:flex flex-col items-end justify-center flex-shrink-0 w-[200px] xl:w-[300px]">
        <button onClick={() => setExpanded(true)} className="group relative w-full cursor-pointer focus:outline-none" title="Open note">
          <div
            className="relative w-full transition-all duration-300 group-hover:-rotate-1 group-hover:scale-[1.02]"
            style={{ background: "#fdf9f0", rotate: "1.5deg", boxShadow: "4px 8px 28px rgba(0,0,0,0.55), 1px 2px 6px rgba(0,0,0,0.3)", clipPath: TORN_BOTTOM }}
          >
            <div style={{ height: 36, background: "linear-gradient(180deg, #ede0c4 0%, #f5ecd8 60%, #fdf9f0 100%)", borderBottom: "1.5px solid #d4c9a8" }} />
            <div style={{ backgroundImage: `repeating-linear-gradient(transparent, transparent 25px, #ccd9e8 25px, #ccd9e8 26px), linear-gradient(to right, transparent 32px, #e8a0a0 32px, #e8a0a0 33.5px, transparent 33.5px)`, backgroundPositionY: "0", paddingTop: 5, paddingBottom: 18, paddingLeft: 42, paddingRight: 10 }}>
              {previewLines.length > 0
                ? previewLines.map((line, i) => <div key={i} className="note-preview-line">{line}</div>)
                : <div className="note-preview-line" style={{ opacity: 0.3 }}>Start writing…</div>}
            </div>
          </div>
          <div className="mt-3 flex items-center justify-center gap-1.5 text-neutral-600 group-hover:text-neutral-400 transition-colors">
            <PenLineIcon className="w-3 h-3" />
            <span className="text-[10px] font-mono tracking-widest uppercase">Click to write</span>
          </div>
        </button>
      </div>

      {expanded && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(12,10,8,0.88)", backdropFilter: "blur(8px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setExpanded(false); }}
        >
          <div
            className="relative flex flex-col"
            style={{ width: "min(640px, 96vw)", maxHeight: "90vh", filter: "drop-shadow(0 32px 80px rgba(0,0,0,0.8))", animation: "noteIn 0.28s cubic-bezier(0.16,1,0.3,1) both" }}
          >
            {showDisclaimer && (
              <div style={{ marginBottom: 8 }}>
                <Disclaimer onDismiss={dismissDisclaimer} />
              </div>
            )}

            <div
              className="flex items-center gap-2 px-4 py-3 rounded-t-xl flex-wrap"
              style={{ background: "#111109", border: "1px solid rgba(255,255,255,0.08)", borderBottom: "1px solid rgba(255,255,255,0.06)", minHeight: 52 }}
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
                <span className="text-[10px] font-mono text-neutral-600 uppercase tracking-widest">Size</span>
                <input type="range" min={14} max={40} value={fontSize} onChange={(e) => handleSizeChange(Number(e.target.value))} className="w-20" style={{ accentColor: "#e85d26" }} />
                <span className="text-[10px] font-mono text-neutral-500 w-5 tabular-nums">{fontSize}</span>
              </div>
              {sep}
              <button onClick={handleScreenshot} className={tbBtn} disabled={capturing}>
                {capturing ? <Loader2Icon className="w-4 h-4 spinning" /> : <CameraIcon className="w-4 h-4" />}
              </button>
              {sep}
              <button onClick={() => router.push("/notes")} className={tbBtn} title="Open Notes"><NotebookIcon className="w-4 h-4" /></button>
              <div className="ml-auto">
                <button onClick={() => setExpanded(false)} className={tbBtn}><ShrinkIcon className="w-4 h-4" /></button>
              </div>
            </div>

            <div
              className="relative overflow-hidden"
              style={{ background: "#fdf9f0", minHeight: 380, maxHeight: "calc(90vh - 52px)", clipPath: TORN_BOTTOM }}
            >
              <div className="absolute top-0 left-0 right-0 pointer-events-none" style={{ height: HEADER_H, background: "linear-gradient(180deg, #ede0c4 0%, #f5ecd8 60%, #fdf9f0 100%)", borderBottom: "2px solid #d4c9a8", zIndex: 2 }} />

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
                  minHeight: 380,
                  maxHeight: "calc(90vh - 120px)",
                  caretColor: "#1a1a2e",
                  wordBreak: "break-word",
                  zIndex: 3,
                }}
              />

              {isEmpty && (
                <div
                  className="absolute pointer-events-none select-none"
                  style={{ top: contentPadTop, left: 76, zIndex: 4, fontFamily: "var(--font-caveat), cursive", fontSize, lineHeight: `${lineHeight}px`, color: "#b0a898" }}
                >
                  Write something…
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}