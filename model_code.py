import os

# apna dataset ka path yahan daal (jahan images hain)
dataset_path = "/home/vank/Final_Project/Unified_Dataset"   # agar different path hai to change kar dena

# top-level folders dekhte hain
print("Folders inside dataset:")
for folder in os.listdir(dataset_path):
    print(folder)

import os

dataset_path = "/home/vank/Final_Project/Unified_Dataset"

# har fruit/vegetable folder ke andar total images count karenge
for fruit_folder in sorted(os.listdir(dataset_path)):
    fruit_path = os.path.join(dataset_path, fruit_folder)
    
    if os.path.isdir(fruit_path):
        total_images = 0
        
        # iske andar fresh aur rotten subfolders honge
        for sub_folder in os.listdir(fruit_path):
            sub_path = os.path.join(fruit_path, sub_folder)
            if os.path.isdir(sub_path):
                num_images = len(os.listdir(sub_path))
                total_images += num_images
                print(f"{fruit_folder}/{sub_folder} -> {num_images} images")
        
        print(f"TOTAL for {fruit_folder}: {total_images} images")
        print("-" * 40)

import os
import pandas as pd

dataset_path = "/home/vank/Final_Project/Unified_Dataset"

filepaths = []   # yaha har image ka full path store hoga
labels = []      # yaha uska corresponding fruit/vegetable naam store hoga

# outer loop -> fruit/vegetable folder (apple, banana, etc.)
for fruit_folder in sorted(os.listdir(dataset_path)):
    fruit_path = os.path.join(dataset_path, fruit_folder)
    
    if os.path.isdir(fruit_path):
        
        # inner loop -> fresh aur rotten dono ke andar jayenge
        for sub_folder in os.listdir(fruit_path):
            sub_path = os.path.join(fruit_path, sub_folder)
            
            if os.path.isdir(sub_path):
                
                # is sub_folder (fresh/rotten) ke andar sab images le lo
                for img_name in os.listdir(sub_path):
                    img_path = os.path.join(sub_path, img_name)
                    
                    filepaths.append(img_path)
                    labels.append(fruit_folder)   # label sirf fruit ka naam hai, fresh/rotten nahi

# ab ek dataframe banate hain isse
data = pd.DataFrame({
    "filepath": filepaths,
    "label": labels
})

print("Total images:", len(data))
print("\nClass distribution:\n", data["label"].value_counts())
print("\nSample rows:\n", data.head())

from sklearn.model_selection import train_test_split

# 80% training, 20% validation
train_data, val_data = train_test_split(
    data,
    test_size=0.2,
    stratify=data["label"],   # taaki class proportion train/val dono me same rahe
    random_state=42           # taaki result reproducible rahe
)

print("Training images:", len(train_data))
print("Validation images:", len(val_data))

print("\nTraining class distribution:\n", train_data["label"].value_counts())

from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input

# MobileNetV2 ka apna preprocessing function hota hai, wahi use karenge
train_datagen = ImageDataGenerator(preprocessing_function=preprocess_input)
val_datagen = ImageDataGenerator(preprocessing_function=preprocess_input)

img_size = 224      # MobileNetV2 ka standard input size
batch_size = 32      # ek baar me 32 images model ko denge

train_generator = train_datagen.flow_from_dataframe(
    dataframe=train_data,
    x_col="filepath",       # column jisme image ka path hai
    y_col="label",          # column jisme fruit ka naam hai
    target_size=(img_size, img_size),
    batch_size=batch_size,
    class_mode="categorical",   # multi-class classification hai
    shuffle=True
)

val_generator = val_datagen.flow_from_dataframe(
    dataframe=val_data,
    x_col="filepath",
    y_col="label",
    target_size=(img_size, img_size),
    batch_size=batch_size,
    class_mode="categorical",
    shuffle=False    # validation me shuffle nahi karte, easy evaluation ke liye
)

# class labels aur unke index dekh lete hain
print("Class indices:", train_generator.class_indices)

from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.layers import GlobalAveragePooling2D, Dense, Dropout
from tensorflow.keras.models import Model

# pretrained MobileNetV2 load karo, bina top layer ke
base_model = MobileNetV2(
    input_shape=(img_size, img_size, 3),
    include_top=False,        # apna khud ka classifier lagayenge, isliye original wala nahi chahiye
    weights="imagenet"        # pretrained weights (already millions images pe trained)
)

# base model ke layers freeze karo, taaki training ke time inke weights change na ho
base_model.trainable = False

