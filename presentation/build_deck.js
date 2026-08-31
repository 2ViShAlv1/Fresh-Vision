const pptxgen = require("pptxgenjs");
const path = require("path");

const SD = require("path").join(__dirname, "assets");
const OUT = require("path").join(__dirname, "Fresh_Vision_PSII_Presentation.pptx");
const ICON = (n) => path.join(SD, "icons", n + ".png");
const IMG = (n) => path.join(SD, n);

// ---------------------------------------------------------------------------
// Visual system — a produce-freshness palette: forest green dominates, the
// decay ramp (green → amber → red) carries meaning, ink-dark slides bookend
// and separate the sections.
// ---------------------------------------------------------------------------
const INK = "10201A";       // near-black green, body text on light
const INK_SOFT = "3C4C43";
const MUTED = "6A7B71";
const FOREST = "0E5C3A";    // primary
const GREEN = "1C9A63";     // secondary / interactive
const GREEN_HI = "7FD1A6";  // on dark
const MINT = "EAF5EF";      // card tint
const MINT_2 = "F4FAF6";
const AMBER = "C9871B";
const AMBER_T = "FCF3E3";
const RED = "A8382A";
const RED_T = "FAEDEA";
const PAPER = "FFFFFF";
const BORDER = "DCE7E1";
const DARK_CARD = "16281F";
const DARK_LINE = "2C4638";
const DARK_MUTED = "A6BCAF";
const FONT = "Arial";

// Decay ramp — used wherever freshness is shown, so the colours always mean
// the same thing.
const SCALE = [
  ["Very fresh", "5-7 days", "0F7A4A"],
  ["Fresh", "3-5 days", "3FA76B"],
  ["Slightly rotten", "1-2 days", "D9A227"],
  ["Rotten", "Discard", "C4652A"],
  ["Very rotten", "Discard", "8E2F22"],
];

const W = 11.02, H = 8.27;   // A4 landscape — the template's page size
const M = 0.65;
const CW = W - 2 * M;

const pres = new pptxgen();
pres.defineLayout({ name: "A4LAND", width: W, height: H });
pres.layout = "A4LAND";
pres.author = "Fresh Vision";
pres.company = "BML Munjal University";
pres.title = "Fresh Vision — Practice School-II";

let pageNo = 0;

const shadow = (o = {}) => ({
  type: "outer", color: o.color || "0A1F16", blur: o.blur || 10,
  offset: o.offset === undefined ? 2 : o.offset, angle: 90, opacity: o.opacity || 0.1,
});

// ---------- slide shells ----------
function light() {
  const s = pres.addSlide();
  s.background = { color: PAPER };
  pageNo += 1;
  const n = pageNo;
  s.addText(String(n).padStart(2, "0"), {
    x: W - M - 0.6, y: H - 0.62, w: 0.6, h: 0.3, isTextBox: true, margin: 0,
    fontFace: FONT, fontSize: 10, bold: true, color: GREEN, align: "right",
  });
  s.addText("Fresh Vision  ·  Practice School-II", {
    x: M, y: H - 0.62, w: 5, h: 0.3, isTextBox: true, margin: 0,
    fontFace: FONT, fontSize: 9.5, color: MUTED,
  });
  return s;
}

function dark(bg) {
  const s = pres.addSlide();
  s.background = { path: IMG(bg) };
  pageNo += 1;
  return s;
}

// Left-aligned eyebrow + title, the header on every content slide.
function head(s, eyebrow, titleText, sub) {
  s.addText(eyebrow.toUpperCase(), {
    x: M, y: 0.5, w: CW, h: 0.26, isTextBox: true, margin: 0,
    fontFace: FONT, fontSize: 10.5, bold: true, color: GREEN, charSpacing: 2.4,
  });
  s.addText(titleText, {
    x: M, y: 0.76, w: CW, h: 0.52, isTextBox: true, margin: 0,
    fontFace: FONT, fontSize: 27, bold: true, color: INK,
  });
  if (sub) {
    s.addText(sub, {
      x: M, y: 1.3, w: CW, h: 0.28, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 12.5, color: MUTED,
    });
  }
}

function card(s, o) {
  s.addShape(pres.ShapeType.roundRect, {
    x: o.x, y: o.y, w: o.w, h: o.h, rectRadius: 0.09,
    fill: { color: o.fill || PAPER },
    line: { color: o.line || BORDER, width: o.lw || 1 },
    shadow: o.flat ? undefined : shadow(o.shadow || {}),
  });
}

function darkCard(s, o) {
  s.addShape(pres.ShapeType.roundRect, {
    x: o.x, y: o.y, w: o.w, h: o.h, rectRadius: 0.09,
    fill: { color: o.fill || DARK_CARD }, line: { color: o.line || DARK_LINE, width: 1 },
  });
}

// Icon inside a filled circle — the deck's repeating motif.
function iconCircle(s, x, y, d, color, icon) {
  s.addShape(pres.ShapeType.ellipse, {
    x, y, w: d, h: d, fill: { color }, line: { color, width: 1 },
  });
  const p = d * 0.27;
  s.addImage({ path: ICON(icon), x: x + p, y: y + p, w: d - 2 * p, h: d - 2 * p });
}

function numCircle(s, x, y, d, n, color, textColor) {
  s.addShape(pres.ShapeType.ellipse, {
    x, y, w: d, h: d, fill: { color }, line: { color, width: 1 },
  });
  s.addText(String(n), {
    x, y, w: d, h: d, isTextBox: true, margin: 0,
    fontFace: FONT, fontSize: d > 0.5 ? 16 : 13, bold: true,
    color: textColor || PAPER, align: "center", valign: "middle",
  });
}

function bullets(s, x, y, w, h, items, o = {}) {
  s.addText(
    items.map((t, i) => ({
      text: t,
      options: { bullet: { code: "2022" }, breakLine: i !== items.length - 1, paraSpaceAfter: o.gap ?? 8 },
    })),
    {
      x, y, w, h, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: o.size || 13, color: o.color || INK_SOFT,
      lineSpacing: o.lineSpacing || 19,
    }
  );
}

// The five-level decay ramp, drawn as a segmented scale.
function freshnessScale(s, x, y, w, opts = {}) {
  const gap = 0.08;
  const segW = (w - gap * 4) / 5;
  const barH = opts.barH || 0.34;
  SCALE.forEach((lv, i) => {
    const sx = x + i * (segW + gap);
    s.addShape(pres.ShapeType.roundRect, {
      x: sx, y, w: segW, h: barH, rectRadius: 0.06,
      fill: { color: lv[2] }, line: { color: lv[2], width: 1 },
    });
    s.addText(lv[0], {
      x: sx, y: y + barH + 0.06, w: segW, h: 0.26, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: opts.labelSize || 10.5, bold: true,
      color: opts.onDark ? PAPER : INK, align: "center",
    });
    if (opts.shelf) {
      s.addText(lv[1], {
        x: sx, y: y + barH + 0.3, w: segW, h: 0.24, isTextBox: true, margin: 0,
        fontFace: FONT, fontSize: 9.5, color: opts.onDark ? DARK_MUTED : MUTED, align: "center",
      });
    }
  });
}

