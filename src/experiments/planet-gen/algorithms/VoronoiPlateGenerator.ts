import { World } from '../types/World';
import { SimAlgorithm } from '../types/SimAlgorithm';
import { Plate } from '../types/Plate';

export interface PlateConfig {
    numPlates: number;
    numContinentalPlates: number;
}

export class VoronoiPlateGenerator implements SimAlgorithm {
    private config: PlateConfig;
    private world: World | null = null;

    constructor(config: PlateConfig) {
        this.config = {
            numPlates: Math.max(1, config.numPlates),
            numContinentalPlates: Math.min(config.numContinentalPlates, config.numPlates)
        };
    }

    updateWorld(world: World): void {
        this.world = world;
        this.world.plates = [];
        this.generatePlateCenters(world);
        this.assignPlateIds(world);
    }

    private generatePlateCenters(world: World): void {
        for (let i = 0; i < this.config.numPlates; i++) {
            let center: { x: number; y: number };
            let attempts = 0;
            const maxAttempts = 100;

            do {
                center = {
                    x: Math.floor(Math.random() * world.config.width),
                    y: Math.floor(Math.random() * world.config.height)
                };
                attempts++;
            } while (this.isTooCloseToExistingCenters(center) && attempts < maxAttempts);

            const plateType = i < this.config.numContinentalPlates ? 'continental' : 'oceanic';
            const plate: Plate = {
                id: i,
                cells: [],
                center: center,
                type: plateType,
                driftDirection: 0
            };

            world.addPlate(plate);
        }
    }

    private isTooCloseToExistingCenters(newCenter: { x: number; y: number }): boolean {
        const minDistance = 3;

        for (const existingCenter of this.world?.plates.map(plate => plate.center) || []) {
            const distance = Math.sqrt(
                Math.pow(newCenter.x - existingCenter.x, 2) +
                Math.pow(newCenter.y - existingCenter.y, 2)
            );
            if (distance < minDistance) {
                return true;
            }
        }
        return false;
    }

    private assignPlateIds(world: World): void {
        const { width, height } = world.config;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const cell = world.getCell(x, y);
                if (cell) {
                    const plateId = this.findClosestPlateCenter(x, y);
                    const plate = world.getPlateById(plateId);

                    cell.techtonicPlateId = plateId;

                    if (plate?.type === 'continental') {
                        cell.isLand = true;
                        cell.isOcean = false;
                        cell.elevation = 0.1;
                    } else {
                        cell.isLand = false;
                        cell.isOcean = true;
                        cell.elevation = -0.1;
                    }

                    plate?.cells.push(cell);
                }
            }
        }
    }

    private findClosestPlateCenter(x: number, y: number): number {
        let closestPlateId = 0;
        let minDistance = Infinity;
        const plates = this.world?.plates || [];

        for (let i = 0; i < plates.length; i++) {
            const center = plates[i].center;
            const distance = Math.sqrt(
                Math.pow(x - center.x, 2) +
                Math.pow(y - center.y, 2)
            );

            if (distance < minDistance) {
                minDistance = distance;
                closestPlateId = i;
            }
        }

        return closestPlateId;
    }

    public getPlateCenters(): Array<{ x: number; y: number }> {
        return this.world?.plates.map(plate => plate.center) || [];
    }

    public getPlateTypes(): Array<'continental' | 'oceanic'> {
        return this.world?.plates.map(plate => plate.type) || [];
    }

    public getNumPlates(): number {
        return this.config.numPlates;
    }

    public getNumContinentalPlates(): number {
        return this.config.numContinentalPlates;
    }
}
