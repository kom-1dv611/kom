import React, { Component } from 'react';
import {connect} from "react-redux"; //read
import {bindActionCreators} from "redux"; //write
import event from "../actions/busy-state";
import schedule from "../actions/loadSchedule";
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
            //this.props.busy(room.available);
            this.setState(() => {
                $( document ).ready(() => {
                    $("#schedule").on("click", async() => {
                        this.onScheduleClick(); 
                    });
                    if(this.state.room.available === false) {
                        $("#cancelButton").on("click", async() => {
                            this.onCancelClick();
                        });
                        //this.setupTimer();
                    }
                });
                return {
                    room: {
                        name: room.name,
                        available: room.available
                    },
                    time: {},
                    seconds: 0,
                };
            });
        });

        this.cancel = false;
        
        this.timer = 0;
        this.startTimer = this.startTimer.bind(this);
        this.countDown = this.countDown.bind(this);
        this.ticks = 0;
    }

    async getRoomInfo(name) {
        let room = await fetch("http://localhost:2000/" + name);
        room = await room.json();
        return room["room"];
    }

    getDuration(localing) {
        let ing, hours, minutes, active, buttons;
        if(localing === false) {
            ing = this.state.room.ings[0];
            hours = parseInt(ing.endTime.substring(0, ing.endTime.indexOf(":"))) * 3600;
            minutes = parseInt(ing.endTime.substring(ing.endTime.indexOf(":") + 1, ing.endTime.length)) * 60;
            return hours + minutes;
        } else {
            buttons = $(".btn-group").children();
            $.each(buttons, function(key, value) {
                buttons = $(".btn-group").children();
                if($(value).hasClass("active") === true) {
                    active = value;
                }
            });
            let duration = $(active).children().val()
            return duration * 3600;
        }
    }

    setupTimer(localing = false, update = true) {
        if(this.timer === 0) {
                let duration = this.getDuration(localing);
                if(duration > 0) {
                    let now = new Date();
                    let currentMinutes = now.getMinutes() * 60;
                    let currentHours = now.getHours() * 3600;
                    let currentSeconds = now.getSeconds();
        
                    this.startTimer();
                    let timeLeftVar = this.secondsToTime(this.state.seconds);
                    if(update === true) {
                        this.setState({ time: timeLeftVar, seconds: duration - (currentHours + currentMinutes + currentSeconds)});
                    } else {
                        this.state.time = timeLeftVar;
                        this.state.seconds =  duration - (currentHours + currentMinutes + currentSeconds) >= 0 ? duration - (currentHours + currentMinutes + currentSeconds) : (currentHours + currentMinutes + currentSeconds) - duration;
                    }
                } else {
                    console.log("Timer could not be started");
                }
        }
        return true;
    }

    startTimer() {
        if (this.timer === 0) {
            this.timer = setInterval(this.countDown, 1000);
        }
    }

    async countDown() {
        let seconds = this.state.seconds - 1;
        this.ticks++;
    
        if (seconds === 0) { 
            clearInterval(this.timer);
        }

        if(this.ticks >= 5) {
            let name = this.state.room.room.name;
            this.ticks = 0;
            let updated = await fetch("/" + name);
            updated = await updated.json();
            console.log(updated);
            updated.ings = [];
            this.setState(function() {
                return {
                    room: updated,
                    time: this.secondsToTime(seconds),
                    seconds: seconds
                };
            });
        } else {
            this.setState({
                time: this.secondsToTime(seconds),
                seconds: seconds
            });
        }
      }

    secondsToTime(secs){
        let hours = Math.floor(secs / (60 * 60));
    
        let divisor_for_minutes = secs % (60 * 60);
        let minutes = Math.floor(divisor_for_minutes / 60);
    
        let divisor_for_seconds = divisor_for_minutes % 60;
        let seconds = Math.ceil(divisor_for_seconds);
    
        let obj = {
            "h": hours,
            "m": minutes,
            "s": seconds
        };
        return obj;
      };

    async onScheduleClick() {
        let name = this.state.room.name;
        let rows = await fetch(`/${name}/schedule/today`);
        rows = await rows.json();
        if(rows === null) {
            rows = [];
        }
        this.props.schedule(rows);
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
        this.cancel = true;
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
                            <Schedule/>
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
                        <Schedule/>
                    </div>
                    <div className="col-md-auto">
                        <Book room={name} available={available} />
                    </div>
                </div>
            </div>);
        }
    }

    async book() {
        //this.setupTimer(true, false);
        this.state.room.available = false;
        $( document ).ready(() => {
            $("#schedule").off();
            $("#cancelButton").off();
            $("#schedule").on("click", async() => {
                this.onScheduleClick();
            });
            $("#cancelButton").on("click", async() => {
                this.onCancelClick();
            });
        });
        return true;
    }

    async canceling() {
        //try
        console.log("cancel!!!")
        $( document ).ready(() => {
            $("#schedule").off("click");
            $("#schedule").on("click", async() => {
                this.onScheduleClick();
            });
        });
        //clearInterval(this.timer);
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
        }else {
            if(this.cancel === true) {
                this.cancel = false;
                this.canceling();
            } else if(this.props.submit !== null && this.state.submit !== "") {
                this.book();
            }
            console.log(this.state);
            this.updateBackground();
            return (
                <div>
                    <div className="ml-2 mt-5 pt-5">
                        <i className="fas fa-users fa-2x" title="Capacity"></i><span className="h3">5</span>
                        <i className="fas fa-laptop fa-2x mr-2" title="Computer equipment"></i>
                        <i className="fab fa-product-hunt fa-2x mr-2" title="Projector"></i>
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
        cancel: cancel,
        schedule: schedule
    }, dispatch);
}
  
export default connect(read, write)(room);
  
