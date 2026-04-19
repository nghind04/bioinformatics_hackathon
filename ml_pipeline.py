"""
Pharmacogenomics ML Pipeline (v2 — improved accuracy)
Teaching tool for CYP2D6 and CYP2C19 metabolizer type classification.

Key improvements over v1:
  1. Sentence parsing  — expands 186 noisy multi-allele rows into ~691
                         individual (gene, diplotype, drug, label) rows.
  2. Gene-aware dedup  — resolves label conflicts per gene so that e.g.
                         CYP2D6 *1/*2 (normal) and CYP2C19 *1/*2 (intermediate)
                         are treated separately.
  3. Activity scores   — adds numeric features encoding the biological
                         function of each allele (the actual basis for
                         metabolizer classification in the clinic).

Dataset: PharmGKB ClinPGx - var_drug_ann.tsv
Model:   RandomForestClassifier (scikit-learn)

How to run:
    pip install pandas scikit-learn joblib
    python3 ml_pipeline.py

Outputs:
    cleaned_data.csv     - labeled diplotype-level training data
    model_pipeline.pkl   - trained model bundle (for API use)
"""

import re
import warnings
import joblib
import pandas as pd
from collections import Counter
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.metrics import classification_report, accuracy_score

warnings.filterwarnings("ignore")

# ---------------------------------------------------------------------------
# PATHS
# ---------------------------------------------------------------------------
DATA_PATH = "Dataset/variantAnnotations/var_drug_ann.tsv"
OUT_CSV   = "cleaned_data.csv"
OUT_MODEL = "model_pipeline.pkl"


# ===========================================================================
# ALLELE ACTIVITY SCORES
# Based on CPIC / PharmGKB clinical guidelines.
# Activity score determines diplotype → metabolizer phenotype:
#   sum = 0            → Poor Metabolizer
#   sum = 0.25–1.0     → Intermediate Metabolizer
#   sum = 1.25–2.25    → Normal (Extensive) Metabolizer
#   sum > 2.25         → Ultrarapid Metabolizer
# ===========================================================================

CYP2D6_ACTIVITY = {
    # Normal function (1.0)
    "*1": 1.0, "*2": 1.0, "*33": 1.0, "*35": 1.0, "*39": 1.0,
    # Decreased function (0.5)
    "*9": 0.5, "*10": 0.5, "*17": 0.5, "*29": 0.5, "*36": 0.5,
    "*41": 0.5, "*49": 0.5, "*59": 0.5,
    # No function (0.0)
    "*3": 0.0, "*4": 0.0, "*5": 0.0, "*6": 0.0, "*7": 0.0,
    "*8": 0.0, "*11": 0.0, "*12": 0.0, "*13": 0.0, "*14": 0.0,
    "*15": 0.0, "*16": 0.0, "*18": 0.0, "*19": 0.0, "*20": 0.0,
    "*21": 0.0, "*38": 0.0, "*40": 0.0, "*42": 0.0, "*44": 0.0,
    "*45": 0.0, "*46": 0.0, "*62": 0.0, "*69": 0.0, "*84": 0.0,
    # Duplication / increased function (2.0)
    "*1x2": 2.0, "*1xn": 2.0, "*2x2": 2.0, "*2xn": 2.0,
    "*35xn": 2.0, "*4xn": 0.0,   # null duplication stays null
}

CYP2C19_ACTIVITY = {
    # Normal function
    "*1": 1.0,
    # Increased function
    "*17": 1.5,
    # No function
    "*2": 0.0, "*3": 0.0, "*4": 0.0, "*5": 0.0,
    "*6": 0.0, "*7": 0.0, "*8": 0.0,
    # Decreased function
    "*9": 0.5, "*10": 0.5, "*11": 0.5,
}

GENE_ACTIVITY = {
    "CYP2D6":  CYP2D6_ACTIVITY,
    "CYP2C19": CYP2C19_ACTIVITY,
}

