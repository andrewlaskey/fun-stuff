import { Cell, Biome } from './Cell';
import { Plate } from './Plate';

export interface WorldConfig {
    width: number;
    height: number;
    cellPixelSize: number;
}

export class World {
    public cells: Cell[][];
    public config: WorldConfig;
    public plates: Plate[];

    constructor(config: WorldConfig) {
        this.config = config;
        this.cells = this.generateDefaultWorld();
        this.plates = [];
    }

    private generateDefaultWorld(): Cell[][] {
        const { width, height } = this.config;
        const cells: Cell[][] = [];

        for (let y = 0; y < height; y++) {
            cells[y] = [];
            for (let x = 0; x < width; x++) {
                cells[y][x] = this.createDefaultCell(x, y);
            }
        }

        return cells;
    }

    private createDefaultCell(x: number, y: number): Cell {
        return {
            x,
            y,
            elevation: 0.5,
            humidity: 0.5,
            temperature: 0.5,
            isOcean: false,
            isLand: true,
            biome: Biome.Unset,
            techtonicPlateId: -1,
            plateDriftDirection: 0
        };
    }

    public getCell(x: number, y: number): Cell | null {
        if (x < 0 || x >= this.config.width || y < 0 || y >= this.config.height) {
            return null;
        }
        return this.cells[y][x];
    }

    public setCell(x: number, y: number, cell: Cell): void {
        if (x >= 0 && x < this.config.width && y >= 0 && y < this.config.height) {
            this.cells[y][x] = { ...cell, x, y };
        }
    }

    public addPlate(plate: Plate): void {
        this.plates.push(plate);
    }

    public getPlateByCell(cell: Cell): Plate | null {
        return this.plates.find(plate => plate.cells.includes(cell)) || null;
    }

    public getPlateById(plateId: number): Plate | null {
        return this.plates.find(plate => plate.id === plateId) || null;
    }

    public getPlateIds(): number[] {
        return this.plates.map(plate => plate.id);
    }

    public getPlate(plateId: number): Cell[] {
        return this.plates.find(plate => plate.id === plateId)?.cells || [];
    }
}