// =========================================================================
// 01 — Title
// =========================================================================
{
  const s = dark("bg_title.png");
  pageNo = 0; // the title page carries no number

  iconCircle(s, M, 0.62, 0.46, GREEN, "LuLeaf");
  s.addText("FRESH VISION", {
    x: M + 0.62, y: 0.62, w: 4, h: 0.46, isTextBox: true, margin: 0,
    fontFace: FONT, fontSize: 14, bold: true, color: PAPER, charSpacing: 1.6, valign: "middle",
  });
  s.addText("PRACTICE SCHOOL-II", {
    x: W - M - 4, y: 0.62, w: 4, h: 0.46, isTextBox: true, margin: 0,
    fontFace: FONT, fontSize: 11, bold: true, color: GREEN_HI, charSpacing: 2.4,
    align: "right", valign: "middle",
  });

  s.addText("An AI-powered fruit & vegetable", {
    x: M, y: 1.62, w: 8.6, h: 0.62, isTextBox: true, margin: 0,
    fontFace: FONT, fontSize: 40, bold: true, color: PAPER,
  });
  s.addText([
    { text: "freshness ", options: { color: GREEN_HI } },
    { text: "analyzer", options: { color: PAPER } },
  ], {
    x: M, y: 2.24, w: 8.6, h: 0.62, isTextBox: true, margin: 0,
    fontFace: FONT, fontSize: 40, bold: true,
  });
  s.addText(
    "Three MobileNetV2 models turn one photograph into an identified item, a five-level freshness " +
    "grade and a shelf-life estimate — in under a second, in the browser.",
    { x: M, y: 2.98, w: 7.4, h: 0.62, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 13.5, color: DARK_MUTED, lineSpacing: 20 }
  );

  freshnessScale(s, M, 3.86, 6.3, { onDark: true, barH: 0.26, labelSize: 9.5 });

  // Submission block
  const cw = (CW - 0.5) / 3;
  const infoY = 4.9;
  const info = [
    ["Submitted by", ["Name:  ___________________", "ID:  ___________________"]],
    ["Faculty Mentor", ["Dr. XYZ", "Designation", "SOET, BMU"]],
    ["Industry Mentor", ["Mr. ABC", "Designation", "Organization name"]],
  ];
  info.forEach((b, i) => {
    const x = M + i * (cw + 0.25);
    darkCard(s, { x, y: infoY, w: cw, h: 1.5 });
    s.addText(b[0].toUpperCase(), {
      x: x + 0.24, y: infoY + 0.18, w: cw - 0.48, h: 0.26, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 10, bold: true, color: GREEN_HI, charSpacing: 1.6,
    });
    s.addText(
      b[1].map((t, j) => ({ text: t, options: { breakLine: j !== b[1].length - 1 } })),
      { x: x + 0.24, y: infoY + 0.5, w: cw - 0.48, h: 0.9, isTextBox: true, margin: 0,
        fontFace: FONT, fontSize: 12, color: PAPER, lineSpacing: 17 }
    );
  });

  s.addText("School of Engineering & Technology  ·  BML Munjal University", {
    x: M, y: 6.72, w: CW, h: 0.3, isTextBox: true, margin: 0,
    fontFace: FONT, fontSize: 13, bold: true, color: PAPER,
  });
  s.addText("67th KM Stone, NH-8, Gurugram, Haryana 122413", {
    x: M, y: 7.02, w: CW, h: 0.28, isTextBox: true, margin: 0,
    fontFace: FONT, fontSize: 11.5, color: DARK_MUTED,
  });
  s.addText("August 2025", {
    x: W - M - 3, y: 6.72, w: 3, h: 0.3, isTextBox: true, margin: 0,
    fontFace: FONT, fontSize: 13, bold: true, color: GREEN_HI, align: "right",
  });
  s.addNotes("Fresh Vision identifies a fruit or vegetable from a photo and grades how fresh it is, using three neural networks behind a web app.");
}

// =========================================================================
// 02 — Outline
// =========================================================================
{
  const s = light();
  head(s, "Contents", "Outline of the presentation");

  const items = [
    ["About the PS-II station", "Organisation, department and mentors", "LuBuilding2"],
    ["Visit summary", "Eight-week work log", "LuCalendarDays"],
    ["Problem identification", "Why grading produce by eye fails", "LuCircleAlert"],
    ["Problem statement", "What the system must solve", "LuTarget"],
    ["Objectives of the work", "Six measurable goals", "LuBoxes"],
    ["Methodology", "Data, pseudo-labelling, training, deployment", "LuGitBranch"],
    ["Results & discussions", "Accuracy, calibration, the working app", "LuChartColumn"],
    ["Learning outcomes", "Technical and professional takeaways", "LuSparkles"],
    ["References", "Papers, datasets and documentation", "LuBookOpen"],
  ];
  const colW = (CW - 0.6) / 2;
  items.forEach((it, i) => {
    const col = i < 5 ? 0 : 1;
    const row = i < 5 ? i : i - 5;
    const x = M + col * (colW + 0.6);
    const y = 1.72 + row * 1.16;
    iconCircle(s, x, y, 0.56, i % 2 === 0 ? FOREST : GREEN, it[2]);
    s.addText(String(i + 1).padStart(2, "0"), {
      x: x + 0.72, y: y - 0.02, w: 0.5, h: 0.3, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 11, bold: true, color: GREEN, charSpacing: 1,
    });
    s.addText(it[0], {
      x: x + 0.72, y: y + 0.2, w: colW - 0.8, h: 0.32, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 15.5, bold: true, color: INK,
    });
    s.addText(it[1], {
      x: x + 0.72, y: y + 0.53, w: colW - 0.8, h: 0.28, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 11.5, color: MUTED,
    });
  });

  card(s, { x: M + colW + 0.6, y: 1.72 + 4 * 1.16, w: colW, h: 0.98, fill: MINT, flat: true, line: MINT });
  s.addText([
    { text: "Fresh Vision in one line:  ", options: { bold: true, color: FOREST, fontSize: 12 } },
    { text: "identify the produce, grade its decay, explain the verdict.", options: { color: INK_SOFT, fontSize: 12 } },
  ], {
    x: M + colW + 0.84, y: 1.72 + 4 * 1.16, w: colW - 0.48, h: 0.98,
    isTextBox: true, margin: 0, fontFace: FONT, valign: "middle", lineSpacing: 17,
  });
}

// =========================================================================
// Section divider helper
// =========================================================================
function divider(num, name, sub, contents) {
  const s = dark("bg_divider.png");
  pageNo -= 1; // dividers are not numbered pages
  s.addText(num, {
    x: M, y: 2.3, w: 3, h: 1.7, isTextBox: true, margin: 0,
    fontFace: FONT, fontSize: 108, bold: true, color: "27604A",
  });
  s.addText("SECTION", {
    x: M + 0.08, y: 4.02, w: 3, h: 0.3, isTextBox: true, margin: 0,
    fontFace: FONT, fontSize: 10.5, bold: true, color: GREEN_HI, charSpacing: 2.4,
  });
  s.addText(name, {
    x: M + 3.0, y: 2.9, w: CW - 3.0, h: 0.7, isTextBox: true, margin: 0,
    fontFace: FONT, fontSize: 34, bold: true, color: PAPER,
  });
  s.addText(sub, {
    x: M + 3.05, y: 3.64, w: CW - 3.05, h: 0.4, isTextBox: true, margin: 0,
    fontFace: FONT, fontSize: 14, color: DARK_MUTED, lineSpacing: 20,
  });
  contents.forEach((c, i) => {
    const x = M + 3.05 + i * ((CW - 3.05) / contents.length);
    s.addText([
      { text: "—  ", options: { color: GREEN_HI } },
      { text: c, options: { color: PAPER } },
    ], {
      x, y: 4.5, w: (CW - 3.05) / contents.length - 0.2, h: 0.4, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 12,
    });
  });
  return s;
}

divider("01", "The PS-II station", "Where the work was carried out, and what the eight weeks covered.",
  ["About the station", "Visit summary"]);

