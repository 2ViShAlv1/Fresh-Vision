# Practice School-II presentation

21 slides, A4 landscape, following the PS-II template's section order.

| File | What it is |
| --- | --- |
| `Fresh_Vision_PSII_Presentation.pptx` | The deck |
| `Fresh_Vision_PSII_Presentation.pdf` | PDF export for quick viewing |
| `build_deck.js` | pptxgenjs generator — edit and re-run to regenerate the deck |
| `assets/` | Backgrounds, UI screenshots and the rendered icon set |
| `assets/render_icons.mjs` | Re-renders the Lucide icon PNGs from `react-icons` |

Regenerate:

```bash
npm install pptxgenjs
node presentation/build_deck.js
```

## Design

Forest green primary with the decay ramp (green → amber → red) used consistently
wherever freshness appears; ink-dark title, section-divider and conclusion slides
between white content slides; Arial throughout; icons in filled circles as the
repeating motif.

## Still to fill in

Slide 1 and the closing slide (name, ID, mentors, date), the station form
(company, department, faculty mentor) and the start/end dates on the visit
summary are left blank for the student to complete.
