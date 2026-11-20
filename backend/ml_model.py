
from itertools import product

import joblib
import pandas as pd

from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
from sklearn.model_selection import train_test_split


# --------------------------------------------------
# 1. Create a small educational training dataset
# --------------------------------------------------

records = []

for firewall, defender, updates_pending, cpu, memory in product(
    [0, 1], [0, 1], [0, 2, 5], [30, 60, 90], [30, 60, 90]
):
    risk_score = (
        (firewall == 0) * 2
        + (defender == 0) * 2
        + (updates_pending >= 2) * 1
    )

    if risk_score >= 3:
        risk = "High"
    elif risk_score >= 1:
        risk = "Moderate"
    else:
        risk = "Low"

    records.append({
        "firewall_enabled": firewall,
        "defender_enabled": defender,
        "updates_pending": updates_pending,
        "cpu_usage": cpu,
        "memory_usage": memory,
        "risk_level": risk
    })

data = pd.DataFrame(records)


# --------------------------------------------------
# 2. Prepare training and testing data
# --------------------------------------------------

X = data.drop("risk_level", axis=1)
y = data["risk_level"]

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y
)


# --------------------------------------------------
# 3. Train the Random Forest model
# --------------------------------------------------

model = RandomForestClassifier(
    n_estimators=100,
    random_state=42,
    class_weight="balanced"
)

model.fit(X_train, y_train)


# --------------------------------------------------
# 4. Evaluate the model
# --------------------------------------------------

predictions = model.predict(X_test)

print("\n========== MODEL EVALUATION ==========")
print("Dataset records:", len(data))
print("Training records:", len(X_train))
print("Testing records:", len(X_test))
print("Accuracy:", round(accuracy_score(y_test, predictions) * 100, 2), "%")

print("\nClassification Report:")
print(classification_report(y_test, predictions, zero_division=0))


# --------------------------------------------------
# 5. Save the trained model
# --------------------------------------------------

joblib.dump(model, "security_risk_model.joblib")

print("\nModel saved as security_risk_model.joblib")


# --------------------------------------------------
# 6. Test with an example system
# --------------------------------------------------

sample_system = pd.DataFrame([{
    "firewall_enabled": 1,
    "defender_enabled": 1,
    "updates_pending": 0,
    "cpu_usage": 45,
    "memory_usage": 55
}])

predicted_risk = model.predict(sample_system)[0]

print("\n========== SAMPLE PREDICTION ==========")
print("Predicted Security Risk:", predicted_risk)
