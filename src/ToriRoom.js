import React, { Component, PropTypes } from 'react'

import GridLayout from 'react-grid-layout';

class ToriRoom extends Component {

  constructor(props) {
    super(props)

    this.state = {}
  }



  render() {
    var layout = [
      {i: 'tori', x: 2, y: 2, w: 1, h: 1, static: true},
      {i: 'door', x: 2, y: 4, w: 1, h: 1, static: true},
    ];
    return (
      <div className="tori-room">
        <GridLayout className="layout"
                    layout={layout}
                    cols={5}
                    rows={5}
                    width={400}
                    margin={[0, 0]}
                    rowHeight={80}>
          <div key="tori" className="cell tori">
            <img src='mockimg/tori-sample.png'/>
          </div>
          <div key="door" className="cell">
          </div>
        </GridLayout>
      </div>
    );
  }
}

export default ToriRoom
