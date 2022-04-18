import { defineReactionSystem, defineUpdateQuery, getComponentValue, Has } from "@latticexyz/mobx-ecs";
import { worldCoordToPixel } from "@latticexyz/phaser-middleware";
import { Context } from "../types";

export function createPositionSystem(context: Context) {
  const {
    world,
    components: { Position },
    phaser: { objectPool, map },
  } = context;

  const query = defineUpdateQuery(world, [Has(Position)]);

  defineReactionSystem(
    world,
    () => query.get(),
    (entities) => {
      for (const entity of entities) {
        // Get the entity's position from the Position component
        const coord = getComponentValue(Position, entity);

        // The update query also returns an entity if its value just got removed
        // In this case, remove the game object from the pool.
        if (!coord) {
          objectPool.remove(entity);
          return;
        }

        // Get the entity's game object from the object pool
        const object = objectPool.get(entity);

        // Convert the tile coordinate to a pixel coordinate for phaser
        const pixelCoord = worldCoordToPixel(map, coord);

        // Set the game object's position on the map
        object.setPosition(pixelCoord.x, pixelCoord.y);
      }
    }
  );
}
