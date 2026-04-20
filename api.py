import re
import joblib
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS

BUNDLE = joblib.load("model_pipeline.pkl")

clf          = BUNDLE["model"]
feature_cols = BUNDLE["feature_cols"]
top_alleles  = BUNDLE["top_alleles"]
top_drugs    = BUNDLE["top_drugs"]
drug_columns = BUNDLE["drug_columns"]

TRAINING_DATA = pd.read_csv("cleaned_data.csv")

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

CLASS_COLORS = {
    "poor":         "#e74c3c",
    "intermediate": "#e67e22",
    "normal":       "#27ae60",
    "ultrarapid":   "#2980b9",
}

CLASS_LABELS = {
    "poor":         "Poor Metabolizer",
    "intermediate": "Intermediate Metabolizer",
    "normal":       "Normal Metabolizer",
    "ultrarapid":   "Ultrarapid Metabolizer",
}


def get_activity(gene: str, allele: str):
    table = GENE_ACTIVITY.get(gene.upper(), {})
    return table.get(allele.lower())


def build_input_row(gene: str, variant: str, drug: str) -> pd.DataFrame:
    alleles = re.findall(r"\*[\w]+", str(variant))
    allele1 = alleles[0].lower() if len(alleles) > 0 else "*1"
    allele2 = alleles[1].lower() if len(alleles) > 1 else allele1

    g = gene.upper()
    act1 = get_activity(g, allele1)
    act2 = get_activity(g, allele2)
    if act1 is None: act1 = 0.5
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


def predict_metabolizer(gene: str, variant: str, drug: str) -> dict:
    alleles = re.findall(r"\*[\w]+", str(variant))
    allele1 = alleles[0].lower() if len(alleles) > 0 else "*1"
    allele2 = alleles[1].lower() if len(alleles) > 1 else allele1

    act1 = get_activity(gene.upper(), allele1)
    act2 = get_activity(gene.upper(), allele2)
    if act1 is None: act1 = 0.5
    if act2 is None: act2 = 0.5

    row   = build_input_row(gene, variant, drug)
    pred  = clf.predict(row)[0]
    proba = clf.predict_proba(row)[0]
    proba_dict = dict(zip(clf.classes_, proba))

    drug_clean = drug.strip().lower()
    match = TRAINING_DATA[
        (TRAINING_DATA["gene"]    == gene.upper()) &
        (TRAINING_DATA["allele1"] == allele1) &
        (TRAINING_DATA["allele2"] == allele2) &
        (TRAINING_DATA["drug"].str.lower().str.contains(drug_clean, na=False))
    ]
    in_training_data = len(match) > 0

    return {
        "prediction":       pred,
        "prediction_label": CLASS_LABELS.get(pred, pred),
        "color":            CLASS_COLORS.get(pred, "#888888"),
        "confidence":       round(float(max(proba)), 3),
        "probabilities":    {k: round(float(v), 3) for k, v in proba_dict.items()},
        "activity_sum":     round(act1 + act2, 2),
        "alleles":          [allele1, allele2],
        "in_training_data": in_training_data,
    }


app = Flask(__name__)
CORS(app)


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "model": "model_pipeline.pkl"})


@app.route("/options", methods=["GET"])
def options():
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
    data = request.get_json(silent=True)

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


if __name__ == "__main__":
    app.run(debug=True, port=5000)
