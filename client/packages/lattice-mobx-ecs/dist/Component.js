import { runInAction, keys, toJS } from "mobx";
import { uuid } from "./Utils";
export function defineComponent(world, schema, options) {
    const component = {
        id: options?.name || uuid(),
        values: {},
        entities: new Set(),
    };
    for (const [key, val] of Object.entries(schema)) {
        component.values[key] = new Map();
    }
    return world.registerComponent(component);
}
export function setComponent(component, entity, value) {
    runInAction(() => {
        for (const [key, val] of Object.entries(value)) {
            component.values[key]?.set(entity, val);
        }
        component.entities.add(entity);
    });
}
export function removeComponent(component, entity) {
    runInAction(() => {
        for (const key of Object.keys(component.values)) {
            component.values[key].delete(entity);
        }
        component.entities.delete(entity);
    });
}
export function hasComponent(component, entity) {
    return component.entities.has(entity);
}
export function getComponentValue(component, entity) {
    const value = {};
    for (const key of keys(component.values)) {
        const val = component.values[key].get(entity);
        if (val === undefined)
            return undefined;
        value[key] = val;
    }
    return value;
}
export function getComponentValueStrict(component, entity) {
    const value = getComponentValue(component, entity);
    if (!value) {
        console.warn("No component value for this entity", toJS(component), entity);
        throw new Error("No component value for this entity");
    }
    return value;
}
export function componentValueEquals(a, b) {
    if (!a && !b)
        return true;
    if (!a || !b)
        return false;
    let equals = true;
    for (const key of Object.keys(a)) {
        equals = a[key] === b[key];
        if (!equals)
            return false;
    }
    return equals;
}
export function withValue(component, value) {
    return { component, value };
}
export function getEntitiesWithValue(component, value) {
    // Trivial implementation, needs to be more efficient
    const entities = new Set();
    for (const entity of component.entities) {
        const val = getComponentValue(component, entity);
        if (componentValueEquals(val, value)) {
            entities.add(entity);
        }
    }
    return entities;
}
//# sourceMappingURL=Component.js.map