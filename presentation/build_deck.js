const pptxgen = require("pptxgenjs");
const path = require("path");

const SD = require("path").join(__dirname, "assets");
const OUT = require("path").join(__dirname, "Fresh_Vision_PSII_Presentation.pptx");

// --- Template-derived identity -------------------------------------------
const BLUE = "0070C0";      // exact title blue sampled from the template PDF
const INK = "1A1A1A";
const MUTED = "5A6472";
const LINE = "D6DEE8";
const TINT = "EAF3FB";      // pale blue card fill
const GREEN = "1F8A4C";
const GREEN_T = "E7F5EC";
const AMBER = "C77700";
const AMBER_T = "FCF1E0";
const RED = "B3261E";
const RED_T = "FBEAE9";
const FONT = "Arial";

const W = 11.02, H = 8.27;      // A4 landscape, matches the template page size
const M = 0.62;                 // slide margin
const CW = W - 2 * M;           // content width

const pres = new pptxgen();
pres.defineLayout({ name: "A4LAND", width: W, height: H });
pres.layout = "A4LAND";
pres.author = "Fresh Vision";
pres.title = "Fresh Vision — Practice School-II";

const slide = () => {
  const s = pres.addSlide();
  s.background = { color: "FFFFFF" };
  return s;
};

// Blue centred slide title, exactly as the template renders it.
function title(s, text, sub) {
  const t = text.toUpperCase();
  s.addText(t, {
    x: M, y: 0.36, w: CW, h: 0.72, isTextBox: true, margin: 0,
    fontFace: FONT, fontSize: t.length > 34 ? 25 : 30, bold: true, color: BLUE, align: "center", valign: "middle",
  });
  if (sub) {
    s.addText(sub, {
      x: M, y: 1.06, w: CW, h: 0.3, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 13, italic: true, color: MUTED, align: "center",
    });
  }
}

function card(s, o) {
  s.addShape(pres.ShapeType.roundRect, {
    x: o.x, y: o.y, w: o.w, h: o.h, rectRadius: 0.08,
    fill: { color: o.fill || TINT }, line: { color: o.line || LINE, width: 1 },
  });
}

// Numbered circle badge used as the deck's repeating motif.
function badge(s, x, y, n, color) {
  s.addShape(pres.ShapeType.ellipse, {
    x, y, w: 0.42, h: 0.42, fill: { color: color || BLUE }, line: { color: color || BLUE, width: 1 },
  });
  s.addText(String(n), {
    x, y, w: 0.42, h: 0.42, isTextBox: true, margin: 0,
    fontFace: FONT, fontSize: 14, bold: true, color: "FFFFFF", align: "center", valign: "middle",
  });
}

function body(s, x, y, w, h, items, opts = {}) {
  s.addText(
    items.map((t, i) => ({
      text: t, options: { bullet: true, breakLine: i !== items.length - 1, paraSpaceAfter: opts.gap ?? 8 },
    })),
    {
      x, y, w, h, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: opts.size || 14, color: opts.color || INK, lineSpacing: opts.lineSpacing || 20,
    }
  );
}

function label(s, x, y, w, text, color) {
  s.addText(text, {
    x, y, w, h: 0.3, isTextBox: true, margin: 0,
    fontFace: FONT, fontSize: 14, bold: true, color: color || BLUE,
  });
}

function fillLine(s, x, y, w, lbl) {
  s.addText(lbl, {
    x, y, w, h: 0.3, isTextBox: true, margin: 0,
    fontFace: FONT, fontSize: 13.5, color: INK,
  });
  s.addShape(pres.ShapeType.line, { x, y: y + 0.29, w, h: 0, line: { color: LINE, width: 1 } });
}

