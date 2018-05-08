import React, { Component } from 'react';
import {connect} from "react-redux"; //read
import {bindActionCreators} from "redux"; //write

import event from "../actions/submit";

import Duration from "./durationSelector";
import $ from "jquery";

class enterDateTime extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }
                
    bookNow(name, props) {
        let data = {};
        let buttons = $(".btn-group").children();
        let active
        $.each(buttons, function(key, value) {
            if($(value).hasClass("active") === true) {
                active = value;
            }
        });
        data.username = $("#nowUsername").val();
        data.duration = $($(active).children()[0]).val();
        data.time = $("#currentTime").val();
        data.room = name;
        console.log(data);

        fetch("/" + name, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        props.submit(name);
        this.forceUpdate();
    }

    bookLater(name) {
        let data = {};
        let buttons = $(".btn-group").children();
        let active
        $.each(buttons, function(key, value) {
            if($(value).hasClass("active") === true) {
                active = value;
            }
        });
        data.username = $("#laterUsername").val();
        data.duration = $($(active).children()[0]).val();
        data.bookDate = $("#date").val();
        data.bookTime = $("#time").val();
        data.room = name;
        console.log(data);

        fetch("/" + name, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
    }

    dateAndTime() {
        if(this.props.bookLater === true) {
            return(
                <div>
                    <label><i className="fas fa-calendar"></i>Date: </label>
                    <input id="date" type="date" name="bookDate" className="form-control"/>
                    <label><i className="fas fa-clock"></i>Time: </label>
                    <input id="time"type="time" name="bookTime" className="form-control"/>
                </div>
            );
        } else {
            return "";
        }
    }

    render() {
        let name = this.props.room;
        $( document ).ready(() => {
            $(".confirm").off();
            $(".confirm").click((e) => {
                switch($(e.target).text()) {
                    case "Book Now":
                        this.bookNow(name,this.props);
                        break;
                    case "Book Later":
                        this.bookLater(name);
                        break;
                    default:
                        break;
                }
            });
        });
        return (
            <div className="modal fade" id={this.props.toggler} tabIndex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
            <div className="modal-dialog" role="document">
                <div className="modal-content text-center">
                    <div className="modal-header">
                        <h5 className="modal-title">Select Time</h5>
                        <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                        <div className="modal-body">
                            {this.dateAndTime()}
                            <div className="btn-group btn-group-toggle mt-3" data-toggle="buttons">
                                <Duration duration="1"/>
                                <Duration duration="2"/>
                                <Duration duration="3"/>
                            </div>
                            <input id={this.props.bookLater === true ? "laterUsername" : "nowUsername"} type="text" name="user" className="form-control mt-3" placeholder="Username"/>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-dark confirm" data-dismiss="modal">{this.props.bookLater === true ? "Book Later" : "Book Now"}</button>
                        </div>
                </div>
            </div>
        </div>

        );
    }
}

function read(db) {
    return{};
}

function write(dispatch) {
    return bindActionCreators({
        submit: event
    }, dispatch);
}
  
export default connect(read, write)(enterDateTime);
  