def get_activity(gene: str, allele: str) -> float | None:
    """
    Look up the activity score for one allele.
    Returns None if the allele is not in the reference table.
    """
    table = GENE_ACTIVITY.get(gene.upper(), {})
    return table.get(allele.lower())


# ===========================================================================
# LABEL NORMALISATION
# ===========================================================================
LABEL_KEYWORDS = {
    "poor":         ["poor", "no function", "loss of function", "null",
                     "non-functional", "deficiency"],
    "intermediate": ["intermediate", "reduced function", "decreased function",
                     "partial function"],
    "normal":       ["normal", "extensive", "wild-type", "wildtype"],
    "ultrarapid":   ["ultrarapid", "ultra-rapid", "rapid", "increased function",
                     "gain of function"],
}

def resolve_label(text: str) -> str | None:
    """Map free text to one of the four canonical metabolizer classes."""
    if not text:
        return None
    t = text.lower()
    for cls, keywords in LABEL_KEYWORDS.items():
        for kw in keywords:
            if kw in t:
                return cls
    return None


# ===========================================================================
# STEP 1 — LOAD AND INSPECT
# ===========================================================================
print("=" * 60)
print("STEP 1: LOADING DATA")
print("=" * 60)

df = pd.read_csv(DATA_PATH, sep="\t", low_memory=False)
print(f"Raw shape: {df.shape[0]:,} rows × {df.shape[1]} columns")

GENE_COL     = "Gene"
VARIANT_COL  = "Variant/Haplotypes"
DRUG_COL     = "Drug(s)"
MET_COL      = "Metabolizer types"
SENTENCE_COL = "Sentence"


# ===========================================================================
# STEP 2 — FILTER TO CYP2D6 / CYP2C19 + REMOVE CIRCULAR ROWS
# ===========================================================================
print("\n" + "=" * 60)
print("STEP 2: FILTERING")
print("=" * 60)

df = df[df[GENE_COL].isin(["CYP2D6", "CYP2C19"])].copy()
print(f"After gene filter:                    {len(df):>5,} rows")

# Remove rows where the variant field IS a phenotype description —
# those are circular (the "variant" is the label) and teach the model nothing.
circular = df[VARIANT_COL].str.contains(r"metabolizer|phenotype", case=False, na=False)
df = df[~circular & df[MET_COL].notna()].copy()
print(f"After removing circular / unlabeled:  {len(df):>5,} rows")


# ===========================================================================
# STEP 3 — EXPAND: PARSE INDIVIDUAL DIPLOTYPES FROM SENTENCES
#
# Each row in the PharmGKB file can compare MANY allele combinations,
# all listed together in Variant/Haplotypes. The sentence encodes which
# specific diplotype (*A/*B) gets which phenotype label.
#
# Example sentence:
#   "CYP2D6 *3/*4 + *4/*4 (assigned as poor metabolizer) are associated
#    with ... as compared to CYP2D6 *1/*1 (assigned as normal metabolizer)"
#   → extracted rows:
#       (*3/*4, poor), (*4/*4, poor), (*1/*1, normal)
# ===========================================================================
print("\n" + "=" * 60)
print("STEP 3: EXPANDING SENTENCES → INDIVIDUAL DIPLOTYPES")
print("=" * 60)

