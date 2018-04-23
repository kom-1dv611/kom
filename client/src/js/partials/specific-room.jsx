import React, { Component } from 'react';
import {connect} from "react-redux"; //read
import {bindActionCreators} from "redux"; //write
import event from "../actions/selectRoom"
class room extends Component {
    render() {
        let room = this.props.room.room;
        console.log(room);
        return (<p>{room.name}</p>);
    }
}

function read(db) {
    return{};
  }
  
  function write(dispatch) {
    return bindActionCreators({
      roomSelect: event
    }, dispatch);
  }
  
  export default connect(read, write)(room);
  
