# 🍏 Fresh Vision — Pura Project Hinglish Mein (Ekdum Easy Language)

> **Ye file kiske liye hai?**
> Agar tumhe apne teachers ya audience ke saamne ye project present karna hai, aur tum chahte ho ki
> **har ek cheez** — code se lekar model tak — bilkul basic se samajh aa jaye, toh ye file tumhare liye hai.
>
> **Rule of this document:** Jab bhi koi technical word aayega (CNN, transfer learning, pseudo-labeling, HSV...),
> uske turant baad **brackets mein ekdum simple meaning** milega. Kuch bhi assume nahi kiya gaya.

---

## 📑 Table of Contents

1. [Project Ka Basic Overview](#1-project-ka-basic-overview)
2. [Architecture aur 3-Model Pipeline Ka Deep Dive](#2-architecture-aur-3-model-pipeline-ka-deep-dive)
3. [MobileNetV2 CNN Architecture — Ekdum Simple Words Mein](#3-mobilenetv2-cnn-architecture--ekdum-simple-words-mein)
4. [⭐ Sabse Important: Pseudo-Labeling aur HSV se 2 → 5 Labels](#4--sabse-important-pseudo-labeling-aur-hsv-se-2--5-labels)
5. [Model Training Ki Strategy (Transfer Learning, Phase 1 & Phase 2)](#5-model-training-ki-strategy-transfer-learning-phase-1--phase-2)
6. [Frontend aur Backend Ka Tech Stack](#6-frontend-aur-backend-ka-tech-stack)
7. [Bonus: File-by-File Map (Kaunsi File Kya Karti Hai)](#7-bonus-file-by-file-map-kaunsi-file-kya-karti-hai)
8. [Bonus: Presentation Ke Liye Ready-Made Answers](#8-bonus-presentation-ke-liye-ready-made-answers)
9. [Honest Limitations (Ye bolna tumhari izzat badhayega)](#9-honest-limitations-ye-bolna-tumhari-izzat-badhayega)

---

# 1. Project Ka Basic Overview

## 1.1 Ek line mein

**Fresh Vision ek website hai jisme tum fruit ya sabzi ki photo daalte ho, aur wo tumhe do cheezein batati hai:**

1. **Ye kya hai?** → "Ye Banana hai" (14 alag-alag fruits/vegetables pehchaan sakta hai)
2. **Ye kitna taaza hai?** → "Ye Very Fresh hai" ya "Ye Rotten hai" (5 alag-alag levels mein)

Aur saath mein bonus: **"Kitne din chalega?"** (estimated shelf life — jaise "3-5 days").

## 1.2 Bacche wali example 🧒

Socho tumhare ghar mein ek **bahut hoshiyaar chacha** hain jinhone zindagi mein **lakhon** fruits dekhe hain.

Tum unhe ek kela dikhate ho aur poochhte ho: *"Chacha, ye kya hai aur kya ye khaane laayak hai?"*

Chacha 1 second mein bolte hain: *"Beta ye kela hai, thoda kaala pad gaya hai, 1-2 din mein khatam kar lo."*

**Fresh Vision wahi chacha hai — bas computer ke andar.** 😄
Tum photo do, wo turant answer de deta hai.

## 1.3 Problem kya solve karta hai?

| Problem (aaj kal jo hoti hai) | Fresh Vision Ka Solution |
|---|---|
| Grocery store / warehouse mein **hazaaron** fruits ko log **haath se** check karte hain — bahut slow, bahut mehnat | Camera se photo → 1 second mein answer |
| Har banda alag judge karta hai (mujhe fresh laga, tumhe rotten) — **consistency nahi** | Model har baar **same rule** se judge karta hai |
| Sada hua fruit fresh ke saath mix ho jaye toh **baaki bhi jaldi sad jaate hain** (food waste) | Jaldi pakad lo, alag kar do → waste kam |
| Kaunsa fruit pehle bechna hai, ye pata nahi hota | App batata hai "Declining — prioritise for sale" |

**Real-world use:** Grocery stores, cold storage warehouses, supply chain quality check, food delivery apps ki quality inspection.

## 1.4 App kaise dikhta hai (User ka safar)

```
1. User website kholta hai  →  ek sundar dark-theme page dikhta hai
2. Photo drag-and-drop karta hai (ya paste karta hai Ctrl+V se)
3. Photo select hote hi ANALYSIS APNE AAP shuru ho jaata hai
4. ~1 second baad right side panel mein result:
      ┌──────────────────────────────────┐
      │  Very Fresh Apple                │
      │  Produce confidence:  96.42%     │
      │  Freshness confidence: 88.10%    │
      │  Score dial:  9.5 / 10           │
      │  Shelf life:  5-7 days           │
      │  Latency:     742 ms             │
      └──────────────────────────────────┘
5. Neeche full breakdown: top-3 fruit guesses + saare 5 freshness levels ki probability
```

**Colour coding** (`frontend/src/lib/format.js` mein):
- 🟢 Green = Very Fresh / Fresh → "safe to sell"
- 🟡 Amber = Slightly Rotten → "Declining — prioritise for sale"
- 🟠 Orange = Rotten → "Spoiled — remove from shelf"
- 🔴 Red = Very Rotten → "Heavily spoiled — discard"

---

# 2. Architecture aur 3-Model Pipeline Ka Deep Dive

## 2.1 Pehle: "Pipeline" kya hota hai?

> **Pipeline (simple meaning):** Ek **line mein lage hue kaam**. Jaise factory mein assembly line hoti hai —
> pehla banda ek kaam karta hai, phir cheez agle bande ko deta hai, phir agla apna kaam karta hai.
> Yahaan har "banda" ek AI model hai.

Fresh Vision mein **ek nahi, teen alag-alag AI models** hain jo mil ke kaam karte hain.

## 2.2 Poori picture (ek nazar mein)

```
                 📷 User ki photo
                        │
                        ▼
        ┌───────────────────────────────┐
        │  STEP 0: PREPROCESSING        │   ← photo ko model-friendly banana
        │  • RGB mein convert           │
        │  • 224 × 224 pixel resize     │
        │  • MobileNetV2 normalization  │
        └───────────────┬───────────────┘
                        │  (ab ek "tensor" ban gaya — numbers ka box)
                        ▼
        ┌───────────────────────────────┐
        │  🚪 MODEL 1: GATEKEEPER       │   "Ye fruit/sabzi hai bhi ya nahi?"
        │  (ImageNet MobileNetV2)       │
        └───────────────┬───────────────┘
                        │
          ❌ Nahi hai ──┼──▶  "Not a Fruit or Vegetable.
                        │       This looks like Golden Retriever."  → STOP
                        │
          ✅ Haan hai   │
                        ▼
        ┌───────────────────────────────┐
        │  🍎 MODEL 2: IDENTIFIER       │   "Ye kaunsa fruit hai?"
        │  (fruit_veg_identifier.h5)    │   → 14 classes
        └───────────────┬───────────────┘
                        │
          😕 Confidence │
             < 65% ─────┼──▶  "Unclear Image. Try a clearer photo."  → STOP
                        │
          😎 Confident  │
                        ▼
        ┌───────────────────────────────┐
        │  🥀 MODEL 3: FRESHNESS        │   "Kitna taaza hai?"
        │  (freshness_classifier_v2.h5) │   → 5 levels
        └───────────────┬───────────────┘
                        │
                        ▼
        ┌───────────────────────────────┐
        │  ⚖️  CALIBRATION               │   raw answer ko theek karna
        │  slightly_rotten × 0.3        │
        │  rotten          × 1.5        │
        │  very_rotten     × 2.5        │
        │  phir sabko re-normalize      │
        └───────────────┬───────────────┘
                        ▼
              📊 FINAL JSON RESULT → React UI
```

## 2.3 STEP 0 — Preprocessing (photo ko taiyaar karna)

**Code:** `backend/main.py` → function `to_tensor()`

```python
def to_tensor(img):
    if img.mode != "RGB":
        img = img.convert("RGB")                     # 1
    arr = keras_image.img_to_array(img.resize((224, 224)))   # 2, 3
    return preprocess_input(np.expand_dims(arr, axis=0))     # 4, 5
```

Line-by-line, bacche wali bhasha mein:

1. **`convert("RGB")`** — Photo ko Red-Green-Blue format mein laao.
   > *Kyun?* Kyunki kuch photos black-and-white hoti hain, kuch PNG mein transparent hoti hain (4 channels).
   > Model ne training mein sirf 3-channel RGB dekha tha. Agar alag format doge toh model confuse ho jayega.
   > **Jaise:** Cricket ki practice sirf red ball se ki ho, toh match mein bhi red ball hi chahiye.

2. **`resize((224, 224))`** — Photo ko exactly 224 pixel chaudi × 224 pixel lambi kar do.
   > *Kyun?* MobileNetV2 ka **fixed** darwaza hai — sirf 224×224 ki photo andar aa sakti hai.
   > Tumhari photo 4000×3000 ho ya 100×80, sabko 224×224 banana padega.

3. **`img_to_array()`** — Photo ko **numbers ke box** mein badal do.
   > Computer photo ko "dekh" nahi sakta. Uske liye photo = har pixel ki brightness ka number.
   > Ek 224×224 RGB photo = 224 × 224 × 3 = **1,50,528 numbers**. Har number 0 se 255 ke beech.

4. **`np.expand_dims(arr, axis=0)`** — Ek extra "dabba" laga do bahar se.
   > Model hamesha **batch** (ek saath kai photos ka group) expect karta hai.
   > Humare paas 1 hi photo hai, toh shape `(224,224,3)` ko `(1,224,224,3)` bana dete hain —
   > matlab "1 photo ka batch". **Jaise:** ek chocolate bhi dena ho toh dabbe mein daal ke do.

5. **`preprocess_input()`** — Numbers ko **-1 se +1** ke beech le aao.
   > MobileNetV2 ko 0-255 wale bade numbers pasand nahi. Formula: `(pixel / 127.5) - 1`.
   > **Sabse important baat:** Training ke waqt bhi **yahi exact function** use hua tha
   > (dekho `model_code.py` mein `ImageDataGenerator(preprocessing_function=preprocess_input)`).
   > Agar training aur testing ka preprocessing alag ho jaye toh model ka accuracy gir jaata hai.
   > **Jaise:** Paper Hindi mein padha aur exam English mein dediya — dimaag ghoom jayega.

## 2.4 🚪 MODEL 1 — Gatekeeper (Darban)

**Kaam:** "Bhai, ye jo photo aayi hai wo fruit/sabzi hai bhi ya nahi?"

**Kyun zaroori hai?**
Socho user kutte ki photo daal deta hai. Model 2 ko **sirf 14 fruits ki training** mili hai —
uske paas "kutta" naam ka option hi nahi hai! Toh wo majboori mein bolega *"Potato — 71% confident"*.
Ye galat aur bewakoof lagega. Isliye pehle ek **darban (gatekeeper)** khada kar diya.

> **Technical naam:** Ye **OOD detection** hai.
> **OOD = Out-Of-Distribution (simple meaning):** "Aisi cheez jo model ne training mein kabhi dekhi hi nahi."

**Ye model kahan se aaya?**
Ye **banaya hi nahi gaya** — ready-made hai! Google ka pretrained MobileNetV2 jo **ImageNet** pe train hai.

> **ImageNet (simple meaning):** Ek bahut bada photo ka collection — **1.4 million (14 lakh) photos**,
> **1000 alag-alag cheezein** (kutta, billi, car, kela, guitar, tabla... sab kuch).
> Ye AI world ka "sabse famous school" hai.

**Code:** `backend/main.py`

```python
decoded = decode_predictions(m["gatekeeper"].predict(tensor, verbose=0), top=5)[0]
is_food = any(
    any(kw in name.lower() for kw in FOOD_KEYWORDS) for _, name, _ in decoded
)
```

**Kaam karne ka tareeka (bilkul simple):**

1. Gatekeeper photo dekh ke apne 1000 options mein se **top 5 guesses** nikaalta hai.
   Jaise: `["banana", "zucchini", "cucumber", "spatula", "wooden_spoon"]`
2. Hum in 5 naamon ko dekhte hain aur check karte hain — kya inme koi **food-wala word** hai?
   Humari list (`FOOD_KEYWORDS`) mein hai: `apple, orange, banana, cucumber, pepper, mushroom,
   broccoli, food, fruit, vegetable, plant, plate, dish...` (30+ words)
3. **Agar match mila** → "haan ye food hai" → aage jaao ✅
4. **Agar koi match nahi mila AUR gatekeeper 20% se zyada confident hai** apne top guess pe
   → **REJECT** ❌ → *"This looks like Golden Retriever. Please upload a fruit or vegetable."*

**Wo 20% ki condition kyun?** (`GATEKEEPER_THRESHOLD = 20.0`)
> Agar gatekeeper khud confuse hai (sabhi guesses 5-10% pe hain), toh uski baat maan ke reject karna galat hoga.
> Reject sirf tab karo jab wo **confidently** bol raha ho "ye kutta hai".
> **Jaise:** Darban tabhi rokega jab wo pakka pehchaan le ki tum guest list mein nahi ho —
> confusion mein kisi ko bahar nahi nikaalta.

## 2.5 🍎 MODEL 2 — Fruit/Vegetable Identifier

**File:** `fruit_veg_identifier.h5` (11.5 MB)
**Kaam:** 14 mein se batao ye kaunsa hai.

**14 classes** (`class_indices.json` se):

| Index | Naam | | Index | Naam |
|---|---|---|---|---|
| 0 | apple 🍎 | | 7 | jujube (ber) |
| 1 | banana 🍌 | | 8 | mango 🥭 |
| 2 | bellpepper (shimla mirch) | | 9 | orange 🍊 |
| 3 | carrot (gajar) 🥕 | | 10 | pomegranate (anaar) |
| 4 | cucumber (kheera) 🥒 | | 11 | potato (aloo) 🥔 |
| 5 | grape (angoor) 🍇 | | 12 | strawberry 🍓 |
| 6 | guava (amrood) | | 13 | tomato (tamatar) 🍅 |

**Output kya deta hai?**
14 numbers ki ek list, jinka **total 100% hota hai**. Jaise:

```
apple: 0.94   banana: 0.01   tomato: 0.03   ... baaki sab: 0.02
        ↑ sabse bada → ye jeeta → "Apple, 94% confidence"
```

> **Softmax (simple meaning):** Wo formula jo model ke kachche scores ko
> **percentage mein badal deta hai jinka total hamesha 100% hota hai.**
> **Jaise:** Class election mein 40 vote apple ko, 5 banana ko, 5 tomato ko →
> softmax bolta hai "apple 80%, banana 10%, tomato 10%".

**Code mein top-3 kyun nikala?**

```python
order = np.argsort(preds)[::-1]      # sabse bade se sabse chhote ka order
top_produce = [ ... for i in order[:3] ]   # top 3 le lo
```

Taaki UI mein user ko dikhe: *"Main 94% apple bol raha hoon, 3% chance tomato ka hai, 1% guava."*
Ye **explainability** hai — user ko sirf answer nahi, model ka **soch** bhi dikh rahi hai.

**Confidence threshold — 65%:**

```python
CONFIDENCE_THRESHOLD = 65.0
if produce_conf < CONFIDENCE_THRESHOLD:
    return {"status": "uncertain", "headline": "Unclear Image", ...}
```

> Agar model ka sabse achha guess bhi 65% se kam hai, toh matlab wo **khud confuse** hai
> (photo blurry hai, andhera hai, ya do fruits ek saath hain).
> Aise mein **galat answer dene se behtar hai imaandaari se bolna "mujhe theek se nahi dikh raha"**.
> **Ye ek bahut achhi engineering practice hai** — presentation mein zaroor mention karna! ⭐

## 2.6 🥀 MODEL 3 — Freshness Classifier

**File:** `freshness_classifier_v2.h5` (23.8 MB — sabse bada, kyunki iski zyada layers train hui thi)
**Kaam:** Batao fruit kitna sada hua hai — **5 levels** mein.

**Yahaan ek TRICKY baat hai jo bahut log miss kar dete hain** ⚠️

Model ke andar 5 classes ka order **alphabetical** hai (kyunki Keras folder ke naamon ko A-Z sort karta hai),
**"kitna sada hai" wale logical order mein NAHI**:

```python
FRESHNESS_CLASS_NAMES = {
    0: "fresh",            # ← alphabetically 'f' pehle aata hai
    1: "rotten",           # ← phir 'r'
    2: "slightly_rotten",  # ← phir 's'
    3: "very_fresh",       # ← phir 'v'... aur "very_fresh" < "very_rotten"
    4: "very_rotten",
}
```

Logical order (taaza se sada) ye hota:
`very_fresh(3) → fresh(0) → slightly_rotten(2) → rotten(1) → very_rotten(4)`

**Isliye code mein har jagah index numbers dekh ke confuse mat hona** — index 3 = sabse taaza! 😅
Ye baat presentation mein bataoge toh lagega ki tumne code sach mein padha hai.

### ⚖️ Calibration Hack (bahut important — ye interviewers ko pasand aata hai)

Trained model ka ek **bug jaisa behaviour** tha:
- Wo har cheez ko **"slightly_rotten" bol deta tha** (jaise ek bacche ne ratt liya ho ek hi answer)
- **"very_rotten" kabhi bolta hi nahi tha**, chahe fruit poora sada ho

**Kyun aisa hua?** Kyunki training data mein ye imbalance thi — pseudo-labeling (section 4 dekho) ne
`slightly_rotten` bucket mein bahut zyada images daal di thi.

**Solution jo lagaya (inference time pe fix):**

```python
CALIBRATION = {2: 0.3, 1: 1.5, 4: 2.5}
#              ↑        ↑        ↑
#     slightly_rotten  rotten  very_rotten
#     ko 30% kar do  1.5x karo  2.5x karo

calibrated = np.copy(raw).astype(np.float64)
for idx, weight in CALIBRATION.items():
    calibrated[idx] *= weight
calibrated = calibrated / np.sum(calibrated)   # wapas 100% banao
```

**Chhota example (calculator laga ke dekho):**

```
Model ka RAW answer:
  fresh(0)=0.10  rotten(1)=0.15  slightly(2)=0.60  very_fresh(3)=0.05  very_rotten(4)=0.10
                                  ↑ sabse bada → "Slightly Rotten" ❌ (galat lag raha tha)

Multiply karo:
  fresh   = 0.10 × 1    = 0.100
  rotten  = 0.15 × 1.5  = 0.225
  slightly= 0.60 × 0.3  = 0.180
  v_fresh = 0.05 × 1    = 0.050
  v_rotten= 0.10 × 2.5  = 0.250
  ─────────────────────────────
  Total   = 0.805  (100% nahi raha! isliye ab re-normalize)

Divide by total (0.805):
  fresh=12.4%  rotten=28.0%  slightly=22.4%  v_fresh=6.2%  v_rotten=31.1%
                                                             ↑ ab ye jeeta ✅
```

> **Re-normalize (simple meaning):** Sabko total se divide kar do, taaki phir se sum = 100% ho jaye.
> Kyunki probability ka rule hai — sab options ka total hamesha 100% hona chahiye.

**Ye honest kaise bolna hai:** *"Ye ek practical quick-fix hai, permanent solution nahi.
Sahi tareeka hota — better pseudo-labels banana ya training mein `class_weight` use karna.
Lekin retraining mein time lagta, aur ye hack demo ke liye acceptable result de raha tha."*
Ye bolne se tum **honest engineer** lagoge, na ki koi cheez chupane wale. ⭐

## 2.7 Shelf Life (bonus feature)

```python
SHELF_LIFE = {
    "very_fresh":      "5-7 days",
    "fresh":           "3-5 days",
    "slightly_rotten": "1-2 days",
    "rotten":          "Discard",
    "very_rotten":     "Discard",
}
```

Ye AI se predict **nahi** hota — ye ek simple **lookup table** hai (dictionary).
Freshness label aaya → uske saamne likha din bata diya. Simple aur useful. 👍

## 2.8 Teen alag models kyun, ek bada model kyun nahi?

Ye question **pakka poocha jayega**. Answer:

| Reason | Explanation |
|---|---|
| **Alag-alag skills** | "Ye kaunsa fruit hai" = **shape/type** ka sawaal. "Ye kitna sada hai" = **colour/texture** ka sawaal. Do alag kaam, do alag experts. |
| **Alag training data** | Identifier ko 14-class labels chahiye the, freshness ko 5-class labels chahiye the (jo pseudo-labeling se bane). Ek model mein 14×5 = **70 classes** banane padte — har class ke liye data kam pad jaata. |
| **Modular = fix karna aasan** | Agar freshness kharab kaam kar raha hai, sirf **wahi** model retrain karo. Identifier ko haath lagane ki zaroorat nahi. |
| **Gatekeeper free mein mil gaya** | Uski koi training hi nahi karni padi — ready-made ImageNet model. **Zero cost, bada benefit.** |
| **Robustness** | Galat input aane pe system bewakoofi nahi karta, politely mana kar deta hai. |

**Presentation line:**
> *"Maine single model use nahi kiya, balki teen models ka pipeline banaya — ek identify karta hai
> ki fruit kaunsa hai, dusra uski freshness batata hai, aur teesra 'gatekeeper' ki tarah kaam karta hai
> jo out-of-distribution images ko reject karta hai. Isse system modular bhi hai aur robust bhi."*

---

# 3. MobileNetV2 CNN Architecture — Ekdum Simple Words Mein

## 3.1 Pehle: CNN kya hota hai?

> **CNN = Convolutional Neural Network (simple meaning):**
> Ek aisa computer program jo **photos dekhna seekhta hai** — bilkul jaise humari aankh aur dimaag milke kaam karte hain.

**Ye kaam kaise karta hai — layer by layer (bacche wali example):**

Socho ek **school hai jisme 53 classes hain** aur ek photo har class se hoke gujarti hai:

```
📷 Photo andar aayi
    ↓
Class 1-5:     "Mujhe LINES aur EDGES dikh rahi hain" (sidhi lakeer, tedhi lakeer, kona)
    ↓
Class 6-15:    "In lines ko jodo — arre ye toh CURVES aur CIRCLES ban rahe hain!"
    ↓
Class 16-30:   "In shapes ko jodo — ye toh TEXTURE hai! Chikna, khurdura, daane-daane"
    ↓
Class 31-45:   "Arre ye toh kisi cheez ka HISSA hai — ye danthal hai, ye chhilka hai"
    ↓
Class 46-53:   "Sab jod ke dekha — YE TOH KELA HAI!" 🍌
```

**Har class jo naya seekhti hai, wo pichli class ki seekh ke upar banti hai.**
Neeche wali classes simple cheezein dekhti hain, upar wali complicated cheezein.

> **Convolution (simple meaning):** Ek chhoti si **magnifying glass (3×3 ka chhota square)**
> jo photo pe left-to-right, top-to-bottom **slide** karta hai aur har jagah dhoondhta hai
> ki "yahaan mera wala pattern hai kya?" Agar hai toh loud signal bhejta hai.
> **Ye same magnifying glass poori photo pe use hoti hai** — isliye kela photo mein kahin bhi ho,
> model use pehchaan leta hai. Isko **"translation invariance"** kehte hain
> *(matlab: cheez jagah badle toh bhi pehchaan mein farak na pade)*.

## 3.2 MobileNetV2 kya hai?

**MobileNetV2 = ek famous CNN jo Google ne 2018 mein banaya tha.**
Iska **poora maqsad** hi ye tha: *"Aisa CNN banao jo mobile phone pe bhi chal jaye."*

| Feature | Value | Iska matlab |
|---|---|---|
| Depth | **53 conv layers** | 53 "classes" wala school |
| Keras `.summary()` mein layers | **~154 lines** | Kyunki har conv block ke andar Conv + BatchNorm + ReLU alag-alag ginte hain |
| Parameters | **~2.2 Million** | Model ke andar 22 lakh "knobs" jo training mein set hote hain |
| Input | **224 × 224 × 3** | Ek fixed size ki RGB photo |
| Model file size | **~14 MB** | Phone mein easily fit ho jaye |

**Comparison (ye bolne se lagta hai tumne research kiya hai):**

| Model | Parameters | Feel |
|---|---|---|
| VGG16 | 138 Million | 🐘 Haathi — powerful par bhaari, phone pe nahi chalega |
| ResNet50 | 25 Million | 🐎 Ghoda — balanced |
| **MobileNetV2** | **2.2 Million** | 🐇 **Khargosh — halka aur tez, phone/web ke liye perfect** |

> **Parameter (simple meaning):** Model ke andar ka ek **knob/screw** jiski value training mein adjust hoti hai.
> Zyada knobs = zyada seekhne ki taakat, par zyada memory aur zyada slow.
> Radio ke tuning knobs jaise — sahi jagah set ho jaye toh clear awaaz aati hai.

## 3.3 MobileNetV2 halka kaise hai? (4 jugaad)

### 🔧 Jugaad 1: Depthwise Separable Convolution

**Ye MobileNet ka SABSE BADA idea hai.** Normal convolution ko **do chhote steps** mein tod deta hai.

**Normal Convolution (purana tareeka):**
> Ek hi banda **saare colours ek saath** dekhta hai aur ek saath **saara** kaam karta hai.
> Bahut mehnat, bahut time.

**Depthwise Separable (MobileNet ka tareeka) — 2 steps:**

```
STEP A — DEPTHWISE:  Har colour channel ko ALAG-ALAG dekho
   🔴 Red channel   → uska apna filter    "Red mein kya pattern hai?"
   🟢 Green channel → uska apna filter    "Green mein kya pattern hai?"
   🔵 Blue channel  → uska apna filter    "Blue mein kya pattern hai?"

STEP B — POINTWISE (1×1 conv):  Ab teeno ke jawab MILAO
   "Red mein ye tha + Green mein wo tha + Blue mein wo tha
    = milake ye pattern banta hai!"
```

**Fayda: ~8-9 guna kam calculation!** Aur accuracy lagbhag utni hi rehti hai. 🎉

> **Bacche wali example:** Ek homework mein 30 sawaal hain.
> **Purana tareeka:** ek banda akela sab 30 karta hai → 30 units mehnat.
> **MobileNet tareeka:** 3 dost 10-10 sawaal karte hain (**depthwise**), phir milke ek page pe likh dete hain (**pointwise**)
> → bahut kam time, kaam utna hi achha. 🙌

### 🔧 Jugaad 2: Inverted Residual Blocks

> **Residual (simple meaning):** Ek **shortcut raasta** jo layer ke input ko seedha output se jod deta hai —
> "agar mujhe kuch improve nahi karna toh main input ko jaise ka taise aage bhej doon."

**Normal ResNet block:** channels **kam** karo (squeeze) → kaam karo → phir **badhao** (expand). `Wide → Narrow → Wide`

**MobileNetV2 ka INVERTED block (ulta):** channels **badhao** (expand) → depthwise kaam karo → phir **kam** karo (project).
`Narrow → Wide → Narrow`

**Kyun ulta?**
> Kyunki depthwise convolution **sasta** hai — usse bade (wide) space mein karne mein koi problem nahi.
> Aur data ko **narrow** form mein store/travel karao, taaki memory kam lage.
> **Jaise:** Kapde alag-alag rakh ke dhote ho (wide = zyada jagah, achhi dhulai),
> par almari mein **fold karke** rakhte ho (narrow = kam jagah). 👕

### 🔧 Jugaad 3: Linear Bottleneck

Block ke **aakhiri** (projection) layer pe **ReLU nahi lagate**, seedha linear rakhte hain.

> **ReLU (simple meaning):** Ek rule — "**negative number ko 0 bana do, positive ko waise ka waisa rakho.**"
> `ReLU(-5) = 0`, `ReLU(3) = 3`

**Problem:** ReLU saare negative numbers ko **maar deta hai (0 kar deta hai)**.
Jab data pehle se hi **chhoti jagah (low-dimensional/narrow)** mein squeeze ho chuka hai,
tab ReLU lagane se **information hamesha ke liye kho jaati hai** — wapas nahi aa sakti.

> **Bacche wali example:** Tumne ek lambi kahani ko **1 line ka summary** banaya (compress kiya).
> Ab agar us 1 line se bhi aadhe shabd mita do — kahani samajh hi nahi aayegi! ❌
> Isliye jab data compressed ho, tab kuch mat mitao. **Yehi MobileNetV2 ka key innovation hai (V1 se difference).** ⭐

### 🔧 Jugaad 4: ReLU6

Normal ReLU ki jagah **ReLU6** — output ko **maximum 6 pe cap** kar dete hain.
`ReLU6(100) = 6`, `ReLU6(4) = 4`, `ReLU6(-3) = 0`

**Kyun?** Mobile phones mein kam-precision arithmetic (8-bit) use hoti hai.
Agar numbers bahut bade ho jaayein toh phone mein calculation bigad jaati hai.
6 ki hadd laga do → sab kuch stable rehta hai. 📱

> **Jaise:** Bike pe speed limiter laga do 60 pe — safe bhi, predictable bhi.

## 3.4 Humara Custom Head (jo humne apna banaya) 🎩

MobileNetV2 ke original last layer mein **1000 ImageNet classes** the (kutta, billi, car...).
Humein wo nahi chahiye. Humein chahiye **14 fruits** (ya **5 freshness levels**).

Toh humne wo purana sar (head) **kaat diya** aur apna naya **laga diya**:

```python
base_model = MobileNetV2(input_shape=(224,224,3),
                         include_top=False,     # ← purana 1000-class head hata do
                         weights="imagenet")    # ← par uska SEEKHA HUA GYAAN rakho
base_model.trainable = False                    # ← gyaan ko lock kar do (freeze)

x = base_model.output                           # shape: 7 × 7 × 1280
x = GlobalAveragePooling2D()(x)                 # → 1280 numbers
x = Dense(128, activation="relu")(x)            # → 128 numbers
x = Dropout(0.3)(x)                             # → 30% randomly band
output = Dense(14, activation="softmax")(x)     # → 14 numbers (total 100%)

model = Model(inputs=base_model.input, outputs=output)
```

**Har layer ka kaam, ekdum simple:**

| Layer | Kya karti hai | Bacche wali example |
|---|---|---|
| **`include_top=False`** | Purana 1000-class classifier hata do, sirf "aankh" rakho | Ek experienced doctor rakho, par uska purana visiting card fenk do |
| **`GlobalAveragePooling2D`** | 7×7×1280 ke bade box ko **1280 numbers** mein squeeze karo — har feature ka **average** le lo | 7×7 = 49 dosto ne ek cheez ko rate kiya, tum sabka **average** nikaal lete ho → ek number |
| **`Dense(128, relu)`** | 1280 features ko dekh ke 128 "matlab wali baatein" banao | 1280 kachche notes padh ke 128 useful points likhna |
| **`Dropout(0.3)`** | Training ke waqt **randomly 30% neurons ko band** kar do | Cricket practice mein har baar 3 alag players ko rest do — poori team strong banti hai, ek player pe dependency nahi |
| **`Dense(14, softmax)`** | Final answer — 14 percentages jinka total 100% | Election ka final result |

> **Dense / Fully Connected layer (simple meaning):** Aisi layer jisme **har input, har output se juda hota hai.**
> Jaise ek class mein har bachcha har dusre bacche se baat kar sakta ho.

> **Dropout ka asli fayda (Overfitting rokna):**
> **Overfitting (simple meaning):** Model ne **ratta maar liya** — training photos toh perfect
> pehchaan leta hai, par nayi photo dikhao toh fail. Jaise wo bachcha jisne sirf sample paper ke
> answers ratte hain — exam mein thoda alag sawaal aaya toh khatam. 😅
> Dropout randomly neurons band karke model ko majboor karta hai ki wo **rattne ke bajaye samajhne** lage.

**Custom head ke parameters ka calculation:**
```
Dense(128):  1280 × 128 + 128 (bias) = 1,63,968
Dense(14):    128 ×  14 +  14 (bias) =     1,806
                             TOTAL   ≈ 1,65,774  (~1.66 lakh)
```
Ye backbone ke 22 lakh ke saamne **bahut chhota** hai — isiliye Phase 1 ki training **super fast** thi. ⚡

---

# 4. ⭐ Sabse Important: Pseudo-Labeling aur HSV se 2 → 5 Labels

> **Ye project ka DIL hai. Isko sabse achhe se samjho — presentation mein sabse zyada
> impress karne wala part yahi hai.**

## 4.1 Problem kya thi?

Dataset (`Unified_Dataset`) ka structure aisa tha:

```
Unified_Dataset/
├── apple/
│   ├── fresh/     ← 1000+ photos
│   └── rotten/    ← 1000+ photos
├── banana/
│   ├── fresh/
│   └── rotten/
├── tomato/
│   ├── fresh/
│   └── rotten/
└── ... (14 folders total)
```

**Sirf 2 labels the: `fresh` aur `rotten`. Bas.** 😐

**Lekin humein 5 chahiye the:**
`very_fresh` → `fresh` → `slightly_rotten` → `rotten` → `very_rotten`

**Kyun 5 chahiye the?** Kyunki real life mein "fresh/rotten" ka switch nahi hota —
kela dheere-dheere kaala hota hai. Ek **thoda** kaala kela abhi bhi bech sakte ho.
Ek **poora** kaala kela feknā padega. Ye **farak batana hi business value hai!** 💰

## 4.2 Manual labelling kyun nahi ki?

Chalo hisaab lagate hain:
```
~20,000 photos × 5 second per photo (dekhna + decide + click)
= 1,00,000 seconds
= ~28 ghante non-stop kaam
```
Aur uske baad bhi: **thakan mein galtiyan** + **har din ka mood alag** (aaj isko slightly bola, kal wahi photo ko rotten bol doge).
**Yani time bhi barbaad aur quality bhi guarantee nahi.** ❌

## 4.3 Solution: PSEUDO-LABELING 🎯

> **Pseudo-Labeling (ekdum simple meaning):**
> "Pseudo" = **naqli / khud ka banaya hua**. "Label" = **naam/tag**.
> Matlab: **jab asli labels available nahi hote, toh khud ke banaye hue rules se labels bana lena.**
>
> **Bacche wali example:** Teacher ne sirf itna bataya — "ye 10 copies **achhi** hain, ye 10 **kharab**".
> Ab tumhe 5 grades (A, B, C, D, F) chahiye. Toh tum khud ek **rule** banate ho:
> *"Jitne zyada red pen ke nishaan, utni kharab copy."*
> Phir sab copies ke red-nishaan gin ke A-B-C-D-F de dete ho. **Ye pseudo-labeling hai!** ✅

**Humara rule kya tha?**
> *"Fruit ke upar jitna zyada BROWN/BLACK area hai, utna zyada wo sada hua hai."*

Ye rule **AI nahi** hai — ye purani, classic **Computer Vision** hai (colour dekh ke ginti karna).

## 4.4 HSV Colour Space — pehle ye samjho

### RGB kya hai (jo aam taur pe use hota hai)?
Har colour ko **3 numbers** se banate hain: kitna **R**ed, kitna **G**reen, kitna **B**lue.
```
Bright Red  = (255,   0,   0)
Dark Red    = ( 80,   0,   0)
```

### 😖 RGB ki problem

Ek **hi** brown patch ko alag-alag roshni mein dekho:

```
Tez dhoop mein:   RGB = (140, 90, 50)   ← ye numbers
Chhaya mein:      RGB = ( 55, 35, 20)   ← ye ekdum ALAG numbers!
```

**Colour toh wahi brown hai, par saare 3 numbers badal gaye!** 😫
Toh agar tum rule likho *"agar R 100 se 160 ke beech hai toh brown hai"* — chhaya wala brown miss ho jayega.
RGB mein **colour aur brightness aapas mein ghul-mil** gaye hain. Ye badi problem hai.

### 😍 HSV ka solution

> **HSV = Hue, Saturation, Value** — bhi 3 numbers, par **bilkul alag soch** ke saath:

| Letter | Poora naam | Simple matlab | Range |
|---|---|---|---|
| **H** | **Hue** | **Kaunsa rang hai?** (laal? peela? bhoora?) | 0-179 (OpenCV mein) |
| **S** | **Saturation** | **Rang kitna gehra/chatakdaar hai?** (0 = grey/pheeka, 255 = ekdum chatakdaar) | 0-255 |
| **V** | **Value** | **Kitni roshni hai?** (0 = ekdum kaala, 255 = ekdum ujla) | 0-255 |

**Ab wahi brown patch HSV mein:**

```
Tez dhoop mein:  H=20, S=160, V=140
Chhaya mein:     H=20, S=160, V= 55
                  ↑     ↑      ↑
              SAME! SAME!   sirf ye badla (jo brightness hai)
```

🎉 **KAMAAL!** Roshni badalne se sirf **V** badla. **H (rang) bilkul same raha!**

**Toh rule likhna ab easy hai:** *"Agar H = 10 se 25 ke beech hai, toh ye brown/decay hai"* —
aur ye rule **dhoop mein bhi chalega, chhaya mein bhi.** 💪

> **Bacche wali example:**
> **RGB** ye bolta hai: "isme 140 ml laal, 90 ml peela, 50 ml neela paint mila hai" — 3 cheezein saath.
> **HSV** ye bolta hai: "ye **bhoora** rang hai (H), kaafi **gehra** hai (S), aur **halki roshni** mein hai (V)" —
> teeno alag-alag. **Insaan bhi aise hi sochta hai!** Isliye HSV mein rule likhna natural lagta hai.

**Presentation answer:**
> *"Maine HSV isliye use kiya kyunki HSV mein colour information (Hue) brightness (Value) se
> **alag** hoti hai. Isliye lighting conditions change hone par bhi colour-based thresholding
> stable rehti hai. RGB mein colour aur brightness dono mix hote hain, jisse threshold
> lighting ke saath tootne lagta hai."*

## 4.5 Poora Pseudo-Labeling Process (5 steps)

```
┌─────────────────────────────────────────────────────────────┐
│ STEP 1: RGB → HSV                                           │
│   Har photo ko HSV mein convert karo                        │
├─────────────────────────────────────────────────────────────┤
│ STEP 2: FOREGROUND MASK (fruit ko background se alag karo)  │
│   Saturation channel use karke                              │
├─────────────────────────────────────────────────────────────┤
│ STEP 3: DECAY MASK (brown/kaale spots dhoondho)             │
│   Fruit ke ANDAR hi dhoondho, background mein nahi          │
├─────────────────────────────────────────────────────────────┤
│ STEP 4: DECAY SCORE (percentage nikalo)                     │
│   score = (sade pixels / total fruit pixels) × 100          │
├─────────────────────────────────────────────────────────────┤
│ STEP 5: PER-FRUIT BUCKETING (5 groups mein baanto)          │
│   Har fruit ke scores alag sort karo → 5 barabar hisse      │
└─────────────────────────────────────────────────────────────┘
```

### 🔹 STEP 1 — RGB se HSV

```
har photo → cv2.cvtColor(img, cv2.COLOR_RGB2HSV)
```
Bas ek line. Ab har pixel ke paas H, S, V teen numbers hain.

### 🔹 STEP 2 — Foreground Mask (fruit vs background)

> **Mask (simple meaning):** Ek **black-and-white stencil** jo batata hai konse pixel "counting mein hain".
> `1 (safed) = ye pixel fruit ka hai`, `0 (kaala) = ye background hai, ignore karo`.
> **Jaise:** Photo pe tracing paper rakh ke sirf fruit wale hisse pe hole kaat diya. 🎨

**Kaise banaya?** **Saturation (S)** channel se!

**Logic samjho:**
- Dataset ki photos ka background usually **safed / grey / kaala** hota hai (studio table, plain sheet).
- Safed, grey, kaala — in sabki **Saturation bahut kam** hoti hai (kyunki inme "rang" hai hi nahi!).
- Fruit — laal tamatar, peela kela, hara kheera — inki **Saturation zyada** hoti hai (chatakdaar rang).

```
Rule:  agar Saturation > kuch threshold  →  ye FRUIT hai (mask = 1)
       warna                             →  ye BACKGROUND hai (mask = 0)
```

**Ye step kyun zaroori tha?** Socho background **bhoore rang ki lakdi ki table** hai.
Agar mask na lagaate, toh table ka bhoora colour **"decay"** mein gin liya jaata
→ ekdum fresh apple ko bhi "rotten" bol dete! 🤦 **Isliye pehle fruit ko isolate karna zaroori tha.**

### 🔹 STEP 3 — Decay Mask (sade hue spots dhoondhna)

Ab **sirf fruit ke andar** (jahan foreground mask = 1) hum brown/kaale pixels dhoondhte hain.

```
Rule:  Hue brown-range mein hai?         (bhoora rang)
       AUR Value kam hai?                (kaala/dark patch)
       AUR foreground mask = 1?          (fruit ke andar hai)
       →  haan? toh ye pixel DECAYED hai ✅
```

**Kya dhoondh rahe hain?** Wahi cheezein jo tum apni aankh se dekhte ho:
kele pe **kaale dhabbe**, apple pe **bhoore daag**, tamatar pe **kaali sadan**.

### 🔹 STEP 4 — Decay Score (formula)

```
                    decayed pixels (kaale/bhoore)
decay_score  =  ───────────────────────────────────  ×  100
                 total fruit pixels (foreground)
```

**Examples (ekdum simple):**

| Photo | Fruit ke total pixels | Decayed pixels | Score | Iska matlab |
|---|---|---|---|---|
| Ekdum fresh apple | 50,000 | 500 | **1.0%** | Bilkul saaf 😍 |
| Halka sa daag | 50,000 | 4,000 | **8.0%** | Thoda daag |
| Aadha sada kela | 40,000 | 12,000 | **30.0%** | Kaafi kharab |
| Poora kaala kela | 40,000 | 30,000 | **75.0%** | Fenk do 🗑️ |

**Note (important):** Ye score **percentage** hai, isliye **photo ka size matter nahi karta**.
Chhoti photo ho ya badi, dono ka score comparable hai. Ye ek smart design choice hai. 👍

### 🔹 STEP 5 — PER-FRUIT BUCKETING ⭐ (sabse smart step)

Ab har photo ke paas ek score hai. Ab labels dene hain. **Par ek badi problem hai:**

**❌ Global threshold kyun FAIL hota?**

Socho hum sabke liye ek hi rule banate: *"score > 20% = rotten"*.

| Fruit | Fresh haalat mein natural colour | Global rule ka result |
|---|---|---|
| 🍌 **Kela** | Fresh kela peela hota hai, par thode bhoore daag toh **normal** hain — score ~15% aa jaata hai | Border pe aa jayega, galat label |
| 🥔 **Aloo** | Aloo **hai hi bhoora**! Fresh aloo ka score bhi ~40% aayega! 😱 | **Har fresh aloo "rotten" ho jayega!** ❌❌ |
| 🍓 **Strawberry** | Ekdum laal, brown bilkul nahi — sada hua strawberry bhi score ~10% dega | **Sada hua strawberry "fresh" ho jayega!** ❌❌ |

**Global threshold ne aloo aur strawberry dono ke saath anyaay kar diya.** 😤

**✅ Per-fruit bucketing ka solution:**

**Har fruit ki apni alag "class" hai, aur har class mein apni alag ranking!**

```
🍎 SIRF APPLE ki saari photos lo (~1500)
   → unke scores sort karo (chhote se bade)
   → 5 barabar hisson mein baanto:

   ┌────────────┬────────────┬────────────┬────────────┬────────────┐
   │ sabse saaf │   agle     │   beech    │   agle     │ sabse gande│
   │   20%      │   20%      │   20%      │   20%      │   20%      │
   ├────────────┼────────────┼────────────┼────────────┼────────────┤
   │ very_fresh │   fresh    │  slightly  │   rotten   │ very_rotten│
   │            │            │  _rotten   │            │            │
   └────────────┴────────────┴────────────┴────────────┴────────────┘

🍌 AB BANANA ke liye ye poora process ALAG SE dubara karo
🥔 AB POTATO ke liye ALAG SE
... 14 baar, har fruit ke liye alag
```

**Iska jaadu:**
- Aloo ki apni class mein compete hoga → **sabse saaf aloo** ko `very_fresh` milega
  (chahe uska absolute score 35% ho — koi baat nahi, wo apni class mein first hai!) ✅
- Strawberry ki apni class mein → **sabse ganda strawberry** ko `very_rotten` milega
  (chahe uska score sirf 12% ho) ✅

> **Bacche wali example (ye zaroor bolna presentation mein):** 🏫
> Class 5, Class 8 aur Class 12 ke bachchon ka **ek hi exam** mat lo!
> Class 5 ka bachcha fail ho jayega, Class 12 wala aaram se pass.
> **Sahi tareeka:** har class ka **apna exam**, apni ranking, apne top-5.
> **Bilkul waise hi:** aloo ko aloo se compare karo, strawberry ko strawberry se. **Kabhi aapas mein nahi.** 🎯

> **Technical naam:** Ye technique **"per-class quantile binning"** hai.
> **Quantile (simple meaning):** Data ko **barabar hisson** mein baantna
> (jaise class mein "top 20%", "next 20%"...). Fixed number pe nahi, **ranking** pe based.

## 4.6 Poora example — Kele ki 10 photos

```
Kele ki 10 photos ke decay scores nikale:
   [45, 3, 62, 12, 8, 71, 25, 5, 38, 18]

Sort kiya (chhote se bade):
   [3, 5, 8, 12, 18, 25, 38, 45, 62, 71]

5 barabar hisse (har hisse mein 2 photos):

   Score  3,  5   →  very_fresh       😍  (sabse saaf)
   Score  8, 12   →  fresh            🙂
   Score 18, 25   →  slightly_rotten  😐
   Score 38, 45   →  rotten           😟
   Score 62, 71   →  very_rotten      🤢  (sabse ganda)
```

**Bas! 2 labels se 5 labels ban gaye — bina ek bhi photo manually dekhe!** 🎉
Ab in 5-label wale photos se **freshness_classifier_v2.h5** train ho gaya.

## 4.7 Ek similar code jo repo mein hai: `classify_dataset.py`

**Ek imaandaar baat:** HSV pseudo-labeling wala **original script repo mein nahi hai**
(wo Jupyter notebook mein tha — `strip_comments.py` se pata chalta hai ki `Untitled1.ipynb` naam ki
notebook thi jo yahaan committed nahi hui). Uska process `INTERVIEW_PREP.md` mein documented hai.

**Par** ek bahut related script repo mein hai: **`classify_dataset.py`**.
Ye **usi bucketing philosophy** ka dusra roop hai — bas HSV colour ki jagah
**trained model ke output** ko use karta hai. Isko samajhna easy hai aur presentation mein
"maine dataset ko 5 folders mein organize bhi kiya" bolne ke kaam aata hai.

```python
# Model classes: {0:'fresh', 1:'rotten', 2:'slightly_rotten', 3:'very_fresh', 4:'very_rotten'}
weights = np.array([1.5, 3.5, 2.5, 1.0, 4.5])   # index-wise "kitna rotten" ka number
scores = np.sum(preds * weights, axis=1)         # weighted average = continuous score
```

**Ye kya kar raha hai — step by step:**

Har freshness class ko ek **"rottenness number"** de diya (1 = sabse taaza, 4.5 = sabse sada):

| Index | Class | Weight | Matlab |
|---|---|---|---|
| 3 | very_fresh | **1.0** | Sabse taaza |
| 0 | fresh | **1.5** | Kaafi taaza |
| 2 | slightly_rotten | **2.5** | Beech mein |
| 1 | rotten | **3.5** | Kharab |
| 4 | very_rotten | **4.5** | Sabse kharab |

Phir model ke probabilities × weights ka **weighted average** nikaal ke ek **continuous score (1 se 5)** banaya:

```
Maan lo model bola:
  fresh=0.20, rotten=0.10, slightly=0.50, very_fresh=0.15, very_rotten=0.05

score = (0.20×1.5) + (0.10×3.5) + (0.50×2.5) + (0.15×1.0) + (0.05×4.5)
      =    0.30    +    0.35    +    1.25    +    0.15    +    0.225
      = 2.275
```

Phir score ko 5 buckets mein daal diya:

```python
if   score < 1.8:  "1_Fresh"
elif score < 2.6:  "2_Slightly_Rotten"      # ← 2.275 yahaan aayega
elif score < 3.4:  "3_Moderately_Rotten"
elif score < 4.2:  "4_Severely_Rotten"
else:              "5_Fully_Rotten"
```

Aur script phir har photo ko uske folder mein **copy** kar deti hai + ek **CSV report** banati hai.

> **Ek continuous score kyun banaya, seedha `argmax` kyun nahi?**
> Kyunki `argmax` sirf **sabse bada** wala uthata hai aur baaki 4 ki information **fenk deta hai**.
> Weighted average **saari 5 probabilities ko count** karta hai — matlab model ka
> "confusion" bhi capture ho jaata hai. Agar model 50-50 confuse hai `fresh` aur `rotten` mein,
> toh score beech mein aayega — jo **zyada honest** hai. 👌

## 4.8 Pseudo-labeling ki limitations (ye bolna zaroori hai — honesty impress karti hai)

| Limitation | Explanation |
|---|---|
| **Forced 20-20-20-20-20 split** | Agar dataset mein sach mein 80% fresh photos hain, toh bhi ye zabardasti 20% ko `very_rotten` bol dega. **Ye ek assumption hai, sach nahi.** |
| **Sirf colour dekhta hai** | Ek fruit andar se sada ho par bahar se theek dikhe → miss ho jayega. Smell, softness, mould texture — kuch nahi dekhta. |
| **Background pe dependent** | Agar background bhi colourful ho, toh saturation-based mask fail kar sakta hai. |
| **Ye labels "weak" hain** | Ye ground truth **nahi** hain. Yahi wajah hai ki accuracy 80% pe ruk gayi aur calibration hack lagana pada. |

**Future improvement:** Thoda sa data **manually** label karo (jaise 500 photos), usse pseudo-labels ko
**verify** karo, aur mixed approach (semi-supervised learning) use karo. 🚀

---

# 5. Model Training Ki Strategy (Transfer Learning, Phase 1 & Phase 2)

## 5.1 Transfer Learning kya hai?

> **Transfer Learning (ekdum simple meaning):**
> Ek model jo **pehle se kisi bade kaam pe train ho chuka hai**, usko utha ke apne **naye chhote kaam**
> ke liye use karna. Zero se shuru mat karo — kisi ki seekhi hui cheez **udhaar** le lo.

**Bacche wali example (best example) 🚲:**

> Tumhe **bike (motorcycle) chalani seekhni hai.**
>
> **Tarika 1 (from scratch):** Kabhi cycle nahi chalayi. Balance seekho, brake seekho, road samjho,
> gir-gir ke chot khao... **6 mahine lagenge.** 😭
>
> **Tarika 2 (transfer learning):** Tumhe **cycle already aati hai!** Balance ✅ brake ✅ steering ✅
> — ye sab **transfer** ho gaya. Ab sirf **naya** seekhna hai: clutch, gear, accelerator.
> **1 hafta bas!** 🎉

**Bilkul yahi humne kiya:**

MobileNetV2 ne **ImageNet** (14 lakh photos, 1000 classes) pe pehle hi seekh liya tha:
- Edges kaise dikhte hain ✅
- Colours kaise samajhne hain ✅
- Round shapes, textures ✅
- Chikni vs khurdari surface ✅

**Ye saara "aankh ka gyaan" fruits ke liye bhi 100% kaam ka hai!**
Humein bas **naya** sikhana tha: *"in features ko dekh ke batao ye 14 mein se kaunsa fruit hai."*

**Kyun zaroori tha?**
- Humara dataset **chhota** tha (~20,000 photos). Scratch se CNN train karne ke liye
  **lakhon** photos chahiye hote — nahi toh **overfitting** (ratta) pakka.
- Scratch training mein **din-hafte** lagte GPU pe. Transfer learning mein **minutes-ghante**.

## 5.2 Training Data Ki Taiyaari (`model_code.py`)

### Step A — Saari photos ki list banao

```python
filepaths = []
labels = []
for fruit_folder in sorted(os.listdir(dataset_path)):       # apple, banana, ...
    for sub_folder in os.listdir(fruit_path):                # fresh, rotten
        for img_name in os.listdir(sub_path):
            filepaths.append(img_path)
            labels.append(fruit_folder)   # ← DHYAAN DO: label sirf FRUIT ka naam hai!

data = pd.DataFrame({"filepath": filepaths, "label": labels})
```

**Yahaan ek CHATUR trick hai** 🧠:
`fresh/` aur `rotten/` **dono** folders ki photos ka label **same** rakha — sirf `"apple"`.

**Kyun?** Kyunki ye **identifier model** hai. Uska kaam sirf itna hai: *"ye apple hai."*
Sada hua apple bhi **apple hi hai na!** 😄
Toh model ko dono tarah ke apples dikha ke wo **zyada strong** ban gaya —
sirf perfect chamakte apples pe depend nahi karta.

### Step B — Train / Validation Split

```python
train_data, val_data = train_test_split(
    data,
    test_size=0.2,           # 80% training, 20% validation
    stratify=data["label"],  # ← ye sabse important hai
    random_state=42          # ← result reproducible rahe
)
```

> **Training set (simple meaning):** Wo photos jinse model **seekhta** hai. = Sample papers 📚
> **Validation set (simple meaning):** Wo photos jo model ne **kabhi nahi dekhi**, sirf **test** ke liye. = Final exam 📝
>
> **Alag rakhna kyun zaroori hai?** Agar model ko usi photo pe test karo jo usne padhi hai,
> toh wo **cheating** hai! Wo toh ratta maar ke bhi 100% le aayega. Asli imtihaan **nayi** photo pe hota hai.

> **`stratify` (simple meaning):** "Har class ka **proportion** train aur validation dono mein **same** rakho."
> **Bina stratify:** ho sakta hai saare 200 strawberry photos **training** mein chale jaayein
> aur validation mein **ek bhi nahi** → tumhe pata hi nahi chalega ki model strawberry pe kaisa hai! ❌
> **Stratify ke saath:** 160 training mein, 40 validation mein — **hamesha proportional.** ✅

> **`random_state=42` (simple meaning):** Random shuffling ka **"seed"** fix kar diya.
> Isse **har baar wahi split** milta hai. Kal dubara chalao → same result.
> **Reproducibility** ke liye zaroori hai (taaki tum bol sako "mera result verify kar lo").
> *(42 ka koi scientific matlab nahi — bas programmers ka favourite joke number hai 😄
> "Hitchhiker's Guide to the Galaxy" se.)*

### Step C — Data Generators

```python
train_datagen = ImageDataGenerator(preprocessing_function=preprocess_input)
val_datagen   = ImageDataGenerator(preprocessing_function=preprocess_input)

img_size = 224
batch_size = 32

train_generator = train_datagen.flow_from_dataframe(
    dataframe=train_data,
    x_col="filepath", y_col="label",
    target_size=(224, 224),
    batch_size=32,
    class_mode="categorical",
    shuffle=True                  # training mein shuffle ZAROORI
)

val_generator = ... shuffle=False  # validation mein shuffle NAHI
```

> **Generator (simple meaning):** Ek **waiter** jo kitchen se **thodi-thodi** plates laata rehta hai.
> **Kyun zaroori?** 20,000 photos ek saath RAM mein daaloge toh computer **hang** ho jayega! 💥
> Generator 32-32 photos ka batch bana ke deta hai, model use karta hai, phir wo memory free kar deta hai.
> **Bilkul waise:** shaadi mein saara khaana ek saath table pe nahi rakhte — round-by-round serve karte hain. 🍽️

> **Batch size = 32 (simple meaning):** Ek baar mein 32 photos ka group model ko dikhate hain.
> Model 32 photos dekh ke apni galtiyaan samajhta hai, phir ek baar apne "knobs" adjust karta hai.
> **Chhota batch** = zyada baar update, par shor (noisy). **Bada batch** = smooth, par zyada RAM.
> **32 = sweet spot**, industry mein sabse common. 👌

> **`shuffle=True` training mein kyun?** Agar photos order mein aayein (pehle saare apple, phir saare banana),
> toh model pehle sirf apple bolna seekh lega, phir sirf banana. **Mix karo taaki har batch mein variety ho.** 🔀
>
> **`shuffle=False` validation mein kyun?** Taaki **predictions ka order** = **actual labels ka order** rahe,
> aur confusion matrix theek se ban sake. Test mein order badalne se comparison bigad jaata hai.

> **`class_mode="categorical"` (simple meaning):** Labels ko **one-hot** format mein do.
> **One-hot (simple meaning):** Naam ki jagah 0-1 ki list.
> `"apple"` → `[1,0,0,0,0,0,0,0,0,0,0,0,0,0]` (sirf 0th position pe 1)
> `"banana"` → `[0,1,0,0,0,0,0,0,0,0,0,0,0,0]` (sirf 1st position pe 1)
> **Kyun?** Kyunki model numbers pe kaam karta hai, shabdon pe nahi.
> Aur agar seedha `apple=0, banana=1, tomato=13` likhte toh model soch leta ki
> "tomato apple se 13 guna zyada hai" — jo **bakwaas** hai! One-hot ye galat-fehmi rokta hai. ✅

## 5.3 🏗️ PHASE 1 — Feature Extraction (Frozen Backbone)

```python
base_model = MobileNetV2(input_shape=(224,224,3), include_top=False, weights="imagenet")
base_model.trainable = False          # ⭐ SAB FREEZE
```

> **Freeze (simple meaning):** Model ke us hisse ke knobs pe **taala laga do** — training mein wo
> **bilkul nahi badlenge**. Sirf naya head badlega.

**Ye phase kya karta hai:**

```
📷 Photo
   ↓
🧊 MobileNetV2 backbone (FROZEN — taala laga hai 🔒)
   ↓  1280 features nikaalta hai (ye ImageNet ka gyaan hai, isko nahi chhedna)
🔥 Custom head (TRAINABLE — yahi seekh raha hai)
   GlobalAvgPool → Dense(128) → Dropout(0.3) → Dense(14, softmax)
   ↓
🎯 Answer
```

**Kya train hua?** Sirf **~1.66 lakh** parameters (head ke). Backbone ke 22 lakh chhue hi nahi. ⚡

**Config:**
```python
model.compile(
    optimizer="adam",
    loss="categorical_crossentropy",
    metrics=["accuracy"]
)
history = model.fit(train_generator, validation_data=val_generator, epochs=5)
```

> **Optimizer (simple meaning):** Wo mechanic jo decide karta hai **kaunsa knob kitna ghumana hai**.
> **Adam** = sabse popular optimizer, har knob ke liye apne aap sahi speed choose kar leta hai.
> **Jaise:** Ek smart teacher jo har bacche ko uski speed se padhata hai. 🧑‍🏫

> **Loss (simple meaning):** Ek number jo batata hai **model kitna galat hai**.
> `Loss = 0` matlab perfect. Bada loss matlab zyada galtiyaan.
> Training ka **poora maqsad** = loss ko **kam** karna.
> **Categorical crossentropy** = multi-class classification ke liye standard loss formula.
> Ye khaas taur pe **confident galti** ko zyada sazaa deta hai
> (model ne 99% confidence se galat bola → bahut bada loss! 😬)

> **Epoch (simple meaning):** **Poori training book ek baar padhna.**
> `epochs=5` = model ne saari 16,000 training photos **5 baar** dekhi.
> **Jaise:** exam se pehle poora syllabus 5 baar revise karna. 📖

**Phase 1 ka result: ~77.8% validation accuracy** (freshness classifier ka)

**77.8% ka matlab:** Model ne 100 nayi photos mein se **78 sahi** batayi. Bura nahi, par aur behtar ho sakta tha!

## 5.4 🔥 PHASE 2 — Fine-Tuning (Last 30 layers unfreeze)

**Ab thodi hoshiyari:** Backbone ki **aakhri 30 layers ka taala khol do**, baaki lock rehne do.

```python
base_model.trainable = True
for layer in base_model.layers[:-30]:      # last 30 chhod ke baaki sab
    layer.trainable = False                # ← wapas freeze

model.compile(
    optimizer=Adam(learning_rate=0.00001),   # ⚠️ BAHUT chhoti learning rate!
    loss="categorical_crossentropy",
    metrics=["accuracy"]
)
model.fit(train_generator, validation_data=val_generator, epochs=5)
```

**Ye phase kya karta hai:**

```
📷 Photo
   ↓
🧊 MobileNetV2 ki pehli ~124 layers   (FROZEN 🔒 — generic gyaan)
   ↓
🔥 MobileNetV2 ki aakhri 30 layers    (UNFROZEN 🔓 — ab fruits ke liye adjust ho rahi hain)
   ↓
🔥 Custom head                        (UNFROZEN 🔓)
   ↓
🎯 Behtar answer
```

### ❓ Sirf last 30 layers hi kyun?

**Yaad karo section 3.1 ka school example:**

| Layers | Kya seekhti hain | Chhedni chahiye? |
|---|---|---|
| **Shuruaati (1-20)** | Lines, edges, corners, basic colours | ❌ **Nahi!** Ye har photo mein same hoti hain — kele ki edge aur car ki edge, dono edge hi hain. **Already perfect hain.** |
| **Beech wali (20-124)** | Textures, patterns, general shapes | ❌ Mostly nahi — ye bhi kaafi general hain |
| **Aakhri (125-154)** | **Task-specific** cheezein — "ye kutte ka muh hai", "ye car ka pahiya hai" | ✅ **HAAN!** Ye ImageNet ke liye specific hain. Inhe **fruits** ke liye adjust karna chahiye. |

> **Bacche wali example:** Ek Physics ka professor Chemistry padhane laga.
> - Uska **basic maths, logic, padhaane ka tareeka** ✅ same rahega (**freeze**)
> - Bas **Chemistry ke topics** naye seekhne padenge (**unfreeze**)
> - **Poora dimaag reset karne ki zaroorat nahi hai!** 🧠

### ❓ Learning rate 0.00001 kyun (itni chhoti)?

> **Learning rate (simple meaning):** Har step mein knobs ko **kitna** ghumana hai.
> **Bada LR** = bade kadam (fast, par target ke aage-peeche kood sakte ho)
> **Chhota LR** = chhote kadam (slow, par precise)

**Yahaan chhoti kyun rakhi?**
> Pretrained weights **bahut keemti** hain — Google ne unhe 14 lakh photos pe train kiya tha.
> Agar tum badi learning rate lagaoge, toh pehle hi update mein wo **saara gyaan bigad jayega**.
> Isko **"catastrophic forgetting"** kehte hain *(simple meaning: **poora seekha hua achanak bhool jaana**)*.
>
> **Jaise:** Ek pro cricketer ki technique thodi si improve karni hai.
> Tum use bologe *"apna poora batting style badal do"*? ❌ Barbaad ho jayega!
> Tum bologe *"bas hathodi 2 degree ghumao"* ✅ Ye chhoti learning rate hai. 🏏

**Phase 2 ka result: ~80.4% validation accuracy**

**Improvement: 77.8% → 80.4% = +2.6%** ✅
Sunne mein chhota lagta hai, par ML mein **har 1% bhi bahut mehnat** se aata hai — aur ye poora fayda
sirf **5 extra epochs** mein mil gaya.

## 5.5 Do phase kyun, seedha sab unfreeze karke train kyun nahi?

**Ye ek CLASSIC interview question hai. Answer yaad kar lo:** 🎯

**Agar shuru mein hi sab kuch unfreeze karke train karte:**

```
Shuruwat mein humara custom head bilkul RANDOM hota hai (untrained).
   ↓
Random head → BAHUT galat predictions → BAHUT bada loss
   ↓
Bada loss → BAHUT BADE gradients (galti sudharne ka bada signal)
   ↓
Ye bade gradients backbone tak pahunchte hain
   ↓
💥 ImageNet ke keemti pretrained weights TABAAH! 💥
```

> **Gradient (simple meaning):** Ek "arrow" jo batata hai — knob ko **kis taraf** aur **kitna** ghumao
> taaki galti kam ho. Bada gradient = bada dhakka. 🏹

**Isliye 2 phase:**
1. **Phase 1:** Pehle head ko **thoda samajhdaar** bana lo (backbone ko lock rakh ke). Ab head ke
   predictions kaafi sahi hain → gradients **chhote** ho gaye hain. ✅
2. **Phase 2:** **Ab** backbone ka thoda hissa kholo — ab jo chhote gradients aayenge wo backbone ko
   **bigadenge nahi, sirf polish karenge.** ✨

> **Bacche wali example:** Naya intern office join karta hai.
> **Din 1 pe usko CEO ki chair pe nahi bithate!** 😂
> Pehle wo chhote kaam karta hai, company samajhta hai (**Phase 1**),
> phir dheere-dheere use bade decisions mein shaamil karte hain (**Phase 2**). 💼

## 5.6 Overfitting kaise roka? (3 tareeke)

| # | Technique | Kaise kaam karta hai |
|---|---|---|
| 1 | **Dropout(0.3)** | Training mein har baar 30% neurons randomly band. Model kisi ek neuron pe depend nahi kar sakta → majboori mein **samajhna** padta hai. |
| 2 | **Frozen backbone** | 22 lakh mein se sirf 1.66 lakh knobs trainable the. Kam knobs = ratta maarne ki kam gunjaish. |
| 3 | **Validation set monitoring** | Har epoch mein `val_accuracy` dekhi. Agar training accuracy badhti par validation girti → overfitting ka signal. |

## 5.7 Model ki jaanch (Evaluation)

`model_code.py` ke end mein evaluation ka code hai:

```python
predictions = model.predict(val_generator)
predicted_classes = np.argmax(predictions, axis=1)
true_classes = val_generator.classes

cm = confusion_matrix(true_classes, predicted_classes)
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', ...)
print(classification_report(true_classes, predicted_classes, target_names=class_names))
```

> **Confusion Matrix (simple meaning):** Ek **table jo batata hai model kahan-kahan confuse hua.**
> Rows = asli answer, Columns = model ka answer.
> **Diagonal (tirchi line) = sahi answers** — jitni gehri diagonal, utna achha model! 💪
> Off-diagonal cells batate hain **kaun kis se confuse ho raha hai**
> (jaise "apple ko 12 baar tomato bola" — dono laal aur gol hain, samajh aata hai! 🍎🍅)

> **Precision (simple meaning):** *"Jab maine 'apple' bola, tab main kitni baar sahi tha?"*
> **Recall (simple meaning):** *"Jitne asli apples the, unme se maine kitne pakde?"*
> **F1-score (simple meaning):** Dono ka balance (harmonic mean) — ek hi number mein poori kahani.

---

# 6. Frontend aur Backend Ka Tech Stack

## 6.1 Pehle: Frontend aur Backend kya hote hain?

> **Frontend (simple meaning):** Jo **user ko dikhta hai** — buttons, colours, images, animations.
> **= Restaurant ka dining area** 🍽️ (sundar tables, waiter, menu card)
>
> **Backend (simple meaning):** Jo **peeche chhupa hua** kaam karta hai — asli calculation, AI models.
> **= Restaurant ka kitchen** 👨‍🍳 (yahi asli khaana banta hai, customer nahi dekhta)
>
> **API (simple meaning):** Dono ke beech ka **waiter** — order le jaata hai, khaana wapas laata hai. 🧑‍🍳

## 6.2 Poora Tech Stack (ek table mein)

| Layer | Technology | Version | Kaam |
|---|---|---|---|
| **Frontend framework** | React | 19.2 | UI banane ke liye |
| **Build tool** | Vite | 8.2 | Code ko fast bundle/serve karna |
| **Linter** | oxlint | 1.79 | Code ki galtiyaan pakadna |
| **Styling** | Plain CSS | — | ~628 lines, koi CSS framework nahi |
| **Fonts** | Outfit + JetBrains Mono | — | Google Fonts se |
| **Backend framework** | FastAPI | — | JSON API server |
| **Server** | Uvicorn | — | FastAPI ko chalane wala engine |
| **File uploads** | python-multipart | — | Image upload handle karna |
| **ML framework** | TensorFlow / Keras | — | Models load aur run karna |
| **Image processing** | Pillow (PIL) | — | Photo kholna, resize karna |
| **Math** | NumPy | — | Arrays aur calculations |
| **Training-time only** | Pandas, scikit-learn, Matplotlib, Seaborn | — | Data handling, split, graphs |
| **Old prototype** | Streamlit | — | `app.py` — pehla version |

## 6.3 🔧 BACKEND — FastAPI (`backend/main.py`)

### FastAPI kya hai aur kyun choose kiya?

> **FastAPI (simple meaning):** Python ka ek modern tool jisse **web API** banate hain — matlab
> aisa program jo internet pe request sun-ta hai aur JSON mein jawab deta hai.

**Kyun choose kiya:**

| Fayda | Explanation |
|---|---|
| ⚡ **Fast** | Python ke sabse tez frameworks mein se ek (async support ke saath) |
| 📝 **Auto documentation** | `http://127.0.0.1:8010/docs` kholo → **apne aap** ek interactive API testing page ban jaata hai. **Demo mein ye dikhana zabardast lagta hai!** ⭐ |
| ✅ **Auto validation** | File type, size, format khud check karta hai |
| 🐍 **Simple Python** | Bas decorator `@app.post(...)` lagao, ho gaya |

### API ke 3 endpoints

> **Endpoint (simple meaning):** API ka ek **address** jahan tum request bhej sakte ho.
> Jaise dukaan ke alag-alag counters: "Bill counter", "Return counter". 🏪

| Method | Endpoint | Kaam | Response |
|---|---|---|---|
| `GET` | `/api/health` | "Server zinda hai? Models load ho gaye?" | `{"status":"ready", "models":[...]}` ya `503` error |
| `GET` | `/api/classes` | "Tum kaunse fruits jaante ho?" | 14 produce + 5 freshness names |
| `POST` | `/api/predict` | **Asli kaam** — photo bhejo, analysis lo | Poora result JSON |

> **GET vs POST (simple meaning):**
> **GET** = "mujhe kuch **do**" (bas information maangna) 📥
> **POST** = "main tumhe kuch **de** raha hoon, uspe kaam karo" (data bhejna) 📤

### Model Loading — `lifespan` ka smart use

```python
@asynccontextmanager
async def lifespan(_: FastAPI):
    try:
        get_models()
        print("[Fresh Vision] Models loaded.")
    except Exception as exc:
        print(f"[Fresh Vision] Model load failed: {exc}")
    yield

app = FastAPI(title="Fresh Vision API", version="1.0.0", lifespan=lifespan)
```

**Ye kya kar raha hai:** Server **start hote hi ek baar** teeno models RAM mein load kar leta hai.

**Kyun important hai?** 🔥
Models load hone mein **5-10 second** lagte hain (35 MB ke files hain!).
- ❌ **Agar har request pe load karte:** har user ko 10 second wait — **bahut kharab experience**
- ✅ **Ek baar load karke rakh liya:** har request mein sirf **~700 ms** lagta hai

> **Jaise:** Restaurant subah **ek baar** oven garam karta hai, phir din bhar khaana banata hai.
> Har order pe oven dubara garam nahi karta! 🔥

**Aur ek detail — `get_models()` cache karta hai:**
```python
MODELS = {}
def get_models():
    if MODELS:            # ← agar pehle se load hain, wahi wapas do
        return MODELS
    ...                   # warna load karo
```

**Aur error handling smart hai:** Agar model load fail ho jaye, server **crash nahi** hota —
bas `/api/health` `503` return karta hai aur frontend ek helpful banner dikha deta hai. 👌

### Security aur Safety measures ⭐

Ye bolna presentation mein bahut achha lagega — dikhta hai ki tumne **production ke baare mein socha**:

```python
raw = await file.read()
if not raw:
    raise HTTPException(status_code=400, detail="Empty file upload.")
if len(raw) > 10 * 1024 * 1024:                              # 10 MB cap
    raise HTTPException(status_code=413, detail="Image too large (max 10 MB).")
try:
    img = Image.open(io.BytesIO(raw)); img.load()
except Exception:
    raise HTTPException(status_code=400, detail="Unsupported or corrupt image file.")
```

| Safety | Kyun |
|---|---|
| **Khaali file check** | Galat request pe crash na ho |
| **10 MB ka limit** | Koi 500 MB ki file bhej ke server ko **hang** na kar de (DoS attack se bachav) |
| **Corrupt file check** | Agar `.jpg` naam ki file mein asli image na ho, toh polite error do, crash mat karo |
| 🔒 **Disk pe kuch save NAHI hota** | `io.BytesIO(raw)` — sab **RAM mein**. User ki photo server pe **kabhi store nahi hoti** → **privacy!** ⭐ |

### Latency aur Preview

```python
started = time.perf_counter()
result = analyze(img)
result["latencyMs"] = round((time.perf_counter() - started) * 1000, 1)

thumb = img.convert("RGB"); thumb.thumbnail((640, 640))
buf = io.BytesIO(); thumb.save(buf, format="JPEG", quality=88)
result["preview"] = "data:image/jpeg;base64," + base64.b64encode(buf.getvalue()).decode()
```

- **Latency** = kitne **milliseconds** lage. UI mein dikhta hai — user ko lagta hai app **transparent** hai. ⏱️
- **Preview** = server wahi photo (640px thumbnail) **wapas bhejta hai** base64 mein, taaki user ko
  **wahi dikhe jo model ne dekha** — koi confusion nahi.

> **Base64 (simple meaning):** Photo ko **text (letters aur numbers) mein badal dena**, taaki wo
> JSON ke andar bheji ja sake (JSON mein sirf text bhej sakte hain, raw image nahi).

### CORS Middleware

```python
app.add_middleware(CORSMiddleware, allow_origins=["*"], ...)
```

> **CORS (simple meaning):** Browser ka ek **suraksha niyam** — "port 5180 pe chal rahi website
> port 8010 wale server se **baat nahi kar sakti**" (kyunki wo alag "origin" hai).
> `allow_origins=["*"]` = "sabko permission hai" — development mein zaroori hai.
> **Production mein isko specific domain pe restrict karna chahiye** (ye bolna achha lagega 👍).

### Ek Cheez Aur — Production Mode (bahut smart design)

```python
DIST = os.path.join(ROOT, "frontend", "dist")

if os.path.isdir(DIST):
    app.mount("/assets", StaticFiles(directory=os.path.join(DIST, "assets")), name="assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    def spa(full_path: str):
        candidate = os.path.join(DIST, full_path)
        if full_path and os.path.isfile(candidate):
            return FileResponse(candidate)
        return FileResponse(os.path.join(DIST, "index.html"))
```

**Ye kya kar raha hai:**

| Mode | Kaise chalta hai |
|---|---|
| **Development** | 2 servers: Vite (port 5180) + FastAPI (port 8010). Vite `/api` ko backend pe **proxy** kar deta hai. |
| **Production** | `npm run build` chalao → `frontend/dist/` folder ban jaata hai → **FastAPI khud UI serve karta hai!** Sirf **1 server, 1 port** (8010). Deploy karna bahut aasan. 🚀 |

> **SPA fallback (simple meaning):** React ek **Single Page Application** hai — saare "pages"
> ek hi `index.html` mein hote hain. Toh koi bhi URL aaye (`/about`, `/analyze`),
> server wahi `index.html` bhej deta hai, aur React decide karta hai kya dikhana hai.

## 6.4 🎨 FRONTEND — React + Vite

### React kya hai?

> **React (simple meaning):** Website ko **chhote-chhote LEGO blocks (components)** mein todne ka tareeka.
> Har block apna kaam karta hai, aur sab jud ke poori website banate hain. 🧱

> **Component (simple meaning):** Ek **reusable UI ka tukda** — jaise NavBar, Button, ResultCard.
> Ek baar likho, jitni baar chaho use karo.

### Vite kya hai?

> **Vite (simple meaning):** Ek **super fast** development tool.
> **Iska sabse bada fayda:** Tum code save karte ho → browser mein **turant** (< 1 second) change dikhta hai,
> **bina page refresh kiye**. Isko **HMR (Hot Module Replacement)** kehte hain.
> **Jaise:** khaana banate waqt beech mein **chakh ke** namak adjust karna — poora dubara nahi banana padta! 🧂

**Vite ka config (`vite.config.js`):**
```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5180,
    proxy: {
      '/api': { target: 'http://127.0.0.1:8010', changeOrigin: true },
    },
  },
})
```

> **Proxy (simple meaning):** Ek **daakiya**. Frontend `/api/predict` pe request bhejta hai
> (uske hisaab se apne hi server pe), par Vite chupke se use **port 8010** (FastAPI) pe forward kar deta hai.
> Isse frontend ka code **saaf** rehta hai — usko backend ka address hard-code karne ki zaroorat nahi. 📮

### Saare Components (file-by-file)

```
frontend/src/
├── main.jsx                  ← Entry point (React yahaan se shuru hota hai)
├── App.jsx                   ← 🧠 MAIN BRAIN — saara state yahaan hai
├── index.css                 ← Base styles (80 lines)
├── styles/app.css            ← Main styles (548 lines)
├── lib/
│   ├── api.js                ← Backend se baat karne ke functions
│   └── format.js             ← Helper functions (colours, validation, score)
└── components/
    ├── NavBar.jsx            ← Upar ki navigation bar + health indicator
    ├── Hero.jsx              ← Bada welcome section + stats
    ├── Dropzone.jsx          ← Drag-drop / click / paste upload box
    ├── ResultPanel.jsx       ← Result dikhane wala panel
    ├── ScoreDial.jsx         ← Gol circular progress meter (SVG)
    ├── ConfidenceBar.jsx     ← Horizontal percentage bars
    └── Sections.jsx          ← How It Works, Coverage, FAQ, Footer
```

**Har component ka kaam:**

| Component | Kaam | Interesting detail |
|---|---|---|
| **`App.jsx`** | Poore app ka **dimaag** — file, result, loading, error sab yahaan store hota hai | `useState` se state, `useEffect` se health check |
| **`NavBar.jsx`** | Upar ki bar + backend ka **live status dot** (🟢 online / 🟡 connecting / 🔴 offline) | Scroll karne pe bar ka look badal jaata hai |
| **`Hero.jsx`** | Welcome section: "14 classes, 5 levels, 3 networks, <1s" | Bade numbers dekh ke user ko trust hota hai |
| **`Dropzone.jsx`** | Upload box — **3 tareeke**: drag-drop, click, **Ctrl+V paste** 📋 | Paste support extra polish hai! |
| **`ResultPanel.jsx`** | 4 states dikhata hai: Empty, Loading, Error, Result | Loading mein 4 steps ki animation |
| **`ScoreDial.jsx`** | Gol meter — pure **SVG maths** se banaya | `circumference = 2πr`, `offset` se arc fill hoti hai |
| **`ConfidenceBar.jsx`** | Percentage ki horizontal bar | Colour props se aata hai |
| **`Sections.jsx`** | Bottom sections + **`Reveal`** animation wrapper | `IntersectionObserver` se scroll pe fade-in |

### 🌟 Best UX detail — Auto-analysis

```javascript
const handleFile = useCallback(
  (nextFile) => {
    setSelection(nextFile)
    runAnalysis(nextFile)     // ← photo select hote hi TURANT analysis!
  },
  [runAnalysis, setSelection],
)
```

**User ko "Analyze" button dabane ki zaroorat hi nahi!** Photo daalo → result aa jaata hai. 🎯
(Button phir bhi hai — "Re-run analysis" ke liye.)

### 🌟 AbortController — race condition se bachav (advanced, ye bolo!) ⭐

```javascript
const abortRef = useRef(null)

const runAnalysis = useCallback(async (target) => {
    abortRef.current?.abort()                 // ← purani request CANCEL karo
    const controller = new AbortController()
    abortRef.current = controller
    ...
    const data = await predict(subject, controller.signal)
    if (controller.signal.aborted) return     // ← cancelled ka result mat dikhao
```

**Problem jo ye solve karta hai:**
```
User photo A daalta hai   → request A shuru (2 second lagenge)
User turant photo B daalta hai → request B shuru (1 second lagega)
   ↓
Request B pehle wapas aayi ✅  → screen pe B ka result
Request A baad mein aayi 😱   → screen pe A ka result aa gaya!
   ↓
❌ User photo B dekh raha hai, par result A ka dikh raha hai! GALAT!
```
**Solution:** Nayi request shuru karne se pehle **purani ko cancel** kar do. ✅

> **Race condition (simple meaning):** Do kaam **race** laga rahe hain, aur kaun pehle
> finish karega ye pata nahi — isliye galat result dikh sakta hai.
> **Ye ek advanced bug hai jo bahut developers miss kar dete hain — isko handle karna impressive hai!** 🏆

### 🌟 Memory leak se bachav

```javascript
const objectUrlRef = useRef(null)

const setSelection = useCallback((nextFile) => {
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)  // ← purana free karo
    const url = URL.createObjectURL(nextFile)
    objectUrlRef.current = url
    ...
})
```

> **`URL.createObjectURL` (simple meaning):** Browser ki memory mein photo ka ek temporary address banata hai
> taaki `<img src=...>` mein dikha sakein. Par **ye apne aap saaf nahi hota!**
> Agar user 50 photos daale aur hum purane URLs `revoke` na karein → browser ki **memory bharti jayegi** → app slow.
> Isliye har baar naya banane se pehle purana **free** kar dete hain. 🧹

### Client-side validation (`lib/format.js`)

```javascript
export function validateFile(file) {
  if (!file) return 'No file selected.'
  if (!file.type.startsWith('image/')) return 'That file is not an image.'
  if (!ACCEPTED_TYPES.includes(file.type)) return 'Use a JPG, PNG, WEBP or BMP image.'
  if (file.size > MAX_BYTES) return 'Image is larger than 10 MB.'
  return null
}
```

**Ye backend ke checks ka duplicate hai — jaan-boojh ke!** 🎯
- **Frontend check** = **turant** feedback, server tak jaana hi nahi pada (fast, achha UX)
- **Backend check** = **asli suraksha** (kyunki koi hacker frontend bypass kar sakta hai)

> **Golden rule of web security:** *"Never trust the client."*
> Frontend validation **convenience** ke liye hai, **security** ke liye nahi.
> **Security hamesha backend pe.** 🔒 Ye bolna presentation mein bahut mature lagega. ⭐

### Score Dial ka Maths (`ScoreDial.jsx`)

```javascript
const radius = (size - stroke) / 2                       // 168-12 = 156, /2 = 78
const circumference = 2 * Math.PI * radius               // 2 × 3.14 × 78 ≈ 490
const offset = circumference - (pct / 100) * circumference
```

**Kaise kaam karta hai (bilkul simple):**
- Ek gol circle ka **poora ghera (circumference)** ≈ 490 pixels
- `strokeDasharray = 490` → line ka pattern set kiya
- `strokeDashoffset = offset` → **kitna hissa chhupana hai**
- Agar `pct = 80%` → `offset = 490 - 392 = 98` → **80% dikhega, 20% chhupa** ✅
- `transform="rotate(-90)"` → shuruwat **upar se** ho (3 baje ki jagah 12 baje se) 🕛

> **Class 6 wala geometry! Koi library nahi, sirf `2πr` ka formula.** 🤓

## 6.5 App kaise chalate hain

**Sabse aasan tareeka (`run.sh`):**
```bash
./run.sh
```
Ye script:
1. Check karta hai `frontend/node_modules` hai ya nahi → nahi hai toh `npm install` chalata hai
2. FastAPI backend start karta hai port **8010** pe (background mein)
3. React dev server start karta hai port **5180** pe
4. `trap 'kill ${API_PID}' EXIT` → jab tum Ctrl+C daboge, **dono** band ho jayenge 👍

**Manually:**
```bash
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8010 --reload
# doosre terminal mein:
cd frontend && npm install && npm run dev
```

**Production (single server):**
```bash
cd frontend && npm run build && cd ..
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8010
```

## 6.6 Streamlit se React tak ka safar (evolution) 📈

Project ke **2 versions** hain — ye story presentation mein sunana achha lagta hai:

| | **v1 — `app.py` (Streamlit)** | **v2 — `backend/` + `frontend/`** |
|---|---|---|
| Frontend | Streamlit (Python se HTML) | React 19 + Vite |
| Layers | Ek hi file mein sab kuch | UI aur ML **alag-alag** |
| Speed | Slow (har interaction pe **poora script dubara chalta hai**) | Fast (sirf badla hua hissa re-render) |
| Design control | Bahut limited (CSS hacks se) | 100% control |
| Mobile app bana sakte ho? | ❌ Nahi | ✅ Haan — API kahin se bhi call ho sakti hai |
| Best for | **Quick prototype** ✅ | **Real product** ✅ |

> **Presentation line:** *"Maine pehle Streamlit mein prototype banaya taaki model ki testing
> jaldi ho sake. Jab model kaam karne laga, tab maine architecture ko **decouple** kiya —
> ek FastAPI JSON backend aur ek React frontend. Isse ab wahi backend future mein
> mobile app ya kisi aur client ke saath bhi use ho sakta hai."* ⭐
> **`app.py` ko delete nahi kiya — reference ke liye rakha hai.**

---

# 7. Bonus: File-by-File Map (Kaunsi File Kya Karti Hai)

```
Final_Project/  (repo root)
│
├── 📄 README.md                     Project ka short intro, architecture, API table, setup steps
├── 📄 INTERVIEW_PREP.md             Hinglish notes (isi ka detailed version tum abhi padh rahe ho)
├── 📄 requirements.txt              Python packages: fastapi, uvicorn, tensorflow, numpy, Pillow, streamlit
├── 📄 run.sh                        Ek command mein backend + frontend dono chalu 🚀
├── 📄 .gitignore                    venv, node_modules, __pycache__ ignore karo
│
├── 🧠 fruit_veg_identifier.h5       MODEL 1 — 11.5 MB — 14 fruits pehchaanta hai
├── 🧠 freshness_classifier_v2.h5    MODEL 2 — 23.8 MB — 5 freshness levels batata hai
├── 📄 class_indices.json            {"apple":0, "banana":1, ... "tomato":13} — naam se number ka mapping
│
├── 🐍 model_code.py                 TRAINING SCRIPT — dataset scan → split → generators →
│                                    MobileNetV2 + custom head → train → save → evaluate
├── 🐍 classify_dataset.py           Dataset ko 5 folders (1_Fresh ... 5_Fully_Rotten) mein
│                                    weighted-score bucketing se organize karta hai + CSV report
├── 🐍 strip_comments.py             Utility — Jupyter notebook se Python comments hata deta hai
├── 🐍 app.py                        v1 Streamlit prototype (reference ke liye rakha hai)
│
├── 📁 backend/
│   └── main.py                      ⭐ FastAPI server — 3 endpoints, 3 models, calibration,
│                                    gatekeeper, safety checks, production SPA serving
│
└── 📁 frontend/
    ├── package.json                 React 19, Vite 8, oxlint
    ├── vite.config.js               Port 5180 + /api proxy to 8010
    ├── index.html                   HTML shell, Google Fonts, 🍏 emoji favicon
    ├── .oxlintrc.json               Linter config
    └── src/
        ├── main.jsx                 React ka entry point
        ├── App.jsx                  Main brain — state management
        ├── index.css                Base reset styles
        ├── styles/app.css           Poora design (548 lines)
        ├── lib/api.js               fetch wrappers: checkHealth, fetchClasses, predict
        ├── lib/format.js            validateFile, formatBytes, verdictTheme, scoreOutOfTen
        └── components/              NavBar, Hero, Dropzone, ResultPanel,
                                     ScoreDial, ConfidenceBar, Sections
```

## Ek complete request ka safar (end-to-end trace) 🚂

```
1. 👆 User "apple.jpg" ko dropzone pe drop karta hai

2. 🖥️  Dropzone.jsx → validateFile() → type ✅ size ✅

3. 🖥️  App.jsx → handleFile() → setSelection() + runAnalysis()
       • purana object URL revoke
       • naya preview URL banao
       • purani request abort karo
       • loading = true

4. 🌐 api.js → predict() → FormData mein file daal ke
       POST /api/predict

5. 🔀 Vite proxy → forward to http://127.0.0.1:8010/api/predict

6. 🐍 FastAPI predict()
       • file read → khaali? ❌  10MB se bada? ❌  corrupt? ❌
       • timer start ⏱️

7. 🐍 analyze() → to_tensor()
       • RGB convert → 224×224 resize → array → batch → preprocess_input
       • ab shape hai (1, 224, 224, 3), values -1 se +1 ke beech

8. 🚪 Gatekeeper.predict() → top-5 ImageNet labels
       ["Granny Smith", "orange", "fig", ...]
       → "apple"/"granny smith" keyword mila ✅ → PASS

9. 🍎 identifier.predict() → 14 probabilities
       apple = 0.9642 (sabse bada)
       → 96.42% > 65% ✅ → PASS
       → top-3 nikaal liye UI ke liye

10. 🥀 freshness.predict() → 5 raw probabilities
       → calibration weights lagayi (×0.3, ×1.5, ×2.5)
       → re-normalize
       → argmax = index 3 = "very_fresh" (88.10%)

11. 📦 JSON banaya:
       status: "ok"
       headline: "Very Fresh Apple"
       produceConfidence: 96.42
       freshnessConfidence: 88.10
       topProduce: [apple 96.42, tomato 2.1, guava 0.8]
       freshnessBreakdown: [saare 5, sorted]
       gatekeeper: {label: "Granny Smith", confidence: 71.3}
       shelfLife: "5-7 days"
       latencyMs: 742.3
       preview: "data:image/jpeg;base64,/9j/4AA..."

12. 🖥️  App.jsx → setResult(data) → loading = false

13. 🎨 ResultPanel.jsx render:
       • verdictTheme() → green (#37d67a)
       • scoreOutOfTen() → 9.5
       • ScoreDial → gol meter 9.5/10 green mein
       • ConfidenceBar × N → saare percentages
       • "Peak quality — safe to sell" ✅
```

---

# 8. Bonus: Presentation Ke Liye Ready-Made Answers

### Q1: "Ye project kya karta hai?"
> "Fresh Vision ek AI web app hai jisme aap fruit ya vegetable ki photo upload karte ho, aur ye
> do cheezein batata hai — pehla, ye kaunsa fruit/vegetable hai (14 classes mein se), aur dusra,
> wo kitna fresh ya rotten hai (5 levels mein), saath mein estimated shelf life bhi.
> Use case hai grocery stores aur warehouses mein quality checking ko automate karna."

### Q2: "Teen models kyun, ek kyun nahi?"
> "Kyunki 'ye kaunsa fruit hai' aur 'ye kitna sada hai' — ye do bilkul alag nature ke problems hain.
> Pehla shape aur type pe based hai, dusra colour aur texture pe. Alag models rakhne se har model
> apne kaam mein expert ban jaata hai, aur agar ek kharab kaam kare toh sirf usko retrain karna padta hai.
> Teesra model gatekeeper hai jo out-of-distribution images reject karta hai — ye pretrained hai,
> iski koi training nahi karni padi."

### Q3: "MobileNetV2 hi kyun?"
> "Kyunki wo lightweight hai — sirf 2.2 million parameters, jabki VGG16 mein 138 million hote hain.
> Iska matlab fast inference aur chhota model file, jo ek web app ke liye perfect hai — humara
> pura pipeline 1 second se kam mein chalta hai. Aur accuracy bhi kaafi achhi rehti hai kyunki
> depthwise separable convolutions aur inverted residual blocks isko efficient banate hain."

### Q4: "Pseudo-labeling kya hai aur tumne kaise ki?" ⭐
> "Dataset mein sirf binary labels the — fresh aur rotten. Mujhe 5 fine-grained levels chahiye the,
> par 20,000 photos manually label karna 28 ghante ka kaam tha. Toh maine classical computer vision
> use ki — har image ko HSV colour space mein convert kiya, saturation se fruit ko background se
> separate kiya, phir fruit ke andar brown/dark spots detect karke ek decay score nikala:
> decayed pixels divided by total fruit pixels. Phir har fruit type ke scores ko alag-alag sort karke
> 5 barabar buckets mein baanta. Per-fruit isliye kyunki aloo naturally brown hota hai aur strawberry
> naturally laal — global threshold dono ke saath anyaay karta."

### Q5: "HSV kyun, RGB kyun nahi?" ⭐
> "RGB mein colour aur brightness aapas mein mixed hote hain — ek hi brown patch dhoop mein aur
> chhaya mein bilkul alag RGB values deta hai. HSV mein Hue (rang) alag hota hai aur Value (brightness)
> alag. Toh lighting badalne pe sirf V badalta hai, H same rehta hai — isliye colour-based
> thresholding bahut zyada stable ho jaati hai."

### Q6: "Transfer learning kya hai?"
> "Ek model jo pehle se kisi bade dataset pe train ho chuka hai, uske seekhe hue features ko naye
> chhote task ke liye reuse karna. Maine MobileNetV2 use kiya jo ImageNet ke 1.4 million images pe
> train hai — usko edges, colours, textures already aate hain. Mujhe sirf ye sikhana tha ki in
> features ko dekh ke 14 fruits mein se konsa bataye. Mera dataset chhota tha, toh scratch se
> training mein overfitting ka bahut risk tha."

### Q7: "Do phase mein train kyun kiya?" ⭐
> "Shuruwat mein custom head ke weights bilkul random hote hain, toh predictions bahut galat hote hain
> aur bahut bade gradients paida hote hain. Agar us waqt backbone bhi unfrozen ho, toh wo bade
> gradients ImageNet ke keemti pretrained weights ko tabaah kar denge. Isliye Phase 1 mein sirf head
> train kiya frozen backbone ke saath — 77.8% accuracy mili. Phir Phase 2 mein last 30 layers
> unfreeze karke bahut chhoti learning rate (0.00001) se fine-tune kiya — 80.4% ho gayi.
> Sirf last 30 isliye kyunki shuruwati layers generic features seekhti hain jo har task mein
> useful hain, aakhri layers task-specific hoti hain."

### Q8: "Model ki accuracy kitni hai?"
> "Freshness classifier: Phase 1 mein 77.8% validation accuracy, Phase 2 fine-tuning ke baad 80.4%.
> Ye pseudo-labels ke against measure hui hai, human ground truth ke against nahi — ye main
> honestly mention karta hoon, kyunki pseudo-labels khud approximate hain."

### Q9: "Calibration hack kya hai aur kyun lagaya?"
> "Trained freshness model 'slightly_rotten' ki taraf heavily biased tha aur 'very_rotten' kabhi
> predict hi nahi karta tha — kyunki pseudo-labeling se wo bucket over-represented ho gaya tha.
> Isliye inference time pe maine multipliers lagaye: slightly_rotten ×0.3, rotten ×1.5,
> very_rotten ×2.5, phir re-normalize kiya. Ye ek practical quick-fix hai — proper solution hota
> class weights ke saath retrain karna ya better pseudo-labels banana."

### Q10: "Overfitting kaise roka?"
> "Teen tareeke se — pehla, Dropout(0.3) classification head mein, jisse model kisi ek neuron pe
> depend nahi karta. Dusra, backbone ke zyadatar layers frozen rakhi, toh sirf 1.66 lakh
> parameters trainable the 22 lakh mein se. Teesra, stratified validation set pe har epoch
> monitor kiya taaki pata chale training aur validation accuracy ka gap kab badh raha hai."

### Q11: "Aage kya improve karoge?"
> "Sabse pehle, kuch hazaar images manually label karke pseudo-labels ko validate karunga —
> ya semi-supervised approach use karunga jisme thoda real labelled data ho. Dusra, calibration
> hack hataake proper class weights ke saath retrain karunga. Teesra, data augmentation add karunga
> (rotation, flip, brightness) jisse model real-world photos pe zyada robust ho. Aur chautha —
> Grad-CAM add karunga taaki user ko dikhe ki model ne fruit ke kis hisse ko dekh ke decide kiya."

### Q12: "Frontend mein kya khaas hai?"
> "React 19 aur Vite pe bana hai. Kuch details jo maine dhyaan se handle ki — AbortController se
> race conditions rok di (agar user jaldi-jaldi do photos daale toh purana result naye ke upar
> nahi aayega), URL.revokeObjectURL se memory leaks rok di, aur file validation dono taraf ki hai —
> frontend pe fast feedback ke liye aur backend pe actual security ke liye, kyunki client pe kabhi
> trust nahi karna chahiye. Photo select hote hi analysis apne aap chalu ho jaata hai, aur result
> mein confidence breakdown aur latency dono dikhta hai taaki output auditable rahe."

---

# 9. Honest Limitations (Ye bolna tumhari izzat badhayega)

Agar tum khud apne project ki kamiyaan bata doge, toh audience ko lagega tum **sach mein samajhte ho**.
Ye "weakness" nahi, ye **maturity** hai. 💪

| # | Limitation | Detail | Kaise fix karoge |
|---|---|---|---|
| 1 | **Labels weak hain** | 5 freshness levels **human-verified nahi** hain, wo colour-based heuristic se bane hain | Kuch hazaar images manually label karke validate karo |
| 2 | **Forced equal split** | Bucketing zabardasti 20-20-20-20-20 karti hai, chahe asli distribution alag ho | Fixed thresholds use karo ya real distribution se seekho |
| 3 | **Calibration = band-aid** | Multipliers hardcoded hain, koi data-driven basis nahi | `class_weight` ke saath retrain karo |
| 4 | **80% accuracy** | Production quality (95%+) se kaafi door | Zyada data + augmentation + better labels |
| 5 | **Gatekeeper simple hai** | Keyword matching pe based — `"pot"` aur `"plate"` bhi list mein hain, jo kabhi galat pass kar sakte hain | Ek proper binary "food vs not-food" classifier train karo |
| 6 | **Sirf 14 classes** | Baaki koi bhi fruit daaloge toh galat answer aayega | Aur classes add karo |
| 7 | **Ek fruit per photo** | Agar photo mein 5 fruits hain toh sirf ek hi detect hoga | Object detection (YOLO) add karo |
| 8 | **Sirf bahar ka colour** | Andar se sada hua fruit miss ho jayega | Multi-spectral imaging (research level) |
| 9 | **CORS `*` open hai** | Development ke liye theek, production ke liye nahi | Specific domain pe restrict karo |
| 10 | **Original notebook missing** | HSV pseudo-labeling script repo mein commit nahi hui, sirf documented hai | Notebook ko repo mein add karo (reproducibility ke liye) |

---

## 🎤 Final Elevator Pitch (30 second wala answer)

> "Fresh Vision ek AI web app hai jo fruit/vegetable ki photo se do cheezein batata hai —
> ye kaunsa produce hai (14 classes) aur ye kitna fresh hai (5 levels), estimated shelf life ke saath.
>
> Architecture mein **teen models ka pipeline** hai: ek ImageNet gatekeeper jo galat images reject
> karta hai, ek fine-tuned identifier, aur ek calibrated freshness classifier — teeno MobileNetV2
> pe based hain, transfer learning ke saath, do phases mein train kiye gaye.
>
> Project ka **sabse interesting part** ye hai ki dataset mein sirf binary fresh/rotten labels the.
> Maine classical computer vision use karke — HSV colour space mein decay score nikaal ke aur
> per-fruit quantile bucketing karke — automatically 5 fine-grained pseudo-labels generate kiye,
> bina ek bhi image manually label kiye.
>
> Ship FastAPI backend aur React frontend ke saath hua hai, inference 1 second se kam mein hoti hai,
> aur output fully auditable hai — top-3 guesses, poori freshness distribution aur latency
> sab UI mein dikhta hai."

---

**All the best! 🎉 Ab jaa ke sabko impress kar do. 💪**

---

*Ye document `README.md`, `INTERVIEW_PREP.md`, `model_code.py`, `classify_dataset.py`, `app.py`,
`backend/main.py`, aur poore `frontend/src/` ko padh ke banaya gaya hai.*
