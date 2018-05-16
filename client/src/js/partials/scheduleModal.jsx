import React, { Component } from 'react';
import {connect} from "react-redux"; //read
import logo from '../../logo.svg';
class Schedule extends Component {
    row() {

    }

    content() {
        if(this.props.onLoadSchedule !== null) {
            let schedule = this.props.onLoadSchedule;
            console.log(schedule)
            let rows = [];
            if(schedule.length > 0) {
                schedule.forEach(function(booking) {
                    console.log(booking);
                    rows.push((
                    <tr>
                        <th scope="row">{booking.username}</th>
                        <td>{booking.startTime}</td>
                        <td>{booking.endTime}</td>
                    </tr>
                ));
                });
                return(
                    <table className="table">
                        <thead>
                            <tr>
                                <th scope="col">Booker</th>
                                <th scope="col">Start</th>
                                <th scope="col">End</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows}
                        </tbody>
                    </table>
                );
            } else {
                return <p>No bookings today</p>;
            }
        
        } else {
            return(
                <div className="text-center text-dark">
                    <img src={logo} alt="loading icon" className="App-logo"/>
                    <h1>Loading..</h1>
                </div>
            );
        }
    }

    render() {
        return (
            <div className="modal fade" id="test" tabIndex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div className="modal-dialog" role="document">
                    <div className="modal-content text-center">
                        <div className="modal-header">
                            <h5 className="modal-title">Today's Schedule</h5>
                            <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div className="modal-body">
                        {this.content()}
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-dark" data-dismiss="modal">Done</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

function read(db) {
    return{
        onLoadSchedule: db.loadedSchedule
    };
}
  
export default connect(read)(Schedule);
