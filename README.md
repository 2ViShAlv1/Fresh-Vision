# Fresh Vision 🍏🔍
**AI-Powered Fruit & Vegetable Quality Analyzer**

Fresh Vision is an intelligent Streamlit web application that uses Deep Learning (MobileNetV2) to identify fruits and vegetables and determine their freshness. 

## Features 🚀
- **Identification:** Accurately classifies various fruits and vegetables.
- **Freshness Detection:** Analyzes the condition of the produce (e.g., Fresh, Slightly Rotten, Very Rotten).
- **Gatekeeper Model:** Prevents invalid images (e.g., random objects or animals) from being misclassified as produce.
- **Modern UI:** Built with an aesthetically pleasing and responsive user interface using Streamlit.

## How to Run Locally 💻

1. **Clone the repository:**
   ```bash
   git clone https://github.com/2ViShAlv1/Fresh_Vision.git
   cd Fresh_Vision
   ```

2. **Create a virtual environment (optional but recommended):**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   ```

3. **Install the dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the Streamlit app:**
   ```bash
   streamlit run app.py
   ```

5. **Upload an image** of a fruit or vegetable in the browser to see the AI analysis!

## Technologies Used 🛠️
- Python
- Streamlit
- TensorFlow / Keras (MobileNetV2)
- Pillow (PIL)
- NumPy
