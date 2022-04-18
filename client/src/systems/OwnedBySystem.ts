import { defineReactionSystem, defineUpdateQuery, getComponentValue, Has, Not } from "@latticexyz/mobx-ecs";
import { getPlayerColor } from "@latticexyz/phaser-middleware";
import { Context } from "../types";

export function createOwnedBySystem(context: Context) {
  const {
    world,
    components: { OwnedBy, Appearance },
    phaser: { objectPool },
  } = context;

  const ownedEntities = defineUpdateQuery(world, [Has(Appearance), Has(OwnedBy)]);
  const notOwnedEntities = defineUpdateQuery(world, [Has(Appearance), Not(OwnedBy)]);

  defineReactionSystem(
    world,
    () => ownedEntities.get(),
    (entities) => {
      for (const entity of entities) {
        const ownedBy = getComponentValue(OwnedBy, entity);
        const appearance = getComponentValue(Appearance, entity);
        if (!ownedBy || !appearance) return;

        const object = objectPool.get(entity);
        object.tint = getPlayerColor(String(ownedBy.value));
      }
    }
  );

  defineReactionSystem(
    world,
    () => notOwnedEntities.get(),
    (entities) => {
      for (const entity of entities) {
        const object = objectPool.get(entity);
        object.tint = 0x404040;
      }
    }
  );
}
