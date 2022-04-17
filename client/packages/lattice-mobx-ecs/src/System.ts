import { autorun, reaction } from "mobx";
import { defineExitQuery, removeComponent, setComponent } from ".";
import { defineEnterQuery } from "./Query";
import { Component, ComponentValue, Entity, QueryFragments, Schema, World } from "./types";

export type System = () => void;

export function defineSystem(world: World, system: (world: World) => void): System {
  return () => system(world);
}

/**
 * @param system Function to be called whenever any of the observable data accessed in the function changes
 * @returns Function to dispose the system
 */
export function defineAutorunSystem(world: World, system: () => void) {
  const disposer = autorun(() => system());
  world.registerDisposer(disposer);
}

/**
 * @param observe System is rerun if any of the data accessed in this function changes. Result of this function is passed to the system.
 * @param system Function to be run when any of the data accessed in the observe function changes
 * @returns Function to dispose the system
 */
export function defineReactionSystem<T>(world: World, observe: () => T, system: (data: T) => void) {
  const disposer = reaction(observe, (data) => system(data), { fireImmediately: true });
  world.registerDisposer(disposer);
}

/**
 * @param query Component is added to all entites returned by the query
 * @param component Component to be added
 * @param value Component value to be added
 * @returns Function to dispose the system
 */
export function defineSyncSystem<T extends Schema>(
  world: World,
  query: QueryFragments,
  component: (entity: Entity) => Component<T>,
  value: (entity: Entity) => ComponentValue<T>
) {
  const newEntities = defineEnterQuery(world, query, { runOnInit: true });
  const removedEntities = defineExitQuery(world, query);

  defineReactionSystem(
    world,
    () => newEntities.get(),
    (entities) => {
      for (const entity of entities) {
        setComponent(component(entity), entity, value(entity));
      }
    }
  );

  defineReactionSystem(
    world,
    () => removedEntities.get(),
    (entities) => {
      for (const entity of entities) {
        removeComponent(component(entity), entity);
      }
    }
  );
}
