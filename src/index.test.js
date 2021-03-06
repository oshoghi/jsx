import React, { Component } from "react";
import { mount } from "enzyme";
import Jsx from "./index.js";
import { isReactComponent } from "./utils.js";
import { TYPES, getComponent } from "./testComponents";

const last = (arr) => arr[arr.length - 1];

function render (_opts) {
    const opts = Object.assign({
        highlightFn: (str) => str,
        onRender: jest.fn(),
    }, _opts);

    const wrapper = mount(<Jsx {...opts} />);

    wrapper.assertJsxString = (str) => expect(wrapper.props().onRender).toBeCalledWith(str, expect.anything());
    wrapper.assertVarsString = (str) =>expect(wrapper.props().onRender).toBeCalledWith(expect.anything(), str); 
    wrapper.jsx = () => last(wrapper.props().onRender.mock.calls)[0];

    return wrapper;
}

function runTests (type, hasDisplayName) {
    const MyComponent = getComponent(type, hasDisplayName);

    describe(`Component - ${type} - displayName ${hasDisplayName ? "set" : "unset"}`, function () {
        it("multi-lines big json", function () {
            const json = {
                obj1: { value: 1 },
                obj2: { value: 2 },
                obj3: [1, 2, 3]
            };

            const wrapper = render({
                children: <MyComponent prop1={json} />
            });

            wrapper.assertJsxString(`<MyComponent prop1={prop1} />`);
        });

        it("doesnt multi-line inline json", function () {
            const wrapper = render({
                children: <MyComponent prop1={[1, 2, 3, 4, 5]} />
            });

            wrapper.assertJsxString(`<MyComponent prop1={[1, 2, 3, 4, 5]} />`);
        });

        it("Renders with nesting", function () {
            const wrapper = render({
                children: (
                    <div>
                        <MyComponent>
                            <table param="1" />
                            <table param="1" />
                        </MyComponent>
                    </div>)
            });

            wrapper.assertJsxString(
`<div>
    <MyComponent>
        <table param="1" />
        <table param="1" />
    </MyComponent>
</div>`);
        });

        it("Renders with nesting and string child", function () {
            const wrapper = render({
                children: (
                    <div>
                        <MyComponent>blah</MyComponent>
                    </div>)
            });

            wrapper.assertJsxString(
`<div>
    <MyComponent>blah</MyComponent>
</div>`);
        });

        it("Renders with props that is a built-in react component", function () {
            const wrapper = render({
                children: <MyComponent myProp={<div>blah</div>} />
            });

            wrapper.assertJsxString("<MyComponent myProp={<div>blah</div>} />");
        });

        it("Renders with props that is a react component", function () {
            const wrapper = render({
                children: <MyComponent myProp={<MyComponent>blah</MyComponent>} />
            });

            wrapper.assertJsxString("<MyComponent myProp={<MyComponent>blah</MyComponent>} />");
        });
    });
}

//Object.keys(TYPES).forEach((type) => runTests(type, true));
Object.keys(TYPES).forEach((type) => runTests(type, false));

describe("other tests", function () {
    it("renders simple component as one line", function () {
        const wrapper = render({
            children: <span>blah</span>
        });

        wrapper.assertJsxString(`<span>blah</span>`);
    });

    it("renders many simple props in 1 line", function () {
        const wrapper = render({
            children: <span a="1" b="2" c="3">blah</span>
        });

        wrapper.assertJsxString(`<span a="1" b="2" c="3">blah</span>`);
    });

    it("Renders with children", function () {
        const wrapper = render({
            children: <span className="blah" title="my-title">blah</span>
        });

        wrapper.assertJsxString(
`<span
    className="blah"
    title="my-title">
    blah
</span>`);
    });

});
