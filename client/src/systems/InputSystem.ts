import { Context } from "../types";
import { map, filter } from "rxjs";
import { pixelToWorldCoord } from "@latticexyz/phaser-middleware";
import { exists, Has, HasValue, removeComponent, setComponent } from "@latticexyz/mobx-ecs";

export function createInputSystem(context: Context) {
  const {
    components: { OwnedBy, Selected, Position },
    phaser: { input, map: tilemap },
    api: { spawn, actionDirection },
    personaId,
  } = context;

  input.onKeyPress(
    (keys) => keys.has("W") || keys.has("UP"),
    () => actionDirection("Up")
  );

  input.onKeyPress(
    (keys) => keys.has("A") || keys.has("LEFT"),
    () => actionDirection("Left")
  );

  input.onKeyPress(
    (keys) => keys.has("S") || keys.has("DOWN"),
    () => actionDirection("Down")
  );

  input.onKeyPress(
    (keys) => keys.has("D") || keys.has("RIGHT"),
    () => actionDirection("Right")
  );

  input.click$
    .pipe(
      map((pointer) => ({ x: pointer.worldX, y: pointer.worldY })), // Map pointer to pointer pixel cood
      map((pixel) => pixelToWorldCoord(tilemap, pixel)), // Map pixel coord to tile coord
      filter((coord) => coord.x >= 0 && coord.y >= 0 && coord.x < tilemap.width && coord.y < tilemap.height) // Filter clicks outside the map
    )
    .subscribe((coord) => {
      if (exists([HasValue(OwnedBy, { value: personaId })]) == undefined) {
        // If not spawned, spawn
        console.log("Spawning at", coord);
        spawn(coord);
      } else {
        // Else, select the entity below the cursor

        // Remove the Selected component from the currently selected entity
        const selectedEntity = exists([Has(Selected)]);
        if (selectedEntity != undefined) removeComponent(Selected, selectedEntity);

        // Add the Selected component to the entity below the cursor
        const entityAtPos = exists([HasValue(Position, coord), HasValue(OwnedBy, { value: personaId })]);
        if (entityAtPos) {
          console.log("Selected entity", entityAtPos, "at", coord);
          setComponent(Selected, entityAtPos, {});
        }
      }
    });
}