// =========================================================================
// 1 — Title
// =========================================================================
{
  const s = slide();
  s.addText("FRESH VISION", {
    x: M, y: 0.66, w: CW, h: 0.85, isTextBox: true, margin: 0,
    fontFace: FONT, fontSize: 44, bold: true, color: BLUE, align: "center", charSpacing: 1,
  });
  s.addText("An AI-Powered Fruit & Vegetable Freshness Analyzer", {
    x: M, y: 1.5, w: CW, h: 0.4, isTextBox: true, margin: 0,
    fontFace: FONT, fontSize: 18, color: INK, align: "center",
  });
  s.addText("Deep-learning pipeline · MobileNetV2 transfer learning · FastAPI + React deployment", {
    x: M, y: 1.9, w: CW, h: 0.3, isTextBox: true, margin: 0,
    fontFace: FONT, fontSize: 12.5, italic: true, color: MUTED, align: "center",
  });

  // Submitted by
  card(s, { x: 3.5, y: 2.45, w: 4.02, h: 1.05, fill: TINT });
  s.addText(
    [
      { text: "Submitted by", options: { bold: true, breakLine: true, fontSize: 14, color: BLUE } },
      { text: "Name:  ______________________", options: { breakLine: true, fontSize: 13 } },
      { text: "ID:  ______________________", options: { fontSize: 13 } },
    ],
    { x: 3.6, y: 2.53, w: 3.82, h: 0.9, isTextBox: true, margin: 0, fontFace: FONT, color: INK, align: "center", lineSpacing: 19 }
  );

  // Mentors
  const mentorY = 3.9;
  card(s, { x: M, y: mentorY, w: 4.7, h: 1.5, fill: "FFFFFF" });
  card(s, { x: W - M - 4.7, y: mentorY, w: 4.7, h: 1.5, fill: "FFFFFF" });
  s.addText(
    [
      { text: "Faculty Mentor", options: { bold: true, color: BLUE, fontSize: 15, breakLine: true } },
      { text: "Dr. XYZ", options: { breakLine: true, fontSize: 13.5 } },
      { text: "Designation", options: { breakLine: true, fontSize: 13.5 } },
      { text: "SOET, BMU", options: { fontSize: 13.5 } },
    ],
    { x: M + 0.25, y: mentorY + 0.14, w: 4.2, h: 1.25, isTextBox: true, margin: 0, fontFace: FONT, color: INK, lineSpacing: 19 }
  );
  s.addText(
    [
      { text: "Industry Mentor", options: { bold: true, color: BLUE, fontSize: 15, breakLine: true } },
      { text: "Mr. ABC", options: { breakLine: true, fontSize: 13.5 } },
      { text: "Designation", options: { breakLine: true, fontSize: 13.5 } },
      { text: "Organization name", options: { fontSize: 13.5 } },
    ],
    { x: W - M - 4.45, y: mentorY + 0.14, w: 4.2, h: 1.25, isTextBox: true, margin: 0, fontFace: FONT, color: INK, lineSpacing: 19 }
  );

  s.addText("PRACTICE SCHOOL-II", {
    x: M, y: 6.02, w: CW, h: 0.4, isTextBox: true, margin: 0,
    fontFace: FONT, fontSize: 20, bold: true, color: BLUE, align: "center",
  });
  s.addText("School of Engineering & Technology,", {
    x: M, y: 6.44, w: CW, h: 0.32, isTextBox: true, margin: 0,
    fontFace: FONT, fontSize: 15, color: INK, align: "center",
  });
  s.addText("BML Munjal University, 67th KM Stone, NH-8, Gurugram, Haryana 122413", {
    x: M, y: 6.78, w: CW, h: 0.32, isTextBox: true, margin: 0,
    fontFace: FONT, fontSize: 13, italic: true, color: INK, align: "center",
  });
  s.addText("August 2025", {
    x: M, y: 7.16, w: CW, h: 0.32, isTextBox: true, margin: 0,
    fontFace: FONT, fontSize: 15, bold: true, color: INK, align: "center",
  });
  s.addNotes("Fresh Vision identifies a fruit or vegetable from a photo and grades how fresh it is, using three neural networks behind a web app.");
}

// =========================================================================
// 2 — Outline
// =========================================================================
{
  const s = slide();
  title(s, "Outline of the Presentation");
  const items = [
    ["About the PS-II station", "Organisation, department and mentors"],
    ["Visit summary", "Eight-week work log"],
    ["Problem identification", "Why manual freshness checking fails"],
    ["Problem statement", "What the system must solve"],
    ["Objectives of the work", "Six measurable goals"],
    ["Methodology", "Data, pseudo-labelling, training, deployment"],
    ["Results & discussions", "Accuracy, calibration, working app"],
    ["Learning outcomes", "Technical and professional takeaways"],
    ["References", "Papers, datasets and documentation"],
  ];
  const colW = (CW - 0.4) / 2;
  items.forEach((it, i) => {
    const col = i < 5 ? 0 : 1;
    const row = i < 5 ? i : i - 5;
    const x = M + col * (colW + 0.4);
    const y = 1.52 + row * 1.22;
    card(s, { x, y, w: colW, h: 1.02, fill: i % 2 === 0 ? TINT : "FFFFFF" });
    badge(s, x + 0.22, y + 0.3, i + 1);
    s.addText(it[0], {
      x: x + 0.8, y: y + 0.2, w: colW - 0.99, h: 0.32, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 15, bold: true, color: INK,
    });
    s.addText(it[1], {
      x: x + 0.8, y: y + 0.54, w: colW - 0.99, h: 0.3, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 12, color: MUTED,
    });
  });
  s.addNotes("Nine sections, following the PS-II template order.");
}

// =========================================================================
// 3 — About the PS-II station
// =========================================================================
{
  const s = slide();
  title(s, "About the PS-II Station");

  const blocks = [
    {
      head: "About the Company", y: 1.5, h: 1.8,
      rows: ["Est. date:", "Turnover:", "Product type:", "Number of employees:"],
    },
    {
      head: "Department Visited", y: 3.5, h: 1.8,
      rows: ["Name of department:", "Nature of work:", "Task allocated:"],
    },
    {
      head: "Faculty Mentor Details", y: 5.5, h: 1.8,
      rows: ["Name:", "Department:", "Designation:", "Contact info:"],
    },
  ];

  blocks.forEach((b, bi) => {
    card(s, { x: M, y: b.y, w: CW, h: b.h, fill: bi % 2 === 0 ? TINT : "FFFFFF" });
    badge(s, M + 0.22, b.y + 0.16, bi + 1);
    s.addText(b.head, {
      x: M + 0.78, y: b.y + 0.16, w: CW - 1.0, h: 0.4, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 16, bold: true, color: BLUE, valign: "middle",
    });
    b.rows.forEach((r, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      fillLine(s, M + 0.78 + col * ((CW - 1.1) / 2), b.y + 0.72 + row * 0.54, (CW - 1.1) / 2 - 0.3, r);
    });
  });

  s.addText("To be completed with the PS-II station details before submission.", {
    x: M, y: 7.4, w: CW, h: 0.3, isTextBox: true, margin: 0,
    fontFace: FONT, fontSize: 11, italic: true, color: MUTED, align: "center",
  });
  s.addNotes("Fill in the station, department and faculty mentor details here.");
}

