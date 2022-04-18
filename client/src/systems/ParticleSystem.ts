import {
  defineEnterQuery,
  defineReactionSystem,
  defineUpdateQuery,
  getComponentValue,
  getComponentValueStrict,
  Has,
} from "@latticexyz/mobx-ecs";
import { explode, rangeEmitter, removeEmitter } from "@latticexyz/phaser-middleware";
import { Context } from "../types";

export function createParticleSystem(context: Context) {
  const {
    world,
    components: { Position, PendingAction },
    phaser: { map, particles },
  } = context;

  // Explosion when entities first appear
  const positionEnterQuery = defineEnterQuery(world, [Has(Position)]);
  defineReactionSystem(
    world,
    () => positionEnterQuery.get(),
    (entities) => {
      for (const entity of entities) {
        const coord = getComponentValueStrict(Position, entity);
        explode(coord, particles, map);
      }
    }
  );

  // Emitter as action indicator
  const pendingActionQuery = defineUpdateQuery(world, [Has(PendingAction), Has(Position)]);
  defineReactionSystem(
    world,
    () => pendingActionQuery.get(),
    (entities) => {
      for (const entity of entities) {
        const pendingCoord = getComponentValue(PendingAction, entity);
        const currentCoord = getComponentValue(Position, entity);

        if (!pendingCoord || !currentCoord) {
          removeEmitter(String(entity), particles);
          continue;
        }

        rangeEmitter(currentCoord, pendingCoord, particles, map, String(entity));
      }
    }
  );
}
