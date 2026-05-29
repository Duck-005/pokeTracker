// PokéTracker - Client Application Logic

// Custom inline SVG definitions for all Gen 3 badges (Kanto & Hoenn)
const BADGE_SVGS = {
    // Kanto Badges (FRLG)
    "Boulder": `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5" fill="#787878" stroke="#505050"/></svg>`,
    "Cascade": `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2C12 2 4 10 4 14C4 18.4 7.6 22 12 22C16.4 22 20 18.4 20 14C20 10 12 2 12 2Z" fill="#1d4ed8" stroke="#1e40af"/></svg>`,
    "Thunder": `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10" fill="#eab308" stroke="#ca8a04"/></svg>`,
    "Rainbow": `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M4 12C4 7.58 7.58 4 12 4C16.42 4 20 7.58 20 12A8 8 0 0 1 4 12Z" fill="url(#rainbowGrad)" stroke="#b91c1c"/><defs><linearGradient id="rainbowGrad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#ef4444"/><stop offset="33%" stop-color="#eab308"/><stop offset="66%" stop-color="#22c55e"/><stop offset="100%" stop-color="#3b82f6"/></linearGradient></defs></svg>`,
    "Soul": `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#a21caf" stroke="#86198f"/></svg>`,
    "Marsh": `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="9" fill="#ca8a04" stroke="#854d0e"/><circle cx="12" cy="12" r="5" fill="#ef4444" stroke="#b91c1c"/></svg>`,
    "Volcano": `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="12 2 22 12 12 22 2 12" fill="#ea580c" stroke="#c2410c"/></svg>`,
    "Earth": `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2L4 7v10l8 5 8-5V7l-8-5z M12 6a4 4 0 0 1 4 4c0 3-4 8-4 8s-4-5-4-8a4 4 0 0 1 4-4z" fill="#15803d" stroke="#166534"/></svg>`,

    // Hoenn Badges (RSE)
    "Stone": `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="3" width="18" height="18" rx="2" fill="#888888" stroke="#444444"/></svg>`,
    "Knuckle": `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="12 2 22 7 18 19 12 22 6 19 2 7" fill="#dc2626" stroke="#991b1b"/></svg>`,
    "Dynamo": `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="12 2 15 9 22 9 17 14 19 21 12 17 5 21 7 14 2 9 9 9" fill="#06b6d4" stroke="#0891b2"/></svg>`,
    "Heat": `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M17.66 11.2C17.43 8.04 14.86 6 12 6c-2.86 0-5.43 2.04-5.66 5.2C6.12 13.97 8 16.5 12 21c4-4.5 5.88-7.03 5.66-9.8z" fill="#ea580c" stroke="#b45309"/></svg>`,
    "Balance": `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M2 13h20M12 2v20 M6 6h12" fill="none" stroke="#eab308" stroke-linecap="round"/><polygon points="4 6 8 6 6 11" fill="#ca8a04"/><polygon points="16 6 20 6 18 11" fill="#ca8a04"/></svg>`,
    "Feather": `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2a10 10 0 0 0-4 18l4 2 4-2a10 10 0 0 0-4-18z M12 6l3 4h-6z M12 11l2.5 3.5h-5z" fill="#38bdf8" stroke="#0284c7"/></svg>`,
    "Mind": `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="12 2 21 8 21 16 12 22 3 16 3 8" fill="#d946ef" stroke="#c084fc"/><polyline points="12 2 12 22 M3 8 21 16 M3 16 21 8" stroke="#a21caf"/></svg>`,
    "Rain": `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2c0 0 5 4.5 5 8a5 5 0 0 1-10 0c0-3.5 5-8 5-8z M12 8c0 0 3 2.7 3 4.8a3 3 0 0 1-6 0c0-2.1 3-4.8 3-4.8z" fill="#0284c7" stroke="#0369a1"/></svg>`,
};

// Global dashboard database state
let trackerData = null;
let activeGames = {}; // Map: player_name -> active_game_index

