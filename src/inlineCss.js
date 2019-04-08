//import FA from "./fa";

export default function () {
    if (document && !document.getElementById("jsx-xray-style")) {
        const element = document.createElement("style");
        element.id = "jsx-xray-style";
        element.innerHTML = CSS_STR;
        document.body.appendChild(element);
    }
}

const CSS_STR = `
/**
 * prism.js default theme for JavaScript, CSS and HTML
 * Based on dabblet (http://dabblet.com)
 * @author Lea Verou
 */

code[class*="language-"],
pre[class*="language-"] {
	color: black;
	background: none;
	text-shadow: 0 1px white;
	font-family: Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace;
	font-size: 1em;
	text-align: left;
	white-space: pre;
	word-spacing: normal;
	word-break: normal;
	word-wrap: normal;
	line-height: 1.5;

	-moz-tab-size: 4;
	-o-tab-size: 4;
	tab-size: 4;

	-webkit-hyphens: none;
	-moz-hyphens: none;
	-ms-hyphens: none;
	hyphens: none;
}

pre[class*="language-"]::-moz-selection, pre[class*="language-"] ::-moz-selection,
code[class*="language-"]::-moz-selection, code[class*="language-"] ::-moz-selection {
	text-shadow: none;
	background: #b3d4fc;
}

pre[class*="language-"]::selection, pre[class*="language-"] ::selection,
code[class*="language-"]::selection, code[class*="language-"] ::selection {
	text-shadow: none;
	background: #b3d4fc;
}

@media print {
	code[class*="language-"],
	pre[class*="language-"] {
		text-shadow: none;
	}
}

/* Code blocks */
pre[class*="language-"] {
	padding: 1em;
	margin: .5em 0;
	overflow: auto;
}

:not(pre) > code[class*="language-"],
pre[class*="language-"] {
	background: #f5f2f0;
}

/* Inline code */
:not(pre) > code[class*="language-"] {
	padding: .1em;
	border-radius: .3em;
	white-space: normal;
}

.token.comment,
.token.prolog,
.token.doctype,
.token.cdata {
	color: slategray;
}

.token.punctuation {
	color: #999;
}

.namespace {
	opacity: .7;
}

.token.property,
.token.tag,
.token.boolean,
.token.number,
.token.constant,
.token.symbol,
.token.deleted {
	color: #905;
}

.token.selector,
.token.attr-name,
.token.string,
.token.char,
.token.builtin,
.token.inserted {
	color: #690;
}

.token.operator,
.token.entity,
.token.url,
.language-css .token.string,
.style .token.string {
	color: #9a6e3a;
	background: hsla(0, 0%, 100%, .5);
}

.token.atrule,
.token.attr-value,
.token.keyword {
	color: #07a;
}

.token.function,
.token.class-name {
	color: #DD4A68;
}

.token.regex,
.token.important,
.token.variable {
	color: #e90;
}

.token.important,
.token.bold {
	font-weight: bold;
}
.token.italic {
	font-style: italic;
}

.token.entity {
	cursor: help;
}

.collapsible-box.clip .collapsible-box-body {
    overflow: hidden;
}

.collapsible-box-body {
    transition: all 0.4s ease;
}

.collapsible-box-header {
    cursor: pointer;
}

@keyframes pulse {
    0% {
      opacity: 1
      box-shadow: 0px 0px 1px;
    }
    50% {
        opacity: 0.6;
        box-shadow: 0px 0px 10px;
    }
    100% {
      opacity: 1
      box-shadow: 0px 0px 1px;
    }
}

.pulse {
    position: relative;
    display: inline-block;
    padding: 5px;
    box-shadow: 0px 0px 1px;
    border-radius: 100px;
}

.pulse:before {
    position: absolute;
    width: 100%;
    height: 100%;
    display: inline-block;
    content: "";
    left: 0;
    top: 0;
    animation-duration: 3s;
    animation-iteration-count: infinite;
    animation-name: pulse;
    border-radius: 100px;
}

.jsx-xray--vars-toggle {
    padding: 10px;
    margin: 0;
    background: #555;
    color: #f0f0f0;
    display: block;
    margin-bottom: 15px;
    border-radius: 3px;
    font-family: initial;
}

.jsx-xray pre {
    background-color: #f9f9f9;
    position: relative;
    overflow: unset;
    padding: 20px;
    overflow: hidden;
}

.jsx-xray.with-demo pre {
    margin-top: 25px;
}

.jsx-xray pre > .arrow-container {
    display: inline-block;
    overflow: hidden;
    height: 25px;
    top: 0;
    left: 0;
    position: absolute;
    transform: translate(50%, -100%);
}

.jsx-xray pre > .arrow-container:before {
    display: inline-block;
    content: "";
    border: 15px solid transparent;
    border-bottom-color: #f9f9f9;
    filter: drop-shadow(0px 1px 0.5px rgba(0, 0, 0, 0.15)) drop-shadow(1px 0px 0.5px rgba(0, 0, 0, 0.15));
    position: relative;
    top: -5px;
}`;
