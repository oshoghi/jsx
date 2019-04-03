import React, { Component } from "react";
import { highlight } from "highlightjs";

function serialize (value) {
    if (typeof(value) === "function") {
        return "{function () { ... }}";
    } else if ((value.type && value.props) || value.type && value.type.displayName) {
        return `{${buildJsxString(value)}}`.replace(/\n/g, "").replace(/    /g, "");
    } else if (typeof(value) === "object") {
        return `{${JSON.stringify(value)}}`;
    } else {
        return `"${value.toString()}"`;
    }
}

function indent (amount) {
    const spaces = amount * 4;
    let str = "";

    for (let i = 0; i < spaces; i++) {
        str += " ";
    }

    return str;
}

function buildJsxString (component, indentLevel=0) {
    if (typeof(component) === "string") {
        return component;
    }

    const { props } = component;
    const type = component.type.displayName || component.type;
    const propKeys = Object.keys(props).filter((k) => k !== "children");
    const propsArray = propKeys.map((key, i) => {
        const value = serialize(component.props[key]);

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
                .map((c) => buildJsxString(c, indentLevel + 1))
                .map((c) => "\n" + padding + c)
                .join("\n") + "\n";
        } else {
            children = padding + buildJsxString(props.children, indentLevel + 1);
        }

        return `<${type}${propsString && propsArray.length === 1 ? " " : ""}${propsString}>\n${children}\n${indent(indentLevel)}</${type}>`;
    }

    return `<${type}${propsString && " "}${propsString} />`;
}

function extractCode (children, highlightFn) {
    const child = Array.isArray(children) ? children[0] : children;

    return highlightFn("xml", buildJsxString(child)).value;
}

