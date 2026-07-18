import React from 'react';
import { WorldConfig } from '../types/World';

interface WorldControlsProps {
    config: WorldConfig;
    onConfigChange: (config: WorldConfig) => void;
    onGeneratePlates: (numPlates: number, numContinentalPlates: number) => void;
    onGenerateElevation: () => void;
    visualizationMode: 'plates' | 'landmasses' | 'drift' | 'elevation';
    onVisualizationModeChange: (mode: 'plates' | 'landmasses' | 'drift' | 'elevation') => void;
}

export const WorldControls: React.FC<WorldControlsProps> = ({ config, onConfigChange, onGeneratePlates, onGenerateElevation, visualizationMode, onVisualizationModeChange }) => {
    const handleInputChange = (field: keyof WorldConfig, value: number) => {
        const newConfig = { ...config, [field]: value };
        onConfigChange(newConfig);
    };

    return (
        <div style={{
            padding: '20px',
            backgroundColor: '#f5f5f5',
            borderRadius: '8px',
            marginBottom: '20px',
            maxWidth: '400px',
            margin: '0 auto 20px auto'
        }}>
            <h3 style={{ marginTop: 0, marginBottom: '15px' }}>World Configuration</h3>

            <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    World Width (cells):
                </label>
                <input
                    type="number"
                    min="1"
                    max="200"
                    value={config.width}
                    onChange={(e) => handleInputChange('width', parseInt(e.target.value) || 1)}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                />
            </div>

            <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    World Height (cells):
                </label>
                <input
                    type="number"
                    min="1"
                    max="200"
                    value={config.height}
                    onChange={(e) => handleInputChange('height', parseInt(e.target.value) || 1)}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                />
            </div>

            <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    Cell Pixel Size:
                </label>
                <input
                    type="number"
                    min="1"
                    max="50"
                    value={config.cellPixelSize}
                    onChange={(e) => handleInputChange('cellPixelSize', parseInt(e.target.value) || 1)}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                />
            </div>

            <div style={{
                fontSize: '12px',
                color: '#666',
                backgroundColor: '#fff',
                padding: '10px',
                borderRadius: '4px',
                border: '1px solid #ddd'
            }}>
                <strong>Current Canvas Size:</strong><br />
                {config.width * config.cellPixelSize} × {config.height * config.cellPixelSize} pixels
            </div>

            <hr style={{ margin: '20px 0', border: 'none', borderTop: '1px solid #ddd' }} />

            <h3 style={{ marginTop: 0, marginBottom: '15px' }}>Tectonic Plates</h3>

            <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    Number of Plates:
                </label>
                <input
                    type="number"
                    min="1"
                    max="20"
                    defaultValue="9"
                    id="numPlates"
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                />
            </div>

            <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    Continental Plates:
                </label>
                <input
                    type="number"
                    min="0"
                    max="20"
                    defaultValue="3"
                    id="numContinentalPlates"
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                />
                <small style={{ color: '#666', fontSize: '12px' }}>
                    (Remaining plates will be oceanic)
                </small>
            </div>

            <button
                onClick={() => {
                    const numPlates = parseInt((document.getElementById('numPlates') as HTMLInputElement)?.value || '5');
                    const numContinentalPlates = parseInt((document.getElementById('numContinentalPlates') as HTMLInputElement)?.value || '2');
                    onGeneratePlates(numPlates, numContinentalPlates);
                }}
                style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '16px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                }}
                onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#45a049'; }}
                onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#4CAF50'; }}
            >
                Generate Tectonic Plates
            </button>

            <hr style={{ margin: '20px 0', border: 'none', borderTop: '1px solid #ddd' }} />

            <h3 style={{ marginTop: 0, marginBottom: '15px' }}>Elevation Generation</h3>

            <div style={{ marginBottom: '15px' }}>
                <p style={{ fontSize: '12px', color: '#666', margin: '0 0 10px 0' }}>
                    Generates elevation based on plate boundaries:
                    <br />
                    • <strong>Divergent boundaries</strong> reduce elevation (rifts, valleys)
                    <br />
                    • <strong>Convergent boundaries</strong> increase elevation (mountains, ridges)
                    <br />
                    • <strong>Transform boundaries</strong> have no effect
                </p>

                <button
                    onClick={onGenerateElevation}
                    style={{
                        width: '100%',
                        padding: '12px',
                        backgroundColor: '#FF6B35',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '16px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#e55a2b'; }}
                    onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#FF6B35'; }}
                >
                    Generate Elevation
                </button>
            </div>

            <hr style={{ margin: '20px 0', border: 'none', borderTop: '1px solid #ddd' }} />

            <h3 style={{ marginTop: 0, marginBottom: '15px' }}>Visualization</h3>

            <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    View Mode:
                </label>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {(['plates', 'landmasses', 'drift', 'elevation'] as const).map((mode) => (
                        <button
                            key={mode}
                            onClick={() => onVisualizationModeChange(mode)}
                            style={{
                                flex: '1 1 22%',
                                padding: '8px',
                                backgroundColor: visualizationMode === mode ? '#4CAF50' : '#f0f0f0',
                                color: visualizationMode === mode ? 'white' : '#333',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontWeight: visualizationMode === mode ? 'bold' : 'normal',
                                fontSize: '11px'
                            }}
                        >
                            {mode === 'plates' ? 'Tectonic Plates' :
                             mode === 'landmasses' ? 'Land & Ocean' :
                             mode === 'drift' ? 'Drift Directions' : 'Elevation'}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};
