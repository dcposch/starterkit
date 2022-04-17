export declare function isSuperSet(s: any): s is SuperSet<any>;
export declare class SuperSet<T> implements Set<T> {
    parent?: SuperSet<T>;
    child: Set<T>;
    constructor(options?: {
        values?: T[];
        parent?: SuperSet<T>;
        child?: Set<T>;
    });
    [Symbol.iterator](): IterableIterator<T>;
    get [Symbol.toStringTag](): string;
    get size(): number;
    add(value: T): this;
    clear(): void;
    delete(value: T): boolean;
    entries(): IterableIterator<[T, T]>;
    forEach(callbackfn: (value: T, value2: T, set: Set<T>) => void, thisArg?: unknown): void;
    has(value: T): boolean;
    keys(): IterableIterator<T>;
    values(): IterableIterator<T>;
    flat(): Set<T>;
}
