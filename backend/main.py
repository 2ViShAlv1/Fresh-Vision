"""FastAPI backend for Fresh Vision.

Serves the two Keras models (produce identifier + freshness classifier) plus the
MobileNetV2 ImageNet gatekeeper behind a small JSON API consumed by the React UI.
"""
import base64
import io
import json
import os
import time
from contextlib import asynccontextmanager

import numpy as np
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from PIL import Image

os.environ.setdefault("TF_CPP_MIN_LOG_LEVEL", "2")

from tensorflow.keras.applications import MobileNetV2 as GatekeeperModel
from tensorflow.keras.applications.mobilenet_v2 import decode_predictions, preprocess_input
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image as keras_image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IDENTIFIER_PATH = os.path.join(ROOT, "fruit_veg_identifier.h5")
FRESHNESS_PATH = os.path.join(ROOT, "freshness_classifier_v2.h5")
CLASS_INDICES_PATH = os.path.join(ROOT, "class_indices.json")

FRESHNESS_CLASS_NAMES = {
    0: "fresh",
    1: "rotten",
    2: "slightly_rotten",
    3: "very_fresh",
    4: "very_rotten",
}

# Same calibration weights as the original Streamlit app: the freshness head is
# biased towards 'slightly_rotten' and almost never fires 'very_rotten'.
CALIBRATION = {2: 0.3, 1: 1.5, 4: 2.5}

CONFIDENCE_THRESHOLD = 65.0
GATEKEEPER_THRESHOLD = 20.0

FOOD_KEYWORDS = [
    "apple", "orange", "lemon", "strawberry", "pineapple", "banana", "fig",
    "jackfruit", "custard", "pomegranate", "squash", "pepper", "cucumber",
    "mushroom", "granny smith", "corn", "cabbage", "broccoli", "cauliflower",
    "zucchini", "artichoke", "cardoon", "pot", "flower", "plant", "food",
    "fruit", "vegetable", "grocery", "produce", "dish", "plate",
]

# Rough shelf-life guidance (days) surfaced in the UI per freshness verdict.
SHELF_LIFE = {
    "very_fresh": "5-7 days",
    "fresh": "3-5 days",
    "slightly_rotten": "1-2 days",
    "rotten": "Discard",
    "very_rotten": "Discard",
}

MODELS = {}

@asynccontextmanager
async def lifespan(_: FastAPI):
    try:
        get_models()
        print("[Fresh Vision] Models loaded.")
    except Exception as exc:  # surfaced through /api/health
        print(f"[Fresh Vision] Model load failed: {exc}")
    yield


