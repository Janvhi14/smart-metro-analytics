from fastapi import APIRouter
from app.core.database import supabase

router = APIRouter()

@router.get("/")
def get_stations():
    result = supabase.table("stations").select("*, lines(name, color_hex)").execute()
    return result.data

@router.get("/{station_id}")
def get_station(station_id: int):
    result = supabase.table("stations").select("*, lines(name, color_hex)").eq("id", station_id).single().execute()
    return result.data
