import { setComponent } from "./Component";
import { ComponentWithValue, Entity, Schema, Unpacked, World } from "./types";

export function createEntity<Cs extends Schema[]>(
  world: World,
  components?: ComponentWithValue<Unpacked<Cs>>[]
): Entity {
  const entity = world.registerEntity();

  if (components) {
    for (const { component, value } of components) {
      setComponent(component, entity, value);
    }
  }

  return entity;
}
