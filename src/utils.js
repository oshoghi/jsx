import stringify from "json-stringify-pretty-compact";

/**
 * @typedef {object} Context
 * @property {number} oneLineThreshold - The max number of chars to put a jsx in one line
 * @property {number} substituteThreshold - The number of chars after which to substitute props with a variable
 * @property {object} vars - A hash to hold substituted variables
 */

export const indent = function (amount, indentStr="____") {
    let str = "";

    for (let i = 0; i < amount; i++) {
        str += indentStr;
    }

    return str;
};

export const getComponentName = (component) => component.type.displayName || component.type || "Component";

export const isReactComponent = (obj) => obj && ((obj.type && obj.props) || obj.type && obj.type.displayName);

export const serializeFnForComponent = (propName, value, context) => buildJsxString(value, context, 0);

export const serializeFnForObject = (propName, value, context) => stringify(value);

/*
 * Jsx becomes hard to read if there are too many long inline props.  For anything beyond a certain
 * threshold specified in the context, pull the value out and replace with a variable instead.
 */
export const substituteForVarIfTooLong = function (propName, value, context, serializeFn) {
    const forceOneLineContext = Object.assign({}, context, { oneLineThreshold: Number.MAX_SAFE_INTEGER });
    const serializedValue = serializeFn(propName, value, context);
    const { substituteThreshold=64, vars } = context;

    if (serializedValue.length > substituteThreshold && substituteThreshold !== -1) {
        vars[propName] = vars[propName] || [];
        vars[propName].push(serializedValue);

        return `{${propName + vars[propName].length}}`;
    }

    //inline props should always be on the same line
    return `{${serializeFn(propName, value, forceOneLineContext)}}`;
}

export const serializeProperty = function (propName, value, context) {
    if (value === null) {
        return "{null}";
    } else if (typeof(value) === "function") {
        return "{function () { ... }}";
    } else if (isReactComponent(value)) {
        return substituteForVarIfTooLong(propName, value, context, serializeFnForComponent);
    } else if (typeof(value) === "object") {
        return substituteForVarIfTooLong(propName, value, context, serializeFnForObject);
    } else if (typeof(value) === "number" || typeof(value) === "boolean") {
        return `{${value}}`;
    } else {
        return `"${value.toString()}"`;
    }
}

export const getChildren = function (component) {
    const children = component.props.children;

    if (Array.isArray(children)) {
        return children
    }
    if (children) {
        return [children];
    }

    return [];
}

export const buildJsxString = function (component, context, indentLevel=0, _join=joinParts) {
    if (typeof(component) === "string") {
        return component;
    }

    if (Array.isArray(component)) {
        return component.map((c) => buildJsxString(c, context, indentLevel)).join("\n\n");
    }

    const { props } = component;
    const childObjects = getChildren(component).map((c) => buildJsxString(c, context, indentLevel + 1));
    const propsArray = Object.keys(props)
        .filter((k) => k !== "children")
        .map((key, i) => ({
            key,
            value: serializeProperty(key, component.props[key], context)
        }));


    return _join(component, propsArray, childObjects, indentLevel, context);
}

export const shouldDisplaySingleLine = function (component, propsArray, childObjects, indentLevel, context) {
    //do a dry run and measure it's length
    return joinParts(component, propsArray, childObjects, indentLevel, context, () => true).length <= context.oneLineThreshold;
}

export const joinParts = function (component, propsArray, childObjects, indentLevel, context, _singleLine=shouldDisplaySingleLine) {
    const singleLine = _singleLine(component, propsArray, childObjects, indentLevel, context);
    const type = getComponentName(component);
    const pad = singleLine ? "" : indent(indentLevel + 1);
    const joinChar = singleLine ? " " : "\n";

    let str = `<${type}`;

    switch (propsArray.length) {
        case 0:
            break;
        case 1:
            const { key, value } = propsArray[0];
            str += ` ${key}=${value}`;
            break;
        default:
            str += joinChar;
            str += propsArray.map(({ key, value }) => `${pad}${key}=${value}`).join(joinChar);
    }

    if (childObjects.length > 0) {
        if (singleLine) {
            str += ">" + childObjects.join("") + "</" + type + ">";
        } else {
            str += ">\n";
            str += childObjects.map((c) => `${pad}${c}`).join("\n")
            str += `\n${indent(indentLevel)}</` + type + ">";
        }
    } else {
        str += " />";
    }

    return str
};


