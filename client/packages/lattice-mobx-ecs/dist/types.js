export var Type;
(function (Type) {
    Type[Type["Number"] = 0] = "Number";
    Type[Type["String"] = 1] = "String";
    Type[Type["NumberArray"] = 2] = "NumberArray";
})(Type || (Type = {}));
export var QueryType;
(function (QueryType) {
    QueryType[QueryType["Has"] = 0] = "Has";
    QueryType[QueryType["Not"] = 1] = "Not";
    QueryType[QueryType["HasValue"] = 2] = "HasValue";
    QueryType[QueryType["NotValue"] = 3] = "NotValue";
})(QueryType || (QueryType = {}));
//# sourceMappingURL=types.js.map