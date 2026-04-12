from fastapi import APIRouter
from app.core.database import supabase

router = APIRouter()

@router.get("/")
def get_alerts():
    result = supabase.table("alerts").select("*, stations(name)").order("created_at", desc=True).execute()
    return result.data
