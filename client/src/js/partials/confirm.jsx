import React, { Component } from 'react';
import EnterName from "./enterName"

class confirm extends Component {
  render() {
    return (
      <div className="col-md-auto">
        <button id="modalToggleUsername" title="Upon confirmation you will be asked to enter your username" className="btn btn-dark" data-toggle="modal" data-target="#exampleModal" type="button">Confirm</button>
        <EnterName/>
      </div>
    );
  }
}

export default confirm;

