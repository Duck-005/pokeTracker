import os
import json
import hashlib
import re
import subprocess
import urllib.request
import urllib.parse
from datetime import datetime

# Paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CONFIG_PATH = os.path.join(BASE_DIR, "config", "players.json")
CACHE_DIR = os.path.join(BASE_DIR, "cache")
DASHBOARD_DIR = os.path.join(BASE_DIR, "dashboard")
DATA_JSON_PATH = os.path.join(DASHBOARD_DIR, "data.json")
PARSER_DIR = os.path.join(BASE_DIR, "parser")

def ensure_dirs():
    os.makedirs(CACHE_DIR, exist_ok=True)
    os.makedirs(DASHBOARD_DIR, exist_ok=True)

def extract_drive_id(url):
    # Match standard sharing links
    match = re.search(r'/file/d/([a-zA-Z0-9_-]{25,})', url)
    if match:
        return match.group(1)
    # Match direct download links or open links
    match = re.search(r'[?&]id=([a-zA-Z0-9_-]{25,})', url)
    if match:
        return match.group(1)
    return None

def download_from_drive(file_id, output_path):
    url = f"https://docs.google.com/uc?export=download&id={file_id}"
    print(f"Downloading file ID: {file_id} to {output_path}...")
    try:
        # Standard urllib download
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req) as response, open(output_path, 'wb') as out_file:
            # Check if we got a redirect/confirmation token for large files (rare for 128KB GBA saves, but safe)
            content = response.read()
            # If the response contains a virus warning / confirmation page
            if b"confirm=" in content and b"Google Drive" in content:
                # Extract confirmation token
                html_str = content.decode('utf-8', errors='ignore')
                token_match = re.search(r'confirm=([a-zA-Z0-9_-]+)', html_str)
                if token_match:
                    confirm_token = token_match.group(1)
                    confirm_url = f"https://docs.google.com/uc?export=download&id={file_id}&confirm={confirm_token}"
                    req = urllib.request.Request(confirm_url, headers=headers)
                    with urllib.request.urlopen(req) as confirm_response, open(output_path, 'wb') as confirm_out_file:
                        confirm_out_file.write(confirm_response.read())
                    return True
            out_file.write(content)
        return True
    except Exception as e:
        print(f"Error downloading file {file_id}: {e}")
        return False

def get_sha256(filepath):
    h = hashlib.sha256()
    with open(filepath, 'rb') as f:
        for chunk in iter(lambda: f.read(65536), b''):
            h.update(chunk)
    return h.hexdigest()

def run_parser(sav_path, output_json_path):
    # Run the C# parser compiled console app
    cmd = ["dotnet", "run", "--project", PARSER_DIR, "--", sav_path, output_json_path]
    print(f"Executing parser command: {' '.join(cmd)}")
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        print(result.stdout)
        return True
    except subprocess.CalledProcessError as e:
        print(f"Parser failed with exit code {e.returncode}")
        print("Stdout:", e.stdout)
        print("Stderr:", e.stderr)
        return False

def parse_playtime_to_seconds(playtime_str):
    try:
        parts = playtime_str.split(":")
        if len(parts) == 3:
            return int(parts[0]) * 3600 + int(parts[1]) * 60 + int(parts[2])
        elif len(parts) == 2:
            return int(parts[0]) * 3600 + int(parts[1]) * 60
    except Exception:
        pass
    return 0

