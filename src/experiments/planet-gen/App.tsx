import React, { useState } from 'react';
import './App.css';
import { World, WorldConfig } from './types/World';
import { CanvasRenderer } from './components/CanvasRenderer';
import { WorldControls } from './components/WorldControls';
import { VoronoiPlateGenerator, PlateConfig } from './algorithms/VoronoiPlateGenerator';
import { ElevationGenerator, ElevationConfig } from './algorithms/ElevationGenerator';

function App() {
  const [worldConfig, setWorldConfig] = useState<WorldConfig>({
    width: 50,
    height: 30,
    cellPixelSize: 10
  });

  const [world, setWorld] = useState(() => new World(worldConfig));
  const [plateInfo, setPlateInfo] = useState<{ numPlates: number; plateCenters: Array<{ x: number; y: number }> } | null>(null);
  const [visualizationMode, setVisualizationMode] = useState<'plates' | 'landmasses' | 'drift' | 'elevation'>('plates');

  const handleConfigChange = (newConfig: WorldConfig) => {
    setWorldConfig(newConfig);
    const newWorld = new World(newConfig);
    setWorld(newWorld);
  };

  const handleGeneratePlates = (numPlates: number, numContinentalPlates: number) => {
    const plateConfig: PlateConfig = {
      numPlates,
      numContinentalPlates
    };
    const plateGenerator = new VoronoiPlateGenerator(plateConfig);
    plateGenerator.updateWorld(world);
    const updatedWorld = new World(world.config);
    updatedWorld.cells = world.cells;
    updatedWorld.plates = world.plates;
    setWorld(updatedWorld);

    setPlateInfo({
      numPlates: plateGenerator.getNumPlates(),
      plateCenters: plateGenerator.getPlateCenters()
    });
  };

  const handleGenerateElevation = () => {
    const elevationConfig: ElevationConfig = {
      numPlates: 8,
      numContinentalPlates: 3,
      boundaryDetectionRadius: 2,
      elevationChangeStrength: 0.3,
      divergentElevationReduction: 0.2,
      convergentElevationIncrease: 0.4,
      noiseScale: 0.15,
      noiseStrength: 0.5
    };

    const elevationGenerator = new ElevationGenerator(elevationConfig);
    elevationGenerator.updateWorld(world);

    const updatedWorld = new World(world.config);
    updatedWorld.cells = world.cells;
    updatedWorld.plates = world.plates;
    setWorld(updatedWorld);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Planet Generator</h1>
        <p>A procedural world generation system</p>
      </header>

      <main>
        <WorldControls
          config={worldConfig}
          onConfigChange={handleConfigChange}
          onGeneratePlates={handleGeneratePlates}
          onGenerateElevation={handleGenerateElevation}
          visualizationMode={visualizationMode}
          onVisualizationModeChange={setVisualizationMode}
        />

        <CanvasRenderer world={world} visualizationMode={visualizationMode} />
      </main>
    </div>
  );
}

export default App;