// Normalize species name to match Showdown's animated GIF filenames
function getShowdownName(species) {
    if (!species) return "substitute";
    let name = species.toLowerCase();
    
    // Special name replacements
    if (name.includes("nidoran") && name.includes("f")) return "nidoranf";
    if (name.includes("nidoran") && name.includes("m")) return "nidoranm";
    if (name === "mr. mime" || name === "mr mime") return "mrmime";
    if (name === "mime jr." || name === "mime jr") return "mimejr";
    if (name === "farfetch'd" || name === "farfetchd") return "farfetchd";
    if (name === "flabébé" || name === "flabebe") return "flabebe";
    
    // Standard normalizations
    name = name.replace("♀", "f").replace("♂", "m");
    name = name.replace(/[^a-z0-9]/g, ""); // strip all non-alphanumeric chars
    return name;
}

// Fetch consolidated JSON database
async function fetchTrackerData() {
    try {
        const response = await fetch("data.json?t=" + new Date().getTime());
        if (!response.ok) throw new Error("Network response was not ok");
        
        trackerData = await response.json();
        renderDashboard();
    } catch (error) {
        console.error("Error fetching tracker data:", error);
        document.getElementById("update-status").textContent = "Update failed. Retrying...";
    }
}

// Render overall dashboard
function renderDashboard() {
    if (!trackerData) return;

    // 1. Update Header Counters
    document.getElementById("update-status").textContent = "Last Updated: " + (trackerData.last_updated || "Just Now");
    
    const playersCount = trackerData.players ? trackerData.players.length : 0;
    document.getElementById("player-count").textContent = `${playersCount} Active ${playersCount === 1 ? 'Player' : 'Players'}`;

    // 2. Render Leaderboard
    renderLeaderboard();

    // 4. Render Player Cards
    renderPlayerCards();
}

