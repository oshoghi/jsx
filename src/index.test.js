import React, { Component } from "react";
import { mount } from "enzyme";
import Jsx from "./index.js";

class MyComponent extends Component {
    static displayName = "MyComponent";

    render () {
        return null;
    }
}

function MyFunctionalComponent () {
    return null;
}

MyFunctionalComponent.displayName = "MyFunctionalComponent";


describe("Jsx component", function () {
    function render (_opts) {
        const opts = Object.assign({
            highlightFn: jest.fn().mockReturnValue({})
        }, _opts);

        const wrapper = mount(<Jsx {...opts} />);

        wrapper.assertJsxString = (str) => expect(wrapper.props().highlightFn).toBeCalledWith("xml", str);

        return wrapper;
    }

    it("renders simple component", function () {
        const wrapper = render({
            children: <span>blah</span>
        });

        wrapper.assertJsxString(
`<span>
    blah
</span>`);
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

    it("Renders with nesting", function () {
        const wrapper = render({
            children: (
                <div>
                    <MyComponent>
                        <MyFunctionalComponent param="1" />
                        <MyFunctionalComponent param="2" />
                    </MyComponent>
                </div>)
        });

        wrapper.assertJsxString(
`<div>
    <MyComponent>

        <MyFunctionalComponent param=\"1\" />

        <MyFunctionalComponent param=\"2\" />

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
    <MyComponent>
        blah
    </MyComponent>
</div>`);
    });
});
