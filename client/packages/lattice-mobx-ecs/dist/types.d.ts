import { IComputedValue } from "mobx";
import { SuperSet, SuperSetMap } from "./Utils";
export declare type Unpacked<T> = T extends (infer U)[] ? U : never;
export declare enum Type {
    Number = 0,
    String = 1,
    NumberArray = 2
}
export declare type Entity = number;
export declare type Schema = {
    [key: string]: Type;
};
export declare type ValueType = {
    [Type.Number]: number;
    [Type.String]: string;
    [Type.NumberArray]: number[];
};
export declare type ComponentValue<T extends Schema> = {
    [key in keyof T]: ValueType[T[key]];
};
export declare type Component<T extends Schema> = {
    id: string;
    values: {
        [key in keyof T]: Map<Entity, ValueType[T[key]]>;
    };
    entities: Set<Entity>;
};
export declare type ComponentWithValue<T extends Schema> = {
    component: Component<T>;
    value: ComponentValue<T>;
};
export declare type AnyComponentValue = ComponentValue<{
    [key: string]: Type;
}>;
export declare type AnyComponent = Component<{
    [key: string]: Type;
}>;
export declare type World = {
    entities: SuperSetMap<Entity, AnyComponent>;
    components: SuperSet<AnyComponent>;
    registerComponent: <T extends AnyComponent>(component: T) => T;
    registerEntity: (id?: Entity) => Entity;
    getEntityComponents: (entity: Entity) => Set<AnyComponent>;
    registerDisposer: (disposer: () => void) => void;
    disposeAll: () => void;
};
export declare type Query = IComputedValue<Set<Entity>>;
export declare enum QueryType {
    Has = 0,
    Not = 1,
    HasValue = 2,
    NotValue = 3
}
export declare type HasQueryFragment<T extends Schema> = {
    type: QueryType.Has;
    component: Component<T>;
};
export declare type HasValueQueryFragment<T extends Schema> = {
    type: QueryType.HasValue;
    component: Component<T>;
    value: ComponentValue<T>;
};
export declare type NotQueryFragment<T extends Schema> = {
    type: QueryType.Not;
    component: Component<T>;
};
export declare type NotValueQueryFragment<T extends Schema> = {
    type: QueryType.NotValue;
    component: Component<T>;
    value: ComponentValue<T>;
};
export declare type QueryFragment<T extends Schema> = HasQueryFragment<T> | HasValueQueryFragment<T> | NotQueryFragment<T> | NotValueQueryFragment<T>;
export declare type QueryFragments = [HasQueryFragment<Schema> | HasValueQueryFragment<Schema>, ...QueryFragment<Schema>[]];
