import { makeAutoObservable } from "mobx";
import { makeIterable, transformIterator } from "./iterable";
export class SuperMap {
    parent;
    child;
    overrides;
    constructor(options) {
        this.child = new Map();
        this.parent = options?.parent;
        this.overrides = new Set();
        makeAutoObservable(this);
    }
    [Symbol.iterator]() {
        return this.entries();
    }
    get [Symbol.toStringTag]() {
        return "SuperMap";
    }
    get size() {
        return this.child.size + (this.parent?.size || 0) - this.overrides.size;
    }
    clear() {
        this.child.clear();
        this.overrides.clear();
    }
    delete(key) {
        this.overrides.delete(key);
        return this.child.delete(key);
    }
    entries() {
        if (!this.parent)
            return this.child.entries();
        const overrides = this.overrides;
        const childEntries = this.child.entries();
        const parentEntries = this.parent.entries();
        return makeIterable({
            next() {
                let next = childEntries.next();
                if (!next.done)
                    return next;
                do {
                    // Skip overrides in parent
                    next = parentEntries.next();
                } while (!next.done && overrides.has(next.value[0]));
                return next;
            },
        });
    }
    forEach(callbackfn, thisArg) {
        this.child.forEach(callbackfn, thisArg);
        this.parent?.forEach((value, key, map) => {
            if (this.overrides.has(key))
                return;
            callbackfn(value, key, map);
        }, thisArg);
    }
    get(key) {
        return this.child.has(key) ? this.child.get(key) : this.parent?.get(key);
    }
    has(key) {
        return this.parent?.has(key) || this.child.has(key);
    }
    keys() {
        return transformIterator(this.entries(), (entry) => entry && entry[0]);
    }
    set(key, value) {
        if (this.parent?.has(key))
            this.overrides.add(key);
        this.child.set(key, value);
        return this;
    }
    values() {
        return transformIterator(this.entries(), (entry) => entry && entry[1]);
    }
}
//# sourceMappingURL=SuperMap.js.map