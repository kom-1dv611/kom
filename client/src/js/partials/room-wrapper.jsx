import React, { Component } from 'react';

import Rooms from "./room-collection"

import logo from '../../logo.svg';

class roomWrapper extends Component {
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
    let rows = await fetch("/rooms");
    rows = await rows.json();
    return rows;
  }

  render() {
    if(this.state.loaded) {
      return (<Rooms rows={this.state.rows} clickable={this.props.clickable}/>);
    } else {
      return (
        <div className="loading text-center">
          <img src={logo} alt="loading icon" className="App-logo"/>
          <h1>Loading..</h1>
        </div>
      );
    }
  }
}

export default roomWrapper;

