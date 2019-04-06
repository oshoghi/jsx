import React, { Component } from "react";
import { mount } from "enzyme";
import { indent, substituteForVarIfTooLong, buildJsxString, joinParts } from "./utils.js";

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

const fakeJoin = (component, propsArray, childObjects) => ({ component, propsArray, childObjects });

describe("buildJsxString", function () {
    it("pulls out the parts of a simple component", function () {
        const context = { extractVars: true, vars: {} };
        const parts = buildJsxString(<MyComponent>inner string</MyComponent>, context, 0, fakeJoin);

        expect(parts).toEqual(expect.objectContaining({
            propsArray: [],
            childObjects: ["inner string"],
        }));
    });

    it("pulls out the parts of a simple component with some props", function () {
        const context = { extractVars: true, vars: {} };
        const parts = buildJsxString(<MyComponent prop1="1" prop2="2">inner string</MyComponent>, context, 0, fakeJoin);

        expect(parts).toEqual(expect.objectContaining({
            propsArray: [
                { key: "prop1", value: '"1"' },
                { key: "prop2", value: '"2"' },
            ],
            childObjects: ["inner string"],
        }));
    });

    it("builds a deeply nested component", function (){ 
        const context = { extractVars: true, vars: {} };
        const component = (
            <MyComponent level="1">
                <MyComponent level="2">
                    <MyComponent level="3">
                        <MyComponent />
                    </MyComponent>
                </MyComponent>
            </MyComponent>
        );

        expect(buildJsxString(component, context, 0, joinParts))
            .toEqual(
`<MyComponent level="1">
____<MyComponent level="2">
________<MyComponent level="3">
____________<MyComponent />
________</MyComponent>
____</MyComponent>
</MyComponent>`);
    });

    it("joins with the real join function", function () {
        const context = { extractVars: true, vars: {}, oneLineThreshold: 9999 };
        const component = <MyComponent prop1="1" prop2="2">inner string</MyComponent>;
        
        expect(buildJsxString(component, context))
            .toEqual(`<MyComponent prop1="1" prop2="2">inner string</MyComponent>`);

        context.oneLineThreshold = 10;
        expect(buildJsxString(component, context, 0))
            .toEqual(`<MyComponent
____prop1="1"
____prop2="2">
____inner string
</MyComponent>`);
    });

    it("no children", function (){
        const context = { extractVars: true, vars: {}, oneLineThreshold: 9999 };
        const component = <MyComponent prop1="1" prop2={123} prop3={false} />;

        expect(buildJsxString(component, context, 0))
            .toEqual(`<MyComponent prop1="1" prop2={123} prop3={false} />`);
    });

    it("Complex joins", function () {
        const context = { extractVars: true, vars: {}, oneLineThreshold: 64 };
        const component = (
            <MyComponent prop1="1" prop2={() => "some func"} prop3={<div>hi</div>}>
                inner string
                <div>Hello</div>
                <MyComponent prop4="4" />
                <MyComponent />
            </MyComponent>
        );
        
        expect(buildJsxString(component, context, 0))
            .toEqual(
`<MyComponent
____prop1="1"
____prop2={function () { ... }}
____prop3={<div>hi</div>}>
____inner string
____<div>Hello</div>
____<MyComponent prop4="4" />
____<MyComponent />
</MyComponent>`);
    });
});

describe("substituteForVarIfTooLong", function () {
    it("substitutes inline value if > context.substituteThreshold", function () {
        const context = { extractVars: true, vars: {} };

        expect(substituteForVarIfTooLong("myPropName", {}, context, () => indent(20)))
            .toEqual("{myPropName1}");

        expect(substituteForVarIfTooLong("myPropName", {}, context, () => indent(2)))
            .toEqual(`{${indent(2)}}`);
    });

    it("doesnt substitute if the option is disabled", function () {
        const context = { substituteThreshold: Number.MAX_SAFE_INTEGER, vars: {} };

        expect(substituteForVarIfTooLong("myPropName", {}, context, () => indent(20)))
            .toEqual(`{${indent(20)}}`);
    });

    it("doesnt pushes multiple variables onto the context", function () {
        const context = { extractVars: true, vars: {} };

        expect(substituteForVarIfTooLong("myPropName", {}, context, () => indent(20)))
            .toEqual("{myPropName1}");
        expect(substituteForVarIfTooLong("myPropName", {}, context, () => indent(20, "xxxx")))
            .toEqual("{myPropName2}");
        expect(substituteForVarIfTooLong("myPropName", {}, context, () => indent(20, "yyyy")))
            .toEqual("{myPropName3}");

        expect(context.vars.myPropName).toEqual([
            indent(20),
            indent(20, "xxxx"),
            indent(20, "yyyy"),
        ]);
    });
});

