import random
from datetime import datetime, timedelta
from app.core.database import supabase

cities_data = {
    "Mumbai": {
        "lines": [
            {"name": "Metro Line 1", "color_hex": "#EF4444", "total_length_km": 11.4},
            {"name": "Metro Line 2A", "color_hex": "#3B82F6", "total_length_km": 18.6},
            {"name": "Metro Line 7", "color_hex": "#22C55E", "total_length_km": 16.5},
        ],
        "stations": {
            "Metro Line 1": [
                ("Versova", 19.1307, 72.8188),
                ("D.N. Nagar", 19.1215, 72.8311),
                ("Azad Nagar", 19.1143, 72.8399),
                ("Andheri", 19.1197, 72.8464),
                ("Western Express Highway", 19.1143, 72.8556),
                ("Chakala", 19.1089, 72.8655),
                ("Airport Road", 19.0989, 72.8699),
                ("Marol Naka", 19.0934, 72.8766),
            ],
            "Metro Line 2A": [
                ("Dahisar East", 19.2520, 72.8681),
                ("Anand Nagar", 19.2389, 72.8611),
                ("Kandarpada", 19.2289, 72.8544),
                ("Mandapeshwar", 19.2189, 72.8511),
                ("Eksar", 19.2089, 72.8478),
                ("Borivali", 19.2320, 72.8567),
                ("Poisar", 19.1989, 72.8444),
                ("Magathane", 19.1889, 72.8411),
            ],
            "Metro Line 7": [
                ("Andheri East", 19.1134, 72.8697),
                ("Chakala", 19.1089, 72.8655),
                ("Airport Colony", 19.0989, 72.8722),
                ("Sahar Road", 19.0934, 72.8788),
                ("Domestic Airport", 19.0889, 72.8699),
                ("International Airport", 19.0934, 72.8644),
                ("Marol Naka", 19.0889, 72.8766),
                ("SEEPZ", 19.1034, 72.8811),
            ],
        }
    },
    "Delhi": {
        "lines": [
            {"name": "Red Line", "color_hex": "#EF4444", "total_length_km": 34.1},
            {"name": "Blue Line", "color_hex": "#3B82F6", "total_length_km": 56.6},
            {"name": "Yellow Line", "color_hex": "#EAB308", "total_length_km": 49.8},
            {"name": "Green Line", "color_hex": "#22C55E", "total_length_km": 29.6},
        ],
        "stations": {
            "Red Line": [
                ("Dilshad Garden", 28.6724, 77.3195),
                ("Jhilmil", 28.6689, 77.3089),
                ("Mansarovar Park", 28.6656, 77.2989),
                ("Shahdara", 28.6623, 77.2889),
                ("Welcome", 28.6734, 77.2789),
                ("Seelampur", 28.6645, 77.2689),
                ("Shastri Park", 28.6556, 77.2589),
                ("Kashmere Gate", 28.6678, 77.2289),
            ],
            "Blue Line": [
                ("Dwarka Sector 21", 28.5524, 77.0588),
                ("Dwarka Sector 8", 28.5634, 77.0688),
                ("Dwarka Sector 9", 28.5734, 77.0788),
                ("Dwarka Sector 10", 28.5834, 77.0888),
                ("Dwarka Sector 11", 28.5934, 77.0988),
                ("Dwarka Sector 12", 28.6034, 77.1088),
                ("Dwarka Sector 13", 28.6134, 77.1188),
                ("Dwarka Sector 14", 28.6234, 77.1288),
            ],
            "Yellow Line": [
                ("Samaypur Badli", 28.7436, 77.1389),
                ("Rohini Sector 18", 28.7336, 77.1289),
                ("Haiderpur Badli Mor", 28.7236, 77.1189),
                ("Jahangirpuri", 28.7280, 77.1634),
                ("Adarsh Nagar", 28.7180, 77.1734),
                ("Azadpur", 28.7080, 77.1834),
                ("Model Town", 28.6980, 77.1934),
                ("GTB Nagar", 28.6880, 77.2034),
            ],
            "Green Line": [
                ("Inderlok", 28.6734, 77.1589),
                ("Ashok Park Main", 28.6634, 77.1489),
                ("Punjabi Bagh West", 28.6734, 77.1389),
                ("ESI Hospital", 28.6534, 77.1389),
                ("Rajouri Garden", 28.6434, 77.1289),
                ("Ramesh Nagar", 28.6334, 77.1189),
                ("Moti Nagar", 28.6234, 77.1089),
                ("Kirti Nagar", 28.6534, 77.1489),
            ],
        }
    },
    "Bengaluru": {
        "lines": [
            {"name": "Purple Line", "color_hex": "#A855F7", "total_length_km": 43.5},
            {"name": "Green Line", "color_hex": "#22C55E", "total_length_km": 24.2},
        ],
        "stations": {
            "Purple Line": [
                ("Whitefield", 12.9698, 77.7499),
                ("Hopefarm", 12.9734, 77.7399),
                ("Kadugodi", 12.9698, 77.7299),
                ("Pattandur Agrahara", 12.9698, 77.7199),
                ("Nallurhalli", 12.9734, 77.7099),
                ("Kundalahalli", 12.9698, 77.6999),
                ("Brookefield", 12.9698, 77.6899),
                ("Tin Factory", 12.9934, 77.6634),
            ],
            "Green Line": [
                ("Nagasandra", 13.0534, 77.5134),
                ("Dasarahalli", 13.0434, 77.5234),
                ("Jalahalli", 13.0334, 77.5334),
                ("Peenya Industry", 13.0234, 77.5434),
                ("Peenya", 13.0134, 77.5534),
                ("Goraguntepalya", 13.0034, 77.5534),
                ("Yeshwanthpur", 13.0234, 77.5434),
                ("Sandal Soap Factory", 13.0134, 77.5634),
            ],
        }
    }
}

