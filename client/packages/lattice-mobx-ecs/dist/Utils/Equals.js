export function setEquals(a, b) {
    function halfEq(_a, _b) {
        if (!_a || !_b)
            return false;
        for (const val of _a) {
            if (Array.isArray(_b)) {
                if (!_b.includes(val))
                    return false;
            }
            else {
                if (!_b.has(val))
                    return false;
            }
        }
        return true;
    }
    return halfEq(a, b) && halfEq(b, a);
}
export function setMapEquals(a, b) {
    function halfEq(_a, _b) {
        if (!_a || !_b)
            return false;
        for (const [key, val] of _a) {
            let entry;
            if (Array.isArray(_b)) {
                entry = _b[_b.findIndex((e) => e[0] === key)][1];
            }
            else {
                entry = _b.get(key);
            }
            if (!entry || !setEquals(val, entry))
                return false;
        }
        return true;
    }
    return halfEq(a, b) && halfEq(b, a);
}
//# sourceMappingURL=Equals.js.map