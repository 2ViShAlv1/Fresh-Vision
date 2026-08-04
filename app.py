import streamlit as st
import numpy as np
from tensorflow.keras.preprocessing import image
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input, decode_predictions
from tensorflow.keras.applications import MobileNetV2 as GatekeeperModel
from tensorflow.keras.models import load_model
import json
from PIL import Image
import os

# Config
st.set_page_config(page_title="Fruit & Veggie Classifier", page_icon="🍏", layout="centered")
# Custom CSS for rich aesthetics
st.markdown("""
<style>
    .main {
        background-color: #121212;
        color: #ffffff;
    }
    .stApp {
        background-color: #1e1e1e;
        color: #e0e0e0;
    }
    .title-text {
        font-family: 'Outfit', sans-serif;
        background: linear-gradient(90deg, #4CAF50, #8BC34A);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        text-align: center;
        font-size: 3.5rem;
        font-weight: 800;
        margin-bottom: 0px;
    }
    .subtitle-text {
        font-family: 'Inter', sans-serif;
        color: #A0A0A0;
        text-align: center;
        font-size: 1.2rem;
        margin-bottom: 40px;
    }
    .prediction-box {
        background: linear-gradient(145deg, #2a2a2a, #1a1a1a);
        border-radius: 20px;
        padding: 30px;
        margin-top: 30px;
        text-align: center;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        border: 1px solid #333;
    }
    .prediction-class {
        font-size: 3rem;
        font-weight: 800;
        color: #4CAF50;
        margin: 15px 0;
        text-shadow: 0 0 10px rgba(76, 175, 80, 0.3);
    }
    .prediction-confidence {
        font-size: 1.2rem;
        color: #888;
        letter-spacing: 1px;
    }
    .stImage > img {
        border-radius: 20px;
        box-shadow: 0 10px 20px rgba(0,0,0,0.4);
    }
</style>
""", unsafe_allow_html=True)

st.markdown('<p class="title-text">Fresh or Rotten?</p>', unsafe_allow_html=True)
st.markdown('<p class="subtitle-text">AI-Powered Fruit & Vegetable Quality Analyzer</p>', unsafe_allow_html=True)

# Load Model & Classes
@st.cache_resource
def load_models_and_classes():
    model_path = 'fruit_veg_identifier.h5'
    freshness_model_path = 'freshness_classifier_v2.h5'
    class_indices_path = 'class_indices.json'
    
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model file '{model_path}' not found.")
    if not os.path.exists(freshness_model_path):
        raise FileNotFoundError(f"Model file '{freshness_model_path}' not found.")
    if not os.path.exists(class_indices_path):
        raise FileNotFoundError(f"Class indices file '{class_indices_path}' not found.")
        
    model = load_model(model_path)
    freshness_model = load_model(freshness_model_path)
    gatekeeper = GatekeeperModel(weights='imagenet')
    
    with open(class_indices_path, 'r') as f:
        class_indices = json.load(f)
    class_names = {v: k for k, v in class_indices.items()}
    freshness_class_names = {0: 'fresh', 1: 'rotten', 2: 'slightly_rotten', 3: 'very_fresh', 4: 'very_rotten'}
    return model, freshness_model, gatekeeper, class_names, freshness_class_names

try:
    model, freshness_model, gatekeeper, class_names, freshness_class_names = load_models_and_classes()
except Exception as e:
    st.error(f"⚠️ Error loading model or class indices: {e}")
    st.info("Make sure you have run the notebook to generate `fruit_veg_identifier.h5`, `freshness_classifier_v2.h5`, and `class_indices.json`.")
    st.stop()