// Render Global Leaderboard
function renderLeaderboard() {
    const tbody = document.getElementById("leaderboard-body");
    tbody.innerHTML = "";

    const leaderboard = trackerData.leaderboard || [];
    if (leaderboard.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="placeholder-row">No leaderboard metrics computed yet.</td></tr>`;
        return;
    }

    leaderboard.forEach(row => {
        const tr = document.createElement("tr");
        
        // Add ranks styling
        if (row.rank === 1) tr.className = "top-rank-1";
        else if (row.rank === 2) tr.className = "top-rank-2";
        else if (row.rank === 3) tr.className = "top-rank-3";

        const playtimeFormatted = row.playtime.split(":");
        const playtimeDisplay = playtimeFormatted.length >= 2 ? `${playtimeFormatted[0]}h ${playtimeFormatted[1]}m` : row.playtime;

        tr.innerHTML = `
            <td><span class="leaderboard-rank-pill">${row.rank}</span></td>
            <td>
                <strong>${row.name}</strong> 
                <span class="muted" style="font-size:0.75rem; font-weight: 500;">(OT: ${row.trainer_name})</span>
                <br>
                <span class="muted" style="font-size:0.75rem">${row.game}</span>
            </td>
            <td><strong>${row.badges} / 8</strong></td>
            <td><strong>${row.pokedex_caught}</strong></td>
            <td>${playtimeDisplay}</td>
        `;
        tbody.appendChild(tr);
    });
}


// Render Player Cards
function renderPlayerCards() {
    const grid = document.getElementById("players-grid");
    
    // Save currently expanded tabs for each player to prevent resetting them on updates
    const activeTabs = {};
    document.querySelectorAll(".player-card").forEach(card => {
        const playerName = card.getAttribute("data-player");
        const activeTabBtn = card.querySelector(".tab-btn.active");
        if (playerName && activeTabBtn) {
            activeTabs[playerName] = activeTabBtn.getAttribute("data-tab");
        }
    });

    grid.innerHTML = "";

    const players = trackerData.players || [];
    if (players.length === 0) {
        grid.innerHTML = `<div class="loading-state"><p>No active player files loaded. Check config/players.json.</p></div>`;
        return;
    }

    players.forEach(player => {
        const name = player.name;
        const currentTab = activeTabs[name] || "party"; // Default to party tab
        
        // Get active game selection index
        const activeGameIdx = activeGames[name] !== undefined ? activeGames[name] : 0;
        const games = player.games || [];
        
        // Ensure active game index is valid
        const gameIdx = (activeGameIdx >= 0 && activeGameIdx < games.length) ? activeGameIdx : 0;
        const activeGame = games[gameIdx];

        if (!activeGame) {
            return; // Skip if no active game parses
        }

        const card = document.createElement("article");
        card.className = "player-card";
        card.setAttribute("data-player", name);
        
        // Setup card header, including Game Selector Pill navigation
        let gameSelectorHTML = "";
        if (games.length > 1) {
            gameSelectorHTML = `
                <div class="game-selector-bar" style="display: flex; gap: 0.5rem; padding: 0.5rem 1.5rem; background: rgba(0, 0, 0, 0.05); border-bottom: 1px solid var(--border-glass); align-items: center; overflow-x: auto;">
                    <span class="muted" style="font-size: 0.75rem; font-weight:600; text-transform: uppercase;">Syncs:</span>
                    ${games.map((g, idx) => `
                        <button class="game-pill-btn ${idx === gameIdx ? 'active' : ''}" data-game-idx="${idx}" style="background: ${idx === gameIdx ? 'var(--color-primary)' : 'rgba(15,23,42,0.05)'}; color: ${idx === gameIdx ? 'white' : 'var(--text-muted)'}; border: 1px solid ${idx === gameIdx ? 'var(--color-primary)' : 'var(--border-glass)'}; border-radius: 50px; padding: 0.2rem 0.75rem; font-size: 0.8rem; font-weight: 600; cursor: pointer; transition: var(--transition-fast); white-space: nowrap;">
                            ${g.game_name}
                        </button>
                    `).join('')}
                </div>
            `;
        }

        card.innerHTML = `
            <div class="player-card-header">
                <div class="player-card-title">
                    <h3 style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
                        ${name}
                        <span class="ot-badge" style="font-size: 0.75rem; font-weight: 500; background: rgba(15,23,42,0.06); padding: 0.15rem 0.5rem; border-radius: var(--radius-sm); color: var(--text-muted);">OT: ${activeGame.trainer_name}</span>
                    </h3>
                    <span class="game-badge game-${activeGame.game_name.toLowerCase().replace(/[^a-z]/g, '')}">${activeGame.game_name}</span>
                </div>
                <div class="header-quick-info">
                    <div class="quick-info-item">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                        <span>${activeGame.badges_count} / 8 Badges</span>
                    </div>
                    <div class="quick-info-item">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        <span>${activeGame.playtime}</span>
                    </div>
                    <div class="quick-info-item">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                        <span>${activeGame.location}</span>
                    </div>
                </div>
            </div>

            <!-- Game Selector pills for multi-game syncs -->
            ${gameSelectorHTML}

            <!-- Tab Buttons -->
            <nav class="player-card-tabs">
                <button class="tab-btn ${currentTab === 'party' ? 'active' : ''}" data-tab="party">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>
                    Party Pokémon
                </button>
                <button class="tab-btn ${currentTab === 'progress' ? 'active' : ''}" data-tab="progress">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    Badges & Pokedex
                </button>
                <button class="tab-btn ${currentTab === 'stats' ? 'active' : ''}" data-tab="stats">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
                    Detailed Stats
                </button>
            </nav>

            <!-- Tab Content Area -->
            <div class="tab-content">
                <!-- Panel 1: Party -->
                <div class="tab-panel ${currentTab === 'party' ? 'active' : ''}" data-panel="party">
                    <div class="party-grid">
                        ${renderPartyHTML(activeGame.party)}
                    </div>
                </div>

                <!-- Panel 2: Progress -->
                <div class="tab-panel ${currentTab === 'progress' ? 'active' : ''}" data-panel="progress">
                    <div class="progress-tab-layout">
                        <!-- Badges Grid -->
                        <div class="badge-tracker-container">
                            <h4>Gym Badges Obtained</h4>
                            <div class="badges-flex">
                                ${renderBadgesHTML(activeGame)}
                            </div>
                        </div>

                        <!-- Pokedex Panel -->
                        <div class="pokedex-completion-panel">
                            <div class="pokedex-header-data">
                                <h4>Pokédex Progression</h4>
                                <span class="dex-percentage-glowing">${activeGame.pokedex_percent_caught}%</span>
                            </div>
                            <div class="hp-bar-outer" style="height: 10px; margin: 0.5rem 0;">
                                <div class="hp-bar-inner" style="width: ${activeGame.pokedex_percent_caught}%;"></div>
                            </div>
                            <div class="dex-stats-block">
                                <div class="dex-stat-box">
                                    <span class="dex-stat-num">${activeGame.pokedex_caught}</span>
                                    <span class="dex-stat-lbl">Caught</span>
                                </div>
                                <div class="dex-stat-box">
                                    <span class="dex-stat-num">${activeGame.pokedex_seen}</span>
                                    <span class="dex-stat-lbl">Seen</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Panel 3: Stats -->
                <div class="tab-panel ${currentTab === 'stats' ? 'active' : ''}" data-panel="stats">
                    <div class="stats-tab-layout">
                        <div class="stats-card-sub">
                            <div class="stats-icon-bg">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                            </div>
                            <div class="stats-card-data">
                                <span class="stats-card-val">${activeGame.trainer_name}</span>
                                <span class="stats-card-lbl">Trainer OT Name</span>
                            </div>
                        </div>
                        <div class="stats-card-sub">
                            <div class="stats-icon-bg">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                            </div>
                            <div class="stats-card-data">
                                <span class="stats-card-val">${activeGame.money.toLocaleString()} ¥</span>
                                <span class="stats-card-lbl">Current Money</span>
                            </div>
                        </div>
                        <div class="stats-card-sub">
                            <div class="stats-icon-bg">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                            </div>
                            <div class="stats-card-data">
                                <span class="stats-card-val">${activeGame.trainer_id}</span>
                                <span class="stats-card-lbl">Trainer ID</span>
                            </div>
                        </div>
                        <div class="stats-card-sub">
                            <div class="stats-icon-bg">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                            </div>
                            <div class="stats-card-data">
                                <span class="stats-card-val">${activeGame.trainer_sid}</span>
                                <span class="stats-card-lbl">Secret ID</span>
                            </div>
                        </div>
                        <div class="stats-card-sub">
                            <div class="stats-icon-bg">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"/></svg>
                            </div>
                            <div class="stats-card-data">
                                <span class="stats-card-val">${activeGame.trainer_gender}</span>
                                <span class="stats-card-lbl">Trainer Gender</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Attach Tab Toggling event listeners
        card.querySelectorAll(".tab-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const targetTab = btn.getAttribute("data-tab");
                
                card.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                
                card.querySelectorAll(".tab-panel").forEach(panel => {
                    if (panel.getAttribute("data-panel") === targetTab) {
                        panel.classList.add("active");
                    } else {
                        panel.classList.remove("active");
                    }
                });
            });
        });

        // Attach Game Toggling event listeners for multi-game select
        card.querySelectorAll(".game-pill-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const selectedGameIdx = parseInt(btn.getAttribute("data-game-idx"), 10);
                activeGames[name] = selectedGameIdx;
                
                // Re-render only player cards grid to reflect changes immediately
                renderPlayerCards();
            });
        });
        
        grid.appendChild(card);
    });
}