def seed_city(city_name, city_data):
    print(f"\nSeeding {city_name}...")
    city_result = supabase.table("cities").select("id").eq("name", city_name).single().execute()
    city_id = city_result.data["id"]
    print(f"  City ID: {city_id}")

    lines_to_insert = []
    for line in city_data["lines"]:
        lines_to_insert.append({**line, "city_id": city_id, "active": True})
    line_result = supabase.table("lines").insert(lines_to_insert).execute()
    line_map = {l["name"]: l["id"] for l in line_result.data}
    print(f"  Created {len(line_map)} lines")

    stations_to_insert = []
    for line_name, stations in city_data["stations"].items():
        line_id = line_map.get(line_name)
        if not line_id:
            continue
        for name, lat, lng in stations:
            stations_to_insert.append({
                "name": name,
                "line_id": line_id,
                "latitude": lat + random.uniform(-0.001, 0.001),
                "longitude": lng + random.uniform(-0.001, 0.001),
                "zone": random.randint(1, 3),
                "is_interchange": random.random() < 0.2,
            })
    station_result = supabase.table("stations").insert(stations_to_insert).execute()
    station_ids = [s["id"] for s in station_result.data]
    line_ids = list(line_map.values())
    print(f"  Created {len(station_ids)} stations")

    print(f"  Seeding trips...")
    trips_data = []
    start_date = datetime.now() - timedelta(days=180)
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
        print(f"    Trips: {min(i+batch_size, len(trips_data))}/{len(trips_data)}")

    print(f"  Seeding ridership...")
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
        print(f"    Ridership: {min(i+batch_size, len(ridership_data))}/{len(ridership_data)}")

    print(f"  Seeding alerts...")
    alerts_data = []
    for station_id in random.sample(station_ids, min(5, len(station_ids))):
        alerts_data.append({
            "type": random.choice(["delay", "congestion", "maintenance", "service_change"]),
            "station_id": station_id,
            "severity": random.choice(["low", "medium", "high", "critical"]),
            "message": f"Alert at {city_name} station {station_id}: {random.choice(['Delays expected', 'High congestion', 'Track maintenance', 'Service disruption'])}",
        })
    supabase.table("alerts").insert(alerts_data).execute()
    print(f"  Created {len(alerts_data)} alerts")
    print(f"  {city_name} seeding complete!")

for city_name, city_data in cities_data.items():
    seed_city(city_name, city_data)

print("\nAll cities seeded successfully!")