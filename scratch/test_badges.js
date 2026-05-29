const data = {
  "players": [
    {
      "name": "Marvin",
      "games": [
        {
          "game_name": "Radical Red",
          "game": "FRLG"
        },
        {
          "game_name": "Emerald",
          "game": "E"
        },
        {
          "game_name": "Fire red",
          "game": "FR"
        }
      ]
    }
  ]
};

data.players[0].games.forEach(player => {
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
    
    console.log(`Game: ${player.game_name} | Type: ${player.game} | isFRLG: ${isFRLG}`);
});
