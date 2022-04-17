import { observable, observe } from "mobx";
import { SuperSet } from "./Utils";
import { SuperSetMap } from "./Utils/SuperSetMap";
export function createWorld(options) {
    const components = new SuperSet({ parent: options?.parentWorld?.components });
    const entities = new SuperSetMap({ parent: options?.parentWorld?.entities });
    const systemDisposer = new Set();
    function registerEntity(id) {
        const entity = id ?? entities.size;
        entities.init(entity);
        return entity;
    }
    function registerComponent(component) {
        const observableComponent = observable(component);
        components.add(observableComponent);
        observe(observableComponent.entities, (change) => {
            if (change.type === "add") {
                const entity = change.newValue;
                if (entities.get(entity) == undefined)
                    throw new Error("Entity is not registered in this world.");
                entities.add(change.newValue, observableComponent);
            }
            if (change.type === "delete") {
                entities.deleteValue(change.oldValue, observableComponent);
            }
        });
        return observableComponent;
    }
    function registerDisposer(disposer) {
        systemDisposer.add(disposer);
    }
    function disposeAll() {
        for (const dispose of systemDisposer.values()) {
            dispose();
        }
        systemDisposer.clear();
    }
    function getEntityComponents(entity) {
        const entityComponents = entities.get(entity);
        if (!entityComponents)
            throw new Error("Entity is not registered in this world");
        return entityComponents;
    }
    return {
        components,
        entities,
        registerComponent,
        registerEntity,
        getEntityComponents,
        registerDisposer,
        disposeAll,
    };
}
export function extendWorld(parentWorld) {
    return createWorld({ parentWorld });
}
export function getEntityComponents(world, entity) {
    return world.getEntityComponents(entity);
}
//# sourceMappingURL=World.js.map