import os
import json
from datetime import datetime

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_JSON_PATH = os.path.join(BASE_DIR, "dashboard", "data.json")

def generate_mock():
    mock_db = {
        "last_updated": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "players": [
            {
                "name": "Marvin",
                "games": [
                    {
                        "game_name": "Radical Red",
                        "trainer_name": "marvin",
                        "trainer_gender": "Male",
                        "trainer_id": 56246,
                        "trainer_sid": 56852,
                        "money": 3120,
                        "playtime": "00:17:38",
                        "location": "Pallet Town (Interior)",
                        "pokedex_seen": 0,
                        "pokedex_caught": 0,
                        "pokedex_percent_seen": 0.0,
                        "pokedex_percent_caught": 0.0,
                        "badges_count": 0,
                        "obtained_badges": [],
                        "party": [
                            {
                                "species_id": 158,
                                "species": "Totodile",
                                "nickname": "cocodrilo",
                                "level": 6,
                                "shiny": False,
                                "gender": "M",
                                "friendship": 56,
                                "held_item": "None",
                                "nature": "Mild",
                                "ability": "Torrent",
                                "hp_current": 22,
                                "hp_max": 22,
                                "status": 0,
                                "stats": {"hp": 22, "attack": 13, "defense": 11, "sp_attack": 12, "sp_defense": 11, "speed": 11},
                                "ivs": {"hp": 8, "attack": 11, "defense": 8, "sp_attack": 19, "sp_defense": 5, "speed": 20},
                                "evs": {"hp": 0, "attack": 0, "defense": 0, "sp_attack": 1, "sp_defense": 0, "speed": 0},
                                "moves": ["Scratch", "Leer", "MiracleEye"]
                            }
                        ]
                    },
                    {
                        "game_name": "Emerald",
                        "trainer_name": "marvin",
                        "trainer_gender": "Male",
                        "trainer_id": 56246,
                        "trainer_sid": 56852,
                        "money": 12800,
                        "playtime": "05:14:02",
                        "location": "Mauville City",
                        "pokedex_seen": 42,
                        "pokedex_caught": 18,
                        "pokedex_percent_seen": 10.2,
                        "pokedex_percent_caught": 4.5,
                        "badges_count": 3,
                        "obtained_badges": ["Stone", "Knuckle", "Dynamo"],
                        "party": [
                            {
                                "species_id": 252,
                                "species": "Treecko",
                                "nickname": "gecko",
                                "level": 16,
                                "shiny": False,
                                "gender": "M",
                                "friendship": 120,
                                "held_item": "Miracle Seed",
                                "nature": "Timid",
                                "ability": "Overgrow",
                                "hp_current": 42,
                                "hp_max": 42,
                                "status": 0,
                                "stats": {"hp": 42, "attack": 22, "defense": 20, "sp_attack": 28, "sp_defense": 24, "speed": 32},
                                "ivs": {"hp": 18, "attack": 12, "defense": 15, "sp_attack": 31, "sp_defense": 20, "speed": 31},
                                "evs": {"hp": 0, "attack": 0, "defense": 0, "sp_attack": 20, "sp_defense": 0, "speed": 25},
                                "moves": ["Pound", "Absorb", "Quick Attack", "Mega Drain"]
                            },
                            {
                                "species_id": 25,
                                "species": "Pikachu",
                                "nickname": "",
                                "level": 14,
                                "shiny": True,
                                "gender": "F",
                                "friendship": 90,
                                "held_item": "Light Ball",
                                "nature": "Jolly",
                                "ability": "Static",
                                "hp_current": 35,
                                "hp_max": 35,
                                "status": 0,
                                "stats": {"hp": 35, "attack": 25, "defense": 18, "sp_attack": 22, "sp_defense": 20, "speed": 36},
                                "ivs": {"hp": 25, "attack": 28, "defense": 18, "sp_attack": 22, "sp_defense": 15, "speed": 31},
                                "evs": {"hp": 0, "attack": 10, "defense": 0, "sp_attack": 0, "sp_defense": 0, "speed": 20},
                                "moves": ["Thundershock", "Growl", "Tail Whip", "Quick Attack"]
                            }
                        ]
                    }
                ]
            }
        ],
        "leaderboard": [
            {"rank": 1, "name": "Marvin", "game": "Emerald", "badges": 3, "pokedex_caught": 18, "playtime": "05:14:02", "location": "Mauville City"},
            {"rank": 2, "name": "Marvin", "game": "Radical Red", "badges": 0, "pokedex_caught": 0, "playtime": "00:17:38", "location": "Pallet Town (Interior)"}
        ],
        "activity_feed": [
            {"player": "Marvin", "text": "Marvin earned the Dynamo Badge in Emerald!", "type": "badge", "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")},
            {"player": "Marvin", "text": "Marvin caught Pikachu Lv. 14 in Emerald!", "type": "catch", "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")},
            {"player": "Marvin", "text": "Marvin entered Mauville City in Emerald.", "type": "location", "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")}
        ]
    }

    os.makedirs(os.path.dirname(DATA_JSON_PATH), exist_ok=True)
    with open(DATA_JSON_PATH, 'w') as f:
        json.dump(mock_db, f, indent=2)
    print(f"Mock database successfully written to {DATA_JSON_PATH}!")

if __name__ == "__main__":
    generate_mock()
