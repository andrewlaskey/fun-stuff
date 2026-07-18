import { World } from '../types/World';
import { SimAlgorithm } from '../types/SimAlgorithm';
import { Cell } from '../types/Cell';

export interface ElevationConfig {
    numPlates: number;
    numContinentalPlates: number;
    boundaryDetectionRadius: number;
    elevationChangeStrength: number;
    divergentElevationReduction: number;
    convergentElevationIncrease: number;
    noiseScale: number;
    noiseStrength: number;
}

export class ElevationGenerator implements SimAlgorithm {
    private config: ElevationConfig;
    private noiseMap: number[][] = [];

    constructor(config: ElevationConfig) {
        this.config = {
            numPlates: config.numPlates,
            numContinentalPlates: config.numContinentalPlates,
            boundaryDetectionRadius: config.boundaryDetectionRadius || 2,
            elevationChangeStrength: config.elevationChangeStrength || 0.3,
            divergentElevationReduction: config.divergentElevationReduction || 0.2,
            convergentElevationIncrease: config.convergentElevationIncrease || 0.4,
            noiseScale: config.noiseScale || 0.1,
            noiseStrength: config.noiseStrength || 0.3
        };
    }

    updateWorld(world: World): void {
        this.generatePlateDriftDirections(world);
        this.generateNoiseMap(world);
        this.initializeLandElevations(world);
        this.processPlateBoundaries(world);
    }