def parse_sentence_to_diplotypes(sentence: str, primary_met: str, gene: str, drug: str) -> list[dict]:
    """
    Extract individual (allele1, allele2, label) rows from a ClinPGx sentence.

    The sentence structure is:
        SUBJECT_DIPLOTYPES (assigned as LABEL metabolizer) is associated with ...
        [as compared to COMPARISON_DIPLOTYPES (assigned as LABEL metabolizer)]

    We extract both the subject and comparison groups when they have
    an explicit 'assigned as X' label.
    """
    if pd.isna(sentence):
        return []

    # Split on comparison boundary
    parts = re.split(r"\bas compared to\b", sentence, flags=re.IGNORECASE)
    results = []

    # ── Subject part ──────────────────────────────────────────────────────
    subj = parts[0]
    assigned_m = re.search(
        r"assigned as ([\w\s]+?)\s+metabolizer", subj, re.IGNORECASE
    )
    if assigned_m:
        subj_label = resolve_label(assigned_m.group(1))
    else:
        subj_label = resolve_label(str(primary_met))

    for diplo in re.findall(r"\*[\w]+/\*[\w]+", subj):
        alleles = re.findall(r"\*[\w]+", diplo)
        if len(alleles) == 2 and subj_label:
            results.append({
                "gene":    gene,
                "allele1": alleles[0].lower(),
                "allele2": alleles[1].lower(),
                "metabolizer": subj_label,
                "drug":    drug,
            })

    # ── Comparison part ───────────────────────────────────────────────────
    if len(parts) > 1:
        comp = parts[1]
        # A comparison clause may itself contain multiple labelled sub-groups,
        # e.g. "... *1/*1 (assigned as normal) ... *1/*4 (assigned as intermediate)"
        # We look for all 'assigned as X' blocks and associate preceding diplotypes.
        assigned_blocks = list(re.finditer(
            r"assigned as ([\w\s]+?)\s+metabolizer", comp, re.IGNORECASE
        ))
        if assigned_blocks:
            # For simplicity: one label in comparison → apply to all its diplotypes
            comp_label = resolve_label(assigned_blocks[0].group(1))
            for diplo in re.findall(r"\*[\w]+/\*[\w]+", comp):
                alleles = re.findall(r"\*[\w]+", diplo)
                if len(alleles) == 2 and comp_label:
                    results.append({
                        "gene":    gene,
                        "allele1": alleles[0].lower(),
                        "allele2": alleles[1].lower(),
                        "metabolizer": comp_label,
                        "drug":    drug,
                    })
    return results


expanded_rows = []
for _, row in df.iterrows():
    expanded_rows.extend(
        parse_sentence_to_diplotypes(
            row[SENTENCE_COL], row[MET_COL], row[GENE_COL], row[DRUG_COL]
        )
    )

expanded = pd.DataFrame(expanded_rows)
print(f"Rows after sentence expansion: {len(expanded):,}  (was {len(df)})")

# ── Resolve label conflicts per (gene, allele1, allele2) via majority vote ─
# Some diplotypes appear with different labels across studies. We keep the
# majority label per gene. E.g. CYP2D6 *1/*1 has 91× normal, 2× intermediate.
def majority_vote(labels: list[str]) -> str:
    return Counter(labels).most_common(1)[0][0]

deduped = (
    expanded
    .groupby(["gene", "allele1", "allele2"])
    .agg(
        metabolizer=("metabolizer", majority_vote),
        drug=("drug", "first"),
    )
    .reset_index()
)
print(f"After deduplication (majority vote per gene+diplotype): {len(deduped):,} rows")
print("\nLabel distribution:")
print(deduped["metabolizer"].value_counts().to_string())


# ===========================================================================
# STEP 4 — BUILD FEATURES
# ===========================================================================
print("\n" + "=" * 60)
print("STEP 4: BUILDING FEATURES")
print("=" * 60)

# ── Biological activity score features ───────────────────────────────────
# These encode the mechanism directly: each allele has a known function score.
deduped["act1"] = deduped.apply(
    lambda r: get_activity(r["gene"], r["allele1"]), axis=1
)
deduped["act2"] = deduped.apply(
    lambda r: get_activity(r["gene"], r["allele2"]), axis=1
)

# Drop rows where we have no activity score for either allele (unknown allele)
before = len(deduped)
deduped = deduped[deduped["act1"].notna() & deduped["act2"].notna()].copy()
print(f"Rows with known activity scores: {len(deduped)} / {before}")

