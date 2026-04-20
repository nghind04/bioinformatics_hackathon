"""
PHARMAGENE – Flask REST API
Serves the pharmacogenomics ML model to the frontend.

Endpoints:
    GET  /health        health check
    GET  /options       gene list, allele list, drug list for dropdowns
    GET  /samples       4 pre-built example inputs for "Load Samples" button
    POST /predict       main prediction endpoint

Run:
    pip install flask flask-cors joblib pandas scikit-learn
    python3 api.py

The frontend (React / any HTTP client) should call:
    POST http://localhost:5000/predict
    Content-Type: application/json
    { "gene": "CYP2D6", "variant": "*4/*1", "drug": "codeine" }
"""

import re
import joblib
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS

# ---------------------------------------------------------------------------
# Boot – load the trained model bundle saved by ml_pipeline.py
# ---------------------------------------------------------------------------
BUNDLE = joblib.load("model_pipeline.pkl")

clf          = BUNDLE["model"]
feature_cols = BUNDLE["feature_cols"]
top_alleles  = BUNDLE["top_alleles"]   # list of star alleles the model knows
top_drugs    = BUNDLE["top_drugs"]     # list of drug names the model knows
drug_columns = BUNDLE["drug_columns"]  # one-hot column names like "drug_codeine"

# ---------------------------------------------------------------------------
# Allele activity score tables (mirrors ml_pipeline.py exactly)
# ---------------------------------------------------------------------------
CYP2D6_ACTIVITY = {
    "*1": 1.0, "*2": 1.0, "*33": 1.0, "*35": 1.0, "*39": 1.0,
    "*9": 0.5, "*10": 0.5, "*17": 0.5, "*29": 0.5, "*36": 0.5,
    "*41": 0.5, "*49": 0.5, "*59": 0.5,
    "*3": 0.0, "*4": 0.0, "*5": 0.0, "*6": 0.0, "*7": 0.0,
    "*8": 0.0, "*11": 0.0, "*12": 0.0, "*13": 0.0, "*14": 0.0,
    "*15": 0.0, "*16": 0.0, "*18": 0.0, "*19": 0.0, "*20": 0.0,
    "*21": 0.0, "*38": 0.0, "*40": 0.0, "*42": 0.0, "*44": 0.0,
    "*45": 0.0, "*46": 0.0, "*62": 0.0, "*69": 0.0, "*84": 0.0,
    "*1x2": 2.0, "*1xn": 2.0, "*2x2": 2.0, "*2xn": 2.0,
    "*35xn": 2.0, "*4xn": 0.0,
}

CYP2C19_ACTIVITY = {
    "*1": 1.0,
    "*17": 1.5,
    "*2": 0.0, "*3": 0.0, "*4": 0.0, "*5": 0.0,
    "*6": 0.0, "*7": 0.0, "*8": 0.0,
    "*9": 0.5, "*10": 0.5, "*11": 0.5,
}

GENE_ACTIVITY = {
    "CYP2D6":  CYP2D6_ACTIVITY,
    "CYP2C19": CYP2C19_ACTIVITY,
}

# Metabolizer class → UI color (hex) for the frontend
CLASS_COLORS = {
    "poor":         "#e74c3c",   # red
    "intermediate": "#e67e22",   # orange
    "normal":       "#27ae60",   # green
    "ultrarapid":   "#2980b9",   # blue
}

# Human-readable label for display
CLASS_LABELS = {
    "poor":         "Poor Metabolizer",
    "intermediate": "Intermediate Metabolizer",
    "normal":       "Normal Metabolizer",
    "ultrarapid":   "Ultrarapid Metabolizer",
}

# ---------------------------------------------------------------------------
# Helper – look up activity score for one allele
# ---------------------------------------------------------------------------
def get_activity(gene: str, allele: str):
    table = GENE_ACTIVITY.get(gene.upper(), {})
    return table.get(allele.lower())


