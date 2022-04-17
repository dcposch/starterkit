import { defineComponent, World } from "@latticexyz/mobx-ecs";

export function createBoolComponent(world: World, name?: string) {
  return defineComponent(world, {}, { name });
}

export function decodeBoolComponent() {
  return {};
}
