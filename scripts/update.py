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
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req) as response, open(output_path, 'wb') as out_file:
            content = response.read()
            if b"confirm=" in content and b"Google Drive" in content:
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


def main():
    ensure_dirs()
    
    if not os.path.exists(CONFIG_PATH):
        print(f"Error: Config file not found at {CONFIG_PATH}")
        return

    with open(CONFIG_PATH, 'r') as f:
        config = json.load(f)

    players = config.get("players", [])
    if not players:
        print("No players configured.")
        return

    # Load existing dashboard data to preserve timeline history
    old_data_json = {}
    if os.path.exists(DATA_JSON_PATH):
        try:
            with open(DATA_JSON_PATH, 'r') as f:
                old_data_json = json.load(f)
        except Exception as e:
            print(f"Warning: Could not parse existing data.json: {e}")

    activity_feed = []
    
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
        games_config = player.get("games")
        
        # Backward compatibility check for single-game players
        if not games_config:
            drive_url = player.get("drive_url")
            game_name = player.get("game", "Unknown")
            if drive_url:
                games_config = [{
                    "game_name": game_name,
                    "drive_url": drive_url
                }]
            else:
                games_config = []

        if not name or not games_config:
            print(f"Skipping invalid player config: {name}")
            continue

        print(f"\n=========================================")
        print(f"=== Processing Player: {name} ===")
        print(f"=========================================")

        parsed_games = []
        
        for g_idx, g_conf in enumerate(games_config):
            game_name = g_conf.get("game_name", f"Game {g_idx + 1}")
            drive_url = g_conf.get("drive_url")

            if not drive_url:
                print(f"Skipping game {game_name} due to missing drive_url.")
                continue

            print(f"\n--- Sub-game: {game_name} ---")
            drive_id = extract_drive_id(drive_url)
            if not drive_id:
                if len(drive_url) >= 25 and not drive_url.startswith("http"):
                    drive_id = drive_url
                else:
                    print(f"Error: Could not extract Google Drive file ID for game {game_name}.")
                    continue

            game_safe = re.sub(r'[^a-zA-Z0-9]', '', game_name)
            sav_path = os.path.join(CACHE_DIR, f"{name}_{game_safe}.sav")
            json_path = os.path.join(CACHE_DIR, f"{name}_{game_safe}.json")
            
            # Download savefile
            success = download_from_drive(drive_id, sav_path)
            if not success:
                print(f"Warning: Download failed for game {game_name}. Loading cache if available.")
                if os.path.exists(json_path):
                    with open(json_path, 'r') as f:
                        parsed_json = json.load(f)
                        parsed_games.append(parsed_json)
                continue

            # Hash check
            hash_key = f"{name}_{game_safe}"
            new_hash = get_sha256(sav_path)
            old_hash = hash_db.get(hash_key)

            parsed_json = None
            
            if old_hash == new_hash and os.path.exists(json_path):
                print(f"Save file for {name} ({game_name}) has NOT changed. Loading cached JSON.")
                try:
                    with open(json_path, 'r') as f:
                        parsed_json = json.load(f)
                except Exception:
                    pass

            if not parsed_json:
                print(f"Save file for {name} ({game_name}) has changed or no cache exists. Parsing...")
                parser_success = run_parser(sav_path, json_path)
                if parser_success and os.path.exists(json_path):
                    try:
                        with open(json_path, 'r') as f:
                            parsed_json = json.load(f)
                        hash_db[hash_key] = new_hash
                    except Exception as e:
                        print(f"Error loading parsed JSON: {e}")
                
            if not parsed_json:
                print(f"Error: Could not obtain parsed JSON. Using old cache if available.")
                if os.path.exists(json_path):
                    with open(json_path, 'r') as f:
                        parsed_json = json.load(f)
                else:
                    continue

            # Normalize game details
            parsed_json["game_name"] = game_name
            parsed_json["last_updated"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")



            parsed_games.append(parsed_json)

        if parsed_games:
            new_players_list.append({
                "name": name,
                "games": parsed_games
            })

    # 2. Global Leaderboard Rankings (ranks individual runs)
    runs = []
    for p in new_players_list:
        for g in p.get("games", []):
            runs.append({
                "player_name": p.get("name"),
                "game_name": g.get("game_name"),
                "trainer_name": g.get("trainer_name", "Unknown"),
                "badges_count": g.get("badges_count", 0),
                "pokedex_caught": g.get("pokedex_caught", 0),
                "playtime": g.get("playtime", "00:00:00"),
                "location": g.get("location", "Unknown")
            })

    def sort_key(r):
        badges = r.get("badges_count", 0)
        caught = r.get("pokedex_caught", 0)
        playtime = parse_playtime_to_seconds(r.get("playtime", "00:00:00"))
        return (badges, caught, playtime)

    leaderboard = []
    ranked_runs = sorted(runs, key=sort_key, reverse=True)
    for idx, r in enumerate(ranked_runs):
        leaderboard.append({
            "rank": idx + 1,
            "name": r.get("player_name"),
            "game": r.get("game_name"),
            "trainer_name": r.get("trainer_name", "Unknown"),
            "badges": r.get("badges_count", 0),
            "pokedex_caught": r.get("pokedex_caught", 0),
            "playtime": r.get("playtime", "00:00:00"),
            "location": r.get("location", "Unknown")
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
