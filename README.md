# jsx-xray
This is a React component that will render jsx that is passed into it
but will also use these children to render their jsx.  This is handy for
storybook demos where you want to have a working example but quite often
also want to demo the associated jsx.  This component saves you from
hardcoding that jsx.  As a bonus, it also uses highlightjs to highlight
syntax.

# Usage
Anything wrapped in the component will get rendered alongside its
associated jsx.

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

![](https://github.com/oshoghi/jsx/blob/master/examples/output.png)

