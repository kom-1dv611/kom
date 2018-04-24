import React, { Component } from 'react';
import {connect} from "react-redux"; //read
import {bindActionCreators} from "redux"; //write
import event from "../actions/busy-state"

class room extends Component {
    constructor(props) {
        super(props)
        console.log(this.props.room);
        this.props.busy(this.props.room.available);
    }

    stateHeader(available) {
        let toReturn;
        if(available === true) {
            toReturn = (<h1 id="state" className="text-center animated fadeIn" data-toggle="tooltip" data-placement="top" title="This room is currently available!">Available</h1>);
        } else if(available === false) {
            toReturn = (<h1 id="state" className="text-center animated fadeIn" data-toggle="tooltip" data-placement="top" title="This room is currently available!">Unavailable</h1>);
        }
        return toReturn;
    }

    clock() {
        return(<h1 id="clock" className="text-center animated slideInUp" data-toggle="tooltip" data-placement="top" title="Current time!"></h1>);
    }

    render() {
        let room = this.props.room.room;
        return (
        <div>
            {this.stateHeader(this.props.room.available)}
            {this.clock()}
        </div>
        );
    }
}

function read(db) {
    return{};
  }
  
  function write(dispatch) {
    return bindActionCreators({
      busy: event
    }, dispatch);
  }
  
  export default connect(read, write)(room);
  
