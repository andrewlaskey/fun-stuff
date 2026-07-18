import { Cell } from "./Cell";

export interface Plate {
    id: number;
    cells: Cell[];
    center: {
        x: number;
        y: number;
    };
    type: 'continental' | 'oceanic';
    driftDirection: number;
}
