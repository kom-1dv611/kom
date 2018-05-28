import React, { Component } from 'react';
import {connect} from "react-redux"; //read

import Rooms from "./room-collection"

import logo from '../../logo.svg';

class roomWrapper extends Component {
  constructor() {
    super();
    this.timer = 0;
    this.startTimer = this.startTimer.bind(this);
    this.countDown = this.onLoop.bind(this);
  }

  startTimer() {
    if (this.timer === 0) {
        this.timer = setInterval(this.countDown, 100);
    }
}

  onLoop() {
    if(Object.keys(this.props.allRooms).length > 0) {
      this.forceUpdate();
      clearInterval(this.timer);
    }
  }

  render() {
    if(Object.keys(this.props.allRooms).length > 0) {
      return (<Rooms rooms={this.props.allRooms} clickable={this.props.clickable}/>);
    } else {
      this.startTimer();
      return (
        <div className="loading text-center">
          <img src={logo} alt="loading icon" className="App-logo"/>
          <h1 className="text-dark">Loading..</h1>
        </div>
      );
    }
  }
}

function read(db) {
  return{
    allRooms: db.roomState
  };
}


export default connect(read)(roomWrapper);

