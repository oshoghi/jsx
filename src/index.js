import React, { Component } from "react";
import Prism from 'prismjs';
import injectCss from "./inlineCss";
import "prismjs/components/prism-jsx";
import { indent, buildJsxString } from "./utils";
import PropTypes from "prop-types";
import { CollapsibleBox } from "./CollapsibleBox";

const highlight = (code) => Prism.highlight(code, Prism.languages.jsx);

function printVar (name, value) {
    return `const ${name} = (\n${value.split("\n").map((l) => indent(1) + l).join("\n")}\n);`;
}

function extractCode (children, context) {
    let markup = buildJsxString(children, context, 0);

    const varsStr = context.substituteThreshold !== -1 && (Object.keys(context.vars)
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
        varsRaw: varsStr.replace(/____/g, "    "),
        vars: context.highlightFn(varsStr || "").replace(/____/g, "<span>    </span>"),
    };
}

/*
 * @param {function} highlightFn
 *  - Mostly here for unit testing purposes, but allows you to override the default syntax highlighter
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
    state = {
        open: false
    };

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

    _toggleOpen = () => this.setState({ open: !this.state.open });

    render () {
        const { children, highlightFn=highlight, jsxOnly=false, substituteThreshold=40, oneLineThreshold=40 } = this.props;
        const context = { vars: [], highlightFn, oneLineThreshold, substituteThreshold };
        const { markupRaw, markup, vars, varsRaw } = extractCode(children, context);

        injectCss();

        if (this.props.onRender) {
            this.props.onRender(markupRaw, varsRaw);
        }

        const varsButton = (
            <span className="jsx-xray--vars-toggle">
                { this.state.open ? "Hide" : "Show"} variables
            </span>
        );

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
                            substituteThreshold !== -1 && vars &&
                            <CollapsibleBox
                                header={varsButton}
                                open={this.state.open}
                                onHeaderClick={this._toggleOpen}
                            >
                                <div dangerouslySetInnerHTML={{ __html: vars + "<br/><br/>" }} />
                            </CollapsibleBox>
                        }
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
