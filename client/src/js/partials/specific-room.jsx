import React, { Component } from 'react';
import {connect} from "react-redux"; //read
import {bindActionCreators} from "redux"; //write
import event from "../actions/busy-state";
import cancel from "../actions/cancelBooking";

import $ from "jquery"

import Schedule from "./scheduleModal";
import Book from "./book";

import logo from '../../logo.svg';

class room extends Component {
    constructor(props) {
        super(props)

        this.state = {};

        this.getRoomInfo(this.props.room).then((room) => {
            this.setState(() => {
                this.loaded = true;
                this.componentDidMount();
                return {
                    room: {
                        name: room.name,
                        available: room.available
                    }
                };
            });
        });
        this.loaded = false;
        this.timer = 0;
        this.startTimer = this.startTimer.bind(this);
        this.countDown = this.countDown.bind(this);
    }

    componentDidMount() {
        if(this.loaded === true) {
            $( document ).ready(() => {
                if(this.state.room.available === false) {
                    $("#cancelButton").on("click", async() => {
                        this.onCancelClick();
                    });
                }
                this.startTimer();
            });
        }
    }

    componentWillUnmount() {
        clearInterval(this.timer);
    }

    async getRoomInfo(name) {
        let room = await fetch("http://localhost:2000/" + name);
        room = await room.json();
        return room["room"];
    }

    startTimer() {
        if (this.timer === 0) {
            this.timer = setInterval(this.countDown, 5000);
        }
    }

    async countDown() {
        let name = this.state.room.name;
        let updated = await fetch("/" + name);
        updated = await updated.json();
        console.log(updated);
        updated.bookings = [];
        this.setState(function() {
            return {
                room: updated["room"]
            };
        });
      }

    async onCancelClick() {
        let name = this.state.room.name;
        let data = {};
        data.room = name;
        data.cancel = true;
        fetch(`/${name}`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        console.log("send cancel request for " + name);
        this.props.cancel(name);
        this.setState((prev) => {
            return {room: {
                name: prev.room.name,
                available: true
            }};
        });
    }

    stateHeader() {
        let available = this.state.room.available;
        let toReturn;
        if(available === true) {
            toReturn = (<h1 id="state" className="text-center animated fadeIn" data-toggle="tooltip" data-placement="top" title="This room is currently available!">Available</h1>);
        } else if(available === false) {
            if(this.state.room.ings && this.state.room.ings.length > 0) {
                // Detta ska förmodligen funka om schemat returner våra bokningar?
                toReturn = (
                    <div className="text-center animated fadeIn">
                        <h1 id="state" data-toggle="tooltip" data-placement="top" title="This room is currently unavailable!">Unavailable</h1>
                        <h3>Available: {this.state.room.ings[0].endTime}({this.state.time.h}:{this.state.time.m}:{this.state.time.s})</h3>
                    </div>);
            } else {
                toReturn = (<h1 id="state" className="text-center animated fadeIn" data-toggle="tooltip" data-placement="top" title="This room is currently unavailable!">Unavailable</h1>);
            }
        }
        return toReturn;
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
                        <input type="time" id="currentTime" name="time" hidden/>
                        <div id="schedule" className="col-md-auto">
                            <button className="btn btn-dark" data-toggle="modal" data-target="#test"><i className="fas fa-calendar-alt"></i>Schedule</button>
                            <Schedule schedule={this.state.room.schedule}/>
                        </div>
                        <Book room={name} available={available} />
                    </div>
                </div>);
        } else {
            return (
            <div id="cancel" className="animated fadeInLeft">
                <div className="row justify-content-center pb-0">
                    <div id="schedule" className="col-md-auto">
                        <button className="btn btn-dark" data-toggle="modal" data-target="#test"><i className="fas fa-calendar-alt"></i>Schedule</button>
                        <Schedule schedule={this.state.room.schedule}/>
                    </div>
                    <div className="col-md-auto">
                        <Book room={name} available={available} />
                    </div>
                </div>
            </div>);
        }
    }

    async book() {
        this.state.room.available = false;
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
            if(this.props.submit !== null && this.state.submit !== "") {
                this.book();
            }
            console.log(this.state);
            this.updateBackground();
            return (
                <div>
                    <div className="ml-2 mt-5 pt-5 text-center">
                        <i className="fas fa-users fa-3x" title="Capacity"></i><span className="h3">5</span>
                        <i className="fas fa-laptop fa-3x mr-2" title="Computer equipment"></i>
                        <i className="fab fa-product-hunt fa-3x mr-2" title="Projector"></i>
                    </div>
                    {this.stateHeader()}
                    {this.booking()}
                    {this.clock()}
                </div>
                );
        }     
    }
}

function read(db) {
    return{
        submit: db.submit
    };
}
  
function write(dispatch) {
    return bindActionCreators({
        busy: event,
        cancel: cancel
    }, dispatch);
}
  
export default connect(read, write)(room);
  
