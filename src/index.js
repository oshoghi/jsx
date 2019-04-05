import React, { Component } from "react";
import Prism from 'prismjs';
import "prismjs/components/prism-jsx";

const highlight = (code) => Prism.highlight(code, Prism.languages.jsx);

function dealWithSerializedValues (str, propName, value, context) {
    if (str.length > 64 && context.extractVars) {
        context.vars[propName] = context.vars[propName] || [];
        context.vars[propName].push(str);

        return `{${propName + context.vars[propName].length}}`;
    }

    return str;
}

function serialize (propName, value, context) {
    if (value === null) {
        return "";
    } else if (typeof(value) === "function") {
        return "{function () { ... }}";
    } else if ((value.type && value.props) || value.type && value.type.displayName) {
        return dealWithSerializedValues(`${buildJsxString(value, 0, context)}`, propName, value, context);
    } else if (typeof(value) === "object") {
        return dealWithSerializedValues(`{${JSON.stringify(value)}}`, propName, value, context);
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
    const varsStr = extractVars && (Object.keys(context.vars)
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
        markup: highlightFn(markup).replace(/____/g, "<span>    </span>"),
        vars: highlightFn(varsStr || "").replace(/____/g, "<span>    </span>"),
    };
}

function Jsx ({ children, highlightFn=highlight, jsxOnly=false, extractVars=true }={}) {
    const { markup, vars } = extractCode(children, extractVars, highlightFn);

    return (
        <div className={"jsx-xray" + (!jsxOnly ? " with-demo" : "")}>
            {
                !jsxOnly &&
                <div className="jsx-xray--rendered-component">
                    { children }
                </div>
            }
            <div style={{ display: "none" }}>
                <link rel="stylesheet" type="text/css" href="data:text/css;base64,LyoqCiAqIHByaXNtLmpzIGRlZmF1bHQgdGhlbWUgZm9yIEphdmFTY3JpcHQsIENTUyBhbmQgSFRNTAogKiBCYXNlZCBvbiBkYWJibGV0IChodHRwOi8vZGFiYmxldC5jb20pCiAqIEBhdXRob3IgTGVhIFZlcm91CiAqLwoKY29kZVtjbGFzcyo9Imxhbmd1YWdlLSJdLApwcmVbY2xhc3MqPSJsYW5ndWFnZS0iXSB7Cgljb2xvcjogYmxhY2s7CgliYWNrZ3JvdW5kOiBub25lOwoJdGV4dC1zaGFkb3c6IDAgMXB4IHdoaXRlOwoJZm9udC1mYW1pbHk6IENvbnNvbGFzLCBNb25hY28sICdBbmRhbGUgTW9ubycsICdVYnVudHUgTW9ubycsIG1vbm9zcGFjZTsKCWZvbnQtc2l6ZTogMWVtOwoJdGV4dC1hbGlnbjogbGVmdDsKCXdoaXRlLXNwYWNlOiBwcmU7Cgl3b3JkLXNwYWNpbmc6IG5vcm1hbDsKCXdvcmQtYnJlYWs6IG5vcm1hbDsKCXdvcmQtd3JhcDogbm9ybWFsOwoJbGluZS1oZWlnaHQ6IDEuNTsKCgktbW96LXRhYi1zaXplOiA0OwoJLW8tdGFiLXNpemU6IDQ7Cgl0YWItc2l6ZTogNDsKCgktd2Via2l0LWh5cGhlbnM6IG5vbmU7CgktbW96LWh5cGhlbnM6IG5vbmU7CgktbXMtaHlwaGVuczogbm9uZTsKCWh5cGhlbnM6IG5vbmU7Cn0KCnByZVtjbGFzcyo9Imxhbmd1YWdlLSJdOjotbW96LXNlbGVjdGlvbiwgcHJlW2NsYXNzKj0ibGFuZ3VhZ2UtIl0gOjotbW96LXNlbGVjdGlvbiwKY29kZVtjbGFzcyo9Imxhbmd1YWdlLSJdOjotbW96LXNlbGVjdGlvbiwgY29kZVtjbGFzcyo9Imxhbmd1YWdlLSJdIDo6LW1vei1zZWxlY3Rpb24gewoJdGV4dC1zaGFkb3c6IG5vbmU7CgliYWNrZ3JvdW5kOiAjYjNkNGZjOwp9CgpwcmVbY2xhc3MqPSJsYW5ndWFnZS0iXTo6c2VsZWN0aW9uLCBwcmVbY2xhc3MqPSJsYW5ndWFnZS0iXSA6OnNlbGVjdGlvbiwKY29kZVtjbGFzcyo9Imxhbmd1YWdlLSJdOjpzZWxlY3Rpb24sIGNvZGVbY2xhc3MqPSJsYW5ndWFnZS0iXSA6OnNlbGVjdGlvbiB7Cgl0ZXh0LXNoYWRvdzogbm9uZTsKCWJhY2tncm91bmQ6ICNiM2Q0ZmM7Cn0KCkBtZWRpYSBwcmludCB7Cgljb2RlW2NsYXNzKj0ibGFuZ3VhZ2UtIl0sCglwcmVbY2xhc3MqPSJsYW5ndWFnZS0iXSB7CgkJdGV4dC1zaGFkb3c6IG5vbmU7Cgl9Cn0KCi8qIENvZGUgYmxvY2tzICovCnByZVtjbGFzcyo9Imxhbmd1YWdlLSJdIHsKCXBhZGRpbmc6IDFlbTsKCW1hcmdpbjogLjVlbSAwOwoJb3ZlcmZsb3c6IGF1dG87Cn0KCjpub3QocHJlKSA+IGNvZGVbY2xhc3MqPSJsYW5ndWFnZS0iXSwKcHJlW2NsYXNzKj0ibGFuZ3VhZ2UtIl0gewoJYmFja2dyb3VuZDogI2Y1ZjJmMDsKfQoKLyogSW5saW5lIGNvZGUgKi8KOm5vdChwcmUpID4gY29kZVtjbGFzcyo9Imxhbmd1YWdlLSJdIHsKCXBhZGRpbmc6IC4xZW07Cglib3JkZXItcmFkaXVzOiAuM2VtOwoJd2hpdGUtc3BhY2U6IG5vcm1hbDsKfQoKLnRva2VuLmNvbW1lbnQsCi50b2tlbi5wcm9sb2csCi50b2tlbi5kb2N0eXBlLAoudG9rZW4uY2RhdGEgewoJY29sb3I6IHNsYXRlZ3JheTsKfQoKLnRva2VuLnB1bmN0dWF0aW9uIHsKCWNvbG9yOiAjOTk5Owp9CgoubmFtZXNwYWNlIHsKCW9wYWNpdHk6IC43Owp9CgoudG9rZW4ucHJvcGVydHksCi50b2tlbi50YWcsCi50b2tlbi5ib29sZWFuLAoudG9rZW4ubnVtYmVyLAoudG9rZW4uY29uc3RhbnQsCi50b2tlbi5zeW1ib2wsCi50b2tlbi5kZWxldGVkIHsKCWNvbG9yOiAjOTA1Owp9CgoudG9rZW4uc2VsZWN0b3IsCi50b2tlbi5hdHRyLW5hbWUsCi50b2tlbi5zdHJpbmcsCi50b2tlbi5jaGFyLAoudG9rZW4uYnVpbHRpbiwKLnRva2VuLmluc2VydGVkIHsKCWNvbG9yOiAjNjkwOwp9CgoudG9rZW4ub3BlcmF0b3IsCi50b2tlbi5lbnRpdHksCi50b2tlbi51cmwsCi5sYW5ndWFnZS1jc3MgLnRva2VuLnN0cmluZywKLnN0eWxlIC50b2tlbi5zdHJpbmcgewoJY29sb3I6ICM5YTZlM2E7CgliYWNrZ3JvdW5kOiBoc2xhKDAsIDAlLCAxMDAlLCAuNSk7Cn0KCi50b2tlbi5hdHJ1bGUsCi50b2tlbi5hdHRyLXZhbHVlLAoudG9rZW4ua2V5d29yZCB7Cgljb2xvcjogIzA3YTsKfQoKLnRva2VuLmZ1bmN0aW9uLAoudG9rZW4uY2xhc3MtbmFtZSB7Cgljb2xvcjogI0RENEE2ODsKfQoKLnRva2VuLnJlZ2V4LAoudG9rZW4uaW1wb3J0YW50LAoudG9rZW4udmFyaWFibGUgewoJY29sb3I6ICNlOTA7Cn0KCi50b2tlbi5pbXBvcnRhbnQsCi50b2tlbi5ib2xkIHsKCWZvbnQtd2VpZ2h0OiBib2xkOwp9Ci50b2tlbi5pdGFsaWMgewoJZm9udC1zdHlsZTogaXRhbGljOwp9CgoudG9rZW4uZW50aXR5IHsKCWN1cnNvcjogaGVscDsKfQoKLmpzeC14cmF5IHByZSB7CiAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZjlmOWY5OwogICAgcG9zaXRpb246IHJlbGF0aXZlOwogICAgb3ZlcmZsb3c6IHVuc2V0OwogICAgcGFkZGluZzogMjBweDsKfQoKLmpzeC14cmF5LndpdGgtZGVtbyBwcmUgewogICAgbWFyZ2luLXRvcDogMjVweDsKfQoKLmpzeC14cmF5IHByZSA+IC5hcnJvdy1jb250YWluZXIgewogICAgZGlzcGxheTogaW5saW5lLWJsb2NrOwogICAgb3ZlcmZsb3c6IGhpZGRlbjsKICAgIGhlaWdodDogMjVweDsKICAgIHRvcDogMDsKICAgIGxlZnQ6IDA7CiAgICBwb3NpdGlvbjogYWJzb2x1dGU7CiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZSg1MCUsIC0xMDAlKTsKfQoKLmpzeC14cmF5IHByZSA+IC5hcnJvdy1jb250YWluZXI6YmVmb3JlIHsKICAgIGRpc3BsYXk6IGlubGluZS1ibG9jazsKICAgIGNvbnRlbnQ6ICIiOwogICAgYm9yZGVyOiAxNXB4IHNvbGlkIHRyYW5zcGFyZW50OwogICAgYm9yZGVyLWJvdHRvbS1jb2xvcjogI2Y5ZjlmOTsKICAgIGZpbHRlcjogZHJvcC1zaGFkb3coMHB4IDFweCAwLjVweCByZ2JhKDAsIDAsIDAsIDAuMTUpKSBkcm9wLXNoYWRvdygxcHggMHB4IDAuNXB4IHJnYmEoMCwgMCwgMCwgMC4xNSkpOwogICAgcG9zaXRpb246IHJlbGF0aXZlOwogICAgdG9wOiAtNXB4Owp9Cg==" />
            </div>
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
                    <div dangerouslySetInnerHTML={{ __html: markup }} />
                </code>
            </pre>
        </div>
    );
};

export default Jsx;
