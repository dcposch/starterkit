import { defineReactionSystem, defineUpdateQuery, getComponentValue, Has } from "@latticexyz/mobx-ecs";
import { drawBar, worldCoordToPixelTopLeft } from "@latticexyz/phaser-middleware";
import { Context } from "../types";

export function createLifeSystem(context: Context) {
  const {
    world,
    components: { Life, Position },
    phaser: { map, graphicsPool },
  } = context;

  const lifePositionQuery = defineUpdateQuery(world, [Has(Life), Has(Position)]);
  defineReactionSystem(
    world,
    () => lifePositionQuery.get(),
    async (entities) => {
      for (const entity of entities) {
        const life = getComponentValue(Life, entity);
        const coord = getComponentValue(Position, entity);

        // Remove lifebar if the entity has no life or position anymore
        if (!life || !coord) {
          graphicsPool.remove(entity);
          return;
        }

        // Render life bar
        const pixelCoord = worldCoordToPixelTopLeft(map, coord);
        const lifebar = graphicsPool.get(entity);
        lifebar.setDepth(5);
        drawBar(lifebar, life.value1, life.value2, map.tileWidth, 0xeb4926);
        lifebar.setPosition(pixelCoord.x, pixelCoord.y + 2);
      }
    }
  );
}
