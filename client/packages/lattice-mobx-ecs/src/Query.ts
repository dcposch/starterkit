import { computed, IReactionDisposer, observable, reaction, runInAction, toJS } from "mobx";
import { World } from ".";
import { componentValueEquals, getComponentValue, getEntitiesWithValue, hasComponent } from "./Component";
import {
  Component,
  ComponentValue,
  Entity,
  HasQueryFragment,
  HasValueQueryFragment,
  NotQueryFragment,
  NotValueQueryFragment,
  Query,
  QueryFragments,
  QueryType,
  Schema,
} from "./types";

export function Has<T extends Schema>(component: Component<T>): HasQueryFragment<T> {
  return { type: QueryType.Has, component };
}

export function Not<T extends Schema>(component: Component<T>): NotQueryFragment<T> {
  return { type: QueryType.Not, component };
}

export function HasValue<T extends Schema>(
  component: Component<T>,
  value: ComponentValue<T>
): HasValueQueryFragment<T> {
  return { type: QueryType.HasValue, component, value };
}

export function NotValue<T extends Schema>(
  component: Component<T>,
  value: ComponentValue<T>
): NotValueQueryFragment<T> {
  return { type: QueryType.NotValue, component, value };
}

export function defineQuery(fragments: QueryFragments): Query {
  return computed(() => {
    const entities = new Set<Entity>();

    const firstFragmentEntities =
      fragments[0].type === QueryType.HasValue
        ? getEntitiesWithValue(fragments[0].component, fragments[0].value)
        : fragments[0].component.entities;

    for (const entity of firstFragmentEntities) {
      let include = true;

      for (let i = 1; i < fragments.length; i++) {
        const fragment = fragments[i];
        if (fragment.type === QueryType.Has) {
          include = hasComponent(fragment.component, entity);
        }

        if (fragment.type === QueryType.Not) {
          include = !hasComponent(fragment.component, entity);
        }

        if (fragment.type === QueryType.HasValue) {
          const value = getComponentValue(fragment.component, entity);
          include = componentValueEquals(fragment.value, value);
        }

        if (fragment.type === QueryType.NotValue) {
          const value = getComponentValue(fragment.component, entity);
          include = !componentValueEquals(fragment.value, value);
        }

        if (!include) break;
      }

      if (include) entities.add(entity);
    }
    return entities;
  });
}

export function exists(fragments: QueryFragments): Entity | undefined {
  const entities = [...defineQuery(fragments).get()];
  return entities.length > 0 ? entities[0] : undefined;
}

function defineChangeQuery(
  world: World,
  fragments: QueryFragments,
  filter: (oldValue: Set<Entity>, newValue: Set<Entity>) => Set<Entity>,
  options?: { runOnInit?: boolean }
): Query {
  const query = defineQuery(fragments);
  const diff = observable.box(new Set<Entity>());
  world.registerDisposer(() => runInAction(() => diff.set(new Set<Entity>())));

  const disposer = reaction(
    () => query.get(),
    (newValue, oldValue) => {
      runInAction(() => {
        diff.set(filter(oldValue || new Set(), newValue));
      });
    },
    { fireImmediately: options?.runOnInit }
  );
  world.registerDisposer(disposer);

  return computed(() => toJS(diff.get()));
}

/**
 * Return the entities that haven't been there before
 */
export function defineEnterQuery(world: World, fragments: QueryFragments, options?: { runOnInit?: boolean }): Query {
  return defineChangeQuery(
    world,
    fragments,
    (oldValue, newValue) => new Set([...newValue].filter((x) => !oldValue.has(x))),
    options
  );
}

/**
 * Return the entities that have been there before but not anymore
 */
export function defineExitQuery(world: World, fragments: QueryFragments, options?: { runOnInit?: boolean }): Query {
  return defineChangeQuery(
    world,
    fragments,
    (oldValue, newValue) => new Set([...oldValue].filter((x) => !newValue.has(x))),
    options
  );
}

/**
 * Return the entities whose components (in the query) have been updated
 */
export function defineUpdateQuery(
  world: World,
  fragments: QueryFragments,
  options: { runOnInit?: boolean } = { runOnInit: true }
): Query {
  const updatedEntities = observable(new Set<Entity>());
  world.registerDisposer(() => runInAction(() => updatedEntities.clear()));

  const observedEntities = new Map<Entity, IReactionDisposer>();
  world.registerDisposer(() => {
    for (const dispose of observedEntities.values()) dispose();
    runInAction(() => {
      observedEntities.clear();
    });
  });

  // All components in the query whose entity values should be observed
  const components = fragments
    .filter((fragment) => fragment.type === QueryType.Has)
    .map((fragment) => fragment.component);

  function observeEntity(entity: Entity, options?: { runOnInit?: boolean; keepPrev?: boolean }) {
    // Stop previous observer if already observing this entity
    let stopObserving = observedEntities.get(entity);
    if (stopObserving) stopObserving();

    for (const component of components) {
      const computedValue = computed(() => getComponentValue(component, entity), { equals: componentValueEquals });
      const data = () => computedValue.get();
      const effect = (keepPrev?: boolean) => {
        // This entity's value changed.
        // If keepPref is false, we first reset the set and then add the updated entity
        // so that observers also get triggered if the same entity changes twice in a row.
        !keepPrev && runInAction(() => updatedEntities.clear());
        runInAction(() => updatedEntities.add(entity));
      };

      // Returns the entity once when observation starts if runOnInit is true
      if (options?.runOnInit) effect(options?.keepPrev);

      // Start observing the entitiy and store the reaction disposer
      stopObserving = reaction(data, () => effect());
      observedEntities.set(entity, stopObserving);
    }
  }

  // Start observing all entities that match the query at the time it is defined
  const query = defineQuery(fragments);
  const entities = query.get();
  runInAction(() => {
    for (const entity of entities) {
      observeEntity(entity, { runOnInit: options?.runOnInit, keepPrev: options?.runOnInit });
    }
  });

  // Start observing new entities matching the query
  const enterQuery = defineEnterQuery(world, fragments);
  const enterDisposer = reaction(
    () => enterQuery.get(),
    (newEntities) => {
      for (const entity of newEntities) {
        observeEntity(entity, { runOnInit: true });
      }
    }
  );
  world.registerDisposer(enterDisposer);

  // Stop observing entites that don't match the query anymore
  const exitQuery = defineExitQuery(world, fragments);
  const exitDisposer = reaction(
    () => exitQuery.get(),
    (removedEntities) => {
      for (const entity of removedEntities) {
        const stopObserving = observedEntities.get(entity);
        if (stopObserving) stopObserving();
        observedEntities.delete(entity);
      }
    }
  );
  world.registerDisposer(exitDisposer);

  return computed(() => toJS(updatedEntities));
}
