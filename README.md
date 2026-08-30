# Fresh Vision 🍏🔍
**AI-Powered Fruit & Vegetable Quality Analyzer**

Fresh Vision identifies fruits and vegetables from a photo and grades their freshness, using a
three-model pipeline built on MobileNetV2. It ships as a **FastAPI** JSON backend and a
**React (Vite)** single-page frontend.

## Features 🚀
- **Identification** — 14 produce classes (apple, banana, bellpepper, carrot, cucumber, grape,
  guava, jujube, mango, orange, pomegranate, potato, strawberry, tomato).
- **Freshness grading** — five decay levels with calibrated probabilities and an estimated shelf life.
- **Gatekeeper model** — a pretrained ImageNet MobileNetV2 rejects non-produce images before they
  can be misclassified.
- **Explainable output** — top-3 identification scores, the full freshness distribution and
  inference latency are all surfaced in the UI.
- **Modern frontend** — responsive dark UI, drag-and-drop/paste upload, animated result panel.

## Architecture 🧠

```
image ──▶ preprocess (224×224, MobileNetV2 norm)
            ├─▶ ImageNet gatekeeper   → reject non-produce
            ├─▶ fruit_veg_identifier  → 14-class produce label
            └─▶ freshness_classifier  → 5-level decay, calibrated
```

Calibration multipliers (`slightly_rotten ×0.3`, `rotten ×1.5`, `very_rotten ×2.5`) correct the
training-set bias of the freshness head before the distribution is renormalised.

| Path | What it is |
| --- | --- |
| `backend/main.py` | FastAPI app — `/api/health`, `/api/classes`, `/api/predict` |
| `frontend/` | React + Vite single-page UI |
| `app.py` | Original Streamlit prototype (kept for reference) |
| `*.h5`, `class_indices.json` | Trained models and label mapping |

## Run it 💻

### Quick start
```bash
./run.sh
```
Starts the API on `http://127.0.0.1:8010` and the UI on `http://localhost:5180`.

### Manual
```bash
# 1. Python deps
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt

# 2. Backend  (http://127.0.0.1:8010)
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8010 --reload

# 3. Frontend (http://localhost:5180) — proxies /api to the backend
cd frontend && npm install && npm run dev
```

### Single-process production build
```bash
cd frontend && npm run build && cd ..
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8010
```
When `frontend/dist` exists the backend serves the built UI itself, so the whole app runs on one
port. Point the frontend at a different API host with `VITE_API_BASE` at build time.

## API 📡

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/health` | Model load status (`503` if a model file is missing) |
| `GET` | `/api/classes` | Produce and freshness label lists |
| `POST` | `/api/predict` | `multipart/form-data` field `file` — returns the analysis JSON |

`POST /api/predict` responds with `status` (`ok` / `uncertain` / `rejected`), the headline verdict,
produce and freshness labels with confidences, the full freshness distribution, the gatekeeper's
own top label, estimated shelf life, latency and a normalised preview thumbnail.

Uploads are capped at 10 MB and are held in memory only — nothing is written to disk.

## Technologies Used 🛠️
Python · FastAPI · Uvicorn · TensorFlow/Keras (MobileNetV2) · Pillow · NumPy · React 19 · Vite
