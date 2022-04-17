export declare function makeIterable<T>(iterator: Iterator<T>): IterableIterator<T>;
export declare function mergeIterators<T>(first: Iterator<T>, second?: Iterator<T>): IterableIterator<T>;
export declare function transformIterator<A, B>(iterator: Iterator<A>, transform: (value: A) => B): IterableIterator<B>;
