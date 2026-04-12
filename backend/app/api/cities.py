from fastapi import APIRouter
from app.core.database import supabase

router = APIRouter()

@router.get("/")
def get_cities():
    result = supabase.table("cities").select("*").eq("active", True).execute()
    return result.data

@router.get("/{city_id}/lines")
def get_city_lines(city_id: int):
    result = supabase.table("lines").select("*").eq("city_id", city_id).execute()
    return result.data

@router.get("/{city_id}/stations")
def get_city_stations(city_id: int):
    result = supabase.table("stations").select("*, lines(name, color_hex)").eq("lines.city_id", city_id).execute()
    return result.data

@router.get("/{city_id}/summary")
def get_city_summary(city_id: int):
    from app.services.analytics_service import get_summary_stats
    return get_summary_stats(city_id)