    private generateNoiseMap(world: World): void {
        const { width, height } = world.config;
        const { noiseScale } = this.config;

        this.noiseMap = Array(height).fill(0).map(() => Array(width).fill(0));

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                this.noiseMap[y][x] = this.perlinNoise(x * noiseScale, y * noiseScale);
            }
        }
    }

    private perlinNoise(x: number, y: number): number {
        const xi = Math.floor(x) & 255;
        const yi = Math.floor(y) & 255;
        const xf = x - Math.floor(x);
        const yf = y - Math.floor(y);

        const u = this.fade(xf);
        const v = this.fade(yf);

        const a = this.hash(xi) + yi;
        const b = this.hash(xi + 1) + yi;

        const aa = this.hash(a);
        const ab = this.hash(a + 1);
        const ba = this.hash(b);
        const bb = this.hash(b + 1);

        const grad1 = this.grad(aa, xf, yf);
        const grad2 = this.grad(ba, xf - 1, yf);
        const grad3 = this.grad(ab, xf, yf - 1);
        const grad4 = this.grad(bb, xf - 1, yf - 1);

        const x1 = this.lerp(grad1, grad2, u);
        const x2 = this.lerp(grad3, grad4, u);

        return (this.lerp(x1, x2, v) + 1) / 2;
    }

    private fade(t: number): number {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }

    private lerp(a: number, b: number, t: number): number {
        return a + t * (b - a);
    }

    private hash(n: number): number {
        n = ((n << 13) ^ n) & 0xffffffff;
        n = (n * (n * n * 15731 + 789221) + 1376312589) & 0x7fffffff;
        return n;
    }

    private grad(hash: number, x: number, y: number): number {
        const h = hash & 3;
        const u = h < 2 ? x : y;
        const v = h < 2 ? y : x;
        return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
    }

    private generatePlateDriftDirections(world: World): void {
        const plateIds = world.getPlateIds();

        for (const plateId of plateIds) {
            const plate = world.getPlate(plateId);
            const driftDirection = Math.floor(Math.random() * 8);

            for (const cell of plate) {
                cell.plateDriftDirection = driftDirection;
            }
        }
    }

    private initializeLandElevations(world: World): void {
        const { width, height } = world.config;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const cell = world.getCell(x, y);
                if (cell) {
                    const plate = world.getPlateByCell(cell);
                    if (plate) {
                        cell.elevation = plate.type === 'continental' ? 0.1 : -0.1;
                        cell.isLand = plate.type === 'continental';
                        cell.isOcean = plate.type === 'oceanic';
                    }

                    const noise = this.noiseMap[y] && this.noiseMap[y][x] ? this.noiseMap[y][x] : 0.5;
                    cell.elevation += noise * this.config.noiseStrength;
                }
            }
        }
    }

    private processPlateBoundaries(world: World): void {
        const { width, height } = world.config;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const cell = world.getCell(x, y);
                if (cell && cell.techtonicPlateId >= 0) {
                    this.processCellBoundaries(world, x, y, cell);
                }
            }
        }
    }

    private processCellBoundaries(world: World, x: number, y: number, cell: Cell): void {
        const { boundaryDetectionRadius } = this.config;
        const currentPlateId = cell.techtonicPlateId;

        for (let dy = -boundaryDetectionRadius; dy <= boundaryDetectionRadius; dy++) {
            for (let dx = -boundaryDetectionRadius; dx <= boundaryDetectionRadius; dx++) {
                const checkX = x + dx;
                const checkY = y + dy;

                if (checkX < 0 || checkX >= world.config.width ||
                    checkY < 0 || checkY >= world.config.height ||
                    (dx === 0 && dy === 0)) {
                    continue;
                }

                const neighborCell = world.getCell(checkX, checkY);
                if (!neighborCell || neighborCell.techtonicPlateId === -1) {
                    continue;
                }

                if (neighborCell.techtonicPlateId !== currentPlateId) {
                    this.processBoundary(world, x, y, cell, checkX, checkY, neighborCell);
                }
            }
        }
    }

    private processBoundary(world: World, x: number, y: number, cell: Cell,
                           neighborX: number, neighborY: number, neighborCell: Cell): void {
        const boundaryType = this.classifyBoundary(cell, neighborCell);

        if (boundaryType === 'divergent') {
            this.applyDivergentBoundaryEffect(world, x, y, cell);
        } else if (boundaryType === 'convergent') {
            this.applyConvergentBoundaryEffect(world, x, y, cell);
        }
    }

    private classifyBoundary(cell: Cell, neighborCell: Cell): 'divergent' | 'convergent' | 'transform' {
        const currentDirection = cell.plateDriftDirection;
        const neighborDirection = neighborCell.plateDriftDirection;

        let angleDiff = Math.abs(currentDirection - neighborDirection);
        if (angleDiff > 4) {
            angleDiff = 8 - angleDiff;
        }

        if (angleDiff === 4) {
            return 'convergent';
        } else if (angleDiff === 0) {
            return 'divergent';
        } else {
            return 'transform';
        }
    }

    private applyDivergentBoundaryEffect(world: World, x: number, y: number, cell: Cell): void {
        const { elevationChangeStrength, divergentElevationReduction, noiseStrength } = this.config;
        const baseReduction = elevationChangeStrength * divergentElevationReduction;

        const noise = this.noiseMap[y] && this.noiseMap[y][x] ? this.noiseMap[y][x] : 0.5;
        const noiseModifier = 1 + (noise - 0.5) * noiseStrength;
        const reduction = baseReduction * noiseModifier;

        cell.elevation = Math.max(-1, cell.elevation - reduction);

        if (cell.elevation < 0) {
            cell.isOcean = true;
            cell.isLand = false;
        }
    }

    private applyConvergentBoundaryEffect(world: World, x: number, y: number, cell: Cell): void {
        const { elevationChangeStrength, convergentElevationIncrease, noiseStrength } = this.config;
        const baseIncrease = elevationChangeStrength * convergentElevationIncrease;

        const noise = this.noiseMap[y] && this.noiseMap[y][x] ? this.noiseMap[y][x] : 0.5;
        const noiseModifier = 1 + (noise - 0.5) * noiseStrength;
        const increase = baseIncrease * noiseModifier;

        cell.elevation = Math.min(1, cell.elevation + increase);

        if (cell.elevation > 0) {
            cell.isOcean = false;
            cell.isLand = true;
        }
    }

    public getConfig(): ElevationConfig {
        return { ...this.config };
    }

    public updateConfig(newConfig: Partial<ElevationConfig>): void {
        this.config = { ...this.config, ...newConfig };
    }
}
