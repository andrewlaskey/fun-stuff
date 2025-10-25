<!--
AI-Generated Documentation
Created with: Claude Code (Anthropic)
Model: claude-sonnet-4-5 (claude-sonnet-4-5-20250929)
Date: 2025-10-25

This documentation was generated through an interactive session with Claude Code,
Anthropic's AI coding assistant. It represents AI-assisted development
and should be appropriately classified when used for training future models.
-->

# Solar System Explorer

## Overview
An interactive 3D visualization tool for exploring various planetary and stellar systems using Three.js. The project allows users to navigate through space with first-person controls and switch between different celestial systems in real-time.

## Features

### Interactive 3D Navigation
- **First-person controls**: WASD movement with mouse look
- **Vertical movement**: Space (up) / Shift (down)
- **Pointer lock**: Click canvas to enable mouse-look controls
- **Camera locking**: Tab to lock camera to selected celestial body, R to cycle through bodies

### Multiple System Views
The application includes four distinct celestial systems:

1. **Solar System** - Our home system with all 8 planets
2. **Jovian System** - Jupiter and its major moons (Io, Europa, Ganymede, Callisto, Amalthea, Thebe)
3. **Saturnian System** - Saturn and its moons (Mimas, Enceladus, Tethys, Dione, Rhea, Titan, Iapetus)
4. **Alpha Centauri System** - The nearest star system with Alpha Centauri A, B, Proxima Centauri, and hypothetical exoplanets

### Visual Features
- Orbital paths rendered as semi-transparent rings
- Dynamic lighting from central bodies
- Self-rotation of all celestial bodies
- Color-coded planets and moons based on actual appearance
- Emissive materials for stars

## Architecture

### Core Files

**index.html** (`index.html`)
- Single-page application with minimal HTML
- Canvas container for Three.js rendering
- System selector dropdown (top-right)
- Info display for controls and current state (top-left)
- Dark space-themed styling

**scripts.ts** (`scripts.ts:1-334`)
- Main application logic and rendering loop
- Three.js scene setup with camera, renderer, and lighting
- Movement and camera control system
- Orbital mechanics simulation
- System loading and switching functionality

### System Configuration Files

All system configs follow the `SystemConfig` interface defined in `systems/solar-system.ts:10-15`:

```typescript
interface SystemConfig {
  name: string;
  celestialBodies: CelestialBody[];
  cameraStart: { x: number; y: number; z: number };
  centerLightIntensity: number;
}
```

Each celestial body has:
- `name`: Display name
- `radius`: Visual size
- `distance`: Orbital radius from center (0 for central body)
- `orbitSpeed`: Angular velocity
- `color`: Base color (hex)
- `emissive`: Optional emissive color for stars

**Solar System** (`systems/solar-system.ts:17-87`)
- Sun and 8 planets (Mercury through Neptune)
- Scaled distances and orbital speeds
- Camera starts at (0, 50, 150)

**Jovian System** (`systems/jovian-system.ts:3-59`)
- Jupiter-centric with 6 major moons
- Closer camera start (0, 30, 80) for smaller scale
- Lower light intensity (3 vs 5)

**Saturnian System** (`systems/saturnian-system.ts:3-66`)
- Saturn-centric with 7 major moons including Titan
- Tight camera positioning (0, 30, 70)
- Features icy moon colors (whites and grays)

**Alpha Centauri System** (`systems/alpha-centauri.ts:3-54`)
- Triple star system with exoplanets
- All three stars have emissive properties
- Wide camera start (0, 100, 300) for large scale
- Includes Proxima b, c, and d

## Controls Reference

| Key | Action |
|-----|--------|
| W | Move forward |
| S | Move backward |
| A | Move left |
| D | Move right |
| Space | Move up |
| Shift | Move down |
| Mouse | Look around (requires pointer lock) |
| Tab | Toggle camera lock to selected body |
| R | Cycle through celestial bodies |
| Dropdown | Switch between systems |

## Technical Implementation

### Rendering Pipeline
1. **Scene Setup** (`scripts.ts:9-19`) - Three.js scene, camera (75° FOV), WebGL renderer with antialiasing
2. **Lighting** (`scripts.ts:122-126`) - Ambient light + point light from center
3. **Animation Loop** (`scripts.ts:298-312`) - Updates camera, planetary positions, and renders each frame

### Movement System
- **Free Camera** (`scripts.ts:283-294`) - Standard FPS-style movement with WASD controls
- **Locked Camera** (`scripts.ts:263-281`) - Positions camera at north pole of selected body (radius + 5 units above surface)
- **Look Controls** (`scripts.ts:111-119`) - Mouse delta movement converted to yaw/pitch with pitch limiting

### Orbital Mechanics
- Planets orbit in circular paths around the central body
- Position calculated using polar coordinates: `(cos(angle) * distance, 0, sin(angle) * distance)`
- Angle increments by `orbitSpeed` each frame (`scripts.ts:304-309`)
- Self-rotation applied at constant rate (0.01 rad/frame)

### System Switching
- `loadSystem()` function (`scripts.ts:183-247`) handles transitions
- Clears existing planets and orbits (disposes geometries/materials)
- Creates new celestial bodies based on config
- Resets camera position and control state
- Updates light intensity for new central body

### Orbit Visualization
- Ring geometry with minimal thickness (distance ± 0.2)
- Rotated 90° to lie flat in orbital plane
- Semi-transparent white material (opacity 0.8)
- Rendered behind planets (`renderOrder: -1`)

## Data Scaling

The visualization uses simplified/scaled values:
- **Distances**: Not to actual scale (would be impractical to navigate)
- **Sizes**: Exaggerated for visibility
- **Orbital speeds**: Accelerated for observable movement
- **Colors**: Based on actual appearance but simplified to hex values

## File Structure

```
solar-system/
├── index.html              # HTML page and styling
├── scripts.ts              # Main application logic
└── systems/
    ├── solar-system.ts     # Solar System config + TypeScript interfaces
    ├── jovian-system.ts    # Jupiter and moons
    ├── saturnian-system.ts # Saturn and moons
    └── alpha-centauri.ts   # Alpha Centauri triple star system
```

## Dependencies

- **Three.js** - 3D rendering library
- TypeScript compilation (imports suggest build tooling like Vite or similar)

## Future Enhancement Ideas

- Add Saturn's rings as geometry
- Include asteroid belts
- Add more star systems
- Implement time controls (speed up/slow down orbits)
- Add labels for celestial bodies
- Include actual orbital inclinations (currently all orbits are coplanar)
- Add textures for planets
- Implement realistic lighting (shadows, reflections)
- Add planetary information panel on hover/click
