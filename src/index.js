import React from "react";
import Prism from 'prismjs';

import"prismjs/components/prism-jsx";
import "prismjs/themes/prism.css";

function serialize (value, propName, context) {
    if (typeof(value) === "function") {
        return "{function () { ... }}";
    } else if ((value.type && value.props) || value.type && value.type.displayName) {
        const str = `${buildJsxString(value, 0, context)}`.replace(/    /g, "");

        if (str.length > 32 && context.extractVars) {
            context.vars[propName] = context.vars[propName] || [];
            context.vars[propName].push(str);

            return `{${propName + context.vars[propName].length}}`;
        }

        return `{${str.replace(/(\n|____)/g, "")}}`;
    } else if (typeof(value) === "object") {
        return `{${JSON.stringify(value)}}`;
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

function buildJsxString (component, indentLevel, context) {
    debugger;
    if (typeof(component) === "string") {
        return component;
    }

    if (Array.isArray(component)) {
        return component.map((c) => buildJsxString(c, indentLevel, context)).join("\n\n");
    }

    const { props } = component;
    const type = component.type.displayName || component.type;
    const propKeys = Object.keys(props).filter((k) => k !== "children");
    const propsArray = propKeys.map((key, i) => {
        const value = serialize(component.props[key], key, context);

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
            children = props.children
                .map((c) => buildJsxString(c, indentLevel + 1, context))
                .map((c) => "\n" + padding + c)
                .join("\n") + "\n";
        } else {
            children = padding + buildJsxString(props.children, indentLevel + 1, context);
        }

        return `<${type}${propsString && propsArray.length === 1 ? " " : ""}${propsString}>\n${children}\n${indent(indentLevel)}</${type}>`;
    }

    return `<${type}${propsString && " "}${propsString} />`;
}

function printVar (name, value) {
    return `const ${name} = (\n${value.split("\n").map((l) => indent(1) + l).join("\n")}\n);`;
}

function extractCode (children, extractVars, highlightFn) {
    const context = { vars: [], extractVars };
    let markup = buildJsxString(children, 0, context);
    const varsStr = Object.keys(context.vars)
        .map((propName) => {
            if (context.vars[propName].length === 1) {
                markup = markup.replace(new RegExp(`${propName}1`), `${propName}`);

                return printVar(propName, context.vars[propName][0]);
            } else {
                return context.vars[propName].map((v, i) => printVar(propName + (i + 1), v)).join("\n\n");
            }
        })
        .join("\n\n");

    return highlightFn((varsStr + "\n\n" + markup)).replace(/____/g, "<span>    </span>");
}

const highlight = (code) => Prism.highlight(code, Prism.languages.jsx);

function Jsx ({ children, highlightFn=highlight, render=true, extractVars=false }={}) {
    return (
        <div className={"jsx-xray" + (render ? " with-demo" : "")}>
            {
                render &&
                <div className="jsx-xray--rendered-component">
                    { children }
                </div>
            }
            <div style={{ display: "none" }}>
                <link rel="stylesheet" type="text/css" href="data:text/css;base64,LmhsanN7ZGlzcGxheTpibG9jaztvdmVyZmxvdy14OmF1dG87cGFkZGluZzouNWVtO2NvbG9yOiMzMzM7YmFja2dyb3VuZDojZjhmOGY4Oy13ZWJraXQtdGV4dC1zaXplLWFkanVzdDpub25lfS5kaWZmIC5obGpzLWhlYWRlciwuaGxqcy1jb21tZW50e2NvbG9yOiM5OTg7Zm9udC1zdHlsZTppdGFsaWN9LmNzcyAucnVsZSAuaGxqcy1rZXl3b3JkLC5obGpzLWtleXdvcmQsLmhsanMtcmVxdWVzdCwuaGxqcy1zdGF0dXMsLmhsanMtc3Vic3QsLmhsanMtd2ludXRpbHMsLm5naW54IC5obGpzLXRpdGxle2NvbG9yOiMzMzM7Zm9udC13ZWlnaHQ6NzAwfS5obGpzLWhleGNvbG9yLC5obGpzLW51bWJlciwucnVieSAuaGxqcy1jb25zdGFudHtjb2xvcjp0ZWFsfS5obGpzLWRvY3RhZywuaGxqcy1zdHJpbmcsLmhsanMtdGFnIC5obGpzLXZhbHVlLC50ZXggLmhsanMtZm9ybXVsYXtjb2xvcjojZDE0fS5obGpzLWlkLC5obGpzLXRpdGxlLC5zY3NzIC5obGpzLXByZXByb2Nlc3Nvcntjb2xvcjojOTAwO2ZvbnQtd2VpZ2h0OjcwMH0uaGxqcy1saXN0IC5obGpzLWtleXdvcmQsLmhsanMtc3Vic3R7Zm9udC13ZWlnaHQ6NDAwfS5obGpzLWNsYXNzIC5obGpzLXRpdGxlLC5obGpzLXR5cGUsLnRleCAuaGxqcy1jb21tYW5kLC52aGRsIC5obGpzLWxpdGVyYWx7Y29sb3I6IzQ1ODtmb250LXdlaWdodDo3MDB9LmRqYW5nbyAuaGxqcy10YWcgLmhsanMta2V5d29yZCwuaGxqcy1ydWxlIC5obGpzLXByb3BlcnR5LC5obGpzLXRhZywuaGxqcy10YWcgLmhsanMtdGl0bGV7Y29sb3I6bmF2eTtmb250LXdlaWdodDo0MDB9LmhsanMtYXR0cmlidXRlLC5obGpzLW5hbWUsLmhsanMtdmFyaWFibGUsLmxpc3AgLmhsanMtYm9keXtjb2xvcjp0ZWFsfS5obGpzLXJlZ2V4cHtjb2xvcjojMDA5OTI2fS5jbG9qdXJlIC5obGpzLWtleXdvcmQsLmhsanMtcHJvbXB0LC5obGpzLXN5bWJvbCwubGlzcCAuaGxqcy1rZXl3b3JkLC5ydWJ5IC5obGpzLXN5bWJvbCAuaGxqcy1zdHJpbmcsLnNjaGVtZSAuaGxqcy1rZXl3b3JkLC50ZXggLmhsanMtc3BlY2lhbHtjb2xvcjojOTkwMDczfS5obGpzLWJ1aWx0X2lue2NvbG9yOiMwMDg2YjN9LmhsanMtY2RhdGEsLmhsanMtZG9jdHlwZSwuaGxqcy1waSwuaGxqcy1wcmFnbWEsLmhsanMtcHJlcHJvY2Vzc29yLC5obGpzLXNoZWJhbmd7Y29sb3I6Izk5OTtmb250LXdlaWdodDo3MDB9LmhsanMtZGVsZXRpb257YmFja2dyb3VuZDojZmRkfS5obGpzLWFkZGl0aW9ue2JhY2tncm91bmQ6I2RmZH0uZGlmZiAuaGxqcy1jaGFuZ2V7YmFja2dyb3VuZDojMDA4NmIzfS5obGpzLWNodW5re2NvbG9yOiNhYWF9LmpzeC14cmF5IHByZXtiYWNrZ3JvdW5kLWNvbG9yOiNmOWY5Zjk7cG9zaXRpb246cmVsYXRpdmU7b3ZlcmZsb3c6dW5zZXQ7cGFkZGluZzoyMHB4fS5qc3gteHJheS53aXRoLWRlbW8gcHJle21hcmdpbi10b3A6MjVweH0uanN4LXhyYXkgLmFycm93LWNvbnRhaW5lcntkaXNwbGF5OmlubGluZS1ibG9jaztvdmVyZmxvdzpoaWRkZW47aGVpZ2h0OjI1cHg7dG9wOjA7bGVmdDowO3Bvc2l0aW9uOmFic29sdXRlO3RyYW5zZm9ybTp0cmFuc2xhdGUoNTAlLC0xMDAlKX0uanN4LXhyYXkgLmFycm93LWNvbnRhaW5lcjpiZWZvcmV7ZGlzcGxheTppbmxpbmUtYmxvY2s7Y29udGVudDoiIjtib3JkZXI6MTVweCBzb2xpZCB0cmFuc3BhcmVudDtib3JkZXItYm90dG9tLWNvbG9yOiNmOWY5Zjk7ZmlsdGVyOmRyb3Atc2hhZG93KDAgMXB4IC41cHggcmdiYSgwLCAwLCAwLCAuMTUpKSBkcm9wLXNoYWRvdygxcHggMCAuNXB4IHJnYmEoMCwgMCwgMCwgLjE1KSk7cG9zaXRpb246cmVsYXRpdmU7dG9wOi01cHh9" />
            </div>
            <pre>
                {
                  render &&
                  <span className="arrow-container">
                  </span>
                }
                <code className="" dangerouslySetInnerHTML={{ __html: extractCode(children, extractVars, highlightFn) }} />
            </pre>
        </div>
    );
};

export default Jsx;
