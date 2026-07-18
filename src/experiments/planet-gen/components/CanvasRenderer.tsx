import React, { useRef, useEffect } from 'react';
import { World } from '../types/World';
import { Cell } from '../types/Cell';

interface CanvasRendererProps {
    world: World;
    visualizationMode: 'plates' | 'landmasses' | 'drift' | 'elevation';
}

export const CanvasRenderer: React.FC<CanvasRendererProps> = ({ world, visualizationMode }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const { width, height, cellPixelSize } = world.config;
        canvas.width = width * cellPixelSize;
        canvas.height = height * cellPixelSize;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const cell = world.getCell(x, y);
                if (cell) {
                    renderCell(ctx, cell, cellPixelSize);
                }
            }
        }
    }, [world, visualizationMode]);

    const renderCell = (ctx: CanvasRenderingContext2D, cell: Cell, cellPixelSize: number) => {
        const x = cell.x * cellPixelSize;
        const y = cell.y * cellPixelSize;

        let color = '#808080';

        if (visualizationMode === 'plates') {
            if (cell.techtonicPlateId >= 0) {
                const hue = (cell.techtonicPlateId * 137.5) % 360;
                color = `hsl(${hue}, 70%, 50%)`;
            }
        } else if (visualizationMode === 'landmasses') {
            if (cell.isOcean) {
                color = '#0066cc';
            } else if (cell.isLand) {
                color = '#228B22';
            }
        } else if (visualizationMode === 'drift') {
            if (cell.techtonicPlateId >= 0) {
                const hue = (cell.techtonicPlateId * 137.5) % 360;
                color = `hsl(${hue}, 40%, 75%)`;
            }
        } else if (visualizationMode === 'elevation') {
            if (cell.isLand) {
                const grayValue = Math.floor(50 + cell.elevation * 205);
                color = `rgb(${grayValue}, ${grayValue}, ${grayValue})`;
            } else if (cell.isOcean) {
                const depth = 1 - cell.elevation;
                const blueValue = Math.floor(30 + depth * 180);
                color = `rgb(0, 0, ${blueValue})`;
            }
        }

        ctx.fillStyle = color;
        ctx.fillRect(x, y, cellPixelSize, cellPixelSize);

        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, cellPixelSize, cellPixelSize);

        if (visualizationMode === 'drift' && cell.techtonicPlateId >= 0) {
            drawDriftArrow(ctx, x, y, cellPixelSize, cell.plateDriftDirection);
        }
    };

    const drawDriftArrow = (ctx: CanvasRenderingContext2D, x: number, y: number, cellPixelSize: number, direction: number) => {
        const centerX = x + cellPixelSize / 2;
        const centerY = y + cellPixelSize / 2;
        const arrowSize = Math.max(2, cellPixelSize * 0.3);

        const angles = [
            -Math.PI / 2,
            -Math.PI / 4,
            0,
            Math.PI / 4,
            Math.PI / 2,
            3 * Math.PI / 4,
            Math.PI,
            -3 * Math.PI / 4
        ];

        const angle = angles[direction] || 0;
        const headLength = arrowSize * 0.7;

        const tipX = centerX + Math.cos(angle) * arrowSize;
        const tipY = centerY + Math.sin(angle) * arrowSize;
        const baseX = centerX - Math.cos(angle) * arrowSize * 0.3;
        const baseY = centerY - Math.sin(angle) * arrowSize * 0.3;
        const leftX = tipX - Math.cos(angle - Math.PI / 6) * headLength;
        const leftY = tipY - Math.sin(angle - Math.PI / 6) * headLength;
        const rightX = tipX - Math.cos(angle + Math.PI / 6) * headLength;
        const rightY = tipY - Math.sin(angle + Math.PI / 6) * headLength;

        ctx.save();
        ctx.strokeStyle = '#000';
        ctx.fillStyle = '#000';
        ctx.lineWidth = Math.max(1, cellPixelSize * 0.05);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.beginPath();
        ctx.moveTo(baseX, baseY);
        ctx.lineTo(tipX, tipY);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(tipX, tipY);
        ctx.lineTo(leftX, leftY);
        ctx.lineTo(rightX, rightY);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    };

    return (
        <div style={{ textAlign: 'center', margin: '20px 0' }}>
            <canvas
                ref={canvasRef}
                style={{
                    border: '2px solid #333',
                    display: 'block',
                    margin: '0 auto'
                }}
            />
            <div style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
                World Size: {world.config.width} × {world.config.height} cells
                <br />
                Cell Size: {world.config.cellPixelSize}px
                <br />
                Canvas Size: {world.config.width * world.config.cellPixelSize} × {world.config.height * world.config.cellPixelSize}px
                {world.plates.length > 0 && (
                    <>
                        <br />
                        Tectonic Plates: {world.plates.length}
                        <br />
                        View Mode: {
                            visualizationMode === 'plates' ? 'Tectonic Plates' :
                            visualizationMode === 'landmasses' ? 'Land & Ocean' :
                            visualizationMode === 'drift' ? 'Drift Directions' :
                            'Elevation'
                        }
                    </>
                )}
            </div>
        </div>
    );
};
