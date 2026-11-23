/**
 * Ribbon vocabulary: real words and their English meaning, in a fixed order.
 * Japanese, Chinese and Arabic are limited to the glyphs in app/fonts/ribbon/* (夢, 朋友, سلام).
 */
export type WordPair = { word: string; lang: string; english: string };

export const RIBBON_PAIRS: WordPair[] = [
  { word: "नमस्ते", lang: "hi", english: "Hello" },
  { word: "Hola", lang: "es", english: "Hello" },
  { word: "বন্ধু", lang: "bn", english: "Friend" },
  { word: "Merci", lang: "fr", english: "Thank you" },
  { word: "நன்றி", lang: "ta", english: "Thank you" },
  { word: "朋友", lang: "zh", english: "Friend" },
  { word: "స్వాగతం", lang: "te", english: "Welcome" },
  { word: "Welt", lang: "de", english: "World" },
  { word: "શાંતિ", lang: "gu", english: "Peace" },
  { word: "سلام", lang: "ar", english: "Peace" },
  { word: "ಕನಸು", lang: "kn", english: "Dream" },
  { word: "夢", lang: "ja", english: "Dream" },
  { word: "आवाज़", lang: "hi", english: "Voice" },
  { word: "Bonjour", lang: "fr", english: "Hello" },
  { word: "স্বপ্ন", lang: "bn", english: "Dream" },
  { word: "Danke", lang: "de", english: "Thank you" },
];

/** CSS variables set by next/font in app/layout.tsx, one per script. */
const SCRIPT_FONT_VAR: Record<string, string> = {
  hi: "--font-noto-deva",
  bn: "--font-noto-beng",
  ta: "--font-noto-taml",
  te: "--font-noto-telu",
  gu: "--font-noto-gujr",
  kn: "--font-noto-knda",
  ar: "--font-noto-arabic",
  ja: "--font-noto-japanese",
  zh: "--font-noto-chinese",
};

export const ATLAS_SLOT_PX = 256;
export const ATLAS_HEIGHT_PX = 96;
/** World length of one word slot = band width × this. */
export const SLOT_ASPECT = ATLAS_SLOT_PX / ATLAS_HEIGHT_PX;

function familyFor(lang: string) {
  const name = SCRIPT_FONT_VAR[lang];
  const resolved = name ? getComputedStyle(document.documentElement).getPropertyValue(name).trim() : "";
  return resolved ? `${resolved}, "Switzer", sans-serif` : `"Switzer", sans-serif`;
}

/**
 * Draws every pair into one canvas: red = original word, green = English word,
 * slot k at x ∈ [k·slot, (k+1)·slot). Waits for the script fonts so glyphs never fall back mid-flight.
 */
export async function drawWordAtlas(pairs: WordPair[]): Promise<HTMLCanvasElement> {
  const w = pairs.length * ATLAS_SLOT_PX;
  const h = ATLAS_HEIGHT_PX;
  const sourceFont = (p: WordPair) => `500 ${p.lang === "ja" || p.lang === "zh" ? 46 : 42}px ${familyFor(p.lang)}`;
  const englishFont = `600 40px "Switzer", sans-serif`;

  if (document.fonts?.load) {
    await Promise.allSettled([
      ...pairs.map((p) => document.fonts.load(sourceFont(p), p.word)),
      document.fonts.load(englishFont, "Hello"),
    ]);
  }

  const draw = (font: (p: WordPair) => string, text: (p: WordPair) => string) => {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const ctx = c.getContext("2d");
    if (!ctx) return c;
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    pairs.forEach((p, k) => {
      ctx.font = font(p);
      ctx.direction = p.lang === "ar" && text(p) === p.word ? "rtl" : "ltr";
      const label = text(p);
      const measured = ctx.measureText(label).width;
      const max = ATLAS_SLOT_PX * 0.84;
      const cx = k * ATLAS_SLOT_PX + ATLAS_SLOT_PX / 2;
      ctx.save();
      ctx.translate(cx, h / 2 + 2);
      if (measured > max) ctx.scale(max / measured, max / measured);
      ctx.fillText(label, 0, 0);
      ctx.restore();
    });
    return c;
  };

  const source = draw(sourceFont, (p) => p.word);
  const english = draw(() => englishFont, (p) => p.english);

  const out = document.createElement("canvas");
  out.width = w;
  out.height = h;
  const octx = out.getContext("2d");
  const sctx = source.getContext("2d");
  const ectx = english.getContext("2d");
  if (!octx || !sctx || !ectx) return out;
  const a = sctx.getImageData(0, 0, w, h).data;
  const b = ectx.getImageData(0, 0, w, h).data;
  const img = octx.createImageData(w, h);
  for (let i = 0; i < img.data.length; i += 4) {
    img.data[i] = a[i];
    img.data[i + 1] = b[i];
    img.data[i + 2] = 0;
    img.data[i + 3] = 255;
  }
  octx.putImageData(img, 0, 0);
  return out;
}