// =========================================================================
// 03 — About the PS-II station
// =========================================================================
{
  const s = light();
  head(s, "Section 01", "About the PS-II station", "Station details to be completed before submission");

  const blocks = [
    { head: "About the Company", icon: "LuBuilding2", color: FOREST, y: 1.72,
      rows: ["Est. date:", "Turnover:", "Product type:", "Number of employees:"] },
    { head: "Department Visited", icon: "LuBoxes", color: GREEN, y: 3.68,
      rows: ["Name of department:", "Nature of work:", "Task allocated:"] },
    { head: "Faculty Mentor Details", icon: "LuUsers", color: FOREST, y: 5.64,
      rows: ["Name:", "Department:", "Designation:", "Contact info:"] },
  ];

  blocks.forEach((b, bi) => {
    card(s, { x: M, y: b.y, w: CW, h: 1.68, fill: bi % 2 === 0 ? MINT_2 : PAPER });
    iconCircle(s, M + 0.28, b.y + 0.26, 0.46, b.color, b.icon);
    s.addText(b.head, {
      x: M + 0.86, y: b.y + 0.26, w: 4, h: 0.46, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 16, bold: true, color: INK, valign: "middle",
    });
    const fw = (CW - 1.3) / 2;
    b.rows.forEach((r, i) => {
      const col = i % 2, row = Math.floor(i / 2);
      const x = M + 0.86 + col * (fw + 0.16);
      const y = b.y + 0.84 + row * 0.44;
      s.addText(r, {
        x, y, w: fw, h: 0.3, isTextBox: true, margin: 0,
        fontFace: FONT, fontSize: 12.5, color: INK_SOFT,
      });
      s.addShape(pres.ShapeType.line, { x, y: y + 0.3, w: fw - 0.15, h: 0, line: { color: BORDER, width: 1 } });
    });
  });

}

// =========================================================================
// 04 — Visit summary
// =========================================================================
{
  const s = light();
  head(s, "Section 01", "Visit summary", "Eight weeks, from problem survey to a deployed application");

  const dw = (CW - 0.3) / 2;
  [["Start date", M], ["End date", M + dw + 0.3]].forEach(([lbl, x]) => {
    card(s, { x, y: 1.76, w: dw, h: 0.6, fill: MINT, line: MINT, flat: true });
    iconCircle(s, x + 0.18, 1.88, 0.36, FOREST, "LuCalendarDays");
    s.addText([
      { text: lbl + ":  ", options: { bold: true, color: INK, fontSize: 13 } },
      { text: "________________________", options: { color: MUTED, fontSize: 13 } },
    ], { x: x + 0.66, y: 1.76, w: dw - 0.86, h: 0.6, isTextBox: true, margin: 0, fontFace: FONT, valign: "middle" });
  });

  const weeks = [
    ["Studied the problem domain and surveyed CNN architectures for produce quality inspection."],
    ["Collected and unified the dataset — 14 produce classes, each with fresh and rotten images."],
    ["Built the data pipeline: stratified 80/20 split and MobileNetV2 preprocessing generators."],
    ["Trained the 14-class produce identifier on a frozen MobileNetV2 backbone."],
    ["Generated 5-level freshness pseudo-labels by HSV decay scoring; trained the freshness head."],
    ["Fine-tuned the last 30 backbone layers and added inference-time confidence calibration."],
    ["Added the ImageNet gatekeeper and exposed the pipeline as a FastAPI service."],
    ["Built the React + Vite frontend, ran end-to-end testing and documented the project."],
  ];
  const colW = (CW - 0.5) / 2;
  weeks.forEach((wk, i) => {
    const col = i < 4 ? 0 : 1;
    const row = i < 4 ? i : i - 4;
    const x = M + col * (colW + 0.5);
    const y = 2.68 + row * 1.2;
    card(s, { x, y, w: colW, h: 1.04, fill: PAPER });
    numCircle(s, x + 0.24, y + 0.3, 0.44, i + 1, i % 2 === 0 ? FOREST : GREEN);
    s.addText("WEEK " + (i + 1), {
      x: x + 0.8, y: y + 0.14, w: colW - 1.0, h: 0.24, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 9.5, bold: true, color: GREEN, charSpacing: 1.6,
    });
    s.addText(wk[0], {
      x: x + 0.8, y: y + 0.38, w: colW - 1.02, h: 0.58, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 11.5, color: INK_SOFT, lineSpacing: 15,
    });
  });
  s.addNotes("The weekly lines mirror the actual build order of the project; add the real start and end dates.");
}

divider("02", "The problem", "What is broken about grading produce by eye, and what the system has to do about it.",
  ["Problem identification", "Problem statement", "Objectives"]);

// =========================================================================
// 05 — Problem identification
// =========================================================================
{
  const s = light();
  head(s, "Section 02", "Problem identification");

  card(s, { x: M, y: 1.72, w: CW, h: 1.62, fill: MINT, line: MINT, flat: true });
  iconCircle(s, M + 0.3, 1.94, 0.46, FOREST, "LuCircleAlert");
  s.addText(
    "Fruit and vegetable quality across retail stores, warehouses and the cold-chain is still judged by eye. " +
    "Manual inspection is slow, subjective and inconsistent between graders, so spoiled produce reaches customers " +
    "while sellable produce is thrown away. No cheap, objective tool grades produce from an ordinary photo.",
    { x: M + 0.92, y: 1.9, w: CW - 1.24, h: 1.24, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 14, color: INK, lineSpacing: 22 }
  );

  const drivers = [
    ["Subjective", "Two graders disagree on the same crate — \"slightly spoiled\" has no shared definition.", "LuUsers", FOREST],
    ["Not scalable", "Every unit has to be picked up and looked at, which is impossible at warehouse volume.", "LuScale", AMBER],
    ["Binary labels only", "Public fresh/rotten datasets record two states, so no shelf-life guidance is possible.", "LuToggleLeft", RED],
  ];
  const cw3 = (CW - 0.6) / 3;
  drivers.forEach((d, i) => {
    const x = M + i * (cw3 + 0.3);
    card(s, { x, y: 3.6, w: cw3, h: 2.0 });
    iconCircle(s, x + 0.28, 3.86, 0.5, d[3], d[2]);
    s.addText(d[0], {
      x: x + 0.28, y: 4.5, w: cw3 - 0.56, h: 0.34, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 15.5, bold: true, color: INK,
    });
    s.addText(d[1], {
      x: x + 0.28, y: 4.88, w: cw3 - 0.56, h: 0.62, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 12, color: MUTED, lineSpacing: 17,
    });
  });

  card(s, { x: M, y: 5.86, w: CW, h: 1.44, fill: PAPER });
  s.addText("What a useful answer has to contain", {
    x: M + 0.3, y: 6.0, w: CW - 0.6, h: 0.3, isTextBox: true, margin: 0,
    fontFace: FONT, fontSize: 13, bold: true, color: INK,
  });
  freshnessScale(s, M + 0.3, 6.42, CW - 0.6, { shelf: true, barH: 0.26, labelSize: 10 });
  s.addNotes("The five-level scale is what the project has to produce; the source data only distinguishes fresh from rotten.");
}

