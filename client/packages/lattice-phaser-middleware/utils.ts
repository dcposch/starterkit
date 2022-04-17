import { Coord } from "./types";
import { createCamera } from "./createCamera";
import Phaser from "phaser";
import uuid from "uuid-by-string";

/**
 * Converts a pixel coordinate to a world (tile) coordinate.
 * @param map Map to use for the calculation
 * @param pixel Pixel coordinate to convert
 * @returns World coordinate
 */
export function pixelToWorldCoord(map: Phaser.Tilemaps.Tilemap, pixel: Coord): Coord {
  return map.worldToTileXY(pixel.x, pixel.y);
}

/*
/**
 * Converts a world (tile) coordinate to a pixel coordinate.
 * @param map Map to use for the calculation
 * @param worldCoord world coordinate to convert
 * @returns Pixel coordinate
 */
export function worldCoordToPixel(map: Phaser.Tilemaps.Tilemap, worldCoord: Coord): Coord {
  const topLeft = map.tileToWorldXY(worldCoord.x, worldCoord.y);
  return {
    x: topLeft.x + map.tileWidth / 2,
    y: topLeft.y + map.tileHeight / 2,
  };
}

/*
/**
 * Converts a world (tile) coordinate to a pixel coordinate.
 * @param map Map to use for the calculation
 * @param worldCoord world coordinate to convert
 * @returns Pixel coordinate
 */
export function worldCoordToPixelTopLeft(map: Phaser.Tilemaps.Tilemap, worldCoord: Coord): Coord {
  const topLeft = map.tileToWorldXY(worldCoord.x, worldCoord.y);
  return { x: topLeft.x, y: topLeft.y };
}

export function getAdjacentCoords(coord: Coord) {
  return [
    { x: coord.x - 1, y: coord.y },
    { x: coord.x, y: coord.y - 1 },
    { x: coord.x + 1, y: coord.y },
    { x: coord.x, y: coord.y + 1 },
  ];
}

export function worldCoordEq(a?: Coord, b?: Coord): boolean {
  if (!a || !b) return false;
  return a.x === b.x && a.y === b.y;
}

export function centerCameraOn(coord: Coord, map: Phaser.Tilemaps.Tilemap, camera: ReturnType<typeof createCamera>) {
  const spawnPixel = worldCoordToPixel(map, coord);
  const offsetX = camera.phaserCamera.width / 4;
  const offsetY = camera.phaserCamera.height / 4;
  camera.phaserCamera.centerOn(spawnPixel.x + offsetX, spawnPixel.y + offsetY);
}

export function load(scene: Phaser.Scene, callback: (loader: Phaser.Loader.LoaderPlugin) => void) {
  const loader = scene.load;
  callback(loader);
  loader.start();
  let resolve: () => void;
  const promise = new Promise<void>((res) => (resolve = res));
  loader.on("complete", () => {
    resolve();
  });
  return promise;
}

export function getPlayerColor(id: string): number {
  const randSeed = new Array(4); // Xorshift: [x, y, z, w] 32 bit values
  function seedRand(seed: string) {
    for (let i = 0; i < randSeed.length; i++) {
      randSeed[i] = 0;
    }
    for (let i = 0; i < seed.length; i++) {
      randSeed[i % 4] = (randSeed[i % 4] << 5) - randSeed[i % 4] + seed.charCodeAt(i);
    }
  }

  function rand() {
    const t = randSeed[0] ^ (randSeed[0] << 11);
    randSeed[0] = randSeed[1];
    randSeed[1] = randSeed[2];
    randSeed[2] = randSeed[3];
    randSeed[3] = randSeed[3] ^ (randSeed[3] >> 19) ^ t ^ (t >> 8);
    return (randSeed[3] >>> 0) / ((1 << 31) >>> 0);
  }

  function createColor() {
    // hue is the whole color spectrum
    const h = Math.floor(rand() * 360) / 360;
    //saturation goes from 40 to 100, it avoids greyish colors
    // --> Multiply by 0.75 to limit saturation
    // const s = ((rand() * 60 + 40) / 100) * 0.75;
    const s = 80 / 100;
    // lightness can be anything from 0 to 100, but probabilities are a bell curve around 50%
    // --> Multiply by 0.65 to shift
    // const l = (((rand() + rand() + rand() + rand()) * 25) / 100) * 0.65;
    const l = 70 / 100;
    return { h, s, l };
  }
  seedRand(uuid(id));
  const { h, s, l } = createColor();
  return Phaser.Display.Color.HSLToColor(h, s, l).color;
}