// =========================================================================
// 4 — Visit summary
// =========================================================================
{
  const s = slide();
  title(s, "Visit Summary");

  card(s, { x: M, y: 1.5, w: (CW - 0.3) / 2, h: 0.56, fill: TINT });
  card(s, { x: M + (CW - 0.3) / 2 + 0.3, y: 1.5, w: (CW - 0.3) / 2, h: 0.56, fill: TINT });
  s.addText("Start date:  ____________________", {
    x: M + 0.25, y: 1.5, w: (CW - 0.3) / 2 - 0.4, h: 0.56, isTextBox: true, margin: 0,
    fontFace: FONT, fontSize: 14, bold: true, color: INK, valign: "middle",
  });
  s.addText("End date:  ____________________", {
    x: M + (CW - 0.3) / 2 + 0.55, y: 1.5, w: (CW - 0.3) / 2 - 0.4, h: 0.56, isTextBox: true, margin: 0,
    fontFace: FONT, fontSize: 14, bold: true, color: INK, valign: "middle",
  });

  s.addText("Weekly Summary", {
    x: M, y: 2.3, w: CW, h: 0.32, isTextBox: true, margin: 0,
    fontFace: FONT, fontSize: 16, bold: true, color: BLUE,
  });

  const weeks = [
    ["Week-1", "Studied the problem domain and surveyed CNN architectures for produce quality inspection."],
    ["Week-2", "Collected and unified the fruit/vegetable dataset — 14 classes, each with fresh and rotten images."],
    ["Week-3", "Built the data pipeline: stratified 80/20 split and MobileNetV2 preprocessing generators."],
    ["Week-4", "Trained the 14-class produce identifier by transfer learning on a frozen MobileNetV2 backbone."],
    ["Week-5", "Generated 5-level freshness pseudo-labels using HSV decay scoring; trained the freshness head."],
    ["Week-6", "Fine-tuned the last 30 backbone layers and added inference-time confidence calibration."],
    ["Week-7", "Added the ImageNet gatekeeper and exposed the pipeline as a FastAPI service."],
    ["Week-8", "Built the React + Vite frontend, ran end-to-end testing and documented the project."],
  ];
  const rowH = 0.62;
  weeks.forEach((w, i) => {
    const y = 2.72 + i * rowH;
    if (i % 2 === 0) {
      s.addShape(pres.ShapeType.rect, { x: M, y, w: CW, h: rowH, fill: { color: TINT }, line: { color: TINT, width: 0 } });
    }
    s.addText(w[0] + ":", {
      x: M + 0.14, y, w: 0.95, h: rowH, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 13, bold: true, color: BLUE, valign: "middle",
    });
    s.addText(w[1], {
      x: M + 1.12, y, w: CW - 1.28, h: rowH, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 13, color: INK, valign: "middle",
    });
  });
  s.addNotes("The weekly lines mirror the actual build order of the project; add the real start and end dates.");
}

// =========================================================================
// 5 — Problem identification
// =========================================================================
{
  const s = slide();
  title(s, "Problem Identification");

  card(s, { x: M, y: 1.42, w: CW, h: 1.7, fill: TINT });
  label(s, M + 0.28, 1.58, 3, "Statement");
  s.addText(
    "Fruit and vegetable quality across retail stores, warehouses and the cold-chain is still judged by eye. " +
    "Manual inspection is slow, subjective and inconsistent between graders, so spoiled produce reaches customers " +
    "while sellable produce is discarded. There is no cheap, objective tool that grades produce from an ordinary photo.",
    { x: M + 0.28, y: 1.94, w: CW - 0.56, h: 1.1, isTextBox: true, margin: 0, fontFace: FONT, fontSize: 14, color: INK, lineSpacing: 21 }
  );

  const drivers = [
    ["Subjective", "Two graders disagree on the same crate; \"slightly spoiled\" has no shared definition.", BLUE],
    ["Not scalable", "Every unit has to be picked up and looked at — impossible at warehouse volumes.", AMBER],
    ["Binary only", "Existing fresh/rotten datasets label just two states, so no shelf-life guidance is possible.", GREEN],
  ];
  const cw3 = (CW - 0.6) / 3;
  drivers.forEach((d, i) => {
    const x = M + i * (cw3 + 0.3);
    card(s, { x, y: 3.32, w: cw3, h: 1.75, fill: "FFFFFF" });
    s.addShape(pres.ShapeType.ellipse, { x: x + 0.22, y: 3.56, w: 0.36, h: 0.36, fill: { color: d[2] }, line: { color: d[2], width: 1 } });
    s.addText(d[0], {
      x: x + 0.68, y: 3.56, w: cw3 - 0.9, h: 0.36, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 15, bold: true, color: INK, valign: "middle",
    });
    s.addText(d[1], {
      x: x + 0.22, y: 4.04, w: cw3 - 0.44, h: 0.9, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 12.5, color: MUTED, lineSpacing: 17,
    });
  });

  card(s, { x: M, y: 5.3, w: CW, h: 2.15, fill: TINT });
  label(s, M + 0.28, 5.46, 4, "Problem Statement");
  s.addText(
    "Design and deploy a system that, from a single ordinary photograph, (a) verifies that the subject is actually " +
    "produce, (b) identifies which fruit or vegetable it is, and (c) grades its decay on a five-level scale with a " +
    "confidence score and an estimated shelf life — fast enough to run on commodity hardware inside a web browser.",
    { x: M + 0.28, y: 5.82, w: CW - 0.56, h: 1.1, isTextBox: true, margin: 0, fontFace: FONT, fontSize: 14, color: INK, lineSpacing: 21 }
  );
  s.addText("Deliverable: a browser-accessible tool with an auditable, explainable verdict — not a black-box label.", {
    x: M + 0.28, y: 7.02, w: CW - 0.56, h: 0.3, isTextBox: true, margin: 0,
    fontFace: FONT, fontSize: 12, italic: true, color: BLUE,
  });
}