// =========================================================================
// 06 — Problem statement
// =========================================================================
{
  const s = light();
  head(s, "Section 02", "Problem statement");

  card(s, { x: M, y: 1.76, w: CW, h: 1.9, fill: MINT, line: MINT, flat: true });
  s.addText(
    "Design and deploy a system that, from a single ordinary photograph, verifies that the subject is " +
    "actually produce, identifies which fruit or vegetable it is, and grades its decay on a five-level " +
    "scale with a confidence score and an estimated shelf life — fast enough to run on commodity " +
    "hardware inside a web browser.",
    { x: M + 0.4, y: 1.96, w: CW - 0.8, h: 1.55, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 17, color: INK, lineSpacing: 27 }
  );

  const reqs = [
    ["Verify", "Is this produce at all?", "Reject anything the models were never trained to grade.", "LuShieldCheck", FOREST],
    ["Identify", "Which fruit or vegetable?", "14 classes, reported with the top-3 confidence scores.", "LuScanEye", GREEN],
    ["Grade", "How far gone is it?", "Five decay levels, a confidence figure and a shelf-life estimate.", "LuGauge", AMBER],
  ];
  const cw3 = (CW - 0.6) / 3;
  reqs.forEach((r, i) => {
    const x = M + i * (cw3 + 0.3);
    card(s, { x, y: 3.96, w: cw3, h: 2.32 });
    iconCircle(s, x + cw3 / 2 - 0.29, 4.22, 0.58, r[4], r[3]);
    s.addText(r[0].toUpperCase(), {
      x: x + 0.2, y: 4.94, w: cw3 - 0.4, h: 0.3, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 11, bold: true, color: r[4], charSpacing: 2, align: "center",
    });
    s.addText(r[1], {
      x: x + 0.2, y: 5.24, w: cw3 - 0.4, h: 0.34, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 15, bold: true, color: INK, align: "center",
    });
    s.addText(r[2], {
      x: x + 0.24, y: 5.62, w: cw3 - 0.48, h: 0.6, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 11.5, color: MUTED, align: "center", lineSpacing: 16,
    });
  });

  card(s, { x: M, y: 6.54, w: CW, h: 0.8, fill: PAPER });
  iconCircle(s, M + 0.26, 6.7, 0.46, FOREST, "LuEye");
  s.addText([
    { text: "Deliverable:  ", options: { bold: true, color: FOREST, fontSize: 12.5 } },
    { text: "a browser-accessible tool whose verdict can be audited — every confidence score the pipeline used is shown, not just the final label.", options: { color: INK_SOFT, fontSize: 12.5 } },
  ], { x: M + 0.86, y: 6.54, w: CW - 1.16, h: 0.8, isTextBox: true, margin: 0, fontFace: FONT, valign: "middle", lineSpacing: 18 });
}

// =========================================================================
// 07 — Objectives
// =========================================================================
{
  const s = light();
  head(s, "Section 02", "Objectives of the work");

  const objs = [
    ["Identify produce", "Classify a photo into one of 14 fruit and vegetable categories by transfer learning.", "LuScanEye", FOREST],
    ["Grade freshness", "Predict five decay levels: very fresh, fresh, slightly rotten, rotten, very rotten.", "LuGauge", GREEN],
    ["Create fine labels", "Derive those five levels from binary fresh/rotten data, with no manual annotation.", "LuTags", AMBER],
    ["Reject bad input", "Use an ImageNet gatekeeper so non-produce photos are refused, not misclassified.", "LuShieldCheck", FOREST],
    ["Stay explainable", "Surface top-3 identity scores, the full freshness distribution, shelf life and latency.", "LuEye", GREEN],
    ["Deploy end-to-end", "Serve the pipeline as a REST API behind a responsive single-page web application.", "LuServer", AMBER],
  ];
  const cw2 = (CW - 0.4) / 2;
  objs.forEach((o, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = M + col * (cw2 + 0.4);
    const y = 1.72 + row * 1.92;
    card(s, { x, y, w: cw2, h: 1.7, fill: row % 2 === 1 ? MINT_2 : PAPER });
    iconCircle(s, x + 0.3, y + 0.3, 0.54, o[3], o[2]);
    s.addText(String(i + 1).padStart(2, "0"), {
      x: x + cw2 - 0.86, y: y + 0.26, w: 0.6, h: 0.3, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 12, bold: true, color: BORDER, align: "right",
    });
    s.addText(o[0], {
      x: x + 0.98, y: y + 0.34, w: cw2 - 1.9, h: 0.36, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 16, bold: true, color: INK, valign: "middle",
    });
    s.addText(o[1], {
      x: x + 0.32, y: y + 0.96, w: cw2 - 0.64, h: 0.62, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 12.5, color: MUTED, lineSpacing: 17,
    });
  });
}

divider("03", "Methodology", "How the data, the labels, the models and the deployment were built.",
  ["Architecture", "Labelling", "Training", "Coverage"]);

// =========================================================================
// 08 — Architecture
// =========================================================================
{
  const s = light();
  head(s, "Section 03", "System architecture", "One image in, three models, one auditable verdict");

  const boxW = 3.4;
  const bx1 = M + 0.35, bx2 = bx1 + boxW + 0.5;
  card(s, { x: bx1, y: 1.78, w: boxW, h: 0.98, fill: MINT_2 });
  iconCircle(s, bx1 + 0.2, 1.98, 0.42, FOREST, "LuImage");
  s.addText([
    { text: "Input image", options: { bold: true, fontSize: 13.5, color: INK, breakLine: true } },
    { text: "JPG / PNG / WEBP · max 10 MB", options: { fontSize: 11, color: MUTED } },
  ], { x: bx1 + 0.72, y: 1.9, w: boxW - 0.9, h: 0.76, isTextBox: true, margin: 0, fontFace: FONT, lineSpacing: 16 });

  card(s, { x: bx2, y: 1.78, w: boxW, h: 0.98, fill: MINT_2 });
  iconCircle(s, bx2 + 0.2, 1.98, 0.42, FOREST, "LuFilter");
  s.addText([
    { text: "Preprocess", options: { bold: true, fontSize: 13.5, color: INK, breakLine: true } },
    { text: "Resize 224x224 · MobileNetV2 norm", options: { fontSize: 11, color: MUTED } },
  ], { x: bx2 + 0.72, y: 1.9, w: boxW - 0.9, h: 0.76, isTextBox: true, margin: 0, fontFace: FONT, lineSpacing: 16 });

  s.addShape(pres.ShapeType.rightArrow, { x: bx1 + boxW + 0.1, y: 2.13, w: 0.3, h: 0.28, fill: { color: GREEN }, line: { color: GREEN, width: 1 } });
  s.addShape(pres.ShapeType.downArrow, { x: bx2 + boxW / 2 - 0.15, y: 2.84, w: 0.3, h: 0.3, fill: { color: GREEN }, line: { color: GREEN, width: 1 } });

  const models = [
    ["Gatekeeper", "Pretrained MobileNetV2 (ImageNet). Scans its top-5 labels for food keywords and rejects non-produce photos.", "Off-the-shelf · no training", "LuShieldCheck", FOREST],
    ["Produce identifier", "MobileNetV2 backbone plus a custom head, trained on the unified dataset. Reports a top-3 breakdown.", "Dense(14, softmax)", "LuScanEye", GREEN],
    ["Freshness classifier", "The same backbone trained on pseudo-labelled data, then calibrated at inference time.", "Dense(5, softmax)", "LuGauge", AMBER],
  ];
  const cw3 = (CW - 0.6) / 3;
  models.forEach((m, i) => {
    const x = M + i * (cw3 + 0.3);
    card(s, { x, y: 3.34, w: cw3, h: 2.72, line: m[4], lw: 1.25 });
    iconCircle(s, x + 0.26, 3.6, 0.5, m[4], m[3]);
    s.addText("MODEL " + (i + 1), {
      x: x + 0.9, y: 3.68, w: cw3 - 1.1, h: 0.34, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 9.5, bold: true, color: m[4], charSpacing: 1.6, valign: "middle",
    });
    s.addText(m[0], {
      x: x + 0.28, y: 4.2, w: cw3 - 0.56, h: 0.34, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 15, bold: true, color: INK,
    });
    s.addText(m[1], {
      x: x + 0.28, y: 4.6, w: cw3 - 0.56, h: 1.05, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 12, color: MUTED, lineSpacing: 17,
    });
    s.addText(m[2], {
      x: x + 0.28, y: 5.68, w: cw3 - 0.56, h: 0.3, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 10.5, bold: true, color: m[4],
    });
  });

  // Guard rails + verdict
  const gw = (CW - 0.3) / 2;
  card(s, { x: M, y: 6.3, w: gw, h: 1.16, fill: MINT_2 });
  s.addText("Two guard rails before any verdict", {
    x: M + 0.28, y: 6.42, w: gw - 0.56, h: 0.26, isTextBox: true, margin: 0,
    fontFace: FONT, fontSize: 12.5, bold: true, color: INK,
  });
  bullets(s, M + 0.28, 6.72, gw - 0.56, 0.62, [
    "Not produce → rejected, with the gatekeeper's label",
    "Identification under 65% → reported as uncertain",
  ], { size: 11, gap: 2, lineSpacing: 15 });

  card(s, { x: M + gw + 0.3, y: 6.3, w: gw, h: 1.16, fill: PAPER });
  iconCircle(s, M + gw + 0.54, 6.44, 0.42, GREEN, "LuCircleCheck");
  s.addText("Verdict", {
    x: M + gw + 1.06, y: 6.44, w: gw - 1.3, h: 0.42, isTextBox: true, margin: 0,
    fontFace: FONT, fontSize: 12.5, bold: true, color: INK, valign: "middle",
  });
  s.addText("produce label + confidence · freshness level + full distribution · estimated shelf life · latency", {
    x: M + gw + 0.54, y: 6.9, w: gw - 0.84, h: 0.48, isTextBox: true, margin: 0,
    fontFace: FONT, fontSize: 11, color: MUTED, lineSpacing: 15,
  });
}