function Jsx ({ children, highlightFn=highlight, render=true }={}) {
    return (
        <div className={"jsx-xray" + (render ? " with-demo" : "")}>
            {
                render &&
                <div className="jsx-xray--rendered-component">
                    { children }
                </div>
            }
            <div style={{ display: "none" }}>
                <link rel="stylesheet" type="text/css" href="data:text/css;base64,LyoKCmdpdGh1Yi5jb20gc3R5bGUgKGMpIFZhc2lseSBQb2xvdm55b3YgPHZhc3RAd2hpdGVhbnRzLm5ldD4KCiovCgouaGxqcyB7CiAgZGlzcGxheTogYmxvY2s7CiAgb3ZlcmZsb3cteDogYXV0bzsKICBwYWRkaW5nOiAwLjVlbTsKICBjb2xvcjogIzMzMzsKICBiYWNrZ3JvdW5kOiAjZjhmOGY4OwogIC13ZWJraXQtdGV4dC1zaXplLWFkanVzdDogbm9uZTsKfQoKLmhsanMtY29tbWVudCwKLmRpZmYgLmhsanMtaGVhZGVyIHsKICBjb2xvcjogIzk5ODsKICBmb250LXN0eWxlOiBpdGFsaWM7Cn0KCi5obGpzLWtleXdvcmQsCi5jc3MgLnJ1bGUgLmhsanMta2V5d29yZCwKLmhsanMtd2ludXRpbHMsCi5uZ2lueCAuaGxqcy10aXRsZSwKLmhsanMtc3Vic3QsCi5obGpzLXJlcXVlc3QsCi5obGpzLXN0YXR1cyB7CiAgY29sb3I6ICMzMzM7CiAgZm9udC13ZWlnaHQ6IGJvbGQ7Cn0KCi5obGpzLW51bWJlciwKLmhsanMtaGV4Y29sb3IsCi5ydWJ5IC5obGpzLWNvbnN0YW50IHsKICBjb2xvcjogIzAwODA4MDsKfQoKLmhsanMtc3RyaW5nLAouaGxqcy10YWcgLmhsanMtdmFsdWUsCi5obGpzLWRvY3RhZywKLnRleCAuaGxqcy1mb3JtdWxhIHsKICBjb2xvcjogI2QxNDsKfQoKLmhsanMtdGl0bGUsCi5obGpzLWlkLAouc2NzcyAuaGxqcy1wcmVwcm9jZXNzb3IgewogIGNvbG9yOiAjOTAwOwogIGZvbnQtd2VpZ2h0OiBib2xkOwp9CgouaGxqcy1saXN0IC5obGpzLWtleXdvcmQsCi5obGpzLXN1YnN0IHsKICBmb250LXdlaWdodDogbm9ybWFsOwp9CgouaGxqcy1jbGFzcyAuaGxqcy10aXRsZSwKLmhsanMtdHlwZSwKLnZoZGwgLmhsanMtbGl0ZXJhbCwKLnRleCAuaGxqcy1jb21tYW5kIHsKICBjb2xvcjogIzQ1ODsKICBmb250LXdlaWdodDogYm9sZDsKfQoKLmhsanMtdGFnLAouaGxqcy10YWcgLmhsanMtdGl0bGUsCi5obGpzLXJ1bGUgLmhsanMtcHJvcGVydHksCi5kamFuZ28gLmhsanMtdGFnIC5obGpzLWtleXdvcmQgewogIGNvbG9yOiAjMDAwMDgwOwogIGZvbnQtd2VpZ2h0OiBub3JtYWw7Cn0KCi5obGpzLWF0dHJpYnV0ZSwKLmhsanMtdmFyaWFibGUsCi5saXNwIC5obGpzLWJvZHksCi5obGpzLW5hbWUgewogIGNvbG9yOiAjMDA4MDgwOwp9CgouaGxqcy1yZWdleHAgewogIGNvbG9yOiAjMDA5OTI2Owp9CgouaGxqcy1zeW1ib2wsCi5ydWJ5IC5obGpzLXN5bWJvbCAuaGxqcy1zdHJpbmcsCi5saXNwIC5obGpzLWtleXdvcmQsCi5jbG9qdXJlIC5obGpzLWtleXdvcmQsCi5zY2hlbWUgLmhsanMta2V5d29yZCwKLnRleCAuaGxqcy1zcGVjaWFsLAouaGxqcy1wcm9tcHQgewogIGNvbG9yOiAjOTkwMDczOwp9CgouaGxqcy1idWlsdF9pbiB7CiAgY29sb3I6ICMwMDg2YjM7Cn0KCi5obGpzLXByZXByb2Nlc3NvciwKLmhsanMtcHJhZ21hLAouaGxqcy1waSwKLmhsanMtZG9jdHlwZSwKLmhsanMtc2hlYmFuZywKLmhsanMtY2RhdGEgewogIGNvbG9yOiAjOTk5OwogIGZvbnQtd2VpZ2h0OiBib2xkOwp9CgouaGxqcy1kZWxldGlvbiB7CiAgYmFja2dyb3VuZDogI2ZkZDsKfQoKLmhsanMtYWRkaXRpb24gewogIGJhY2tncm91bmQ6ICNkZmQ7Cn0KCi5kaWZmIC5obGpzLWNoYW5nZSB7CiAgYmFja2dyb3VuZDogIzAwODZiMzsKfQoKLmhsanMtY2h1bmsgewogIGNvbG9yOiAjYWFhOwp9CgouanN4LXhyYXkgcHJlIHsKICAgIGJhY2tncm91bmQtY29sb3I6ICNmOWY5Zjk7CiAgICBwb3NpdGlvbjogcmVsYXRpdmU7CiAgICBvdmVyZmxvdzogdW5zZXQ7Cn0KCi5qc3gteHJheS53aXRoLWRlbW8gcHJlIHsKICAgIG1hcmdpbi10b3A6IDI1cHg7Cn0KCi5qc3gteHJheSAuYXJyb3ctY29udGFpbmVyIHsKICAgIGRpc3BsYXk6IGlubGluZS1ibG9jazsKICAgIG92ZXJmbG93OiBoaWRkZW47CiAgICBoZWlnaHQ6IDI1cHg7CiAgICB0b3A6IDFweDsKICAgIGxlZnQ6IDA7CiAgICBwb3NpdGlvbjogYWJzb2x1dGU7CiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZSg1MCUsIC0xMDAlKTsKfQoKLmpzeC14cmF5IC5hcnJvdy1jb250YWluZXI6YmVmb3JlIHsKICAgIGRpc3BsYXk6IGlubGluZS1ibG9jazsKICAgIGNvbnRlbnQ6ICIiOwogICAgYm9yZGVyOiAxNXB4IHNvbGlkIHRyYW5zcGFyZW50OwogICAgYm9yZGVyLWJvdHRvbS1jb2xvcjogI2Y5ZjlmOTsKICAgIGZpbHRlcjogZHJvcC1zaGFkb3coMHB4IDFweCAxcHggcmdiYSgwLCAwLCAwLCAwLjE1KSkgZHJvcC1zaGFkb3coMXB4IDBweCAxcHggcmdiYSgwLCAwLCAwLCAwLjE1KSk7CiAgICBwb3NpdGlvbjogcmVsYXRpdmU7CiAgICB0b3A6IC01cHg7Cn0K" />
            </div>
            <pre>
                {
                  render &&
                  <span className="arrow-container">
                  </span>
                }
                <code className="" dangerouslySetInnerHTML={{ __html: extractCode(children, highlightFn) }} />
            </pre>
        </div>
    );
};

export default Jsx;

