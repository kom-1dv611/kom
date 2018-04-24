import React, { Component } from 'react';
import {connect} from "react-redux"; //read
import {bindActionCreators} from "redux"; //write
import event from "../actions/busy-state";

import Duration from "./durationSelector";
import Confirm from "./confirm";
import Book from "./book";

class room extends Component {
    constructor(props) {
        super(props)
        console.log(this.props.room);
        this.props.busy(this.props.room.available);
    }

    stateHeader() {
        let available = this.props.room.available;
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

    booking() {
        let available = this.props.room.available;
        if(available === true) {
            return (
                <div id="book" className="animated fadeIn">
                    <div className="row justify-content-center">
                        <form id="bookingForm" className="form-inline" action="http://www.localhost:2000/:id" method="post">
                            <input type="time" id="currentTime" name="time" hidden/>
                            <Book/>
                            <div className="col-md-auto">
                                <div className="btn-group btn-group-toggle" data-toggle="buttons">
                                    <Duration duration="1"/>
                                    <Duration duration="2"/>
                                    <Duration duration="3"/>
                                </div>
                            </div>
                            <Confirm/>
                        </form>
                    </div>
                </div>);
        }
    }

    render() {
        let room = this.props.room.room;
        return (
        <div>
            {this.stateHeader()}
            {this.booking()}
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
  