// =========================================================================
// 09 — Data & pseudo-labelling
// =========================================================================
{
  const s = light();
  head(s, "Section 03", "Data & pseudo-labelling", "Turning two labels into five without any manual annotation");

  const halfW = (CW - 0.4) / 2;
  card(s, { x: M, y: 1.78, w: halfW, h: 2.06, fill: MINT_2 });
  iconCircle(s, M + 0.28, 1.98, 0.46, FOREST, "LuDatabase");
  s.addText("The dataset", {
    x: M + 0.86, y: 1.98, w: halfW - 1.1, h: 0.46, isTextBox: true, margin: 0,
    fontFace: FONT, fontSize: 15.5, bold: true, color: INK, valign: "middle",
  });
  bullets(s, M + 0.3, 2.58, halfW - 0.6, 1.2, [
    "14 produce classes, each holding fresh and rotten folders",
    "80 / 20 stratified train-validation split",
    "Generators feed 224x224 batches of 32 images",
  ], { size: 12, gap: 6, lineSpacing: 17 });

  card(s, { x: M + halfW + 0.4, y: 1.78, w: halfW, h: 2.06 });
  iconCircle(s, M + halfW + 0.68, 1.98, 0.46, AMBER, "LuCircleAlert");
  s.addText("The gap", {
    x: M + halfW + 1.26, y: 1.98, w: halfW - 1.1, h: 0.46, isTextBox: true, margin: 0,
    fontFace: FONT, fontSize: 15.5, bold: true, color: INK, valign: "middle",
  });
  s.addText(
    "Five decay levels were needed, but the source data carries only two. Hand-labelling thousands of " +
    "images into five levels was not feasible in the project window, so the labels were generated " +
    "automatically from image colour.",
    { x: M + halfW + 0.7, y: 2.58, w: halfW - 1.0, h: 1.15, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 12, color: MUTED, lineSpacing: 17 }
  );

  s.addText("HSV DECAY-SCORING PIPELINE", {
    x: M, y: 4.06, w: CW, h: 0.28, isTextBox: true, margin: 0,
    fontFace: FONT, fontSize: 10.5, bold: true, color: GREEN, charSpacing: 2,
  });

  const steps = [
    ["RGB → HSV", "Hue stays stable when the lighting changes.", "LuImage"],
    ["Foreground mask", "Saturation separates fruit from background.", "LuFilter"],
    ["Decay mask", "Brown pixels found inside the fruit region.", "LuThermometerSun"],
    ["Decay score", "decayed px / fruit px × 100", "LuFlaskConical"],
    ["Per-fruit buckets", "Sorted per class, split into 5 groups.", "LuLayers"],
  ];
  const sw = (CW - 4 * 0.22) / 5;
  steps.forEach((st, i) => {
    const x = M + i * (sw + 0.22);
    card(s, { x, y: 4.46, w: sw, h: 1.96 });
    iconCircle(s, x + sw / 2 - 0.25, 4.66, 0.5, i === 4 ? GREEN : FOREST, st[2]);
    s.addText(String(i + 1).padStart(2, "0"), {
      x, y: 5.24, w: sw, h: 0.24, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 10, bold: true, color: GREEN, align: "center", charSpacing: 1.2,
    });
    s.addText(st[0], {
      x: x + 0.1, y: 5.48, w: sw - 0.2, h: 0.4, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 12.5, bold: true, color: INK, align: "center", valign: "top",
    });
    s.addText(st[1], {
      x: x + 0.12, y: 5.88, w: sw - 0.24, h: 0.48, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 10.5, color: MUTED, align: "center", lineSpacing: 14,
    });
    if (i < 4) {
      s.addShape(pres.ShapeType.rightArrow, { x: x + sw + 0.03, y: 5.34, w: 0.16, h: 0.2, fill: { color: GREEN }, line: { color: GREEN, width: 1 } });
    }
  });

  card(s, { x: M, y: 6.62, w: CW, h: 0.76, fill: MINT, line: MINT, flat: true });
  s.addText([
    { text: "Why per-fruit buckets:  ", options: { bold: true, color: FOREST, fontSize: 12 } },
    { text: "a rotten apple and a rotten banana brown at different rates, so one global threshold mislabels whole classes. Each class is bucketed against its own score distribution.", options: { color: INK_SOFT, fontSize: 12 } },
  ], { x: M + 0.3, y: 6.62, w: CW - 0.6, h: 0.76, isTextBox: true, margin: 0, fontFace: FONT, valign: "middle", lineSpacing: 17 });
}

