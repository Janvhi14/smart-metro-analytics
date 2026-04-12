from fastapi import APIRouter, Query, Body
from app.services.analytics_service import (
    get_ontime_performance,
    get_congestion_by_hour,
    get_delay_by_cause,
    get_ridership_trend,
    get_summary_stats
)

router = APIRouter()

@router.get("/summary")
def summary(city_id: int = Query(None)):
    return get_summary_stats(city_id)

@router.get("/ontime-performance")
def ontime_performance(city_id: int = Query(None)):
    return get_ontime_performance(city_id)

@router.get("/congestion-by-hour")
def congestion_by_hour(city_id: int = Query(None)):
    return get_congestion_by_hour(city_id)

@router.get("/delay-by-cause")
def delay_by_cause(city_id: int = Query(None)):
    return get_delay_by_cause(city_id)

@router.get("/ridership-trend")
def ridership_trend(city_id: int = Query(None)):
    return get_ridership_trend(city_id)

from app.services.ml_service import predict_delay, train_model

@router.post("/predict-delay")
def predict_delay_endpoint(
    line_id: int = Body(...),
    station_id: int = Body(...),
    hour: int = Body(...),
    day_of_week: int = Body(...)
):
    return predict_delay(line_id, station_id, hour, day_of_week)

@router.post("/train-model")
def train_model_endpoint():
    success = train_model()
    return {"success": success, "message": "Model trained successfully" if success else "Training failed"}
