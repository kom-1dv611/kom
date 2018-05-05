import React, { Component } from 'react';
import Duration from "./durationSelector";
import $ from "jquery";

class enterDateTime extends Component {
    constructor(props) {
        super(props);
        this.state = {};
        let name = this.props.room;
        $( document ).ready(function() {
            $("#bookLater").submit((e) => {
                console.log("HELLO!!!")
                e.preventDefault()

                let data = {};
                let buttons = $(".btn-group").children();
                let active
                $.each(buttons, function(key, value) {
                    if($(value).hasClass("active") === true) {
                        active = value;
                    }
                });

                console.log(name);

                //username, time, duration
                data.username = $("#username").val();
                data.time = $("#currentTime").val();
                data.duration = $($(active).children()[0]).val();
                data.bookDate = $("#time").val();
                data.bookTime = $("#date").val();
                data.room = name;

                console.log(data);

                fetch($(e.target).attr("action"), {
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

    dateAndTime() {
        if(this.props.bookLater == true) {
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
                        <input id="username" type="text" name="user" className="form-control mt-3" placeholder="Username"/>
                    </div>
                    <div className="modal-footer">
                        <button id="bookLater" type="button" className="btn btn-dark" data-dismiss="modal">Done</button>
                    </div>
                </div>
            </div>
        </div>

        );
    }
}

export default enterDateTime;

