import React, { Component } from 'react';

class TokenView extends Component {

    constructor(props) {
        super(props)
    }

    render() {
        return (
            <div style={{position:'absolute',top:'60px'}}>
              <iframe src={this.props.location.query.url} height={676} width={414} frameBorder="1" allowFullScreen/>
            </div>
        )
    }
}

export default TokenView
