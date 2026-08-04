import os
import shutil
import numpy as np
import pandas as pd
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
import time
from pathlib import Path

# Paths
SOURCE_DIR = "/home/vank/Data/Unified_Dataset"
TARGET_DIR = "/home/vank/Data/Classified_Dataset"
MODEL_PATH = "/home/vank/Final_Project/freshness_classifier_v2.h5"

# 5 Target Classes
CLASSES = [
    "1_Fresh",
    "2_Slightly_Rotten",
    "3_Moderately_Rotten",
    "4_Severely_Rotten",
    "5_Fully_Rotten"
]

def setup_directories():
    if os.path.exists(TARGET_DIR):
        print(f"Directory {TARGET_DIR} already exists, clearing it...")
        shutil.rmtree(TARGET_DIR)
    
    os.makedirs(TARGET_DIR)
    for c in CLASSES:
        os.makedirs(os.path.join(TARGET_DIR, c))
    print(f"Created target directories in {TARGET_DIR}")

def map_predictions_to_classes(preds):
    """
    Model classes: {0: 'fresh', 1: 'rotten', 2: 'slightly_rotten', 3: 'very_fresh', 4: 'very_rotten'}
    We map these to a continuous score 1-5 to bucket them into the user's 5 classes.
    """
    # Weights for each class based on how "rotten" they are
    # 3: very_fresh -> 1.0 (Fresh)
    # 0: fresh -> 1.5 (Still mostly fresh)
    # 2: slightly_rotten -> 2.5 
    # 1: rotten -> 3.5
    # 4: very_rotten -> 4.5
    
    # preds shape is (batch_size, 5)
    weights = np.array([1.5, 3.5, 2.5, 1.0, 4.5]) # ordered by index 0, 1, 2, 3, 4
    
    # Calculate a weighted continuous score for each image
    scores = np.sum(preds * weights, axis=1)
    
    # Map score to the 5 buckets
    assigned_classes = []
    for score in scores:
        if score < 1.8:
            assigned_classes.append("1_Fresh")
        elif score < 2.6:
            assigned_classes.append("2_Slightly_Rotten")
        elif score < 3.4:
            assigned_classes.append("3_Moderately_Rotten")
        elif score < 4.2:
            assigned_classes.append("4_Severely_Rotten")
        else:
            assigned_classes.append("5_Fully_Rotten")
            
    return assigned_classes

def main():
    print("Setting up directories...")
    setup_directories()
    
    print("Loading model...")
    model = load_model(MODEL_PATH)
    print("Model loaded successfully.")
    
    # Get list of all images
    print("Scanning images...")
    filepaths = []
    for root, _, files in os.walk(SOURCE_DIR):
        for file in files:
            if file.lower().endswith(('.png', '.jpg', '.jpeg')):
                filepaths.append(os.path.join(root, file))
                
    if not filepaths:
        print("No images found in the dataset folder.")
        return
        
    print(f"Found {len(filepaths)} images to process.")
    
    # Create DataFrame for ImageDataGenerator
    df = pd.DataFrame({"filename": filepaths})
    
    # Use ImageDataGenerator for efficient batching
    datagen = ImageDataGenerator(preprocessing_function=preprocess_input)
    
    batch_size = 128
    generator = datagen.flow_from_dataframe(
        dataframe=df,
        x_col="filename",
        y_col=None,
        target_size=(224, 224),
        batch_size=batch_size,
        class_mode=None,
        shuffle=False
    )
    
    print("Starting prediction...")
    start_time = time.time()
    
    # Predict in batches
    preds = model.predict(generator, verbose=1)
    
    print(f"Prediction finished in {time.time() - start_time:.2f} seconds.")
    
    # Map predictions to 5 classes
    print("Mapping to user-defined classes...")
    assigned_classes = map_predictions_to_classes(preds)
    
    # Confidence is just the max probability for logging purposes
    confidences = np.max(preds, axis=1) * 100
    
    # Copy files and log results
    print("Copying files to their respective folders...")
    results = []
    
    # To handle duplicate filenames, we'll append a unique ID if needed
    for i, (filepath, assigned_class, conf) in enumerate(zip(filepaths, assigned_classes, confidences)):
        filename = os.path.basename(filepath)
        dest_path = os.path.join(TARGET_DIR, assigned_class, filename)
        
        # Ensure unique filename in destination
        if os.path.exists(dest_path):
            name, ext = os.path.splitext(filename)
            dest_path = os.path.join(TARGET_DIR, assigned_class, f"{name}_{i}{ext}")
            
        shutil.copy2(filepath, dest_path)
        
        results.append({
            "original_path": filepath,
            "filename": os.path.basename(dest_path),
            "assigned_class": assigned_class,
            "confidence": f"{conf:.2f}%"
        })
        
        if (i + 1) % 5000 == 0:
            print(f"Processed {i + 1}/{len(filepaths)} images...")
            
    # Save CSV summary
    print("Generating summary report...")
    results_df = pd.DataFrame(results)
    csv_path = os.path.join(TARGET_DIR, "classification_report.csv")
    results_df.to_csv(csv_path, index=False)
    
    # Print Summary
    print("\n" + "="*40)
    print("CLASSIFICATION SUMMARY")
    print("="*40)
    print(f"Total images processed: {len(results_df)}")
    print("\nCount per class:")
    print(results_df["assigned_class"].value_counts().to_string())
    print(f"\nSummary report saved to: {csv_path}")
    print("="*40)

if __name__ == "__main__":
    main()
