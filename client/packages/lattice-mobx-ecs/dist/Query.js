import { computed, observable, reaction, runInAction, toJS } from "mobx";
import { componentValueEquals, getComponentValue, getEntitiesWithValue, hasComponent } from "./Component";
import { QueryType, } from "./types";
export function Has(component) {
    return { type: QueryType.Has, component };
}
export function Not(component) {
    return { type: QueryType.Not, component };
}
export function HasValue(component, value) {
    return { type: QueryType.HasValue, component, value };
}
export function NotValue(component, value) {
    return { type: QueryType.NotValue, component, value };
}
export function defineQuery(fragments) {
    return computed(() => {
        const entities = new Set();
        const firstFragmentEntities = fragments[0].type === QueryType.HasValue
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
                if (!include)
                    break;
            }
            if (include)
                entities.add(entity);
        }
        return entities;
    });
}
export function exists(fragments) {
    const entities = [...defineQuery(fragments).get()];
    return entities.length > 0 ? entities[0] : undefined;
}
function defineChangeQuery(world, fragments, filter, options) {
    const query = defineQuery(fragments);
    const diff = observable.box(new Set());
    world.registerDisposer(() => runInAction(() => diff.set(new Set())));
    const disposer = reaction(() => query.get(), (newValue, oldValue) => {
        runInAction(() => {
            diff.set(filter(oldValue || new Set(), newValue));
        });
    }, { fireImmediately: options?.runOnInit });
    world.registerDisposer(disposer);
    return computed(() => toJS(diff.get()));
}
/**
 * Return the entities that haven't been there before
 */
export function defineEnterQuery(world, fragments, options) {
    return defineChangeQuery(world, fragments, (oldValue, newValue) => new Set([...newValue].filter((x) => !oldValue.has(x))), options);
}
/**
 * Return the entities that have been there before but not anymore
 */
export function defineExitQuery(world, fragments, options) {
    return defineChangeQuery(world, fragments, (oldValue, newValue) => new Set([...oldValue].filter((x) => !newValue.has(x))), options);
}
/**
 * Return the entities whose components (in the query) have been updated
 */
export function defineUpdateQuery(world, fragments, options = { runOnInit: true }) {
    const updatedEntities = observable(new Set());
    world.registerDisposer(() => runInAction(() => updatedEntities.clear()));
    const observedEntities = new Map();
    world.registerDisposer(() => {
        for (const dispose of observedEntities.values())
            dispose();
        runInAction(() => {
            observedEntities.clear();
        });
    });
    // All components in the query whose entity values should be observed
    const components = fragments
        .filter((fragment) => fragment.type === QueryType.Has)
        .map((fragment) => fragment.component);
    function observeEntity(entity, options) {
        // Stop previous observer if already observing this entity
        let stopObserving = observedEntities.get(entity);
        if (stopObserving)
            stopObserving();
        for (const component of components) {
            const computedValue = computed(() => getComponentValue(component, entity), { equals: componentValueEquals });
            const data = () => computedValue.get();
            const effect = (keepPrev) => {
                // This entity's value changed.
                // If keepPref is false, we first reset the set and then add the updated entity
                // so that observers also get triggered if the same entity changes twice in a row.
                !keepPrev && runInAction(() => updatedEntities.clear());
                runInAction(() => updatedEntities.add(entity));
            };
            // Returns the entity once when observation starts if runOnInit is true
            if (options?.runOnInit)
                effect(options?.keepPrev);
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
    const enterDisposer = reaction(() => enterQuery.get(), (newEntities) => {
        for (const entity of newEntities) {
            observeEntity(entity, { runOnInit: true });
        }
    });
    world.registerDisposer(enterDisposer);
    // Stop observing entites that don't match the query anymore
    const exitQuery = defineExitQuery(world, fragments);
    const exitDisposer = reaction(() => exitQuery.get(), (removedEntities) => {
        for (const entity of removedEntities) {
            const stopObserving = observedEntities.get(entity);
            if (stopObserving)
                stopObserving();
            observedEntities.delete(entity);
        }
    });
    world.registerDisposer(exitDisposer);
    return computed(() => toJS(updatedEntities));
}
//# sourceMappingURL=Query.js.map