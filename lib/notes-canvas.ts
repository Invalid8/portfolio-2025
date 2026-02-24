export const COLORS = [
  { label: "Ink",     value: "#1a1a2e" },
  { label: "Navy",    value: "#1e40af" },
  { label: "Forest",  value: "#166534" },
  { label: "Crimson", value: "#991b1b" },
  { label: "Plum",    value: "#6b21a8" },
  { label: "Amber",   value: "#92400e" },
];

export const TORN_BOTTOM = "polygon(0 0,100% 0,100% calc(100% - 8px),98% calc(100% - 5px),95% calc(100% - 9px),92% calc(100% - 4px),89% calc(100% - 10px),86% calc(100% - 5px),83% calc(100% - 8px),80% calc(100% - 3px),77% calc(100% - 9px),74% calc(100% - 5px),71% calc(100% - 10px),68% calc(100% - 4px),65% calc(100% - 8px),62% calc(100% - 5px),59% calc(100% - 10px),56% calc(100% - 3px),53% calc(100% - 8px),50% calc(100% - 6px),47% calc(100% - 10px),44% calc(100% - 4px),41% calc(100% - 9px),38% calc(100% - 5px),35% calc(100% - 10px),32% calc(100% - 3px),29% calc(100% - 8px),26% calc(100% - 5px),23% calc(100% - 10px),20% calc(100% - 4px),17% calc(100% - 9px),14% calc(100% - 5px),11% calc(100% - 10px),8% calc(100% - 3px),5% calc(100% - 8px),2% calc(100% - 5px),0 calc(100% - 9px))";

export const HEADER_H = 68;
export const DISCLAIMER_KEY = "scribble-disclaimer-dismissed-10";

export type StyleState = {
  color: string;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strike: boolean;
};
export type TextSegment = StyleState & { text: string };
export type Line = TextSegment[];

export function buildFont(bold: boolean, italic: boolean, size: number, family: string) {
  return `${italic ? "italic" : "normal"} ${bold ? "700" : "400"} ${size}px ${family}`;
}

export async function ensureFontLoaded(family: string, size: number) {
  const variants = [
    `400 normal ${size}px ${family}`,
    `700 normal ${size}px ${family}`,
    `400 italic ${size}px ${family}`,
    `700 italic ${size}px ${family}`,
  ];
  await Promise.all(variants.map(v => document.fonts.load(v).catch(() => null)));
}

export function parseHtmlToLines(html: string): Line[] {
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
  ctx.closePath();
  ctx.clip();
}

export function drawNoteCanvas(
  html: string,
  fontSize: number,
  fontFamily: string,
  noteWidth = 680,
): HTMLCanvasElement {
  const SCALE = 2;
  const NOTE_W = noteWidth;
  const PAD_LEFT = 76;
  const PAD_RIGHT = 36;
  const PAD_BOTTOM = 48;
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
  canvas.width = NOTE_W * SCALE;
  canvas.height = NOTE_H * SCALE;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(SCALE, SCALE);
  ctx.save();
  applyTornClip(ctx, NOTE_W, NOTE_H);
  ctx.fillStyle = "#fdf9f0";
  ctx.fillRect(0, 0, NOTE_W, NOTE_H);
  const hg = ctx.createLinearGradient(0, 0, 0, HEADER_H);
  hg.addColorStop(0, "#ede0c4");
  hg.addColorStop(0.6, "#f5ecd8");
  hg.addColorStop(1, "#fdf9f0");
  ctx.fillStyle = hg;
  ctx.fillRect(0, 0, NOTE_W, HEADER_H);
  ctx.strokeStyle = "#d4c9a8";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, HEADER_H);
  ctx.lineTo(NOTE_W, HEADER_H);
  ctx.stroke();
  ctx.strokeStyle = "#c8d8e8";
  ctx.lineWidth = 1;
  for (let i = 1; HEADER_H + i * LINE_H < NOTE_H; i++) {
    const y = HEADER_H + i * LINE_H;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(NOTE_W, y);
    ctx.stroke();
  }
  ctx.strokeStyle = "#e8a0a0";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(57, 0);
  ctx.lineTo(57, NOTE_H);
  ctx.stroke();
  ctx.fillStyle = "#1a1410";
  ctx.shadowColor = "rgba(0,0,0,0.55)";
  ctx.shadowBlur = 6;
  ctx.shadowOffsetY = 2;
  let ringY = HEADER_H + LINE_H * 2;
  while (ringY < NOTE_H - LINE_H) {
    ctx.beginPath();
    ctx.arc(24, ringY, 8, 0, Math.PI * 2);
    ctx.fill();
    ringY += LINE_H * 4;
  }
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
  for (const d of calls) {
    ctx.font = buildFont(d.bold, d.italic, fontSize, fontFamily);
    ctx.fillStyle = d.color;
    ctx.fillText(d.text, d.x, d.y);
    if (d.underline) {
      ctx.strokeStyle = d.color;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(d.x, d.y + 3);
      ctx.lineTo(d.x + d.w, d.y + 3);
      ctx.stroke();
    }
    if (d.strike) {
      ctx.strokeStyle = d.color;
      ctx.lineWidth = 1.2;
      const mid = d.y - fontSize * 0.35;
      ctx.beginPath();
      ctx.moveTo(d.x, mid);
      ctx.lineTo(d.x + d.w, mid);
      ctx.stroke();
    }
  }
  ctx.restore();
  return canvas;
}