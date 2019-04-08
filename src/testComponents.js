import React, { Component } from "react";
import createClass from "create-react-class";
import keyMirror from "keyMirror";

export const TYPES = keyMirror({
    //functional: null,
    //es6Class: null,
    createClass: null,
});

export const getComponent = function (type, hasDisplayName=true) {
    let component;

    switch (type) {
        case TYPES.functional:
            component = function MyComponent () {
                return null;
            }
            break;
        case TYPES.es6Class:
            component = class MyComponent extends Component {
                render () {
                    return null;
                }
            };
            break;
        case TYPES.createClass:
            component = createClass({
                render () {
                    return null;
                }
            });

            break;
    }

    if (hasDisplayName) {
        component.displayName = "MyComponent";
    }

    return component;
};