// =========================================================================
// 10 — Transfer learning
// =========================================================================
{
  const s = light();
  head(s, "Section 03", "Transfer learning", "MobileNetV2 backbone, custom head, two-phase training");

  const leftW = 4.25;
  card(s, { x: M, y: 1.78, w: leftW, h: 5.56, fill: MINT_2 });
  s.addText("NETWORK ARCHITECTURE", {
    x: M + 0.26, y: 1.96, w: leftW - 0.52, h: 0.26, isTextBox: true, margin: 0,
    fontFace: FONT, fontSize: 10, bold: true, color: GREEN, charSpacing: 1.8,
  });
  const layers = [
    ["MobileNetV2 backbone", "224x224x3 · ~2.2 M params · depthwise-separable convs, inverted residuals"],
    ["GlobalAveragePooling2D", "7x7x1280 feature map → 1280-vector"],
    ["Dense(128, ReLU)", "Task-specific representation"],
    ["Dropout(0.3)", "Regularisation against overfitting"],
    ["Dense(N, Softmax)", "N = 14 (identifier) or 5 (freshness)"],
  ];
  layers.forEach((l, i) => {
    const y = 2.34 + i * 1.0;
    card(s, { x: M + 0.26, y, w: leftW - 0.52, h: 0.82, fill: PAPER, shadow: { opacity: 0.07, blur: 6 } });
    s.addText(l[0], {
      x: M + 0.44, y: y + 0.1, w: leftW - 0.88, h: 0.28, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 12.5, bold: true, color: i === 0 ? FOREST : INK,
    });
    s.addText(l[1], {
      x: M + 0.44, y: y + 0.38, w: leftW - 0.88, h: 0.4, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 10.5, color: MUTED, lineSpacing: 14,
    });
    if (i < 4) {
      s.addShape(pres.ShapeType.downArrow, {
        x: M + leftW / 2 - 0.1, y: y + 0.85, w: 0.2, h: 0.13,
        fill: { color: GREEN }, line: { color: GREEN, width: 1 },
      });
    }
  });

  const px = M + leftW + 0.4;
  const pw = CW - leftW - 0.4;
  const phases = [
    ["Phase 1", "Feature extraction", FOREST, "LuLayers", [
      "Entire backbone frozen — only the new head trains",
      "Adam, categorical cross-entropy, 5 epochs",
    ], "77.8%", "validation accuracy"],
    ["Phase 2", "Fine-tuning", GREEN, "LuSlidersHorizontal", [
      "Last 30 backbone layers unfrozen",
      "Learning rate dropped to 1e-5, 5 further epochs",
    ], "80.4%", "validation accuracy"],
  ];
  phases.forEach((p, i) => {
    const y = 1.78 + i * 2.14;
    card(s, { x: px, y, w: pw, h: 1.94, line: p[2], lw: 1.25 });
    iconCircle(s, px + 0.28, y + 0.26, 0.5, p[2], p[3]);
    s.addText(p[0].toUpperCase(), {
      x: px + 0.92, y: y + 0.26, w: pw - 2.5, h: 0.22, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 9.5, bold: true, color: p[2], charSpacing: 1.6,
    });
    s.addText(p[1], {
      x: px + 0.92, y: y + 0.46, w: pw - 2.5, h: 0.32, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 16, bold: true, color: INK,
    });
    s.addText(p[5], {
      x: px + pw - 1.85, y: y + 0.24, w: 1.6, h: 0.44, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 24, bold: true, color: p[2], align: "right",
    });
    s.addText(p[6], {
      x: px + pw - 1.85, y: y + 0.68, w: 1.6, h: 0.22, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 9.5, color: MUTED, align: "right",
    });
    bullets(s, px + 0.3, y + 1.06, pw - 0.6, 0.76, p[4], { size: 11.5, gap: 4, lineSpacing: 16 });
  });

  card(s, { x: px, y: 6.06, w: pw, h: 1.28, fill: MINT, line: MINT, flat: true });
  s.addText([
    { text: "Why this order:  ", options: { bold: true, color: FOREST, fontSize: 12 } },
    { text: "training everything at once sends large random gradients through the pretrained weights and destroys them. Early layers already encode generic edges and textures; only the later, task-specific layers are worth adapting.", options: { color: INK_SOFT, fontSize: 12 } },
  ], { x: px + 0.28, y: 6.18, w: pw - 0.56, h: 1.06, isTextBox: true, margin: 0, fontFace: FONT, lineSpacing: 17 });
}

// =========================================================================
// 11 — Coverage
// =========================================================================
{
  const s = light();
  head(s, "Section 03", "What the models recognise", "14 produce classes graded on a five-level decay scale");

  const produce = ["Apple", "Banana", "Bellpepper", "Carrot", "Cucumber", "Grape", "Guava",
    "Jujube", "Mango", "Orange", "Pomegranate", "Potato", "Strawberry", "Tomato"];
  const cols = 7;
  const chipW = (CW - (cols - 1) * 0.18) / cols;
  produce.forEach((p, i) => {
    const col = i % cols, row = Math.floor(i / cols);
    const x = M + col * (chipW + 0.18);
    const y = 1.86 + row * 0.78;
    s.addShape(pres.ShapeType.roundRect, {
      x, y, w: chipW, h: 0.6, rectRadius: 0.1,
      fill: { color: row === 0 ? MINT : MINT_2 }, line: { color: BORDER, width: 1 },
    });
    s.addText(p, {
      x, y, w: chipW, h: 0.6, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 12.5, bold: true, color: FOREST, align: "center", valign: "middle",
    });
  });

  card(s, { x: M, y: 3.5, w: CW, h: 1.76, fill: PAPER });
  s.addText("FRESHNESS SCALE AND THE ADVICE IT CARRIES", {
    x: M + 0.3, y: 3.68, w: CW - 0.6, h: 0.26, isTextBox: true, margin: 0,
    fontFace: FONT, fontSize: 10, bold: true, color: GREEN, charSpacing: 1.8,
  });
  freshnessScale(s, M + 0.3, 4.06, CW - 0.6, { shelf: true, barH: 0.3, labelSize: 11 });

  const notes = [
    ["Anything else is refused", "The ImageNet gatekeeper checks its top-5 labels for food keywords, so a photo of a car or a face is rejected rather than forced into one of the 14 classes.", "LuShieldCheck", FOREST],
    ["Low confidence is admitted", "Below 65% identification confidence the app returns \"unclear image\" and asks for a better photo instead of guessing.", "LuCircleAlert", AMBER],
  ];
  const nw = (CW - 0.3) / 2;
  notes.forEach((n, i) => {
    const x = M + i * (nw + 0.3);
    card(s, { x, y: 5.5, w: nw, h: 1.84, fill: MINT_2 });
    iconCircle(s, x + 0.28, 5.74, 0.5, n[3], n[2]);
    s.addText(n[0], {
      x: x + 0.9, y: 5.74, w: nw - 1.14, h: 0.5, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 14.5, bold: true, color: INK, valign: "middle",
    });
    s.addText(n[1], {
      x: x + 0.3, y: 6.36, w: nw - 0.6, h: 0.85, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 12, color: MUTED, lineSpacing: 17,
    });
  });
}

divider("04", "Results & discussion", "What the trained pipeline achieves, and what the finished application looks like.",
  ["Accuracy & calibration", "The deployed app", "Conclusion"]);

