import React, { Component } from 'react';
import {connect} from "react-redux"; //read
import {bindActionCreators} from "redux"; //write

import event from "../actions/selectRoom"

class room extends Component {
    select() {
        return null;
    }
    render() {
        let room = this.props.room;
        if(room.available) {
            room = room.room;
            return (
                //onClick={ () => this.props.roomSelect({room})}
                <div className="card text-center" onClick={ () => this.props.roomSelect({room})}>
                    <div className="card-body">
                        <h5 className="card-title">{room.name}</h5>
                        <p className="location">{room.location}</p> 
    
                        <h6 className="card-subtitle mb-2 text-success">Available</h6>
                    </div>
                </div>);
        } else {
            room = room.room;
            return (
                <div className="card text-center">
                    <div className="card-body">
                        <h5 className="card-title">{room.name}</h5>
                        <p className="location">{room.location}</p> 
    
                        <h6 className="card-subtitle mb-2 text-muted">In use</h6>
                    </div>
                </div>);
        }
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
  