// =========================================================================
// 6 — Objectives
// =========================================================================
{
  const s = slide();
  title(s, "Objectives of the Work");

  const objs = [
    ["Identify produce", "Classify a photo into one of 14 fruit and vegetable categories using transfer learning."],
    ["Grade freshness", "Predict five decay levels — very fresh, fresh, slightly rotten, rotten, very rotten."],
    ["Create fine labels", "Derive the five levels automatically from binary fresh/rotten data, without manual annotation."],
    ["Reject bad input", "Use an ImageNet gatekeeper so non-produce photos are refused instead of misclassified."],
    ["Stay explainable", "Surface top-3 identity scores, the full freshness distribution, shelf life and latency."],
    ["Deploy end-to-end", "Serve the pipeline as a REST API behind a responsive single-page web application."],
  ];
  const cw2 = (CW - 0.34) / 2;
  objs.forEach((o, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = M + col * (cw2 + 0.34);
    const y = 1.5 + row * 2.0;
    card(s, { x, y, w: cw2, h: 1.78, fill: row % 2 === 0 ? "FFFFFF" : TINT });
    badge(s, x + 0.26, y + 0.3, i + 1);
    s.addText(o[0], {
      x: x + 0.84, y: y + 0.3, w: cw2 - 1.07, h: 0.42, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 16, bold: true, color: BLUE, valign: "middle",
    });
    s.addText(o[1], {
      x: x + 0.3, y: y + 0.86, w: cw2 - 0.6, h: 0.8, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 13, color: INK, lineSpacing: 18,
    });
  });
}

// =========================================================================
// 7 — Methodology: system architecture
// =========================================================================
{
  const s = slide();
  title(s, "Methodology — System Architecture", "One image in, three models, one auditable verdict");

  // Input
  const inW = 3.05;
  const inX = M + (CW - (2 * inW + 0.45)) / 2;
  card(s, { x: inX, y: 1.5, w: inW, h: 1.1, fill: TINT });
  s.addText([
    { text: "Input image", options: { bold: true, fontSize: 14, color: BLUE, breakLine: true } },
    { text: "JPG / PNG / WEBP, up to 10 MB", options: { fontSize: 11.5, color: MUTED } },
  ], { x: inX + 0.14, y: 1.62, w: inW - 0.28, h: 0.86, isTextBox: true, margin: 0, fontFace: FONT, align: "center", lineSpacing: 17 });

  // Preprocess
  const preX = inX + inW + 0.45;
  card(s, { x: preX, y: 1.5, w: inW, h: 1.1, fill: TINT });
  s.addText([
    { text: "Preprocess", options: { bold: true, fontSize: 14, color: BLUE, breakLine: true } },
    { text: "Resize 224x224, MobileNetV2 normalisation", options: { fontSize: 11.5, color: MUTED } },
  ], { x: preX + 0.14, y: 1.62, w: inW - 0.28, h: 0.86, isTextBox: true, margin: 0, fontFace: FONT, align: "center", lineSpacing: 17 });

  s.addShape(pres.ShapeType.rightArrow, { x: inX + inW + 0.08, y: 1.9, w: 0.29, h: 0.3, fill: { color: BLUE }, line: { color: BLUE, width: 1 } });
  // fan-out into the three model cards
  s.addShape(pres.ShapeType.downArrow, { x: preX + inW / 2 - 0.15, y: 2.66, w: 0.3, h: 0.34, fill: { color: BLUE }, line: { color: BLUE, width: 1 } });

  // Three models
  const models = [
    ["Model 1 — Gatekeeper", "Pretrained MobileNetV2 (ImageNet, 1000 classes). Scans the top-5 labels for food keywords and rejects non-produce photos.", "Off-the-shelf, no training", BLUE],
    ["Model 2 — Produce identifier", "MobileNetV2 backbone + custom head, fine-tuned on the unified dataset. Outputs 14 produce classes with a top-3 breakdown.", "Dense(14, softmax)", GREEN],
    ["Model 3 — Freshness classifier", "Same backbone, trained on pseudo-labelled data. Outputs 5 decay levels, then calibrated at inference time.", "Dense(5, softmax)", AMBER],
  ];
  const cw3 = (CW - 0.6) / 3;
  models.forEach((m, i) => {
    const x = M + i * (cw3 + 0.3);
    card(s, { x, y: 3.28, w: cw3, h: 2.65, fill: "FFFFFF", line: m[3] });
    s.addShape(pres.ShapeType.ellipse, { x: x + cw3 / 2 - 0.21, y: 3.15, w: 0.42, h: 0.42, fill: { color: m[3] }, line: { color: m[3], width: 1 } });
    s.addText(String(i + 1), {
      x: x + cw3 / 2 - 0.21, y: 3.15, w: 0.42, h: 0.42, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 14, bold: true, color: "FFFFFF", align: "center", valign: "middle",
    });
    s.addText(m[0], {
      x: x + 0.18, y: 3.7, w: cw3 - 0.36, h: 0.6, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 14.5, bold: true, color: m[3], align: "center", valign: "middle",
    });
    s.addText(m[1], {
      x: x + 0.2, y: 4.34, w: cw3 - 0.4, h: 1.05, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 12, color: INK, align: "center", lineSpacing: 16,
    });
    s.addText(m[2], {
      x: x + 0.18, y: 5.52, w: cw3 - 0.36, h: 0.3, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 11, italic: true, color: MUTED, align: "center",
    });
  });

  // Output
  card(s, { x: M, y: 6.2, w: CW, h: 1.2, fill: TINT });
  s.addText([
    { text: "Verdict  ", options: { bold: true, fontSize: 14, color: BLUE } },
    { text: "status (ok / uncertain / rejected)  ·  produce label + confidence  ·  freshness level + full distribution  ·  estimated shelf life  ·  inference latency", options: { fontSize: 12.5, color: INK } },
  ], { x: M + 0.28, y: 6.32, w: CW - 0.56, h: 0.96, isTextBox: true, margin: 0, fontFace: FONT, lineSpacing: 19, valign: "middle" });
  s.addNotes("Two guard rails run before any verdict is shown: the gatekeeper rejects non-produce, and an identification confidence below 65% is reported as uncertain rather than guessed.");
}

