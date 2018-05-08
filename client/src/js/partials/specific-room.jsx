import React, { Component } from 'react';
import {connect} from "react-redux"; //read
import {bindActionCreators} from "redux"; //write
import event from "../actions/busy-state";
import schedule from "../actions/loadSchedule";

import $ from "jquery"

import Schedule from "./scheduleModal";
import Book from "./book";

class room extends Component {
    constructor(props) {
        super(props)
        this.state = {updated: false}
        this.props.busy(this.props.room.available);
        let name = this.props.room.room.name;
        $( document ).ready(() => {
            $("#schedule").on("click", async() => {
                let rows = await fetch(`/${name}/schedule/today`);
                rows = await rows.json();
                console.log(rows);
                this.props.schedule(rows);
            });
            $("#cancelButton").on("click", async() => {
                let data = {};
                data.room = name;
                fetch(`/${name}`, {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });
            });
        });
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
                    <div className="row justify-content-center pb-0">
                        <input type="time" id="currentTime" name="time" hidden/>
                        <div id="schedule" className="col-md-auto">
                            <button className="btn btn-dark" data-toggle="modal" data-target="#test"><i className="fas fa-calendar-alt"></i>Schedule</button>
                            <Schedule/>
                        </div>
                        <Book room={this.props.room.room.name} available={this.props.room.available} />
                    </div>
                </div>);
        } else {
            return (
            <div id="cancel" className="animated fadeIn">
                <div className="row justify-content-center pb-0">
                    <div id="schedule" className="col-md-auto">
                        <i type="button"className="fas fa-calendar-alt fa-2x"></i>
                        <Schedule/>
                    </div>
                    <div class="col-md-auto">
                        <Book room={this.props.room.room.name} available={this.props.room.available} />
                    </div>
                </div>
            </div>);
        }
    }

    async getUpdatedInfo() {
        if(this.state.updated === false) {
            this.props.room.available = false;
            $("body").addClass("unavailable");
        }
        return true;
    }

    render() {
        if(this.props.submit !== null && this.props.submit !== "" ) {
            console.log("plz mr plz")
            this.getUpdatedInfo();
        }
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

function read(db) {
    return{
        submit: db.submit
    };
}
  
function write(dispatch) {
    return bindActionCreators({
        busy: event,
        schedule: schedule
    }, dispatch);
}
  
export default connect(read, write)(room);
  