deduped["act_sum"]  = deduped["act1"] + deduped["act2"]    # total diplotype activity
deduped["act_min"]  = deduped[["act1", "act2"]].min(axis=1) # worst allele
deduped["act_max"]  = deduped[["act1", "act2"]].max(axis=1) # best allele
deduped["has_null"] = (deduped["act_min"] == 0).astype(int) # any null allele?
deduped["has_dup"]  = (deduped["act_max"] >= 2.0).astype(int) # any duplication?

# ── Gene ─────────────────────────────────────────────────────────────────
deduped["gene_is_cyp2d6"] = (deduped["gene"] == "CYP2D6").astype(int)

# ── Allele identity one-hot ──────────────────────────────────────────────
# Knowing *which* allele (not just its score) helps catch edge cases.
top_alleles = (
    pd.concat([deduped["allele1"], deduped["allele2"]])
    .value_counts()
    .head(20)
    .index.tolist()
)
for a in top_alleles:
    deduped[f"has_{a.lstrip('*')}"] = (
        (deduped["allele1"] == a) | (deduped["allele2"] == a)
    ).astype(int)

# ── Drug ─────────────────────────────────────────────────────────────────
deduped["drug_primary"] = (
    deduped["drug"].fillna("unknown")
    .str.split(",").str[0].str.strip().str.lower()
)
top_drugs = deduped["drug_primary"].value_counts().head(15).index.tolist()
deduped["drug_primary"] = deduped["drug_primary"].apply(
    lambda d: d if d in top_drugs else "other"
)
drug_dummies = pd.get_dummies(deduped["drug_primary"], prefix="drug")

# ── Assemble X, y ────────────────────────────────────────────────────────
activity_cols = ["act1", "act2", "act_sum", "act_min", "act_max",
                 "has_null", "has_dup"]
gene_col      = ["gene_is_cyp2d6"]
allele_cols   = [f"has_{a.lstrip('*')}" for a in top_alleles]

X = pd.concat(
    [
        deduped[gene_col + activity_cols + allele_cols].reset_index(drop=True),
        drug_dummies.reset_index(drop=True),
    ],
    axis=1,
)
y = deduped["metabolizer"].reset_index(drop=True)

print(f"\nFinal feature matrix: {X.shape[0]} rows × {X.shape[1]} features")
print("Feature groups:")
print(f"  Activity scores : {len(activity_cols)} features  (act_sum, act_min, act_max, etc.)")
print(f"  Allele identity : {len(allele_cols)} features  (top-20 alleles as binary)")
print(f"  Drug            : {len(drug_dummies.columns)} features")
print(f"  Gene            : 1 feature")


# ===========================================================================
# STEP 5 — TRAIN MODEL
# ===========================================================================
print("\n" + "=" * 60)
print("STEP 5: TRAINING MODEL")
print("=" * 60)

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)
print(f"Train: {len(X_train)} rows  |  Test: {len(X_test)} rows")

clf = RandomForestClassifier(
    n_estimators=300,
    class_weight="balanced",
    max_depth=10,
    min_samples_leaf=2,
    random_state=42,
)
clf.fit(X_train, y_train)

y_pred = clf.predict(X_test)
acc    = accuracy_score(y_test, y_pred)
print(f"\nTest Accuracy: {acc:.3f}")
print("\nClassification Report:")
print(classification_report(y_test, y_pred, zero_division=0))

# Stratified 5-fold cross-validation for a more reliable estimate
cv_scores = cross_val_score(clf, X, y, cv=StratifiedKFold(5, shuffle=True, random_state=42),
                            scoring="accuracy")
print(f"5-Fold CV Accuracy: {cv_scores.mean():.3f} ± {cv_scores.std():.3f}")

# Top-10 features
feat_imp = (
    pd.Series(clf.feature_importances_, index=X.columns)
    .sort_values(ascending=False)
    .head(10)
)
print("\nTop-10 Most Important Features:")
for feat, imp in feat_imp.items():
    bar = "█" * int(imp * 60)
    print(f"  {feat:<25} {imp:.4f}  {bar}")


