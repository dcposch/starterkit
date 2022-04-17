import { makeAutoObservable } from "mobx";
import { SuperSet } from "./SuperSet";
import { makeIterable, transformIterator } from "./iterable";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isSuperSetMap(s) {
    return s[Symbol.toStringTag] === "SuperSetMap";
}
export class SuperSetMap {
    parent;
    child;
    constructor(options) {
        this.parent = options?.parent;
        this.child = options?.child || new Map();
        makeAutoObservable(this);
    }
    [Symbol.toStringTag] = "SuperSetMap";
    [Symbol.iterator]() {
        return this.entries();
    }
    /**
     * Returns the size of the SuperSetMap (number of keys)
     */
    get size() {
        // The keys of parent and child might overlap, so we can't just add their sizes.
        // We also can't manually track overlaps, because they can be created when keys are
        // added to the parent map, which we can't be tracked in here.
        // So we use the length of the keys iterator, which keeps track of overlaps.
        // This is a computed property, so is only recalculated once when the keys change.
        return [...this.keys()].length;
    }
    /**
     * Initializes the key with an empty set. Not required to add values.
     * @param key Key of the SuperSetMap entry
     * @returns void
     */
    init(key) {
        if (this.parent?.get(key) || this.child.get(key))
            return;
        this.child.set(key, new Set());
    }
    /**
     * Adds a value to a key's set.
     * @param key Key of the SuperSetMap entry (K)
     * @param value Value of the SuperSetMap entry (V)
     * @returns This SuperSetMap instance
     */
    add(key, value) {
        const parentSet = this.parent?.get(key);
        // If the value is already included in the parent set, nothing to do here.
        if (parentSet && parentSet.has(value)) {
            return this;
        }
        // Else, add the value to the child set.
        const childSet = this.child.get(key);
        if (childSet) {
            childSet.add(value);
        }
        else {
            this.child.set(key, new Set([value]));
        }
        return this;
    }
    /**
     * Clears the child map, leaves the parent map untouched.
     */
    clear() {
        this.child.clear();
    }
    /**
     * Deletes the given key from the child map, leaves the parent map untouched.
     * @param key Key in the child map to delete
     * @returns boolean
     */
    delete(key) {
        return this.child.delete(key);
    }
    /**
     * Deletes the given value from the key's set, leaves the parent map untouched.
     * @param key Key of the set to delete the value from
     * @param value Value to delete from the set
     * @returns boolean
     */
    deleteValue(key, value) {
        return Boolean(this.child.get(key)?.delete(value));
    }
    /**
     * Returns the combined set of parent and child sets for a given key.
     * @param key: Key to return the combined set for
     * @returns The combined set of parent and child
     */
    get(key) {
        const parentSet = this.parent?.get(key);
        const childSet = this.child.get(key);
        if (!parentSet && !childSet)
            return undefined;
        if (!parentSet)
            return childSet;
        if (!childSet)
            return parentSet;
        return new SuperSet({ parent: new SuperSet({ child: parentSet }), child: childSet });
    }
    /**
     * Checks if a key exsits in parent or child map
     * @param key Key to check existence for
     * @returns True if the key exists, else false
     */
    has(key) {
        return this.parent?.has(key) || this.child.has(key);
    }
    /**
     * Checks if the given key has the given value in either parent or child SetMap
     * @param key Key to check
     * @param value Value to check
     * @returns True if the given key has the given value in either parent or child set
     */
    hasValue(key, value) {
        return Boolean(this.parent?.get(key)?.has(value) || this.child?.get(key)?.has(value));
    }
    /**
     * @returns Iterator over all keys and their combined sets in the parent and child map
     */
    entries() {
        return transformIterator(this.keys(), (key) => {
            const value = this.get(key);
            if (!value)
                throw new Error("Key has no value.");
            return [key, value];
        });
    }
    /**
     * @returns Iterator over all keys in the parent and child map
     */
    keys() {
        if (!this.parent)
            return this.child.keys();
        const child = this.child;
        const childKeys = this.child.keys();
        const parentKeys = this.parent.keys();
        return makeIterable({
            next() {
                let next = childKeys.next();
                if (!next.done)
                    return next;
                do {
                    // Skip overrides in parent
                    next = parentKeys.next();
                } while (!next.done && child.has(next.value));
                return next;
            },
        });
    }
    /**
     * Iterator over all combined sets in the parent and child map
     * @returns
     */
    values() {
        return transformIterator(this.entries(), (entry) => entry && entry[1]);
    }
    /**
     * @returns Flat representation of the SuperSetMap (Map<K, Set<V>>)
     */
    flat() {
        const map = new Map();
        for (const key of this.keys()) {
            const values = this.get(key);
            if (!values)
                throw new Error("Key has no value.");
            map.set(key, new Set([...values]));
        }
        return map;
    }
}
//# sourceMappingURL=SuperSetMap.js.map