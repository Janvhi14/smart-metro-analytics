import pickle
import os
import numpy as np
import pandas as pd
from app.core.database import supabase

MODEL_PATH = "model.pkl"

def train_model():
    print("Fetching trip data for training...")
    result = supabase.table("trips").select("line_id, scheduled_departure, actual_departure").eq("status", "completed").execute()
    df = pd.DataFrame(result.data)
    if df.empty or len(df) < 10:
        print("Not enough data to train")
        return False
    df["scheduled_departure"] = pd.to_datetime(df["scheduled_departure"])
    df["actual_departure"] = pd.to_datetime(df["actual_departure"])
    df["delay"] = (df["actual_departure"] - df["scheduled_departure"]).dt.total_seconds() / 60
    df["hour"] = df["scheduled_departure"].dt.hour
    df["day_of_week"] = df["scheduled_departure"].dt.dayofweek
    df = df[df["delay"] >= 0]
    from sklearn.ensemble import RandomForestRegressor
    X = df[["line_id", "hour", "day_of_week"]].values
    y = df["delay"].values
    model = RandomForestRegressor(n_estimators=50, random_state=42)
    model.fit(X, y)
    with open(MODEL_PATH, "wb") as f:
        pickle.dump(model, f)
    print(f"Model trained on {len(df)} trips")
    return True

def predict_delay(line_id: int, station_id: int, hour: int, day_of_week: int):
    if not os.path.exists(MODEL_PATH):
        trained = train_model()
        if not trained:
            return {"predicted_delay_minutes": 0, "model": "fallback"}
    with open(MODEL_PATH, "rb") as f:
        model = pickle.load(f)
    X = np.array([[line_id, hour, day_of_week]])
    prediction = model.predict(X)[0]
    return {
        "predicted_delay_minutes": round(float(prediction), 1),
        "model": "RandomForestRegressor",
        "features": {"line_id": line_id, "hour": hour, "day_of_week": day_of_week}
    }
