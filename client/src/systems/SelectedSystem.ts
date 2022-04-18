import { defineReactionSystem, defineUpdateQuery, getComponentValue, Has } from "@latticexyz/mobx-ecs";
import { drawTile, worldCoordToPixelTopLeft } from "@latticexyz/phaser-middleware";
import { Context } from "../types";

export function createSelectedSystem(context: Context) {
  const {
    world,
    components: { Selected, Position },
    phaser: { map, graphicsPool },
  } = context;

  const selectedQuery = defineUpdateQuery(world, [Has(Selected), Has(Position)]);
  defineReactionSystem(
    world,
    () => selectedQuery.get(),
    async (entities) => {
      for (const entity of entities) {
        const coord = getComponentValue(Position, entity);

        if (!coord) {
          graphicsPool.remove("selection");
          return;
        }

        // Render life bar
        const pixelPosition = worldCoordToPixelTopLeft(map, coord);

        const selection = graphicsPool.get("selection");
        selection.setDepth(1);
        drawTile(selection, map.tileWidth);
        selection.setPosition(pixelPosition.x, pixelPosition.y);
      }
    }
  );
}
