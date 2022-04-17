export declare class SuperMap<K, V> implements Map<K, V> {
    parent?: SuperMap<K, V>;
    child: Map<K, V>;
    private overrides;
    constructor(options?: {
        parent?: SuperMap<K, V>;
    });
    [Symbol.iterator](): IterableIterator<[K, V]>;
    get [Symbol.toStringTag](): string;
    get size(): number;
    clear(): void;
    delete(key: K): boolean;
    entries(): IterableIterator<[K, V]>;
    forEach(callbackfn: (value: V, key: K, map: Map<K, V>) => void, thisArg?: unknown): void;
    get(key: K): V | undefined;
    has(key: K): boolean;
    keys(): IterableIterator<K>;
    set(key: K, value: V): this;
    values(): IterableIterator<V>;
}
