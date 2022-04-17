import Phaser from "phaser";
import tilemap from "./assets/tilemap.png";
import { PhaserObjects } from "./types";
import { createCamera } from "./createCamera";
import { createInput } from "./createInput";
import { createObjectPool } from "./createObjectPool";
import particle from "./assets/particle.png";
import { createGraphicsPool } from "./createGraphicsPool";

class Main extends Phaser.Scene {
  create() {
    // This function is called once when the scene is created
  }

  update() {
    // This function is created 60 times per second
  }
}

const config = {
  type: Phaser.WEBGL,
  scale: {
    parent: "phaser-game",
    width: window.innerWidth,
    height: window.innerHeight,
    zoom: 2,
    mode: Phaser.Scale.NONE,
  },
  pixelArt: true,
  autoFocus: true,
  render: {
    antialiasGL: false,
    pixelArt: true,
  },
  backgroundColor: 0x292929,
  scene: Main,
};

function load(scene: Phaser.Scene, callback: (loader: Phaser.Loader.LoaderPlugin) => void) {
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

export async function setupPhaser(width: number, height: number) {
  console.log("Setting up phaser...");
  const game = new Phaser.Game(config);
  let resolve: (data: PhaserObjects) => void;
  const promise = new Promise<PhaserObjects>((res) => (resolve = res));

  game.events.on("ready", async () => {
    const scene = game.scene.getAt(0);
    if (!scene) throw new Error("Setup failed");

    await load(scene, (loader) => loader.image("tilemap", tilemap));

    const map = new Phaser.Tilemaps.Tilemap(
      scene,
      new Phaser.Tilemaps.MapData({
        tileWidth: 16,
        tileHeight: 16,
        width,
        height,
      })
    );

    const tileset = map.addTilesetImage("tilemap", "tilemap", 16, 16);
    map.createBlankLayer("background", [tileset]);

    map.fill(0);
    map.forEachTile((t) => (t.tint = 0x000000));

    const camera = createCamera(scene.cameras.main, {
      phaserSelector: config.scale.parent,
      minZoom: 0.5,
      maxZoom: 1,
      pinchSpeed: 1,
      wheelSpeed: 1,
    });

    const input = createInput(scene.input);

    const objectPool = createObjectPool(scene);
    const graphicsPool = createGraphicsPool(scene);

    await load(scene, (loader) => loader.image("particle", particle));
    const particles = scene.add.particles("particle");

    resolve({ game, scene, map, input, objectPool, camera, particles, graphicsPool });
  });

  return promise;
}
