import React from "react";
import ReactDOMServer from "react-dom/server";
import * as Lu from "react-icons/lu";
import sharp from "sharp";
import fs from "fs";
import path from "path";

const OUT = path.join(process.cwd(), "icons");
fs.mkdirSync(OUT, { recursive: true });

const WANTED = [
  "LuLeaf", "LuScanEye", "LuGauge", "LuTags", "LuShieldCheck", "LuEye", "LuServer",
  "LuUsers", "LuScale", "LuToggleLeft", "LuBrainCircuit", "LuDatabase", "LuChartColumn",
  "LuLayers", "LuMonitor", "LuMessageSquare", "LuCheck", "LuTriangleAlert", "LuBookOpen",
  "LuCalendarDays", "LuBuilding2", "LuTarget", "LuCpu", "LuImage", "LuFilter", "LuSparkles",
  "LuCircleAlert", "LuCircleCheck", "LuCircleX", "LuTimer", "LuBoxes", "LuGitBranch",
  "LuSlidersHorizontal", "LuFlaskConical", "LuThermometerSun", "LuPackageSearch",
];

const missing = WANTED.filter((n) => !Lu[n]);
if (missing.length) console.log("MISSING:", missing.join(", "));

for (const name of WANTED) {
  const Icon = Lu[name];
  if (!Icon) continue;
  const svg = ReactDOMServer.renderToStaticMarkup(
    React.createElement(Icon, { color: "#FFFFFF", size: 512, strokeWidth: 1.9 })
  );
  const buf = await sharp(Buffer.from(svg)).resize(512, 512).png().toBuffer();
  fs.writeFileSync(path.join(OUT, name + ".png"), buf);
}
console.log("rendered", WANTED.filter((n) => Lu[n]).length, "icons");