# ===========================================================================
# STEP 6 — SAMPLE PREDICTIONS
# ===========================================================================
print("\n" + "=" * 60)
print("STEP 6: SAMPLE PREDICTIONS FROM TEST SET")
print("=" * 60)

sample_X = X_test.head(5)
sample_y = y_test.head(5)
preds    = clf.predict(sample_X)

for i, (actual, predicted) in enumerate(zip(sample_y, preds), 1):
    mark = "✓" if actual == predicted else "✗"
    row_data = deduped.iloc[sample_X.index[i - 1]]
    print(f"  [{i}] {row_data['gene']}  {row_data['allele1']}/{row_data['allele2']}  drug={row_data['drug_primary']}")
    print(f"       act_sum={row_data['act_sum']:.1f}  Actual: {actual:<15} Predicted: {predicted} {mark}")
    print()


# ===========================================================================
# STEP 7 — PREDICTION FUNCTION
# ===========================================================================
print("=" * 60)
print("STEP 7: PREDICTION FUNCTION")
print("=" * 60)

def build_input_row(gene: str, variant: str, drug: str) -> pd.DataFrame:
    """
    Convert raw (gene, variant, drug) input into the feature vector
    expected by the trained model.
    """
    # Parse allele1 and allele2 from variant string (e.g. "*4/*4" or "*1xN/*2")
    alleles = re.findall(r"\*[\w]+", str(variant))
    allele1 = alleles[0].lower() if len(alleles) > 0 else "*1"
    allele2 = alleles[1].lower() if len(alleles) > 1 else allele1

    g = gene.upper()
    act1 = get_activity(g, allele1)
    act2 = get_activity(g, allele2)

    # Fall back to 0.5 if allele is unknown (conservative)
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

    # Allele identity features
    for a in top_alleles:
        row[f"has_{a.lstrip('*')}"] = int(allele1 == a or allele2 == a)

    # Drug dummies — build a zero row then set the right column
    for col in drug_dummies.columns:
        row[col] = 0
    drug_col = f"drug_{drug_clean}"
    if drug_col in row or drug_col in X.columns:
        row[drug_col] = 1

    return pd.DataFrame([row]).reindex(columns=X.columns, fill_value=0)


def predict_metabolizer(gene: str, variant: str, drug: str) -> dict:
    """
    Predict metabolizer type from a genetic variant + drug.

    Parameters
    ----------
    gene    : "CYP2D6" or "CYP2C19"
    variant : diplotype string, e.g. "*4/*4" or "CYP2D6*4/CYP2D6*5"
    drug    : drug name, e.g. "codeine"

    Returns
    -------
    {
        prediction   : canonical class ("poor" / "intermediate" / "normal" / "ultrarapid")
        confidence   : probability of the top class (float)
        probabilities: {class: prob} dict for all four classes
        activity_sum : computed diplotype activity score (float)
        alleles      : [allele1, allele2] as parsed
    }
    """
    alleles = re.findall(r"\*[\w]+", str(variant))
    allele1 = alleles[0].lower() if len(alleles) > 0 else "*1"
    allele2 = alleles[1].lower() if len(alleles) > 1 else allele1

    # Use 'is None' check — NOT 'or 0.5', because 0.0 is falsy in Python
    # and null alleles (activity=0.0) would wrongly become 0.5.
    act1 = get_activity(gene.upper(), allele1)
    act2 = get_activity(gene.upper(), allele2)
    if act1 is None: act1 = 0.5   # unknown allele → conservative fallback
    if act2 is None: act2 = 0.5

    row   = build_input_row(gene, variant, drug)
    pred  = clf.predict(row)[0]
    proba = clf.predict_proba(row)[0]
    proba_dict = dict(zip(clf.classes_, proba))

    return {
        "prediction":    pred,
        "confidence":    round(float(max(proba)), 3),
        "probabilities": {k: round(float(v), 3) for k, v in proba_dict.items()},
        "activity_sum":  round(act1 + act2, 2),
        "alleles":       [allele1, allele2],
    }