// =========================================================================
// 8 — Methodology: dataset and pseudo-labelling
// =========================================================================
{
  const s = slide();
  title(s, "Methodology — Data & Pseudo-Labelling", "Turning two labels into five without any manual annotation");

  card(s, { x: M, y: 1.55, w: 4.6, h: 2.35, fill: TINT });
  label(s, M + 0.24, 1.7, 3, "Dataset");
  body(s, M + 0.24, 2.12, 4.14, 1.7, [
    "Unified dataset of 14 produce classes",
    "Each class holds fresh and rotten folders",
    "80 / 20 stratified train-validation split",
    "Generators feed 224x224 batches of 32",
  ], { size: 13, gap: 6, lineSpacing: 19 });

  card(s, { x: M + 4.9, y: 1.55, w: CW - 4.9, h: 2.35, fill: "FFFFFF" });
  label(s, M + 5.14, 1.7, 3, "The gap");
  s.addText(
    "Five decay levels were needed, but the source data carries only two. Hand-labelling thousands of images " +
    "into five levels was not feasible within the project timeline, so the labels were generated automatically " +
    "from image colour.",
    { x: M + 5.14, y: 2.12, w: CW - 5.4, h: 1.7, isTextBox: true, margin: 0, fontFace: FONT, fontSize: 13, color: INK, lineSpacing: 19 }
  );

  s.addText("HSV decay-scoring pipeline", {
    x: M, y: 4.15, w: CW, h: 0.32, isTextBox: true, margin: 0,
    fontFace: FONT, fontSize: 16, bold: true, color: BLUE,
  });

  const steps = [
    ["RGB → HSV", "Convert each image; hue is stable under lighting change."],
    ["Foreground mask", "Saturation channel separates the fruit from the background."],
    ["Decay mask", "Brown/decayed pixels detected inside the fruit region."],
    ["Decay score", "score = decayed px / fruit px × 100"],
    ["Per-fruit buckets", "Sorted per class, split into 5 equal groups."],
  ];
  const sw = (CW - 4 * 0.22) / 5;
  steps.forEach((st, i) => {
    const x = M + i * (sw + 0.22);
    card(s, { x, y: 4.62, w: sw, h: 1.85, fill: "FFFFFF" });
    badge(s, x + sw / 2 - 0.21, 4.5, i + 1);
    s.addText(st[0], {
      x: x + 0.1, y: 5.04, w: sw - 0.2, h: 0.44, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 13, bold: true, color: INK, align: "center", valign: "middle",
    });
    s.addText(st[1], {
      x: x + 0.1, y: 5.5, w: sw - 0.2, h: 0.85, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 11, color: MUTED, align: "center", lineSpacing: 14,
    });
    if (i < 4) {
      s.addShape(pres.ShapeType.rightArrow, { x: x + sw + 0.02, y: 5.45, w: 0.18, h: 0.2, fill: { color: BLUE }, line: { color: BLUE, width: 1 } });
    }
  });

  card(s, { x: M, y: 6.68, w: CW, h: 0.8, fill: TINT });
  s.addText([
    { text: "Why per-fruit buckets:  ", options: { bold: true, fontSize: 12.5, color: BLUE } },
    { text: "a rotten apple and a rotten banana brown at different rates, so a single global threshold mislabels whole classes. Each class is bucketed against its own score distribution.", options: { fontSize: 12.5, color: INK } },
  ], { x: M + 0.28, y: 6.78, w: CW - 0.56, h: 0.62, isTextBox: true, margin: 0, fontFace: FONT, lineSpacing: 18, valign: "middle" });
}

