# PHARMAGENE
### Project Objective
We all experience the same drug working perfectly for one person while causing side effects or do nothing for another. The answer is because of genetics. This project analyzes how certain genes metabolize the drug in the body and provides a teaching tool using machine learning for students through quizzes to learn how they can prescribe the right drug to various people.

### What PHARMAGENE Does?
PharmaGene takes the genetic input, including a person's gene, diplotype (combincation of two alleles inherited from each parent), and medicine, and predicts how their body reacts to a that medicine.

The metabolizer types are determines based on clinical guidelines: 
- Poor Metabolizer (PM): absent or low enzyme activity. Standard doses may build up, leading to toxicity and side effects.
- Intermediate Metabolizer (IM): reduced enzyme activity. Slower than average processing. 
- Normal Metabolizer (NM): standard enzym activity. Medicine process at expected rate. 
- Ultrarapid Metabolizer: increased enzyme activity. Standard doses can be processed too fast and may be ineffective. 

For each prediction, the result provides: 
- Metabolizer type: the predicted phenotype with confident score
- Input summary: gene, alleles, and medicine
- Clinical recommendation: recommended doses for the medication
- Mechanism: explanation of how the allele combination affects drug metabolism
- Quiz: a multiple choice question to enhance understanding of the result

### Tech Stack
| Layer | Technology |
|---|---|
| Frontend | React, Vite |
| Backend / ML API | Python, Flask, flask-cors |
| ML Model | scikit-learn RandomForestClassifier |
| Data | PharmGKB ClinPGx `var_drug_ann.tsv` to `cleaned_data.csv`|
|Model serialization | joblib |

### How to run the project
1. Install Prerequisites
```bash
node --version # need v18+
python3 --version # need 3.9+
```

2. Clone the Repo
```bash
git clone https://github.com/nghind04/bioinformatics_hackathon.git
```
3. Setup Python Backend
```bash
# Create virtual environment
python3 -m venv venv

# Activate it
source venv/bin/activate # For Mac/Linus
venv\Scripts\activate # For Windows

# Install Python dependencies
pip install flask flask-cors joblib pandas scikit-learn
```
4. Setup React Frontend
```bash
# Install Node dependencies
npm install
```
5. Run Both Servers

Open 2 terminal windows, both from the same root folder: 
```bash
# Terminal 1: Flask API
python3 api.py
# -> running on http://127.0.0.1:5000
```

```bash
# Terminal 2: React
npm run dev
# -> shows the Local URL to open, e.g. http://localhost:5173/
```
6. Open the website: Open the URL retrieved from running `npm run dev`
```bash 
# e.g:   ➜  Local:   http://localhost:5173/
```

### Sample Inputs: 
| Gene | Medicine | Allele 1 | Allele 2 | Expected Result |
|---|---|---|---|---|
| CYP2D6 | *4 | *4 | Codeine | Poor Metabolizer |
| CYP2C19 | *1 | *17 | Voriconazole | Ultrarapid Metabolizer |