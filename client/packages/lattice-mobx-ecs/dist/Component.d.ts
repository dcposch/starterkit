import { Component, ComponentValue, ComponentWithValue, Entity, Schema, World } from "./types";
export declare function defineComponent<T extends Schema>(world: World, schema: T, options?: {
    name?: string;
}): Component<T>;
export declare function setComponent<T extends Schema>(component: Component<T>, entity: Entity, value: ComponentValue<T>): void;
export declare function removeComponent<T extends Schema>(component: Component<T>, entity: Entity): void;
export declare function hasComponent<T extends Schema>(component: Component<T>, entity: Entity): boolean;
export declare function getComponentValue<T extends Schema>(component: Component<T>, entity: Entity): ComponentValue<T> | undefined;
export declare function getComponentValueStrict<T extends Schema>(component: Component<T>, entity: Entity): ComponentValue<T>;
export declare function componentValueEquals<T extends Schema>(a?: ComponentValue<T>, b?: ComponentValue<T>): boolean;
export declare function withValue<T extends Schema>(component: Component<T>, value: ComponentValue<T>): ComponentWithValue<T>;
export declare function getEntitiesWithValue<T extends Schema>(component: Component<T>, value: ComponentValue<T>): Set<Entity>;
