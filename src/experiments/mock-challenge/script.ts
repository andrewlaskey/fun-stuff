type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "rectangle"; width: number; height: number }
  | { kind: "triangle"; base: number; height: number };

function calculateArea(shape: Shape): number {
    switch(shape.kind) {
        case 'circle':
            return Math.PI * Math.pow(shape.radius, 2);
        case 'rectangle':
            return shape.width * shape.height;
        case 'triangle':
            return 0.5 * shape.base * shape.height;
        default:
            const exhaustiveCheck: never = shape;
            throw new Error(`Invalid shape ${exhaustiveCheck}`);
    }
}