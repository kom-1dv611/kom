import React, { Component } from 'react';
import Modal from "./bookModal";

class book extends Component {
  bookLater() {
    return(
    <div className="col-md-auto">
      <button title="Book this room at a later date" id="bookLaterButton" className="btn btn-dark" type="button" data-toggle="modal" data-target="#bookLater">Book Later</button>
      <Modal room={this.props.room} bookLater={true} toggler="bookLater"/>
    </div>);
  }

  bookNow() {
    return(
      <div className="col-md-auto">
        <button title="Book this room now" id="bookNowButton" className="btn btn-dark" type="button" data-toggle="modal" data-target="#bookNow">Book Now</button>
        <Modal room={this.props.room} bookLater={false} toggler="bookNow"/>
      </div>);
  }

  cancel() {
    return (
    <div className="col-md">
      <button id="cancelButton" title="Cancel current booking" type="button" className="btn btn-dark">Cancel Booking</button>
    </div>);
  }

  render() {
    if(this.props.available === true) {
      return(
      <div className="row">
        <input id="currentTime" type="text" hidden/>
        {this.bookLater()}
        {this.bookNow()}
      </div>);
    } else {
      return(
      <div className="row">
      <input id="currentTime" type="text" hidden/>
      {this.bookLater()}
      {this.cancel()}
      </div>);
    }
  }
}

export default book;

