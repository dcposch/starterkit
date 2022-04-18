import { defineAutorunSystem, defineUpdateQuery, getComponentValue, Has, hasComponent } from "@latticexyz/mobx-ecs";
import { Context } from "../types";

export function createAppearanceSystem(context: Context) {
  const {
    world,
    components: { Appearance, Texture },
    phaser: { objectPool },
  } = context;

  const appearances = defineUpdateQuery(world, [Has(Appearance)]);

  defineAutorunSystem(world, () => {
    const entities = appearances.get();
    for (const entity of entities) {
      const appearance = getComponentValue(Appearance, entity);
      if (!appearance) {
        objectPool.remove(entity);
        return;
      }

      const object = objectPool.get(entity);
      if (hasComponent(Texture, appearance.value)) object.setTexture(String(appearance.value));
    }
  });
}
