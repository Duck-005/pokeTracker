# Pokémon Savefile Progress Tracker

A pokemon GBA games tracker platform (Ruby, Sapphire, Emerald, FireRed, LeafGreen) and major ROM hacks (such as *Pokémon Radical Red*, *Pokémon Unbound*, etc.) simultaneously.

It automatically downloads players' `.sav` files from public Google Drive sharing links, parses them with a fast C# engine powered by `PKHeX` parser.

---

## Architecture Diagram

```mermaid
graph TD
    A[Google Drive Public Link] -->|Python Downloader| B[(Savefile Cache)]
    B -->|SHA256 Hash check| C{Hash Changed?}
    C -->|No| D[Skip Parsing & load Cache]
    C -->|Yes| E[C# PKHeX Parser]
    E -->|Extract Trainer, Party, Stats| F[Player JSON]
    F -->|Compare with Prev State| G[Generate New Activities]
    G -->|Merge with History| H[Compile data.json]
    D -->|Use Cached Data| I
    I -->|GitHub Pages| J[Friends Live Leaderboard]
```

---

## Repository Structure

- `parser/`: A C# console application linking directly to the local `PKHeX.Core` source project. It parses a `.sav` file and outputs normalized JSON.
- `scripts/`:
  - `update.py`: Main Python orchestrator executing savefile downloads, hashing checks, parser runs, and delta comparisons for Activity generation. Supports multi-game configurations!
  - `generate_mock_data.py`: Developer utility generating detailed multi-game mock data for visual testing.
- `config/`:
  - `players.json`: The player configuration database mapping custom names to Google Drive links and versions.
- `dashboard/`: The static single-page dashboard:
  - `index.html`: Layout containing Leaderboard and Player grid.
  - `styles.css`: CSS Design.
  - `app.js`: Core controller handling data AJAX requests, animated Showdown GIF bindings, Pokéball fallbacks, circular charts, and active-game sub-pill navigations.
- `.github/workflows/`:
  - `track.yml`: Automated GitHub Action running every 30 minutes on cron, updating player states, backing up progress history to Git, and deploying to GitHub Pages.

---

## Setup & Configuration

### Prerequisites
1. **.NET SDK 10.0+**
2. **Python 3.x**

---

### How to Add Players & Configure Multiple Games

The platform natively supports tracking **multiple games per player** concurrently. Each game run is parsed and displayed separately, and runs are ranked side-by-side on the global leaderboard.

To configure players and their active games, edit `config/players.json`:

#### Multi-Game Configuration Format (Recommended)
You can configure a list of distinct game runs under the `"games"` array of each player:

```json
{
  "players": [
    {
      "name": "Marvin",
      "games": [
        {
          "game_name": "Radical Red",
          "drive_url": "https://drive.google.com/file/d/YOUR_DRIVE_ID_1/view?usp=sharing"
        },
        {
          "game_name": "Emerald",
          "drive_url": "https://drive.google.com/file/d/YOUR_DRIVE_ID_2/view?usp=sharing"
        }
      ]
    }
  ]
}
```

> [!IMPORTANT]
> **Google Drive Link Setup:**
> 1. In your emulator cloud sync (e.g. DriveSync on Android or folder sync on PC), set it to sync the active `.sav` battery save to Google Drive.
> 2. Right-click the `.sav` file in Google Drive -> **Share** -> **Get Link**.
> 3. Change permissions from "Restricted" to **"Anyone with the link can view"** (this is needed so that the GitHub Actions can download it automatically without requiring credentials).
> 4. Copy the link and paste it into `config/players.json`.

---

## Running Locally

You can test and update the entire pipeline on your local computer before pushing changes:

### Step 1: Run the Update Pipeline
To download the latest saves, check hashes, run the parser, and compile `data.json` locally, execute:
```bash
python3 scripts/update.py
```

### Step 2: Serve the Web Dashboard
Since the dashboard uses AJAX requests to load `data.json`, browsers will restrict local files due to CORS. Serve the `dashboard` directory locally using a lightweight server:

```bash
# Start a simple web server
python3 -m http.server 8000 --directory dashboard
```

Now, open your browser and navigate to:
**`http://localhost:8000`**

---