app = FastAPI(title="Fresh Vision API", version="1.0.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_models():
    if MODELS:
        return MODELS
    for path in (IDENTIFIER_PATH, FRESHNESS_PATH, CLASS_INDICES_PATH):
        if not os.path.exists(path):
            raise FileNotFoundError(f"Required file '{os.path.basename(path)}' not found.")

    with open(CLASS_INDICES_PATH, "r") as f:
        class_indices = json.load(f)

    MODELS["identifier"] = load_model(IDENTIFIER_PATH)
    MODELS["freshness"] = load_model(FRESHNESS_PATH)
    MODELS["gatekeeper"] = GatekeeperModel(weights="imagenet")
    MODELS["class_names"] = {v: k for k, v in class_indices.items()}
    return MODELS


def prettify(name: str) -> str:
    return name.replace("-", " ").replace("_", " ").title()


def to_tensor(img: Image.Image) -> np.ndarray:
    if img.mode != "RGB":
        img = img.convert("RGB")
    arr = keras_image.img_to_array(img.resize((224, 224)))
    return preprocess_input(np.expand_dims(arr, axis=0))


def analyze(img: Image.Image) -> dict:
    m = get_models()
    tensor = to_tensor(img)

    # --- Gatekeeper: is this produce at all? ---
    decoded = decode_predictions(m["gatekeeper"].predict(tensor, verbose=0), top=5)[0]
    is_food = any(
        any(kw in name.lower() for kw in FOOD_KEYWORDS) for _, name, _ in decoded
    )
    top_gatekeeper = prettify(decoded[0][1])
    gatekeeper_conf = float(decoded[0][2]) * 100

    # --- Produce identity ---
    preds = m["identifier"].predict(tensor, verbose=0)[0]
    order = np.argsort(preds)[::-1]
    top_produce = [
        {"label": prettify(m["class_names"][int(i)]), "confidence": round(float(preds[i]) * 100, 2)}
        for i in order[:3]
    ]
    produce_index = int(order[0])
    produce_conf = float(preds[produce_index]) * 100
    produce_label = m["class_names"][produce_index]

    # --- Freshness (calibrated) ---
    raw = m["freshness"].predict(tensor, verbose=0)[0]
    calibrated = np.copy(raw).astype(np.float64)
    for idx, weight in CALIBRATION.items():
        calibrated[idx] *= weight
    calibrated = calibrated / np.sum(calibrated)

    fresh_index = int(np.argmax(calibrated))
    fresh_key = FRESHNESS_CLASS_NAMES[fresh_index]
    fresh_conf = float(calibrated[fresh_index]) * 100
    freshness_breakdown = [
        {"label": prettify(FRESHNESS_CLASS_NAMES[i]), "key": FRESHNESS_CLASS_NAMES[i],
         "confidence": round(float(calibrated[i]) * 100, 2)}
        for i in np.argsort(calibrated)[::-1]
    ]

    if not is_food and gatekeeper_conf > GATEKEEPER_THRESHOLD:
        return {
            "status": "rejected",
            "headline": f"Not a Fruit or Vegetable",
            "detail": f"This looks like {top_gatekeeper}. Please upload a fruit or vegetable.",
            "produce": None,
            "freshness": None,
            "produceConfidence": round(gatekeeper_conf, 2),
            "freshnessConfidence": 0.0,
            "topProduce": [],
            "freshnessBreakdown": [],
            "gatekeeper": {"label": top_gatekeeper, "confidence": round(gatekeeper_conf, 2)},
            "shelfLife": None,
        }

    if produce_conf < CONFIDENCE_THRESHOLD:
        return {
            "status": "uncertain",
            "headline": "Unclear Image",
            "detail": f"Only {produce_conf:.2f}% confident. Try a clearer, well-lit photo.",
            "produce": None,
            "freshness": None,
            "produceConfidence": round(produce_conf, 2),
            "freshnessConfidence": round(fresh_conf, 2),
            "topProduce": top_produce,
            "freshnessBreakdown": freshness_breakdown,
            "gatekeeper": {"label": top_gatekeeper, "confidence": round(gatekeeper_conf, 2)},
            "shelfLife": None,
        }

    return {
        "status": "ok",
        "headline": f"{prettify(fresh_key)} {prettify(produce_label)}",
        "detail": None,
        "produce": prettify(produce_label),
        "freshness": prettify(fresh_key),
        "freshnessKey": fresh_key,
        "produceConfidence": round(produce_conf, 2),
        "freshnessConfidence": round(fresh_conf, 2),
        "topProduce": top_produce,
        "freshnessBreakdown": freshness_breakdown,
        "gatekeeper": {"label": top_gatekeeper, "confidence": round(gatekeeper_conf, 2)},
        "shelfLife": SHELF_LIFE[fresh_key],
    }


@app.get("/api/health")
def health():
    try:
        get_models()
        return {"status": "ready", "models": ["identifier", "freshness", "gatekeeper"]}
    except Exception as exc:
        return JSONResponse(status_code=503, content={"status": "error", "message": str(exc)})


@app.get("/api/classes")
def classes():
    m = get_models()
    return {
        "produce": [prettify(v) for _, v in sorted(m["class_names"].items())],
        "freshness": [prettify(v) for _, v in sorted(FRESHNESS_CLASS_NAMES.items())],
    }


@app.post("/api/predict")
async def predict(file: UploadFile = File(...)):
    raw = await file.read()
    if not raw:
        raise HTTPException(status_code=400, detail="Empty file upload.")
    if len(raw) > 10 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Image too large (max 10 MB).")
    try:
        img = Image.open(io.BytesIO(raw))
        img.load()
    except Exception:
        raise HTTPException(status_code=400, detail="Unsupported or corrupt image file.")

    started = time.perf_counter()
    try:
        result = analyze(img)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=503, detail=str(exc))
    result["latencyMs"] = round((time.perf_counter() - started) * 1000, 1)

    # Echo a normalised thumbnail so the client always renders what the model saw.
    thumb = img.convert("RGB")
    thumb.thumbnail((640, 640))
    buf = io.BytesIO()
    thumb.save(buf, format="JPEG", quality=88)
    result["preview"] = "data:image/jpeg;base64," + base64.b64encode(buf.getvalue()).decode()
    result["filename"] = file.filename
    return result


# ---------------------------------------------------------------------------
# Serve the production React build (frontend/dist) when it has been built, so
# `uvicorn backend.main:app` alone can host the whole app. In development the
# Vite dev server proxies /api here instead.
# ---------------------------------------------------------------------------
DIST = os.path.join(ROOT, "frontend", "dist")

if os.path.isdir(DIST):
    app.mount("/assets", StaticFiles(directory=os.path.join(DIST, "assets")), name="assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    def spa(full_path: str):
        candidate = os.path.join(DIST, full_path)
        if full_path and os.path.isfile(candidate):
            return FileResponse(candidate)
        return FileResponse(os.path.join(DIST, "index.html"))
