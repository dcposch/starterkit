import { Context } from "../types";
import { map, filter } from "rxjs";
import { pixelToWorldCoord } from "@latticexyz/phaser-middleware";

export function createInputSystem(context: Context) {
  const {
    phaser: { input, map: tilemap },
    api: { spawn },
  } = context;

  input.click$
    .pipe(
      map((pointer) => ({ x: pointer.worldX, y: pointer.worldY })), // Map pointer to pointer pixel cood
      map((pixel) => pixelToWorldCoord(tilemap, pixel)), // Map pixel coord to tile coord
      filter((coord) => coord.x >= 0 && coord.y >= 0 && coord.x < tilemap.width && coord.y < tilemap.height) // Filter clicks outside the map
    )
    .subscribe((coord) => {
      console.log("Spawn at", coord);
      spawn(coord);
    });
}
