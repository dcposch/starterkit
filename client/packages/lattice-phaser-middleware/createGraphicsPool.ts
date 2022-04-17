/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Entity } from "@latticexyz/mobx-ecs";
import Phaser from "phaser";

export function createGraphicsPool(scene: Phaser.Scene) {
  const group = new Phaser.GameObjects.Group(scene);
  group.classType = Phaser.GameObjects.Graphics;

  const objects = new Map<string, Phaser.GameObjects.Graphics>();

  function get(entity: Entity | string): Phaser.GameObjects.Graphics {
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
