/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Entity } from "@latticexyz/mobx-ecs";

export function createObjectPool(scene: Phaser.Scene) {
  const group = new Phaser.GameObjects.Group(scene);
  group.classType = Phaser.GameObjects.Sprite;

  const objects = new Map<string, Phaser.GameObjects.Sprite>();

  function get(entity: Entity | string): Phaser.GameObjects.Sprite {
    const key = String(entity);
    const object = objects.get(key) || group.get();
    if (!objects.has(key)) {
      objects.set(key, object);
    }
    return object;
  }

  function remove(entity: Entity | string) {
    const key = String(entity);
    const object = objects.get(key);
    objects.delete(key);
    if (object) {
      object.destroy();
    }
  }

  return { get, remove };
}
