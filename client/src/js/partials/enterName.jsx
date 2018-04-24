import React, { Component } from 'react';

class enterName extends Component {
  render() {
    return (
      <div className="modal fade" id="usernameModal" tabIndex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div className="modal-dialog" role="document">
            <div className="modal-content text-center">
                <div className="modal-header">
                    <h5 className="modal-title" id="exampleModalLabel">Book as:</h5>
                    <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div className="modal-body">
                    <label><i className="fa fa-user"></i>Username: </label>
                    <input type="text" name="username" id="username"/>
                </div>
                <div className="modal-footer">
                    <button type="button" className="btn btn-dark" data-dismiss="modal">Close</button>
                    <button id="confirmBooking" type="button" className="btn btn-dark submit">Book room!</button>
                </div>
            </div>
        </div>
    </div>
    );
  }
}

export default enterName;

