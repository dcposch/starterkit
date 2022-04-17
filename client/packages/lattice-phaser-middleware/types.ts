import { createCamera } from "./createCamera";
import { createGraphicsPool } from "./createGraphicsPool";
import { createInput } from "./createInput";
import { createObjectPool } from "./createObjectPool";

export type PhaserObjects = {
  game: Phaser.Game;
  scene: Phaser.Scene;
  map: Phaser.Tilemaps.Tilemap;
  input: ReturnType<typeof createInput>;
  objectPool: ReturnType<typeof createObjectPool>;
  graphicsPool: ReturnType<typeof createGraphicsPool>;
  camera: ReturnType<typeof createCamera>;
  particles: Phaser.GameObjects.Particles.ParticleEmitterManager;
};

export type Coord = {
  x: number;
  y: number;
};
