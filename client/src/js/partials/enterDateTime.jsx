import React, { Component } from 'react';
import Duration from "./durationSelector";
class enterDateTime extends Component {
  render() {
    return (
        <div className="modal fade" id="bookAt" tabIndex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div className="modal-dialog" role="document">
            <div className="modal-content text-center">
                <div className="modal-header">
                    <h5 className="modal-title">Select Time</h5>
                    <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div className="modal-body">
                    <label><i className="fas fa-calendar"></i>Date: </label>
                    <input id="date" type="date" name="bookDate" className="form-control"/>
                    <label><i className="fas fa-clock"></i>Time: </label>
                    <input id="time"type="time" name="bookTime" className="form-control"/>
                    <div className="btn-group btn-group-toggle mt-3" data-toggle="buttons">
                        <Duration duration="1"/>
                        <Duration duration="2"/>
                        <Duration duration="3"/>
                    </div>
                </div>
                <div className="modal-footer">
                    <button id="confirmTime" type="button" className="btn btn-dark" data-dismiss="modal">Done</button>
                </div>
            </div>
        </div>
    </div>
    
    );
  }
}

export default enterDateTime;