def generate_activities(player_name, old_data, new_data):
    activities = []
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    # 1. Badge changes
    old_badges = set(old_data.get("obtained_badges", []))
    new_badges = set(new_data.get("obtained_badges", []))
    added_badges = new_badges - old_badges
    for badge in added_badges:
        activities.append({
            "player": player_name,
            "text": f"{player_name} earned the {badge} Badge!",
            "type": "badge",
            "timestamp": timestamp
        })

    # 2. Location changes
    old_loc = old_data.get("location", "")
    new_loc = new_data.get("location", "")
    if old_loc and new_loc and old_loc != new_loc:
        activities.append({
            "player": player_name,
            "text": f"{player_name} entered {new_loc}.",
            "type": "location",
            "timestamp": timestamp
        })

    # 3. Party Pokémon changes (level up & catches)
    old_party = {p.get("nickname") or p.get("species"): p for p in old_data.get("party", []) if p}
    new_party = {p.get("nickname") or p.get("species"): p for p in new_data.get("party", []) if p}

    for key, new_pk in new_party.items():
        species_name = new_pk.get("species", "Pokémon")
        level = new_pk.get("level", 1)
        
        if key in old_party:
            old_pk = old_party[key]
            old_level = old_pk.get("level", 1)
            # Level Up!
            if level > old_level:
                activities.append({
                    "player": player_name,
                    "text": f"{player_name}'s {new_pk.get('nickname') or species_name} leveled up to Lv. {level}!",
                    "type": "levelup",
                    "timestamp": timestamp
                })
        else:
            # Catches!
            activities.append({
                "player": player_name,
                "text": f"{player_name} caught {species_name} Lv. {level}!",
                "type": "catch",
                "timestamp": timestamp
            })

    # 4. Beat Champion status
    old_badges_count = old_data.get("badges_count", 0)
    new_badges_count = new_data.get("badges_count", 0)
    
    # Indigo Plateau / Ever Grande City champion triggers
    is_championship_loc = "Indigo Plateau" in new_loc or "Ever Grande" in new_loc or "Hall of Fame" in new_loc
    was_championship_loc = "Indigo Plateau" in old_loc or "Ever Grande" in old_loc or "Hall of Fame" in old_loc
    
    if is_championship_loc and not was_championship_loc and new_badges_count == 8:
        activities.append({
            "player": player_name,
            "text": f"{player_name} defeated the Elite Four and became the Champion!",
            "type": "champion",
            "timestamp": timestamp
        })

    return activities

