export function makeIterable(iterator) {
    const iterable = {
        ...iterator,
        [Symbol.iterator]() {
            return this;
        },
    };
    return iterable;
}
export function mergeIterators(first, second) {
    if (!second)
        return makeIterable(first);
    return makeIterable({
        next() {
            const next = first.next();
            if (!next.done)
                return next;
            return second.next();
        },
    });
}
export function transformIterator(iterator, transform) {
    return makeIterable({
        next() {
            const next = iterator.next();
            return {
                done: next.done,
                value: next.value && transform(next.value),
            };
        },
    });
}
//# sourceMappingURL=iterable.js.map