using System;
using System.IO;
using System.Text.Json;
using System.Collections.Generic;
using System.Reflection;
using PKHeX.Core;

namespace SaveParser
{
    class Program
    {
        static int Main(string[] args)
        {
            if (args.Length < 2)
            {
                Console.Error.WriteLine("Usage: dotnet run --project parser -- <input.sav> <output.json>");
                return 1;
            }

            string inputPath = args[0];
            string outputPath = args[1];

            try
            {
                if (!File.Exists(inputPath))
                {
                    Console.Error.WriteLine($"Error: Input savefile does not exist at '{inputPath}'");
                    return 2;
                }

                // Use the correct PKHeX.Core API: GetSaveFile(string path)
                SaveFile sav = SaveUtil.GetSaveFile(inputPath);
                if (sav == null)
                {
                    Console.Error.WriteLine("Error: PKHeX was unable to load savefile. SaveUtil returned null.");
                    return 3;
                }

                var parsedData = ExtractData(sav);

                var options = new JsonSerializerOptions { WriteIndented = true };
                string json = JsonSerializer.Serialize(parsedData, options);
                
                // Ensure output directory exists
                string? dir = Path.GetDirectoryName(outputPath);
                if (!string.IsNullOrEmpty(dir) && !Directory.Exists(dir))
                {
                    Directory.CreateDirectory(dir);
                }

                File.WriteAllText(outputPath, json);
                Console.WriteLine($"Successfully parsed '{inputPath}' and wrote JSON to '{outputPath}'");
                return 0;
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine($"Error: Exception during parsing: {ex.Message}");
                Console.Error.WriteLine(ex.StackTrace);
                return 4;
            }
        }

        static Dictionary<string, object> ExtractData(SaveFile sav)
        {
            var dict = new Dictionary<string, object>();

            // 1. Basic Trainer Info
            dict["trainer_name"] = sav.OT ?? "Unknown";
            dict["trainer_gender"] = sav.Gender == 1 ? "Female" : "Male";
            
            // Handle TID/SID safely
            dict["trainer_id"] = sav.DisplayTID;
            dict["trainer_sid"] = sav.DisplaySID;
            dict["money"] = sav.Money;
            dict["playtime"] = $"{sav.PlayedHours:00}:{sav.PlayedMinutes:00}:{sav.PlayedSeconds:00}";
            
            string gameVersion = sav.Version.ToString();
            dict["game"] = gameVersion;

            // 2. Pokedex Progress
            dict["pokedex_seen"] = sav.SeenCount;
            dict["pokedex_caught"] = sav.CaughtCount;
            dict["pokedex_percent_seen"] = Math.Round((double)sav.PercentSeen, 2);
            dict["pokedex_percent_caught"] = Math.Round((double)sav.PercentCaught, 2);

            // 3. Badges Extraction
            // Gen 3 FRLG vs RSE badge flag offsets
            bool isFRLG = sav.Version == GameVersion.FR || sav.Version == GameVersion.LG || gameVersion.Contains("FR") || gameVersion.Contains("LG");
            string[] badgeNames;
            int flagStart;

            if (isFRLG)
            {
                badgeNames = new string[] { "Boulder", "Cascade", "Thunder", "Rainbow", "Soul", "Marsh", "Volcano", "Earth" };
                flagStart = 0x820; // 2080
            }
            else
            {
                badgeNames = new string[] { "Stone", "Knuckle", "Dynamo", "Heat", "Balance", "Feather", "Mind", "Rain" };
                flagStart = 0x807; // 2055
            }

            var obtainedBadges = new List<string>();
            int badgeCount = 0;

            for (int i = 0; i < 8; i++)
            {
                int flagId = flagStart + i;
                bool hasBadge = false;
                try
                {
                    var getFlagMethod = sav.GetType().GetMethod("GetFlag", BindingFlags.Public | BindingFlags.Instance | BindingFlags.FlattenHierarchy);
                    if (getFlagMethod != null)
                    {
                        var res = getFlagMethod.Invoke(sav, new object[] { (ushort)flagId });
                        if (res is bool b) hasBadge = b;
                    }
                }
                catch {}

                if (hasBadge)
                {
                    obtainedBadges.Add(badgeNames[i]);
                    badgeCount++;
                }
            }

            dict["badges_count"] = badgeCount;
            dict["obtained_badges"] = obtainedBadges;

            // 4. Map Location
            int mapBank = 0;
            int mapNumber = 0;
            try
            {
                var bankProp = sav.GetType().GetProperty("MapBank");
                var numProp = sav.GetType().GetProperty("MapNumber");
                if (bankProp != null) mapBank = Convert.ToInt32(bankProp.GetValue(sav));
                if (numProp != null) mapNumber = Convert.ToInt32(numProp.GetValue(sav));
            }
            catch {}

            dict["map_bank"] = mapBank;
            dict["map_number"] = mapNumber;
            dict["location"] = GetLocationName(isFRLG, mapBank, mapNumber);

            // 5. Party Data Extraction
            var party = new List<Dictionary<string, object>>();
            if (sav.HasParty)
            {
                var partyData = sav.PartyData;
                foreach (var obj in partyData)
                {
                    if (obj is PKM pk && pk.Species != 0 && !pk.IsEgg)
                    {
                        var pkDict = new Dictionary<string, object>();
                        
                        pkDict["species_id"] = pk.Species;
                        pkDict["species"] = GetSpeciesName(pk.Species);
                        pkDict["nickname"] = pk.Nickname ?? "";
                        pkDict["level"] = pk.CurrentLevel;
                        pkDict["shiny"] = pk.IsShiny;
                        pkDict["gender"] = pk.Gender == 0 ? "M" : pk.Gender == 1 ? "F" : "U";
                        pkDict["friendship"] = pk.CurrentFriendship;
                        pkDict["held_item"] = GetItemName(pk.HeldItem);
                        pkDict["nature"] = pk.Nature.ToString();
                        pkDict["ability"] = GetAbilityName(pk.Ability);

                        // Stats & HP
                        pkDict["hp_current"] = pk.Stat_HPCurrent;
                        pkDict["hp_max"] = pk.Stat_HPMax;
                        pkDict["status"] = pk.Status_Condition;

                        pkDict["stats"] = new Dictionary<string, int>
                        {
                            { "hp", pk.Stat_HPMax },
                            { "attack", pk.Stat_ATK },
                            { "defense", pk.Stat_DEF },
                            { "sp_attack", pk.Stat_SPA },
                            { "sp_defense", pk.Stat_SPD },
                            { "speed", pk.Stat_SPE }
                        };

                        pkDict["ivs"] = new Dictionary<string, int>
                        {
                            { "hp", pk.IV_HP },
                            { "attack", pk.IV_ATK },
                            { "defense", pk.IV_DEF },
                            { "sp_attack", pk.IV_SPA },
                            { "sp_defense", pk.IV_SPD },
                            { "speed", pk.IV_SPE }
                        };

                        pkDict["evs"] = new Dictionary<string, int>
                        {
                            { "hp", pk.EV_HP },
                            { "attack", pk.EV_ATK },
                            { "defense", pk.EV_DEF },
                            { "sp_attack", pk.EV_SPA },
                            { "sp_defense", pk.EV_SPD },
                            { "speed", pk.EV_SPE }
                        };

                        // Moves
                        var moves = new List<string>();
                        if (pk.Move1 != 0) moves.Add(GetMoveName(pk.Move1));
                        if (pk.Move2 != 0) moves.Add(GetMoveName(pk.Move2));
                        if (pk.Move3 != 0) moves.Add(GetMoveName(pk.Move3));
                        if (pk.Move4 != 0) moves.Add(GetMoveName(pk.Move4));
                        pkDict["moves"] = moves;

                        party.Add(pkDict);
                    }
                }
            }
            dict["party"] = party;

            return dict;
        }

