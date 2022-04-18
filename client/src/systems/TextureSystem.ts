import {
  defineAutorunSystem,
  defineQuery,
  defineUpdateQuery,
  getComponentValue,
  Has,
  HasValue,
} from "@latticexyz/mobx-ecs";
import { load } from "@latticexyz/phaser-middleware";
import { Context } from "../types";

export function createTextureSystem(context: Context) {
  const {
    world,
    components: { Texture, Appearance },
    phaser: { scene, objectPool },
  } = context;

  const query = defineUpdateQuery(world, [Has(Texture)]);

  defineAutorunSystem(world, async () => {
    const entities = query.get();
    for (const textureEntity of entities) {
      const texture = getComponentValue(Texture, textureEntity);
      if (!texture) return;

      // Load the texture into the Phaser cache, use the entity id as key
      await load(scene, (loader) =>
        loader.spritesheet(String(textureEntity), texture.value, { frameWidth: 16, frameHeight: 16 })
      );

      // Update entities with this texture
      const entities = defineQuery([HasValue(Appearance, { value: textureEntity })]).get();
      for (const entity of entities) {
        // Since we used the entity id as key when loading, we can refer to it when setting the phaser texture
        objectPool.get(entity).setTexture(String(textureEntity));
      }
    }
  });
}
