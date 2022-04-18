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

      // Create an animation from the spritesheet
      const frames = scene.anims.generateFrameNumbers(String(textureEntity), { start: 0 });
      const animKey = "anim" + String(textureEntity);
      if (frames.length > 1) {
        scene.anims.create({
          key: animKey,
          frames,
          repeat: -1,
          frameRate: 5,
        });
      }

      // Update entities with this texture
      const entities = defineQuery([HasValue(Appearance, { value: textureEntity })]).get();
      for (const entity of entities) {
        // Since we used the entity id as key when loading, we can refer to it when setting the phaser texture and play the animation
        const object = objectPool.get(entity);
        object.setTexture(String(textureEntity));
        if (scene.anims.get(animKey)) object.anims.play(animKey);
      }
    }
  });
}
