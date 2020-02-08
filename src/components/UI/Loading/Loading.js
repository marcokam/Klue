import React, { PureComponent } from "react";

import "./Loading.scss";

export class Loading extends PureComponent {
    static defaultProps = {
        displayDelayInMs: 150,
    };
    state = {
        shouldRender: false,
    };

    render() {
        const { className = "" } = this.props;
        const { shouldRender } = this.state;
        return shouldRender ? (
            <div className={`uiLoading z-999 mt2 flex justify-center ${className}`}>
                <div className="circle br-100 w2 h2" />
            </div>
        ) : null;
    }
    componentDidMount() {
        const { displayDelayInMs } = this.props;
        this._isMounted = true;
        setTimeout(() => {
            if (this._isMounted) {
                this.setState({
                    shouldRender: true,
                });
            }
        }, displayDelayInMs);
    }
    componentWillUnmount() {
        this._isMounted = false;
    }
}
