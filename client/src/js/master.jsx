import React, { Component } from 'react';
import {connect} from "react-redux"; //read

import Room from "./partials/specific-room"
import Rooms from "./partials/room-wrapper"
import Setup from "./partials/setup"

class master extends Component {
  state = {mode: "pending"}

  selectedRoom() {
    return(<div><Room room={this.props.selectedRoom}/></div>);
  }

  allRooms() {
    return (<div><Rooms clickable={true}/></div>);
  }

  render() {
    if(this.props.selected != null) {
      this.state.mode = this.props.selected;
    }
    switch(this.state.mode) {
      case "overall":
        return (<div className="container"><Rooms clickable={false}/></div>);
      case "specific":
        if(this.props.available) {
          document.getElementsByTagName("body")[0].setAttribute("id", "available")
        } else if(this.props.available === false){
          document.getElementsByTagName("body")[0].setAttribute("id", "unavailable")
        }
        if(this.props.selectedRoom != null) {
          return(this.selectedRoom());
        } else {
          return (this.allRooms());
        }
      default:
        return (<Setup/>)
    }
  }
}

function read(db) {
  return{
    selected: db.setupSelect,
    selectedRoom: db.setupRoom,
    available: db.busyRoom
  };
}


export default connect(read)(master);