        static string GetSpeciesName(ushort speciesId)
        {
            try
            {
                // In PKHeX.Core, SpeciesName.GetSpeciesName(speciesId, 2) gets English name
                return SpeciesName.GetSpeciesName(speciesId, 2);
            }
            catch
            {
                try
                {
                    return ((Species)speciesId).ToString();
                }
                catch
                {
                    return $"Species {speciesId}";
                }
            }
        }

        static string GetMoveName(ushort moveId)
        {
            try
            {
                return ((Move)moveId).ToString().Replace("_", " ");
            }
            catch
            {
                return $"Move {moveId}";
            }
        }

        static string GetItemName(int itemId)
        {
            try
            {
                var itemType = typeof(SaveFile).Assembly.GetType("PKHeX.Core.Item");
                if (itemType != null)
                {
                    var val = Enum.ToObject(itemType, itemId);
                    string? name = val.ToString();
                    if (name != null) return name.Replace("_", " ");
                }
            }
            catch {}
            return $"Item {itemId}";
        }

        static string GetAbilityName(int abilityId)
        {
            try
            {
                var abilityType = typeof(SaveFile).Assembly.GetType("PKHeX.Core.Ability");
                if (abilityType != null)
                {
                    var val = Enum.ToObject(abilityType, abilityId);
                    string? name = val.ToString();
                    if (name != null) return name.Replace("_", " ");
                }
            }
            catch {}
            return $"Ability {abilityId}";
        }

        static string GetLocationName(bool isFRLG, int bank, int map)
        {
            if (isFRLG)
            {
                if (bank == 3)
                {
                    switch (map)
                    {
                        case 0: return "Pallet Town";
                        case 1: return "Viridian City";
                        case 2: return "Pewter City";
                        case 3: return "Cerulean City";
                        case 4: return "Lavender Town";
                        case 5: return "Vermilion City";
                        case 6: return "Celadon City";
                        case 7: return "Fuchsia City";
                        case 8: return "Cinnabar Island";
                        case 9: return "Indigo Plateau";
                        case 10: return "Saffron City";
                    }
                }
                else if (bank == 0) return "Pallet Town (Interior)";
                else if (bank == 1) return "Viridian City (Interior)";
            }
            else // RSE
            {
                if (bank == 0)
                {
                    switch (map)
                    {
                        case 0: return "Littleroot Town";
                        case 1: return "Oldale Town";
                        case 2: return "Petalburg City";
                        case 3: return "Rustboro City";
                        case 4: return "Dewford Town";
                        case 5: return "Slateport City";
                        case 6: return "Mauville City";
                        case 7: return "Verdanturf Town";
                        case 8: return "Fallarbor Town";
                        case 9: return "Lavaridge Town";
                        case 10: return "Fortree City";
                        case 11: return "Lilycove City";
                        case 12: return "Mossdeep City";
                        case 13: return "Sootopolis City";
                        case 14: return "Ever Grande City";
                        case 15: return "Pacifidlog Town";
                    }
                }
            }

            return $"Route/Area ({bank}-{map})";
        }
    }
}
