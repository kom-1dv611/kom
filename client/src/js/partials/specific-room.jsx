import React, { Component } from 'react';
import {connect} from "react-redux"; //read
import {bindActionCreators} from "redux"; //write

import room from "../actions/room-state";
import error from "../actions/get-error";

import $ from "jquery"

import Schedule from "./scheduleModal";
import Book from "./book";

import logo from '../../logo.svg';

class Room extends Component {
    constructor(props) {
        super(props)

        this.state = {
            room: this.props.roomGetter[this.props.room],
            schedule: [],
            error: this.props.readError
        };

        console.log(this.state);

        this.timer = 0;
        this.ticks = 0;
        this.startTimer = this.startTimer.bind(this);
        this.countDown = this.countDown.bind(this);
    }

    componentDidMount() {
        this.startTimer();
    }

    componentWillUnmount() {
        clearInterval(this.timer);
    }

    startTimer() {
        if (this.timer === 0) {
            this.timer = setInterval(this.countDown, 100);
        }
    }

    async countDown() {
        this.ticks++;
        if(this.ticks > 50) {
            this.ticks = 0;
            let name = this.state.room.name;
            let updated = await fetch("/room/" + name);
            updated = await updated.json();
            console.log(updated);
            this.setState(function() {
                return {
                    room: {
                        name: updated["room"].name,
                        available: updated["room"].available
                    },
                    schedule: updated["room"].schedule,
                    error: this.props.readError
                };
            });
        } else {
            let room = this.props.roomGetter[this.state.room.name];
            this.setState(function(prev) {
                return {
                    room: {available: room.available, name: prev.room.name},
                    schedule: room.schedule,
                    error: this.props.readError
                };
            });
            
        }
      }

    stateHeader() {
        let available = this.state.room.available;
        let toReturn;
        if(available === true) {
            toReturn = (<h1 className="text-center mt-5 pt-5 animated fadeIn" data-toggle="tooltip" data-placement="top" title="This room is currently available!">Available</h1>);
        } else if(available === false) {
            if(this.state.room.bookings && this.state.room.bookings.length > 0) {
                toReturn = (
                    <div className="text-center mt-2 pt-5 animated fadeIn">
                        <h1 data-toggle="tooltip" data-placement="top" title="This room is currently unavailable!">Unavailable</h1>
                        <h3>Available: {this.state.room.ings[0].endTime}({this.state.time.h}:{this.state.time.m}:{this.state.time.s})</h3>
                    </div>);
            } else {
                toReturn = (<h1 className="text-center mt-2 pt-5 animated fadeIn" data-toggle="tooltip" data-placement="top" title="This room is currently unavailable!">Unavailable</h1>);
            }
        }
        return toReturn;
    }

    icons() {
        return(
            <div className="mt-3 text-center animated fadeIn">
                <i className="fas fa-users fa-3x" title="Capacity"></i><span className="h3">5</span>
                <i className="fas fa-laptop fa-3x mr-2" title="Computer Equipment"></i>
                <i className="fab fa-product-hunt fa-3x mr-2" title="Projector"></i>
            </div>
        );
    }

    clock() {
        return(<h1 id="clock" className="text-center animated slideInUp" data-toggle="tooltip" data-placement="top" title="Current time!"></h1>);
    }

    booking() {
        let available = this.state.room.available;
        let name = this.state.room.name;

        if(available === true) {
            return (
                <div id="book" className="animated fadeInLeft">
                    <div className="row justify-content-center pb-0">
                        <input id="currentTime" hidden/>
                        <div id="schedule" className="col-md-auto">
                            <button className="btn btn-dark" data-toggle="modal" data-target="#test"><i className="fas fa-calendar-alt"></i>Schedule</button>
                            <Schedule name={this.state.room.name} schedule={this.state.room.schedule}/>
                        </div>
                        <Book room={name} available={available} />
                    </div>
                </div>);
        } else {
            return (
            <div id="cancel" className="animated fadeInLeft">
                <div className="row justify-content-center pb-0">
                    <input id="currentTime" hidden/>
                    <div id="schedule" className="col-md-auto">
                        <button className="btn btn-dark" data-toggle="modal" data-target="#test"><i className="fas fa-calendar-alt"></i>Schedule</button>
                        <Schedule name={this.state.room.name} schedule={this.state.room.schedule}/>
                    </div>
                    <div className="col-md-auto">
                        <Book room={name} available={available} />
                    </div>
                </div>
            </div>);
        }
    }

    async cancel() {
        this.state.room.available = true;
        return true;
    }


    updateBackground() {
        if(this.state.room.available === true) {
            $("body").addClass("available");
            $("body").removeClass("unavailable");
        } else {
            $("body").addClass("unavailable");
            $("body").removeClass("available");
        }
        return true;
    }

    render() {
        if(Object.keys(this.state).length === 0) {
            return(
                <div>
                    <img src={logo} alt="loading icon" className="App-logo"/>
                    <h1 className="mt-5">Loading</h1>
                </div>)
        } else {
            this.updateBackground();
            return (
                <div>
                    {this.stateHeader()}
                    {this.icons()}
                    {this.booking()}
                    <h3 className="text-center">{this.props.error.msg}</h3>
                    {this.clock()}
                </div>
                );
        }     
    }
}

function write(dispatch) {
    return bindActionCreators({
        roomManager: room,
    }, dispatch);
}


function read(db) {
    return{
        cancel: db.cancelBooking,
        roomGetter: db.roomState,
        error: db.error
    };
}
  
export default connect(read, write)(Room);
  