def main():
    ensure_dirs()
    
    # 1. Load Player Config
    if not os.path.exists(CONFIG_PATH):
        print(f"Error: Config file not found at {CONFIG_PATH}")
        return

    with open(CONFIG_PATH, 'r') as f:
        config = json.load(f)

    players = config.get("players", [])
    if not players:
        print("No players configured.")
        return

    # Load existing dashboard data to preserve history / activities
    old_data_json = {}
    if os.path.exists(DATA_JSON_PATH):
        try:
            with open(DATA_JSON_PATH, 'r') as f:
                old_data_json = json.load(f)
        except Exception as e:
            print(f"Warning: Could not parse existing data.json: {e}")

    activity_feed = old_data_json.get("activity_feed", [])
    
    # Map of old player data parsed from previous data.json
    old_players_data = {p.get("name"): p for p in old_data_json.get("players", [])}
    
    # Hash database
    hash_db_path = os.path.join(CACHE_DIR, "hashes.json")
    hash_db = {}
    if os.path.exists(hash_db_path):
        try:
            with open(hash_db_path, 'r') as f:
                hash_db = json.load(f)
        except Exception:
            pass

    new_players_list = []
    
    for player in players:
        name = player.get("name")
        drive_url = player.get("drive_url")
        configured_game = player.get("game", "Unknown")

        if not name or not drive_url:
            print("Skipping invalid player config.")
            continue

        print(f"\n--- Processing Player: {name} ---")
        drive_id = extract_drive_id(drive_url)
        if not drive_id:
            # Check if drive_url is already a placeholder or actual file ID
            if len(drive_url) >= 25 and not drive_url.startswith("http"):
                drive_id = drive_url
            else:
                print(f"Error: Could not extract Google Drive file ID for player {name}.")
                # If we have old data, preserve it in the compilation
                if name in old_players_data:
                    new_players_list.append(old_players_data[name])
                continue

        sav_path = os.path.join(CACHE_DIR, f"{name}.sav")
        json_path = os.path.join(CACHE_DIR, f"{name}.json")
        
        # Download savefile
        success = download_from_drive(drive_id, sav_path)
        if not success:
            print(f"Warning: Download failed for player {name}. Using cached data if available.")
            if os.path.exists(json_path):
                with open(json_path, 'r') as f:
                    new_players_list.append(json.load(f))
            elif name in old_players_data:
                new_players_list.append(old_players_data[name])
            continue

        # Hash check
        new_hash = get_sha256(sav_path)
        old_hash = hash_db.get(name)

        parsed_json = None
        
        if old_hash == new_hash and os.path.exists(json_path):
            print(f"Save file for {name} has NOT changed. Loading cached JSON.")
            try:
                with open(json_path, 'r') as f:
                    parsed_json = json.load(f)
            except Exception:
                pass

        if not parsed_json:
            print(f"Save file for {name} has changed or no cache exists. Parsing...")
            # Run parser
            parser_success = run_parser(sav_path, json_path)
            if parser_success and os.path.exists(json_path):
                try:
                    with open(json_path, 'r') as f:
                        parsed_json = json.load(f)
                    # Update hash database
                    hash_db[name] = new_hash
                except Exception as e:
                    print(f"Error loading parsed JSON for {name}: {e}")
            
        if not parsed_json:
            print(f"Error: Could not obtain parsed JSON for {name}. Using old state if available.")
            if name in old_players_data:
                new_players_list.append(old_players_data[name])
            continue

        # Force override configured game name if custom in config
        if configured_game and configured_game != "Unknown":
            parsed_json["game"] = configured_game

        # Add player name parameter
        parsed_json["name"] = name
        parsed_json["last_updated"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        # Generate activities by comparing with old player state
        old_p_state = old_players_data.get(name, {})
        if not old_p_state and os.path.exists(json_path + ".prev"):
            try:
                with open(json_path + ".prev", 'r') as f:
                    old_p_state = json.load(f)
            except Exception:
                pass
                
        if old_p_state:
            new_activities = generate_activities(name, old_p_state, parsed_json)
            if new_activities:
                print(f"Generated {len(new_activities)} new activities for {name}.")
                activity_feed = new_activities + activity_feed
        
        # Save current state as prev for future runs
        try:
            with open(json_path + ".prev", 'w') as f:
                json.dump(parsed_json, f, indent=2)
        except Exception:
            pass

        new_players_list.append(parsed_json)

    # 2. Global Leaderboard Rankings
    # Rank by: Badges (descending), Pokedex Caught (descending), Playtime (descending)
    def sort_key(p):
        badges = p.get("badges_count", 0)
        caught = p.get("pokedex_caught", 0)
        playtime = parse_playtime_to_seconds(p.get("playtime", "00:00:00"))
        return (badges, caught, playtime)

    leaderboard = []
    ranked_players = sorted(new_players_list, key=sort_key, reverse=True)
    for idx, p in enumerate(ranked_players):
        leaderboard.append({
            "rank": idx + 1,
            "name": p.get("name"),
            "game": p.get("game"),
            "badges": p.get("badges_count", 0),
            "pokedex_caught": p.get("pokedex_caught", 0),
            "playtime": p.get("playtime", "00:00:00"),
            "location": p.get("location", "Unknown")
        })

    # Save hash database
    try:
        with open(hash_db_path, 'w') as f:
            json.dump(hash_db, f, indent=2)
    except Exception:
        pass

    # Trim activity feed to keep recent 100 entries
    activity_feed = activity_feed[:100]

    # Combine everything
    output_db = {
        "last_updated": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "players": new_players_list,
        "leaderboard": leaderboard,
        "activity_feed": activity_feed
    }

    with open(DATA_JSON_PATH, 'w') as f:
        json.dump(output_db, f, indent=2)
        
    print(f"\nConsolidated database generated successfully at '{DATA_JSON_PATH}'!")

if __name__ == "__main__":
    main()