// Generate Party HTML display
function renderPartyHTML(party) {
    if (!party || party.length === 0) {
        return `<div class="loading-state" style="grid-column: 1/-1;"><p>Party is empty. Ash is probably boxing his team!</p></div>`;
    }

    return party.map(pk => {
        const species = pk.species || "Unknown";
        const nickname = pk.nickname || "";
        const level = pk.level || 1;
        const shiny = pk.shiny || false;
        
        const sdName = getShowdownName(species);
        const spriteUrl = `https://play.pokemonshowdown.com/sprites/ani${shiny ? '-shiny' : ''}/${sdName}.gif`;
        
        const maxHP = pk.hp_max || 100;
        const currHP = pk.hp_current === undefined ? maxHP : pk.hp_current;
        const hpPercent = Math.min(100, Math.max(0, Math.round((currHP / maxHP) * 100)));
        
        let hpClass = "";
        if (currHP === 0) hpClass = "hp-fainted";
        else if (hpPercent <= 20) hpClass = "hp-crit";
        else if (hpPercent <= 50) hpClass = "hp-warn";

        const friendship = pk.friendship || 0;

        return `
            <div class="pokemon-slot ${currHP === 0 ? 'fainted-slot' : ''}">
                <div class="pokemon-header">
                    <div class="pokemon-sprite-container">
                        <img class="pokemon-sprite" src="${spriteUrl}" 
                            onerror="this.onerror=null; this.src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${shiny ? 'shiny/' : ''}${pk.species_id}.png'; this.onerror=function(){this.onerror=null; this.src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png';};" 
                            alt="${species}">
                        ${shiny ? '<span class="shiny-sparkle"></span>' : ''}
                    </div>
                    <div class="pokemon-name-level">
                        <h4>
                            ${species}
                            ${shiny ? '<span style="color:#ffd700; font-size: 0.95rem;">★</span>' : ''}
                        </h4>
                        ${nickname && nickname !== species ? `<span class="pokemon-nickname">"${nickname}"</span>` : ''}
                        <span class="pokemon-level-pill">Lv. ${level}</span>
                    </div>
                </div>

                <!-- HP Bar -->
                <div class="pokemon-health">
                    <div class="hp-text-vals">
                        <span>HP</span>
                        <span>${currHP} / ${maxHP} (${hpPercent}%)</span>
                    </div>
                    <div class="hp-bar-outer">
                        <div class="hp-bar-inner ${hpClass}" style="width: ${hpPercent}%;"></div>
                    </div>
                </div>

                <!-- Stats details metadata grid -->
                <div class="pokemon-meta-details">
                    <div class="pk-meta-row"><span class="pk-meta-label">Nature:</span> <span class="pk-meta-val">${pk.nature}</span></div>
                    <div class="pk-meta-row"><span class="pk-meta-label">Ability:</span> <span class="pk-meta-val">${pk.ability}</span></div>
                    <div class="pk-meta-row"><span class="pk-meta-label">Held:</span> <span class="pk-meta-val">${pk.held_item}</span></div>
                    <div class="pk-meta-row"><span class="pk-meta-label">Friend:</span> <span class="pk-meta-val">${friendship}</span></div>
                </div>

                <!-- Moves badge list -->
                <div class="pokemon-moves">
                    ${pk.moves.map(move => `<span class="move-pill" title="${move}">${move}</span>`).join('')}
                    ${Array(Math.max(0, 4 - pk.moves.length)).fill('<span class="move-pill muted" style="opacity:0.35">-</span>').join('')}
                </div>
            </div>
        `;
    }).join('');
}