# ---------------------------------------------------------------------------
# Helper – build the feature row the model expects
# ---------------------------------------------------------------------------
def build_input_row(gene: str, variant: str, drug: str) -> pd.DataFrame:
    alleles = re.findall(r"\*[\w]+", str(variant))
    allele1 = alleles[0].lower() if len(alleles) > 0 else "*1"
    allele2 = alleles[1].lower() if len(alleles) > 1 else allele1

    g = gene.upper()
    act1 = get_activity(g, allele1)
    act2 = get_activity(g, allele2)
    if act1 is None: act1 = 0.5   # unknown allele → conservative fallback
    if act2 is None: act2 = 0.5

    drug_clean = drug.strip().lower()
    if drug_clean not in top_drugs:
        drug_clean = "other"

    row = {
        "gene_is_cyp2d6": int(g == "CYP2D6"),
        "act1":     act1,
        "act2":     act2,
        "act_sum":  act1 + act2,
        "act_min":  min(act1, act2),
        "act_max":  max(act1, act2),
        "has_null": int(min(act1, act2) == 0),
        "has_dup":  int(max(act1, act2) >= 2.0),
    }

    for a in top_alleles:
        row[f"has_{a.lstrip('*')}"] = int(allele1 == a or allele2 == a)

    for col in drug_columns:
        row[col] = 0
    drug_col = f"drug_{drug_clean}"
    if drug_col in drug_columns:
        row[drug_col] = 1

    return pd.DataFrame([row]).reindex(columns=feature_cols, fill_value=0)


# ---------------------------------------------------------------------------
# Core prediction function
# ---------------------------------------------------------------------------
def predict_metabolizer(gene: str, variant: str, drug: str) -> dict:
    alleles = re.findall(r"\*[\w]+", str(variant))
    allele1 = alleles[0].lower() if len(alleles) > 0 else "*1"
    allele2 = alleles[1].lower() if len(alleles) > 1 else allele1

    act1 = get_activity(gene.upper(), allele1)
    act2 = get_activity(gene.upper(), allele2)
    if act1 is None: act1 = 0.5
    if act2 is None: act2 = 0.5

    row   = build_input_row(gene, variant, drug)
    pred  = clf.predict(row)[0]                    # e.g. "poor"
    proba = clf.predict_proba(row)[0]
    proba_dict = dict(zip(clf.classes_, proba))

    return {
        "prediction":     pred,                                    # "poor" / "intermediate" / "normal" / "ultrarapid"
        "prediction_label": CLASS_LABELS.get(pred, pred),         # "Poor Metabolizer"
        "color":          CLASS_COLORS.get(pred, "#888888"),       # hex color for UI
        "confidence":     round(float(max(proba)), 3),             # 0.0 – 1.0
        "probabilities":  {k: round(float(v), 3) for k, v in proba_dict.items()},
        "activity_sum":   round(act1 + act2, 2),
        "alleles":        [allele1, allele2],
    }


# ---------------------------------------------------------------------------
# Flask app
# ---------------------------------------------------------------------------
app = Flask(__name__)
CORS(app)


@app.route("/health", methods=["GET"])
def health():
    """Quick check that the server is up."""
    return jsonify({"status": "ok", "model": "model_pipeline.pkl"})


@app.route("/options", methods=["GET"])
def options():
    """
    Return all valid values for each frontend dropdown/field.
    The frontend uses this to populate Gene, Allele, and Medication inputs.
    """
    # Build allele list with activity score and function label for display
    def allele_info(gene, allele):
        score = get_activity(gene, allele)
        if score is None:
            return None
        if score == 0.0:
            fn = "no function"
        elif score == 0.5:
            fn = "reduced function"
        elif score == 1.0:
            fn = "normal function"
        elif score >= 2.0:
            fn = "duplication"
        else:
            fn = "increased function"
        return {"allele": allele, "activity": score, "function": fn}

    cyp2d6_alleles  = [allele_info("CYP2D6",  a) for a in sorted(CYP2D6_ACTIVITY)]
    cyp2c19_alleles = [allele_info("CYP2C19", a) for a in sorted(CYP2C19_ACTIVITY)]

    return jsonify({
        "genes": ["CYP2D6", "CYP2C19"],
        "alleles": {
            "CYP2D6":  [x for x in cyp2d6_alleles  if x],
            "CYP2C19": [x for x in cyp2c19_alleles if x],
        },
        "drugs": sorted(top_drugs),
        "metabolizer_classes": [
            {"value": k, "label": v, "color": CLASS_COLORS[k]}
            for k, v in CLASS_LABELS.items()
        ],
    })