def predict_image(img, model, freshness_model, gatekeeper, class_names, freshness_class_names):
    # Convert PIL Image to RGB (if not already)
    if img.mode != "RGB":
        img = img.convert("RGB")
        
    # Resize to 224x224 for MobileNetV2
    img_resized = img.resize((224, 224))
    
    # Convert to array
    img_array = image.img_to_array(img_resized)
    img_array = np.expand_dims(img_array, axis=0)
    
    # Preprocess
    img_array = preprocess_input(img_array)
    
    # Predict Custom Model
    predictions = model.predict(img_array)
    predicted_index = np.argmax(predictions[0])
    confidence = predictions[0][predicted_index] * 100
    predicted_class = class_names[predicted_index]
    
    # Predict Freshness
    raw_freshness_preds = freshness_model.predict(img_array)[0]
    
    # freshness_class_names = {0: 'fresh', 1: 'rotten', 2: 'slightly_rotten', 3: 'very_fresh', 4: 'very_rotten'}
    # The model has a heavy bias towards 'slightly_rotten' and rarely predicts 'very_rotten'.
    # We apply a penalty to slightly_rotten and boost very_rotten/rotten to calibrate the probabilities.
    
    calibrated_preds = np.copy(raw_freshness_preds)
    
    calibrated_preds[2] *= 0.3  # Heavily penalize slightly_rotten
    calibrated_preds[1] *= 1.5  # Boost rotten
    calibrated_preds[4] *= 2.5  # Heavily boost very_rotten
    
    # Re-normalize so they sum up to 1
    calibrated_preds = calibrated_preds / np.sum(calibrated_preds)
    
    freshness_index = np.argmax(calibrated_preds)
    predicted_freshness = {0: 'fresh', 1: 'rotten', 2: 'slightly_rotten', 3: 'very_fresh', 4: 'very_rotten'}[freshness_index]
    
    # Use the calibrated confidence
    freshness_confidence = calibrated_preds[freshness_index] * 100
    
    # Format class name beautifully (e.g., from 'apple' + 'very_fresh' to 'Very Fresh Apple')
    fruit_name = predicted_class.replace('-', ' ').replace('_', ' ').title()
    freshness_name = predicted_freshness.replace('_', ' ').title()
    formatted_class = f"{freshness_name} {fruit_name}"
    
    # GATEKEEPER CHECK: See if ImageNet thinks this is an animal or random object
    gatekeeper_preds = gatekeeper.predict(img_array)
    decoded_gatekeeper = decode_predictions(gatekeeper_preds, top=5)[0]
    top_gatekeeper_class = decoded_gatekeeper[0][1].replace('_', ' ').title()
    gatekeeper_conf = decoded_gatekeeper[0][2] * 100
    
    # Define some broad food/plant keywords
    food_keywords = ['apple', 'orange', 'lemon', 'strawberry', 'pineapple', 'banana', 'fig', 'jackfruit', 'custard', 'pomegranate', 'squash', 'pepper', 'cucumber', 'mushroom', 'granny smith', 'corn', 'cabbage', 'broccoli', 'cauliflower', 'zucchini', 'artichoke', 'cardoon', 'pot', 'flower', 'plant', 'food', 'fruit', 'vegetable', 'grocery', 'produce', 'dish', 'plate']
    
    # Check if any of the top 5 predictions from the gatekeeper match our food keywords
    is_food = False
    for _, name, _ in decoded_gatekeeper:
        if any(kw in name.lower() for kw in food_keywords):
            is_food = True
            break
            
    # If it's definitely not a food and the gatekeeper is somewhat confident about it
    if not is_food and gatekeeper_conf > 20.0:
        return f"Not a Fruit/Veggie (Looks like {top_gatekeeper_class})", gatekeeper_conf, 0.0, True
    
    return formatted_class, confidence, freshness_confidence, False

# Upload Section
uploaded_file = st.file_uploader("Upload an image of a fruit or vegetable", type=["jpg", "jpeg", "png", "webp"])

if uploaded_file is not None:
    # Display the uploaded image
    col1, col2, col3 = st.columns([1, 2, 1])
    with col2:
        img = Image.open(uploaded_file)
        st.image(img, use_container_width=True)
    
    with st.spinner('Analyzing the image using AI...'):
        predicted_class, confidence, freshness_confidence, is_ood = predict_image(img, model, freshness_model, gatekeeper, class_names, freshness_class_names)
        
    # Determine result based on confidence or Gatekeeper OOD detection
    if is_ood:
        color = "#FF9800"  # Orange for out of distribution
        confidence_text = f"ImageNet Detection ({confidence:.2f}%) - Please upload a fruit or vegetable."
    elif confidence < 65.0:  # Threshold for low confidence
        predicted_class = "Unknown / Not a Fruit or Veggie"
        color = "#FF9800"  # Orange for unknown
        confidence_text = f"Low Confidence ({confidence:.2f}%) - Please upload a clearer image."
    else:
        # Determine color based on whether it might be rotten
        if "rotten" in predicted_class.lower():
            if "slightly" in predicted_class.lower():
                color = "#FFC107"  # Amber for slightly rotten
            else:
                color = "#FF5252"  # Red for rotten/very rotten
        else:
            color = "#4CAF50" # Green for fresh/very fresh
        confidence_text = f"Fruit Confidence: <strong>{confidence:.2f}%</strong> | Condition Confidence: <strong>{freshness_confidence:.2f}%</strong>"
        
    # Display Result
    st.markdown(f"""
    <div class="prediction-box">
        <div style="color: #A0A0A0; font-size: 1.1rem; text-transform: uppercase; letter-spacing: 2px;">AI Analysis Result</div>
        <div class="prediction-class" style="color: {color}; text-shadow: 0 0 10px {color}40;">{predicted_class}</div>
        <div class="prediction-confidence">{confidence_text}</div>
    </div>
    """, unsafe_allow_html=True)
