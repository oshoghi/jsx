import React, { Component } from "react";
import Prism from 'prismjs';
import injectCss from "./inlineCss";
import "prismjs/components/prism-jsx";
import { indent, buildJsxString } from "./utils";
import PropTypes from "prop-types";
import classnames from "classnames";

const highlight = (code) => Prism.highlight(code, Prism.languages.jsx);

function extractCode (children, context) {
    let markup = buildJsxString(children, context, 0);
    const vars = [];

    if (context.substituteThreshold !== -1) {
        Object.keys(context.vars)
            .filter((propName) => context.vars[propName].length)
            .forEach((propName) => {
                if (context.vars[propName].length === 1) {
                    markup = markup.replace(new RegExp(`${propName}1`), `${propName}`);
                }

                context.vars[propName].forEach((v, i, arr) => {
                    vars.push({
                        name: propName + (arr.length > 1  ? (i + 1) : ""),
                        value: v.split("\n").map((l) => indent(1) + l).join("\n"),
                    });
                });
            });
    }

    return {
        markupRaw: markup.replace(/____/g, "    "),
        markup: context.highlightFn(markup).replace(/____/g, "<span>    </span>"),
        //varsRaw: varsStr.replace(/____/g, "    "),
        vars,

        //context.highlightFn(varsStr || "").replace(/____/g, "<span>    </span>"),
    };
}

class JsxVariable extends Component {
    state = {
        expanded: false
    };

    _toggle = () => this.setState({ expanded: !this.state.expanded });

    render () {
        const { name, value } = this.props;
        const className = classnames("jsx-xray-variable", this.state.expanded && "expanded");

        return (
            <div className={className}>
                <span className="token keyword">const</span>
                <span> {name}</span>
                <span className="token operator"> = </span>
                <span className="token punctuation">(</span>

                <span className="jsx-xray-variable-expand" onClick={this._toggle}>
                {
                    this.state.expanded
                    ? <span dangerouslySetInnerHTML={{ __html: highlight("\n" + value.replace(/  /g, "    ")).replace(/____/g, "<span>    </span>") }} />
                    : <span className="jsx-xray-variable-placeholder"><span>...</span></span>
                }
                </span>

                <span className="token punctuation">);</span>
                <br />
                <br />

            </div>
        );
    }
}

/*
 * @param {function} highlightFn
 *  - Mostly here for unit testing purposes, but allows you to override the default andsyntax highlighter
 *
 * @param {function} onRender
 *  - Also mostly here for the unit tests to verify the raw string that will be passed into the highlighter
 *
 * @param {bool} jsxOnly
 *  - Only print the jsx of the components passed in, but dont render them
 *
 * @param {number} substituteThreshold
 *  - Specify the number of chars after which an inline prop should be substituted out for a variable.  
 *
 * @example
 *  - Given the following jsx, jsx-xray will move the content inside id={...} into a variable and substitute
 *    the variable into the jsx to make it more readable:
 *
 *  <div id={(() => "my-complex-expression-beyond-the-threshold")()} />
 *
 *  will get transformed into
 *
 *  const id = (() => "my-complex-expression-beyond-the-threshold")();
 *
 *  <div id={id} />
 */
class Jsx extends Component {
    componentDidMount () {
        this._addTitleForUnnamed();
    }

    componentDidUpdate () {
        this._addTitleForUnnamed();
    }

    _addTitleForUnnamed () {
        if (this.jsxContainer) {
            Array.from(this.jsxContainer.querySelectorAll(".class-name"))
                .filter((node) => node.innerText === "UnnamedComponent")
                .forEach((node) => node.title = "Component displayName not set in definition.  Please update your class to have a displayName");
        }
    }

    render () {
        const { children, highlightFn=highlight, jsxOnly=false, substituteThreshold=40, oneLineThreshold=40 } = this.props;
        const context = { vars: [], highlightFn, oneLineThreshold, substituteThreshold };
        const { markupRaw, markup, vars, varsRaw } = extractCode(children, context);

        injectCss();

        if (this.props.onRender) {
            this.props.onRender(markupRaw, varsRaw);
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
                    <code>
                        {
                            this.props.info &&
                            <div className="jsx-xray-code-info">{this.props.info}</div>
                        }

                        { vars.map((v) => <JsxVariable {...v} />) }

                        <div ref={(ref) => this.jsxContainer = ref}
                            className="jsx-xray--markup"
                            dangerouslySetInnerHTML={{ __html: markup }} />
                    </code>
                </pre>
            </div>
        );
    }
};

Jsx.propTypes = {
    highlightFn: PropTypes.func,
    jsxOnly: PropTypes.bool,
    onRender: PropTypes.func,
    substituteThreshold: PropTypes.number,
    oneLineThreshold: PropTypes.number
};

export default Jsx;
