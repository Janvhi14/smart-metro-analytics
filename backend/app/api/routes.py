from fastapi import APIRouter
from app.core.database import supabase

router = APIRouter()

@router.get("/")
def get_lines():
    result = supabase.table("lines").select("*").execute()
    return result.data

@router.get("/{line_id}")
def get_line(line_id: int):
    result = supabase.table("lines").select("*").eq("id", line_id).single().execute()
    return result.data

@router.get("/{line_id}/stations")
def get_line_stations(line_id: int):
    result = supabase.table("stations").select("*").eq("line_id", line_id).execute()
    return result.data
