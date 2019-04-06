# jsx-xray
JSX Xray for React is a component that will render its children but will also reverse engineer their jsx, and print it along side in a popover box.  This is handy for storybook demos where you want to have a working example, but also wish to provide sample jsx without having to hard code it.  As a bonus, it also uses prism to highlight syntax and since it's computing the jsx,
as you interact with your storybook demos, the jsx always matches what's
rendered on screen.

Note that in order for the component names to be displayed correctly,
you MUST have displayName set for the components which you pass into
XRay.

#Github
https://github.com/oshoghi/jsx

# Usage
Anything wrapped in the component will get rendered alongside its associated jsx.

```js
import React, { Component } from "react";
import { RockerButton } from "ui-lib"
import Jsx from "jsx-xray";

class Story extends Component {
    static state = { index: 0 };

    _handleRockerButtonClick = (index) => {
        this.setState({ index });
    };

    render () {
        return (
            <Jsx>
                <RockerButton 
                    labels={["button 1","button 2","another button"]}
                    selected={this.state.index}
                    className="autowidth"
                    onClick={this._handleRockerButtonClick} />
            </Jsx>
        )
    }
}

```

#Options
JSX XRay comes with some reasonable defaults but you can override these
by passing it the appropriate props:

## substituteThreshold
The default value is 80 chars.  This prop controls the length at which point
XRay will swap out prop values and substitute them with variables.  Eg:

```js
<Jsx substituteThreshold={15}>
    <RockerButton 
        labels={["button 1","button 2","another button"]}
        selected={this.state.index}
        className="autowidth"
        onClick={this._handleRockerButtonClick} />
</Jsx>

```

This will cause the outputted jsx to look like this:

```js
const labels = ([
    "button 1",
    "button 2",
    "another button"
]);

<RockerButton
    labels={labels}
    selected={-1}
    className="autowidth"
    onClick={function () {...}} />

```

## oneLineThreshold
The default value for this prop is 64 chars.  This prop controls at what
length XRay will break a jsx line into multiple lines.

