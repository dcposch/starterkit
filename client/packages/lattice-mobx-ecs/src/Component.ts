import { runInAction, keys, toJS } from "mobx";
import {
  AnyComponent,
  AnyComponentValue,
  Component,
  ComponentValue,
  ComponentWithValue,
  Entity,
  Schema,
  ValueType,
  World,
} from "./types";
import { uuid } from "./Utils";

export function defineComponent<T extends Schema>(world: World, schema: T, options?: { name?: string }): Component<T> {
  const component: AnyComponent = {
    id: options?.name || uuid(),
    values: {},
    entities: new Set<Entity>(),
  };

  for (const [key, val] of Object.entries(schema)) {
    component.values[key] = new Map<Entity, ValueType[typeof val]>();
  }

  return world.registerComponent(component) as Component<T>;
}

export function setComponent<T extends Schema>(component: Component<T>, entity: Entity, value: ComponentValue<T>) {
  runInAction(() => {
    for (const [key, val] of Object.entries(value)) {
      component.values[key]?.set(entity, val);
    }

    component.entities.add(entity);
  });
}

export function removeComponent<T extends Schema>(component: Component<T>, entity: Entity) {
  runInAction(() => {
    for (const key of Object.keys(component.values)) {
      component.values[key].delete(entity);
    }

    component.entities.delete(entity);
  });
}

export function hasComponent<T extends Schema>(component: Component<T>, entity: Entity): boolean {
  return component.entities.has(entity);
}

export function getComponentValue<T extends Schema>(
  component: Component<T>,
  entity: Entity
): ComponentValue<T> | undefined {
  const value: AnyComponentValue = {};

  for (const key of keys(component.values)) {
    const val = component.values[key as string].get(entity);
    if (val === undefined) return undefined;
    value[key as string] = val;
  }

  return value as ComponentValue<T>;
}

export function getComponentValueStrict<T extends Schema>(component: Component<T>, entity: Entity): ComponentValue<T> {
  const value = getComponentValue(component, entity);
  if (!value) {
    console.warn("No component value for this entity", toJS(component), entity);
    throw new Error("No component value for this entity");
  }
  return value;
}

export function componentValueEquals<T extends Schema>(a?: ComponentValue<T>, b?: ComponentValue<T>): boolean {
  if (!a && !b) return true;
  if (!a || !b) return false;

  let equals = true;
  for (const key of Object.keys(a)) {
    equals = a[key] === b[key];
    if (!equals) return false;
  }
  return equals;
}

export function withValue<T extends Schema>(component: Component<T>, value: ComponentValue<T>): ComponentWithValue<T> {
  return { component, value };
}

export function getEntitiesWithValue<T extends Schema>(component: Component<T>, value: ComponentValue<T>): Set<Entity> {
  // Trivial implementation, needs to be more efficient
  const entities = new Set<Entity>();
  for (const entity of component.entities) {
    const val = getComponentValue(component, entity);
    if (componentValueEquals(val, value)) {
      entities.add(entity);
    }
  }
  return entities;
}
