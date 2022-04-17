import { makeAutoObservable } from "mobx";
import { mergeIterators } from "./iterable";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isSuperSet(s) {
    return s[Symbol.toStringTag] === "SuperSetMap";
}
export class SuperSet {
    parent;
    child;
    constructor(options) {
        this.child = options?.child || new Set(options?.values);
        this.parent = options?.parent;
        makeAutoObservable(this);
    }
    [Symbol.iterator]() {
        return this.values();
    }
    get [Symbol.toStringTag]() {
        return "SuperSet";
    }
    get size() {
        return this.child.size + (this.parent?.size || 0);
    }
    add(value) {
        if (!this.parent || !this.parent.has(value)) {
            this.child.add(value);
        }
        return this;
    }
    clear() {
        this.child.clear();
    }
    delete(value) {
        return this.child.delete(value);
    }
    entries() {
        return mergeIterators(this.child.entries(), this.parent?.entries());
    }
    forEach(callbackfn, thisArg) {
        this.child.forEach(callbackfn, thisArg);
        this.parent?.forEach(callbackfn, thisArg);
    }
    has(value) {
        return this.parent?.has(value) || this.child.has(value);
    }
    keys() {
        return mergeIterators(this.child.keys(), this.parent?.keys());
    }
    values() {
        return mergeIterators(this.child.values(), this.parent?.values());
    }
    flat() {
        return new Set([...this]);
    }
}
//# sourceMappingURL=SuperSet.js.map