// =========================================================================
// 9 — Methodology: training
// =========================================================================
{
  const s = slide();
  title(s, "Methodology — Transfer Learning", "MobileNetV2 backbone, custom head, two-phase training");

  // Architecture column
  card(s, { x: M, y: 1.5, w: 4.15, h: 5.95, fill: TINT });
  label(s, M + 0.24, 1.66, 3.6, "Network architecture");
  const layers = [
    ["MobileNetV2 backbone", "224x224x3 input · ~2.2 M params · depthwise-separable convs, inverted residuals"],
    ["GlobalAveragePooling2D", "7x7x1280 feature map → 1280-vector"],
    ["Dense(128, ReLU)", "Task-specific representation"],
    ["Dropout(0.3)", "Regularisation against overfitting"],
    ["Dense(N, Softmax)", "N = 14 (identifier) or 5 (freshness)"],
  ];
  layers.forEach((l, i) => {
    const y = 2.1 + i * 1.06;
    card(s, { x: M + 0.24, y, w: 3.67, h: 0.86, fill: "FFFFFF" });
    s.addText(l[0], {
      x: M + 0.36, y: y + 0.08, w: 3.43, h: 0.3, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 13, bold: true, color: BLUE,
    });
    s.addText(l[1], {
      x: M + 0.36, y: y + 0.38, w: 3.43, h: 0.42, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 11, color: MUTED, lineSpacing: 14,
    });
    if (i < 4) {
      s.addShape(pres.ShapeType.downArrow, { x: M + 1.95, y: y + 0.9, w: 0.22, h: 0.14, fill: { color: BLUE }, line: { color: BLUE, width: 1 } });
    }
  });

  // Training phases
  const px = M + 4.45;
  const pw = CW - 4.45;
  card(s, { x: px, y: 1.5, w: pw, h: 2.05, fill: "FFFFFF", line: BLUE });
  badge(s, px + 0.26, 1.7, 1);
  s.addText("Phase 1 — Feature extraction", {
    x: px + 0.84, y: 1.7, w: pw - 1.1, h: 0.42, isTextBox: true, margin: 0,
    fontFace: FONT, fontSize: 15, bold: true, color: BLUE, valign: "middle",
  });
  body(s, px + 0.3, 2.28, pw - 0.6, 1.15, [
    "Entire backbone frozen — only the new head trains",
    "Adam optimiser, categorical cross-entropy, 5 epochs",
    "Freshness validation accuracy: 77.8%",
  ], { size: 12.5, gap: 6, lineSpacing: 18 });

  card(s, { x: px, y: 3.75, w: pw, h: 2.05, fill: "FFFFFF", line: GREEN });
  badge(s, px + 0.26, 3.95, 2, GREEN);
  s.addText("Phase 2 — Fine-tuning", {
    x: px + 0.84, y: 3.95, w: pw - 1.1, h: 0.42, isTextBox: true, margin: 0,
    fontFace: FONT, fontSize: 15, bold: true, color: GREEN, valign: "middle",
  });
  body(s, px + 0.3, 4.53, pw - 0.6, 1.15, [
    "Last 30 backbone layers unfrozen",
    "Learning rate dropped to 1e-5, 5 further epochs",
    "Freshness validation accuracy: 80.4%",
  ], { size: 12.5, gap: 6, lineSpacing: 18 });

  card(s, { x: px, y: 6.0, w: pw, h: 1.45, fill: TINT });
  s.addText([
    { text: "Why this order:  ", options: { bold: true, fontSize: 12.5, color: BLUE } },
    { text: "training everything from the start sends large random gradients through pretrained weights and destroys them. Early layers learn generic edges and textures that transfer as-is; only the later, task-specific layers are worth adapting.", options: { fontSize: 12.5, color: INK } },
  ], { x: px + 0.26, y: 6.14, w: pw - 0.52, h: 1.2, isTextBox: true, margin: 0, fontFace: FONT, lineSpacing: 18 });
}

// =========================================================================
// 10 — Results: accuracy + calibration
// =========================================================================
{
  const s = slide();
  title(s, "Results & Discussions", "Freshness classifier accuracy and inference-time calibration");

  // Stat callouts
  const stats = [
    ["80.4%", "Freshness validation accuracy", GREEN],
    ["+2.6 pts", "Gain from fine-tuning", BLUE],
    ["14", "Produce classes covered", AMBER],
    ["< 1 s", "Typical inference latency", BLUE],
  ];
  const sw = (CW - 3 * 0.24) / 4;
  stats.forEach((st, i) => {
    const x = M + i * (sw + 0.24);
    card(s, { x, y: 1.5, w: sw, h: 1.3, fill: "FFFFFF" });
    s.addText(st[0], {
      x: x + 0.1, y: 1.6, w: sw - 0.2, h: 0.66, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 30, bold: true, color: st[2], align: "center", valign: "middle",
    });
    s.addText(st[1], {
      x: x + 0.1, y: 2.28, w: sw - 0.2, h: 0.42, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 11, color: MUTED, align: "center", lineSpacing: 14,
    });
  });

  // Accuracy chart
  s.addChart(pres.ChartType.bar, [{
    name: "Validation accuracy (%)",
    labels: ["Phase 1\n(frozen backbone)", "Phase 2\n(fine-tuned)"],
    values: [77.8, 80.4],
  }], {
    x: M, y: 3.0, w: (CW - 0.3) / 2, h: 3.55,
    barDir: "col", chartColors: [BLUE, GREEN], barGapWidthPct: 90,
    showTitle: true, title: "Freshness classifier — validation accuracy", titleFontSize: 13,
    titleColor: INK, titleFontFace: FONT,
    showValue: true, dataLabelPosition: "outEnd", dataLabelFormatCode: '0.0"%"',
    dataLabelFontSize: 12, dataLabelFontFace: FONT, dataLabelColor: INK,
    valAxisMinVal: 70, valAxisMaxVal: 85,
    catAxisLabelColor: MUTED, valAxisLabelColor: MUTED,
    catAxisLabelFontSize: 10, valAxisLabelFontSize: 10,
    catAxisLabelFontFace: FONT, valAxisLabelFontFace: FONT,
    valGridLine: { color: "EDF1F5", size: 1 }, catGridLine: { style: "none" },
    showLegend: false,
  });

  // Calibration chart
  s.addChart(pres.ChartType.bar, [{
    name: "Calibration multiplier",
    labels: ["Slightly rotten", "Rotten", "Very rotten"],
    values: [0.3, 1.5, 2.5],
  }], {
    x: M + (CW - 0.3) / 2 + 0.3, y: 3.0, w: (CW - 0.3) / 2, h: 3.55,
    barDir: "col", chartColors: [AMBER, RED, "7A1512"], barGapWidthPct: 90,
    showTitle: true, title: "Inference-time calibration weights", titleFontSize: 13,
    titleColor: INK, titleFontFace: FONT,
    showValue: true, dataLabelPosition: "outEnd", dataLabelFormatCode: '0.0"x"',
    dataLabelFontSize: 12, dataLabelFontFace: FONT, dataLabelColor: INK,
    valAxisMinVal: 0, valAxisMaxVal: 3,
    catAxisLabelColor: MUTED, valAxisLabelColor: MUTED,
    catAxisLabelFontSize: 10, valAxisLabelFontSize: 10,
    catAxisLabelFontFace: FONT, valAxisLabelFontFace: FONT,
    valGridLine: { color: "EDF1F5", size: 1 }, catGridLine: { style: "none" },
    showLegend: false,
  });

  s.addText(
    "The raw freshness head over-predicted \"slightly rotten\" and almost never fired \"very rotten\". Rather than retrain, " +
    "the probability vector is reweighted at inference and renormalised — a practical fix that visibly improved the verdicts.",
    { x: M, y: 6.68, w: CW, h: 0.7, isTextBox: true, margin: 0, fontFace: FONT, fontSize: 12.5, color: MUTED, lineSpacing: 18 }
  );
  s.addNotes("Phase 1 to Phase 2 is a 2.6 point gain. The calibration weights multiply the three under- or over-fired classes before renormalising the distribution.");
}

