import React, { Component } from "react";
import Prism from 'prismjs';
import injectCss from "./inlineCss";
import "prismjs/components/prism-jsx";
const stringify = require("json-stringify-pretty-compact");

const highlight = (code) => Prism.highlight(code, Prism.languages.jsx);

function dealWithSerializedValues (str, propName, value, context) {
    if (str.length > 64 && context.extractVars) {
        context.vars[propName] = context.vars[propName] || [];
        context.vars[propName].push(str);

        return `{${propName + context.vars[propName].length}}`;
    }

    return `{${str}}`;
}

function isReactComponent (obj) {
    return obj && ((obj.type && obj.props) || obj.type && obj.type.displayName);
}

function serialize (propName, value, context) {
    if (value === null) {
        return "{null}";
    } else if (typeof(value) === "function") {
        return "{function () { ... }}";
    } else if (isReactComponent(value)) {
        return dealWithSerializedValues(`${buildJsxString(value, 0, context)}`, propName, value, context);
    } else if (typeof(value) === "object") {
        return dealWithSerializedValues(`{${stringify(value)}}`, propName, value, context);
    } else if (typeof(value) === "number" || typeof(value) === "boolean") {
        return `{${value}}`;
    } else {
        return `"${value.toString()}"`;
    }
}

function indent (amount) {
    let str = "";

    for (let i = 0; i < amount; i++) {
        str += "____";
    }

    return str;
}

function formatInlineProp (str) {
    return str.replace(/(\n|____)/g, "");
}

function buildJsxString (component, indentLevel, context) {
    if (typeof(component) === "string") {
        return component;
    }

    if (Array.isArray(component)) {
        return component.map((c) => buildJsxString(c, indentLevel, context)).join("\n\n");
    }

    let retValue;
    let hasJsxChildren = false;

    const { props } = component;
    const type = component.type.displayName || component.type;
    const propKeys = Object.keys(props).filter((k) => k !== "children");
    const propsArray = propKeys.map((key, i) => {
        const value = formatInlineProp(serialize(key, component.props[key], context));

        if (propKeys.length === 1) {
            return `${key}=${value}`;
        } else {
            return `\n${indent(indentLevel+1)}${key}=${value}`;
        }
    });
    const propsString = propsArray.join("");

    if (component.props.children) {
        const padding = indent(indentLevel + 1);
        let children;

        if (Array.isArray(props.children)) {
            hasJsxChildren = props.children.reduce((acc, c) => acc || isReactComponent(c), false);

            children = props.children
                .map((c) => buildJsxString(c, indentLevel + 1, context))
                .map((c) => "\n" + padding + c)
                .join("\n") + "\n";
        } else {
            hasJsxChildren = isReactComponent(props.children);
            children = padding + buildJsxString(props.children, indentLevel + 1, context);
        }

        retValue = `<${type}${propsString && propsArray.length === 1 ? " " : ""}${propsString}>\n${children}\n${indent(indentLevel)}</${type}>`;
    } else {
        retValue = `<${type}${propsString && " "}${propsString} />`;
    }

    if (retValue.length <= context.multiLineLength && !hasJsxChildren) {
        retValue = retValue
          .replace(/\n/g, " ")
          .replace(/____/g, "")
          .replace(/> ([^<]*) </g, ">$1<");
    }

    return retValue;
}

function printVar (name, value) {
    return `const ${name} = (\n${value.split("\n").map((l) => indent(1) + l).join("\n")}\n);`;
}

function extractCode (children, context) {
    let markup = buildJsxString(children, 0, context);

    const varsStr = context.extractVars && (Object.keys(context.vars)
        .filter((propName) => context.vars[propName].length)
        .map((propName) => {
            if (context.vars[propName].length === 1) {
                markup = markup.replace(new RegExp(`${propName}1`), `${propName}`);

                return printVar(propName, context.vars[propName][0]);
            } else {
                return context.vars[propName].map((v, i) => printVar(propName + (i + 1), v)).join("\n\n");
            }
        })
        .join("\n\n"));

    return {
        markupRaw: markup.replace(/____/g, "    "),
        markup: context.highlightFn(markup).replace(/____/g, "<span>    </span>"),
        vars: context.highlightFn(varsStr || "").replace(/____/g, "<span>    </span>"),
    };
}

function Jsx ({ children, highlightFn=highlight, jsxOnly=false, extractVars=true, onRender, multiLineLength=80 }={}) {
    const context = { vars: [], extractVars, highlightFn, multiLineLength };
    const { markupRaw, markup, vars } = extractCode(children, context);

    injectCss();

    if (onRender) {
        onRender(markupRaw);
    }

    return (
        <div className={"jsx-xray" + (!jsxOnly ? " with-demo" : "")}>
            {
                !jsxOnly &&
                <div className="jsx-xray--rendered-component">
                    { children }
                </div>
            }
            <pre>
                {
                  !jsxOnly &&
                  <span className="arrow-container">
                  </span>
                }
                <code>
                    {
                        extractVars && vars &&
                        <div dangerouslySetInnerHTML={{ __html: vars + "<br/><br/>" }} />
                    }
                    <div className="jsx-xray--markup" dangerouslySetInnerHTML={{ __html: markup }} />
                </code>
            </pre>
        </div>
    );
};

export default Jsx;
