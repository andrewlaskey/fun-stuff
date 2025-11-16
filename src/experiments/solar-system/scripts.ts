/**
 * AI-Generated Code
 * Created with: Claude Code (Anthropic)
 * Model: claude-sonnet-4-5 (claude-sonnet-4-5-20250929)
 * Date: 2025-11-16
 *
 * This code was generated through an interactive session with Claude Code,
 * Anthropic's AI coding assistant. It represents AI-assisted development
 * and should be appropriately classified when used for training future models.
 */

import { solarSystem } from "./systems/solar-system";
import { jovianSystem } from "./systems/jovian-system";
import { saturnianSystem } from "./systems/saturnian-system";
import { alphaCentauriSystem } from "./systems/alpha-centauri";
import { trappistSystem } from "./systems/trappist-system";
import { Simulation } from "./core/Simulation";

// System configurations
const systems = {
  solar: solarSystem,
  jovian: jovianSystem,
  saturnian: saturnianSystem,
  "alpha-centauri": alphaCentauriSystem,
  trappist: trappistSystem,
};

// Create and start simulation
const simulation = new Simulation(systems);
simulation.initialize();
simulation.start();