// Render Badge progress SVG HTML
function renderBadgesHTML(player) {
    const nameLower = (player.game_name || "").toLowerCase();
    const isFRLG = player.game === "FRLG" || 
                   player.game === "FR" || 
                   player.game === "LG" || 
                   nameLower.includes("firered") || 
                   nameLower.includes("leafgreen") || 
                   nameLower.includes("fr") || 
                   nameLower.includes("lg") ||
                   nameLower.includes("red") ||
                   nameLower.includes("unbound");
    let badges;
    
    if (isFRLG) {
        badges = ["Boulder", "Cascade", "Thunder", "Rainbow", "Soul", "Marsh", "Volcano", "Earth"];
    } else {
        badges = ["Stone", "Knuckle", "Dynamo", "Heat", "Balance", "Feather", "Mind", "Rain"];
    }

    const obtainedSet = new Set(player.obtained_badges || []);

    return badges.map(badge => {
        const isObtained = obtainedSet.has(badge);
        return `
            <div class="badge-slot ${isObtained ? 'obtained' : ''}" title="${badge} Badge (${isObtained ? 'Obtained' : 'Locked'})">
                <div class="badge-icon">
                    ${BADGE_SVGS[badge] || '<svg width="24" height="24" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#333"/></svg>'}
                </div>
                <span>${badge}</span>
            </div>
        `;
    }).join('');
}

// Run app
document.addEventListener("DOMContentLoaded", () => {
    fetchTrackerData();
    setInterval(fetchTrackerData, 60000);
});
