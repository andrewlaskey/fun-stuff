import { World } from "./World";

export interface SimAlgorithm {
    updateWorld(world: World): void;
}
