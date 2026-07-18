export enum Biome {
    Ocean = "ocean",
    Land = "land",
    Desert = "desert",
    Forest = "forest",
    Grassland = "grassland",
    Tundra = "tundra",
    Mountain = "mountain",
    Swamp = "swamp",
    Wetlands = "wetlands",
    Taiga = "taiga",
    Rainforest = "rainforest",
    Savanna = "savanna",
    TemperateForest = "temperateForest",
    TemperateRainforest = "temperateRainforest",
    TemperateDeciduousForest = "temperateDeciduousForest",
    TemperateGrassland = "temperateGrassland",
    TemperateDesert = "temperateDesert",
    Unset = "unset",
}

export interface Cell {
    x: number;
    y: number;
    elevation: number;
    humidity: number;
    temperature: number;
    isOcean: boolean;
    isLand: boolean;
    biome: Biome;
    techtonicPlateId: number;
    plateDriftDirection: number;
}
