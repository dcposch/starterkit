import { GameObjects, Tilemaps } from "phaser";
import { Coord } from "./types";
import { worldCoordToPixel } from "./utils";

export function explode(
  coord: Coord,
  particles: GameObjects.Particles.ParticleEmitterManager,
  map: Tilemaps.Tilemap,
  color?: number
) {
  const emitter = particles.createEmitter({
    scale: {
      start: 0.3,
      end: 0.0,
    },
    tint: {
      start: color ?? 0x808080,
      end: color ?? 0x808080,
    },
    speed: {
      min: -800,
      max: 100,
    },
    gravityY: 700,
    lifespan: 600,
    blendMode: Phaser.BlendModes.SCREEN,
  });
  const pos = worldCoordToPixel(map, coord);
  emitter.setBounds(pos.x - 50, pos.y - 50, 100, 100);
  emitter.explode(8, pos.x, pos.y);
  setTimeout(() => emitter.remove(), 1000);
}

export function rangeEmitter(
  from: Coord,
  to: Coord,
  particles: GameObjects.Particles.ParticleEmitterManager,
  map: Tilemaps.Tilemap,
  name: string
) {
  removeEmitter(name, particles);
  const fromPixel = worldCoordToPixel(map, from);
  const toPixel = worldCoordToPixel(map, to);

  const emitter = particles.createEmitter({
    // each particle starts at full scale and shrinks down until it disappears
    //
    name,
    scale: {
      start: 0.2,
      end: 0.1,
    },

    tint: {
      start: 0xede3df,
      end: 0xffffff,
    },
    // each particle has a random speed from zero (no speed) to 200 pixels per second
    speed: {
      min: 20,
      max: 100,
    },
    // the emitter is not active at the moment, this means no particles are emitted
    active: false,
    // each particle has a 500 milliseconds lifespan
    lifespan: 500,
    quantity: 20,
    x: fromPixel.x,
    y: fromPixel.y,
    moveToX: toPixel.x,
    moveToY: toPixel.y,
    rotate: 10,
  });
  // place particle emitter in the top left coordinate of the platform
  // now the emitter is active
  emitter.active = true;
  emitter.flow(150);
}

export function removeEmitter(name: string, particles: GameObjects.Particles.ParticleEmitterManager) {
  const emitter = particles.emitters.getByName(name);
  if (!emitter) return;
  emitter.remove();
  emitter.killAll();
  emitter.stop();
  emitter.setVisible(false);
}
