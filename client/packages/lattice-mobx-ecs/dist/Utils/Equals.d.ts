import { SuperSet } from "./SuperSet";
import { SuperSetMap } from "./SuperSetMap";
declare type SetEqualsInput<T> = SuperSet<T> | Set<T> | T[] | undefined;
export declare function setEquals<T>(a: SetEqualsInput<T>, b: SetEqualsInput<T>): boolean;
declare type SetMapEqualsInput<K, V> = SuperSetMap<K, V> | Map<K, Set<V>> | [K, Set<V>][] | [K, V[]][] | undefined;
export declare function setMapEquals<K, V>(a: SetMapEqualsInput<K, V>, b: SetMapEqualsInput<K, V>): boolean;
export {};
