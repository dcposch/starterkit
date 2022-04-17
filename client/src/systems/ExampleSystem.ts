import { defineReactionSystem, defineUpdateQuery, getComponentValue, Has } from "@latticexyz/mobx-ecs";
import { Context } from "../types";

export function createExampleSystem(context: Context) {
  const {
    world,
    components: { Position },
  } = context;

  const exampleQuery = defineUpdateQuery(world, [Has(Position)]);

  defineReactionSystem(
    world,
    () => exampleQuery.get(),
    (entities) => {
      for (const entity of entities) {
        const value = getComponentValue(Position, entity);
        console.log(`Example system: entity ${entity} has value ${JSON.stringify(value)}.`);
      }
    }
  );
}