// =========================================================================
// 11 — Results: the deployed application
// =========================================================================
{
  const s = slide();
  title(s, "Results — The Deployed Application", "FastAPI JSON service behind a React single-page interface");

  const imgW = 5.5;
  s.addImage({ path: path.join(SD, "ui_hero.png"), x: M, y: 1.5, w: imgW, h: imgW * 0.625 });
  s.addText("Landing view — model status, headline and coverage stats", {
    x: M, y: 4.96, w: imgW, h: 0.28, isTextBox: true, margin: 0,
    fontFace: FONT, fontSize: 11, italic: true, color: MUTED,
  });
  const imgW2 = 4.9;
  s.addImage({ path: path.join(SD, "shot_upload.png"), x: M, y: 5.3, w: imgW2, h: imgW2 * 0.4125 });
  s.addText("Analysis view — drag-and-drop upload beside the verdict panel", {
    x: M, y: 7.4, w: imgW, h: 0.28, isTextBox: true, margin: 0,
    fontFace: FONT, fontSize: 11, italic: true, color: MUTED,
  });

  const px = M + imgW + 0.35;
  const pw = CW - imgW - 0.35;
  card(s, { x: px, y: 1.5, w: pw, h: 2.55, fill: TINT });
  label(s, px + 0.2, 1.66, pw - 0.4, "REST API");
  s.addText([
    { text: "GET /api/health", options: { bold: true, fontSize: 12, color: INK, breakLine: true } },
    { text: "Model load status (503 if a model is missing)", options: { fontSize: 11, color: MUTED, breakLine: true } },
    { text: "GET /api/classes", options: { bold: true, fontSize: 12, color: INK, breakLine: true } },
    { text: "Produce and freshness label lists", options: { fontSize: 11, color: MUTED, breakLine: true } },
    { text: "POST /api/predict", options: { bold: true, fontSize: 12, color: INK, breakLine: true } },
    { text: "Image upload → full analysis JSON", options: { fontSize: 11, color: MUTED } },
  ], { x: px + 0.2, y: 2.08, w: pw - 0.4, h: 1.85, isTextBox: true, margin: 0, fontFace: FONT, lineSpacing: 17 });

  card(s, { x: px, y: 4.25, w: pw, h: 3.17, fill: "FFFFFF" });
  label(s, px + 0.2, 4.42, pw - 0.4, "What the user sees");
  body(s, px + 0.22, 4.84, pw - 0.44, 2.4, [
    "Headline verdict, e.g. \"Fresh Tomato\"",
    "Produce and freshness confidence",
    "Top-3 identification scores",
    "Full 5-level freshness distribution",
    "Estimated shelf life (5-7 days → discard)",
    "Gatekeeper's own top ImageNet label",
    "Inference latency in milliseconds",
  ], { size: 12, gap: 7, lineSpacing: 17 });

  s.addNotes("Uploads are capped at 10 MB and held in memory only — nothing is written to disk. When frontend/dist exists the backend serves the built UI itself, so the whole app runs on a single port.");
}

// =========================================================================
// 12 — Conclusion
// =========================================================================
{
  const s = slide();
  title(s, "Conclusion");

  card(s, { x: M, y: 1.45, w: CW, h: 1.5, fill: TINT });
  s.addText(
    "Fresh Vision delivers an end-to-end, browser-accessible produce quality analyser: three cooperating MobileNetV2 " +
    "models turn one photograph into an identified item, a five-level freshness grade, a confidence breakdown and a " +
    "shelf-life estimate — in under a second on commodity hardware.",
    { x: M + 0.28, y: 1.62, w: CW - 0.56, h: 1.2, isTextBox: true, margin: 0, fontFace: FONT, fontSize: 14.5, color: INK, lineSpacing: 23 }
  );

  const wins = [
    ["What worked", GREEN, GREEN_T, [
      "Transfer learning reached 80.4% validation accuracy on a small dataset",
      "HSV pseudo-labelling produced five levels with zero manual annotation",
      "The gatekeeper stops confident nonsense on out-of-distribution photos",
      "One-port deployment: the API serves the built React UI directly",
    ]],
    ["Limitations & next steps", AMBER, AMBER_T, [
      "Pseudo-labels are heuristic, not ground truth — accuracy is bounded by them",
      "Calibration multipliers are hand-tuned; class weights during retraining are the proper fix",
      "The keyword-based gatekeeper can be replaced with a trained binary produce detector",
      "Data augmentation and per-class metrics are the next accuracy levers",
    ]],
  ];
  const cw2 = (CW - 0.34) / 2;
  wins.forEach((w, i) => {
    const x = M + i * (cw2 + 0.34);
    card(s, { x, y: 3.15, w: cw2, h: 3.35, fill: w[2], line: w[1] });
    s.addShape(pres.ShapeType.ellipse, { x: x + 0.26, y: 3.35, w: 0.38, h: 0.38, fill: { color: w[1] }, line: { color: w[1], width: 1 } });
    s.addText(w[0], {
      x: x + 0.76, y: 3.35, w: cw2 - 1.0, h: 0.38, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 16, bold: true, color: w[1], valign: "middle",
    });
    body(s, x + 0.3, 3.92, cw2 - 0.6, 2.4, w[3], { size: 12.5, gap: 9, lineSpacing: 18 });
  });

  card(s, { x: M, y: 6.7, w: CW, h: 0.75, fill: "FFFFFF" });
  s.addText([
    { text: "Impact:  ", options: { bold: true, fontSize: 12.5, color: BLUE } },
    { text: "the same pipeline generalises to warehouse intake checks, retail shelf audits and cold-chain monitoring — anywhere produce is currently graded by eye.", options: { fontSize: 12.5, color: INK } },
  ], { x: M + 0.28, y: 6.8, w: CW - 0.56, h: 0.58, isTextBox: true, margin: 0, fontFace: FONT, valign: "middle", lineSpacing: 18 });
}

