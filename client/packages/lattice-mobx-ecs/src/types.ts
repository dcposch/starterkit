import { IComputedValue } from "mobx";
import { SuperSet, SuperSetMap } from "./Utils";

export type Unpacked<T> = T extends (infer U)[] ? U : never;

export enum Type {
  Number,
  String,
  NumberArray,
}

export type Entity = number;

export type Schema = {
  [key: string]: Type;
};

export type ValueType = {
  [Type.Number]: number;
  [Type.String]: string;
  [Type.NumberArray]: number[];
};

export type ComponentValue<T extends Schema> = {
  [key in keyof T]: ValueType[T[key]];
};

export type Component<T extends Schema> = {
  id: string;
  values: { [key in keyof T]: Map<Entity, ValueType[T[key]]> };
  entities: Set<Entity>;
};

export type ComponentWithValue<T extends Schema> = { component: Component<T>; value: ComponentValue<T> };

export type AnyComponentValue = ComponentValue<{ [key: string]: Type }>;

export type AnyComponent = Component<{ [key: string]: Type }>;

export type World = {
  entities: SuperSetMap<Entity, AnyComponent>;
  components: SuperSet<AnyComponent>;
  registerComponent: <T extends AnyComponent>(component: T) => T;
  registerEntity: (id?: Entity) => Entity;
  getEntityComponents: (entity: Entity) => Set<AnyComponent>;
  registerDisposer: (disposer: () => void) => void;
  disposeAll: () => void;
};

export type Query = IComputedValue<Set<Entity>>;

export enum QueryType {
  Has,
  Not,
  HasValue,
  NotValue,
}

export type HasQueryFragment<T extends Schema> = {
  type: QueryType.Has;
  component: Component<T>;
};

export type HasValueQueryFragment<T extends Schema> = {
  type: QueryType.HasValue;
  component: Component<T>;
  value: ComponentValue<T>;
};

export type NotQueryFragment<T extends Schema> = {
  type: QueryType.Not;
  component: Component<T>;
};

export type NotValueQueryFragment<T extends Schema> = {
  type: QueryType.NotValue;
  component: Component<T>;
  value: ComponentValue<T>;
};

export type QueryFragment<T extends Schema> =
  | HasQueryFragment<T>
  | HasValueQueryFragment<T>
  | NotQueryFragment<T>
  | NotValueQueryFragment<T>;

export type QueryFragments = [HasQueryFragment<Schema> | HasValueQueryFragment<Schema>, ...QueryFragment<Schema>[]];
