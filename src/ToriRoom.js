import React, { Component, PropTypes } from 'react'

import GridLayout from 'react-grid-layout';

class ToriRoom extends Component {

  constructor(props) {
    super(props)

    this.state = {
      layout: [
        {i: 'tori', x: 2, y: 2, w: 1, h: 1, static: false},
        {i: 'door', x: 2, y: 4, w: 1, h: 1, static: true},
      ],
      cells: [
        (<div key="tori" className="cell tori">
          <img src='mockimg/tori-sample.png'/>
        </div>),
        (<div key="door" className="cell">
        </div>),
      ],
    }
  }

  componentDidMount() {
    // TODO: get info about the layout here.
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps != this.props) {
      // TODO: check if empty.
      if (this.props.acc.key != undefined) {
        this.onItemSelected();
      }
    }
  }

  onItemSelected() {
    let key = this.props.acc.key;
    let space = this.props.acc.space;
    let img = this.props.acc.img;
    let newCell = (
      <div key={key} className="cell" preventCollision={true}>
        <img src={img}/>
      </div>
    );

    // TODO: Calculate where this object should be placed.
    let newLayout = {i: key, x: 0, y: 0, w: 1, h: 1, static: false};

    // Update the state.
    this.setState({
      layout: this.state.layout.concat(newLayout),
      cells: this.state.cells.concat(newCell),
    });

    console.log(this.state.layout.length)
  }

  render() {

    return (
      <div className="tori-room">
        <GridLayout className="layout"
                    layout={this.state.layout}
                    cols={5}
                    rows={5}
                    width={400}
                    margin={[0, 0]}
                    rowHeight={80}>
          {this.state.cells}
        </GridLayout>
      </div>
    );
  }
}

export default ToriRoom
