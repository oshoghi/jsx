import React from "react";
import classnames from "classnames";

class CollapsibleBox extends React.Component {
    state = {
        style: { maxHeight: this.props.open ? "" : 0 },
        className: this.props.open ? "" : "clip"
    };

    ANIMATION_DURATION_MS = 500;

    componentWillReceiveProps(nextProps) {
        if (this.props.open !== nextProps.open) {
            this.setState({ style: { maxHeight: this._getHeight() } }, function () {
                global.setTimeout(this._handleOpenChange.bind(this, nextProps), 0);
            });
        }
    }

    _handleHeaderClick = () => {
            console.log("click")
        if (this.props.onHeaderClick) {
            this.props.onHeaderClick();
        }
    };

    _handleOpenChange = (nextProps) => {
        if (!nextProps.open) {
            this.setState({ className: "clip", style: { maxHeight: 0 } });
        } else {
            this._scheduleUnclip();
        }
    };

    //put this into a function to make it easier to mock in unit tests
    _getHeight = () => {
        return this.refs.body.scrollHeight;
    };

    _scheduleUnclip = () => {
        global.setTimeout(() => this.setState({ className: "", style: { maxHeight: "" } }), this.ANIMATION_DURATION_MS);
    };

    render() {
        const className = classnames("collapsible-box", this.props.className, this.state.className, this.props.open && "open");

        return (
            <div ref="container" className={className}>
                <div className="collapsible-box-header" onClick={this._handleHeaderClick}>{this.props.header}</div>

                <div className="collapsible-box-body"
                    style={this.state.style}
                    ref="body">{this.props.children}</div>

                <div className="collapsible-box-footer">{this.props.footer}</div>
            </div>
        );
    }
}

export { CollapsibleBox };
