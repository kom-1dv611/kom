import React, { Component } from 'react';
import {connect} from "react-redux"; //read

import Room from "./partials/specific-room"
import Rooms from "./partials/room-wrapper"
import Setup from "./partials/setup"
import Nav from "./partials/nav"
class master extends Component {
  state = {mode: "pending"}

  selectedRoom() {
    return(<div><Room room={this.props.selectedRoom}/></div>);
  }

  allRooms() {
    return (<div className="text-center"><Rooms clickable={true}/></div>);
  }

  render() {
    if(this.props.selected != null) {
      this.state.mode = this.props.selected;
    }
    switch(this.state.mode) {
      case "overall":
        return (<div className="container"><Nav filter="true" location="Overview"/><Rooms clickable={false}/></div>);
      case "specific":
        if(this.props.available) {
          document.getElementsByTagName("body")[0].setAttribute("class", "available")
        } else if(this.props.available === false){
          document.getElementsByTagName("body")[0].setAttribute("class", "unavailable")
        }
        if(this.props.selectedRoom != null) {
          console.log(this.props.selectedRoom);
          return(<div><Nav filter="false" location={this.props.selectedRoom.room.name}/>{this.selectedRoom()}<img src="/imgs/url.png" alt="url"/></div>);
        } else {
          return (<div><Nav filter="true" location="Selection"/>{this.allRooms()}<img src="/imgs/url.png" alt="url"/></div>);
        }
      default:
        return (
          <div>
            <Nav location="Setup" filter="false"/>
            <Setup/>
            <img src="/imgs/url.png" alt="url"/>
          </div>
      )
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
