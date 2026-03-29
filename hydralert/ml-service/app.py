"""
HydrAlert ML Scoring Microservice
==================================
A lightweight Flask service that computes a dehydration risk score (0–100).

Current implementation uses a deterministic formula designed to approximate
what a trained model would output. This is demo-ready and production-safe —
replace the `compute_score()` function body with your trained model's
inference logic when ready.

Formula notes:
  - Base daily water need: weight(kg) × 33 ml (WHO standard)
  - Activity multiplier: low=1.0, medium=1.3, high=1.6
  - Temperature effect: significant above 20°C
  - Humidity effect: significant above 40%
  - Age risk modifier: elderly (>65) and children (<12) are higher risk

To plug in a real ML model:
  1. Train a model on hydration + weather + intake data
  2. Serialize with joblib or ONNX
  3. Load at startup and call model.predict() in compute_score()
"""

from flask import Flask, request, jsonify
import math

app = Flask(__name__)

# ─── Activity level multipliers ────────────────────────────
ACTIVITY_MULTIPLIERS = {"low": 1.0, "medium": 1.3, "high": 1.6}


def compute_score(age, weight_kg, activity_level, recent_intake_ml, temp_c, humidity_pct):
    """
    Deterministic dehydration risk formula.
    Returns a score from 0 (well-hydrated) to 100 (severe risk).

    ─── REPLACE THIS FUNCTION to plug in a trained ML model ───────────────
    Example with scikit-learn:
        features = [age, weight_kg, ACTIVITY_MAP[activity_level],
                    recent_intake_ml, temp_c, humidity_pct]
        score = int(model.predict([features])[0])
    """

    # 1. Base daily water need (ml) — WHO guideline
    base_need_ml = weight_kg * 33

    # 2. Adjust for activity
    activity_mul = ACTIVITY_MULTIPLIERS.get(activity_level, 1.0)
    adjusted_need_ml = base_need_ml * activity_mul

    # 3. Intake deficit score (0–50 points)
    intake_ratio = min(recent_intake_ml / max(adjusted_need_ml, 1), 1.0)
    intake_score = (1 - intake_ratio) * 50

    # 4. Temperature heat stress (0–20 points, ramps above 20°C)
    temp_score = max(0, (temp_c - 20) / 20) * 20

    # 5. Humidity effect (0–15 points, ramps above 40%)
    humidity_score = max(0, (humidity_pct - 40) / 60) * 15

    # 6. Demographic risk modifier (0–15 points)
    age_score = 10 if age > 65 else (5 if age < 12 else 0)

    # 7. Final score — clamp to [0, 100]
    score = math.floor(min(100, max(0, intake_score + temp_score + humidity_score + age_score)))

    # 8. Determine risk category and recommendation
    if score < 30:
        category = "low"
        recommended_ml = 250
    elif score < 60:
        category = "moderate"
        recommended_ml = 500
    else:
        category = "high"
        recommended_ml = 750

    return {
        "score": score,
        "category": category,
        "recommendedMl": recommended_ml,
        "breakdown": {
            "intakeScore": round(intake_score, 1),
            "tempScore": round(temp_score, 1),
            "humidityScore": round(humidity_score, 1),
            "ageScore": age_score,
        },
    }


@app.route("/score", methods=["POST"])
def score():
    """
    POST /score
    Body: {
      age: int,
      weightKg: float,
      activityLevel: "low" | "medium" | "high",
      recentIntakeLast24hMl: int,
      tempC: float,
      humidityPct: float
    }
    Returns: { score, category, recommendedMl, breakdown }
    """
    data = request.get_json()
    if not data:
        return jsonify({"error": "JSON body required"}), 400

    required = ["age", "weightKg", "activityLevel", "recentIntakeLast24hMl", "tempC", "humidityPct"]
    missing = [f for f in required if f not in data]
    if missing:
        return jsonify({"error": f"Missing fields: {missing}"}), 400

    try:
        result = compute_score(
            age=int(data["age"]),
            weight_kg=float(data["weightKg"]),
            activity_level=str(data["activityLevel"]),
            recent_intake_ml=int(data["recentIntakeLast24hMl"]),
            temp_c=float(data["tempC"]),
            humidity_pct=float(data["humidityPct"]),
        )
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "service": "hydralert-ml-scoring"})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=False)
