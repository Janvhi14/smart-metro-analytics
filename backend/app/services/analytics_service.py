import pandas as pd
from app.core.database import supabase

def get_line_ids_for_city(city_id: int = None):
    if city_id:
        result = supabase.table("lines").select("id").eq("city_id", city_id).execute()
    else:
        result = supabase.table("lines").select("id").execute()
    return [l["id"] for l in result.data]

def get_ontime_performance(city_id: int = None):
    line_ids = get_line_ids_for_city(city_id)
    if not line_ids:
        return []
    result = supabase.table("trips").select("line_id, scheduled_departure, actual_departure, lines(name, color_hex)").eq("status", "completed").in_("line_id", line_ids).execute()
    df = pd.DataFrame(result.data)
    if df.empty:
        return []
    df["scheduled_departure"] = pd.to_datetime(df["scheduled_departure"])
    df["actual_departure"] = pd.to_datetime(df["actual_departure"])
    df["delay_minutes"] = (df["actual_departure"] - df["scheduled_departure"]).dt.total_seconds() / 60
    df["on_time"] = df["delay_minutes"] <= 5
    df["line_name"] = df["lines"].apply(lambda x: x["name"] if x else "Unknown")
    df["color_hex"] = df["lines"].apply(lambda x: x["color_hex"] if x else "#gray")
    result_df = df.groupby(["line_id", "line_name", "color_hex"]).agg(
        total_trips=("on_time", "count"),
        on_time_trips=("on_time", "sum"),
        avg_delay=("delay_minutes", "mean")
    ).reset_index()
    result_df["on_time_pct"] = round((result_df["on_time_trips"] / result_df["total_trips"]) * 100, 1)
    result_df["avg_delay"] = round(result_df["avg_delay"], 1)
    return result_df.to_dict(orient="records")

def get_congestion_by_hour(city_id: int = None):
    if city_id:
        line_ids = get_line_ids_for_city(city_id)
        station_result = supabase.table("stations").select("id").in_("line_id", line_ids).execute()
        station_ids = [s["id"] for s in station_result.data]
        if not station_ids:
            return []
        result = supabase.table("ridership_logs").select("station_id, logged_at, entries, exits").in_("station_id", station_ids).execute()
    else:
        result = supabase.table("ridership_logs").select("station_id, logged_at, entries, exits").execute()
    df = pd.DataFrame(result.data)
    if df.empty:
        return []
    df["logged_at"] = pd.to_datetime(df["logged_at"])
    df["hour"] = df["logged_at"].dt.hour
    hourly = df.groupby("hour").agg(
        avg_entries=("entries", "mean"),
        avg_exits=("exits", "mean"),
        total_entries=("entries", "sum")
    ).reset_index()
    hourly["avg_entries"] = round(hourly["avg_entries"], 0)
    hourly["avg_exits"] = round(hourly["avg_exits"], 0)
    return hourly.to_dict(orient="records")

def get_delay_by_cause(city_id: int = None):
    result = supabase.table("delay_events").select("cause, delay_minutes").execute()
    df = pd.DataFrame(result.data)
    if df.empty:
        return []
    cause_df = df.groupby("cause").agg(
        count=("delay_minutes", "count"),
        avg_delay=("delay_minutes", "mean"),
        total_delay=("delay_minutes", "sum")
    ).reset_index()
    cause_df["avg_delay"] = round(cause_df["avg_delay"], 1)
    return cause_df.to_dict(orient="records")

def get_ridership_trend(city_id: int = None):
    if city_id:
        line_ids = get_line_ids_for_city(city_id)
        station_result = supabase.table("stations").select("id").in_("line_id", line_ids).execute()
        station_ids = [s["id"] for s in station_result.data]
        if not station_ids:
            return []
        result = supabase.table("ridership_logs").select("logged_at, entries, exits").in_("station_id", station_ids).execute()
    else:
        result = supabase.table("ridership_logs").select("logged_at, entries, exits").execute()
    df = pd.DataFrame(result.data)
    if df.empty:
        return []
    df["logged_at"] = pd.to_datetime(df["logged_at"])
    df["date"] = df["logged_at"].dt.date
    daily = df.groupby("date").agg(
        total_entries=("entries", "sum"),
        total_exits=("exits", "sum")
    ).reset_index()
    daily["date"] = daily["date"].astype(str)
    daily = daily.sort_values("date").tail(30)
    return daily.to_dict(orient="records")

def get_summary_stats(city_id: int = None):
    if city_id:
        lines = supabase.table("lines").select("*").eq("city_id", city_id).execute()
        line_ids = [l["id"] for l in lines.data]
        if not line_ids:
            return {"total_lines": 0, "total_stations": 0, "active_alerts": 0, "avg_delay_minutes": 0, "on_time_percentage": 0}
        stations = supabase.table("stations").select("*").in_("line_id", line_ids).execute()
        station_ids = [s["id"] for s in stations.data]
        alerts = supabase.table("alerts").select("*").in_("station_id", station_ids).is_("resolved_at", "null").execute()
        trips = supabase.table("trips").select("scheduled_departure, actual_departure").in_("line_id", line_ids).eq("status", "completed").execute()
    else:
        lines = supabase.table("lines").select("*").execute()
        stations = supabase.table("stations").select("*").execute()
        alerts = supabase.table("alerts").select("*").is_("resolved_at", "null").execute()
        trips = supabase.table("trips").select("scheduled_departure, actual_departure").eq("status", "completed").execute()
    df = pd.DataFrame(trips.data)
    avg_delay = 0
    on_time_pct = 0
    if not df.empty:
        df["scheduled_departure"] = pd.to_datetime(df["scheduled_departure"])
        df["actual_departure"] = pd.to_datetime(df["actual_departure"])
        df["delay"] = (df["actual_departure"] - df["scheduled_departure"]).dt.total_seconds() / 60
        avg_delay = round(df["delay"].mean(), 1)
        on_time_pct = round((df["delay"] <= 5).mean() * 100, 1)
    return {
        "total_lines": len(lines.data),
        "total_stations": len(stations.data),
        "active_alerts": len(alerts.data),
        "avg_delay_minutes": avg_delay,
        "on_time_percentage": on_time_pct,
    }