// =========================================================================
// 13 — Learning outcomes
// =========================================================================
{
  const s = slide();
  title(s, "Learning Outcomes");

  const outcomes = [
    ["Deep learning in practice", "Built and trained CNN classifiers with Keras — transfer learning, frozen vs. unfrozen backbones, dropout regularisation and learning-rate choice for fine-tuning.", BLUE],
    ["Working around missing labels", "Learned that data problems are often solved before modelling: classical HSV computer vision generated the five-level labels that supervised learning needed.", GREEN],
    ["Model evaluation & honesty", "Read confusion matrices and per-class precision/recall instead of a single accuracy number, and recognised a systematic class bias in the raw output.", AMBER],
    ["Designing robust ML systems", "A model in production needs guard rails — an input gatekeeper and a confidence threshold turn a fragile classifier into a system that admits when it does not know.", BLUE],
    ["Full-stack deployment", "Wrapped the models in a FastAPI service and a React + Vite frontend; handled preprocessing parity, file limits, CORS and single-port static serving.", GREEN],
    ["Engineering communication", "Documented architecture and trade-offs so the work is reproducible and explainable to a non-specialist audience.", AMBER],
  ];
  const cw2 = (CW - 0.34) / 2;
  outcomes.forEach((o, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = M + col * (cw2 + 0.34);
    const y = 1.5 + row * 2.0;
    card(s, { x, y, w: cw2, h: 1.78, fill: row % 2 === 0 ? "FFFFFF" : TINT });
    s.addShape(pres.ShapeType.ellipse, { x: x + 0.26, y: y + 0.26, w: 0.38, h: 0.38, fill: { color: o[2] }, line: { color: o[2], width: 1 } });
    s.addText(String(i + 1), {
      x: x + 0.26, y: y + 0.26, w: 0.38, h: 0.38, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 13, bold: true, color: "FFFFFF", align: "center", valign: "middle",
    });
    s.addText(o[0], {
      x: x + 0.78, y: y + 0.26, w: cw2 - 1.02, h: 0.38, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 15, bold: true, color: o[2], valign: "middle",
    });
    s.addText(o[1], {
      x: x + 0.3, y: y + 0.78, w: cw2 - 0.6, h: 0.9, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 12, color: INK, lineSpacing: 17,
    });
  });
}

// =========================================================================
// 14 — References
// =========================================================================
{
  const s = slide();
  title(s, "References");

  const refs = [
    ["Sandler, M., Howard, A., Zhu, M., Zhmoginov, A., Chen, L.-C. (2018).", "MobileNetV2: Inverted Residuals and Linear Bottlenecks. IEEE/CVF CVPR, pp. 4510-4520."],
    ["Deng, J., Dong, W., Socher, R., Li, L.-J., Li, K., Fei-Fei, L. (2009).", "ImageNet: A Large-Scale Hierarchical Image Database. IEEE CVPR."],
    ["Pan, S. J., Yang, Q. (2010).", "A Survey on Transfer Learning. IEEE Transactions on Knowledge and Data Engineering, 22(10), 1345-1359."],
    ["TensorFlow / Keras documentation.", "Transfer learning and fine-tuning — tensorflow.org/tutorials/images/transfer_learning"],
    ["FastAPI documentation.", "Modern high-performance Python web framework — fastapi.tiangolo.com"],
    ["React and Vite documentation.", "react.dev  ·  vite.dev"],
    ["Fresh and Rotten Fruits/Vegetables image dataset.", "Public image dataset unified into 14 produce classes with fresh/rotten subfolders."],
  ];
  refs.forEach((r, i) => {
    const y = 1.5 + i * 0.86;
    card(s, { x: M, y, w: CW, h: 0.74, fill: i % 2 === 0 ? TINT : "FFFFFF" });
    s.addText(String(i + 1) + ".", {
      x: M + 0.2, y, w: 0.34, h: 0.74, isTextBox: true, margin: 0,
      fontFace: FONT, fontSize: 13.5, bold: true, color: BLUE, valign: "middle",
    });
    s.addText([
      { text: r[0] + "  ", options: { bold: true, fontSize: 12.5, color: INK } },
      { text: r[1], options: { fontSize: 12.5, color: MUTED } },
    ], { x: M + 0.6, y, w: CW - 0.8, h: 0.74, isTextBox: true, margin: 0, fontFace: FONT, valign: "middle", lineSpacing: 17 });
  });
}

pres.writeFile({ fileName: OUT }).then(() => console.log("wrote", OUT));
