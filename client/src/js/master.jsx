import React, { Component } from 'react';
import {connect} from "react-redux"; //read

import Room from "./partials/specific-room"
import Rooms from "./partials/room-wrapper"
import Setup from "./partials/setup"


class master extends Component {
  state = {mode: "pending"}

  render() {
    if(this.props.selected != null) {
      this.state.mode = this.props.selected;
    }
    switch(this.state.mode) {
      case "overall":
        return (<Rooms clickable={false}/>);
      case "specific":
        if(this.props.selectedRoom != null) {
          return(<Room room={this.props.selectedRoom}/>);
        } else {
          return (<Rooms clickable={true}/>);
        }
      default:
        return (<Setup/>)
    }
  }
}

function read(db) {
  return{
    selected: db.setupSelect,
    selectedRoom: db.setupRoom
  };
}


export default connect(read)(master);
