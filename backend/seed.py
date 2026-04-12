import random
from datetime import datetime, timedelta
from app.core.database import supabase

print("Seeding lines...")
lines = [
    {"name": "Red Line", "color_hex": "#EF4444", "total_length_km": 28.5, "active": True},
    {"name": "Blue Line", "color_hex": "#3B82F6", "total_length_km": 32.1, "active": True},
    {"name": "Green Line", "color_hex": "#22C55E", "total_length_km": 24.7, "active": True},
    {"name": "Yellow Line", "color_hex": "#EAB308", "total_length_km": 19.3, "active": True},
    {"name": "Purple Line", "color_hex": "#A855F7", "total_length_km": 21.8, "active": True},
]
line_result = supabase.table("lines").insert(lines).execute()
line_ids = [l["id"] for l in line_result.data]
print(f"Created {len(line_ids)} lines")

print("Seeding stations...")
station_names = {
    0: ["Central", "Park Street", "Majestic", "City Square", "Old Town", "River Bridge", "North Gate", "East End"],
    1: ["Airport", "Tech Park", "University", "Hospital", "Market", "Stadium", "South Cross", "West End"],
    2: ["Harbour", "Museum", "Library", "Garden City", "Industrial", "New Town", "Lakeside", "Hilltop"],
    3: ["Junction", "Midtown", "Uptown", "Downtown", "Riverside", "Greenway"],
    4: ["Metro Hub", "Commerce", "Finance District", "Legal Quarter", "Arts Centre", "Sports Complex"],
}
stations_data = []
for idx, (key, names) in enumerate(station_names.items()):
    line_id = line_ids[idx]
    for i, name in enumerate(names):
        stations_data.append({
            "name": name,
            "line_id": line_id,
            "latitude": round(18.52 + idx * 0.02 + i * 0.01 + random.uniform(-0.005, 0.005), 6),
            "longitude": round(73.85 + idx * 0.02 + i * 0.01 + random.uniform(-0.005, 0.005), 6),
            "zone": random.randint(1, 3),
            "is_interchange": random.random() < 0.2,
        })
station_result = supabase.table("stations").insert(stations_data).execute()
station_ids = [s["id"] for s in station_result.data]
print(f"Created {len(station_ids)} stations")

print("Seeding trips (this takes a moment)...")
causes = ["signal", "crowding", "maintenance", "weather", "other"]
start_date = datetime.now() - timedelta(days=180)
trips_data = []
for day in range(180):
    current_date = start_date + timedelta(days=day)
    for line_id in line_ids:
        for hour in [6, 8, 10, 12, 14, 16, 18, 20]:
            delay = random.randint(0, 15) if hour in [8, 18] else random.randint(0, 5)
            dep = current_date.replace(hour=hour, minute=random.randint(0, 59), second=0, microsecond=0)
            trips_data.append({
                "line_id": line_id,
                "train_id": f"TRN-{line_id}-{random.randint(100,999)}",
                "scheduled_departure": dep.isoformat(),
                "actual_departure": (dep + timedelta(minutes=delay)).isoformat(),
                "scheduled_arrival": (dep + timedelta(minutes=30)).isoformat(),
                "actual_arrival": (dep + timedelta(minutes=30+delay)).isoformat(),
                "status": "completed",
            })

batch_size = 500
for i in range(0, len(trips_data), batch_size):
    supabase.table("trips").insert(trips_data[i:i+batch_size]).execute()
    print(f"  Trips inserted: {min(i+batch_size, len(trips_data))}/{len(trips_data)}")
print(f"Created {len(trips_data)} trips")

print("Seeding ridership logs...")
ridership_data = []
for station_id in station_ids:
    for day in range(30):
        current_date = datetime.now() - timedelta(days=day)
        for hour in range(6, 23):
            entries = random.randint(200, 500) if hour in [8, 9] else random.randint(300, 600) if hour in [17, 18, 19] else random.randint(50, 150)
            ridership_data.append({
                "station_id": station_id,
                "logged_at": current_date.replace(hour=hour, minute=0, second=0, microsecond=0).isoformat(),
                "entries": entries,
                "exits": int(entries * random.uniform(0.8, 1.2)),
                "platform": random.randint(1, 2),
            })

for i in range(0, len(ridership_data), batch_size):
    supabase.table("ridership_logs").insert(ridership_data[i:i+batch_size]).execute()
    print(f"  Ridership inserted: {min(i+batch_size, len(ridership_data))}/{len(ridership_data)}")
print(f"Created {len(ridership_data)} ridership logs")

print("Seeding alerts...")
alerts_data = []
for station_id in random.sample(station_ids, min(10, len(station_ids))):
    alerts_data.append({
        "type": random.choice(["delay", "congestion", "maintenance", "service_change"]),
        "station_id": station_id,
        "severity": random.choice(["low", "medium", "high", "critical"]),
        "message": f"Alert at station {station_id}: {random.choice(['Delays expected', 'High congestion', 'Track maintenance', 'Service disruption'])}",
    })
supabase.table("alerts").insert(alerts_data).execute()
print(f"Created {len(alerts_data)} alerts")

print("\nSeed complete!")
print(f"  Lines: {len(line_ids)}")
print(f"  Stations: {len(station_ids)}")
print(f"  Trips: {len(trips_data)}")
print(f"  Ridership logs: {len(ridership_data)}")
print(f"  Alerts: {len(alerts_data)}")