// =========================================================================
// 12 — Results: accuracy & calibration
// =========================================================================
{
  const s = light();
  head(s, "Section 04", "Results & discussion", "Freshness classifier accuracy and inference-time calibration");

  const stats = [
    ["80.4%", "Freshness validation accuracy", GREEN, "LuGauge"],
    ["+2.6 pts", "Gained by fine-tuning", FOREST, "LuChartColumn"],
    ["14", "Produce classes covered", AMBER, "LuBoxes"],
    ["< 1 s", "Typical inference latency", FOREST, "LuTimer"],
  ];
  const sw = (CW - 3 * 0.24) / 4;
  stats.forEach((st, i) => {
    const x = M + i * (sw + 0.24);
    card(s, { x, y: 1.76, w: sw, h: 1.32 });
    iconCircle(s, x + 0.2, 1.94, 0.4, st[2], st[3]);
    s.addText(st[0], {
      x: x + 0.68, y: 1.9, w: sw - 0.88, h: 0.5, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 26, bold: true, color: st[2], valign: "middle",
    });
    s.addText(st[1], {
      x: x + 0.2, y: 2.48, w: sw - 0.4, h: 0.42, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 11, color: MUTED, lineSpacing: 14,
    });
  });

  const chW = (CW - 0.3) / 2;
  card(s, { x: M, y: 3.28, w: chW, h: 3.24, flat: true, fill: MINT_2, line: BORDER });
  s.addChart(pres.ChartType.bar, [{
    name: "Validation accuracy (%)",
    labels: ["Phase 1\n(frozen backbone)", "Phase 2\n(fine-tuned)"],
    values: [77.8, 80.4],
  }], {
    x: M + 0.1, y: 3.38, w: chW - 0.2, h: 3.04,
    barDir: "col", chartColors: [FOREST, GREEN], barGapWidthPct: 110,
    showTitle: true, title: "Freshness classifier — validation accuracy",
    titleFontSize: 12.5, titleColor: INK, titleFontFace: FONT,
    showValue: true, dataLabelPosition: "outEnd", dataLabelFormatCode: '0.0"%"',
    dataLabelFontSize: 12, dataLabelFontFace: FONT, dataLabelColor: INK,
    valAxisMinVal: 70, valAxisMaxVal: 85,
    catAxisLabelColor: MUTED, valAxisLabelColor: MUTED,
    catAxisLabelFontSize: 10, valAxisLabelFontSize: 9.5,
    catAxisLabelFontFace: FONT, valAxisLabelFontFace: FONT,
    valGridLine: { color: "E6EEE9", size: 1 }, catGridLine: { style: "none" },
    showLegend: false, plotArea: { fill: { color: MINT_2 } }, chartArea: { fill: { color: MINT_2 } },
  });

  card(s, { x: M + chW + 0.3, y: 3.28, w: chW, h: 3.24, flat: true, fill: MINT_2, line: BORDER });
  s.addChart(pres.ChartType.bar, [{
    name: "Calibration multiplier",
    labels: ["Slightly rotten", "Rotten", "Very rotten"],
    values: [0.3, 1.5, 2.5],
  }], {
    x: M + chW + 0.4, y: 3.38, w: chW - 0.2, h: 3.04,
    barDir: "col", chartColors: [SCALE[2][2], SCALE[3][2], SCALE[4][2]], barGapWidthPct: 90,
    showTitle: true, title: "Inference-time calibration weights",
    titleFontSize: 12.5, titleColor: INK, titleFontFace: FONT,
    showValue: true, dataLabelPosition: "outEnd", dataLabelFormatCode: '0.0"x"',
    dataLabelFontSize: 12, dataLabelFontFace: FONT, dataLabelColor: INK,
    valAxisMinVal: 0, valAxisMaxVal: 3,
    catAxisLabelColor: MUTED, valAxisLabelColor: MUTED,
    catAxisLabelFontSize: 10, valAxisLabelFontSize: 9.5,
    catAxisLabelFontFace: FONT, valAxisLabelFontFace: FONT,
    valGridLine: { color: "E6EEE9", size: 1 }, catGridLine: { style: "none" },
    showLegend: false, plotArea: { fill: { color: MINT_2 } }, chartArea: { fill: { color: MINT_2 } },
  });

  s.addText(
    "The raw freshness head over-predicted \"slightly rotten\" and almost never fired \"very rotten\". Rather than " +
    "retrain, the probability vector is reweighted at inference and renormalised — a practical fix that visibly " +
    "improved the verdicts.",
    { x: M, y: 6.66, w: CW, h: 0.7, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 12, color: MUTED, lineSpacing: 18 }
  );
  s.addNotes("Phase 1 to Phase 2 is a 2.6 point gain. The calibration weights multiply the three under- or over-fired classes before the distribution is renormalised.");
}

// =========================================================================
// 13 — Results: the deployed application
// =========================================================================
{
  const s = light();
  head(s, "Section 04", "The deployed application", "FastAPI JSON service behind a React single-page interface");

  const imgW = 5.3;
  s.addImage({ path: IMG("ui_hero.png"), x: M, y: 1.76, w: imgW, h: imgW * 0.625, rounding: false });
  s.addText("Landing view — model status, headline and coverage stats", {
    x: M, y: 5.1, w: imgW, h: 0.26, isTextBox: true, margin: 0,
    fontFace: FONT, fontSize: 10.5, italic: true, color: MUTED,
  });
  const imgW2 = 4.4;
  s.addImage({ path: IMG("shot_upload.png"), x: M, y: 5.42, w: imgW2, h: imgW2 * 0.4125 });
  s.addText("Analysis view — drag-and-drop upload beside the verdict panel", {
    x: M, y: 7.26, w: imgW, h: 0.26, isTextBox: true, margin: 0,
    fontFace: FONT, fontSize: 10.5, italic: true, color: MUTED,
  });

  const px = M + imgW + 0.42;
  const pw = CW - imgW - 0.42;
  card(s, { x: px, y: 1.76, w: pw, h: 2.5, fill: MINT_2 });
  iconCircle(s, px + 0.26, 1.96, 0.44, FOREST, "LuServer");
  s.addText("REST API", {
    x: px + 0.84, y: 1.96, w: pw - 1.1, h: 0.44, isTextBox: true, margin: 0,
    fontFace: FONT, fontSize: 15, bold: true, color: INK, valign: "middle",
  });
  s.addText([
    { text: "GET /api/health", options: { bold: true, fontSize: 11.5, color: FOREST, breakLine: true } },
    { text: "Model load status (503 if a model is missing)", options: { fontSize: 10.5, color: MUTED, breakLine: true } },
    { text: "GET /api/classes", options: { bold: true, fontSize: 11.5, color: FOREST, breakLine: true } },
    { text: "Produce and freshness label lists", options: { fontSize: 10.5, color: MUTED, breakLine: true } },
    { text: "POST /api/predict", options: { bold: true, fontSize: 11.5, color: FOREST, breakLine: true } },
    { text: "Image upload → the full analysis JSON", options: { fontSize: 10.5, color: MUTED } },
  ], { x: px + 0.28, y: 2.54, w: pw - 0.56, h: 1.6, isTextBox: true, margin: 0, fontFace: FONT, lineSpacing: 16 });

  card(s, { x: px, y: 4.46, w: pw, h: 2.88 });
  iconCircle(s, px + 0.26, 4.66, 0.44, GREEN, "LuEye");
  s.addText("What the user sees", {
    x: px + 0.84, y: 4.66, w: pw - 1.1, h: 0.44, isTextBox: true, margin: 0,
    fontFace: FONT, fontSize: 15, bold: true, color: INK, valign: "middle",
  });
  bullets(s, px + 0.28, 5.24, pw - 0.56, 2.0, [
    "Headline verdict, e.g. \"Fresh Tomato\"",
    "Produce and freshness confidence",
    "Top-3 identification scores",
    "The full 5-level freshness distribution",
    "Estimated shelf life",
    "The gatekeeper's own ImageNet label",
    "Inference latency in milliseconds",
  ], { size: 11.5, gap: 5, lineSpacing: 16 });
  s.addNotes("Uploads are capped at 10 MB and held in memory only — nothing is written to disk. When frontend/dist exists the backend serves the built UI itself, so the whole app runs on one port.");
}

