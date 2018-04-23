import React, { Component } from 'react';
import Rooms from "./partials/room-collection"


class master extends Component {
  state = {loaded: false}
  constructor() {
    super();
    this.setRows();
  }

  async setRows() {
    let rows = await this.getRows();
    this.setState(function() {
      return {loaded: true, rows: rows}
    })
  }

  async getRows() {
    let rows = await fetch("http://localhost:2000");
    rows = await rows.json();
    return rows;
  }

  render() {
    if(this.state.loaded) {
        return (
          <div className="App">
            <Rooms rows={this.state.rows}/>
          </div>);
    } else {
      return (
        <div className="text-center">
          <h1>Loading..</h1>
        </div>
      );
    }
  }
}

export default master;