# Demo calls — covering all four metabolizer classes
examples = [
    ("CYP2D6",  "*4/*4",      "codeine",      "Known poor (two null alleles, sum=0)"),
    ("CYP2D6",  "*1/*4",      "codeine",      "Expected intermediate (sum=1.0)"),
    ("CYP2D6",  "*1/*1",      "codeine",      "Expected normal (sum=2.0)"),
    ("CYP2D6",  "*1xN/*1",    "tramadol",     "Expected ultrarapid (sum=3.0)"),
    ("CYP2C19", "*2/*2",      "clopidogrel",  "Known poor (two null alleles, sum=0)"),
    ("CYP2C19", "*1/*17",     "citalopram",   "CYP2C19*17 increased function"),
]
print()
for gene, var, drug, note in examples:
    r = predict_metabolizer(gene, var, drug)
    bar = "█" * int(r["confidence"] * 30)
    print(f"  {gene} {var} + {drug}")
    print(f"  Note: {note}")
    print(f"  Activity sum: {r['activity_sum']}  → {r['prediction'].upper()} METABOLIZER  ({r['confidence']:.0%})")
    print(f"  Probs: { {k: f'{v:.2f}' for k,v in r['probabilities'].items()} }")
    print()


# ===========================================================================
# STEP 8 — SAVE OUTPUTS
# ===========================================================================
print("=" * 60)
print("STEP 8: SAVING OUTPUTS")
print("=" * 60)

save_cols = ["gene", "allele1", "allele2", "drug", "act_sum", "metabolizer"]
deduped[save_cols].to_csv(OUT_CSV, index=False)
print(f"Cleaned dataset → {OUT_CSV}  ({len(deduped)} rows)")

bundle = {
    "model":        clf,
    "feature_cols": X.columns.tolist(),
    "top_alleles":  top_alleles,
    "top_drugs":    top_drugs,
    "drug_columns": drug_dummies.columns.tolist(),
}
joblib.dump(bundle, OUT_MODEL)
print(f"Model bundle    → {OUT_MODEL}")

print("\n" + "=" * 60)
print("Pipeline complete.")
print("=" * 60)


# ===========================================================================
# SHAP EXPLAINABILITY (optional — not run, just documented)
# ===========================================================================
print("""
─────────────────────────────────────────────────
HOW TO ADD SHAP EXPLAINABILITY (run separately)
─────────────────────────────────────────────────
Install:  pip install shap

    import shap
    explainer = shap.TreeExplainer(clf)

    # For a single prediction row:
    row = build_input_row("CYP2D6", "*4/*4", "codeine")
    sv  = explainer.shap_values(row)

    # sv is shape [n_classes, 1, n_features]
    # For the predicted class index (e.g. 'poor' = index 0):
    class_idx = list(clf.classes_).index("poor")
    contributions = dict(zip(X.columns, sv[class_idx][0]))
    # → {'act_sum': -0.38, 'has_null': +0.29, 'has_4': +0.21, ...}
    # Positive = pushed toward this class.

    # Return this dict from the Flask/FastAPI endpoint so the
    # React frontend can render a bar chart of "why this result".
─────────────────────────────────────────────────

HOW TO WRAP INTO A FLASK API (one endpoint)
─────────────────────────────────────────────────
    # api.py
    from flask import Flask, request, jsonify
    from flask_cors import CORS
    import joblib, re

    bundle = joblib.load("model_pipeline.pkl")
    # ... re-create predict_metabolizer() using bundle ...

    app = Flask(__name__)
    CORS(app)   # allow React on localhost:3000

    @app.route("/predict", methods=["POST"])
    def predict():
        data = request.get_json()
        result = predict_metabolizer(
            data["gene"], data["variant"], data["drug"]
        )
        return jsonify(result)

    # Run: python3 api.py
    # React fetch: POST http://localhost:5000/predict
    #   body: { gene, variant, drug }
─────────────────────────────────────────────────
""")
