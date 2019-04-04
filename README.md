# jsx-xray
JSX Xray for React is a component that will render its children that but will also reverse engineer their jsx, and print it along side in a popover box.  This is handy for storybook demos where you want to have a working example, but also wish to provide sample jsx without having to hard code it.  As a bonus, it also uses highlightjs to highlight syntax.

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

The above Storybook story renders this:

![](https://lh4.googleusercontent.com/AU-3qYH6IRa6ZM1WVmOxrENpanKJ9kbKhE9MuP5mEHbVSFKm49m-lNrHOvxdpyJLsuO6uSYOfz3eIHbFiOBB=w3360-h1778)

