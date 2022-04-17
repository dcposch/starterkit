export declare function isSuperSetMap(s: any): s is SuperSetMap<any, any>;
export declare class SuperSetMap<K, V> {
    parent?: SuperSetMap<K, V>;
    child: Map<K, Set<V>>;
    constructor(options?: {
        parent?: SuperSetMap<K, V>;
        child?: Map<K, Set<V>>;
    });
    [Symbol.toStringTag]: string;
    [Symbol.iterator](): IterableIterator<[K, Set<V>]>;
    /**
     * Returns the size of the SuperSetMap (number of keys)
     */
    get size(): number;
    /**
     * Initializes the key with an empty set. Not required to add values.
     * @param key Key of the SuperSetMap entry
     * @returns void
     */
    init(key: K): void;
    /**
     * Adds a value to a key's set.
     * @param key Key of the SuperSetMap entry (K)
     * @param value Value of the SuperSetMap entry (V)
     * @returns This SuperSetMap instance
     */
    add(key: K, value: V): this;
    /**
     * Clears the child map, leaves the parent map untouched.
     */
    clear(): void;
    /**
     * Deletes the given key from the child map, leaves the parent map untouched.
     * @param key Key in the child map to delete
     * @returns boolean
     */
    delete(key: K): boolean;
    /**
     * Deletes the given value from the key's set, leaves the parent map untouched.
     * @param key Key of the set to delete the value from
     * @param value Value to delete from the set
     * @returns boolean
     */
    deleteValue(key: K, value: V): boolean;
    /**
     * Returns the combined set of parent and child sets for a given key.
     * @param key: Key to return the combined set for
     * @returns The combined set of parent and child
     */
    get(key: K): Set<V> | undefined;
    /**
     * Checks if a key exsits in parent or child map
     * @param key Key to check existence for
     * @returns True if the key exists, else false
     */
    has(key: K): boolean;
    /**
     * Checks if the given key has the given value in either parent or child SetMap
     * @param key Key to check
     * @param value Value to check
     * @returns True if the given key has the given value in either parent or child set
     */
    hasValue(key: K, value: V): boolean;
    /**
     * @returns Iterator over all keys and their combined sets in the parent and child map
     */
    entries(): IterableIterator<[K, Set<V>]>;
    /**
     * @returns Iterator over all keys in the parent and child map
     */
    keys(): IterableIterator<K>;
    /**
     * Iterator over all combined sets in the parent and child map
     * @returns
     */
    values(): IterableIterator<Set<V>>;
    /**
     * @returns Flat representation of the SuperSetMap (Map<K, Set<V>>)
     */
    flat(): Map<K, Set<V>>;
}