# ab base model ke upar apna classification head banate hain
x = base_model.output
x = GlobalAveragePooling2D()(x)     # feature maps ko ek flat vector me convert karta hai
x = Dense(128, activation="relu")(x)
x = Dropout(0.3)(x)                 # overfitting rokne ke liye
output = Dense(14, activation="softmax")(x)   # 14 classes, softmax multi-class ke liye

model = Model(inputs=base_model.input, outputs=output)

# model ka summary dekhte hain
model.summary()

model.compile(
    optimizer="adam",                    # sabse common optimizer, achi tarah kaam karta hai
    loss="categorical_crossentropy",     # multi-class classification ke liye standard loss
    metrics=["accuracy"]
)

print("Model compiled successfully!")



history = model.fit(
    train_generator,
    validation_data=val_generator,
    epochs=5
)

import matplotlib.pyplot as plt

# accuracy plot
plt.figure(figsize=(12, 4))

plt.subplot(1, 2, 1)
plt.plot(history.history['accuracy'], label='Train Accuracy')
plt.plot(history.history['val_accuracy'], label='Validation Accuracy')
plt.xlabel('Epoch')
plt.ylabel('Accuracy')
plt.title('Training vs Validation Accuracy')
plt.legend()

# loss plot
plt.subplot(1, 2, 2)
plt.plot(history.history['loss'], label='Train Loss')
plt.plot(history.history['val_loss'], label='Validation Loss')
plt.xlabel('Epoch')
plt.ylabel('Loss')
plt.title('Training vs Validation Loss')
plt.legend()

plt.tight_layout()
plt.show()

model.save("fruit_veg_identifier.h5")
print("Model saved successfully!")

import json

# class_indices already humare paas hai train_generator se
with open("class_indices.json", "w") as f:
    json.dump(train_generator.class_indices, f)

print("Class indices saved!")
print(train_generator.class_indices)

import numpy as np
from tensorflow.keras.preprocessing import image
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
import matplotlib.pyplot as plt

def predict_fruit(img_path):
    # image load karo aur MobileNetV2 ke size me resize karo
    img = image.load_img(img_path, target_size=(224, 224))
    
    # image ko array me convert karo
    img_array = image.img_to_array(img)
    
    # model ek "batch" expect karta hai, isliye ek extra dimension add karo
    img_array = np.expand_dims(img_array, axis=0)
    
    # MobileNetV2 wala preprocessing lagao (training ke time jaisa hi)
    img_array = preprocess_input(img_array)
    
    # prediction lo
    predictions = model.predict(img_array)
    
    # sabse highest probability wala index nikalo
    predicted_index = np.argmax(predictions[0])
    confidence = predictions[0][predicted_index] * 100
    
    # index ko fruit ke naam me convert karo
    # class_indices me naam->index hai, humein index->naam chahiye, isliye reverse karenge
    class_names = {v: k for k, v in train_generator.class_indices.items()}
    predicted_class = class_names[predicted_index]
    
    # image dikhao result ke saath
    plt.imshow(img)
    plt.axis('off')
    plt.title(f"Predicted: {predicted_class} ({confidence:.2f}% confidence)")
    plt.show()
    
    print(f"Predicted: {predicted_class}")
    print(f"Confidence: {confidence:.2f}%")

# yahan apni test image ka path daal
predict_fruit("/home/vank/Final_Project/Unified_Dataset/banana/fresh/Banana__Healthy_augmented_89.jpg")   # apna actual test image path daal de

import random

# validation data se 5 random images uthate hain
sample_images = val_data.sample(5, random_state=1)

for idx, row in sample_images.iterrows():
    img_path = row['filepath']
    actual_label = row['label']
    
    print(f"Actual: {actual_label}")
    predict_fruit(img_path)
    print("-" * 40)

import numpy as np
from sklearn.metrics import confusion_matrix, classification_report
import seaborn as sns
import matplotlib.pyplot as plt

# poore validation set pe prediction lete hain (ye thoda time lega)
val_generator.reset()   # generator ko shuru se chalane ke liye reset karna zaroori hai
predictions = model.predict(val_generator)

# har prediction ka highest probability wala index nikालो
predicted_classes = np.argmax(predictions, axis=1)

# actual (true) labels generator se lete hain
true_classes = val_generator.classes

# class names ki list (order maintain karte hue)
class_names = list(val_generator.class_indices.keys())

# confusion matrix banate hain
cm = confusion_matrix(true_classes, predicted_classes)

# plot karte hain
plt.figure(figsize=(12, 10))
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', xticklabels=class_names, yticklabels=class_names)
plt.xlabel('Predicted')
plt.ylabel('Actual')
plt.title('Confusion Matrix')
plt.show()

# detailed report bhi print karte hain (precision, recall, f1-score har class ke liye)
print(classification_report(true_classes, predicted_classes, target_names=class_names))



