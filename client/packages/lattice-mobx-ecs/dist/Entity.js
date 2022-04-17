import { setComponent } from "./Component";
export function createEntity(world, components) {
    const entity = world.registerEntity();
    if (components) {
        for (const { component, value } of components) {
            setComponent(component, entity, value);
        }
    }
    return entity;
}
//# sourceMappingURL=Entity.js.map