@app.route("/samples", methods=["GET"])
def samples():
    """
    Return 4 pre-built example inputs for the 'Load Samples' button.
    Each covers a different metabolizer class so the user can explore all outcomes.
    """
    examples = [
        {
            "label":       "Poor Metabolizer – Codeine",
            "gene":        "CYP2D6",
            "variant":     "*4/*4",
            "drug":        "codeine",
            "description": "Two non-functional alleles. Drug accumulates — risk of toxicity.",
        },
        {
            "label":       "Intermediate Metabolizer – Codeine",
            "gene":        "CYP2D6",
            "variant":     "*1/*4",
            "drug":        "codeine",
            "description": "One normal + one non-functional allele. Slower clearance than normal.",
        },
        {
            "label":       "Normal Metabolizer – Codeine",
            "gene":        "CYP2D6",
            "variant":     "*1/*1",
            "drug":        "codeine",
            "description": "Two fully functional alleles. Standard dosing applies.",
        },
        {
            "label":       "Ultrarapid Metabolizer – Tramadol",
            "gene":        "CYP2D6",
            "variant":     "*1xn/*1",
            "drug":        "tramadol",
            "description": "Gene duplication. Drug clears too fast — may be ineffective.",
        },
        {
            "label":       "Poor Metabolizer – Clopidogrel",
            "gene":        "CYP2C19",
            "variant":     "*2/*2",
            "drug":        "clopidogrel",
            "description": "Two loss-of-function alleles. Clopidogrel cannot be activated.",
        },
    ]
    return jsonify({"samples": examples})


@app.route("/predict", methods=["POST"])
def predict():
    """
    Main prediction endpoint.

    Request body (JSON):
        { "gene": "CYP2D6", "variant": "*4/*1", "drug": "codeine" }

    Response (JSON):
        {
            "prediction":       "poor",
            "prediction_label": "Poor Metabolizer",
            "color":            "#e74c3c",
            "confidence":       0.92,
            "probabilities": {
                "poor": 0.92, "intermediate": 0.05,
                "normal": 0.03, "ultrarapid": 0.00
            },
            "activity_sum": 0.0,
            "alleles": ["*4", "*1"]
        }
    """
    data = request.get_json(silent=True)

    # Validate input
    if not data:
        return jsonify({"error": "Request body must be JSON."}), 400

    gene    = data.get("gene", "").strip()
    variant = data.get("variant", "").strip()
    drug    = data.get("drug", "").strip()

    if not gene or not variant or not drug:
        return jsonify({"error": "Missing required fields: gene, variant, drug."}), 400

    if gene.upper() not in ("CYP2D6", "CYP2C19"):
        return jsonify({"error": f"Invalid gene '{gene}'. Must be 'CYP2D6' or 'CYP2C19'."}), 400

    if not re.search(r"\*[\w]+", variant):
        return jsonify({"error": f"Invalid variant '{variant}'. Expected star allele format e.g. '*4/*1'."}), 400

    result = predict_metabolizer(gene, variant, drug)
    return jsonify(result)


# ---------------------------------------------------------------------------
# Run
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    print("PHARMAGENE API starting on http://localhost:5000")
    print("Endpoints:")
    print("  GET  /health")
    print("  GET  /options")
    print("  GET  /samples")
    print("  POST /predict")
    app.run(debug=True, port=5000)