// =========================================================================
// 14 — Conclusion (dark)
// =========================================================================
{
  const s = dark("bg_close.png");
  s.addText("CONCLUSION", {
    x: M, y: 0.62, w: CW, h: 0.3, isTextBox: true, margin: 0,
    fontFace: FONT, fontSize: 10.5, bold: true, color: GREEN_HI, charSpacing: 2.4,
  });
  s.addText("An end-to-end produce quality analyser", {
    x: M, y: 0.94, w: CW, h: 0.5, isTextBox: true, margin: 0,
    fontFace: FONT, fontSize: 27, bold: true, color: PAPER,
  });
  s.addText(
    "Three cooperating MobileNetV2 models turn one photograph into an identified item, a five-level " +
    "freshness grade, a confidence breakdown and a shelf-life estimate — in under a second on commodity hardware.",
    { x: M, y: 1.52, w: CW - 0.4, h: 0.6, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 13.5, color: DARK_MUTED, lineSpacing: 20 }
  );

  const cols = [
    ["What worked", GREEN, "LuCircleCheck", [
      "Transfer learning reached 80.4% validation accuracy on a small dataset",
      "HSV pseudo-labelling produced five levels with zero manual annotation",
      "The gatekeeper stops confident nonsense on out-of-distribution photos",
      "One-port deployment: the API serves the built React UI directly",
    ]],
    ["Limitations & next steps", AMBER, "LuTriangleAlert", [
      "Pseudo-labels are heuristic, not ground truth — accuracy is bounded by them",
      "Calibration multipliers are hand-tuned; class weights on retraining are the proper fix",
      "The keyword gatekeeper could be replaced by a trained binary produce detector",
      "Data augmentation and per-class metrics are the next accuracy levers",
    ]],
  ];
  const cw2 = (CW - 0.4) / 2;
  cols.forEach((c, i) => {
    const x = M + i * (cw2 + 0.4);
    darkCard(s, { x, y: 2.36, w: cw2, h: 3.9 });
    iconCircle(s, x + 0.3, 2.6, 0.5, c[1], c[2]);
    s.addText(c[0], {
      x: x + 0.94, y: 2.6, w: cw2 - 1.2, h: 0.5, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 16, bold: true, color: PAPER, valign: "middle",
    });
    bullets(s, x + 0.32, 3.34, cw2 - 0.64, 2.8, c[3],
      { size: 12, gap: 13, lineSpacing: 18, color: DARK_MUTED });
  });

  darkCard(s, { x: M, y: 6.5, w: CW, h: 0.92 });
  iconCircle(s, M + 0.28, 6.71, 0.5, FOREST, "LuPackageSearch");
  s.addText([
    { text: "Impact:  ", options: { bold: true, color: GREEN_HI, fontSize: 12.5 } },
    { text: "the same pipeline generalises to warehouse intake checks, retail shelf audits and cold-chain monitoring — anywhere produce is currently graded by eye.", options: { color: PAPER, fontSize: 12.5 } },
  ], { x: M + 0.94, y: 6.5, w: CW - 1.24, h: 0.92, isTextBox: true, margin: 0, fontFace: FONT, valign: "middle", lineSpacing: 18 });
}

// =========================================================================
// 15 — Learning outcomes
// =========================================================================
{
  const s = light();
  head(s, "Reflection", "Learning outcomes");

  const outcomes = [
    ["Deep learning in practice", "Built and trained CNN classifiers in Keras — transfer learning, frozen vs. unfrozen backbones, dropout and learning-rate choice for fine-tuning.", "LuBrainCircuit", FOREST],
    ["Working around missing labels", "Data problems are often solved before modelling: classical HSV computer vision generated the five-level labels supervised learning needed.", "LuTags", GREEN],
    ["Evaluation and honesty", "Read confusion matrices and per-class precision/recall rather than a single accuracy figure, and recognised a systematic class bias in the raw output.", "LuChartColumn", AMBER],
    ["Designing robust ML systems", "A deployed model needs guard rails — an input gatekeeper and a confidence threshold turn a fragile classifier into a system that admits when it does not know.", "LuShieldCheck", FOREST],
    ["Full-stack deployment", "Wrapped the models in a FastAPI service and a React + Vite frontend; handled preprocessing parity, file limits, CORS and single-port static serving.", "LuMonitor", GREEN],
    ["Engineering communication", "Documented the architecture and its trade-offs so the work is reproducible and explainable to a non-specialist audience.", "LuMessageSquare", AMBER],
  ];
  const cw2 = (CW - 0.4) / 2;
  outcomes.forEach((o, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = M + col * (cw2 + 0.4);
    const y = 1.72 + row * 1.92;
    card(s, { x, y, w: cw2, h: 1.72, fill: row % 2 === 1 ? MINT_2 : PAPER });
    iconCircle(s, x + 0.3, y + 0.3, 0.5, o[3], o[2]);
    s.addText(o[0], {
      x: x + 0.94, y: y + 0.3, w: cw2 - 1.2, h: 0.5, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 15, bold: true, color: INK, valign: "middle",
    });
    s.addText(o[1], {
      x: x + 0.32, y: y + 0.92, w: cw2 - 0.64, h: 0.68, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 11.5, color: MUTED, lineSpacing: 16,
    });
  });
}

// =========================================================================
// 16 — References
// =========================================================================
{
  const s = light();
  head(s, "Sources", "References");

  const refs = [
    ["Sandler, M., Howard, A., Zhu, M., Zhmoginov, A., Chen, L.-C. (2018).", "MobileNetV2: Inverted Residuals and Linear Bottlenecks. IEEE/CVF CVPR, pp. 4510-4520."],
    ["Deng, J., Dong, W., Socher, R., Li, L.-J., Li, K., Fei-Fei, L. (2009).", "ImageNet: A Large-Scale Hierarchical Image Database. IEEE CVPR."],
    ["Pan, S. J., Yang, Q. (2010).", "A Survey on Transfer Learning. IEEE Transactions on Knowledge and Data Engineering, 22(10), 1345-1359."],
    ["TensorFlow / Keras documentation.", "Transfer learning and fine-tuning — tensorflow.org/tutorials/images/transfer_learning"],
    ["FastAPI documentation.", "Modern high-performance Python web framework — fastapi.tiangolo.com"],
    ["React and Vite documentation.", "react.dev  ·  vite.dev"],
    ["Fresh and Rotten Fruits/Vegetables image dataset.", "Public image dataset, unified into 14 produce classes with fresh/rotten subfolders."],
  ];
  refs.forEach((r, i) => {
    const y = 1.76 + i * 0.82;
    card(s, { x: M, y, w: CW, h: 0.7, fill: i % 2 === 0 ? MINT_2 : PAPER, flat: true });
    s.addText(String(i + 1).padStart(2, "0"), {
      x: M + 0.24, y, w: 0.42, h: 0.7, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 12.5, bold: true, color: GREEN, valign: "middle",
    });
    s.addText([
      { text: r[0] + "  ", options: { bold: true, fontSize: 12, color: INK } },
      { text: r[1], options: { fontSize: 12, color: MUTED } },
    ], { x: M + 0.78, y, w: CW - 1.0, h: 0.7, isTextBox: true, margin: 0, fontFace: FONT, valign: "middle", lineSpacing: 16 });
  });
}

// =========================================================================
// 17 — Closing
// =========================================================================
{
  const s = dark("bg_close.png");
  pageNo -= 1;
  iconCircle(s, W / 2 - 0.35, 1.72, 0.7, GREEN, "LuLeaf");
  s.addText("Thank you", {
    x: M, y: 2.72, w: CW, h: 0.86, isTextBox: true, margin: 0,
    fontFace: FONT, fontSize: 44, bold: true, color: PAPER, align: "center",
  });
  s.addText("Questions and discussion", {
    x: M, y: 3.62, w: CW, h: 0.36, isTextBox: true, margin: 0,
    fontFace: FONT, fontSize: 16, color: GREEN_HI, align: "center",
  });

  freshnessScale(s, M + 2.0, 4.42, CW - 4.0, { onDark: true, barH: 0.22, labelSize: 9 });

  s.addText("Fresh Vision  ·  Practice School-II  ·  School of Engineering & Technology, BML Munjal University", {
    x: M, y: 5.86, w: CW, h: 0.3, isTextBox: true, margin: 0,
    fontFace: FONT, fontSize: 12, color: PAPER, align: "center",
  });
  s.addText("Faculty Mentor: Dr. XYZ   ·   Industry Mentor: Mr. ABC   ·   August 2025", {
    x: M, y: 6.18, w: CW, h: 0.3, isTextBox: true, margin: 0,
    fontFace: FONT, fontSize: 11, color: DARK_MUTED, align: "center",
  });
}

pres.writeFile({ fileName: OUT }).then(() => console.log("wrote", OUT));
